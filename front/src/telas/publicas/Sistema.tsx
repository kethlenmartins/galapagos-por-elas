import { go } from '../../app/rotas'
import { authenticate } from '../../app/sessao'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { Logo } from '../../componentes/Logo'

export function SystemPage({ type }: { type: '404' | '403' | 'error' | 'maintenance' }) {
  const content = {
    '404': ['404', 'Esta página não foi encontrada', 'O endereço pode ter mudado ou não estar mais disponível.', 'Voltar ao início'],
    '403': ['403', 'Esta área é exclusiva da equipe', 'Sua conta de participante não tem permissão para acessar a administração.', 'Voltar para minha área'],
    error: ['Ops', 'Algo deu errado', 'Não conseguimos carregar esta página. Tente novamente em alguns instantes.', 'Tentar de novo'],
    maintenance: ['Pausa rápida', 'Estamos cuidando da plataforma', 'Voltaremos em breve. Seu progresso continua salvo.', 'Voltar ao início'],
  }[type]
  return <div className="system-page"><div className="system-blob" aria-hidden="true"/><Logo/><main><span className="system-code">{content[0]}</span><span className="round-icon"><Icon name={type==='403'?'lock':type==='maintenance'?'settings':'close'} size={30}/></span><h1>{content[1]}</h1><p>{content[2]}</p><Button onClick={() => go(type==='403'?'home':'landing')} icon="arrow">{content[3]}</Button>{type === '403' && <button className="text-link centered" onClick={() => { authenticate(null); go('login') }}>Entrar com uma conta de equipe</button>}</main></div>
}

export function SessionExpired() {
  return <div className="expired-page"><AppShell route="home"><div className="skeleton-page"><span/><span/><span/></div></AppShell><div className="modal-backdrop"><div className="modal modal-success"><span><Icon name="lock" size={30}/></span><h2>Sua sessão expirou</h2><p>Entre novamente para continuar. Vamos tentar preservar o que você estava fazendo.</p><Button onClick={() => { authenticate(null); go('login') }}>Entrar de novo</Button></div></div></div>
}

export function NotFound() { return <SystemPage type="404"/> }
