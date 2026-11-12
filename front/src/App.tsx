import { useEffect, useState, type ReactElement } from 'react'
import { go, registrarNavegacao, rotaDoHash, rotasAdmin, rotasPublicas, type Route } from './app/rotas'
import { SessaoProvider, useSessao } from './app/sessao'
import { Diagnostico } from './telas/participante/Diagnostico'
import { Resultado } from './telas/participante/Resultado'
import { AdminCases } from './telas/admin/Cases'
import { AdminContent } from './telas/admin/Conteudos'
import { AdminReview } from './telas/admin/Correcao'
import { AdminEditor } from './telas/admin/Editor'
import { Landing } from './telas/publicas/Landing'
import { Forgot, Login, Signup } from './telas/publicas/Autenticacao'
import { LegalPage } from './telas/publicas/PaginaLegal'
import { NotFound, SessionExpired, SystemPage } from './telas/publicas/Sistema'
import { ValidateCertificate } from './telas/publicas/ValidarCertificado'
import { Certificates } from './telas/participante/Certificados'
import { CasePage } from './telas/participante/CaseTrilha'
import { Trilha } from './telas/participante/Trilha'
import { Ilha } from './telas/participante/Ilha'
import { Treino } from './telas/participante/Treino'
import { Simulacao } from './telas/participante/Simulacao'
import { Vagas } from './telas/participante/Vagas'
import { AdminVagas } from './telas/admin/Vagas'
import { PointsStatement } from './telas/participante/ExtratoPontos'
import { Home } from './telas/participante/Home'
import { Onboarding } from './telas/participante/Onboarding'
import { Profile } from './telas/participante/Perfil'
import { Forum } from './telas/participante/Forum'

const telas: Record<Route, () => ReactElement> = {
  landing: () => <Landing />,
  signup: () => <Signup />,
  login: () => <Login />,
  forgot: () => <Forgot />,
  reset: () => <Forgot reset />,
  validate: () => <ValidateCertificate />,
  onboarding: () => <Onboarding />,
  diagnostic: () => <Diagnostico />,
  match: () => <Resultado />,
  home: () => <Home />,
  trail: () => <Trilha />,
  island: () => <Ilha />,
  training: () => <Treino />,
  simulation: () => <Simulacao />,
  jobs: () => <Vagas />,
  forum: () => <Forum />,
  case: () => <CasePage />,
  task: () => <CasePage />,
  result: () => <CasePage />,
  certificates: () => <Certificates />,
  profile: () => <Profile />,
  'admin-cases': () => <AdminCases />,
  'admin-editor': () => <AdminEditor />,
  'admin-review': () => <AdminReview />,
  'admin-content': () => <AdminContent />,
  'admin-jobs': () => <AdminVagas />,
  terms: () => <LegalPage type="terms" />,
  privacy: () => <LegalPage type="privacy" />,
  points: () => <PointsStatement />,
  forbidden: () => <SystemPage type="403" />,
  'system-error': () => <SystemPage type="error" />,
  maintenance: () => <SystemPage type="maintenance" />,
  'session-expired': () => <SessionExpired />,
}

function Rotas() {
  const [rota, setRota] = useState<Route>(rotaDoHash())
  const { sessao, carregando } = useSessao()

  useEffect(() => {
    registrarNavegacao(proxima => {
      window.location.hash = `/${proxima}`
      setRota(proxima)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    const aoMudarOHash = () => setRota(rotaDoHash())
    window.addEventListener('hashchange', aoMudarOHash)
    return () => window.removeEventListener('hashchange', aoMudarOHash)
  }, [])

  useEffect(() => {
    if (sessao && rota === 'landing') go('home')
  }, [rota, sessao])

  if (!telas[rota]) return <NotFound />
  if (carregando) return null
  // A landing é externa à plataforma: uma sessão ativa nunca permanece nela,
  // mesmo que a URL seja digitada diretamente.
  if (sessao && rota === 'landing') return null
  if (!rotasPublicas.includes(rota) && !sessao) return <Login />
  if (rotasAdmin.includes(rota) && sessao?.papel !== 'equipe') return <SystemPage type="403" />
  return telas[rota]()
}

export default function App() {
  return (
    <SessaoProvider>
      <Rotas />
    </SessaoProvider>
  )
}

