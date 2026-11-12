import { useEffect, useState } from 'react'
import { irParaEditor, parametroDoHash } from '../../app/rotas'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { AIBadge, PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { adminCasesService, catalogoService } from '../../services'
import type { Area, BriefingCase, CaseAdmin, ConferenciaGabarito, Dificuldade, ErroServico, SecaoCase } from '../../services'
import { STATUS_CASE } from './statusCase'

type Aba = 'contexto' | 'checkpoints' | 'tarefas' | 'gabarito' | 'revisao'
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'contexto', rotulo: 'Contexto' },
  { id: 'checkpoints', rotulo: 'Checkpoints' },
  { id: 'tarefas', rotulo: 'Tarefas' },
  { id: 'gabarito', rotulo: 'Gabarito' },
  { id: 'revisao', rotulo: 'Revisão e publicação' },
]

const BRIEFING_INICIAL: BriefingCase = {
  areaId: '', dificuldade: 'iniciante', tema: '', numCheckpoints: 4, numTarefas: 3, tipoDados: 'demonstracoes_financeiras', observacoes: '',
}

const numero = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0)

/** Número digitado como texto: guarda o que a pessoa escreve ("12." e "12,5" continuam válidos) e só entrega o valor lido. */
function CampoNumero({ rotulo, valor, desabilitado, aoMudar }: { rotulo: string; valor: number; desabilitado: boolean; aoMudar: (n: number) => void }) {
  const [texto, setTexto] = useState(String(valor))
  const invalido = texto.trim() === '' || !Number.isFinite(Number(texto.replace(',', '.')))
  return <label className={`field ${invalido ? 'field-error' : ''}`}><span>{rotulo}</span>
    <input type="text" inputMode="decimal" value={texto} disabled={desabilitado} aria-invalid={invalido || undefined}
      onChange={e => {
        setTexto(e.target.value)
        const n = Number(e.target.value.replace(',', '.'))
        if (e.target.value.trim() !== '' && Number.isFinite(n)) aoMudar(n)
      }}/>
    {invalido && <small className="error-text">Digite um número.</small>}</label>
}

function Briefing({ aoGerar }: { aoGerar: (caso: CaseAdmin) => void }) {
  const [areas, setAreas] = useState<Area[]>([])
  const [b, setB] = useState<BriefingCase>(BRIEFING_INICIAL)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<ErroServico | null>(null)
  const campo = <K extends keyof BriefingCase>(k: K, v: BriefingCase[K]) => setB(atual => ({ ...atual, [k]: v }))

  useEffect(() => {
    catalogoService.listarAreas().then(r => r.dados && setAreas(r.dados))
  }, [])

  const gerar = async () => {
    setGerando(true)
    setErro(null)
    const r = await adminCasesService.gerarRascunhoComIA(b)
    setGerando(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro)
      return
    }
    aoGerar(r.dados)
  }
  const e = erro?.campos ?? {}

  return <section className="briefing-card content-card">
    <div className="ai-banner"><div><span><Icon name="spark"/></span><div><strong>Geração assistida por IA <AIBadge compact admin/></strong><p>A IA sugere. A equipe revisa contexto, tarefas e gabarito antes de publicar.</p></div></div></div>
    <div className="form-row">
      <label className={`field ${e.areaId ? 'field-error' : ''}`}><span>Área</span><select value={b.areaId} onChange={x => campo('areaId', x.target.value)}><option value="" disabled>Selecione uma área</option>{areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>{e.areaId && <small className="error-text">{e.areaId}</small>}</label>
      <label className="field"><span>Dificuldade</span><select value={b.dificuldade} onChange={x => campo('dificuldade', x.target.value as Dificuldade)}><option value="iniciante">Introdutório</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></select></label>
    </div>
    <Field label="Tema do case" placeholder="Ex.: Análise de uma empresa de varejo em crescimento" value={b.tema} onChange={v => campo('tema', v)} error={e.tema}/>
    <div className="form-row">
      <Field label="Número de checkpoints" type="number" value={String(b.numCheckpoints)} onChange={v => campo('numCheckpoints', numero(v))} error={e.numCheckpoints}/>
      <Field label="Número de tarefas" type="number" value={String(b.numTarefas)} onChange={v => campo('numTarefas', numero(v))} error={e.numTarefas}/>
    </div>
    <label className="field"><span>Tipo de dados de apoio</span><select value={b.tipoDados} onChange={x => campo('tipoDados', x.target.value as BriefingCase['tipoDados'])}><option value="demonstracoes_financeiras">Demonstrações financeiras</option><option value="carteira_de_ativos">Carteira de ativos</option><option value="credito">Crédito</option><option value="outro">Outro</option></select></label>
    <label className="field"><span>Observações para a geração</span><textarea rows={4} value={b.observacoes} onChange={x => campo('observacoes', x.target.value)}/></label>
    {erro && !erro.campos && <div className="alert alert-error">{erro.mensagem}</div>}
    <Button onClick={gerar} disabled={gerando} icon="spark">{gerando ? 'Gerando rascunho...' : 'Gerar rascunho com IA'}</Button>
    {gerando && <div className="generating-state"><span/><div><strong>Organizando contexto e tarefas</strong><p>Isso pode levar alguns segundos.</p></div></div>}
  </section>
}

function CabecalhoSecao({ titulo, secao, ia, bloqueado, regenerando, aoRegenerar }: {
  titulo: string; secao: SecaoCase; ia: boolean; bloqueado: boolean; regenerando: SecaoCase | null; aoRegenerar: (s: SecaoCase) => void
}) {
  return <div className="ai-section-head"><h2>{titulo} {ia && <AIBadge admin/>}</h2>
    {!bloqueado && <button onClick={() => aoRegenerar(secao)} disabled={regenerando !== null}><Icon name="spark"/>{regenerando === secao ? 'Regenerando...' : 'Regenerar seção'}</button>}</div>
}

function EditorDoCase({ inicial }: { inicial: CaseAdmin }) {
  const [caso, setCaso] = useState(inicial)
  const [sujo, setSujo] = useState(false)
  const [aba, setAba] = useState<Aba>('contexto')
  const [regenerando, setRegenerando] = useState<SecaoCase | null>(null)
  const [conferencia, setConferencia] = useState<ConferenciaGabarito | null>(null)
  const [confirmou, setConfirmou] = useState(false)
  const [aviso, setAviso] = useState<{ tom: 'success' | 'error'; texto: string } | null>(null)
  const [camposComErro, setCamposComErro] = useState<Record<string, string>>({})
  const [ocupado, setOcupado] = useState(false)

  const bloqueado = caso.status === 'publicado' || caso.status === 'arquivado'
  const alterar = (parcial: Partial<CaseAdmin>) => {
    setCaso(c => ({ ...c, ...parcial }))
    setSujo(true)
    setAviso(null)
  }
  const falhou = (erro: ErroServico) => {
    if (sessaoExpirou(erro)) return
    setCamposComErro(erro.campos ?? {})
    setAviso({ tom: 'error', texto: erro.mensagem })
  }
  const aplicar = (novo: CaseAdmin, texto?: string) => {
    setCaso(novo)
    setSujo(false)
    setCamposComErro({})
    setAviso(texto ? { tom: 'success', texto } : null)
  }

  const salvar = async (): Promise<boolean> => {
    setOcupado(true)
    const r = await adminCasesService.salvarCase(caso)
    setOcupado(false)
    if (r.erro) {
      falhou(r.erro)
      return false
    }
    aplicar(r.dados, 'Rascunho salvo.')
    setConferencia(null)
    setConfirmou(false)
    return true
  }

  const regenerar = async (secao: SecaoCase) => {
    if (sujo && !(await salvar())) return
    setRegenerando(secao)
    const r = await adminCasesService.regenerarSecao(caso.id, secao)
    setRegenerando(null)
    if (r.erro) return falhou(r.erro)
    aplicar(r.dados, 'Seção regenerada. Confira o texto antes de seguir.')
    setConferencia(null)
    setConfirmou(false)
  }

  const conferir = async () => {
    if (sujo && !(await salvar())) return
    const r = await adminCasesService.conferirGabarito(caso.id)
    if (r.erro) return falhou(r.erro)
    setConferencia(r.dados)
  }

  const transicao = async (acao: 'aprovar' | 'publicar' | 'arquivar') => {
    if (sujo && !(await salvar())) return
    setOcupado(true)
    const r = acao === 'aprovar' ? await adminCasesService.aprovarCase(caso.id, { gabaritoConfirmado: confirmou })
      : acao === 'publicar' ? await adminCasesService.publicarCase(caso.id)
      : await adminCasesService.arquivarCase(caso.id)
    setOcupado(false)
    if (r.erro) return falhou(r.erro)
    aplicar(r.dados, acao === 'aprovar' ? 'Case revisado. Agora ele pode ser publicado.' : acao === 'publicar' ? 'Case publicado. Ele já aparece na trilha.' : 'Case arquivado.')
  }

  const status = STATUS_CASE[caso.status]
  const cab = (titulo: string, secao: SecaoCase) => <CabecalhoSecao titulo={titulo} secao={secao} ia={caso.geradoPorIA} bloqueado={bloqueado} regenerando={regenerando} aoRegenerar={regenerar}/>

  return <>
    <PageTitle eyebrow={bloqueado ? 'CASE' : 'REVISAR CASE'} title={caso.titulo || 'Sem título'} subtitle={bloqueado ? 'Cases publicados e arquivados não podem ser editados.' : 'Edite e confira cada seção antes de publicar.'}
      action={!bloqueado ? <div className="editor-actions"><Button variant="ghost" onClick={salvar} disabled={ocupado || !sujo}>Salvar rascunho</Button></div> : undefined}/>
    <div className="editor-layout">
      <nav className="editor-nav" aria-label="Seções do case">{ABAS.map((x, i) => <button key={x.id} className={aba === x.id ? 'active' : ''} onClick={() => setAba(x.id)}><span>{i + 1}</span>{x.rotulo}</button>)}</nav>
      <section className="editor-form content-card">
        <div className="draft-status"><Tag tone={status.tom}>{status.rotulo.toUpperCase()}</Tag><span>{sujo ? 'Alterações não salvas' : 'Tudo salvo'}</span></div>
        {aviso && <div className={`alert alert-${aviso.tom}`} role="status">{aviso.texto}</div>}

        {aba === 'contexto' && <>
          {cab('Contexto', 'contexto')}
          <Field label="Título" value={caso.titulo} onChange={v => alterar({ titulo: v })} error={camposComErro.titulo}/>
          <label className="field"><span>Resumo (aparece na trilha)</span><textarea rows={2} value={caso.resumo} disabled={bloqueado} onChange={x => alterar({ resumo: x.target.value })}/></label>
          <label className="field"><span>Missão</span><textarea rows={2} value={caso.missao} disabled={bloqueado} onChange={x => alterar({ missao: x.target.value })}/></label>
          <label className="field"><span>Contexto da situação</span><textarea rows={6} value={caso.contexto} disabled={bloqueado} onChange={x => alterar({ contexto: x.target.value })}/></label>
          {caso.personagem && <p className="hint">Personagem: <strong>{caso.personagem.nome}</strong>, {caso.personagem.papel}</p>}
        </>}

        {aba === 'checkpoints' && <>
          {cab('Checkpoints', 'checkpoints')}
          {caso.checkpoints.map((c, i) => <div className="editor-checkpoint" key={c.id}><span>{i + 1}</span>
            <div className="editor-edit"><input aria-label={`Título do checkpoint ${i + 1}`} value={c.titulo} disabled={bloqueado} onChange={x => alterar({ checkpoints: caso.checkpoints.map(k => k.id === c.id ? { ...k, titulo: x.target.value } : k) })}/>
              <textarea aria-label={`Descrição do checkpoint ${i + 1}`} rows={2} value={c.descricao} disabled={bloqueado} onChange={x => alterar({ checkpoints: caso.checkpoints.map(k => k.id === c.id ? { ...k, descricao: x.target.value } : k) })}/></div>
            <span className="pts-badge">+{c.pontos} pts</span></div>)}
          <p className="hint">Os pontos de cada checkpoint seguem a regra geral (20 no “entenda a área”, 30 nos demais) e não mudam por case.</p>
        </>}

        {aba === 'tarefas' && <>
          {cab('Tarefas', 'tarefas')}
          {caso.tarefas.map((t, i) => <div className="editor-task" key={t.id}>
            <div className="editor-task-head"><strong>Tarefa {i + 1}</strong><Tag tone={t.correcao === 'numerica' ? 'blue' : 'pink'}>{t.correcao === 'numerica' ? 'Correção por código' : 'Correção assistida'}</Tag></div>
            <Field label="Título" value={t.titulo} onChange={v => alterar({ tarefas: caso.tarefas.map(k => k.id === t.id ? { ...k, titulo: v } : k) })}/>
            <label className="field"><span>Enunciado</span><textarea rows={4} value={t.enunciado} disabled={bloqueado} onChange={x => alterar({ tarefas: caso.tarefas.map(k => k.id === t.id ? { ...k, enunciado: x.target.value } : k) })}/></label>
            <p className="hint">{t.campos.length} {t.campos.length === 1 ? 'campo' : 'campos'} de resposta · nota máxima {t.notaMaxima}</p>
          </div>)}
        </>}

        {aba === 'gabarito' && <>
          {cab('Gabarito numérico', 'gabarito')}
          {caso.dadosApoio && <div className="table-scroll"><table><caption>{caso.dadosApoio.titulo}</caption><thead><tr><th/>{caso.dadosApoio.colunas.map(c => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{caso.dadosApoio.linhas.map(l => <tr key={l.rotulo}><td><strong>{l.rotulo}</strong></td>{l.celulas.map((c, i) => <td key={i}>{c.texto}</td>)}</tr>)}</tbody></table></div>}
          {caso.gabarito.length === 0 && <p className="hint">Este case não tem itens numéricos.</p>}
          {caso.gabarito.map(g => <div className="answer-key" key={g.id}>
            <p><strong>Cálculo esperado</strong><span>{g.descricao}</span></p>
            <CampoNumero rotulo={`Resultado (${g.unidade})`} valor={g.valorEsperado} desabilitado={bloqueado} aoMudar={n => alterar({ gabarito: caso.gabarito.map(k => k.id === g.id ? { ...k, valorEsperado: n } : k) })}/>
            <CampoNumero rotulo={`Tolerância (± ${g.unidade})`} valor={g.tolerancia} desabilitado={bloqueado} aoMudar={n => alterar({ gabarito: caso.gabarito.map(k => k.id === g.id ? { ...k, tolerancia: n } : k) })}/>
          </div>)}
        </>}

        {aba === 'revisao' && <>
          <h2>Revisão e publicação</h2>
          {!bloqueado && <>
            <p>1. Confira o gabarito contra os dados de apoio. O sistema refaz as contas e não confia só no que a IA sugeriu.</p>
            <div><Button variant="ghost" onClick={conferir} disabled={ocupado}>Conferir gabarito</Button></div>
            {conferencia && <div className={`alert ${conferencia.confere ? 'alert-success' : 'alert-warning'}`}><Icon name={conferencia.confere ? 'check' : 'clock'}/><div>
              <strong>{conferencia.confere ? 'O gabarito confere com os dados' : 'Divergência encontrada no gabarito'}</strong>
              <ul>{conferencia.itens.map(i => <li key={i.itemId}>{i.descricao}: gabarito {i.valorGabarito}{i.valorCalculado === null ? ' (sem fórmula para conferir)' : i.confere ? ' ✓' : `, cálculo ${i.valorCalculado}`}</li>)}</ul></div></div>}
            <p>2. Aprove o case. Depois de aprovado, ele fica pronto para publicar.</p>
            <label className="checkbox review-check"><input type="checkbox" checked={confirmou} disabled={caso.status === 'revisado'} onChange={x => setConfirmou(x.target.checked)}/><span><strong>Revisei o gabarito e confirmo os valores</strong><small>Obrigatório para aprovar.</small></span></label>
            <div className="editor-actions">
              <Button onClick={() => transicao('aprovar')} disabled={ocupado || caso.status === 'revisado' || !confirmou}>Aprovar case</Button>
              <Button onClick={() => transicao('publicar')} disabled={ocupado || caso.status !== 'revisado' || sujo}>Publicar</Button>
            </div>
            <p className="hint">Ao publicar, o case entra na trilha: aparece para quem já o destravou e segue a ordem das ilhas. Editar um case revisado exige uma nova aprovação.</p>
          </>}
          {caso.status === 'publicado' && <><p>Este case está na trilha. Ao arquivar, ele sai da oferta; quem já começou mantém o progresso e o certificado.</p><div><Button variant="danger" onClick={() => transicao('arquivar')} disabled={ocupado}>Arquivar case</Button></div></>}
          {caso.status === 'arquivado' && <p>Case arquivado. Não aparece mais para novas escolhas.</p>}
        </>}
      </section>
    </div>
  </>
}

export function AdminEditor() {
  const id = parametroDoHash('id')
  const [caso, setCaso] = useState<CaseAdmin | null>(null)
  const [fase, setFase] = useState<'carregando' | 'briefing' | 'editando' | 'erro'>(id ? 'carregando' : 'briefing')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!id) return
    adminCasesService.obterCase(id).then(r => {
      if (r.erro) {
        if (!sessaoExpirou(r.erro)) {
          setMensagem(r.erro.mensagem)
          setFase('erro')
        }
        return
      }
      setCaso(r.dados)
      setFase('editando')
    })
  }, [id])

  const gerado = (novo: CaseAdmin) => {
    // Troca o endereço sem recarregar a tela, para o refresh voltar a este case.
    window.history.replaceState(null, '', `#/admin-editor?id=${encodeURIComponent(novo.id)}`)
    setCaso(novo)
    setFase('editando')
  }

  const passo = fase === 'editando' ? 2 : 1
  return <AppShell route="admin-editor" admin>
    <div className="editor-head"><button className="back-link" onClick={() => go('admin-cases')}>← Voltar para cases</button></div>
    {fase === 'briefing' && <><PageTitle eyebrow="NOVO CASE" title="Briefing do case" subtitle="Dê as diretrizes para a IA criar uma primeira estrutura."/>
      <div className="generation-steps"><div className="active"><span>1</span><strong>Briefing</strong></div><i/><div><span>2</span><strong>Rascunho editável</strong></div><i/><div><span>3</span><strong>Revisão e publicação</strong></div></div>
      <Briefing aoGerar={gerado}/></>}
    {fase === 'carregando' && <p aria-busy="true">Carregando…</p>}
    {fase === 'erro' && <><div className="alert alert-error">{mensagem}</div><Button variant="ghost" onClick={() => irParaEditor()}>Criar um case novo</Button></>}
    {fase === 'editando' && caso && <>{passo === 2 && <EditorDoCase key={caso.id} inicial={caso}/>}</>}
  </AppShell>
}
