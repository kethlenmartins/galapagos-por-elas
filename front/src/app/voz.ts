/**
 * Voz no navegador (Web Speech API): ditado em pt-BR e leitura das perguntas em voz alta.
 * O áudio não passa pelo nosso servidor; quem transcreve é o navegador (no Chrome, o serviço dele).
 * Sem suporte, as funções avisam e a tela segue só com texto.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

type EventoResultado = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }
type Reconhecedor = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: EventoResultado) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type ConstrutorReconhecedor = new () => Reconhecedor

const construtor = (): ConstrutorReconhecedor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: ConstrutorReconhecedor; webkitSpeechRecognition?: ConstrutorReconhecedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const ditadoDisponivel = (): boolean => construtor() !== null
export const falaDisponivel = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

/** Junta o que já estava escrito com o trecho ditado, com um espaço no meio e sem espaços duplicados. */
export function juntarTexto(base: string, trecho: string): string {
  const novo = trecho.trim()
  if (!novo) return base
  const antes = base.trimEnd()
  return antes ? `${antes} ${novo}` : novo
}

const MENSAGENS: Record<string, string> = {
  'not-allowed': 'O navegador não liberou o microfone. Permita o acesso e tente de novo, ou escreva a resposta.',
  'service-not-allowed': 'O navegador não liberou o microfone. Permita o acesso e tente de novo, ou escreva a resposta.',
  'audio-capture': 'Não encontrei um microfone neste aparelho.',
  'no-speech': 'Não ouvi nada. Fale mais perto do microfone ou escreva a resposta.',
  network: 'O reconhecimento de voz precisa de internet. Escreva a resposta ou tente de novo.',
}

/**
 * Ditado: `iniciar` começa a ouvir e chama `aoTexto` com o trecho final de cada frase.
 * `parcial` é o que o navegador ainda está entendendo (para mostrar enquanto a pessoa fala).
 */
export function useDitado(aoTexto: (trecho: string) => void) {
  const [ouvindo, setOuvindo] = useState(false)
  const [parcial, setParcial] = useState('')
  const [erro, setErro] = useState('')
  const rec = useRef<Reconhecedor | null>(null)
  const callback = useRef(aoTexto)
  callback.current = aoTexto

  const parar = useCallback(() => {
    rec.current?.stop()
  }, [])

  /** Para de ouvir e descarta o que ainda estava sendo entendido (usado ao enviar a resposta). */
  const cancelar = useCallback(() => {
    const r = rec.current
    if (!r) return
    r.onresult = null
    r.abort()
  }, [])

  const iniciar = useCallback(() => {
    const Ctor = construtor()
    if (!Ctor) return setErro('Este navegador não faz ditado. Escreva a resposta.')
    if (rec.current) return
    setErro('')
    const r = new Ctor()
    r.lang = 'pt-BR'
    r.continuous = true
    r.interimResults = true
    r.onresult = e => {
      let provisorio = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const parte = e.results[i]
        if (parte.isFinal) callback.current(parte[0].transcript)
        else provisorio += parte[0].transcript
      }
      setParcial(provisorio)
    }
    r.onerror = e => {
      if (e.error !== 'aborted') setErro(MENSAGENS[e.error] ?? 'O ditado falhou. Escreva a resposta.')
    }
    r.onend = () => {
      rec.current = null
      setOuvindo(false)
      setParcial('')
    }
    rec.current = r
    try {
      r.start()
      setOuvindo(true)
    } catch {
      rec.current = null
      setErro('Não consegui iniciar o microfone. Escreva a resposta.')
    }
  }, [])

  useEffect(() => () => rec.current?.abort(), [])

  return { ouvindo, parcial, erro, iniciar, parar, cancelar, disponivel: ditadoDisponivel() }
}

/** Leitura em voz alta em pt-BR. `falando` fica verdadeiro até terminar, para a tela pausar o cronômetro. */
export function useFala() {
  const [falando, setFalando] = useState(false)

  const parar = useCallback(() => {
    if (falaDisponivel()) window.speechSynthesis.cancel()
    setFalando(false)
  }, [])

  const falar = useCallback((texto: string) => {
    if (!falaDisponivel() || !texto.trim()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'pt-BR'
    const voz = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('pt-br'))
    if (voz) u.voice = voz
    u.onend = () => setFalando(false)
    u.onerror = () => setFalando(false)
    setFalando(true)
    window.speechSynthesis.speak(u)
  }, [])

  useEffect(() => () => {
    if (falaDisponivel()) window.speechSynthesis.cancel()
  }, [])

  return { falando, falar, parar, disponivel: falaDisponivel() }
}
