import { useCallback, useEffect, useRef, useState } from 'react'
import './trilha.css'
import './treino.css'
import { definirIlhaAtual, go, obterIlhaAtual } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { juntarTexto, useDitado, useFala } from '../../app/voz'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { AppShell } from '../../componentes/Layout'
import { catalogoService, simulacaoService, type DificuldadeSimulacao, type FeedbackSimulacao, type ResumoSimulacao, type RigorSimulacao, type TurnoSimulacao } from '../../services'

const RIGORES: { id: RigorSimulacao; rotulo: string; dica: string }[] = [
  { id: 'acolhedor', rotulo: 'Acolhedora', dica: 'Incentiva e corrige com gentileza' },
  { id: 'equilibrado', rotulo: 'Equilibrada', dica: 'Elogia e aponta lacunas com clareza' },
  { id: 'exigente', rotulo: 'Exigente', dica: 'Direta e precisa, como em um processo concorrido' },
]
const DIFICULDADES: { id: DificuldadeSimulacao; rotulo: string; dica: string }[] = [
  { id: 'iniciante', rotulo: 'Iniciante', dica: 'Motivação e conceitos básicos' },
  { id: 'intermediario', rotulo: 'Intermediária', dica: 'Comportamental e técnica' },
  { id: 'avancado', rotulo: 'Avançada', dica: 'Julgamento e contas' },
]
const NUMEROS = [3, 5, 8]
/** No modo cronometrado, cada resposta tem este tempo. */
const SEGUNDOS_POR_RESPOSTA = 120

type Mensagem = { autor: 'entrevistadora' | 'voce'; texto: string }

/** Simulação de entrevista: a entrevistadora (IA) pergunta uma coisa de cada vez e dá um feedback no fim. */
export function Simulacao() {
  const areaId = obterIlhaAtual()
  const [areaNome, setAreaNome] = useState('')
  const [resumo, setResumo] = useState<ResumoSimulacao | null>(null)
  const [fase, setFase] = useState<'carregando' | 'config' | 'conversa' | 'feedback' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')

  const [vaga, setVaga] = useState('')
  const [rigor, setRigor] = useState<RigorSimulacao>('equilibrado')
  const [dificuldade, setDificuldade] = useState<DificuldadeSimulacao>('intermediario')
  const [perguntas, setPerguntas] = useState(5)
  const [cronometrado, setCronometrado] = useState(false)
  const [vozAtiva, setVozAtiva] = useState(false)

  const [turno, setTurno] = useState<TurnoSimulacao | null>(null)
  const [conversa, setConversa] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [restante, setRestante] = useState(SEGUNDOS_POR_RESPOSTA)
  const [feedback, setFeedback] = useState<FeedbackSimulacao | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState('')
  const ditado = useDitado(trecho => setTexto(t => juntarTexto(t, trecho)))
  const fala = useFala()
  const enviando = useRef(false)
  const fim = useRef<HTMLDivElement>(null)

  const carregar = useCallback(async () => {
    if (!areaId) return go('trail')
    const [r, a] = await Promise.all([simulacaoService.obterResumoDaSimulacao(areaId), catalogoService.obterArea(areaId)])
    const falha = r.erro ?? a.erro
    if (falha || !r.dados || !a.dados) {
      if (falha && sessaoExpirou(falha)) return
      setMensagem(falha?.mensagem ?? 'Não foi possível abrir a simulação.')
      return setFase('erro')
    }
    setResumo(r.dados)
    setAreaNome(a.dados.nome)
    setFase('config')
  }, [areaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    fim.current?.scrollIntoView?.({ block: 'end' })
  }, [conversa, turno])

  const voltar = () => {
    ditado.cancelar()
    fala.parar()
    definirIlhaAtual(areaId)
    go('island')
  }

  const comecar = async () => {
    if (!areaId) return
    setOcupado(true)
    setErroDaAcao('')
    const r = await simulacaoService.iniciarSimulacao({ areaId, vaga: vaga.trim() || undefined, rigor, dificuldade, perguntas })
    setOcupado(false)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      return setErroDaAcao(r.erro.mensagem)
    }
    setTurno(r.dados)
    setConversa([{ autor: 'entrevistadora', texto: r.dados.pergunta }])
    if (vozAtiva) fala.falar(r.dados.pergunta)
    setTexto('')
    setRestante(SEGUNDOS_POR_RESPOSTA)
    enviando.current = false
    setFase('conversa')
  }

  const enviar = useCallback(async (resposta: string | null) => {
    if (!turno || enviando.current) return
    enviando.current = true
    ditado.cancelar()
    fala.parar()
    setOcupado(true)
    setErroDaAcao('')
    const r = await simulacaoService.responderSimulacao(turno.sessaoId, resposta)
    setOcupado(false)
    if (r.erro) {
      enviando.current = false
      if (sessaoExpirou(r.erro)) return
      return setErroDaAcao(r.erro.mensagem)
    }
    const novas: Mensagem[] = [{ autor: 'voce', texto: resposta?.trim() || '(sem resposta)' }]
    if (r.dados.reacao) novas.push({ autor: 'entrevistadora', texto: r.dados.reacao })
    if (r.dados.proximo) novas.push({ autor: 'entrevistadora', texto: r.dados.proximo.pergunta })
    setConversa(c => [...c, ...novas])
    if (vozAtiva) fala.falar(novas.filter(m => m.autor === 'entrevistadora').map(m => m.texto).join(' '))
    setTexto('')
    enviando.current = false
    if (r.dados.proximo) {
      setTurno({ ...turno, numero: r.dados.proximo.numero, pergunta: r.dados.proximo.pergunta })
      setRestante(SEGUNDOS_POR_RESPOSTA)
    } else {
      setFeedback(r.dados.feedbackFinal)
      setFase('feedback')
    }
  }, [turno, vozAtiva, ditado, fala])

  useEffect(() => {
    // O tempo só corre quando a entrevistadora terminou de falar.
    if (fase !== 'conversa' || !cronometrado || ocupado || fala.falando) return
    if (restante <= 0) {
      enviar(texto.trim() || null)
      return
    }
    const t = window.setTimeout(() => setRestante(s => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [fase, cronometrado, ocupado, fala.falando, restante, texto, enviar])

  const indisponivel = !!resumo && (!resumo.liberado || !resumo.disponivel || resumo.restantesHoje <= 0)
  const aviso = !resumo ? null : !resumo.liberado ? resumo.motivoBloqueio : !resumo.disponivel ? 'A simulação com IA não está disponível agora. Tente o treino de perguntas.' : resumo.restantesHoje <= 0 ? 'Você usou todas as simulações de hoje. Volte amanhã.' : null

  const grupo = <T extends string>(nome: string, legenda: string, itens: { id: T; rotulo: string; dica: string }[], valor: T, mudar: (v: T) => void) => (
    <fieldset className="treino-grupo" disabled={indisponivel}>
      <legend>{legenda}</legend>
      <div className="treino-opcoes">
        {itens.map(i => (
          <label key={i.id} className={`treino-opcao ${valor === i.id ? 'marcada' : ''}`}>
            <input type="radio" name={nome} checked={valor === i.id} onChange={() => mudar(i.id)} />
            <strong>{i.rotulo}</strong><small>{i.dica}</small>
          </label>
        ))}
      </div>
    </fieldset>
  )

  return <AppShell route="simulation"><div className="trilha-page treino-page">
    <button className="back-link" onClick={voltar}>← Voltar para a ilha</button>
    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando a simulação…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'config' && resumo && <>
      <PageTitle eyebrow={`SIMULAÇÃO DE ENTREVISTA · ${areaNome.toUpperCase()}`} title="Monte a sua entrevista" subtitle="Uma entrevistadora faz as perguntas, uma de cada vez, e no fim você recebe um feedback. Ajuste a vaga, o rigor e a dificuldade." />
      {resumo.demonstracao && <div className="alert alert-warning" role="note"><p>Modo demonstração: perguntas e feedback são roteirizados, sem IA.</p></div>}
      {aviso && <div className="alert alert-warning" role="note"><p>{aviso}</p></div>}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      <fieldset className="treino-grupo" disabled={indisponivel}>
        <legend>Vaga <small>(opcional)</small></legend>
        <textarea className="sim-vaga" rows={3} maxLength={600} value={vaga} onChange={e => setVaga(e.target.value)} placeholder={`Ex.: Estágio em ${areaNome} em um banco médio, com foco em análise e modelagem.`} aria-label="Descrição da vaga" />
      </fieldset>
      {grupo('rigor', 'Rigor da entrevistadora', RIGORES, rigor, setRigor)}
      {grupo('dificuldade', 'Dificuldade', DIFICULDADES, dificuldade, setDificuldade)}
      <fieldset className="treino-grupo" disabled={indisponivel}>
        <legend>Quantas perguntas</legend>
        <div className="treino-opcoes treino-curtas">
          {NUMEROS.map(n => (
            <label key={n} className={`treino-opcao ${perguntas === n ? 'marcada' : ''}`}>
              <input type="radio" name="perguntas" checked={perguntas === n} onChange={() => setPerguntas(n)} /><strong>{n}</strong>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="sim-cronometro">
        <input type="checkbox" checked={cronometrado} onChange={e => setCronometrado(e.target.checked)} disabled={indisponivel} />
        <span><strong>Modo cronometrado</strong><small>{SEGUNDOS_POR_RESPOSTA / 60} minutos por resposta. Quando o tempo acaba, o que você escreveu é enviado.</small></span>
      </label>
      <label className="sim-cronometro">
        <input type="checkbox" checked={vozAtiva} onChange={e => setVozAtiva(e.target.checked)} disabled={indisponivel || !fala.disponivel} />
        <span><strong>Entrevistadora fala as perguntas</strong><small>{fala.disponivel ? 'As perguntas são lidas em voz alta. Você também pode ditar as respostas pelo microfone.' : 'Este navegador não lê em voz alta; as perguntas aparecem só em texto.'}</small></span>
      </label>
      {resumo.disponivel && <p className="trilha-dica">Restam {resumo.restantesHoje} simulações hoje. Não compartilhe dados pessoais nas respostas.</p>}
      <div className="trilha-acoes"><Button onClick={comecar} disabled={ocupado || indisponivel}>{ocupado ? 'Chamando a entrevistadora…' : 'Começar entrevista'}</Button></div>
    </>}

    {fase === 'conversa' && turno && <section className="sim-conversa" aria-label="Entrevista">
      <div className="treino-topo">
        <Tag tone="blue">{`PERGUNTA ${turno.numero} DE ${turno.total}`}</Tag>
        {cronometrado && <span className={`treino-tempo ${restante <= 20 ? 'urgente' : ''}`} role="timer" aria-label={`${restante} segundos restantes`}>{Math.floor(restante / 60)}:{String(restante % 60).padStart(2, '0')}</span>}
      </div>
      <Progress value={((turno.numero - 1) / turno.total) * 100} />
      <div className="sim-bolhas" aria-live="polite">
        {conversa.map((m, i) => <div key={i} className={`sim-bolha ${m.autor}`}><small>{m.autor === 'voce' ? 'Você' : 'Entrevistadora'}</small><p>{m.texto}</p></div>)}
        {ocupado && <p className="sim-pensando" role="status">A entrevistadora está pensando…</p>}
        <div ref={fim} />
      </div>
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}
      {ditado.erro && <div className="alert alert-warning" role="note"><p>{ditado.erro}</p></div>}
      <textarea className="sim-resposta" rows={5} maxLength={2000} value={texto} onChange={e => setTexto(e.target.value)} disabled={ocupado} placeholder="Escreva a sua resposta…" aria-label="Sua resposta" />
      {ditado.ouvindo && <p className="sim-parcial" role="status"><span className="sim-gravando" aria-hidden="true" /> Ouvindo… {ditado.parcial}</p>}
      <div className="trilha-acoes">
        {ditado.disponivel && <Button variant="ghost" onClick={ditado.ouvindo ? ditado.parar : ditado.iniciar} disabled={ocupado} pressed={ditado.ouvindo}>{ditado.ouvindo ? 'Parar de ouvir' : '🎤 Falar a resposta'}</Button>}
        {fala.disponivel && <Button variant="ghost" onClick={() => (fala.falando ? fala.parar() : setVozAtiva(v => !v))} pressed={vozAtiva}>{fala.falando ? 'Silenciar' : vozAtiva ? 'Voz ligada' : 'Voz desligada'}</Button>}
        <Button onClick={() => enviar(texto.trim() || null)} disabled={ocupado || !texto.trim()} icon="arrow">{turno.numero >= turno.total ? 'Enviar e ver o feedback' : 'Enviar resposta'}</Button>
        <small className="trilha-motivo">{texto.length}/2000</small>
      </div>
    </section>}

    {fase === 'feedback' && feedback && <section className="treino-resultado">
      <PageTitle eyebrow="ENTREVISTA CONCLUÍDA" title="Seu feedback" subtitle={feedback.resumo} />
      <div className="sim-criterios">
        {feedback.criterios.map(c => (
          <article key={c.nome} className="trilha-card">
            <div className="treino-topo"><h3>{c.nome}</h3><strong className="treino-tempo">{c.nota}/10</strong></div>
            <Progress value={c.nota * 10} />
            <p className="trilha-resumo">{c.comentario}</p>
          </article>
        ))}
      </div>
      {([['Pontos fortes', feedback.pontosFortes], ['Para melhorar', feedback.pontosAMelhorar], ['Próximos passos', feedback.proximosPassos]] as const).map(([titulo, itens]) => itens.length > 0 && (
        <div key={titulo} className="ilha-apresentacao"><h2>{titulo}</h2><ul>{itens.map(i => <li key={i}>{i}</li>)}</ul></div>
      ))}
      <div className="trilha-acoes">
        <Button onClick={() => { setFase('config'); carregar() }}>Fazer outra entrevista</Button>
        <Button variant="ghost" onClick={voltar}>Voltar à ilha</Button>
      </div>
    </section>}
  </div></AppShell>
}
