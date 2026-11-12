import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { sessaoExpirou } from '../../app/sessao'
import { Toast } from '../../componentes/Aviso'
import { Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { avisarPontos } from '../../componentes/Pontos'
import { conteudoService } from '../../services'
import type { Conteudo, TipoConteudo } from '../../services'

export const TIPOS: Record<TipoConteudo, string> = { artigo: 'Artigo', video: 'Vídeo', glossario: 'Glossário', link: 'Link externo' }

/** Texto simples: parágrafos separados por linha em branco e **negrito**. Nunca interpreta HTML. */
export function Texto({ corpo }: { corpo: string }): ReactNode {
  return corpo.split(/\n{2,}/).map((paragrafo, i) => <p key={i}>{paragrafo.split(/\*\*(.+?)\*\*/g).map((parte, j) => j % 2 ? <strong key={j}>{parte}</strong> : <Fragment key={j}>{parte}</Fragment>)}</p>)
}

const FOCAVEIS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** O conteúdo em pop-up: lê ali mesmo (artigo e glossário) ou abre o material externo, e marca como concluído. */
function ConteudoEmPopup({ conteudo, aoFechar, aoConcluir }: { conteudo: Conteudo; aoFechar: () => void; aoConcluir: (c: Conteudo) => void }) {
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const caixa = useRef<HTMLDivElement>(null)
  const externo = conteudo.tipo === 'video' || conteudo.tipo === 'link'

  // Esc fecha, Tab fica dentro do pop-up, a página de trás não rola e o foco volta para o card ao fechar.
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

  const concluir = async () => {
    setOcupado(true)
    setErro('')
    const r = await conteudoService.concluirConteudo(conteudo.id)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
      return
    }
    aoConcluir({ ...conteudo, concluido: true })
    const ganhos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (ganhos > 0) {
      avisarPontos()
      setAviso(`${ganhos} Conteúdo concluído`)
      window.setTimeout(() => setAviso(''), 3500)
    }
  }

  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) aoFechar() }}>
    <div className="modal modal-wide conteudo-popup" ref={caixa} role="dialog" aria-modal="true" aria-labelledby="conteudo-popup-titulo">
      <button className="modal-close" onClick={aoFechar} aria-label="Fechar"><Icon name="close"/></button>
      <div className="trilha-etiquetas">
        <Tag tone="blue">{TIPOS[conteudo.tipo].toUpperCase()}</Tag>
        <span className="conteudo-minutos"><Icon name="clock" size={14}/> {conteudo.minutos} min</span>
        {conteudo.concluido && <span className="inline-success"><Icon name="check" size={16}/> Concluído</span>}
      </div>
      <h2 id="conteudo-popup-titulo">{conteudo.titulo}</h2>
      <p className="trilha-resumo">{conteudo.resumo}</p>
      <div className="conteudo-corpo">
        {conteudo.corpo && <Texto corpo={conteudo.corpo}/>}
        {externo && conteudo.url && <p>O material fica fora da plataforma. <a className="text-link" href={conteudo.url} target="_blank" rel="noopener noreferrer">{conteudo.tipo === 'video' ? 'Assistir ao vídeo' : 'Abrir o link'} (nova aba)</a>. Depois volte aqui e marque como concluído.</p>}
      </div>
      {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
      <div className="trilha-acoes">
        {!conteudo.concluido && <Button onClick={concluir} disabled={ocupado}>{ocupado ? 'Salvando…' : 'Marcar como concluído'}</Button>}
        <Button variant="ghost" onClick={aoFechar}>Fechar</Button>
      </div>
      {aviso && <Toast text={aviso} show/>}
    </div>
  </div>
}

/**
 * Os conteúdos da ilha ou do case em um carrossel horizontal. Cada card abre o conteúdo em um pop-up,
 * onde dá para ler e marcar como concluído sem sair da tela.
 */
export function CarrosselDeConteudos({ conteudos, aoConcluir }: { conteudos: Conteudo[]; aoConcluir?: (c: Conteudo) => void }) {
  const [aberto, setAberto] = useState<string | null>(null)
  const [podeVoltar, setPodeVoltar] = useState(false)
  const [podeAvancar, setPodeAvancar] = useState(false)
  const trilho = useRef<HTMLUListElement>(null)

  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    setPodeVoltar(el.scrollLeft > 4)
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])
  useEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [medir, conteudos.length])

  const rolar = (sentido: 1 | -1) => {
    const el = trilho.current
    if (!el) return
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: sentido * el.clientWidth * 0.85, behavior: reduzido ? 'auto' : 'smooth' })
  }
  const fechar = useCallback(() => setAberto(null), [])
  const atual = conteudos.find(c => c.id === aberto) ?? null

  return <div className="conteudo-carrossel" role="region" aria-roledescription="carrossel" aria-label="Conteúdos">
    {podeVoltar && <button className="conteudo-seta conteudo-seta-voltar" onClick={() => rolar(-1)} aria-label="Conteúdos anteriores"><Icon name="chevron" size={20}/></button>}
    <ul className="conteudo-trilho" ref={trilho} onScroll={medir}>
      {conteudos.map(c => <li key={c.id}>
        <button className={`conteudo-card ${c.concluido ? 'concluido' : ''}`} onClick={() => setAberto(c.id)} aria-haspopup="dialog">
          <span className="trilha-etiquetas"><Tag tone="blue">{TIPOS[c.tipo].toUpperCase()}</Tag>{c.concluido && <span className="trilha-estado inline-success"><Icon name="check" size={16}/> Concluído</span>}</span>
          <strong>{c.titulo}</strong>
          <span className="trilha-resumo">{c.resumo}</span>
          <span className="conteudo-minutos"><Icon name="clock" size={14}/> {c.minutos} min · {c.tipo === 'video' || c.tipo === 'link' ? 'Ver' : c.concluido ? 'Rever' : 'Ler'}</span>
        </button>
      </li>)}
    </ul>
    {podeAvancar && <button className="conteudo-seta conteudo-seta-avancar" onClick={() => rolar(1)} aria-label="Próximos conteúdos"><Icon name="chevron" size={20}/></button>}
    {atual && <ConteudoEmPopup conteudo={atual} aoFechar={fechar} aoConcluir={c => aoConcluir?.(c)}/>}
  </div>
}
