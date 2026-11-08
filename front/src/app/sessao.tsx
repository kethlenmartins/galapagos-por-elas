/**
 * Sessão da usuária na interface. A fonte da verdade é o serviço (`sessaoService`):
 * ao abrir o app (inclusive depois de recarregar a página) perguntamos a ele quem está logada.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { sessaoService, type ErroServico, type Sessao } from '../services'
import { go } from './rotas'

type Contexto = { sessao: Sessao | null; carregando: boolean }

const SessaoContext = createContext<Contexto>({ sessao: null, carregando: true })

let definirSessao: (sessao: Sessao | null) => void = () => {}

/** Chamada por quem entra, cadastra ou sai. */
export function authenticate(sessao: Sessao | null) {
  definirSessao(sessao)
}

export const useSessao = () => useContext(SessaoContext)

/**
 * Se o erro for de sessão expirada, desloga e leva à tela de sessão expirada.
 * Devolve `true` quando tratou, para a tela parar de processar.
 */
export function sessaoExpirou(erro: ErroServico | null): boolean {
  if (erro?.codigo !== 'SEM_LOGIN') return false
  authenticate(null)
  go('session-expired')
  return true
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    definirSessao = setSessao
    let ativo = true
    sessaoService.obterSessao().then(r => {
      if (!ativo) return
      setSessao(r.dados ?? null)
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  return <SessaoContext.Provider value={{ sessao, carregando }}>{children}</SessaoContext.Provider>
}
