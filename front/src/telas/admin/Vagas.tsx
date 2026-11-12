import { useCallback, useEffect, useState } from 'react'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { adminVagasService, catalogoService, type Area, type ErroServico, type StatusVaga, type TipoVaga, type VagaAdmin } from '../../services'
import { TIPOS_DE_VAGA } from '../participante/Vagas'

type Rascunho = Omit<VagaAdmin, 'id' | 'status' | 'conferidaEm'> & { id?: string }
const VAZIO: Rascunho = { areaId: '', empresa: '', titulo: '', local: '', tipo: 'estagio', url: '', observacao: null }
const STATUS: Record<StatusVaga, { rotulo: string; tom: 'yellow' | 'green' | 'gray' }> = {
  rascunho: { rotulo: 'Para conferir', tom: 'yellow' },
  aberta: { rotulo: 'Publicada', tom: 'green' },
  encerrada: { rotulo: 'Encerrada', tom: 'gray' },
}

function Formulario({ inicial, areas, aoSalvar, aoFechar }: { inicial: Rascunho; areas: Area[]; aoSalvar: () => void; aoFechar: () => void }) {
  const [v, setV] = useState(inicial)
  const [erro, setErro] = useState<ErroServico | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const campos = erro?.campos ?? {}
  const alterar = (parcial: Partial<Rascunho>) => setV(atual => ({ ...atual, ...parcial }))

  const salvar = async () => {
    setOcupado(true)
    const r = await adminVagasService.salvarVaga(v)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro)
      return
    }
    aoSalvar()
  }

  return <div className="modal-backdrop"><div className="modal modal-wide" role="dialog" aria-modal="true" aria-label={v.id ? 'Editar vaga' : 'Nova vaga'}>
    <button className="modal-close" onClick={aoFechar} aria-label="Fechar"><Icon name="close"/></button>
    <h2>{v.id ? 'Editar vaga' : 'Nova vaga'}</h2>
    <div className="form-stack">
      <Field label="Nome da vaga" value={v.titulo} onChange={x => alterar({ titulo: x })} error={campos.titulo}/>
      <div className="form-row">
        <Field label="Empresa" value={v.empresa} onChange={x => alterar({ empresa: x })} error={campos.empresa}/>
        <Field label="Local" value={v.local} onChange={x => alterar({ local: x })} error={campos.local}/>
      </div>
      <div className="form-row">
        <label className="field"><span>Tipo</span><select value={v.tipo} onChange={e => alterar({ tipo: e.target.value as TipoVaga })}>{(Object.keys(TIPOS_DE_VAGA) as TipoVaga[]).map(t => <option key={t} value={t}>{TIPOS_DE_VAGA[t]}</option>)}</select></label>
        <label className={`field ${campos.areaId ? 'field-error' : ''}`}><span>Área</span><select value={v.areaId} onChange={e => alterar({ areaId: e.target.value })}><option value="" disabled>Selecione</option>{areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>{campos.areaId && <small>{campos.areaId}</small>}</label>
      </div>
      <Field label="Link da vaga" placeholder="https://" value={v.url} onChange={x => alterar({ url: x })} error={campos.url}/>
      <label className="field"><span>Observação interna (a participante não vê)</span><textarea rows={2} value={v.observacao ?? ''} onChange={e => alterar({ observacao: e.target.value || null })}/></label>
      <small>Depois de salvar, abra o link, confira que a vaga está aberta e use “Conferi, publicar”.</small>
      {erro && !erro.campos && <div className="alert alert-error">{erro.mensagem}</div>}
      <Button onClick={salvar} disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar vaga'}</Button>
    </div></div></div>
}

/** Conferência e publicação das vagas: nada aparece para as participantes sem a equipe conferir que está aberta. */
export function AdminVagas() {
  const [lista, setLista] = useState<VagaAdmin[] | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [status, setStatus] = useState<'' | StatusVaga>('rascunho')
  const [editando, setEditando] = useState<Rascunho | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tom: 'success' | 'error'; texto: string } | null>(null)

  const carregar = useCallback(async () => {
    const r = await adminVagasService.listarVagasAdmin()
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setAviso({ tom: 'error', texto: r.erro.mensagem })
      return
    }
    setLista(r.dados)
  }, [])

  useEffect(() => {
    carregar()
    catalogoService.listarAreas().then(r => r.dados && setAreas(r.dados))
  }, [carregar])

  const agir = async (acao: Promise<{ erro: ErroServico | null }>, texto: string) => {
    const r = await acao
    setRemovendo(null)
    if (r.erro) return setAviso({ tom: 'error', texto: r.erro.mensagem })
    setAviso({ tom: 'success', texto })
    carregar()
  }

  const nomeDaArea = (id: string) => areas.find(a => a.id === id)?.nome ?? id
  const visiveis = (lista ?? []).filter(v => !status || v.status === status)

  return <AppShell route="admin-jobs" admin>
    <PageTitle eyebrow="OPORTUNIDADES" title="Vagas" subtitle="Confira cada vaga no site da empresa e publique. Só as publicadas aparecem para as participantes." action={<Button onClick={() => setEditando(VAZIO)} icon="plus">Nova vaga</Button>}/>
    {aviso && <div className={`alert alert-${aviso.tom}`} role="status">{aviso.texto}</div>}
    <section className="table-card">
      <div className="table-toolbar">
        <label className="field"><select aria-label="Filtrar por status" value={status} onChange={e => setStatus(e.target.value as '' | StatusVaga)}><option value="">Todas</option>{(Object.keys(STATUS) as StatusVaga[]).map(s => <option key={s} value={s}>{STATUS[s].rotulo}</option>)}</select></label>
      </div>
      {!lista ? <p aria-busy="true" className="table-empty">Carregando…</p> : visiveis.length === 0 ? <p className="table-empty">Nenhuma vaga neste filtro.</p> :
        <div className="table-scroll"><table><thead><tr><th>Vaga</th><th>Área</th><th>Status</th><th>Conferida em</th><th>Ações</th></tr></thead><tbody>
          {visiveis.map(v => <tr key={v.id}>
            <td><strong>{v.titulo}</strong><br/><small>{v.empresa} · {v.local} · {TIPOS_DE_VAGA[v.tipo]}</small><br/><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-link">Abrir o link para conferir</a></td>
            <td>{nomeDaArea(v.areaId)}</td>
            <td><Tag tone={STATUS[v.status].tom}>{STATUS[v.status].rotulo.toUpperCase()}</Tag></td>
            <td>{v.conferidaEm ? new Date(v.conferidaEm).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}</td>
            <td>{removendo === v.id
              ? <span className="row-confirm">Remover de vez? <button className="text-link" onClick={() => agir(adminVagasService.removerVaga(v.id), 'Vaga removida.')}>Remover</button> <button className="text-link" onClick={() => setRemovendo(null)}>Cancelar</button></span>
              : <span className="row-actions">
                  {v.status !== 'aberta' && <button className="text-link" onClick={() => agir(adminVagasService.publicarVaga(v.id), 'Vaga publicada com a conferência de hoje.')}>Conferi, publicar</button>}
                  {v.status === 'aberta' && <button className="text-link" onClick={() => agir(adminVagasService.encerrarVaga(v.id), 'Vaga encerrada.')}>Encerrar</button>}
                  <button className="icon-btn" onClick={() => setEditando(v)} aria-label={`Editar ${v.titulo}`}><Icon name="edit"/></button>
                  <button className="text-link" onClick={() => setRemovendo(v.id)}>Remover</button>
                </span>}</td>
          </tr>)}
        </tbody></table></div>}
    </section>
    {editando && <Formulario key={editando.id ?? 'nova'} inicial={editando} areas={areas} aoFechar={() => setEditando(null)} aoSalvar={() => { setEditando(null); setAviso({ tom: 'success', texto: 'Vaga salva. Confira o link e publique.' }); carregar() }}/>}
  </AppShell>
}
