import type { Servicos, Resultado, Sessao, EstadoDiagnostico, ResultadoDiagnostico, EventoPontos } from './contratos.ts'
import { servicosMock } from './mock/index.ts'

const base = import.meta.env.VITE_API_URL ?? '/api'
const CHAVE_TOKEN_SESSAO = 'galapagos:access-token'

function obterTokenDeSessao() {
  try { return sessionStorage.getItem(CHAVE_TOKEN_SESSAO) } catch { return null }
}

function salvarTokenDeSessao(token: string | null) {
  try {
    if (token) sessionStorage.setItem(CHAVE_TOKEN_SESSAO, token)
    else sessionStorage.removeItem(CHAVE_TOKEN_SESSAO)
  } catch { /* o cookie continua sendo usado quando o armazenamento não estiver disponível */ }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<Resultado<T>> {
  try {
    // Fastify rejeita `application/json` sem corpo. Só declaramos JSON quando
    // há um payload para serializar (por exemplo, POST /assessment/start não tem).
    const headers = new Headers(init.headers)
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
    const token = obterTokenDeSessao()
    if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`)
    const response = await fetch(`${base}${path}`, { ...init, credentials: 'include', headers })
    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const erro = typeof payload === 'object' && payload !== null && 'erro' in payload
        ? (payload as { erro: Resultado<T>['erro'] }).erro
        : null
      if (response.status === 401) salvarTokenDeSessao(null)
      return { dados: null, erro: erro ?? { codigo: 'REDE', mensagem: 'Não foi possível concluir a solicitação. Tente novamente.' } }
    }
    if (path === '/session/register' || path === '/session/login') {
      const dados = typeof payload === 'object' && payload !== null && 'dados' in payload ? (payload as { dados?: { accessToken?: unknown } }).dados : null
      if (typeof dados?.accessToken === 'string') salvarTokenDeSessao(dados.accessToken)
      if (dados && typeof dados === 'object' && 'accessToken' in dados) delete dados.accessToken
    }
    if (path === '/session/logout') salvarTokenDeSessao(null)
    return payload as Resultado<T>
  } catch {
    return { dados: null, erro: { codigo: 'REDE', mensagem: 'Não foi possível conectar. Tente novamente.' } }
  }
}

const sessao: Servicos['sessao'] = {
  cadastrar: dados => api<Sessao>('/session/register', { method: 'POST', body: JSON.stringify(dados) }),
  entrar: (email, senha) => api<Sessao>('/session/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
  sair: () => api<true>('/session/logout', { method: 'POST' }),
  obterSessao: () => api<Sessao | null>('/session'),
  sairDeTodosOsAparelhos: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Operação ainda não disponível no piloto.' } }),
  alterarSenha: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Operação ainda não disponível no piloto.' } }),
  recuperarSenha: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Recuperação de senha não está configurada no piloto.' } }),
  redefinirSenha: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Recuperação de senha não está configurada no piloto.' } }),
  excluirConta: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Exclusão de conta ainda não está disponível no piloto.' } }),
}

const diagnostico: Servicos['diagnostico'] = {
  obterConfiguracao: () => api('/assessment/config'),
  obterEstadoDiagnostico: () => api('/assessment/state'),
  iniciarDiagnostico: () => api('/assessment/start', { method: 'POST' }),
  responderPergunta: (perguntaId, resposta) => api('/assessment/answer', { method: 'PUT', body: JSON.stringify({ perguntaId, resposta }) }),
  finalizarDiagnostico: () => api<{ resultadoId: string; eventos: EventoPontos[] }>('/assessment/score', { method: 'POST' }),
  obterResultadoDiagnostico: id => api<ResultadoDiagnostico>(`/assessment/result${id ? `/${encodeURIComponent(id)}` : ''}`),
}
const perfil: Servicos['perfil'] = { obterPerfil: () => api('/profile'), atualizarPerfil: dados => api('/profile', { method: 'PUT', body: JSON.stringify(dados) }), registrarAceiteTermos: versao => api('/profile/terms', { method: 'POST', body: JSON.stringify({ versao }) }), exportarMeusDados: () => api('/profile/export') }
const catalogo: Servicos['catalogo'] = { listarAreas: () => api('/catalog/areas'), obterArea: id => api('/catalog/areas/' + encodeURIComponent(id)) }
const pontos: Servicos['pontos'] = { obterSaldoENivel: () => api('/points/balance'), listarExtrato: filtro => api('/points/events' + (filtro?.dias ? '?dias=' + filtro.dias : '')), listarRegrasDePontos: () => api('/points/rules') }
const conteudos: Servicos['conteudos'] = { listarConteudos: filtro => { const q = new URLSearchParams(); if (filtro?.areaId) q.set('areaId', filtro.areaId); if (filtro?.tipo) q.set('tipo', filtro.tipo); if (filtro?.caseId) q.set('caseId', filtro.caseId); return api('/contents' + (q.size ? '?' + q : '')) }, obterConteudo: id => api('/contents/' + encodeURIComponent(id)), concluirConteudo: id => api('/contents/' + encodeURIComponent(id) + '/complete', { method: 'POST' }) }
const certificados: Servicos['certificados'] = { listarMeusCertificados: () => api('/certificates'), baixarCertificado: id => api('/certificates/' + encodeURIComponent(id) + '/pdf'), obterLinkLinkedIn: id => api('/certificates/' + encodeURIComponent(id) + '/linkedin'), validarCertificado: code => api('/certificates/validate/' + encodeURIComponent(code)) }

const caso: Servicos['caso'] = {
  obterTrilha: async () => {
    const listed = await api<Array<{ id: string; titulo: string; areaId: string; resumo: string }>>('/cases')
    if (listed.erro) return listed as never
    const state = await api<EstadoDiagnostico>('/assessment/state')
    if (state.erro) return state as never
    const complete = state.dados?.status === 'concluido'
    const detalhes = await Promise.all(listed.dados!.map(c => api<{ estado: 'disponivel' | 'em_andamento' | 'em_avaliacao'; prazoEm: string | null; checkpoints: Array<{ status: string }> }>(`/cases/${encodeURIComponent(c.id)}`)))
    const falha = detalhes.find(r => r.erro)?.erro
    if (falha) return { dados: null, erro: falha }
    const cases = listed.dados!.map((c, index) => {
      const detalhe = detalhes[index].dados!
      const estado = complete ? detalhe.estado : 'bloqueado' as const
      const total = detalhe.checkpoints.length
      const concluidos = detalhe.checkpoints.filter(checkpoint => checkpoint.status === 'concluido').length
      return { caseId: c.id, titulo: c.titulo, areaId: c.areaId, area: c.areaId, resumo: c.resumo, estado, posicaoNoFit: null, noTop3: false, sugerido: false, motivoBloqueio: complete ? null : 'Conclua o diagnóstico primeiro.', prazoEm: detalhe.prazoEm, progresso: { concluidos, total }, certificadoId: null, refazer: false }
    })
    const caseAtivo = cases.find(c => c.estado === 'em_andamento' || c.estado === 'em_avaliacao')
    const motivo = !complete ? 'Conclua o diagnóstico primeiro.' : caseAtivo ? `Continue o case em andamento: ${caseAtivo.titulo}.` : null
    return { dados: { diagnosticoConcluido: complete, primeiroCaseConcluido: false, semana: { inicioEm: new Date().toISOString(), fimEm: new Date().toISOString() }, escolhaDaSemana: caseAtivo?.caseId ?? null, podeEscolher: !motivo, motivoNaoPodeEscolher: motivo, cases }, erro: null }
  },
  escolherCase: async caseId => {
    const r = await api<{ enrollmentId: string }>('/cases/' + encodeURIComponent(caseId) + '/start', { method: 'POST' })
    if (r.erro) return r as never
    return caso.obterCase(caseId)
  },
  obterCase: caseId => api(`/cases/${encodeURIComponent(caseId)}`),
  obterTarefa: tarefaId => api(`/tasks/${encodeURIComponent(tarefaId)}`),
  salvarRascunho: (tarefaId, respostas) => api(`/tasks/${encodeURIComponent(tarefaId)}/draft`, { method: 'PUT', body: JSON.stringify({ respostas }) }),
  concluirCheckpoint: checkpointId => api(`/checkpoints/${encodeURIComponent(checkpointId)}/complete`, { method: 'POST' }),
  reabrirCheckpoint: checkpointId => api(`/checkpoints/${encodeURIComponent(checkpointId)}/reopen`, { method: 'POST' }),
  enviarCase: caseId => api(`/cases/${encodeURIComponent(caseId)}/submit`, { method: 'POST' }),
  obterResultadoCase: caseId => api(`/cases/${encodeURIComponent(caseId)}/result`),
  pedirRevisao: (tarefaId, motivo) => api('/reviews', { method: 'POST', body: JSON.stringify({ tarefaId, motivo }) }),
}

// Durante a migração incremental, serviços ainda não cobertos continuam apontando
// para o mock. Assim o seletor de ambiente não quebra telas fora do piloto.
export const servicosHttp: Servicos = { sessao, perfil, catalogo, pontos, diagnostico, caso, conteudos, certificados, adminCases: servicosMock.adminCases, adminCorrecao: servicosMock.adminCorrecao, adminConteudos: servicosMock.adminConteudos }
export const servicosAtivos: Servicos = import.meta.env.VITE_API_URL ? servicosHttp : servicosMock
