/** Rotas da aplicação (navegação por hash: `#/home`) e funções de navegação. */

export type Route =
  | 'landing' | 'signup' | 'login' | 'forgot' | 'reset' | 'validate'
  | 'onboarding' | 'diagnostic' | 'match' | 'home' | 'trail' | 'island' | 'training' | 'simulation' | 'jobs' | 'forum' | 'case' | 'task'
  | 'result' | 'certificates' | 'profile'
  | 'admin-cases' | 'admin-editor' | 'admin-review' | 'admin-content' | 'admin-jobs'
  | 'terms' | 'privacy' | 'points' | 'forbidden' | 'system-error' | 'maintenance' | 'session-expired'

export const routes: Record<Route, string> = {
  landing: 'Início', signup: 'Cadastro', login: 'Entrar', forgot: 'Recuperar senha',
  reset: 'Nova senha', validate: 'Validar certificado', onboarding: 'Seu perfil',
  diagnostic: 'Diagnóstico', match: 'Seu Mapa de Carreira', home: 'Início',
  trail: 'Suas ilhas', island: 'Ilha', training: 'Treino de entrevista', simulation: 'Simulação de entrevista', jobs: 'Vagas', forum: 'Fórum', case: 'Case', task: 'Case', result: 'Case',
  certificates: 'Certificados', profile: 'Perfil',
  'admin-cases': 'Cases', 'admin-editor': 'Editor de case',
  'admin-review': 'Fila de correção', 'admin-content': 'Conteúdos', 'admin-jobs': 'Vagas',
  terms: 'Termos de uso', privacy: 'Política de privacidade', points: 'Extrato de pontos',
  forbidden: 'Acesso restrito', 'system-error': 'Erro', maintenance: 'Manutenção',
  'session-expired': 'Sessão expirada',
}


/** Rotas abertas a quem não tem login. */
export const rotasPublicas: Route[] = ['landing', 'signup', 'login', 'forgot', 'reset', 'validate', 'terms', 'privacy', 'forbidden', 'system-error', 'maintenance', 'session-expired']

/** Rotas só da equipe. */
export const rotasAdmin: Route[] = ['admin-cases', 'admin-editor', 'admin-review', 'admin-content', 'admin-jobs']

let navegar: (rota: Route) => void = () => {}

/** O `App` registra aqui como navegar; as telas só chamam `go`. */
export function registrarNavegacao(fn: (rota: Route) => void) {
  navegar = fn
}

export function go(rota: Route) {
  navegar(rota)
}

/** A rota do hash, sem os parâmetros: `#/validate?codigo=X` é a rota `validate`. */
export const rotaDoHash = (): Route => (window.location.hash.replace('#/', '').split('?')[0] || 'landing') as Route

/** Um parâmetro do hash: `#/validate?codigo=X` -> `parametroDoHash('codigo')` devolve "X". */
export function parametroDoHash(nome: string): string | null {
  const consulta = window.location.hash.split('?')[1]
  return consulta ? new URLSearchParams(consulta).get(nome) : null
}

const CHAVE_ILHA_ATUAL = 'galapagos:ilha-atual'

/** A ilha (área) que a participante está vendo; a rota `island` não leva o id no endereço. */
export function definirIlhaAtual(areaId: string | null) {
  try {
    if (areaId) sessionStorage.setItem(CHAVE_ILHA_ATUAL, areaId)
    else sessionStorage.removeItem(CHAVE_ILHA_ATUAL)
  } catch {
    // Sem armazenamento: a tela volta para o mapa de ilhas.
  }
}

export function obterIlhaAtual(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_ILHA_ATUAL)
  } catch {
    return null
  }
}

const CHAVE_CASE_ATUAL = 'galapagos:case-atual'

/** O case que a participante está vendo (a rota `case` não leva o id no endereço). */
export function definirCaseAtual(caseId: string | null) {
  try {
    if (caseId) sessionStorage.setItem(CHAVE_CASE_ATUAL, caseId)
    else sessionStorage.removeItem(CHAVE_CASE_ATUAL)
  } catch {
    // Sem armazenamento: a tela volta para a trilha.
  }
}

export function obterCaseAtual(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_CASE_ATUAL)
  } catch {
    return null
  }
}

/** Abre o editor de cases. Sem id, começa um case novo pelo briefing. */
export function irParaEditor(caseId?: string) {
  window.location.hash = caseId ? `/admin-editor?id=${encodeURIComponent(caseId)}` : '/admin-editor'
}
