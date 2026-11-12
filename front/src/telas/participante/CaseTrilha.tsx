import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './trilha.css'
import { horaCurta } from '../../app/formatos'
import { FALA, atrasoParaMostrar } from '../../app/revelacao'
import { CaminhoDeBolinhas, type NoDoCaminho } from '../../componentes/CaminhoDeBolinhas'
import { Popup } from '../../componentes/Popup'
import { CarrosselDeConteudos } from './CartaoConteudo'
import { definirCaseAtual, definirIlhaAtual, go, obterCaseAtual } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { Toast } from '../../componentes/Aviso'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { avisarPontos } from '../../componentes/Pontos'
import {
  caseService,
  conteudoService,
  type CampoResposta,
  type CaseTrilha,
  type Checkpoint,
  type Conteudo,
  type RevisaoIA,
  type ErroServico,
  type EtapaCase,
  type RespostaCampo,
  type RespostasDaTarefa,
  type ResultadoCase,
  type Tarefa,
} from '../../services'

const ROTULO_ETAPA: Record<EtapaCase, string> = { entenda: 'Entenda a área', conteudos: 'Conteúdos do case', treino: 'Treino', situacao: 'A situação', defesa: 'Defesa final' }

type Respostas = Record<string, RespostasDaTarefa>

function CampoDaTarefa({ campo, valor, erro, bloqueado, aoMudar }: {
  campo: CampoResposta
  valor: RespostaCampo | undefined
  erro?: string
  bloqueado: boolean
  aoMudar: (valor: RespostaCampo) => void
}) {
  const id = `campo-${campo.id}`
  const rotulo = campo.obrigatorio ? campo.rotulo : `${campo.rotulo} (opcional)`
  const texto = valor === null || valor === undefined ? '' : String(valor)

  if (campo.tipo === 'opcao') {
    return <fieldset className="campo-opcoes" disabled={bloqueado}>
      <legend>{rotulo}</legend>
      {campo.opcoes?.map(opcao => <label key={opcao} className={`campo-opcao ${texto === opcao ? 'ativa' : ''}`}>
        <input type="radio" name={id} checked={texto === opcao} onChange={() => aoMudar(opcao)}/>
        <span>{opcao}</span>
        {texto === opcao && <Icon name="check" size={16}/>}
      </label>)}
      {erro && <small className="error-text">{erro}</small>}
    </fieldset>
  }

  if (campo.tipo === 'texto') {
    return <div className={`field ${erro ? 'field-error' : ''}`}>
      <label htmlFor={id}><span>{rotulo}</span></label>
      <textarea id={id} rows={6} value={texto} disabled={bloqueado} maxLength={campo.limiteCaracteres} onChange={e => aoMudar(e.target.value)} aria-invalid={erro ? true : undefined}/>
      <small className="campo-contador">{texto.length}{campo.limiteCaracteres ? ` de ${campo.limiteCaracteres} caracteres` : ' caracteres'}</small>
      {erro && <small className="error-text">{erro}</small>}
    </div>
  }

  if (campo.tipo === 'arquivo') {
    return <div className="field">
      <label htmlFor={id}><span>{rotulo}</span></label>
      <input id={id} type="file" disabled={bloqueado} onChange={e => aoMudar(e.target.files?.[0]?.name ?? null)}/>
      {campo.dica && <small>{campo.dica}. Nesta versão só o nome do arquivo é guardado.</small>}
      {texto && <small>Arquivo: {texto}</small>}
    </div>
  }

  return <div className={`field ${erro ? 'field-error' : ''}`}>
    <label htmlFor={id}><span>{rotulo}</span></label>
    <div className="campo-numerico">
      <input id={id} inputMode="decimal" value={texto} disabled={bloqueado} onChange={e => aoMudar(e.target.value)} aria-invalid={erro ? true : undefined}/>
      {campo.unidade && <span className="campo-unidade">{campo.unidade}</span>}
    </div>
    {campo.dica && <small>{campo.dica}</small>}
    {erro && <small className="error-text">{erro}</small>}
  </div>
}

type Segmento = { linhas: string[]; campos: string[] | null }

/** Separa o enunciado em "telas": `[[continuar]]` divide; `[[campos: a, b]]` na 1ª linha libera esses campos. */
function dividirEnunciado(enunciado: string): Segmento[] {
  return enunciado.split(/\n[ \t]*\[\[continuar\]\][ \t]*\n/).map(bloco => {
    const linhas = bloco.split('\n')
    const m = linhas[0]?.trim().match(/^\[\[campos:\s*(.*?)\s*\]\]$/)
    return m ? { linhas: linhas.slice(1), campos: m[1].split(',').map(c => c.trim()).filter(Boolean) } : { linhas, campos: null }
  })
}

const RUMO: Record<RevisaoIA['rumo'], { titulo: string; classe: string }> = {
  no_caminho: { titulo: 'Você está no caminho certo', classe: 'certo' },
  quase: { titulo: 'Quase lá: faltam alguns ajustes', classe: 'quase' },
  rever: { titulo: 'Vale rever partes importantes', classe: 'rever' },
}

/**
 * O fechamento de uma etapa: a mentora (IA) dá uma visão geral do que a pessoa respondeu, com o que viu de bom
 * e de ruim, e só então ela avança. A revisão é automática; se a IA não responde, a pessoa avança sem ela.
 */
function PainelFechamento({ etapa, estado, revisao, mensagem, aoAvancar }: {
  etapa: string
  estado: 'lendo' | 'pronto' | 'sem_revisao'
  revisao: RevisaoIA | null
  mensagem: string
  aoAvancar: () => void
}) {
  return <section className="case-painel case-fechamento" aria-live="polite" aria-busy={estado === 'lendo'}>
    <span className="eyebrow">ETAPA CONCLUÍDA · {etapa.toUpperCase()}</span>
    {estado === 'lendo' && <>
      <h2>A mentora está lendo as suas respostas…</h2>
      <p className="trilha-dica">Em instantes você vê o que ela achou de bom e o que vale revisar. Isso não vale nota.</p>
    </>}
    {estado === 'sem_revisao' && <>
      <h2>Etapa concluída</h2>
      {mensagem && <p className="trilha-dica">{mensagem}</p>}
    </>}
    {estado === 'pronto' && revisao && <>
      <span className={`case-rumo case-rumo-${RUMO[revisao.rumo].classe}`}>{RUMO[revisao.rumo].titulo}</span>
      <p>{revisao.resumo}</p>
      <div className="case-duas-colunas">
        {revisao.pontosFortes.length > 0 && <div><h3>O que a IA viu de bom</h3><ul>{revisao.pontosFortes.map(p => <li key={p}>{p}</li>)}</ul></div>}
        {revisao.pontosAMelhorar.length > 0 && <div><h3>O que a IA viu de ruim</h3><ul>{revisao.pontosAMelhorar.map(p => <li key={p}>{p}</li>)}</ul></div>}
      </div>
      {revisao.dica && <p className="case-revisao-dica"><b>Dica:</b> {revisao.dica}</p>}
      <small>Revisão da IA só para você acompanhar o caminho: não vale nota. As respostas desta etapa já estão fechadas; a avaliação final é da equipe.</small>
    </>}
    <div className="case-acoes"><Button onClick={aoAvancar} disabled={estado === 'lendo'} icon="arrow">Avançar</Button></div>
  </section>
}

/** As linhas já reveladas do trecho. Com `digitando`, mostra o balão de quem vai falar a seguir. */
function TextoDoSegmento({ linhas, digitando }: { linhas: string[]; digitando?: string | null }) {
  return <>{linhas.map((linha, i) => {
    const fala = linha.match(FALA)
    if (!fala) return <p key={i}>{linha}</p>
    return <div key={i} className={`case-fala ${fala[1] === 'Você' ? 'case-fala-voce' : ''}`}><strong>{fala[1]}</strong><span>{fala[2]}</span></div>
  })}{digitando && <div className={`case-fala case-fala-digitando ${digitando === 'Você' ? 'case-fala-voce' : ''}`} role="status" aria-label={`${digitando} está digitando`}><strong>{digitando}</strong><span className="case-digitando" aria-hidden="true"><i/><i/><i/></span></div>}</>
}

function TarefaDoCase({ tarefa, tituloDoCheckpoint, respostas, erros, salvoEm, bloqueado, aoMudar, aoRevelar }: {
  tarefa: Tarefa
  tituloDoCheckpoint: string
  respostas: RespostasDaTarefa
  erros: Record<string, string>
  salvoEm: string | undefined
  bloqueado: boolean
  aoMudar: (campoId: string, valor: RespostaCampo) => void
  aoRevelar: (tarefaId: string, completo: boolean) => void
}) {
  const dados = tarefa.dadosApoio
  const segmentos = useMemo(() => dividirEnunciado(tarefa.enunciado).map(sg => ({ ...sg, linhas: sg.linhas.filter(l => l.trim()) })), [tarefa.enunciado])
  const ultimo = segmentos.length - 1
  // Com rascunho salvo ou somente leitura, mostra tudo de uma vez.
  const jaVisto = tarefa.somenteLeitura || Object.keys(respostas).length > 0
  const [passo, setPasso] = useState(() => (jaVisto ? ultimo : 0))
  // Quantas linhas do trecho atual já apareceram: as falas entram uma a uma.
  const [mostradas, setMostradas] = useState(() => (jaVisto ? Infinity : 0))
  const novoTrecho = useRef<HTMLDivElement>(null)
  const linhasDoTrecho = segmentos[passo]?.linhas ?? []
  const rolando = mostradas < linhasDoTrecho.length
  const completo = passo >= ultimo && !rolando
  useEffect(() => { aoRevelar(tarefa.id, completo) }, [tarefa.id, completo, aoRevelar])
  useEffect(() => {
    if (!rolando) return
    const t = window.setTimeout(() => setMostradas(m => m + 1), atrasoParaMostrar(linhasDoTrecho[mostradas], mostradas, passo === 0))
    return () => window.clearTimeout(t)
  }, [rolando, mostradas, linhasDoTrecho, passo])
  const avancar = () => { setPasso(p => p + 1); setMostradas(0); window.setTimeout(() => novoTrecho.current?.focus(), 0) }
  const proxima = rolando ? linhasDoTrecho[mostradas] : undefined
  const quemDigita = proxima?.match(FALA)?.[1] ?? null

  const liberados = new Set(segmentos.slice(0, passo + 1).flatMap(sg => sg.campos ?? []))
  const comMarcador = new Set(segmentos.flatMap(sg => sg.campos ?? []))
  const visivel = (campo: CampoResposta) => {
    // Enquanto a conversa do trecho rola, as alternativas ficam escondidas.
    if (rolando) return false
    if (comMarcador.has(campo.id) ? !liberados.has(campo.id) : !completo) return false
    if (!campo.visivelSe) return true
    const { campos, comecaCom } = campo.visivelSe
    return campos.some(id => String(respostas[id] ?? '').startsWith(comecaCom))
  }

  return <article className="case-tarefa">
    {tarefa.titulo !== tituloDoCheckpoint && <h3>{tarefa.titulo}</h3>}
    <div aria-live="polite" className="case-segmentos">
      {segmentos.slice(0, passo + 1).map((sg, i) => <div key={i} ref={i === passo ? novoTrecho : undefined} tabIndex={i === passo && i > 0 ? -1 : undefined} className="case-segmento"><TextoDoSegmento linhas={i === passo ? sg.linhas.slice(0, mostradas) : sg.linhas} digitando={i === passo ? quemDigita : null}/></div>)}
    </div>
    {rolando && <div className="case-acoes"><Button variant="ghost" onClick={() => setMostradas(Infinity)}>Mostrar tudo</Button></div>}
    {!rolando && passo < ultimo && <div className="case-acoes"><Button variant="ghost" onClick={avancar}>Continuar</Button></div>}
    {dados && completo && <div className="dados-apoio">
      <strong>{dados.titulo}</strong>
      <div className="dados-rolagem"><table>
        <thead><tr><th scope="col">Indicador</th>{dados.colunas.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{dados.linhas.map(l => <tr key={l.rotulo}><th scope="row">{l.rotulo}</th>{l.celulas.map((c, i) => <td key={i}>{c.texto}</td>)}</tr>)}</tbody>
      </table></div>
    </div>}
    <div className="form-stack">
      {tarefa.campos.filter(visivel).map(campo => <CampoDaTarefa key={campo.id} campo={campo} valor={respostas[campo.id]} erro={erros[`${tarefa.id}.${campo.id}`]} bloqueado={bloqueado} aoMudar={v => aoMudar(campo.id, v)}/>)}
    </div>
    {!bloqueado && salvoEm && <small className="case-salvo"><Icon name="check" size={14}/> Rascunho salvo às {horaCurta(salvoEm)}</small>}
  </article>
}


/** Etapa obrigatória: todos os conteúdos do case precisam estar concluídos para avançar. */
function PainelConteudos({ caseId, checkpoint, ocupado, aoConcluir }: { caseId: string; checkpoint: Checkpoint; ocupado: boolean; aoConcluir: () => void }) {
  const [lista, setLista] = useState<Conteudo[] | null>(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    conteudoService.listarConteudos({ caseId }).then(r => {
      if (r.erro) return sessaoExpirou(r.erro) ? undefined : setErro(r.erro.mensagem)
      setLista(r.dados)
    })
  }, [caseId])
  const feitos = lista?.filter(c => c.concluido).length ?? 0
  const total = lista?.length ?? 0
  const pronto = lista !== null && feitos === total
  return <section className="case-painel case-apoio" aria-label="Conteúdos do case">
    <span className="eyebrow">{ROTULO_ETAPA.conteudos.toUpperCase()}</span>
    <h2>{checkpoint.titulo}</h2>
    <p>{checkpoint.descricao} Leia ou assista a todos os conteúdos abaixo: é obrigatório para avançar para o treino.</p>
    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
    {lista === null && !erro && <p role="status">Carregando os conteúdos…</p>}
    {lista !== null && <>
      <div className="case-apoio-titulo"><span>{feitos} de {total} concluídos</span></div>
      <Progress value={total ? (feitos / total) * 100 : 100}/>
      <CarrosselDeConteudos conteudos={lista} aoConcluir={feito => setLista(l => l && l.map(x => x.id === feito.id ? feito : x))}/>
    </>}
    <div className="case-acoes"><Button onClick={aoConcluir} disabled={ocupado || !pronto}>{ocupado ? 'Concluindo…' : `Concluir esta etapa (+${checkpoint.pontos} pts)`}</Button></div>
    {lista !== null && !pronto && <small>Faltam {total - feitos} conteúdo{total - feitos > 1 ? 's' : ''} para liberar o próximo passo.</small>}
  </section>
}

function PainelEntenda({ caso, checkpoint, ocupado, aoConcluir }: { caso: CaseTrilha; checkpoint: Checkpoint; ocupado: boolean; aoConcluir: () => void }) {
  const e = caso.entenda
  // Os cards têm tamanhos de texto diferentes: na tela ficam todos do mesmo tamanho e abrem em pop-up.
  const [aberto, setAberto] = useState<number | null>(null)
  const [vistos, setVistos] = useState<Set<number>>(new Set())
  const fechar = useCallback(() => setAberto(null), [])
  const abrir = (i: number) => {
    setAberto(i)
    setVistos(v => new Set(v).add(i))
  }
  const cards = e ? [...e.cards.map(c => ({ titulo: c.titulo, resumo: c.texto })), { titulo: `Como se entra em ${caso.area}`, resumo: e.comoSeEntra.ondeSeTrabalha }] : []
  const COMO_ENTRA = cards.length - 1

  return <section className="case-painel">
    <span className="eyebrow">{ROTULO_ETAPA.entenda.toUpperCase()}</span>
    <h2>{checkpoint.titulo}</h2>
    {e ? <>
      <p>{e.resumo}</p>
      {e.links.length > 0 && <ul className="case-links">{e.links.map(l => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.titulo}<span className="visualmente-oculto"> (abre em nova aba)</span></a> <small>{l.fonte}</small></li>)}</ul>}
      <ul className="case-cards" aria-label="Cards para entender a área">
        {cards.map((c, i) => <li key={c.titulo}>
          <button className={`case-card ${vistos.has(i) ? 'visto' : ''}`} onClick={() => abrir(i)} aria-haspopup="dialog">
            <span className="case-card-num">{i === COMO_ENTRA ? 'CARREIRA' : String(i + 1).padStart(2, '0')}{vistos.has(i) && <span className="case-card-lido"><Icon name="check" size={14}/> Lido</span>}</span>
            <strong>{c.titulo}</strong>
            <span className="case-card-trecho">{c.resumo}</span>
            <span className="case-card-abrir">Abrir <Icon name="arrow" size={14}/></span>
          </button>
        </li>)}
      </ul>
      {e.cards.length > 0 && <small className="case-card-dica">{vistos.size} de {cards.length} cards abertos. Toque ou clique em um card para ler.</small>}
      {aberto !== null && (aberto === COMO_ENTRA
        ? <Popup aoFechar={fechar} idDoTitulo="card-popup-titulo">
            <h2 id="card-popup-titulo">Como se entra em {caso.area}</h2>
            <ul className="case-como-entra-lista">
              <li><b>Onde se trabalha:</b> {e.comoSeEntra.ondeSeTrabalha}</li>
              <li><b>Formações comuns:</b> {e.comoSeEntra.formacoes}</li>
              <li><b>Vagas para procurar:</b> {e.comoSeEntra.vagas}</li>
              <li><b>O que ajuda:</b> {e.comoSeEntra.oQueAjuda}</li>
              <li><b>Quando recrutam:</b> {e.comoSeEntra.quandoRecrutam}</li>
            </ul>
            <div className="trilha-acoes"><Button variant="ghost" onClick={fechar}>Fechar</Button></div>
          </Popup>
        : <Popup aoFechar={fechar} idDoTitulo="card-popup-titulo">
            <span className="case-card-num">{String(aberto + 1).padStart(2, '0')}</span>
            <h2 id="card-popup-titulo">{e.cards[aberto].titulo}</h2>
            <div className="conteudo-corpo"><p>{e.cards[aberto].texto}</p></div>
            <div className="case-na-pratica"><b>Na prática</b> {e.cards[aberto].naPratica}</div>
            <div className="trilha-acoes">
              {aberto + 1 < e.cards.length && <Button onClick={() => abrir(aberto + 1)} icon="arrow">Próximo card</Button>}
              {aberto + 1 >= e.cards.length && <Button onClick={() => abrir(COMO_ENTRA)} icon="arrow">Como se entra</Button>}
              <Button variant="ghost" onClick={fechar}>Fechar</Button>
            </div>
          </Popup>)}
    </> : <p>{checkpoint.descricao}</p>}
    <div className="case-acoes"><Button onClick={aoConcluir} disabled={ocupado}>{ocupado ? 'Concluindo…' : `Concluir esta etapa (+${checkpoint.pontos} pts)`}</Button></div>
  </section>
}

/** Sai do case de volta para a ilha da área dele. */
function voltarParaIlha(areaId: string) {
  definirCaseAtual(null)
  definirIlhaAtual(areaId)
  go('island')
}

function PainelResultado({ resultado, caso, aoRefazer, refazendo, erro }: { resultado: ResultadoCase; caso: CaseTrilha; aoRefazer: () => void; refazendo: boolean; erro: string }) {
  if (resultado.estado !== 'publicado') return null
  return <section className={`case-painel case-resultado ${resultado.aprovada ? 'aprovada' : 'nao-aprovada'}`}>
    <span className="eyebrow">RESULTADO</span>
    <div className="case-nota"><strong>{resultado.nota.toFixed(1).replace('.', ',')}</strong><span>de {resultado.notaMaxima} · mínimo {resultado.notaMinima.toFixed(1).replace('.', ',')}</span></div>
    <h2>{resultado.aprovada ? 'Você foi aprovada!' : 'Ainda não foi desta vez'}</h2>
    <p>{resultado.aprovada ? 'Seu certificado está pronto e os próximos cases já podem ser escolhidos.' : 'Você pode refazer este case e reenviar: o que você já fez antes da situação continua feito, suas respostas anteriores ficam como rascunho e os pontos já ganhos ficam guardados.'}</p>
    {resultado.feedbackGeral && <p className="case-feedback">{resultado.feedbackGeral}</p>}
    <div className="case-duas-colunas">
      {resultado.pontosFortes.length > 0 && <div><h3>Pontos fortes</h3><ul>{resultado.pontosFortes.map(p => <li key={p}>{p}</li>)}</ul></div>}
      {resultado.pontosAMelhorar.length > 0 && <div><h3>Para melhorar</h3><ul>{resultado.pontosAMelhorar.map(p => <li key={p}>{p}</li>)}</ul></div>}
    </div>
    <ul className="case-por-tarefa">
      {resultado.porTarefa.map(t => <li key={t.tarefaId}><span><strong>{t.titulo}</strong><small>{t.feedback}</small></span><b>{t.nota.toFixed(1).replace('.', ',')} / {t.notaMaxima.toFixed(1).replace('.', ',')}</b></li>)}
    </ul>
    {resultado.pontosGanhos > 0 && <p className="case-pontos"><Icon name="spark" size={16}/> +{resultado.pontosGanhos} pontos pelo resultado e pelo certificado</p>}
    <div className="case-acoes">
      {resultado.aprovada ? <Button icon="award" onClick={() => go('certificates')}>Ver meu certificado</Button> : <Button onClick={aoRefazer} disabled={refazendo}>{refazendo ? 'Preparando…' : 'Refazer este case'}</Button>}
      <Button variant="ghost" onClick={() => voltarParaIlha(caso.areaId)}>Voltar à ilha</Button>
    </div>
    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
    <small>Case: {caso.titulo} · tentativa {resultado.tentativa}</small>
  </section>
}

export function CasePage() {
  const [caso, setCaso] = useState<CaseTrilha | null>(null)
  const [resultado, setResultado] = useState<ResultadoCase | null>(null)
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [etapaEscolhida, setEtapaEscolhida] = useState<string | null>(null)
  const [fechamento, setFechamento] = useState<{ etapa: string; estado: 'lendo' | 'pronto' | 'sem_revisao'; revisao: RevisaoIA | null; mensagem: string } | null>(null)
  const [tarefas, setTarefas] = useState<Record<string, Tarefa>>({})
  const [respostas, setRespostas] = useState<Respostas>({})
  const [salvoEm, setSalvoEm] = useState<Record<string, string>>({})
  const [erros, setErros] = useState<Record<string, string>>({})
  const [reveladas, setReveladas] = useState<Record<string, boolean>>({})
  const registrarRevelada = useCallback((tarefaId: string, completo: boolean) => setReveladas(r => (r[tarefaId] === completo ? r : { ...r, [tarefaId]: completo })), [])
  const [ocupado, setOcupado] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false)
  const temporizadores = useRef<Record<string, number>>({})

  const falhou = (e: ErroServico) => {
    if (sessaoExpirou(e)) return
    setErroGeral(e.mensagem)
  }

  const carregar = useCallback(async () => {
    let id = obterCaseAtual()
    if (!id) {
      // Sem case escolhido: abre o que está em andamento, ou volta à trilha.
      const trilha = await caseService.obterTrilha()
      if (trilha.erro) {
        if (sessaoExpirou(trilha.erro)) return
        setMensagem(trilha.erro.mensagem)
        return setFase('erro')
      }
      id = trilha.dados.cases.find(c => c.estado === 'em_andamento')?.caseId ?? null
      if (!id) return go('trail')
      definirCaseAtual(id)
    }
    const r = await caseService.obterCase(id)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      definirCaseAtual(null)
      return go('trail')
    }
    const atual = r.dados
    // Ainda não escolhido: volta à trilha para escolher.
    if (atual.estado === 'disponivel' && atual.checkpoints.length === 0) return go('trail')
    setCaso(atual)

    let resultadoDoCase: ResultadoCase | null = null
    if (atual.estado !== 'em_andamento') {
      const res = await caseService.obterResultadoCase(id)
      resultadoDoCase = res.dados
    }
    setResultado(resultadoDoCase)

    const ativo = atual.estado === 'em_andamento' ? atual.checkpoints.find(c => c.status !== 'concluido') : undefined
    const carregadas: Record<string, Tarefa> = {}
    const iniciais: Respostas = {}
    if (ativo && ativo.tarefaIds.length > 0) {
      for (const tarefaId of ativo.tarefaIds) {
        const t = await caseService.obterTarefa(tarefaId)
        if (t.dados) {
          carregadas[tarefaId] = t.dados
          iniciais[tarefaId] = t.dados.rascunho ?? {}
        }
      }
    }
    setTarefas(carregadas)
    setRespostas(iniciais)
    setSalvoEm({})
    setErros({})
    setFase('ok')
  }, [])

  const refazer = async () => {
    if (!caso) return
    setOcupado(true)
    setMensagem('')
    const r = await caseService.escolherCase(caso.id)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setMensagem(r.erro.mensagem)
      return
    }
    await carregar()
  }

  useEffect(() => {
    carregar()
    const timers = temporizadores.current
    return () => Object.values(timers).forEach(t => window.clearTimeout(t))
  }, [carregar])

  /** Guarda o rascunho. Devolve `false` se o serviço recusou. */
  const salvar = async (tarefaId: string, valores: RespostasDaTarefa): Promise<boolean> => {
    const r = await caseService.salvarRascunho(tarefaId, valores)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return false
      const campos = r.erro.campos ?? {}
      setErros(e => ({ ...e, ...Object.fromEntries(Object.entries(campos).map(([campo, msg]) => [`${tarefaId}.${campo}`, msg])) }))
      if (!r.erro.campos) setErroGeral(r.erro.mensagem)
      return false
    }
    setSalvoEm(s => ({ ...s, [tarefaId]: r.dados.salvoEm }))
    return true
  }

  const mudarCampo = (tarefaId: string, campoId: string, valor: RespostaCampo) => {
    const novas = { ...(respostas[tarefaId] ?? {}), [campoId]: valor }
    setRespostas(r => ({ ...r, [tarefaId]: novas }))
    setErros(e => { const { [`${tarefaId}.${campoId}`]: _, ...resto } = e; return resto })
    window.clearTimeout(temporizadores.current[tarefaId])
    temporizadores.current[tarefaId] = window.setTimeout(() => { salvar(tarefaId, novas) }, 700)
  }

  const concluir = async (checkpoint: Checkpoint) => {
    setOcupado(true)
    setErroGeral('')
    setErros({})
    for (const tarefaId of checkpoint.tarefaIds) {
      window.clearTimeout(temporizadores.current[tarefaId])
      if (!(await salvar(tarefaId, respostas[tarefaId] ?? {}))) return setOcupado(false)
    }
    const r = await caseService.concluirCheckpoint(checkpoint.id)
    setOcupado(false)
    if (r.erro) {
      if (r.erro.campos) setErros(r.erro.campos)
      return falhou(r.erro)
    }
    avisarPontos()
    const pontos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (pontos > 0) {
      setAviso(`${pontos} ${checkpoint.titulo}`)
      window.setTimeout(() => setAviso(null), 3500)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Etapa com atividade: antes de avançar, a mentora (IA) dá uma visão geral das respostas que ela fechou.
    const comAtividade = checkpoint.tarefaIds.length > 0
    if (comAtividade) setFechamento({ etapa: ROTULO_ETAPA[checkpoint.etapa], estado: 'lendo', revisao: null, mensagem: '' })
    await carregar()
    if (!comAtividade) return
    const rev = await caseService.revisarCheckpointComIA(checkpoint.id)
    if (rev.erro && sessaoExpirou(rev.erro)) return
    setFechamento(f => f && (rev.dados
      ? { ...f, estado: 'pronto', revisao: rev.dados }
      : { ...f, estado: 'sem_revisao', mensagem: rev.erro ? rev.erro.mensagem : '' }))
  }

  const enviar = async () => {
    if (!caso) return
    setOcupado(true)
    setErroGeral('')
    const r = await caseService.enviarCase(caso.id)
    setOcupado(false)
    setConfirmandoEnvio(false)
    if (r.erro) return falhou(r.erro)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await carregar()
  }

  const refazerEtapa = async (checkpoint: Checkpoint) => {
    if (!window.confirm(`Refazer “${checkpoint.titulo}”? Esta etapa e as seguintes voltarão a ficar pendentes. Suas respostas serão mantidas para você editar.`)) return
    setOcupado(true)
    setErroGeral('')
    const r = await caseService.reabrirCheckpoint(checkpoint.id)
    setOcupado(false)
    if (r.erro) return falhou(r.erro)
    await carregar()
  }

  const alerta = erroGeral && <div className="alert alert-error" role="alert"><p>{erroGeral}</p></div>
  const ativo = caso?.estado === 'em_andamento' ? caso.checkpoints.find(c => c.status !== 'concluido') : undefined
  const feitos = caso?.checkpoints.filter(c => c.status === 'concluido').length ?? 0
  const total = caso?.checkpoints.length ?? 0

  return <AppShell route="case"><div className="case-page">
    {aviso && <Toast text={aviso} show/>}
    <button className="back-link" onClick={() => (caso ? voltarParaIlha(caso.areaId) : go('trail'))}>← Voltar para a ilha</button>

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando o case…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && caso && <>
      <PageTitle eyebrow={caso.area.toUpperCase()} title={caso.titulo} subtitle={caso.missao} />

      <div className="case-resumo">
        {caso.personagem && <span><Icon name="user" size={16}/> {caso.personagem.nome}, {caso.personagem.papel}</span>}
        {caso.tentativa > 1 && <Tag tone="gray">TENTATIVA {caso.tentativa}</Tag>}
        <span><Icon name="spark" size={16}/> Até {caso.pontosPossiveis} pontos</span>
      </div>

      <div className="case-progresso"><Progress value={total ? (feitos / total) * 100 : 0} pink/><span>{feitos} de {total} checkpoints</span></div>

      <CaminhoDeBolinhas
        orientacao="horizontal"
        rotuloDaLista="Etapas do case"
        escolhido={etapaEscolhida}
        aoEscolher={id => setEtapaEscolhida(e => (e === id ? null : id))}
        nos={caso.checkpoints.map<NoDoCaminho>(c => ({
          id: c.id,
          rotulo: ROTULO_ETAPA[c.etapa],
          detalhe: c.titulo,
          estado: c.status === 'concluido' ? 'feito' : ativo?.id === c.id ? 'atual' : 'bloqueado',
          emblema: <>{c.ordem}</>,
        }))}
      />
      {(() => {
        const c = caso.checkpoints.find(x => x.id === etapaEscolhida)
        if (!c) return null
        const feita = c.status === 'concluido'
        return <div className="case-etapa-info" role="status">
          <span><strong>{c.titulo}</strong> · {feita ? 'Concluído' : ativo?.id === c.id ? `Etapa atual (+${c.pontos} pts)` : 'Conclua as etapas anteriores para chegar aqui'}</span>
          {feita && caso.estado === 'em_andamento' && <Button variant="ghost" onClick={() => { setEtapaEscolhida(null); refazerEtapa(c) }} disabled={ocupado}>Refazer esta etapa</Button>}
        </div>
      })()}

      {caso.contexto && <details className="case-contexto" open={!ativo || ativo.etapa !== 'entenda'}><summary>O contexto do case</summary><p>{caso.contexto}</p></details>}

      {alerta}

      {fechamento && <PainelFechamento etapa={fechamento.etapa} estado={fechamento.estado} revisao={fechamento.revisao} mensagem={fechamento.mensagem} aoAvancar={() => { setFechamento(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}/>}

      {!fechamento && <>
      {ativo?.etapa === 'conteudos' && ativo.tarefaIds.length === 0 && <PainelConteudos caseId={caso.id} checkpoint={ativo} ocupado={ocupado} aoConcluir={() => concluir(ativo)}/>}

      {ativo?.etapa === 'entenda' && ativo.tarefaIds.length === 0 && <PainelEntenda caso={caso} checkpoint={ativo} ocupado={ocupado} aoConcluir={() => concluir(ativo)}/>}

      {ativo && ativo.tarefaIds.length > 0 && <section className="case-painel">
        <span className="eyebrow">{ROTULO_ETAPA[ativo.etapa].toUpperCase()}</span>
        <h2>{ativo.titulo}</h2>
        {ativo.tarefaIds.map(id => tarefas[id] && <TarefaDoCase key={id} tarefa={tarefas[id]} tituloDoCheckpoint={ativo.titulo} respostas={respostas[id] ?? {}} erros={erros} salvoEm={salvoEm[id]} bloqueado={ocupado} aoMudar={(campo, valor) => mudarCampo(id, campo, valor)} aoRevelar={registrarRevelada}/>)}
        {ativo.tarefaIds.every(id => !tarefas[id] || reveladas[id]) && <div className="case-acoes"><Button onClick={() => concluir(ativo)} disabled={ocupado}>{ocupado ? 'Concluindo…' : `Concluir etapa (+${ativo.pontos} pts)`}</Button></div>}
        <small>Depois de concluir, as respostas deste checkpoint ficam travadas.</small>
      </section>}

      {ativo && ativo.tarefaIds.length === 0 && ativo.etapa !== 'entenda' && ativo.etapa !== 'conteudos' && <section className="case-painel">
        <span className="eyebrow">{ROTULO_ETAPA[ativo.etapa].toUpperCase()}</span>
        <h2>{ativo.titulo}</h2>
        <p>{ativo.descricao}</p>
        <p className="muted">Esta etapa ainda não tem conteúdo interativo nesta versão.</p>
        <div className="case-acoes"><Button onClick={() => concluir(ativo)} disabled={ocupado}>Concluir esta etapa (+{ativo.pontos} pts)</Button></div>
      </section>}

      {caso.estado === 'em_andamento' && !ativo && <section className="case-painel">
        <span className="eyebrow">TUDO PRONTO</span>
        <h2>Enviar o case para avaliação</h2>
        <p>Você concluiu todos os checkpoints. Depois de enviar, não dá mais para alterar as respostas. A equipe revisa a avaliação e publica o resultado.</p>
        {confirmandoEnvio
          ? <div className="case-acoes"><Button onClick={enviar} disabled={ocupado}>{ocupado ? 'Enviando…' : 'Sim, enviar agora'}</Button><Button variant="ghost" onClick={() => setConfirmandoEnvio(false)} disabled={ocupado}>Ainda não</Button></div>
          : <div className="case-acoes"><Button onClick={() => setConfirmandoEnvio(true)}>Enviar para avaliação</Button></div>}
      </section>}

      </>}

      {caso.estado === 'em_avaliacao' && <section className="case-painel">
        <span className="eyebrow">EM AVALIAÇÃO</span>
        <h2>Recebemos o seu case</h2>
        <p>A avaliação está em andamento. Assim que a equipe publicar o resultado, ele aparece aqui, junto com o seu certificado se você for aprovada.</p>
        <div className="case-acoes"><Button variant="ghost" onClick={() => voltarParaIlha(caso.areaId)}>Voltar à ilha</Button></div>
      </section>}

      {resultado && <PainelResultado resultado={resultado} caso={caso} aoRefazer={refazer} refazendo={ocupado} erro={mensagem}/>}
    </>}
  </div></AppShell>
}
