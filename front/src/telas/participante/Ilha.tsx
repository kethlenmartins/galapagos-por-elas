import { useCallback, useEffect, useState } from 'react'
import './trilha.css'
import { definirCaseAtual, definirIlhaAtual, go, obterIlhaAtual } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { Button } from '../../componentes/Botao'
import { caseService, catalogoService, conteudoService, simulacaoService, treinoService, type Area, type Conteudo, type ResumoSimulacao, type ResumoTreino, type TrilhaDaUsuaria } from '../../services'
import { CartaoCase } from './CartaoCase'
import { CaminhoDeBolinhas, type NoDoCaminho } from '../../componentes/CaminhoDeBolinhas'
import { CarrosselDeConteudos } from './CartaoConteudo'

/** Uma ilha é uma área: apresentação, case básico, cases avançados e treino de entrevista. */
export function Ilha() {
  const areaId = obterIlhaAtual()
  const [trilha, setTrilha] = useState<TrilhaDaUsuaria | null>(null)
  const [area, setArea] = useState<Area | null>(null)
  const [treino, setTreino] = useState<ResumoTreino | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [simulacao, setSimulacao] = useState<ResumoSimulacao | null>(null)
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState('')
  // `undefined` mantém a sugestão inicial; `null` recolhe o conteúdo por escolha da usuária.
  const [noEscolhido, setNoEscolhido] = useState<string | null | undefined>(undefined)

  const carregar = useCallback(async () => {
    if (!areaId) return go('trail')
    const [t, a, r, sim, cont] = await Promise.all([caseService.obterTrilha(), catalogoService.obterArea(areaId), treinoService.obterResumoDoTreino(areaId), simulacaoService.obterResumoDaSimulacao(areaId), conteudoService.listarConteudos({ areaId })])
    const falha = t.erro ?? a.erro
    if (falha || !t.dados || !a.dados) {
      if (falha && sessaoExpirou(falha)) return
      setMensagem(falha?.mensagem ?? 'Não foi possível abrir a ilha.')
      return setFase('erro')
    }
    setTrilha(t.dados)
    setArea(a.dados)
    setTreino(r.dados ?? null)
    setSimulacao(sim.dados ?? null)
    setConteudos(cont.dados ?? [])
    setFase('ok')
  }, [areaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  const escolher = async (caseId: string) => {
    setOcupado(true)
    setErroDaAcao('')
    const r = await caseService.escolherCase(caseId)
    setOcupado(false)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      setErroDaAcao(r.erro.mensagem)
      setConfirmando(null)
      return carregar()
    }
    definirCaseAtual(caseId)
    go('case')
  }

  const voltar = () => {
    definirIlhaAtual(null)
    go('trail')
  }

  const cases = (trilha?.cases ?? []).filter(c => c.areaId === areaId).sort((a, b) => a.ordem - b.ordem)
  const basico = cases.find(c => c.nivel === 'basico')
  const avancados = cases.filter(c => c.nivel === 'avancado')
  const basicoConcluido = basico?.estado === 'concluido'

  const cartao = (item: (typeof cases)[number]) => (
    <CartaoCase
      key={item.caseId}
      item={item}
      confirmando={confirmando === item.caseId}
      ocupado={ocupado}
      aoPedirConfirmacao={() => { setErroDaAcao(''); setConfirmando(item.caseId) }}
      aoConfirmar={() => escolher(item.caseId)}
      aoCancelar={() => setConfirmando(null)}
    />
  )

  // O caminho da ilha: conteúdos, os cases em ordem, treino, simulação e vagas.
  const totalPerguntas = treino ? Object.values(treino.perguntasPorNivel).reduce((x, y) => x + y, 0) : 0
  const treinoLiberado = !!treino?.liberado && totalPerguntas > 0
  const feitosConteudos = conteudos.filter(c => c.concluido).length
  const primeiroPendente = cases.find(c => c.estado !== 'concluido' && c.estado !== 'bloqueado')
  const noDoCase = (c: (typeof cases)[number]): NoDoCaminho => ({
    id: c.caseId,
    rotulo: c.nivel === 'basico' ? 'Case básico' : `Avançado ${avancados.indexOf(c) + 1}`,
    detalhe: c.estado === 'bloqueado' ? 'Bloqueado' : c.estado === 'concluido' ? 'Concluído' : c.estado === 'em_avaliacao' ? 'Em avaliação' : c.progresso.total ? `${c.progresso.concluidos} de ${c.progresso.total}` : undefined,
    estado: c.estado === 'concluido' ? 'feito' : c.estado === 'bloqueado' ? 'bloqueado' : c.caseId === primeiroPendente?.caseId ? 'atual' : 'aberto',
    icone: c.nivel === 'basico' ? 'case' : 'award',
    progresso: c.estado === 'em_andamento' && c.progresso.total ? (c.progresso.concluidos / c.progresso.total) * 100 : undefined,
  })
  const nos: NoDoCaminho[] = [
    ...(conteudos.length > 0 ? [{ id: 'conteudos', rotulo: 'Conteúdos', detalhe: `${feitosConteudos} de ${conteudos.length}`, estado: feitosConteudos === conteudos.length ? 'feito' : 'aberto', icone: 'book', progresso: (feitosConteudos / conteudos.length) * 100 } as NoDoCaminho] : []),
    ...cases.map(noDoCase),
    { id: 'treino', rotulo: 'Treino', detalhe: treinoLiberado ? `${totalPerguntas} perguntas` : totalPerguntas === 0 && basicoConcluido ? 'Em breve' : 'Bloqueado', estado: treinoLiberado ? 'aberto' : 'bloqueado', icone: 'spark' },
    { id: 'simulacao', rotulo: 'Simulação', detalhe: !basicoConcluido ? 'Bloqueado' : simulacao?.historico.length ? `${simulacao.historico.length} feita${simulacao.historico.length === 1 ? '' : 's'}` : undefined, estado: !basicoConcluido || (simulacao && !simulacao.disponivel) ? 'bloqueado' : simulacao?.historico.length ? 'feito' : 'aberto', icone: 'user' },
    { id: 'vagas', rotulo: 'Vagas', estado: 'aberto', icone: 'chart' },
  ]
  const escolhido = noEscolhido === undefined ? primeiroPendente?.caseId ?? nos.find(n => n.estado !== 'bloqueado')?.id ?? null : noEscolhido

  const painelDoNo = (no: NoDoCaminho) => {
    if (no.id === 'conteudos') return (
      <section className="ilha-secao" aria-label="Conteúdos da ilha">
        <p className="trilha-dica">Toque em um conteúdo para ler ou assistir, no seu ritmo. Os conteúdos do case básico também valem pontos e são obrigatórios dentro dele.</p>
        <CarrosselDeConteudos conteudos={conteudos} aoConcluir={feito => setConteudos(l => l.map(x => x.id === feito.id ? feito : x))}/>
      </section>
    )
    const doCase = cases.find(c => c.caseId === no.id)
    if (doCase) return cartao(doCase)
    if (no.id === 'treino') return (
      <article className={`trilha-card ${treinoLiberado ? '' : 'trilha-bloqueado'}`}>
        <div className="trilha-etiquetas">
          <Tag tone="blue">ENTREVISTA</Tag>
          <span className="trilha-estado"><Tag tone={totalPerguntas > 0 ? 'blue' : 'yellow'}>{totalPerguntas > 0 ? `${totalPerguntas} PERGUNTAS` : 'EM BREVE'}</Tag></span>
        </div>
        <h3>Treine para entrevistas de {area?.nome}</h3>
        <p className="trilha-resumo">Perguntas de entrevista por nível de dificuldade, com feedback em cada resposta e modo cronometrado.</p>
        {!basicoConcluido && <p className="trilha-aviso"><Icon name="lock" size={16} /> Abre depois que você concluir o case básico.</p>}
        {treino && treino.desempenho.respondidas > 0 && <p className="trilha-resumo">Você já respondeu {treino.desempenho.respondidas} {treino.desempenho.respondidas === 1 ? 'pergunta' : 'perguntas'} e acertou {Math.round((treino.desempenho.acertos / treino.desempenho.respondidas) * 100)}%.</p>}
        {basicoConcluido && totalPerguntas === 0 && <p className="trilha-aviso"><Icon name="spark" size={16} /> As perguntas desta área ainda não foram publicadas.</p>}
        {treinoLiberado && <div className="trilha-acoes"><Button onClick={() => go('training')} icon="arrow">Começar o treino</Button></div>}
      </article>
    )
    if (no.id === 'simulacao') return (
      <article className={`trilha-card ${basicoConcluido ? '' : 'trilha-bloqueado'}`}>
        <div className="trilha-etiquetas">
          <Tag tone="blue">ENTREVISTA COM IA</Tag>
          <span className="trilha-estado"><Tag tone={simulacao?.demonstracao ? 'yellow' : 'blue'}>{simulacao?.demonstracao ? 'DEMONSTRAÇÃO' : 'TEXTO E VOZ'}</Tag></span>
        </div>
        <h3>Simule uma entrevista de {area?.nome}</h3>
        <p className="trilha-resumo">Uma entrevistadora faz as perguntas, uma de cada vez. Você escolhe a vaga, o rigor e a dificuldade, e recebe um feedback no fim.</p>
        {!basicoConcluido && <p className="trilha-aviso"><Icon name="lock" size={16} /> Abre depois que você concluir o case básico.</p>}
        {simulacao && simulacao.historico.length > 0 && <p className="trilha-resumo">Última simulação: {new Date(simulacao.historico[0].concluidaEm).toLocaleDateString('pt-BR')}{simulacao.historico[0].notaMedia !== null ? `, nota média ${simulacao.historico[0].notaMedia}/10` : ''}. Você fez {simulacao.historico.length}{simulacao.historico.length === 5 ? '+' : ''} {simulacao.historico.length === 1 ? 'simulação' : 'simulações'} nesta ilha.</p>}
        {basicoConcluido && simulacao && !simulacao.disponivel && <p className="trilha-aviso"><Icon name="spark" size={16} /> Indisponível no momento.</p>}
        {basicoConcluido && simulacao?.disponivel && <div className="trilha-acoes"><Button onClick={() => go('simulation')} icon="arrow">Começar a simulação</Button></div>}
      </article>
    )
    return (
      <article className="trilha-card">
        <div className="trilha-etiquetas"><Tag tone="blue">VAGAS</Tag></div>
        <h3>Vagas de {area?.nome}</h3>
        <p className="trilha-resumo">Estágios e vagas de analista júnior da área, conferidas pela equipe.</p>
        <div className="trilha-acoes"><Button variant="ghost" onClick={() => go('jobs')} icon="arrow">Ver vagas</Button></div>
      </article>
    )
  }

  return <AppShell route="island"><div className="trilha-page">
    <button className="back-link" onClick={voltar}>← Voltar para as ilhas</button>

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando a ilha…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && trilha && area && <>
      <PageTitle eyebrow="ILHA" title={area.nome} subtitle={area.oQueFaz} />
      {/* No celular o texto longo da área começa recolhido, para o caminho da ilha aparecer logo. */}
      <details className="ilha-apresentacao" open={typeof window === 'undefined' || !window.matchMedia?.('(max-width: 720px)').matches}>
        <summary>Sobre a área</summary>
        <p>{area.descricao}</p>
      </details>

      {!trilha.diagnosticoConcluido && (
        <div className="alert alert-warning" role="note">
          <p>Conclua o diagnóstico para começar os cases. <button className="text-link" onClick={() => go('diagnostic')}>Fazer o diagnóstico</button></p>
        </div>
      )}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      <section className="ilha-secao" aria-label="Seu caminho na ilha">
        <h2>Seu caminho nesta ilha</h2>
        <p className="trilha-dica">Comece pelo case básico: concluí-lo abre os cases avançados, o treino e a simulação. Toque numa bolinha para ver os detalhes.</p>
        {cases.length === 0 && <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Em breve: o case desta ilha</h2><p>A equipe ainda vai publicar o case básico. Enquanto isso, leia sobre a área e fique de olho nas vagas.</p></div>}
        <CaminhoDeBolinhas rotuloDaLista="Etapas da ilha" nos={nos} escolhido={escolhido} aoEscolher={id => setNoEscolhido(atual => (atual === id || (atual === undefined && escolhido === id)) ? null : id)} detalhe={painelDoNo}/>
      </section>
    </>}
  </div></AppShell>
}
