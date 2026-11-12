import { type ReactNode, useEffect, useState } from 'react'
import { caseService, sessaoService, type ItemTrilha } from '../services'
import { type Route, go, routes } from '../app/rotas'
import { authenticate, useSessao } from '../app/sessao'
import { EVENTO_PONTOS, Pontos } from './Pontos'
import { Progress, Tag } from './Basicos'
import { Button } from './Botao'
import { Icon, type IconName } from './Icone'
import { Logo } from './Logo'

export const participantNav: { label: string; route: Route; icon: IconName }[] = [
  { label: 'Início', route: 'home', icon: 'home' },
  { label: 'Ilhas', route: 'trail', icon: 'case' },
  { label: 'Vagas', route: 'jobs', icon: 'chart' },
  { label: 'Fórum', route: 'forum', icon: 'book' },
  { label: 'Perfil', route: 'profile', icon: 'user' },
]

export const adminNav: { label: string; route: Route; icon: IconName }[] = [
  { label: 'Cases', route: 'admin-cases', icon: 'case' },
  { label: 'Correção', route: 'admin-review', icon: 'check' },
  { label: 'Conteúdos', route: 'admin-content', icon: 'book' },
  { label: 'Vagas', route: 'admin-jobs', icon: 'chart' },
]

/** O case em andamento, para o resumo da barra lateral. Atualiza junto com os pontos (que mudam a cada checkpoint). */
function useCaseEmAndamento(ligado: boolean) {
  const [caso, setCaso] = useState<ItemTrilha | null>(null)
  useEffect(() => {
    if (!ligado) return
    let ativo = true
    const carregar = () => {
      caseService.obterTrilha().then(r => {
        if (ativo && r.dados) setCaso(r.dados.cases.find(c => c.estado === 'em_andamento') ?? null)
      })
    }
    carregar()
    window.addEventListener(EVENTO_PONTOS, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO_PONTOS, carregar)
    }
  }, [ligado])
  return caso
}

export function AppShell({ route, children, admin = false }: { route: Route; children: ReactNode; admin?: boolean }) {
  const nav = admin ? adminNav : participantNav
  /** O item “Case” fica aceso na trilha e dentro de um case. */
  const ativo = (rota: Route) => rota === route || (rota === 'trail' && (route === 'case' || route === 'island' || route === 'training' || route === 'simulation'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { sessao } = useSessao()
  const emAndamento = useCaseEmAndamento(!admin)
  const nome = sessao?.nome ?? ''
  const iniciais = nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const logout = async () => { await sessaoService.sair(); authenticate(null); go('login') }
  return <div className={`app-shell ${admin ? 'admin-shell' : ''}`}>
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-head"><Logo light/><button className="icon-btn close-nav" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><Icon name="close"/></button></div>
      <nav aria-label="Navegação principal">
        {nav.map(item => <button key={item.route} className={`nav-item ${ativo(item.route) ? 'active' : ''}`} onClick={() => { go(item.route); setMobileOpen(false) }}>
          <Icon name={item.icon}/><span>{item.label}</span>
        </button>)}
        {!admin && <button className={`nav-item ${route === 'certificates' ? 'active' : ''}`} onClick={() => go('certificates')}><Icon name="award"/><span>Certificados</span></button>}
      </nav>
      <div className="sidebar-bottom">
        {admin ? <><button className="nav-item area-switch" onClick={() => go('home')}><Icon name="user"/><span>Área da participante</span></button><div className="admin-user"><span className="initials">{iniciais}</span><span><strong>{nome}</strong><small>Equipe</small></span></div><button className="nav-item" onClick={logout}><Icon name="logout"/><span>Sair</span></button></>
          : emAndamento && <button className="weekly-mini" onClick={() => go('trail')}><small>CASE EM ANDAMENTO</small><strong>{emAndamento.progresso.concluidos} de {emAndamento.progresso.total} etapas</strong><Progress value={emAndamento.progresso.total ? (emAndamento.progresso.concluidos / emAndamento.progresso.total) * 100 : 0}/></button>}
      </div>
    </aside>
    <div className="app-body">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Icon name="menu"/></button>
        <div className="mobile-logo"><Logo/></div>
        <div className="topbar-title"><span>{admin ? 'Painel da equipe' : routes[route]}</span></div>
        {!admin && <Pontos/>}
        {admin && <Tag tone="pink">EQUIPE</Tag>}
        <div className="user-menu-wrap">
          <button className="top-user" onClick={() => setUserOpen(!userOpen)}>{nome} <Icon name="chevron" size={16}/></button>
          {userOpen && <div className="user-menu">
            <strong>{nome}</strong>
            <small>{admin ? 'Acesso de equipe' : 'Participante'}</small>
            {!admin && <button onClick={() => go('profile')}><Icon name="user"/> Meu perfil</button>}
            {admin && <button onClick={() => go('home')}><Icon name="home"/> Ir para área da participante</button>}
            {!admin && sessao?.papel === 'equipe' && <button onClick={() => go('admin-cases')}><Icon name="settings"/> Ir para a administração</button>}
            <button onClick={logout}><Icon name="logout"/> Sair</button>
          </div>}
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
    {!admin && <nav className="bottom-nav" aria-label="Navegação móvel">
      {participantNav.map(item => <button key={item.route} className={ativo(item.route) ? 'active' : ''} onClick={() => go(item.route)}>
        <Icon name={item.icon}/><span>{item.label}</span>
      </button>)}
    </nav>}
  </div>
}

export function PublicHeader() {
  const { sessao } = useSessao()
  return <header className="public-header"><Logo publica/><nav><button onClick={() => go('validate')}>Validar certificado</button>{sessao ? <Button onClick={() => go('home')}>Ir para a plataforma</Button> : <button onClick={() => go('login')}>Entrar</button>}</nav></header>
}
