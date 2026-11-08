/**
 * Ponto de entrada dos serviços. As telas importam daqui e só conhecem os
 * contratos. Para trocar o mock pelo backend real, troque a origem das
 * exportações abaixo por um adaptador que implemente `Servicos`.
 */
export type * from './contratos.ts'
export {
  adminCasesService,
  adminConteudosService,
  adminCorrecaoService,
  caseService,
  catalogoService,
  certificadoService,
  conteudoService,
  diagnosticoService,
  mockDebug,
  perfilService,
  pontosService,
  servicosMock as servicos,
  sessaoService,
} from './mock/index.ts'
