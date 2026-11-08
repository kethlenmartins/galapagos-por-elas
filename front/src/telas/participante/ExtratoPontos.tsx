import { useEffect, useState } from 'react'
import { dataDoEvento } from '../../app/formatos'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { LevelCard } from '../../componentes/CartaoNivel'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { pontosService, type EventoPontos, type RegraDePontos } from '../../services'

export function PointsStatement() {
  const [periodo, setPeriodo] = useState('30')
  const [eventos, setEventos] = useState<EventoPontos[] | null>(null)
  const [regras, setRegras] = useState<RegraDePontos[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    setEventos(null)
    pontosService.listarExtrato(periodo === 'all' ? undefined : { dias: Number(periodo) }).then(r => {
      if (!ativo) return
      if (r.erro) {
        if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
        return
      }
      setErro('')
      setEventos(r.dados)
    })
    return () => {
      ativo = false
    }
  }, [periodo])

  useEffect(() => {
    pontosService.listarRegrasDePontos().then(r => r.dados && setRegras(r.dados))
  }, [])

  return <AppShell route="points"><PageTitle eyebrow="SUA EVOLUÇÃO" title="Extrato de pontos" subtitle="Acompanhe cada passo que fez você avançar."/><LevelCard/>
    <section className="points-history content-card"><div className="section-title-row"><div><h2>Histórico</h2><p>Seus pontos são concedidos automaticamente pelas ações concluídas.</p></div>
      <label className="field"><span>Período</span><select value={periodo} onChange={e => setPeriodo(e.target.value)}><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Todo o período</option></select></label></div>
      {erro ? <div className="alert alert-error">{erro}</div>
        : !eventos ? <p aria-busy="true">Carregando…</p>
        : eventos.length === 0 ? <div className="empty-state compact-empty"><span><Icon name="spark" size={30}/></span><h3>{periodo === 'all' ? 'Você ainda não ganhou pontos' : 'Nenhum ponto neste período'}</h3><p>{periodo === 'all' ? 'Comece pelo diagnóstico e dê o primeiro passo da sua jornada.' : 'Escolha um período maior para ver o histórico completo.'}</p>{periodo === 'all' && <Button onClick={() => go('diagnostic')}>Fazer diagnóstico</Button>}</div>
        : <div className="points-table">{eventos.map(e => <div className="points-row" key={e.id}><span className="activity-icon"><Icon name="spark" size={17}/></span><div><strong>{e.acao}</strong><small>{e.origem}</small></div><time>{dataDoEvento(e.data)}</time><b>{e.pontos > 0 ? '+' : ''}{e.pontos} pts</b></div>)}</div>}
    </section>
    <details className="earning-guide content-card"><summary>Como ganhar pontos <Icon name="chevron"/></summary><div className="earning-grid">{regras.map(r => <div key={r.id}><span>{r.acao}</span><strong>{r.id === 'resultado' ? 'até ' : '+'}{r.pontos} pts</strong></div>)}</div></details></AppShell>
}
