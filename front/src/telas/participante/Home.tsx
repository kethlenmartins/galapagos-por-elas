import { useEffect, useState } from 'react'
import { definirCaseAtual, definirIlhaAtual, go } from '../../app/rotas'
import { sessaoExpirou, useSessao } from '../../app/sessao'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { LevelCard } from '../../componentes/CartaoNivel'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { caseService, diagnosticoService, pontosService } from '../../services'
import type { AfinidadeArea, EventoPontos, ItemTrilha, TrilhaDaUsuaria } from '../../services'

type Dados = { trilha: TrilhaDaUsuaria; top3: AfinidadeArea[]; eventos: EventoPontos[] }

/** O case que a Home destaca: o que ela está fazendo; senão o que está em avaliação. */
const casePrincipal = (cases: ItemTrilha[]) =>
  cases.find(c => c.estado === 'em_andamento') ?? cases.find(c => c.estado === 'em_avaliacao') ?? null

export function Home() {
  const { sessao } = useSessao()
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    Promise.all([caseService.obterTrilha(), diagnosticoService.obterResultadoDiagnostico(), pontosService.listarExtrato()]).then(([t, d, e]) => {
      if (!ativo) return
      const falha = t.erro ?? e.erro
      if (falha || !t.dados || !e.dados) {
        if (falha && !sessaoExpirou(falha)) setErro(falha.mensagem)
        return
      }
      // Sem diagnóstico o resultado vem com erro NAO_ENCONTRADO: a Home só mostra o convite.
      setDados({ trilha: t.dados, top3: d.dados?.areas.slice(0, 3) ?? [], eventos: e.dados.slice(0, 3) })
    })
    return () => {
      ativo = false
    }
  }, [])

  const primeiroNome = sessao?.nome.split(' ')[0]
  const titulo = <PageTitle eyebrow={primeiroNome ? `OLÁ, ${primeiroNome.toUpperCase()}` : 'OLÁ'} title="Pronta para o próximo passo?" subtitle="Continue de onde parou e avance na sua jornada."/>

  if (erro) return <AppShell route="home">{titulo}<div className="alert alert-error">{erro}</div></AppShell>
  if (!dados) return <AppShell route="home">{titulo}<p aria-busy="true">Carregando…</p></AppShell>

  const { trilha, top3, eventos } = dados
  const principal = casePrincipal(trilha.cases)
  const abrir = (caseId: string) => {
    definirCaseAtual(caseId)
    definirIlhaAtual(trilha.cases.find(c => c.caseId === caseId)?.areaId ?? null)
    go('case')
  }

  return <AppShell route="home">{titulo}<div className="home-grid"><div className="home-main"><LevelCard/>
    {principal ? <section className="dashboard-card weekly-case">
      <div className="card-top"><Tag>{principal.estado === 'em_avaliacao' ? 'EM AVALIAÇÃO' : 'CASE EM ANDAMENTO'}</Tag></div>
      <h2>{principal.titulo}</h2><p>{principal.resumo}</p>
      <div className="case-meta"><span><Icon name="chart"/> {principal.area}</span></div>
      <div className="case-stat"><span>Seu progresso</span><strong>{principal.progresso.concluidos} de {principal.progresso.total} checkpoints</strong></div>
      <Progress value={principal.progresso.total ? (principal.progresso.concluidos / principal.progresso.total) * 100 : 0}/>
      <Button onClick={() => abrir(principal.caseId)} icon="arrow">{principal.estado === 'em_avaliacao' ? 'Ver case' : 'Continuar case'}</Button>
    </section> : <section className="dashboard-card weekly-case">
      <div className="card-top"><Tag>ILHAS</Tag></div>
      <h2>{trilha.diagnosticoConcluido ? 'Escolha uma ilha para explorar' : 'Comece pelo diagnóstico'}</h2>
      <p>{trilha.diagnosticoConcluido ? 'Cada área é uma ilha: comece pelo case básico para abrir os avançados e o treino de entrevista.' : 'O diagnóstico mostra as áreas com mais afinidade com você e libera as suas ilhas.'}</p>
      <Button onClick={() => go(trilha.diagnosticoConcluido ? 'trail' : 'diagnostic')} icon="arrow">{trilha.diagnosticoConcluido ? 'Ver as ilhas' : 'Fazer o diagnóstico'}</Button>
    </section>}
    {top3.length > 0 && <section className="dashboard-section"><div className="section-title-row"><div><span className="eyebrow">SEU PERFIL</span><h2>Áreas recomendadas</h2></div><button className="text-link" onClick={() => go('match')}>Ver resultado</button></div><div className="area-cards">{top3.map(a => <article key={a.areaId}><strong>{a.pontuacao}%</strong><h3>{a.area}</h3><span>{a.posicao === 1 ? 'Maior afinidade' : `${a.posicao}ª afinidade`}</span></article>)}</div></section>}
  </div><aside className="activity-card"><div className="section-title-row"><h2>Últimos pontos</h2><button onClick={() => go('points')}>Ver extrato</button></div>
    {eventos.length ? <div className="activity-list">{eventos.map(e => <div className="activity-item" key={e.id}><span className="activity-icon"><Icon name="spark" size={17}/></span><div><strong>{e.acao}</strong><small>{e.origem}</small></div><b>+{e.pontos}</b></div>)}</div> : <p>Você ainda não ganhou pontos. O primeiro passo é o diagnóstico.</p>}
    <div className="tip-card"><Icon name="book"/><div><strong>Dica rápida</strong><p>Concluir conteúdos de apoio deixa o case mais fácil — e ainda vale pontos.</p><button onClick={() => go('content')}>Explorar conteúdos →</button></div></div></aside></div></AppShell>
}
