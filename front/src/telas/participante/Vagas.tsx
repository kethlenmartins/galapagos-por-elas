import { useEffect, useMemo, useState } from 'react'
import './trilha.css'
import { definirIlhaAtual, go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { catalogoService, vagaService, type Area, type TipoVaga, type Vaga } from '../../services'

export const TIPOS_DE_VAGA: Record<TipoVaga, string> = { estagio: 'Estágio', junior: 'Analista júnior', outro: 'Outro' }

/** Vagas reais de estágio e analista júnior, ligadas às áreas das ilhas. A candidatura acontece no site da empresa. */
export function Vagas() {
  const [vagas, setVagas] = useState<Vaga[] | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [erro, setErro] = useState('')
  // Vagas sempre começa em todas as áreas. Herdar a última ilha aberta escondia
  // oportunidades quando aquela área ainda não tinha anúncio publicado.
  const [areaId, setAreaId] = useState('')
  const [tipo, setTipo] = useState<'' | TipoVaga>('')

  useEffect(() => {
    let ativo = true
    Promise.all([vagaService.listarVagas(), catalogoService.listarAreas()]).then(([v, a]) => {
      if (!ativo) return
      const falha = v.erro ?? a.erro
      if (falha || !v.dados || !a.dados) {
        if (falha && !sessaoExpirou(falha)) setErro(falha.mensagem)
        return
      }
      setVagas(v.dados)
      setAreas(a.dados)
    })
    return () => {
      ativo = false
    }
  }, [])

  const nomeDaArea = (id: string) => areas.find(a => a.id === id)?.nome ?? id
  const areasComVaga = useMemo(() => [...new Set((vagas ?? []).map(v => v.areaId))].sort((a, b) => nomeDaArea(a).localeCompare(nomeDaArea(b))), [vagas, areas]) // eslint-disable-line react-hooks/exhaustive-deps
  const visiveis = (vagas ?? []).filter(v => (!areaId || v.areaId === areaId) && (!tipo || v.tipo === tipo))
  const abrirIlha = (id: string) => {
    definirIlhaAtual(id)
    go('island')
  }

  return <AppShell route="jobs"><div className="trilha-page">
    <PageTitle eyebrow="OPORTUNIDADES" title="Vagas" subtitle="Vagas de estágio e analista júnior ligadas às áreas das ilhas. Use o que você aprendeu nos cases e no treino de entrevista para se candidatar." />
    <div className="alert alert-warning" role="note"><p>As vagas são de empresas externas e a candidatura é feita no site delas. Vagas fecham rápido: a data mostra quando a equipe conferiu pela última vez que estava aberta. Nunca pague nem passe dados sensíveis para se candidatar.</p></div>
    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
    {!vagas && !erro && <p role="status" className="diagnostico-estado">Carregando as vagas…</p>}

    {vagas && <>
      <div className="vagas-filtros">
        <label className="field"><span>Área</span>
          <select value={areaId} onChange={e => setAreaId(e.target.value)}>
            <option value="">Todas as áreas</option>
            {areasComVaga.map(id => <option key={id} value={id}>{nomeDaArea(id)}</option>)}
            {areaId && !areasComVaga.includes(areaId) && <option value={areaId}>{nomeDaArea(areaId)}</option>}
          </select>
        </label>
        <label className="field"><span>Tipo</span>
          <select value={tipo} onChange={e => setTipo(e.target.value as '' | TipoVaga)}>
            <option value="">Todos</option>
            {(Object.keys(TIPOS_DE_VAGA) as TipoVaga[]).map(t => <option key={t} value={t}>{TIPOS_DE_VAGA[t]}</option>)}
          </select>
        </label>
      </div>

      {visiveis.length === 0
        ? <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Nenhuma vaga por aqui ainda</h2><p>{vagas.length === 0 ? 'A equipe confere cada vaga antes de publicar. Volte em breve.' : 'Tente outra área ou tipo.'}</p></div>
        : <ul className="vagas-lista" aria-label="Vagas abertas">
            {visiveis.map(v => (
              <li key={v.id}><article className="trilha-card">
                <div className="trilha-etiquetas">
                  <Tag tone="blue">{TIPOS_DE_VAGA[v.tipo].toUpperCase()}</Tag>
                  <button className="text-link" onClick={() => abrirIlha(v.areaId)}>{nomeDaArea(v.areaId)}</button>
                </div>
                <h2>{v.titulo}</h2>
                <p className="trilha-resumo">{v.empresa} · {v.local}</p>
                <div className="trilha-acoes">
                  <a className="btn btn-primary" href={v.url} target="_blank" rel="noopener noreferrer">Ver vaga no site da empresa <Icon name="arrow" size={18} /></a>
                  {v.conferidaEm && <small className="trilha-motivo">Conferida em {new Date(v.conferidaEm).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</small>}
                </div>
              </article></li>
            ))}
          </ul>}
    </>}
  </div></AppShell>
}
