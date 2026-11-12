/**
 * Regras da trilha de cases (PRD_Cases_Trilha.md), como funções puras sobre o estado do mock.
 * Os cases são ilhas em ordem: uma só abre quando as anteriores têm certificado. Quem desbloqueia o quê e em que estado cada case está para uma usuária.
 */
import type { CaseAdmin, EstadoCaseTrilha, ResultadoDiagnostico } from '../contratos.ts'
import { CONFIG } from './dados/config.ts'
import { chaveDaSemana } from './datas.ts'
import type { EntregaRegistro, EstadoMock, ProgressoRegistro } from './tipos.ts'

export const casesPublicados = (estado: EstadoMock): CaseAdmin[] => estado.cases.filter(c => c.status === 'publicado')

/** Os cases publicados mais os arquivados que ela já começou: quem começou mantém o progresso. */
export const casesVisiveisPara = (estado: EstadoMock, usuarioId: string): CaseAdmin[] =>
  estado.cases.filter(c => c.status === 'publicado' || (c.status === 'arquivado' && !!progressoDe(estado, usuarioId, c.id)))

export const progressoDe = (estado: EstadoMock, usuarioId: string, caseId: string): ProgressoRegistro | undefined =>
  estado.progressos.find(p => p.usuarioId === usuarioId && p.caseId === caseId)

/** Entregas da usuária neste case, da primeira à última tentativa. */
export const entregasDe = (estado: EstadoMock, usuarioId: string, caseId: string): EntregaRegistro[] =>
  estado.entregas.filter(e => e.usuarioId === usuarioId && e.caseId === caseId).sort((a, b) => a.tentativa - b.tentativa)

export const ultimaEntrega = (estado: EstadoMock, usuarioId: string, caseId: string): EntregaRegistro | undefined => {
  const todas = entregasDe(estado, usuarioId, caseId)
  return todas[todas.length - 1]
}

/** Aprovada: a nota publicada atingiu o mínimo. É o que gera o certificado. */
export const aprovada = (entrega: EntregaRegistro | undefined): boolean =>
  !!entrega && entrega.status === 'publicada' && (entrega.notaFinal ?? 0) >= CONFIG.certificado.notaMinima

export const temCertificado = (estado: EstadoMock, usuarioId: string, caseId: string): boolean =>
  estado.certificados.some(c => c.usuarioId === usuarioId && c.caseId === caseId)

export const concluiuAlgumCase = (estado: EstadoMock, usuarioId: string): boolean =>
  estado.certificados.some(c => c.usuarioId === usuarioId)

export function resultadoDoDiagnostico(estado: EstadoMock, usuarioId: string): ResultadoDiagnostico | null {
  const resultados = estado.diagnosticos[usuarioId]?.resultados ?? []
  return resultados[resultados.length - 1] ?? null
}

export const posicaoNoFit = (resultado: ResultadoDiagnostico | null, areaId: string): number | null =>
  resultado?.areas.find(a => a.areaId === areaId)?.posicao ?? null

/** As ilhas (cases publicados) na ordem em que são feitas. */
export const ilhasEmOrdem = (estado: EstadoMock): CaseAdmin[] => [...casesPublicados(estado)].sort((a, b) => a.ordem - b.ordem)

/** A primeira ilha anterior a este case que ela ainda não concluiu (sem certificado), se houver. */
export const ilhaAnteriorPendente = (estado: EstadoMock, usuarioId: string, caso: CaseAdmin): CaseAdmin | undefined =>
  ilhasEmOrdem(estado).find(c => c.ordem < caso.ordem && !temCertificado(estado, usuarioId, c.id))

/** A próxima ilha a fazer: a primeira não concluída. `null` quando todas estão concluídas. */
export const proximaIlha = (estado: EstadoMock, usuarioId: string): CaseAdmin | null =>
  ilhasEmOrdem(estado).find(c => !temCertificado(estado, usuarioId, c.id)) ?? null

export type SituacaoDoCase = {
  estado: EstadoCaseTrilha
  motivoBloqueio: string | null
  /** A última tentativa foi avaliada e não passou: ela pode refazer. */
  refazer: boolean
  /** A tentativa em que ela está (ou estará, se escolher agora). */
  tentativa: number
  /** Progresso da tentativa atual, se ela já escolheu o case. */
  progresso: ProgressoRegistro | undefined
}

export function situacaoDoCase(estado: EstadoMock, usuarioId: string, caso: CaseAdmin, agora: Date): SituacaoDoCase {
  const ultima = ultimaEntrega(estado, usuarioId, caso.id)
  const progresso = progressoDe(estado, usuarioId, caso.id)
  const emAvaliacao = !!ultima && ultima.status !== 'publicada'
  const reprovada = !!ultima && ultima.status === 'publicada' && !aprovada(ultima)
  const tentativa = ultima ? ultima.tentativa + 1 : 1
  const base = { refazer: reprovada, tentativa: emAvaliacao || temCertificado(estado, usuarioId, caso.id) ? (ultima?.tentativa ?? 1) : tentativa, progresso }

  if (temCertificado(estado, usuarioId, caso.id)) return { ...base, estado: 'concluido', motivoBloqueio: null }
  if (emAvaliacao) return { ...base, estado: 'em_avaliacao', motivoBloqueio: null }

  // Quem já começou o case mantém o progresso e o acesso, mesmo que o ranking mude depois.
  const jaComecou = !!progresso
  if (!jaComecou) {
    const resultado = resultadoDoDiagnostico(estado, usuarioId)
    if (!resultado) return { ...base, estado: 'bloqueado', motivoBloqueio: 'Faça o diagnóstico para descobrir por onde começar.' }
    const pendente = ilhaAnteriorPendente(estado, usuarioId, caso)
    if (pendente) return { ...base, estado: 'bloqueado', motivoBloqueio: `Conclua a ilha ${pendente.ordem} (${pendente.titulo}) primeiro.` }
  }

  const noPrazo = !!progresso && progresso.tentativa === tentativa && !progresso.enviadaEm && agora.getTime() <= new Date(progresso.prazoEm).getTime()
  return { ...base, estado: noPrazo ? 'em_andamento' : 'disponivel', motivoBloqueio: null }
}

/** O case em andamento da usuária, se houver (dentro do prazo e ainda não enviado). */
export function caseEmAndamento(estado: EstadoMock, usuarioId: string, agora: Date): CaseAdmin | null {
  for (const caso of casesVisiveisPara(estado, usuarioId)) {
    if (situacaoDoCase(estado, usuarioId, caso, agora).estado === 'em_andamento') return caso
  }
  return null
}

/** Um case por semana: a escolha feita nesta semana, em um case diferente de `exceto`. */
export function escolhaDaSemana(estado: EstadoMock, usuarioId: string, agora: Date, exceto?: string): ProgressoRegistro | undefined {
  const chave = chaveDaSemana(agora)
  return estado.progressos.find(
    p => p.usuarioId === usuarioId && p.caseId !== exceto && chaveDaSemana(new Date(p.escolhidoEm)) === chave,
  )
}

/** Checkpoints de uma etapa da qual a tentativa nova recomeça: situação e defesa. */
export const ETAPAS_QUE_REINICIAM = ['situacao', 'defesa']
