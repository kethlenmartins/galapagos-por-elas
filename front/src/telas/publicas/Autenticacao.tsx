import { type FormEvent, type ReactNode, useState } from 'react'
import { sessaoService } from '../../services'
import { go } from '../../app/rotas'
import { authenticate } from '../../app/sessao'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { Logo } from '../../componentes/Logo'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="auth-page"><div className="auth-brand"><Logo light/><div><span className="eyebrow eyebrow-light">GALAPAGOS POR ELAS</span><h2>Conhecimento abre portas.<br/>Prática leva você além.</h2><p>Uma jornada feita para você descobrir, aprender e conquistar seu espaço no mercado financeiro.</p></div><small>Feito para mulheres que querem ir além.</small></div><main className="auth-main"><button className="back-link" onClick={() => go('landing')}>← Voltar para o início</button><div className="auth-box"><h1>{title}</h1><p>{subtitle}</p>{children}</div></main></div>
}

const FORCA = ['Muito fraca', 'Fraca', 'Boa', 'Forte', 'Muito forte']

/** Força da senha de 0 a 4 (só orienta a pessoa; a regra que vale é a do serviço). */
function forcaDaSenha(senha: string): number {
  if (!senha) return 0
  const pontos = [senha.length >= 8, /[A-Z]/.test(senha) && /[a-z]/.test(senha), /\d/.test(senha), /[^A-Za-z0-9]/.test(senha) || senha.length >= 12]
  return pontos.filter(Boolean).length
}

export function Signup() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [aceitou, setAceitou] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [campos, setCampos] = useState<Record<string, string>>({})
  const [erro, setErro] = useState('')
  const forca = forcaDaSenha(senha)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setCampos({ confirmar: 'As senhas não são iguais.' }); return }
    setCampos({})
    setCarregando(true)
    const r = await sessaoService.cadastrar({ nome, email, senha, aceitouTermos: aceitou })
    setCarregando(false)
    if (r.erro) { setCampos(r.erro.campos ?? {}); setErro(r.erro.campos ? '' : r.erro.mensagem); return }
    authenticate(r.dados)
    go('onboarding')
  }

  return <AuthLayout title="Crie sua conta" subtitle="Comece agora sua jornada no mercado financeiro.">
    <form onSubmit={enviar} className="form-stack" noValidate>
      {erro && <div className="alert alert-error" role="alert">{erro}</div>}
      <Field label="Nome completo" placeholder="Como você quer ser chamada?" value={nome} onChange={setNome} error={campos.nome} autoComplete="name"/>
      <Field label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={setEmail} error={campos.email} autoComplete="email"/>
      <Field label="Senha" type="password" placeholder="Crie uma senha segura" hint={`Mínimo de ${8} caracteres.`} value={senha} onChange={setSenha} error={campos.senha} autoComplete="new-password"/>
      <div className="password-strength" aria-live="polite">{[0, 1, 2, 3].map(i => <span key={i} className={forca > i ? 'on' : ''}/>)}<small>Força da senha: {FORCA[forca]}</small></div>
      <Field label="Confirmar senha" type="password" placeholder="Repita sua senha" value={confirmar} onChange={setConfirmar} error={campos.confirmar} autoComplete="new-password"/>
      <label className="checkbox"><input type="checkbox" checked={aceitou} onChange={e => setAceitou(e.target.checked)}/><span>Li e aceito os <button type="button" onClick={() => go('terms')}>Termos de uso</button> e a <button type="button" onClick={() => go('privacy')}>Política de privacidade</button>.</span></label>
      {campos.termos && <small className="error-text">{campos.termos}</small>}
      <p className="privacy-note"><Icon name="lock" size={15}/> Usamos seus dados só para a plataforma. Veja a Política de privacidade.</p>
      <Button type="submit" disabled={carregando}>{carregando ? 'Criando conta...' : 'Criar conta'}</Button>
      <p className="form-switch">Já tem uma conta? <button type="button" onClick={() => go('login')}>Entrar</button></p>
    </form>
  </AuthLayout>
}

export function Login() {
  const [portal, setPortal] = useState<'participante'|'equipe'>('participante')
  const [email, setEmail] = useState('marina@email.com')
  const [senha, setSenha] = useState('Senha123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const choosePortal = (next: 'participante'|'equipe') => {
    setPortal(next)
    setEmail(next === 'equipe' ? 'equipe@galapagos.com.br' : 'marina@email.com')
    setSenha('Senha123')
    setError('')
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await sessaoService.entrar(email, senha)
    setLoading(false)
    if (result.erro || !result.dados) { setError('E-mail ou senha incorretos.'); return }
    if (portal === 'equipe' && result.dados.papel !== 'equipe') { setError('Esta conta não tem acesso ao portal da equipe. Entre pela área de participante.'); return }
    authenticate(result.dados)
    go(result.dados.papel === 'equipe' ? 'admin-cases' : 'home')
  }
  return <AuthLayout title={portal === 'equipe' ? 'Acesso da equipe' : 'Boas-vindas de volta'} subtitle={portal === 'equipe' ? 'Entre com seu usuário de equipe para administrar a plataforma.' : 'Entre para continuar sua jornada.'}>
    <div className="portal-switch" role="tablist" aria-label="Tipo de acesso"><button className={portal==='participante'?'active':''} onClick={() => choosePortal('participante')}><Icon name="user"/> Participante</button><button className={portal==='equipe'?'active':''} onClick={() => choosePortal('equipe')}><Icon name="settings"/> Equipe</button></div>
    {portal === 'equipe' && <div className="team-login-note"><Icon name="lock"/><div><strong>Portal administrativo</strong><p>O papel é definido pela organização. Não é possível criar uma conta de equipe pelo cadastro público.</p></div></div>}
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field"><span>E-mail</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label>
      <div><label className="field"><span>Senha</span><input type="password" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="current-password"/></label><button className="forgot-link" type="button" onClick={() => go('forgot')}>Esqueci minha senha</button></div>
      <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : portal === 'equipe' ? 'Entrar na administração' : 'Entrar'}</Button>
      <div className="demo-access"><span>ACESSO DE DEMONSTRAÇÃO</span><code>{email}</code><small>Senha: Senha123</small></div>
      {portal === 'participante' && <p className="form-switch">Ainda não tem conta? <button type="button" onClick={() => go('signup')}>Criar conta</button></p>}
    </form>
  </AuthLayout>
}

export function Forgot({ reset = false }: { reset?: boolean }) {
  const [sent, setSent] = useState(false)
  return <AuthLayout title={reset ? 'Crie uma nova senha' : sent ? 'Confira seu e-mail' : 'Recupere sua senha'} subtitle={reset ? 'Escolha uma senha segura e diferente da anterior.' : sent ? 'Enviamos as instruções para marina@email.com.' : 'Informe seu e-mail e enviaremos as instruções.'}>
    {sent && !reset ? <div className="success-state"><span><Icon name="mail" size={30}/></span><p>O link é válido por 30 minutos. Não encontrou? Confira a caixa de spam.</p><Button onClick={() => go('reset')}>Abrir link de exemplo</Button><Button variant="ghost" onClick={() => setSent(false)}>Reenviar e-mail</Button></div> :
    <form className="form-stack" onSubmit={(e) => {e.preventDefault(); reset ? go('login') : setSent(true)}}>{reset ? <><Field label="Nova senha" type="password" placeholder="Nova senha"/><Field label="Confirme a nova senha" type="password" placeholder="Repita a senha"/></> : <Field label="E-mail" type="email" placeholder="voce@email.com"/>}<Button type="submit">{reset ? 'Salvar nova senha' : 'Enviar instruções'}</Button><button type="button" className="text-link centered" onClick={() => go('login')}>Voltar para entrar</button></form>}
  </AuthLayout>
}
