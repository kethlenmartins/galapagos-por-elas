import { useEffect, useState } from 'react'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { Toast } from '../../componentes/Aviso'
import { Progress } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { AppShell } from '../../componentes/Layout'
import { avisarPontos } from '../../componentes/Pontos'
import { perfilService } from '../../services'
import type { ErroServico } from '../../services'
import { ESCOLARIDADES, OBJETIVOS, UFS } from './opcoesPerfil'

type Dados = { nomeSocial: string; dataNascimento: string; cidade: string; uf: string; escolaridade: string; objetivo: string }
const VAZIO: Dados = { nomeSocial: '', dataNascimento: '', cidade: '', uf: '', escolaridade: '', objetivo: '' }

/** Etapa onde cada campo aparece, para voltar a ela quando o serviço recusar um valor. */
const ETAPA_DO_CAMPO: Record<string, number> = { nome: 1, nomeSocial: 1, dataNascimento: 1, cidade: 2, uf: 2, escolaridade: 2, objetivo: 3 }

/** Campos obrigatórios de cada etapa, para só deixar continuar com a etapa preenchida. */
const OBRIGATORIOS: Record<number, (keyof Dados)[]> = { 1: ['dataNascimento'], 2: ['cidade', 'uf', 'escolaridade'], 3: ['objetivo'] }

export function Onboarding() {
  const [step, setStep] = useState(1)
  const [d, setD] = useState<Dados>(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<ErroServico | null>(null)
  const [faltando, setFaltando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    perfilService.obterPerfil().then(r => {
      if (r.erro) {
        sessaoExpirou(r.erro)
        return
      }
      const p = r.dados
      setD({ nomeSocial: p.nomeSocial ?? p.nome, dataNascimento: p.dataNascimento?.slice(0, 10) ?? '', cidade: p.cidade ?? '', uf: p.uf ?? '', escolaridade: p.escolaridade ?? '', objetivo: p.objetivo ?? '' })
      setCarregando(false)
    })
  }, [])

  const alterar = (parcial: Partial<Dados>) => {
    setD(atual => ({ ...atual, ...parcial }))
    setFaltando(false)
  }
  const campos = erro?.campos ?? {}
  const vazio = (k: keyof Dados) => faltando && d[k].trim() === ''

  const concluir = async () => {
    setOcupado(true)
    const r = await perfilService.atualizarPerfil({ nomeSocial: d.nomeSocial, dataNascimento: d.dataNascimento, cidade: d.cidade, uf: d.uf, escolaridade: d.escolaridade, objetivo: d.objetivo })
    setOcupado(false)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      setErro(r.erro)
      const primeira = Object.keys(r.erro.campos ?? {}).map(c => ETAPA_DO_CAMPO[c] ?? 1).sort()[0]
      if (primeira) setStep(primeira)
      return
    }
    const ganhos = r.dados.eventos.reduce((soma, e) => soma + e.pontos, 0)
    if (ganhos > 0) {
      avisarPontos()
      setAviso(`${ganhos} Perfil completo`)
    }
    setTimeout(() => go('diagnostic'), ganhos > 0 ? 1400 : 0)
  }

  const next = () => {
    if (OBRIGATORIOS[step].some(k => d[k].trim() === '')) return setFaltando(true)
    setErro(null)
    if (step < 3) setStep(step + 1)
    else concluir()
  }

  if (carregando) return <AppShell route="onboarding"><p aria-busy="true">Carregando…</p></AppShell>

  return <AppShell route="onboarding"><div className="narrow-page"><div className="onboarding-top"><span className="eyebrow">VAMOS COMEÇAR</span><h1>Queremos conhecer você</h1><p>São só algumas perguntas para personalizar sua experiência.</p><div className="step-progress"><Progress value={(step / 3) * 100}/><span>Etapa {step} de 3</span></div></div>
    <section className="form-card">
      {step === 1 && <><h2>Como podemos chamar você?</h2>
        <Field label="Nome social" value={d.nomeSocial} onChange={v => alterar({ nomeSocial: v })} error={campos.nomeSocial}/>
        <Field label="Data de nascimento" type="date" value={d.dataNascimento} onChange={v => alterar({ dataNascimento: v })} error={campos.dataNascimento ?? (vazio('dataNascimento') ? 'Informe sua data de nascimento.' : undefined)}/></>}
      {step === 2 && <><h2>De onde você está construindo sua jornada?</h2>
        <div className="form-row"><Field label="Cidade" value={d.cidade} onChange={v => alterar({ cidade: v })} error={campos.cidade ?? (vazio('cidade') ? 'Informe sua cidade.' : undefined)}/>
          <label className={`field ${campos.uf || vazio('uf') ? 'field-error' : ''}`}><span>Estado</span><select value={d.uf} onChange={e => alterar({ uf: e.target.value })}><option value="" disabled>Selecione</option>{UFS.map(u => <option key={u}>{u}</option>)}</select>{(campos.uf || vazio('uf')) && <small className="error-text">{campos.uf ?? 'Escolha seu estado.'}</small>}</label></div>
        <label className={`field ${vazio('escolaridade') ? 'field-error' : ''}`}><span>Escolaridade</span><select value={d.escolaridade} onChange={e => alterar({ escolaridade: e.target.value })}><option value="" disabled>Selecione</option>{ESCOLARIDADES.map(u => <option key={u}>{u}</option>)}</select>{vazio('escolaridade') && <small className="error-text">Escolha sua escolaridade.</small>}</label></>}
      {step === 3 && <><h2>Qual é seu principal objetivo?</h2>
        <div className="choice-list" role="radiogroup" aria-label="Principal objetivo">{OBJETIVOS.map(x => <label className="choice" key={x}><input type="radio" name="goal" checked={d.objetivo === x} onChange={() => alterar({ objetivo: x })}/><span>{x}</span></label>)}</div>
        {vazio('objetivo') && <small className="error-text">Escolha uma opção.</small>}</>}
      {erro && !erro.campos && <div className="alert alert-error">{erro.mensagem}</div>}
      <div className="form-actions">{step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Voltar</Button>}<Button onClick={next} disabled={ocupado} icon="arrow">{step === 3 ? 'Concluir perfil' : 'Continuar'}</Button></div>
    </section></div>{aviso && <Toast text={aviso} show/>}</AppShell>
}
