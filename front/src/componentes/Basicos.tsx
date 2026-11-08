import { type ReactNode } from 'react'
import { Icon } from './Icone'

export function Progress({ value, pink = false }: { value: number; pink?: boolean }) {
  return <div className={`progress ${pink ? 'progress-pink' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }}/></div>
}

export function Tag({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'pink' | 'green' | 'yellow' | 'gray' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

export function AIBadge({ compact = false, admin = false }: { compact?: boolean; admin?: boolean }) {
  return <span className={`ai-badge ${compact ? 'ai-badge-compact' : ''}`} title={admin ? 'Sugerido pela IA, aguardando revisão' : 'Gerado com apoio de IA e revisado pela equipe'}><Icon name="spark" size={compact ? 12 : 14}/> IA</span>
}

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
