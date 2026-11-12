/**
 * Ponto de entrada dos serviços. As telas importam daqui e só conhecem os
 * contratos. Para trocar o mock pelo backend real, troque a origem das
 * exportações abaixo por um adaptador que implemente `Servicos`.
 */
export type * from './contratos.ts'
import { servicosAtivos } from './http.ts'
import { mockDebug } from './mock/index.ts'

export const servicos = servicosAtivos
export const sessaoService = servicosAtivos.sessao
export const perfilService = servicosAtivos.perfil
export const catalogoService = servicosAtivos.catalogo
export const pontosService = servicosAtivos.pontos
export const diagnosticoService = servicosAtivos.diagnostico
export const caseService = servicosAtivos.caso
export const conteudoService = servicosAtivos.conteudos
export const certificadoService = servicosAtivos.certificados
export const simulacaoService = servicosAtivos.simulacao
export const treinoService = servicosAtivos.treino
export const adminCasesService = servicosAtivos.adminCases
export const adminCorrecaoService = servicosAtivos.adminCorrecao
export const adminConteudosService = servicosAtivos.adminConteudos
export { mockDebug, servicosMock } from './mock/index.ts'
