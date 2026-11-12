import { Fragment, useState, type ReactNode } from 'react'
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

/**
 * Um conteúdo da ilha ou do case, em card: abre ali mesmo (artigo e glossário no próprio card;
 * vídeo e link abrem em outra aba) e pode ser marcado como concluído sem sair da tela.
 */
export function CartaoConteudo({ conteudo, aoConcluir }: { conteudo: Conteudo; aoConcluir?: (c: Conteudo) => void }) {
  const [aberto, setAberto] = useState(false)
  const [concluido, setConcluido] = useState(conteudo.concluido)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const externo = conteudo.tipo === 'video' || conteudo.tipo === 'link'

  const concluir = async () => {
    setOcupado(true)
    setErro('')
    const r = await conteudoService.concluirConteudo(conteudo.id)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
      return
    }
    setConcluido(true)
    aoConcluir?.({ ...conteudo, concluido: true })
    const ganhos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (ganhos > 0) {
      avisarPontos()
      setAviso(`${ganhos} Conteúdo concluído`)
      window.setTimeout(() => setAviso(''), 3500)
    }
  }

  return <article className={`conteudo-card ${concluido ? 'concluido' : ''} ${aberto ? 'aberto' : ''}`} aria-labelledby={`cont-${conteudo.id}`}>
    <div className="trilha-etiquetas">
      <Tag tone="blue">{TIPOS[conteudo.tipo].toUpperCase()}</Tag>
      <span className="conteudo-minutos"><Icon name="clock" size={14}/> {conteudo.minutos} min</span>
      {concluido && <span className="trilha-estado inline-success"><Icon name="check" size={16}/> Concluído</span>}
    </div>
    <h3 id={`cont-${conteudo.id}`}>{conteudo.titulo}</h3>
    <p className="trilha-resumo">{conteudo.resumo}</p>

    {aberto && <div className="conteudo-corpo">
      {conteudo.corpo && <Texto corpo={conteudo.corpo}/>}
      {externo && conteudo.url && <p>O material fica fora da plataforma. <a className="text-link" href={conteudo.url} target="_blank" rel="noopener noreferrer">{conteudo.tipo === 'video' ? 'Assistir ao vídeo' : 'Abrir o link'} (nova aba)</a>. Depois volte aqui e marque como concluído.</p>}
    </div>}

    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
    <div className="trilha-acoes">
      <Button variant={aberto ? 'ghost' : 'primary'} onClick={() => setAberto(a => !a)} pressed={aberto}>{aberto ? 'Fechar' : externo ? 'Ver' : concluido ? 'Rever' : 'Ler'}</Button>
      {!concluido && <Button variant="ghost" onClick={concluir} disabled={ocupado}>{ocupado ? 'Salvando…' : 'Marcar como concluído'}</Button>}
    </div>
    {aviso && <Toast text={aviso} show/>}
  </article>
}
