import { useEffect, useState } from 'react'
import { authenticate, sessaoExpirou } from '../../app/sessao'
import { go } from '../../app/rotas'
import { PageTitle } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { LevelCard } from '../../componentes/CartaoNivel'
import { Icon, type IconName } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { perfilService, sessaoService } from '../../services'
import type { ErroServico, Perfil as PerfilDados, PreferenciasEmail } from '../../services'
import { ESCOLARIDADES, OBJETIVOS, UFS } from './opcoesPerfil'

type Aba = 'data' | 'security' | 'notifications' | 'privacy'
type Aviso = { tom: 'success' | 'error'; texto: string }

const PREFERENCIAS: { id: keyof PreferenciasEmail; titulo: string; texto: string }[] = [
  { id: 'novosCases', titulo: 'Novos cases', texto: 'Avise quando um case for publicado.' },
  { id: 'lembretesPrazo', titulo: 'Lembretes', texto: 'Receba um aviso quando houver novidades no seu case.' },
  { id: 'novosConteudos', titulo: 'Novos conteúdos', texto: 'Novidades para apoiar sua jornada.' },
]

function Dados({ perfil, aoSalvar }: { perfil: PerfilDados; aoSalvar: (p: PerfilDados) => void }) {
  const [f, setF] = useState({ nome: perfil.nome, nomeSocial: perfil.nomeSocial ?? '', cidade: perfil.cidade ?? '', uf: perfil.uf ?? '', escolaridade: perfil.escolaridade ?? '', objetivo: perfil.objetivo ?? '' })
  const [erro, setErro] = useState<ErroServico | null>(null)
  const [ok, setOk] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const campos = erro?.campos ?? {}
  const alterar = (parcial: Partial<typeof f>) => { setF(a => ({ ...a, ...parcial })); setOk(false) }

  const salvar = async () => {
    setOcupado(true)
    const r = await perfilService.atualizarPerfil(f)
    setOcupado(false)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro)
      return
    }
    setErro(null)
    setOk(true)
    aoSalvar(r.dados.perfil)
  }

  return <section className="content-card profile-form"><h2>Dados pessoais</h2>
    <div className="form-row"><Field label="Nome" value={f.nome} onChange={v => alterar({ nome: v })} error={campos.nome}/><Field label="Nome social" value={f.nomeSocial} onChange={v => alterar({ nomeSocial: v })}/></div>
    <Field label="E-mail" value={perfil.email} onChange={() => {}} hint="Para trocar o e-mail, fale com a equipe."/>
    <div className="form-row"><Field label="Cidade" value={f.cidade} onChange={v => alterar({ cidade: v })}/>
      <label className="field"><span>Estado</span><select value={f.uf} onChange={e => alterar({ uf: e.target.value })}><option value="">Selecione</option>{UFS.map(u => <option key={u}>{u}</option>)}</select></label></div>
    <div className="form-row"><label className="field"><span>Escolaridade</span><select value={f.escolaridade} onChange={e => alterar({ escolaridade: e.target.value })}><option value="">Selecione</option>{ESCOLARIDADES.map(u => <option key={u}>{u}</option>)}</select></label>
      <label className="field"><span>Principal objetivo</span><select value={f.objetivo} onChange={e => alterar({ objetivo: e.target.value })}><option value="">Selecione</option>{OBJETIVOS.map(u => <option key={u}>{u}</option>)}</select></label></div>
    {erro && !erro.campos && <div className="alert alert-error">{erro.mensagem}</div>}
    <div><Button onClick={salvar} disabled={ocupado}>Salvar alterações</Button>{ok && <span className="inline-success"><Icon name="check"/> Dados salvos.</span>}</div></section>
}

function Seguranca({ aviso }: { aviso: (a: Aviso) => void }) {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState<ErroServico | null>(null)
  const [local, setLocal] = useState<string | null>(null)
  const campos = erro?.campos ?? {}

  const alterar = async () => {
    setLocal(null)
    if (nova !== confirma) return setLocal('As senhas não são iguais.')
    const r = await sessaoService.alterarSenha(atual, nova)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErro(r.erro)
      return
    }
    setErro(null); setAtual(''); setNova(''); setConfirma('')
    aviso({ tom: 'success', texto: 'Senha atualizada.' })
  }
  const sairDeTodos = async () => {
    await sessaoService.sairDeTodosOsAparelhos()
    authenticate(null)
    go('login')
  }

  return <section className="content-card profile-form"><h2>Alterar senha</h2><p>Mantenha sua conta protegida com uma senha segura.</p>
    <Field label="Senha atual" type="password" autoComplete="current-password" value={atual} onChange={setAtual} error={campos.senhaAtual}/>
    <div className="form-row"><Field label="Nova senha" type="password" autoComplete="new-password" value={nova} onChange={setNova} error={campos.novaSenha} hint="Mínimo de 8 caracteres."/><Field label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirma} onChange={setConfirma} error={local ?? undefined}/></div>
    <div><Button onClick={alterar}>Atualizar senha</Button></div><hr/>
    <div><h2>Sessões ativas</h2><p>Encerre o acesso em todos os celulares e computadores, inclusive neste.</p></div><div><Button variant="ghost" onClick={sairDeTodos}>Sair de todos os aparelhos</Button></div></section>
}

export function Profile() {
  const [aba, setAba] = useState<Aba>('data')
  const [perfil, setPerfil] = useState<PerfilDados | null>(null)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [excluir, setExcluir] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroExcluir, setErroExcluir] = useState<string | undefined>()

  useEffect(() => {
    perfilService.obterPerfil().then(r => {
      if (r.erro) {
        if (!sessaoExpirou(r.erro)) setAviso({ tom: 'error', texto: r.erro.mensagem })
        return
      }
      setPerfil(r.dados)
    })
  }, [])

  const preferencia = async (id: keyof PreferenciasEmail, valor: boolean) => {
    if (!perfil) return
    const anterior = perfil
    setPerfil({ ...perfil, preferenciasEmail: { ...perfil.preferenciasEmail, [id]: valor } })
    const r = await perfilService.atualizarPerfil({ preferenciasEmail: { [id]: valor } })
    if (r.erro) {
      setPerfil(anterior)
      if (!sessaoExpirou(r.erro)) setAviso({ tom: 'error', texto: r.erro.mensagem })
    }
  }

  const baixarDados = async () => {
    const r = await perfilService.exportarMeusDados()
    if (r.erro) return void (!sessaoExpirou(r.erro) && setAviso({ tom: 'error', texto: r.erro.mensagem }))
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.dados, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'meus-dados-galapagos-por-elas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const excluirConta = async () => {
    const r = await sessaoService.excluirConta(senha)
    if (r.erro) {
      if (!sessaoExpirou(r.erro)) setErroExcluir(r.erro.campos?.senha ?? r.erro.mensagem)
      return
    }
    authenticate(null)
    go('landing')
  }

  const abas: [Aba, string, IconName][] = [['data', 'Dados', 'user'], ['security', 'Segurança', 'lock'], ['notifications', 'Notificações', 'mail'], ['privacy', 'Privacidade', 'settings']]
  return <AppShell route="profile"><PageTitle eyebrow="SUA CONTA" title="Perfil e configurações" subtitle="Cuide dos seus dados e acompanhe sua evolução."/>
    <div className="profile-shortcuts"><LevelCard/><button onClick={() => go('certificates')}><span><Icon name="award"/></span><div><strong>Meus certificados</strong><small>Acesse e baixe suas conquistas</small></div><Icon name="chevron"/></button></div>
    {aviso && <div className={`alert alert-${aviso.tom}`} role="status">{aviso.texto}</div>}
    <div className="profile-layout"><nav className="profile-tabs">{abas.map(([id, rotulo, icone]) => <button key={id} className={aba === id ? 'active' : ''} onClick={() => setAba(id)}><Icon name={icone}/>{rotulo}</button>)}</nav>
      <div>{!perfil ? <p aria-busy="true">Carregando…</p> : <>
        {aba === 'data' && <Dados perfil={perfil} aoSalvar={setPerfil}/>}
        {aba === 'security' && <Seguranca aviso={setAviso}/>}
        {aba === 'notifications' && <section className="content-card settings-list"><h2>Preferências de e-mail</h2>{PREFERENCIAS.map(p => <label key={p.id}><span><strong>{p.titulo}</strong><small>{p.texto}</small></span><input type="checkbox" checked={perfil.preferenciasEmail[p.id]} onChange={e => preferencia(p.id, e.target.checked)}/></label>)}</section>}
        {aba === 'privacy' && <section className="content-card profile-form"><div><h2>Seus dados</h2><p>Você pode baixar uma cópia dos dados associados à sua conta.</p></div><div><Button variant="ghost" icon="download" onClick={baixarDados}>Baixar meus dados</Button></div><hr/>
          <div className="danger-zone"><h2>Excluir conta</h2><p>Seu perfil, respostas, progresso e certificados serão removidos. Esta ação não pode ser desfeita.</p><Button variant="danger" onClick={() => setExcluir(true)}>Excluir minha conta</Button></div></section>}</>}</div></div>
    {excluir && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-label="Excluir conta"><button className="modal-close" onClick={() => { setExcluir(false); setSenha(''); setErroExcluir(undefined) }} aria-label="Fechar"><Icon name="close"/></button><span className="round-icon danger-icon"><Icon name="lock"/></span><h2>Excluir sua conta?</h2><p className="modal-copy">Esta ação apagará permanentemente seus dados pessoais, progresso, entregas e certificados.</p>
      <Field label="Digite sua senha para confirmar" type="password" value={senha} onChange={setSenha} error={erroExcluir}/>
      <div className="modal-actions"><Button variant="ghost" onClick={() => { setExcluir(false); setSenha(''); setErroExcluir(undefined) }}>Cancelar</Button><Button variant="danger" onClick={excluirConta}>Excluir permanentemente</Button></div></div></div>}</AppShell>
}
