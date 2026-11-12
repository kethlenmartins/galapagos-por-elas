import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { go, irParaConteudo, parametroDoHash } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { Toast } from '../../componentes/Aviso'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { avisarPontos } from '../../componentes/Pontos'
import { catalogoService, conteudoService, pontosService } from '../../services'
import type { Area, Conteudo, TipoConteudo } from '../../services'

export const TIPOS: Record<TipoConteudo, string> = { artigo: 'Artigo', video: 'Vídeo', glossario: 'Glossário', link: 'Link externo' }

/** Texto simples: parágrafos separados por linha em branco e **negrito**. Nunca interpreta HTML. */
function Texto({ corpo }: { corpo: string }): ReactNode {
  return corpo.split(/\n{2,}/).map((paragrafo, i) => <p key={i}>{paragrafo.split(/\*\*(.+?)\*\*/g).map((parte, j) => j % 2 ? <strong key={j}>{parte}</strong> : <Fragment key={j}>{parte}</Fragment>)}</p>)
}

export function ContentList() {
  const [conteudos, setConteudos] = useState<Conteudo[] | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [tipo, setTipo] = useState<'' | TipoConteudo>('')
  const [areaId, setAreaId] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    catalogoService.listarAreas().then(r => r.dados && setAreas(r.dados))
  }, [])

  useEffect(() => {
    let ativo = true
    conteudoService.listarConteudos({ tipo: tipo || undefined, areaId: areaId || undefined }).then(r => {
      if (!ativo) return
      if (r.erro) {
        if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
        return
      }
      setErro('')
      setConteudos(r.dados)
    })
    return () => {
      ativo = false
    }
  }, [tipo, areaId])

  const nomeDaArea = (id: string) => areas.find(a => a.id === id)?.nome ?? ''

  return <AppShell route="content"><PageTitle eyebrow="BIBLIOTECA" title="Conteúdos de apoio" subtitle="Materiais curtos para entender cada área e se preparar para os cases."/>
    <div className="table-toolbar content-filters">
      <label className="field"><select aria-label="Filtrar por tipo" value={tipo} onChange={e => setTipo(e.target.value as '' | TipoConteudo)}><option value="">Todos os tipos</option>{(Object.keys(TIPOS) as TipoConteudo[]).map(t => <option key={t} value={t}>{TIPOS[t]}</option>)}</select></label>
      <label className="field"><select aria-label="Filtrar por área" value={areaId} onChange={e => setAreaId(e.target.value)}><option value="">Todas as áreas</option>{areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label>
    </div>
    {erro ? <div className="alert alert-error">{erro}</div> : !conteudos ? <p aria-busy="true">Carregando…</p> : conteudos.length === 0 ? <p className="table-empty">Nenhum conteúdo encontrado com esses filtros.</p> :
      <div className="content-grid">{conteudos.map(c => <button key={c.id} className="content-card-item" onClick={() => irParaConteudo(c.id)}>
        <div className="card-top"><Tag>{TIPOS[c.tipo].toUpperCase()}</Tag>{c.concluido && <span className="inline-success"><Icon name="check" size={16}/> Concluído</span>}</div>
        <h3>{c.titulo}</h3><p>{c.resumo}</p>
        <small><Icon name="clock" size={14}/> {c.minutos} min · {nomeDaArea(c.areaId)}</small></button>)}</div>}
  </AppShell>
}

export function ContentPage() {
  const id = parametroDoHash('id')
  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [pontos, setPontos] = useState<number | null>(null)
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (!id) {
      setMensagem('Conteúdo não encontrado.')
      return setFase('erro')
    }
    Promise.all([conteudoService.obterConteudo(id), pontosService.listarRegrasDePontos()]).then(([c, r]) => {
      if (c.erro) {
        if (!sessaoExpirou(c.erro)) {
          setMensagem(c.erro.mensagem)
          setFase('erro')
        }
        return
      }
      setConteudo(c.dados)
      setPontos(r.dados?.find(x => x.id === 'conteudo')?.pontos ?? null)
      setFase('ok')
    })
  }, [id])

  const concluir = async () => {
    if (!conteudo) return
    setOcupado(true)
    const r = await conteudoService.concluirConteudo(conteudo.id)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setMensagem(r.erro.mensagem)
      return
    }
    setConteudo({ ...conteudo, concluido: true })
    const ganhos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (ganhos > 0) {
      avisarPontos()
      setAviso(`${ganhos} Conteúdo concluído`)
      setTimeout(() => setAviso(''), 3500)
    }
  }

  const deCase = parametroDoHash('de') === 'case'
  const voltar = <button className="back-link" onClick={() => go(deCase ? 'case' : 'content')}>{deCase ? '← Voltar para o case' : '← Voltar para os conteúdos'}</button>
  if (fase === 'carregando') return <AppShell route="content-item"><p aria-busy="true">Carregando…</p></AppShell>
  if (fase === 'erro' || !conteudo) return <AppShell route="content-item"><div className="content-page">{voltar}<div className="alert alert-error">{mensagem}</div></div></AppShell>

  const externo = conteudo.tipo === 'video' || conteudo.tipo === 'link'
  return <AppShell route="content-item"><div className="content-page">{voltar}<div className="article-layout"><article>
    <div className="article-head"><Tag>{TIPOS[conteudo.tipo].toUpperCase()}</Tag><span><Icon name="clock" size={16}/> {conteudo.minutos} min</span><h1>{conteudo.titulo}</h1><p>{conteudo.resumo}</p></div>
    <div className="article-body">
      {conteudo.corpo && <Texto corpo={conteudo.corpo}/>}
      {externo && conteudo.url && <div className="term-box"><span>{conteudo.tipo === 'video' ? 'VÍDEO' : 'LINK EXTERNO'}</span><h3>Abra o material em uma nova aba</h3><p>Ele fica fora da plataforma. Volte aqui para marcar como concluído.</p><a className="text-link" href={conteudo.url} target="_blank" rel="noopener noreferrer">Abrir material →</a></div>}
    </div></article>
    <aside><div className="article-side"><span className="eyebrow">SEU PROGRESSO</span><h3>{conteudo.concluido ? 'Conteúdo concluído' : 'Conclua para ganhar pontos'}</h3>
      <p>{conteudo.concluido ? 'Ótimo trabalho. Os pontos estão no seu extrato.' : 'Marque este conteúdo como concluído quando terminar.'}</p>
      {pontos !== null && <div className="point-value"><Icon name="spark"/><strong>+{pontos} pontos</strong></div>}
      <Button onClick={concluir} disabled={conteudo.concluido || ocupado}>{conteudo.concluido ? 'Concluído' : 'Marcar como concluído'}</Button></div></aside></div>
    {aviso && <Toast text={aviso} show/>}</div></AppShell>
}
