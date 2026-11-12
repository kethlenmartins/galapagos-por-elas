import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icone'

const FOCAVEIS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Pop-up acessível: Esc e clique fora fecham, o Tab fica dentro, a página de trás não rola
 * e o foco volta para quem abriu. `aoFechar` precisa ser estável (useCallback).
 */
export function Popup({ aoFechar, idDoTitulo, className = '', children }: { aoFechar: () => void; idDoTitulo: string; className?: string; children: ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    caixa.current?.querySelector<HTMLElement>('.modal-close')?.focus()
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return aoFechar()
      if (e.key !== 'Tab' || !caixa.current) return
      const itens = [...caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS)]
      if (!itens.length) return
      const primeiro = itens[0]
      const ultimo = itens[itens.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflow
      anterior?.focus?.()
    }
  }, [aoFechar])

  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) aoFechar() }}>
    <div className={`modal modal-wide conteudo-popup ${className}`} ref={caixa} role="dialog" aria-modal="true" aria-labelledby={idDoTitulo}>
      <button className="modal-close" onClick={aoFechar} aria-label="Fechar"><Icon name="close"/></button>
      {children}
    </div>
  </div>
}
