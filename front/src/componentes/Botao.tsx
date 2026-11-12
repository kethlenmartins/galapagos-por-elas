import { type ReactNode } from 'react'
import { Icon, type IconName } from './Icone'

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, icon, pressed }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit'; disabled?: boolean; icon?: IconName; /** Botão liga/desliga: expõe o estado a leitores de tela. */ pressed?: boolean
}) {
  return <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled} aria-pressed={pressed}>
    {children}{icon && <Icon name={icon} size={18}/>}
  </button>
}
