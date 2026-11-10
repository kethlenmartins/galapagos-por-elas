import type { Servicos, Resultado, Sessao, EstadoDiagnostico, ResultadoDiagnostico, EventoPontos } from './contratos.ts'
import { servicosMock } from './mock/index.ts'

const base = import.meta.env.VITE_API_URL ?? '/api'
async function api<T>(path: string, init: RequestInit = {}): Promise<Resultado<T>> {
  try {
    const response = await fetch(`${base}${path}`, { ...init, credentials: 'include', headers: { 'content-type': 'application/json', ...init.headers } })
    const payload = await response.json()
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

const caso: Servicos['caso'] = {
  obterTrilha: async () => {
    const listed = await api<Array<{ id: string; titulo: string; areaId: string; resumo: string }>>('/cases')
    if (listed.erro) return listed as never
    const state = await api<EstadoDiagnostico>('/assessment/state')
    const complete = state.dados?.status === 'concluido'
    const cases = listed.dados!.map(c => ({ caseId: c.id, titulo: c.titulo, areaId: c.areaId, area: c.areaId, resumo: c.resumo, estado: complete ? 'disponivel' as const : 'bloqueado' as const, posicaoNoFit: null, noTop3: false, sugerido: false, motivoBloqueio: complete ? null : 'Conclua o diagnóstico primeiro.', prazoEm: null, progresso: { concluidos: 0, total: 0 }, certificadoId: null, refazer: false }))
    return { dados: { diagnosticoConcluido: complete, primeiroCaseConcluido: false, semana: { inicioEm: new Date().toISOString(), fimEm: new Date().toISOString() }, escolhaDaSemana: null, podeEscolher: complete, motivoNaoPodeEscolher: complete ? null : 'Conclua o diagnóstico primeiro.', cases }, erro: null }
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
  enviarCase: caseId => api(`/cases/${encodeURIComponent(caseId)}/submit`, { method: 'POST' }),
  obterResultadoCase: caseId => api(`/cases/${encodeURIComponent(caseId)}/result`),
  pedirRevisao: async () => ({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Pedido de revisão não faz parte do piloto.' } }),
}

// Durante a migração incremental, serviços ainda não cobertos continuam apontando
// para o mock. Assim o seletor de ambiente não quebra telas fora do piloto.
export const servicosHttp: Servicos = { ...servicosMock, sessao, diagnostico, caso }
export const servicosAtivos: Servicos = import.meta.env.VITE_API_URL ? servicosHttp : servicosMock
