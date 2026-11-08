import { Icon } from './Icone'

export function Toast({ text, show }: { text: string; show: boolean }) {
  return <div className={`toast ${show ? 'toast-show' : ''}`} role="status"><span className="toast-icon"><Icon name="spark"/></span><span><strong>+{text.split(' ')[0]} pontos</strong><small>{text.split(' ').slice(1).join(' ')}</small></span></div>
}
