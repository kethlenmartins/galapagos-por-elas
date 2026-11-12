import type { Servicos, Resultado, Sessao, ResultadoDiagnostico, EventoPontos } from './contratos.ts'
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
  // A trilha (ilhas em ordem, estados e bloqueios) é calculada pelo servidor.
  obterTrilha: () => api('/trail'),
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
  pedirRevisaoDaIA: (tarefaId, respostas) => api('/tasks/' + encodeURIComponent(tarefaId) + '/ai-review', { method: 'POST', body: JSON.stringify({ respostas }) }),
}

// Durante a migração incremental, serviços ainda não cobertos continuam apontando
// para o mock. Assim o seletor de ambiente não quebra telas fora do piloto.
const SEM_EDITOR = { dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'A edição de cases pela plataforma ainda não está disponível. Os cases são publicados pela equipe técnica; aqui você pode arquivar e republicar.' } } as const
const semEditor = async () => SEM_EDITOR

const adminCases: Servicos['adminCases'] = {
  listarCases: filtro => api('/admin/cases' + (filtro?.status ? '?status=' + filtro.status : '')),
  // Arquivar e republicar devolvem só o resumo do case; o editor completo ainda não existe na API.
  arquivarCase: id => api('/admin/cases/' + encodeURIComponent(id) + '/archive', { method: 'POST' }) as never,
  publicarCase: id => api('/admin/cases/' + encodeURIComponent(id) + '/publish', { method: 'POST' }) as never,
  obterCase: semEditor,
  gerarRascunhoComIA: semEditor,
  regenerarSecao: semEditor,
  salvarCase: semEditor,
  conferirGabarito: semEditor,
  aprovarCase: semEditor,
}

const adminConteudos: Servicos['adminConteudos'] = {
  listarConteudosAdmin: () => api('/admin/contents'),
  salvarConteudo: conteudo => api('/admin/contents', { method: 'POST', body: JSON.stringify(conteudo) }),
  removerConteudo: id => api('/admin/contents/' + encodeURIComponent(id), { method: 'DELETE' }),
}

const adminCorrecao: Servicos['adminCorrecao'] = {
  listarEntregas: filtro => api('/admin/deliveries' + (filtro?.status ? '?status=' + filtro.status : '')),
  obterEntregaComSugestaoIA: id => api('/admin/deliveries/' + encodeURIComponent(id)),
  ajustarNotaEFeedback: ({ entregaId, notaFinal, feedback }) => api('/admin/deliveries/' + encodeURIComponent(entregaId) + '/grade', { method: 'PUT', body: JSON.stringify({ notaFinal, feedback }) }),
  aprovarNota: id => api('/admin/deliveries/' + encodeURIComponent(id) + '/approve', { method: 'POST' }),
  publicarResultados: () => api('/admin/deliveries/publish', { method: 'POST' }),
  listarPedidosRevisao: () => api('/admin/reviews'),
  resolverPedidoRevisao: (id, { resposta, novaNota }) => api('/admin/reviews/' + encodeURIComponent(id) + '/resolve', { method: 'POST', body: JSON.stringify({ resposta, novaNota }) }),
}

const vagas: Servicos['vagas'] = {
  listarVagas: filtro => api('/jobs' + (filtro?.areaId ? '?areaId=' + encodeURIComponent(filtro.areaId) : '')),
}

const adminVagas: Servicos['adminVagas'] = {
  listarVagasAdmin: () => api('/admin/jobs'),
  salvarVaga: vaga => api('/admin/jobs', { method: 'POST', body: JSON.stringify(vaga) }),
  publicarVaga: id => api('/admin/jobs/' + encodeURIComponent(id) + '/publicar', { method: 'POST' }),
  encerrarVaga: id => api('/admin/jobs/' + encodeURIComponent(id) + '/encerrar', { method: 'POST' }),
  removerVaga: id => api('/admin/jobs/' + encodeURIComponent(id), { method: 'DELETE' }),
}

const simulacao: Servicos['simulacao'] = {
  obterResumoDaSimulacao: areaId => api('/interview/' + encodeURIComponent(areaId)),
  iniciarSimulacao: config => api('/interview/sessions', { method: 'POST', body: JSON.stringify(config) }),
  responderSimulacao: (sessaoId, resposta) => api('/interview/sessions/' + encodeURIComponent(sessaoId) + '/answer', { method: 'POST', body: JSON.stringify({ resposta }) }),
}

const treino: Servicos['treino'] = {
  obterResumoDoTreino: areaId => api('/training/' + encodeURIComponent(areaId)),
  sortearPerguntas: ({ areaId, nivel, quantidade, tema }) => api(`/training/${encodeURIComponent(areaId)}/questions?nivel=${nivel}&quantidade=${quantidade}${tema ? '&tema=' + encodeURIComponent(tema) : ''}`),
  responderPergunta: (perguntaId, letra) => api('/training/questions/' + encodeURIComponent(perguntaId) + '/answer', { method: 'POST', body: JSON.stringify({ letra }) }),
}

export const servicosHttp: Servicos = { vagas, adminVagas, simulacao, treino, sessao, perfil, catalogo, pontos, diagnostico, caso, conteudos, certificados, adminCases, adminCorrecao, adminConteudos }
export const servicosAtivos: Servicos = import.meta.env.VITE_API_URL ? servicosHttp : servicosMock
