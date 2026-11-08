import { useEffect, useRef, useState } from 'react'
import './diagnostico.css'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { Toast } from '../../componentes/Aviso'
import { Progress } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { avisarPontos } from '../../componentes/Pontos'
import { diagnosticoService, type ConfigDiagnostico, type ErroServico, type RespostaOpcao } from '../../services'

type Fase = 'carregando' | 'intro' | 'perguntas' | 'revisao' | 'concluido' | 'erro'

const LETRAS: RespostaOpcao[] = ['A', 'B', 'C']

/** Falas da Galá: fixas e pré-escritas. Nada aqui é gerado por IA. */
function falaAntes(indice: number, total: number): string | null {
  if (indice === 0) return `Oi! Eu sou a Galá. Vou te fazer ${total} perguntas rápidas para você descobrir como gosta de pensar e trabalhar. Não existe resposta certa.`
  if (indice === 5) return `Você já respondeu 5 de ${total}.`
  if (indice === Math.ceil(total / 2)) return `Metade do caminho: ${indice} de ${total}!`
  if (indice === 10) return `${indice} de ${total}. Falta pouco!`
  return null
}

export function Diagnostico() {
  const [fase, setFase] = useState<Fase>('carregando')
  const [config, setConfig] = useState<ConfigDiagnostico | null>(null)
  const [respostas, setRespostas] = useState<Record<string, RespostaOpcao>>({})
  const [indice, setIndice] = useState(0)
  const [voltarParaRevisao, setVoltarParaRevisao] = useState(false)
  const [retomando, setRetomando] = useState(false)
  const [ocupada, setOcupada] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const perguntas = config?.perguntas ?? []
  const total = perguntas.length
  const respondidas = perguntas.filter(p => respostas[p.id]).length
  const faltam = total - respondidas

  /** Mostra a mensagem do serviço; sessão expirada leva à tela própria. */
  const falhou = (e: ErroServico) => {
    if (sessaoExpirou(e)) return
    setErro(e.mensagem)
  }

  useEffect(() => {
    let ativo = true
    Promise.all([diagnosticoService.obterConfiguracao(), diagnosticoService.obterEstadoDiagnostico()]).then(([c, e]) => {
      if (!ativo) return
      if (c.erro || e.erro) {
        const problema = (c.erro ?? e.erro)!
        if (!sessaoExpirou(problema)) { setErro(problema.mensagem); setFase('erro') }
        return
      }
      setConfig(c.dados)
      if (e.dados.status === 'concluido') return setFase('concluido')
      const feitas = e.dados.respostas
      if (Object.keys(feitas).length === 0) return setFase('intro')
      setRespostas(feitas)
      setRetomando(true)
      const primeiraSemResposta = c.dados.perguntas.findIndex(p => !feitas[p.id])
      if (primeiraSemResposta < 0) return setFase('revisao')
      setIndice(primeiraSemResposta)
      setFase('intro')
    })
    return () => {
      ativo = false
      window.clearTimeout(temporizador.current)
    }
  }, [])

  const comecar = async () => {
    setOcupada(true)
    setErro('')
    const r = await diagnosticoService.iniciarDiagnostico()
    setOcupada(false)
    if (r.erro) return falhou(r.erro)
    setRespostas(r.dados.respostas)
    setRetomando(false)
    setIndice(0)
    setFase('perguntas')
  }

  const continuar = () => {
    setErro('')
    setFase(faltam === 0 ? 'revisao' : 'perguntas')
  }

  const escolher = async (letra: RespostaOpcao) => {
    if (ocupada || !perguntas[indice]) return
    setOcupada(true)
    setErro('')
    const r = await diagnosticoService.responderPergunta(perguntas[indice].id, letra)
    if (r.erro) { setOcupada(false); return falhou(r.erro) }
    setRespostas(r.dados.respostas)
    // Uma pausa curta deixa a escolha aparecer antes de seguir.
    temporizador.current = window.setTimeout(() => {
      setOcupada(false)
      if (voltarParaRevisao || indice >= total - 1) { setVoltarParaRevisao(false); setFase('revisao') }
      else setIndice(i => i + 1)
    }, 350)
  }

  const voltar = () => {
    if (voltarParaRevisao) { setVoltarParaRevisao(false); return setFase('revisao') }
    if (indice === 0) return setFase('intro')
    setIndice(indice - 1)
  }

  const editar = (i: number) => {
    setIndice(i)
    setVoltarParaRevisao(true)
    setFase('perguntas')
  }

  const enviar = async () => {
    setOcupada(true)
    setErro('')
    const r = await diagnosticoService.finalizarDiagnostico()
    if (r.erro) { setOcupada(false); return falhou(r.erro) }
    avisarPontos()
    const pontos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (pontos > 0) setAviso(`${pontos} Diagnóstico concluído`)
    temporizador.current = window.setTimeout(() => go('match'), pontos > 0 ? 1300 : 0)
  }

  const alerta = erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>
  const salvarDepois = <button className="text-link" onClick={() => go('home')}>Salvar e continuar depois</button>
  const rotuloProgresso = fase === 'perguntas' ? `Pergunta ${indice + 1} de ${total}` : `${respondidas} de ${total} respondidas`
  const valorProgresso = total === 0 ? 0 : ((fase === 'perguntas' ? indice + 1 : respondidas) / total) * 100

  const pergunta = perguntas[indice]
  const atual = pergunta ? respostas[pergunta.id] : undefined
  const fala = pergunta ? falaAntes(indice, total) : null

  return <AppShell route="diagnostic"><div className="diagnostic-page conversation-page">
    {aviso && <Toast text={aviso} show/>}

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando o diagnóstico…</p>}

    {fase === 'erro' && <section className="diagnostico-bloco">
      {alerta}
      <Button onClick={() => window.location.reload()}>Tentar de novo</Button>
    </section>}

    {fase === 'concluido' && <section className="diagnostico-bloco">
      <span className="round-icon"><Icon name="check" size={30}/></span>
      <h1>Você já fez o diagnóstico</h1>
      <p>Seu Mapa de Carreira está pronto. Se quiser, você pode refazer o diagnóstico: o resultado anterior fica guardado e você não ganha os pontos de novo.</p>
      {alerta}
      <div className="diagnostico-acoes diagnostico-acoes-centro">
        <Button onClick={() => go('match')}>Ver meu mapa</Button>
        <Button variant="ghost" onClick={comecar} disabled={ocupada}>Refazer diagnóstico</Button>
      </div>
    </section>}

    {fase === 'intro' && <section className="diagnostico-bloco">
      <span className="eyebrow">DIAGNÓSTICO DE FIT</span>
      <h1>Descubra como você gosta de pensar e trabalhar</h1>
      <p><strong>Este diagnóstico é exploratório. Não há respostas certas e nenhuma área será descartada.</strong></p>
      <ul className="diagnostico-lista">
        <li><Icon name="check" size={18}/> {total} perguntas, cada uma com três opções: A, B ou C (“as duas me interessam igualmente”).</li>
        <li><Icon name="check" size={18}/> No fim, seu Mapa de Carreira mostra seu perfil, seu modo de trabalho e áreas para explorar.</li>
        <li><Icon name="check" size={18}/> Você pode voltar e mudar qualquer resposta antes de enviar.</li>
      </ul>
      <p className="diagnostico-consentimento">Usamos suas respostas só para montar o seu resultado nesta plataforma. Você pode pedir para apagá-las a qualquer momento. Veja a <button type="button" className="text-link" onClick={() => go('privacy')}>Política de privacidade</button>.</p>
      {alerta}
      {retomando
        ? <div className="diagnostico-acoes diagnostico-acoes-centro">
            <Button onClick={continuar}>Continuar de onde parei ({respondidas} de {total})</Button>
            <Button variant="ghost" onClick={comecar} disabled={ocupada}>Começar de novo</Button>
          </div>
        : <div className="diagnostico-acoes diagnostico-acoes-centro"><Button onClick={comecar} disabled={ocupada || total === 0}>Começar</Button></div>}
    </section>}

    {(fase === 'perguntas' || fase === 'revisao') && <>
      <div className="diagnostic-head">
        <div><span className="eyebrow">DIAGNÓSTICO DE FIT</span><h1>{fase === 'revisao' ? 'Revise suas respostas' : 'Converse com a Galá'}</h1></div>
        {salvarDepois}
      </div>
      <div className="diagnostic-progress"><Progress value={valorProgresso}/><span>{rotuloProgresso}</span></div>
    </>}

    {fase === 'perguntas' && pergunta && <section className="conversation-card">
      {fala && <div className="conversation-log" aria-live="polite">
        <div className="message-pair"><div className="agent-name">Galá</div><div className="bubble bubble-agent">{fala}</div></div>
      </div>}
      <div className="answer-panel">
        <div className="agent-name">Galá</div>
        <div className="bubble bubble-agent current-question" id="texto-da-pergunta"><span className="pergunta-numero">{pergunta.id}</span> {pergunta.texto}</div>
        <fieldset className="opcoes-abc" aria-labelledby="texto-da-pergunta" disabled={ocupada}>
          {LETRAS.map(letra => <label key={letra} className={`opcao-abc ${atual === letra ? 'ativa' : ''}`}>
            <input type="radio" name={pergunta.id} value={letra} checked={atual === letra} onChange={() => escolher(letra)}/>
            <span className="opcao-letra" aria-hidden="true">{letra}</span>
            <span className="opcao-texto">{pergunta.opcoes[letra]}</span>
            <span className="opcao-estado" aria-hidden="true">{atual === letra && <Icon name="check" size={18}/>}</span>
          </label>)}
        </fieldset>
        {alerta}
        <div className="diagnostico-acoes">
          <Button variant="ghost" onClick={voltar} disabled={ocupada}>Voltar</Button>
          {respondidas > 0 && !voltarParaRevisao && <Button variant="ghost" onClick={() => setFase('revisao')} disabled={ocupada}>Revisar respostas</Button>}
        </div>
      </div>
    </section>}

    {fase === 'revisao' && <section className="diagnostico-bloco diagnostico-revisao">
      <div className="bubble bubble-agent">{faltam === 0 ? 'Pronto! Vamos ver o seu mapa.' : `Ainda ${faltam === 1 ? 'falta 1 pergunta' : `faltam ${faltam} perguntas`}. Responda para ver o resultado.`}</div>
      <ol className="revisao-lista">
        {perguntas.map((p, i) => {
          const letra = respostas[p.id]
          return <li key={p.id} className={`revisao-item ${letra ? '' : 'faltando'}`}>
            <span className="revisao-numero">{i + 1}</span>
            <span><strong>{p.texto}</strong><small>{letra ? `${letra}. ${p.opcoes[letra]}` : 'Sem resposta'}</small></span>
            <button className="text-link" onClick={() => editar(i)}>{letra ? 'Editar' : 'Responder'}<span className="visualmente-oculto"> pergunta {i + 1}</span></button>
          </li>
        })}
      </ol>
      {alerta}
      <div className="diagnostico-acoes">
        <Button variant="ghost" onClick={() => editar(total - 1)} disabled={ocupada}>Voltar</Button>
        <Button onClick={enviar} disabled={faltam > 0 || ocupada}>{ocupada ? 'Enviando…' : 'Ver meu resultado'}</Button>
      </div>
    </section>}

    <div className="diagnostic-footer"><span><Icon name="lock" size={14}/> Suas respostas ficam salvas a cada escolha.</span></div>
  </div></AppShell>
}
