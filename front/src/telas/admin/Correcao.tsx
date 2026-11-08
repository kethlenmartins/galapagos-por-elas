import { useCallback, useEffect, useState } from 'react'
import { dataEHora } from '../../app/formatos'
import { sessaoExpirou } from '../../app/sessao'
import { AIBadge, PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { adminCorrecaoService } from '../../services'
import type { DetalheEntregaAdmin, EntregaResumoAdmin, ErroServico, PedidoRevisaoAdmin, StatusEntrega } from '../../services'

const STATUS: Record<StatusEntrega, { rotulo: string; tom: 'yellow' | 'blue' | 'green' }> = {
  pendente: { rotulo: 'Pendente', tom: 'yellow' },
  revisada: { rotulo: 'Aprovada', tom: 'blue' },
  publicada: { rotulo: 'Publicada', tom: 'green' },
}
const RESULTADO = { correta: { rotulo: 'Correta', tom: 'green' }, parcial: { rotulo: 'Parcial', tom: 'yellow' }, incorreta: { rotulo: 'Incorreta', tom: 'gray' } } as const

const nota = (n: number | null) => (n === null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }))
const iniciais = (nome: string) => nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
/** "8,7" ou "8.7" viram número; vazio ou texto viram `null`. */
const lerNota = (t: string) => {
  const n = Number(t.replace(',', '.'))
  return t.trim() === '' || !Number.isFinite(n) ? null : n
}

function Detalhe({ detalhe, aoMudar, aoFalhar }: { detalhe: DetalheEntregaAdmin; aoMudar: (d: DetalheEntregaAdmin, aviso: string) => void; aoFalhar: (e: ErroServico) => void }) {
  const [textoNota, setTextoNota] = useState(String(detalhe.notaFinal ?? detalhe.sugestao.notaSugerida ?? '').replace('.', ','))
  const [feedback, setFeedback] = useState(detalhe.feedbackFinal ?? detalhe.sugestao.feedbackGeral)
  const [ocupado, setOcupado] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const s = detalhe.sugestao
  const publicada = detalhe.status === 'publicada'
  const manual = s.origem === 'manual'

  const ajustar = async () => {
    const n = lerNota(textoNota)
    if (n === null) {
      setErros({ notaFinal: 'Digite a nota de 0 a 10.' })
      return null
    }
    setOcupado(true)
    const r = await adminCorrecaoService.ajustarNotaEFeedback({ entregaId: detalhe.id, notaFinal: n, feedback })
    setOcupado(false)
    if (r.erro) {
      setErros(r.erro.campos ?? {})
      aoFalhar(r.erro)
      return null
    }
    setErros({})
    return r.dados
  }

  const salvar = async () => {
    const d = await ajustar()
    if (d) aoMudar(d, 'Ajuste salvo. A participante ainda não vê este resultado.')
  }
  const aprovar = async () => {
    if (!(await ajustar())) return
    setOcupado(true)
    const r = await adminCorrecaoService.aprovarNota(detalhe.id)
    setOcupado(false)
    if (r.erro) return aoFalhar(r.erro)
    aoMudar(r.dados, 'Nota aprovada. A participante só vê o resultado quando você publicar.')
  }

  return <section className="review-detail">
    <div className="review-detail-head"><div><Tag>{detalhe.participanteNome.toUpperCase()}</Tag><h2>{detalhe.caseTitulo}</h2><small>Enviada em {dataEHora(detalhe.enviadaEm)}</small></div>
      <span>{manual ? 'Correção manual' : <>Nota sugerida <AIBadge compact admin/></>}<strong>{nota(s.notaSugerida)}</strong></span></div>

    {manual && <div className="alert alert-warning"><Icon name="clock"/><div><strong>A IA não estava disponível</strong><p>Só a parte numérica foi conferida por código. Defina a nota final a partir das respostas abaixo.</p></div></div>}

    {detalhe.respostas.map(r => <div key={r.tarefaId} className="answer-compare">
      <div><span className="eyebrow">RESPOSTA · {r.titulo.toUpperCase()}</span>
        {Object.entries(r.respostas).map(([campo, valor]) => <p key={campo}><strong>{s.itens.find(i => i.campoId === campo)?.rotulo ?? campo}:</strong> {valor === null || valor === '' ? <em>em branco</em> : String(valor)}</p>)}</div>
      <div><span className="eyebrow">SUGESTÃO DA IA</span><p>{s.feedbackPorTarefa.find(f => f.tarefaId === r.tarefaId)?.feedback ?? 'Sem comentário para esta tarefa.'}</p></div>
    </div>)}

    {s.itens.length > 0 && <div className="table-scroll"><table><caption>Conferência numérica (feita por código)</caption><thead><tr><th>Item</th><th>Resposta</th><th>Esperado</th><th>Resultado</th><th>Pontos</th></tr></thead>
      <tbody>{s.itens.map(i => <tr key={`${i.tarefaId}-${i.campoId}`}><td>{i.rotulo}</td>
        <td>{i.resposta || '—'}{i.formatoForaDoPadrao && <> <Tag tone="yellow">FORMATO FORA DO PADRÃO</Tag></>}</td>
        <td>{i.valorEsperado} ± {i.tolerancia} {i.unidade}</td><td><Tag tone={RESULTADO[i.resultado].tom}>{RESULTADO[i.resultado].rotulo}</Tag></td><td>{nota(i.pontos)} / {nota(i.maxPontos)}</td></tr>)}</tbody></table></div>}

    <div className="score-breakdown">
      <div><span>Conferido por código</span><strong>{nota(s.notaCodigo)} / {nota(s.maxCodigo)}</strong><small>Número dentro da tolerância</small></div>
      <div><span>Interpretação da IA</span><strong>{s.notaIA === null ? 'Indisponível' : `${nota(s.notaIA)} / ${nota(s.maxIA)}`}</strong><small>Argumentação e clareza</small></div>
    </div>
    {(s.pontosFortes.length > 0 || s.pontosAMelhorar.length > 0) && <div className="answer-compare">
      <div><span className="eyebrow">PONTOS FORTES</span><ul>{s.pontosFortes.map(p => <li key={p}>{p}</li>)}</ul></div>
      <div><span className="eyebrow">A MELHORAR</span><ul>{s.pontosAMelhorar.map(p => <li key={p}>{p}</li>)}</ul></div></div>}

    <div className="grade-form">
      {publicada ? <p>Resultado publicado com nota <strong>{nota(detalhe.notaFinal)}</strong>. Mudanças só por pedido de revisão.</p> : <>
        <div className="form-row"><Field label="Nota final (0 a 10)" value={textoNota} onChange={setTextoNota} error={erros.notaFinal}/>
          <div className="field"><span>Situação</span><Tag tone={STATUS[detalhe.status].tom}>{STATUS[detalhe.status].rotulo}</Tag></div></div>
        <label className="field"><span>Feedback para a participante</span><textarea rows={5} value={feedback} onChange={e => setFeedback(e.target.value)}/></label>
        <div className="editor-actions"><Button variant="ghost" onClick={salvar} disabled={ocupado}>Salvar ajuste</Button><Button onClick={aprovar} disabled={ocupado}>{detalhe.status === 'revisada' ? 'Aprovar de novo' : 'Aprovar nota'}</Button></div>
        {detalhe.status === 'revisada' && <span className="inline-success"><Icon name="check"/> Aprovada. A participante ainda não vê este resultado.</span>}</>}
    </div>
  </section>
}

function PedidoCard({ pedido, aoResolver }: { pedido: PedidoRevisaoAdmin; aoResolver: (id: string, resposta: string, novaNota?: number) => Promise<string | null> }) {
  const [resposta, setResposta] = useState('')
  const [novaNota, setNovaNota] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const resolvido = pedido.status === 'resolvido'
  const enviar = async () => {
    const n = novaNota.trim() === '' ? undefined : lerNota(novaNota)
    if (n === null) return setErro('A nova nota vai de 0 a 10.')
    setErro(await aoResolver(pedido.id, resposta, n))
  }
  return <article className="content-card pedido-card">
    <div className="editor-task-head"><div><strong>{pedido.participanteNome}</strong><small> · {pedido.caseTitulo}</small></div><Tag tone={resolvido ? 'green' : 'yellow'}>{resolvido ? 'Resolvido' : 'Aberto'}</Tag></div>
    <p>“{pedido.motivo}”</p><small>Pedido em {dataEHora(pedido.criadoEm)}</small>
    {!resolvido && <>
      <label className="field"><span>Resposta para a participante</span><textarea rows={3} value={resposta} onChange={e => setResposta(e.target.value)}/></label>
      {pedido.entregaId && <Field label="Nova nota (opcional)" hint="Deixe em branco para manter a nota publicada." value={novaNota} onChange={setNovaNota}/>}
      {erro && <div className="alert alert-error">{erro}</div>}
      <div><Button onClick={enviar}>Resolver pedido</Button></div></>}
  </article>
}

export function AdminReview() {
  const [aba, setAba] = useState<'entregas' | 'pedidos'>('entregas')
  const [entregas, setEntregas] = useState<EntregaResumoAdmin[] | null>(null)
  const [pedidos, setPedidos] = useState<PedidoRevisaoAdmin[]>([])
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<DetalheEntregaAdmin | null>(null)
  const [aviso, setAviso] = useState<{ tom: 'success' | 'error'; texto: string } | null>(null)

  const falhou = useCallback((e: ErroServico) => {
    if (!sessaoExpirou(e)) setAviso({ tom: 'error', texto: e.mensagem })
  }, [])

  const carregar = useCallback(async () => {
    const [e, p] = await Promise.all([adminCorrecaoService.listarEntregas(), adminCorrecaoService.listarPedidosRevisao()])
    if (e.erro || p.erro) return falhou((e.erro ?? p.erro)!)
    setEntregas(e.dados)
    setPedidos(p.dados)
  }, [falhou])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    setDetalhe(null)
    if (!selecionada) return
    let ativo = true
    adminCorrecaoService.obterEntregaComSugestaoIA(selecionada).then(r => {
      if (!ativo) return
      if (r.erro) falhou(r.erro)
      else setDetalhe(r.dados)
    })
    return () => {
      ativo = false
    }
  }, [selecionada, falhou])

  const lista = entregas ?? []
  const pendentes = lista.filter(e => e.status === 'pendente').length
  const aprovadas = lista.filter(e => e.status === 'revisada').length
  const abertos = pedidos.filter(p => p.status === 'aberto').length

  const publicar = async () => {
    const r = await adminCorrecaoService.publicarResultados()
    if (r.erro) return falhou(r.erro)
    setAviso({ tom: 'success', texto: `${r.dados.publicados} ${r.dados.publicados === 1 ? 'resultado publicado' : 'resultados publicados'}. As participantes já veem a nota, os pontos e o certificado.` })
    setSelecionada(null)
    carregar()
  }

  const resolver = async (id: string, resposta: string, novaNota?: number) => {
    const r = await adminCorrecaoService.resolverPedidoRevisao(id, { resposta, novaNota })
    if (r.erro) return r.erro.mensagem
    setAviso({ tom: 'success', texto: 'Pedido resolvido.' })
    carregar()
    return null
  }

  const acaoPublicar = pendentes > 0 ? <Button variant="ghost" disabled>{pendentes} {pendentes === 1 ? 'entrega falta' : 'entregas faltam'} aprovar</Button>
    : aprovadas > 0 ? <Button onClick={publicar}>Publicar {aprovadas} {aprovadas === 1 ? 'resultado' : 'resultados'}</Button>
    : <Button variant="ghost" disabled>Nada para publicar</Button>

  return <AppShell route="admin-review" admin>
    <PageTitle eyebrow="AVALIAÇÃO" title="Fila de correção" subtitle="Revise as sugestões da IA antes de publicar os resultados." action={acaoPublicar}/>
    {aviso && <div className={`alert alert-${aviso.tom}`} role="status">{aviso.texto}</div>}
    <div className="review-tabs"><button className={aba === 'entregas' ? 'active' : ''} onClick={() => setAba('entregas')}>Entregas <span>{lista.length}</span></button>
      <button className={aba === 'pedidos' ? 'active' : ''} onClick={() => setAba('pedidos')}>Pedidos de revisão <span>{abertos}</span></button></div>

    {aba === 'entregas' && (!entregas ? <p aria-busy="true">Carregando…</p> : lista.length === 0 ? <p className="table-empty">Nenhuma entrega ainda.</p> :
      <div className="review-layout"><section className="review-queue"><div className="queue-head"><strong>{pendentes} {pendentes === 1 ? 'pendente' : 'pendentes'}</strong><small>{lista.length} no total</small></div>
        {lista.map(e => <button key={e.id} className={selecionada === e.id ? 'active' : ''} onClick={() => setSelecionada(e.id)}><span className="initials">{iniciais(e.participanteNome)}</span>
          <div><strong>{e.participanteNome}</strong><small>{e.caseTitulo}</small></div><span><b>{nota(e.notaFinal ?? e.notaSugerida)}</b><small>{STATUS[e.status].rotulo}</small></span></button>)}</section>
        {detalhe ? <Detalhe key={detalhe.id} detalhe={detalhe} aoFalhar={falhou} aoMudar={(d, texto) => { setDetalhe(d); setAviso({ tom: 'success', texto }); carregar() }}/>
          : <section className="review-detail"><p className="table-empty">{selecionada ? 'Carregando…' : 'Escolha uma entrega na lista para revisar.'}</p></section>}</div>)}

    {aba === 'pedidos' && (pedidos.length === 0 ? <p className="table-empty">Nenhum pedido de revisão.</p> : <div className="pedidos">{pedidos.map(p => <PedidoCard key={p.id} pedido={p} aoResolver={resolver}/>)}</div>)}
  </AppShell>
}
