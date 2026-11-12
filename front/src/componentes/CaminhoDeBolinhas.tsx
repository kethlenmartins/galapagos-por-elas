import type { CSSProperties, ReactNode } from 'react'
import './caminho.css'
import { Icon, type IconName } from './Icone'

export type EstadoDoNo = 'feito' | 'atual' | 'aberto' | 'bloqueado'

export type NoDoCaminho = {
  id: string
  rotulo: string
  /** Texto curto abaixo do rótulo, ex.: "3 de 7". */
  detalhe?: string
  estado: EstadoDoNo
  icone?: IconName
  /** Substitui o ícone (ex.: o desenho da ilha). */
  emblema?: ReactNode
  /** 0 a 100: anel de progresso em volta da bolinha. */
  progresso?: number
}

const ROTULO_DO_ESTADO: Record<EstadoDoNo, string> = { feito: 'concluído', atual: 'em andamento', aberto: 'disponível', bloqueado: 'bloqueado' }

/** Posição lateral de cada bolinha no caminho sinuoso (em %), no estilo Duolingo. */
const ONDA = [0, 24, 38, 24, 0, -24, -38, -24]

/**
 * Caminho de bolinhas: cada etapa é uma bolinha preenchida (feita), destacada (atual), vazada (disponível)
 * ou cinza com cadeado (bloqueada). `vertical` serpenteia e mostra o detalhe do nó escolhido logo abaixo dele;
 * `horizontal` é uma linha compacta (usada nas etapas de um case).
 */
export function CaminhoDeBolinhas({ nos, orientacao = 'vertical', escolhido, aoEscolher, detalhe, rotuloDaLista }: {
  nos: NoDoCaminho[]
  orientacao?: 'vertical' | 'horizontal'
  escolhido?: string | null
  aoEscolher?: (id: string) => void
  /** Conteúdo mostrado logo abaixo do nó escolhido (só na vertical). */
  detalhe?: (no: NoDoCaminho) => ReactNode
  rotuloDaLista: string
}) {
  return <ol className={`caminho caminho-${orientacao}`} aria-label={rotuloDaLista}>
    {nos.map((no, i) => {
      const estilo = { '--desloca': `${orientacao === 'vertical' ? ONDA[i % ONDA.length] : 0}%`, '--anel': `${Math.max(0, Math.min(100, no.progresso ?? (no.estado === 'feito' ? 100 : 0)))}%` } as CSSProperties
      const selecionado = escolhido === no.id
      return <li key={no.id} className={`caminho-no caminho-${no.estado} ${selecionado ? 'escolhido' : ''}`} style={estilo} aria-current={no.estado === 'atual' ? 'step' : undefined}>
        <button
          className="caminho-bolinha"
          onClick={() => aoEscolher?.(no.id)}
          aria-pressed={aoEscolher ? selecionado : undefined}
          aria-label={`${no.rotulo}, ${ROTULO_DO_ESTADO[no.estado]}${no.detalhe ? `, ${no.detalhe}` : ''}`}
          disabled={!aoEscolher}
        >
          <span className="caminho-miolo" aria-hidden="true">
            {no.estado === 'feito' ? <Icon name="check" size={26}/> : no.estado === 'bloqueado' ? <Icon name="lock" size={22}/> : no.emblema ?? (no.icone ? <Icon name={no.icone} size={26}/> : i + 1)}
          </span>
        </button>
        <span className="caminho-rotulo"><strong>{no.rotulo}</strong>{no.detalhe && <small>{no.detalhe}</small>}</span>
        {orientacao === 'vertical' && selecionado && detalhe && <div className="caminho-detalhe">{detalhe(no)}</div>}
      </li>
    })}
  </ol>
}
