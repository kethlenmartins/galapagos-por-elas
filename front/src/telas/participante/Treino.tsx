import { useCallback, useEffect, useRef, useState } from 'react'
import './trilha.css'
import './treino.css'
import { definirIlhaAtual, go, obterIlhaAtual } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { AppShell } from '../../componentes/Layout'
import { catalogoService, treinoService, type NivelPergunta, type PerguntaTreino, type RespostaTreino, type ResumoTreino } from '../../services'

type Nivel = NivelPergunta | 'misto'
type Registro = { pergunta: PerguntaTreino; letra: string | null; resposta: RespostaTreino }

const NIVEIS: { id: Nivel; rotulo: string; dica: string }[] = [
  { id: 'facil', rotulo: 'Fácil', dica: 'Conceitos básicos da área' },
  { id: 'medio', rotulo: 'Médio', dica: 'Aplicação e contas simples' },
  { id: 'dificil', rotulo: 'Difícil', dica: 'Julgamento e situações reais' },
  { id: 'misto', rotulo: 'Misto', dica: 'Os três níveis juntos' },
]
const QUANTIDADES = [5, 10, 15]
/** No modo cronometrado, cada pergunta tem este tempo. */
const SEGUNDOS_POR_PERGUNTA = 60

const rotuloDoNivel = (n: NivelPergunta) => NIVEIS.find(x => x.id === n)?.rotulo ?? n

/** Treino de entrevista de uma ilha: perguntas de múltipla escolha, com modo cronometrado e feedback em cada resposta. */
export function Treino() {
  const areaId = obterIlhaAtual()
  const [areaNome, setAreaNome] = useState('')
  const [resumo, setResumo] = useState<ResumoTreino | null>(null)
  const [fase, setFase] = useState<'carregando' | 'config' | 'perguntando' | 'resultado' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')

  const [nivel, setNivel] = useState<Nivel>('misto')
  const [tema, setTema] = useState('')
  const [quantidade, setQuantidade] = useState(10)
  const [cronometrado, setCronometrado] = useState(false)

  const [perguntas, setPerguntas] = useState<PerguntaTreino[]>([])
  const [indice, setIndice] = useState(0)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [atual, setAtual] = useState<Registro | null>(null)
  const [restante, setRestante] = useState(SEGUNDOS_POR_PERGUNTA)
  const [ocupado, setOcupado] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState('')
  const respondendo = useRef(false)

  const carregar = useCallback(async () => {
    if (!areaId) return go('trail')
    const [r, a] = await Promise.all([treinoService.obterResumoDoTreino(areaId), catalogoService.obterArea(areaId)])
    const falha = r.erro ?? a.erro
    if (falha || !r.dados || !a.dados) {
      if (falha && sessaoExpirou(falha)) return
      setMensagem(falha?.mensagem ?? 'Não foi possível abrir o treino.')
      return setFase('erro')
    }
    setResumo(r.dados)
    setAreaNome(a.dados.nome)
    setFase('config')
  }, [areaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  const voltar = () => {
    definirIlhaAtual(areaId)
    go('island')
  }

  const comecar = async () => {
    if (!areaId) return
    setOcupado(true)
    setErroDaAcao('')
    const r = await treinoService.sortearPerguntas({ areaId, nivel, quantidade, tema: tema || undefined })
    setOcupado(false)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      return setErroDaAcao(r.erro.mensagem)
    }
    setPerguntas(r.dados)
    setRegistros([])
    setIndice(0)
    setAtual(null)
    setRestante(SEGUNDOS_POR_PERGUNTA)
    respondendo.current = false
    setFase('perguntando')
  }

  const responder = useCallback(async (letra: string | null) => {
    const pergunta = perguntas[indice]
    if (!pergunta || respondendo.current) return
    respondendo.current = true
    setOcupado(true)
    const r = await treinoService.responderPergunta(pergunta.id, letra)
    setOcupado(false)
    if (r.erro) {
      respondendo.current = false
      if (sessaoExpirou(r.erro)) return
      return setErroDaAcao(r.erro.mensagem)
    }
    setErroDaAcao('')
    setAtual({ pergunta, letra, resposta: r.dados })
  }, [perguntas, indice])

  // Cronômetro: roda enquanto a pergunta está sem resposta.
  useEffect(() => {
    if (fase !== 'perguntando' || !cronometrado || atual) return
    if (restante <= 0) {
      responder(null)
      return
    }
    const t = window.setTimeout(() => setRestante(s => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [fase, cronometrado, atual, restante, responder])

  const proxima = () => {
    if (!atual) return
    const novos = [...registros, atual]
    setRegistros(novos)
    setAtual(null)
    respondendo.current = false
    if (indice + 1 >= perguntas.length) return setFase('resultado')
    setIndice(indice + 1)
    setRestante(SEGUNDOS_POR_PERGUNTA)
  }

  const acertos = registros.filter(r => r.resposta.correta).length
  const pergunta = perguntas[indice]
  const total = (n: Nivel) => (n === 'misto' ? Object.values(resumo?.perguntasPorNivel ?? {}).reduce((a, b) => a + b, 0) : (resumo?.perguntasPorNivel[n] ?? 0))
  const semPerguntas = total('misto') === 0

  return <AppShell route="training"><div className="trilha-page treino-page">
    <button className="back-link" onClick={voltar}>← Voltar para a ilha</button>
    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando o treino…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'config' && resumo && <>
      <PageTitle eyebrow={`TREINO DE ENTREVISTA · ${areaNome.toUpperCase()}`} title="Monte o seu treino" subtitle="Responda perguntas de entrevista da área e veja o feedback de cada resposta na hora." />
      {!resumo.liberado && <div className="alert alert-warning" role="note"><p>{resumo.motivoBloqueio}</p></div>}
      {resumo.liberado && semPerguntas && <div className="alert alert-warning" role="note"><p>As perguntas desta área ainda não foram publicadas.</p></div>}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      {resumo.temas.length > 0 && (
        <fieldset className="treino-grupo" disabled={!resumo.liberado || semPerguntas}>
          <legend>Tema</legend>
          <div className="treino-opcoes treino-curtas">
            {['', ...resumo.temas].map(t => (
              <label key={t || 'todos'} className={`treino-opcao ${tema === t ? 'marcada' : ''}`}>
                <input type="radio" name="tema" checked={tema === t} onChange={() => setTema(t)} />
                <strong>{t || 'Todos'}</strong>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="treino-grupo" disabled={!resumo.liberado || semPerguntas}>
        <legend>Dificuldade</legend>
        <div className="treino-opcoes">
          {NIVEIS.map(n => (
            <label key={n.id} className={`treino-opcao ${nivel === n.id ? 'marcada' : ''}`}>
              <input type="radio" name="nivel" checked={nivel === n.id} onChange={() => setNivel(n.id)} disabled={total(n.id) === 0} />
              <strong>{n.rotulo}</strong><small>{n.dica}</small><em>{total(n.id)} perguntas</em>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="treino-grupo" disabled={!resumo.liberado || semPerguntas}>
        <legend>Quantas perguntas</legend>
        <div className="treino-opcoes treino-curtas">
          {QUANTIDADES.map(q => (
            <label key={q} className={`treino-opcao ${quantidade === q ? 'marcada' : ''}`}>
              <input type="radio" name="quantidade" checked={quantidade === q} onChange={() => setQuantidade(q)} />
              <strong>{q}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="treino-grupo" disabled={!resumo.liberado || semPerguntas}>
        <legend>Modo</legend>
        <div className="treino-opcoes">
          <label className={`treino-opcao ${!cronometrado ? 'marcada' : ''}`}>
            <input type="radio" name="modo" checked={!cronometrado} onChange={() => setCronometrado(false)} />
            <strong>Prática</strong><small>Sem tempo. Pense com calma.</small>
          </label>
          <label className={`treino-opcao ${cronometrado ? 'marcada' : ''}`}>
            <input type="radio" name="modo" checked={cronometrado} onChange={() => setCronometrado(true)} />
            <strong>Cronometrado</strong><small>{SEGUNDOS_POR_PERGUNTA} segundos por pergunta, como numa entrevista.</small>
          </label>
        </div>
      </fieldset>

      <div className="trilha-acoes"><Button onClick={comecar} disabled={ocupado || !resumo.liberado || semPerguntas || total(nivel) === 0}>{ocupado ? 'Preparando…' : 'Começar treino'}</Button></div>
    </>}

    {fase === 'perguntando' && pergunta && <section className="treino-pergunta" aria-live="polite">
      <div className="treino-topo">
        <Tag tone="blue">{`PERGUNTA ${indice + 1} DE ${perguntas.length}`}</Tag>
        <Tag tone="gray">{rotuloDoNivel(pergunta.nivel).toUpperCase()}</Tag>
        {pergunta.tema && <Tag tone="gray">{pergunta.tema.toUpperCase()}</Tag>}
        {cronometrado && <span className={`treino-tempo ${restante <= 10 && !atual ? 'urgente' : ''}`} role="timer" aria-label={`${restante} segundos restantes`}>{atual ? '—' : `${restante}s`}</span>}
      </div>
      <Progress value={((indice + (atual ? 1 : 0)) / perguntas.length) * 100} />
      {cronometrado && !atual && <Progress value={(restante / SEGUNDOS_POR_PERGUNTA) * 100} pink />}
      <h2>{pergunta.enunciado}</h2>
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}
      <div className="treino-alternativas" role="group" aria-label="Alternativas">
        {pergunta.opcoes.map(o => {
          const estado = !atual ? '' : o.letra === atual.resposta.letraCerta ? 'certa' : o.letra === atual.letra ? 'errada' : ''
          return (
            <button key={o.letra} type="button" className={`treino-alternativa ${estado}`} disabled={!!atual || ocupado} onClick={() => responder(o.letra)}>
              <b>{o.letra}</b><span>{o.texto}</span>
            </button>
          )
        })}
      </div>
      {atual && <div className={`treino-feedback ${atual.resposta.correta ? 'certa' : 'errada'}`} role="status">
        <strong>{atual.resposta.correta ? 'Resposta certa!' : atual.letra === null ? `O tempo acabou. A resposta era ${atual.resposta.letraCerta}.` : `Não foi dessa vez. A resposta era ${atual.resposta.letraCerta}.`}</strong>
        <p>{atual.resposta.feedback}</p>
        <Button onClick={proxima} icon="arrow">{indice + 1 >= perguntas.length ? 'Ver resultado' : 'Próxima pergunta'}</Button>
      </div>}
    </section>}

    {fase === 'resultado' && <section className="treino-resultado">
      <PageTitle eyebrow="TREINO CONCLUÍDO" title={`${acertos} de ${registros.length} certas`} subtitle={acertos === registros.length ? 'Gabaritou! Que tal subir a dificuldade?' : 'Reveja as que errou abaixo e treine de novo.'} />
      <Progress value={registros.length ? (acertos / registros.length) * 100 : 0} pink />
      {registros.some(r => !r.resposta.correta) && <div className="treino-revisao">
        <h2>Para rever</h2>
        {registros.filter(r => !r.resposta.correta).map(r => (
          <article key={r.pergunta.id} className="trilha-card">
            <h3>{r.pergunta.enunciado}</h3>
            <p className="trilha-aviso">{r.letra === null ? 'Sem resposta (tempo esgotado).' : `Você marcou ${r.letra}.`} A certa era <strong>{r.resposta.letraCerta}) {r.pergunta.opcoes.find(o => o.letra === r.resposta.letraCerta)?.texto}</strong></p>
            <p className="trilha-resumo">{r.resposta.feedback}</p>
          </article>
        ))}
      </div>}
      <div className="trilha-acoes">
        <Button onClick={comecar} disabled={ocupado}>Treinar de novo</Button>
        <Button variant="ghost" onClick={() => setFase('config')}>Mudar as opções</Button>
        <Button variant="ghost" onClick={voltar}>Voltar à ilha</Button>
      </div>
    </section>}
  </div></AppShell>
}
