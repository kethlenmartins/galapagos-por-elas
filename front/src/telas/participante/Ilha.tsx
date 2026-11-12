import { useCallback, useEffect, useState } from 'react'
import './trilha.css'
import { definirCaseAtual, definirIlhaAtual, go, obterIlhaAtual } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { Button } from '../../componentes/Botao'
import { caseService, catalogoService, simulacaoService, treinoService, type Area, type ResumoSimulacao, type ResumoTreino, type TrilhaDaUsuaria } from '../../services'
import { CartaoCase } from './CartaoCase'

/** Uma ilha é uma área: apresentação, case básico, cases avançados e treino de entrevista. */
export function Ilha() {
  const areaId = obterIlhaAtual()
  const [trilha, setTrilha] = useState<TrilhaDaUsuaria | null>(null)
  const [area, setArea] = useState<Area | null>(null)
  const [treino, setTreino] = useState<ResumoTreino | null>(null)
  const [simulacao, setSimulacao] = useState<ResumoSimulacao | null>(null)
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState('')

  const carregar = useCallback(async () => {
    if (!areaId) return go('trail')
    const [t, a, r, sim] = await Promise.all([caseService.obterTrilha(), catalogoService.obterArea(areaId), treinoService.obterResumoDoTreino(areaId), simulacaoService.obterResumoDaSimulacao(areaId)])
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

  return <AppShell route="island"><div className="trilha-page">
    <button className="back-link" onClick={voltar}>← Voltar para as ilhas</button>

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando a ilha…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && trilha && area && <>
      <PageTitle eyebrow="ILHA" title={area.nome} subtitle={area.oQueFaz} />
      <section className="ilha-apresentacao" aria-label={`Sobre a área de ${area.nome}`}>
        <h2>Sobre a área</h2>
        <p>{area.descricao}</p>
      </section>

      {!trilha.diagnosticoConcluido && (
        <div className="alert alert-warning" role="note">
          <p>Conclua o diagnóstico para começar os cases. <button className="text-link" onClick={() => go('diagnostic')}>Fazer o diagnóstico</button></p>
        </div>
      )}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      <section className="ilha-secao" aria-label="Case básico">
        <h2>Comece pelo case básico</h2>
        <p className="trilha-dica">Conteúdos, etapas e certificado. Concluí-lo abre os cases avançados e o treino de entrevista desta ilha.</p>
        {basico ? cartao(basico) : <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Ainda não há case nesta ilha</h2><p>Assim que a equipe publicar o case básico, ele aparece aqui.</p></div>}
      </section>

      <section className="ilha-secao" aria-label="Cases avançados">
        <h2>Cases avançados</h2>
        {avancados.length > 0
          ? avancados.map(cartao)
          : <p className="trilha-dica">Novos cases mais complexos desta área vão aparecer aqui.</p>}
      </section>

      <section className="ilha-secao" aria-label="Treino de entrevista">
        <h2>Treino de entrevista</h2>
        {(() => {
          const total = treino ? Object.values(treino.perguntasPorNivel).reduce((x, y) => x + y, 0) : 0
          const liberado = !!treino?.liberado && total > 0
          return (
            <article className={`trilha-card ${liberado ? '' : 'trilha-bloqueado'}`}>
              <div className="trilha-etiquetas">
                <Tag tone="blue">ENTREVISTA</Tag>
                <span className="trilha-estado"><Tag tone={total > 0 ? 'blue' : 'yellow'}>{total > 0 ? `${total} PERGUNTAS` : 'EM BREVE'}</Tag></span>
              </div>
              <h3>Treine para entrevistas de {area.nome}</h3>
              <p className="trilha-resumo">Perguntas de entrevista por nível de dificuldade, com feedback em cada resposta e modo cronometrado.</p>
              {!basicoConcluido && <p className="trilha-aviso"><Icon name="lock" size={16} /> Abre depois que você concluir o case básico.</p>}
              {treino && treino.desempenho.respondidas > 0 && <p className="trilha-resumo">Você já respondeu {treino.desempenho.respondidas} {treino.desempenho.respondidas === 1 ? 'pergunta' : 'perguntas'} e acertou {Math.round((treino.desempenho.acertos / treino.desempenho.respondidas) * 100)}%.</p>}
              {basicoConcluido && total === 0 && <p className="trilha-aviso"><Icon name="spark" size={16} /> As perguntas desta área ainda não foram publicadas.</p>}
              {liberado && <div className="trilha-acoes"><Button onClick={() => go('training')} icon="arrow">Começar o treino</Button></div>}
            </article>
          )
        })()}
        <article className={`trilha-card ${basicoConcluido ? '' : 'trilha-bloqueado'}`}>
          <div className="trilha-etiquetas">
            <Tag tone="blue">ENTREVISTA COM IA</Tag>
            <span className="trilha-estado"><Tag tone={simulacao?.demonstracao ? 'yellow' : 'blue'}>{simulacao?.demonstracao ? 'DEMONSTRAÇÃO' : 'TEXTO'}</Tag></span>
          </div>
          <h3>Simule uma entrevista de {area.nome}</h3>
          <p className="trilha-resumo">Uma entrevistadora faz as perguntas, uma de cada vez. Você escolhe a vaga, o rigor e a dificuldade, e recebe um feedback no fim.</p>
          {!basicoConcluido && <p className="trilha-aviso"><Icon name="lock" size={16} /> Abre depois que você concluir o case básico.</p>}
          {simulacao && simulacao.historico.length > 0 && <p className="trilha-resumo">Última simulação: {new Date(simulacao.historico[0].concluidaEm).toLocaleDateString('pt-BR')}{simulacao.historico[0].notaMedia !== null ? `, nota média ${simulacao.historico[0].notaMedia}/10` : ''}. Você fez {simulacao.historico.length}{simulacao.historico.length === 5 ? '+' : ''} {simulacao.historico.length === 1 ? 'simulação' : 'simulações'} nesta ilha.</p>}
          {basicoConcluido && simulacao && !simulacao.disponivel && <p className="trilha-aviso"><Icon name="spark" size={16} /> Indisponível no momento.</p>}
          {basicoConcluido && simulacao?.disponivel && <div className="trilha-acoes"><Button onClick={() => go('simulation')} icon="arrow">Começar a simulação</Button></div>}
        </article>
        <article className="trilha-card">
          <div className="trilha-etiquetas"><Tag tone="blue">VAGAS</Tag></div>
          <h3>Vagas de {area.nome}</h3>
          <p className="trilha-resumo">Estágios e vagas de analista júnior da área, conferidas pela equipe.</p>
          <div className="trilha-acoes"><Button variant="ghost" onClick={() => go('jobs')} icon="arrow">Ver vagas</Button></div>
        </article>
      </section>
    </>}
  </div></AppShell>
}
