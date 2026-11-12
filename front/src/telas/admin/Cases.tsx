import { useCallback, useEffect, useState } from 'react'
import { irParaEditor } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { AIBadge, PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { adminCasesService, type CaseResumoAdmin, type StatusCaseAdmin } from '../../services'
import { STATUS_CASE } from './statusCase'

export function AdminCases() {
  const [cases, setCases] = useState<CaseResumoAdmin[] | null>(null)
  const [status, setStatus] = useState<'' | StatusCaseAdmin>('')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const r = await adminCasesService.listarCases()
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
      return
    }
    setErro('')
    setCases(r.dados)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const arquivar = async (id: string) => {
    const r = await adminCasesService.arquivarCase(id)
    setConfirmando(null)
    if (r.erro) setErro(r.erro.mensagem)
    else carregar()
  }

  const republicar = async (id: string) => {
    const r = await adminCasesService.publicarCase(id)
    if (r.erro) setErro(r.erro.mensagem)
    else carregar()
  }

  const contar = (s: StatusCaseAdmin[]) => cases?.filter(c => s.includes(c.status)).length ?? 0
  const visiveis = (cases ?? []).filter(c => (!status || c.status === status) && c.titulo.toLowerCase().includes(busca.trim().toLowerCase()))

  return <AppShell route="admin-cases" admin>
    <PageTitle eyebrow="GESTÃO DE CONTEÚDO" title="Cases" subtitle="Crie, revise e publique os cases da trilha." action={<Button onClick={() => irParaEditor()} icon="plus">Novo case</Button>}/>
    {erro && <div className="alert alert-error">{erro}</div>}
    <div className="admin-stats">
      <article><span>Publicados</span><strong>{contar(['publicado'])}</strong><small>Abertos para a trilha</small></article>
      <article><span>Em rascunho</span><strong>{contar(['rascunho_ia', 'rascunho'])}</strong><small>Aguardando revisão</small></article>
      <article><span>Revisados</span><strong>{contar(['revisado'])}</strong><small>Prontos para publicar</small></article>
    </div>
    <section className="table-card">
      <div className="table-toolbar">
        <label><Icon name="search"/><input placeholder="Buscar case..." value={busca} onChange={e => setBusca(e.target.value)}/></label>
        <label className="field"><select aria-label="Filtrar por status" value={status} onChange={e => setStatus(e.target.value as '' | StatusCaseAdmin)}>
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_CASE) as StatusCaseAdmin[]).map(s => <option key={s} value={s}>{STATUS_CASE[s].rotulo}</option>)}
        </select></label>
      </div>
      {!cases ? <p aria-busy="true" className="table-empty">Carregando…</p> : visiveis.length === 0 ? <p className="table-empty">Nenhum case encontrado.</p> :
      <div className="table-scroll"><table><thead><tr><th>Título</th><th>Área</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {visiveis.map(c => <tr key={c.id}>
          <td><strong>{c.titulo}</strong>{c.geradoPorIA && <AIBadge compact admin/>}</td>
          <td>{c.area}</td>
          <td><Tag tone={STATUS_CASE[c.status].tom}>{STATUS_CASE[c.status].rotulo}</Tag></td>
          <td>{confirmando === c.id
            ? <span className="row-confirm">Quem já começou mantém o progresso. <button className="text-link" onClick={() => arquivar(c.id)}>Arquivar</button> <button className="text-link" onClick={() => setConfirmando(null)}>Cancelar</button></span>
            : <span className="row-actions">
              <button className="icon-btn" onClick={() => irParaEditor(c.id)} aria-label={`${c.status === 'publicado' || c.status === 'arquivado' ? 'Ver' : 'Editar'} ${c.titulo}`}><Icon name="edit"/></button>
              {c.status === 'publicado' && <button className="text-link" onClick={() => setConfirmando(c.id)}>Arquivar</button>}
              {c.status === 'arquivado' && <button className="text-link" onClick={() => republicar(c.id)}>Republicar</button>}
            </span>}</td>
        </tr>)}
      </tbody></table></div>}
    </section>
  </AppShell>
}
