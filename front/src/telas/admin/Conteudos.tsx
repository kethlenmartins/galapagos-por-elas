import { useCallback, useEffect, useState } from 'react'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { adminCasesService, adminConteudosService, catalogoService } from '../../services'
import type { Area, CaseResumoAdmin, ConteudoAdmin, ErroServico, TipoConteudo } from '../../services'
import { TIPOS } from '../participante/Conteudo'

type Rascunho = Omit<ConteudoAdmin, 'id'> & { id?: string }
const VAZIO: Rascunho = { titulo: '', tipo: 'artigo', areaId: '', resumo: '', corpo: '', url: '', minutos: 5, caseIds: [] }

function Formulario({ inicial, areas, cases, aoSalvar, aoFechar }: {
  inicial: Rascunho; areas: Area[]; cases: CaseResumoAdmin[]; aoSalvar: () => void; aoFechar: () => void
}) {
  const [c, setC] = useState(inicial)
  const [erro, setErro] = useState<ErroServico | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const campos = erro?.campos ?? {}
  const externo = c.tipo === 'video' || c.tipo === 'link'
  const alterar = (parcial: Partial<Rascunho>) => setC(atual => ({ ...atual, ...parcial }))

  const salvar = async () => {
    setOcupado(true)
    // Só envia o campo que faz sentido para o tipo, para não guardar lixo de uma troca de tipo.
    const r = await adminConteudosService.salvarConteudo({ ...c, corpo: externo ? null : c.corpo, url: externo ? c.url : null })
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro)
      return
    }
    aoSalvar()
  }

  return <div className="modal-backdrop"><div className="modal modal-wide" role="dialog" aria-modal="true" aria-label={c.id ? 'Editar conteúdo' : 'Novo conteúdo'}>
    <button className="modal-close" onClick={aoFechar} aria-label="Fechar"><Icon name="close"/></button>
    <h2>{c.id ? 'Editar conteúdo' : 'Novo conteúdo'}</h2>
    <div className="form-stack">
      <Field label="Título" value={c.titulo} onChange={v => alterar({ titulo: v })} error={campos.titulo}/>
      <div className="form-row">
        <label className="field"><span>Tipo</span><select value={c.tipo} onChange={e => alterar({ tipo: e.target.value as TipoConteudo })}>{(Object.keys(TIPOS) as TipoConteudo[]).map(t => <option key={t} value={t}>{TIPOS[t]}</option>)}</select></label>
        <label className={`field ${campos.areaId ? 'field-error' : ''}`}><span>Área</span><select value={c.areaId} onChange={e => alterar({ areaId: e.target.value })}><option value="" disabled>Selecione</option>{areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>{campos.areaId && <small className="error-text">{campos.areaId}</small>}</label>
      </div>
      <Field label="Resumo (aparece na lista)" value={c.resumo} onChange={v => alterar({ resumo: v })}/>
      <Field label="Tempo estimado (minutos)" type="number" value={String(c.minutos)} onChange={v => alterar({ minutos: Number(v) })} error={campos.minutos}/>
      {externo
        ? <Field label="Link" placeholder="https://" value={c.url ?? ''} onChange={v => alterar({ url: v })} error={campos.url}/>
        : <label className={`field ${campos.corpo ? 'field-error' : ''}`}><span>Texto</span><textarea rows={7} value={c.corpo ?? ''} onChange={e => alterar({ corpo: e.target.value })}/><small>Separe os parágrafos com uma linha em branco. Use **assim** para negrito.</small>{campos.corpo && <small className="error-text">{campos.corpo}</small>}</label>}
      <fieldset className="field"><legend>Vincular aos cases</legend>
        {cases.length === 0 ? <small>Nenhum case ainda.</small> : cases.map(k => <label className="checkbox" key={k.id}><input type="checkbox" checked={c.caseIds.includes(k.id)} onChange={e => alterar({ caseIds: e.target.checked ? [...c.caseIds, k.id] : c.caseIds.filter(id => id !== k.id) })}/><span>{k.titulo}</span></label>)}</fieldset>
      {erro && !erro.campos && <div className="alert alert-error">{erro.mensagem}</div>}
      <Button onClick={salvar} disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar conteúdo'}</Button>
    </div></div></div>
}

export function AdminContent() {
  const [lista, setLista] = useState<ConteudoAdmin[] | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [cases, setCases] = useState<CaseResumoAdmin[]>([])
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<'' | TipoConteudo>('')
  const [editando, setEditando] = useState<Rascunho | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tom: 'success' | 'error'; texto: string } | null>(null)

  const carregar = useCallback(async () => {
    const r = await adminConteudosService.listarConteudosAdmin()
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setAviso({ tom: 'error', texto: r.erro.mensagem })
      return
    }
    setLista(r.dados)
  }, [])

  useEffect(() => {
    carregar()
    catalogoService.listarAreas().then(r => r.dados && setAreas(r.dados))
    adminCasesService.listarCases().then(r => r.dados && setCases(r.dados))
  }, [carregar])

  const remover = async (id: string) => {
    const r = await adminConteudosService.removerConteudo(id)
    setRemovendo(null)
    if (r.erro) return setAviso({ tom: 'error', texto: r.erro.mensagem })
    setAviso({ tom: 'success', texto: 'Conteúdo removido.' })
    carregar()
  }

  const visiveis = (lista ?? []).filter(c => (!tipo || c.tipo === tipo) && c.titulo.toLowerCase().includes(busca.trim().toLowerCase()))
  const nomeDaArea = (id: string) => areas.find(a => a.id === id)?.nome ?? id

  return <AppShell route="admin-content" admin>
    <PageTitle eyebrow="BIBLIOTECA" title="Conteúdos" subtitle="Gerencie os materiais de apoio das participantes." action={<Button onClick={() => setEditando(VAZIO)} icon="plus">Novo conteúdo</Button>}/>
    {aviso && <div className={`alert alert-${aviso.tom}`} role="status">{aviso.texto}</div>}
    <section className="table-card">
      <div className="table-toolbar"><label><Icon name="search"/><input placeholder="Buscar conteúdo..." value={busca} onChange={e => setBusca(e.target.value)}/></label>
        <label className="field"><select aria-label="Filtrar por tipo" value={tipo} onChange={e => setTipo(e.target.value as '' | TipoConteudo)}><option value="">Todos os tipos</option>{(Object.keys(TIPOS) as TipoConteudo[]).map(t => <option key={t} value={t}>{TIPOS[t]}</option>)}</select></label></div>
      {!lista ? <p aria-busy="true" className="table-empty">Carregando…</p> : visiveis.length === 0 ? <p className="table-empty">Nenhum conteúdo encontrado.</p> :
        <div className="table-scroll"><table><thead><tr><th>Título</th><th>Tipo</th><th>Área</th><th>Vinculado a</th><th>Ações</th></tr></thead><tbody>
          {visiveis.map(c => <tr key={c.id}><td><strong>{c.titulo}</strong></td><td><Tag>{TIPOS[c.tipo]}</Tag></td><td>{nomeDaArea(c.areaId)}</td><td>{c.caseIds.length} {c.caseIds.length === 1 ? 'case' : 'cases'}</td>
            <td>{removendo === c.id ? <span className="row-confirm">Remover de vez? <button className="text-link" onClick={() => remover(c.id)}>Remover</button> <button className="text-link" onClick={() => setRemovendo(null)}>Cancelar</button></span>
              : <span className="row-actions"><button className="icon-btn" onClick={() => setEditando(c)} aria-label={`Editar ${c.titulo}`}><Icon name="edit"/></button><button className="text-link" onClick={() => setRemovendo(c.id)}>Remover</button></span>}</td></tr>)}
        </tbody></table></div>}
    </section>
    {editando && <Formulario key={editando.id ?? 'novo'} inicial={editando} areas={areas} cases={cases} aoFechar={() => setEditando(null)} aoSalvar={() => { setEditando(null); setAviso({ tom: 'success', texto: 'Conteúdo salvo.' }); carregar() }}/>}
  </AppShell>
}
