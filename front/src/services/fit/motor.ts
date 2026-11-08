/**
 * Motor de fit do diagnóstico (PRD v1.1). Funções puras e determinísticas:
 * as mesmas respostas e as mesmas versões dão sempre o mesmo resultado.
 * Não usa IA, aleatoriedade nem relógio (a data entra como argumento).
 *
 * Seções do PRD: agregação (5), matriz (6), algoritmo (7).
 */
import type {
  AfinidadeArea,
  CaracteristicaArea,
  ConfigDiagnostico,
  DataISO,
  DiferencaArea,
  PontuacaoDimensao,
  RespostaOpcao,
  ResultadoDiagnostico,
} from '../contratos.ts'
import { DIMENSOES, type DefinicaoDimensao } from './dimensoes.ts'
import { AREAS_FIT, MATRIZ } from './matriz.ts'
import { PERGUNTAS } from './perguntas.ts'
import { FRASES, capitalizar, listar } from './textos.ts'
import type { DimensaoId } from './tipos.ts'
import { VERSOES } from './versoes.ts'

/** Afinidade só entra nas listas com similaridade a partir daqui. */
export const LIMIAR_AFINIDADE = 70
/** Diferença só entra nas listas com distância acima disto (assim nunca coincide com afinidade). */
export const LIMIAR_DIFERENCA = 30
/** Peso a partir do qual uma dimensão é considerada importante para a área. */
export const PESO_RELEVANTE = 4
const MAXIMO_POR_CAMADA = 3
/** Abaixo/acima destes limites a referência (ou a resposta) tem um lado claro; no meio é equilíbrio. */
const LIMITE_LADO_0 = 35
const LIMITE_LADO_100 = 65

export const TOTAL_PERGUNTAS = PERGUNTAS.length

export type Respostas = Record<string, RespostaOpcao>

export type ProblemasDeRespostas = { faltantes: string[]; invalidas: string[]; desconhecidas: string[] }

/** O envio exige exatamente as 15 respostas válidas. Nunca se imputa 50 em resposta ausente. */
export function validarRespostas(respostas: Record<string, unknown>): ProblemasDeRespostas {
  const ids = new Set(PERGUNTAS.map(p => p.id))
  return {
    faltantes: PERGUNTAS.filter(p => !(p.id in respostas)).map(p => p.id),
    invalidas: PERGUNTAS.filter(p => p.id in respostas && !['A', 'B', 'C'].includes(respostas[p.id] as string)).map(p => p.id),
    desconhecidas: Object.keys(respostas).filter(id => !ids.has(id)),
  }
}

export const respostasCompletas = (p: ProblemasDeRespostas) => p.faltantes.length + p.invalidas.length + p.desconhecidas.length === 0

/** U[d]: média das pontuações orientadas das perguntas de cada dimensão. */
export function pontuarDimensoes(respostas: Respostas): Record<DimensaoId, number> {
  const problemas = validarRespostas(respostas)
  if (!respostasCompletas(problemas)) throw new Error(`Respostas inválidas: ${JSON.stringify(problemas)}`)
  const vetor = {} as Record<DimensaoId, number>
  for (const dimensao of DIMENSOES) {
    const valores = PERGUNTAS.filter(p => p.dimensaoId === dimensao.id).map(p => p.pontuacao[respostas[p.id]])
    vetor[dimensao.id] = valores.reduce((soma, v) => soma + v, 0) / valores.length
  }
  return vetor
}

export type Contribuicao = {
  dimensaoId: DimensaoId
  referencia: number
  peso: number
  /** S[j,d] = 100 − |U − R|. */
  similaridade: number
  /** C[j,d] = W × S. */
  contribuicao: number
}

export type FitDaArea = { areaId: string; nome: string; bruto: number; contribuicoes: Contribuicao[] }

/** F[j] = Σ(W × S) / Σ W nas 12 dimensões. Ordenado do maior para o menor; empate pelo id da área. */
export function calcularFit(u: Record<DimensaoId, number>): FitDaArea[] {
  const fits = AREAS_FIT.map(area => {
    const contribuicoes: Contribuicao[] = DIMENSOES.map(d => {
      const { r, w } = MATRIZ[area.id][d.id]
      const similaridade = 100 - Math.abs(u[d.id] - r)
      return { dimensaoId: d.id, referencia: r, peso: w, similaridade, contribuicao: w * similaridade }
    })
    const soma = contribuicoes.reduce((s, c) => s + c.contribuicao, 0)
    const pesos = contribuicoes.reduce((s, c) => s + c.peso, 0)
    return { areaId: area.id, nome: area.nome, bruto: soma / pesos, contribuicoes }
  })
  return fits.sort((a, b) => b.bruto - a.bruto || (a.areaId < b.areaId ? -1 : a.areaId > b.areaId ? 1 : 0))
}

// ---------------------------------------------------------------------------
// Textos por regras (sem IA)
// ---------------------------------------------------------------------------

const dimensaoPorId = (id: DimensaoId): DefinicaoDimensao => DIMENSOES.find(d => d.id === id)!

/** Descreve um valor de 0 a 100 de uma dimensão: lado do polo 0, lado do polo 100 ou equilíbrio. */
function descreverValor(dimensaoId: DimensaoId, valor: number): string {
  if (valor <= LIMITE_LADO_0) return FRASES[dimensaoId].polo0
  if (valor >= LIMITE_LADO_100) return FRASES[dimensaoId].polo100
  const d = dimensaoPorId(dimensaoId)
  return `equilíbrio entre ${d.polo0.toLowerCase()} e ${d.polo100.toLowerCase()}`
}

/**
 * Como `descreverValor`, mas com o grau (forte ou moderado). Usada nas diferenças, onde dois
 * valores distantes podem cair do mesmo lado do eixo (ex.: 0 e 35 são ambos "análise aprofundada").
 * As faixas têm no máximo 20 pontos de largura, então valores a mais de 30 de distância nunca coincidem.
 */
function descreverComGrau(dimensaoId: DimensaoId, valor: number): string {
  const d = dimensaoPorId(dimensaoId)
  if (valor > 40 && valor < 60) return `equilíbrio entre ${d.polo0.toLowerCase()} e ${d.polo100.toLowerCase()}`
  const polo = valor <= 40 ? FRASES[dimensaoId].polo0 : FRASES[dimensaoId].polo100
  const forte = valor <= 20 || valor >= 80
  return forte ? polo : `${polo}, em grau moderado`
}

const porSimilaridade = (a: Contribuicao, b: Contribuicao) => b.similaridade - a.similaridade || (a.dimensaoId < b.dimensaoId ? -1 : 1)

function afinidadesDaCamada(contribuicoes: Contribuicao[], camada: 'perfil' | 'trabalho'): Contribuicao[] {
  const daCamada = contribuicoes.filter(c => dimensaoPorId(c.dimensaoId).camada === camada && c.similaridade >= LIMIAR_AFINIDADE)
  const importantes = daCamada.filter(c => c.peso >= PESO_RELEVANTE).sort(porSimilaridade)
  const outras = daCamada.filter(c => c.peso < PESO_RELEVANTE).sort(porSimilaridade)
  return [...importantes, ...outras].slice(0, MAXIMO_POR_CAMADA)
}

function diferencasDaCamada(contribuicoes: Contribuicao[], camada: 'perfil' | 'trabalho', u: Record<DimensaoId, number>): DiferencaArea[] {
  return contribuicoes
    .filter(c => dimensaoPorId(c.dimensaoId).camada === camada && c.peso >= PESO_RELEVANTE)
    .map(c => ({ c, distancia: Math.abs(u[c.dimensaoId] - c.referencia) }))
    .filter(x => x.distancia > LIMIAR_DIFERENCA)
    .sort((a, b) => b.distancia - a.distancia || (a.c.dimensaoId < b.c.dimensaoId ? -1 : 1))
    .slice(0, MAXIMO_POR_CAMADA)
    .map(({ c, distancia }) => ({
      dimensaoId: c.dimensaoId,
      naArea: capitalizar(descreverComGrau(c.dimensaoId, c.referencia)),
      paraVoce: capitalizar(descreverComGrau(c.dimensaoId, u[c.dimensaoId])),
      distancia,
    }))
}

const comoCaracteristica = (c: Contribuicao): CaracteristicaArea => ({
  dimensaoId: c.dimensaoId,
  texto: capitalizar(descreverValor(c.dimensaoId, c.referencia)),
  similaridade: c.similaridade,
})

function justificativa(contribuicoes: Contribuicao[]): string {
  const melhores = contribuicoes
    .filter(c => c.similaridade >= LIMIAR_AFINIDADE)
    .sort((a, b) => Number(b.peso >= PESO_RELEVANTE) - Number(a.peso >= PESO_RELEVANTE) || porSimilaridade(a, b))
    .slice(0, 3)
  if (melhores.length === 0) {
    return 'Suas respostas têm pouca coincidência com a tendência desta área. Vale explorar para entender melhor como ela funciona na prática.'
  }
  return `Você e esta área se aproximam em: ${listar(melhores.map(c => descreverValor(c.dimensaoId, c.referencia)))}.`
}

// ---------------------------------------------------------------------------
// Resultado e configuração
// ---------------------------------------------------------------------------

export function gerarResultado(respostas: Respostas, opcoes: { id: string; agora: Date | DataISO }): ResultadoDiagnostico {
  const u = pontuarDimensoes(respostas)
  const dimensoes: PontuacaoDimensao[] = DIMENSOES.map(d => ({
    dimensaoId: d.id,
    camada: d.camada,
    polo0: d.polo0,
    polo100: d.polo100,
    valor: u[d.id],
  }))
  const areas: AfinidadeArea[] = calcularFit(u).map((fit, indice) => ({
    areaId: fit.areaId,
    area: fit.nome,
    posicao: indice + 1,
    pontuacaoBruta: fit.bruto,
    pontuacao: Math.round(fit.bruto),
    afinidades: {
      perfil: afinidadesDaCamada(fit.contribuicoes, 'perfil').map(comoCaracteristica),
      trabalho: afinidadesDaCamada(fit.contribuicoes, 'trabalho').map(comoCaracteristica),
    },
    diferencas: {
      perfil: diferencasDaCamada(fit.contribuicoes, 'perfil', u),
      trabalho: diferencasDaCamada(fit.contribuicoes, 'trabalho', u),
    },
    porQueCombina: justificativa(fit.contribuicoes),
  }))
  return {
    id: opcoes.id,
    versoes: VERSOES,
    geradoEm: typeof opcoes.agora === 'string' ? opcoes.agora : opcoes.agora.toISOString(),
    dimensoes,
    areas,
    respostasC: Object.values(respostas).filter(r => r === 'C').length,
  }
}

/** Perguntas e dimensões para a tela, sem a pontuação de cada resposta. */
export function configuracaoPublica(): ConfigDiagnostico {
  return {
    versoes: VERSOES,
    perguntas: PERGUNTAS.map(p => ({ id: p.id, dimensaoId: p.dimensaoId, texto: p.texto, opcoes: p.opcoes })),
    dimensoes: DIMENSOES.map(d => ({ ...d })),
  }
}
