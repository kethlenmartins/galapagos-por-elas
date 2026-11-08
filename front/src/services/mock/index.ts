import type { Servicos } from '../contratos.ts'
import { adminCasesService } from './admin-cases.ts'
import { adminConteudosService } from './admin-conteudos.ts'
import { adminCorrecaoService } from './admin-correcao.ts'
import { caseService } from './caso.ts'
import { catalogoService } from './catalogo.ts'
import { certificadoService } from './certificados.ts'
import { conteudoService } from './conteudos.ts'
import { diagnosticoService } from './diagnostico.ts'
import { perfilService } from './perfil.ts'
import { pontosService } from './pontos.ts'
import { sessaoService } from './sessao.ts'
import { definirDebug, obterDebug, obterEstado, resetarEstado } from './store.ts'

export {
  adminCasesService,
  adminConteudosService,
  adminCorrecaoService,
  caseService,
  catalogoService,
  certificadoService,
  conteudoService,
  diagnosticoService,
  perfilService,
  pontosService,
  sessaoService,
}

export const servicosMock: Servicos = {
  sessao: sessaoService,
  perfil: perfilService,
  catalogo: catalogoService,
  pontos: pontosService,
  diagnostico: diagnosticoService,
  caso: caseService,
  conteudos: conteudoService,
  certificados: certificadoService,
  adminCases: adminCasesService,
  adminCorrecao: adminCorrecaoService,
  adminConteudos: adminConteudosService,
}

/**
 * Controles de desenvolvimento do mock. No navegador ficam em `window.__galapagosMock`:
 *   __galapagosMock.definir({ iaIndisponivel: true })
 *   __galapagosMock.definirAgora('2026-11-02T07:00:00-03:00')   // simula a segunda de manhã
 *   __galapagosMock.resetar()                                      // volta aos dados de demonstração
 */
export const mockDebug = {
  obter: obterDebug,
  definir: definirDebug,
  resetar: resetarEstado,
  definirAgora: (data: Date | string | null) => definirDebug({ agora: data ? new Date(data).toISOString() : null }),
  /** Token do último e-mail de redefinição de senha, para testar o fluxo sem enviar e-mail. */
  ultimoTokenDeRedefinicao: () => {
    const tokens = obterEstado().tokensRedefinicao
    return tokens.length ? tokens[tokens.length - 1].token : null
  },
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { __galapagosMock?: typeof mockDebug }).__galapagosMock = mockDebug
}
