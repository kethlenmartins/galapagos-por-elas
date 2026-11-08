/**
 * Correção de uma entrega: a parte numérica é conferida por código; a parte
 * qualitativa é "interpretada pela IA". Aqui a IA é simulada por uma heurística
 * simples (tamanho e preenchimento do texto), só para a demonstração.
 * A equipe sempre revisa antes de a participante ver.
 */
import type {
  CaseAdmin,
  ItemCorrecao,
  RespostasDaTarefa,
  SugestaoCorrecao,
  TarefaAdmin,
} from '../contratos.ts'
import { CONFIG } from './dados/config.ts'
import { interpretarNumero } from './gabarito.ts'

const arredondar = (n: number) => Math.round(n * 10) / 10

function corrigirNumericos(caso: CaseAdmin, respostas: Record<string, RespostasDaTarefa>): ItemCorrecao[] {
  return caso.gabarito.map(item => {
    const campo = caso.tarefas.find(t => t.id === item.tarefaId)?.campos.find(c => c.id === item.campoId)
    const bruto = respostas[item.tarefaId]?.[item.campoId] ?? null
    const { valor, foraDoPadrao } = interpretarNumero(bruto)
    const diferenca = valor === null ? Infinity : Math.abs(valor - item.valorEsperado)
    const resultado = diferenca <= item.tolerancia ? 'correta' : diferenca <= item.tolerancia * 3 ? 'parcial' : 'incorreta'
    return {
      tarefaId: item.tarefaId,
      campoId: item.campoId,
      rotulo: campo?.rotulo ?? item.descricao,
      resposta: bruto === null ? '' : String(bruto),
      valorInterpretado: valor,
      valorEsperado: item.valorEsperado,
      tolerancia: item.tolerancia,
      unidade: item.unidade,
      resultado,
      pontos: resultado === 'correta' ? item.pontos : resultado === 'parcial' ? arredondar(item.pontos / 2) : 0,
      maxPontos: item.pontos,
      formatoForaDoPadrao: foraDoPadrao,
    }
  })
}

/** MOCK: simula a leitura da IA. Quanto mais completo o texto, maior o aproveitamento. */
function notaQualitativaSimulada(tarefa: TarefaAdmin, respostas: RespostasDaTarefa | undefined): number {
  const textos = tarefa.campos.filter(c => c.tipo === 'texto').map(c => String(respostas?.[c.id] ?? ''))
  const palavras = textos.join(' ').split(/\s+/).filter(Boolean).length
  const opcaoEscolhida = tarefa.campos.some(c => c.tipo === 'opcao' && respostas?.[c.id])
  const aproveitamento = 0.3 + 0.55 * Math.min(palavras, 120) / 120 + (opcaoEscolhida ? 0.1 : 0)
  return arredondar(Math.min(1, aproveitamento) * tarefa.notaMaxima)
}

export function corrigirEntrega(
  caso: CaseAdmin,
  respostas: Record<string, RespostasDaTarefa>,
  iaDisponivel: boolean,
): SugestaoCorrecao {
  const itens = corrigirNumericos(caso, respostas)
  const maxCodigo = arredondar(itens.reduce((s, i) => s + i.maxPontos, 0))
  const notaCodigo = arredondar(itens.reduce((s, i) => s + i.pontos, 0))
  const qualitativas = caso.tarefas.filter(t => t.correcao === 'qualitativa')
  const maxIA = arredondar(qualitativas.reduce((s, t) => s + t.notaMaxima, 0))

  const base = { itens, notaCodigo, maxCodigo, maxIA, versaoPrompt: CONFIG.versaoPromptCorrecao }

  // Fallback: a IA falhou. A entrega vai para a fila como correção manual.
  if (!iaDisponivel) {
    return { ...base, notaIA: null, notaSugerida: null, origem: 'manual', feedbackGeral: '', feedbackPorTarefa: [], pontosFortes: [], pontosAMelhorar: [] }
  }

  const notasQualitativas = new Map(qualitativas.map(t => [t.id, notaQualitativaSimulada(t, respostas[t.id])]))
  const notaIA = arredondar([...notasQualitativas.values()].reduce((s, n) => s + n, 0))

  const feedbackPorTarefa = caso.tarefas.map(t => {
    if (t.correcao === 'numerica') {
      const doItem = itens.filter(i => i.tarefaId === t.id)
      const todosCertos = doItem.every(i => i.resultado === 'correta')
      const algumParcial = doItem.some(i => i.resultado === 'parcial')
      return {
        tarefaId: t.id,
        feedback: todosCertos
          ? 'Você chegou ao valor esperado. Bom trabalho com os números.'
          : algumParcial
            ? 'Você chegou perto do valor esperado. Reveja o arredondamento e a conta.'
            : 'O valor ficou longe do esperado. Refaça a conta com os dados da tabela.',
      }
    }
    const razao = t.notaMaxima > 0 ? (notasQualitativas.get(t.id) ?? 0) / t.notaMaxima : 0
    return {
      tarefaId: t.id,
      feedback:
        razao >= 0.8
          ? 'Boa análise: você conectou os números à decisão. Para evoluir, detalhe os riscos que poderiam mudar sua recomendação.'
          : 'Sua recomendação ficou resumida. Explique melhor os motivos e use os indicadores da tabela.',
    }
  })

  const acertos = itens.filter(i => i.resultado === 'correta').length
  return {
    ...base,
    notaIA,
    notaSugerida: arredondar(notaCodigo + notaIA),
    origem: 'ia',
    feedbackGeral: `Você acertou ${acertos} de ${itens.length} cálculos e apresentou uma recomendação para o case.`,
    feedbackPorTarefa,
    pontosFortes: acertos === itens.length ? ['Cálculos corretos', 'Uso dos dados da tabela'] : ['Uso dos dados da tabela'],
    pontosAMelhorar: acertos === itens.length ? ['Detalhar os riscos da recomendação'] : ['Conferir as contas', 'Detalhar os riscos da recomendação'],
  }
}
