/**
 * Auditoria de sensibilidade (PRD, seção 10): registra quando trocar UMA resposta
 * muda o Top 3. Rode com `pnpm fit:sensibilidade`.
 */
import { gerarResultado, type Respostas } from './motor.ts'
import { PERGUNTAS } from './perguntas.ts'

const top3 = (respostas: Respostas) =>
  gerarResultado(respostas, { id: 'sensibilidade', agora: '2026-01-01T00:00:00.000Z' }).areas.slice(0, 3).map(a => a.areaId)

export type Mudanca = { perguntaId: string; de: string; para: string; top3Antes: string[]; top3Depois: string[]; mudouConjunto: boolean; mudouOrdem: boolean; mudouPrimeira: boolean }

/** Para cada pergunta e cada resposta alternativa, compara o Top 3 antes e depois. */
export function analisarSensibilidade(base: Respostas): Mudanca[] {
  const antes = top3(base)
  const mudancas: Mudanca[] = []
  for (const pergunta of PERGUNTAS) {
    for (const para of ['A', 'B', 'C'] as const) {
      if (para === base[pergunta.id]) continue
      const depois = top3({ ...base, [pergunta.id]: para })
      mudancas.push({
        perguntaId: pergunta.id,
        de: base[pergunta.id],
        para,
        top3Antes: antes,
        top3Depois: depois,
        mudouConjunto: [...antes].sort().join() !== [...depois].sort().join(),
        mudouOrdem: antes.join() !== depois.join(),
        mudouPrimeira: antes[0] !== depois[0],
      })
    }
  }
  return mudancas
}

/** Gerador pseudoaleatório com semente fixa, para a auditoria ser reproduzível. */
export function respostasAleatorias(quantidade: number, semente = 42): Respostas[] {
  let estado = semente
  const proximo = () => (estado = (estado * 1664525 + 1013904223) >>> 0) / 2 ** 32
  return Array.from({ length: quantidade }, () =>
    Object.fromEntries(PERGUNTAS.map(p => [p.id, (['A', 'B', 'C'] as const)[Math.floor(proximo() * 3)]])),
  )
}

if (process.argv[1]?.endsWith('sensibilidade.ts')) {
  const bases = respostasAleatorias(2000)
  let total = 0, conjunto = 0, ordem = 0, primeira = 0
  for (const base of bases) for (const m of analisarSensibilidade(base)) { total++; conjunto += +m.mudouConjunto; ordem += +m.mudouOrdem; primeira += +m.mudouPrimeira }
  const pct = (n: number) => `${((100 * n) / total).toFixed(1)}%`
  console.log(`Trocar uma resposta (${total} comparações, ${bases.length} conjuntos de respostas, semente 42):`)
  console.log(`  muda quais áreas estão no Top 3: ${pct(conjunto)}`)
  console.log(`  muda o Top 3 (conjunto ou ordem): ${pct(ordem)}`)
  console.log(`  muda a 1ª área:                  ${pct(primeira)}`)
}
