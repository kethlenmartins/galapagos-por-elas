/** Testes do motor de fit. Cobrem os critérios de aceite do PRD (seção 10). */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { RespostaOpcao } from '../contratos.ts'
import { DIMENSOES } from './dimensoes.ts'
import { AREAS_FIT, MATRIZ } from './matriz.ts'
import {
  LIMIAR_AFINIDADE,
  LIMIAR_DIFERENCA,
  TOTAL_PERGUNTAS,
  calcularFit,
  configuracaoPublica,
  gerarResultado,
  pontuarDimensoes,
  respostasCompletas,
  validarRespostas,
  type Respostas,
} from './motor.ts'
import { PERGUNTAS } from './perguntas.ts'
import { analisarSensibilidade, respostasAleatorias } from './sensibilidade.ts'
import { VERSOES } from './versoes.ts'

const todas = (letra: RespostaOpcao): Respostas => Object.fromEntries(PERGUNTAS.map(p => [p.id, letra]))
const agora = '2026-11-07T12:00:00.000Z'
const resultadoDe = (r: Respostas) => gerarResultado(r, { id: 'teste', agora })
const topIds = (r: Respostas, n = 3) => resultadoDe(r).areas.slice(0, n).map(a => a.areaId)
const um = (n: number) => Math.round(n * 10) / 10

test('estrutura congelada: 15 perguntas, 12 dimensões, 13 áreas, matriz completa', () => {
  assert.equal(PERGUNTAS.length, 15)
  assert.equal(TOTAL_PERGUNTAS, 15)
  assert.equal(DIMENSOES.length, 12)
  assert.equal(AREAS_FIT.length, 13)
  assert.deepEqual(DIMENSOES.filter(d => d.camada === 'perfil').map(d => d.id), ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'])
  assert.deepEqual(DIMENSOES.filter(d => d.camada === 'trabalho').map(d => d.id), ['D7', 'D8', 'D9', 'D10', 'D11', 'D12'])
  for (const area of AREAS_FIT) {
    for (const d of DIMENSOES) {
      const { r, w } = MATRIZ[area.id][d.id]
      assert.ok(r >= 0 && r <= 100, `${area.id}/${d.id}: referência fora de 0–100`)
      assert.ok(Number.isInteger(w) && w >= 1 && w <= 5, `${area.id}/${d.id}: peso fora de 1–5`)
    }
  }
  for (const p of PERGUNTAS) assert.equal(p.opcoes.C, 'As duas me interessam igualmente.')
})

test('cobertura: nenhuma dimensão sem observação; D2, D6 e D8 agregam duas respostas', () => {
  const esperado: Record<string, string[]> = {
    D1: ['Q01'], D2: ['Q03', 'Q05'], D3: ['Q04'], D4: ['Q06'], D5: ['Q07'], D6: ['Q08', 'Q09'],
    D7: ['Q10'], D8: ['Q12', 'Q13'], D9: ['Q14'], D10: ['Q15'], D11: ['Q11'], D12: ['Q02'],
  }
  for (const d of DIMENSOES) assert.deepEqual(d.perguntaIds, esperado[d.id], d.id)
  assert.equal(DIMENSOES.reduce((soma, d) => soma + d.perguntaIds.length, 0), 15)
})

test('validação: exige exatamente as 15 respostas válidas e nunca imputa valores', () => {
  assert.ok(respostasCompletas(validarRespostas(todas('A'))))

  const incompleta = { ...todas('A') }
  delete incompleta.Q07
  assert.deepEqual(validarRespostas(incompleta).faltantes, ['Q07'])
  assert.throws(() => pontuarDimensoes(incompleta), /inválidas/)

  assert.deepEqual(validarRespostas({ ...todas('A'), Q03: 'D' }).invalidas, ['Q03'])
  assert.deepEqual(validarRespostas({ ...todas('A'), Q99: 'A' }).desconhecidas, ['Q99'])
  assert.deepEqual(validarRespostas({}).faltantes.length, 15)
})

test('agregação: C vale 50, a Q04 é invertida e o exemplo do PRD (D8 = 75) confere', () => {
  const c = pontuarDimensoes(todas('C'))
  assert.ok(Object.values(c).every(v => v === 50))

  assert.equal(pontuarDimensoes(todas('A')).D3, 100, 'Q04: A vale 100 (inversão)')
  assert.equal(pontuarDimensoes(todas('B')).D3, 0, 'Q04: B vale 0 (inversão)')
  assert.equal(pontuarDimensoes(todas('A')).D1, 0)
  assert.equal(pontuarDimensoes(todas('B')).D1, 100)

  const exemplo = pontuarDimensoes({ ...todas('C'), Q12: 'B', Q13: 'C' })
  assert.equal(exemplo.D8, 75)
  assert.equal(pontuarDimensoes({ ...todas('C'), Q03: 'A', Q05: 'B' }).D2, 50, 'D2 = média de 0 e 100')
})

test('resultado: 12 números e 13 scores finitos entre 0 e 100, com versões', () => {
  for (const base of [todas('A'), todas('B'), todas('C'), ...respostasAleatorias(100)]) {
    const r = resultadoDe(base)
    assert.equal(r.dimensoes.length, 12)
    assert.ok(r.dimensoes.every(d => Number.isFinite(d.valor) && d.valor >= 0 && d.valor <= 100))
    assert.equal(r.areas.length, 13)
    assert.ok(r.areas.every(a => Number.isFinite(a.pontuacaoBruta) && a.pontuacaoBruta >= 0 && a.pontuacaoBruta <= 100))
    assert.deepEqual(r.versoes, VERSOES)
    assert.equal(new Set(r.areas.map(a => a.areaId)).size, 13)
  }
})

test('algoritmo: confere com uma implementação independente nos casos de borda', () => {
  // Valores calculados à parte, direto da matriz do PRD.
  const casos: [string, Respostas, [string, number][]][] = [
    ['todas A', todas('A'), [['quant', 65.8], ['equity-research', 60.3], ['credito-risco', 57.7]]],
    ['todas B', todas('B'), [['venture-capital', 82.3], ['fintechs', 78.0], ['wealth-management', 75.9]]],
    ['todas C', todas('C'), [['credito-risco', 83.4], ['asset-management', 82.1], ['equity-research', 79.3]]],
    ['todas A, Q04 = B', { ...todas('A'), Q04: 'B' }, [['equity-research', 57.0], ['credito-risco', 56.8], ['quant', 55.6]]],
  ]
  for (const [nome, respostas, esperado] of casos) {
    const areas = resultadoDe(respostas).areas.slice(0, 3)
    assert.deepEqual(areas.map(a => [a.areaId, um(a.pontuacaoBruta)]), esperado, nome)
  }
})

test('ranking: pelo score bruto sem arredondar, com desempate estável pelo id', () => {
  for (const base of respostasAleatorias(500)) {
    const areas = resultadoDe(base).areas
    areas.forEach((a, i) => {
      assert.equal(a.posicao, i + 1)
      assert.equal(a.pontuacao, Math.round(a.pontuacaoBruta), 'arredonda só para exibição')
      assert.ok(Number.isInteger(a.pontuacao))
      if (i > 0) {
        const anterior = areas[i - 1]
        assert.ok(
          anterior.pontuacaoBruta > a.pontuacaoBruta || (anterior.pontuacaoBruta === a.pontuacaoBruta && anterior.areaId < a.areaId),
          'ordem decrescente do bruto; empate pelo id da área',
        )
      }
    })
  }
  // O arredondado pode empatar sem mudar a ordem: o ranking vem do bruto.
  const fits = calcularFit(pontuarDimensoes(todas('C')))
  assert.deepEqual(fits.map(f => f.areaId), resultadoDe(todas('C')).areas.map(a => a.areaId))
})

test('determinismo: mesmas respostas e versões dão o mesmo resultado', () => {
  for (const base of respostasAleatorias(50)) {
    assert.deepEqual(resultadoDe(base), resultadoDe({ ...base }))
  }
  const embaralhada = Object.fromEntries(Object.entries(todas('B')).reverse())
  assert.deepEqual(resultadoDe(embaralhada).areas, resultadoDe(todas('B')).areas, 'a ordem das chaves não importa')
})

test('explicações: até 3 por camada, sem sobreposição e sem afirmar capacidade ou contratação', () => {
  const proibidas = /\b(capaz|incapaz|apta|inapta|aptid[aã]o|sucesso|contrat|probabilidade|deve seguir|melhor carreira)/i
  for (const base of respostasAleatorias(200)) {
    for (const area of resultadoDe(base).areas) {
      for (const camada of ['perfil', 'trabalho'] as const) {
        const ids = DIMENSOES.filter(d => d.camada === camada).map(d => d.id)
        assert.ok(area.afinidades[camada].length <= 3)
        assert.ok(area.diferencas[camada].length <= 3)
        assert.ok(area.afinidades[camada].every(c => ids.includes(c.dimensaoId) && c.similaridade >= LIMIAR_AFINIDADE))
        assert.ok(area.diferencas[camada].every(d => ids.includes(d.dimensaoId) && d.distancia > LIMIAR_DIFERENCA))
        assert.ok(area.diferencas[camada].every(d => d.naArea !== d.paraVoce), 'uma diferença nunca descreve os dois lados com o mesmo texto')
        const doisLados = new Set([...area.afinidades[camada].map(c => c.dimensaoId), ...area.diferencas[camada].map(d => d.dimensaoId)])
        assert.equal(doisLados.size, area.afinidades[camada].length + area.diferencas[camada].length, 'uma dimensão não é afinidade e diferença ao mesmo tempo')
      }
      const textos = [area.porQueCombina, ...[...area.afinidades.perfil, ...area.afinidades.trabalho].map(c => c.texto), ...[...area.diferencas.perfil, ...area.diferencas.trabalho].flatMap(d => [d.naArea, d.paraVoce])]
      for (const texto of textos) assert.ok(texto.length > 0 && !proibidas.test(texto), `texto inadequado: ${texto}`)
    }
  }
})

test('contagem de "as duas me interessam" e configuração pública sem pontuação', () => {
  assert.equal(resultadoDe(todas('C')).respostasC, 15)
  assert.equal(resultadoDe({ ...todas('A'), Q01: 'C', Q02: 'C' }).respostasC, 2)

  const config = configuracaoPublica()
  assert.equal(config.perguntas.length, 15)
  assert.equal(config.dimensoes.length, 12)
  assert.deepEqual(config.versoes, VERSOES)
  assert.ok(!JSON.stringify(config).includes('pontuacao'), 'a pontuação de cada resposta não vai para a tela')
})

test('sensibilidade: registra o efeito de trocar uma resposta (30 variações por conjunto)', () => {
  const base = todas('A')
  const mudancas = analisarSensibilidade(base)
  assert.equal(mudancas.length, 30)
  assert.deepEqual(analisarSensibilidade(base), mudancas, 'reprodutível')
  assert.ok(mudancas.every(m => m.top3Antes.join() === topIds(base).join()))
  assert.ok(mudancas.every(m => !m.mudouConjunto || m.mudouOrdem), 'mudar o conjunto implica mudar o Top 3')
})
