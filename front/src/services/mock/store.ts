/**
 * Núcleo do adaptador mock: estado em memória com persistência em localStorage,
 * flags de debug e o wrapper `executar`, que aplica latência, falha de rede,
 * login e papel a toda chamada de serviço.
 */
import type { CodigoErro, ErroServico, Papel, Resultado } from '../contratos.ts'
import { criarEstadoInicial, VERSAO_ESTADO } from './dados/estado-inicial.ts'
import type { DebugMock, EstadoMock, Usuario } from './tipos.ts'

const CHAVE_ESTADO = 'galapagos:mock:estado'
const CHAVE_DEBUG = 'galapagos:mock:debug'

const DEBUG_PADRAO: DebugMock = {
  rede: false,
  iaIndisponivel: false,
  sessaoExpirada: false,
  latenciaMs: 350,
  agora: null,
}

let estado: EstadoMock | null = null
let debug: DebugMock | null = null

function armazenamento(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function lerJson<T>(chave: string): T | null {
  try {
    const bruto = armazenamento()?.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : null
  } catch {
    return null
  }
}

function gravarJson(chave: string, valor: unknown) {
  try {
    armazenamento()?.setItem(chave, JSON.stringify(valor))
  } catch {
    // Armazenamento cheio ou bloqueado: o mock continua funcionando só em memória.
  }
}

// ---------------------------------------------------------------------------
// Debug
// ---------------------------------------------------------------------------

/**
 * Flags pela URL, úteis para ver os estados de falha sem mexer no código:
 *   /?mock=rede,ia,expirada,rapido#/diagnostic
 *   /?agora=2026-11-02T08:00:00-03:00#/case
 */
function debugDaUrl(): Partial<DebugMock> {
  if (typeof location === 'undefined') return {}
  const parametros = new URLSearchParams(location.search)
  const marcas = (parametros.get('mock') ?? '').split(',').map(m => m.trim())
  const agora = parametros.get('agora')
  return {
    ...(marcas.includes('rede') ? { rede: true } : {}),
    ...(marcas.includes('ia') ? { iaIndisponivel: true } : {}),
    ...(marcas.includes('expirada') ? { sessaoExpirada: true } : {}),
    ...(marcas.includes('rapido') ? { latenciaMs: 0 } : {}),
    ...(agora && !Number.isNaN(new Date(agora).getTime()) ? { agora: new Date(agora).toISOString() } : {}),
  }
}

export function obterDebug(): DebugMock {
  if (!debug) debug = { ...DEBUG_PADRAO, ...(lerJson<Partial<DebugMock>>(CHAVE_DEBUG) ?? {}), ...debugDaUrl() }
  return debug
}

export function definirDebug(parcial: Partial<DebugMock>) {
  debug = { ...obterDebug(), ...parcial }
  gravarJson(CHAVE_DEBUG, debug)
}

export function agoraAtual(): Date {
  const simulado = obterDebug().agora
  return simulado ? new Date(simulado) : new Date()
}

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

export function obterEstado(): EstadoMock {
  if (!estado) {
    const salvo = lerJson<EstadoMock>(CHAVE_ESTADO)
    estado = salvo && salvo.versao === VERSAO_ESTADO ? salvo : criarEstadoInicial(agoraAtual())
  }
  return estado
}

export function salvarEstado() {
  if (estado) gravarJson(CHAVE_ESTADO, estado)
}

/** Volta ao estado inicial de demonstração (apaga o que foi feito). */
export function resetarEstado() {
  estado = criarEstadoInicial(agoraAtual())
  salvarEstado()
}

export function novoId(prefixo: string): string {
  const e = obterEstado()
  e.contador += 1
  return `${prefixo}-${e.contador}`
}

// ---------------------------------------------------------------------------
// Resultados
// ---------------------------------------------------------------------------

export const clonar = <T>(valor: T): T => structuredClone(valor)

export function ok<T>(dados: T): Resultado<T> {
  return { dados: clonar(dados), erro: null }
}

export function falha<T = never>(codigo: CodigoErro, mensagem: string, campos?: Record<string, string>): Resultado<T> {
  const erro: ErroServico = campos ? { codigo, mensagem, campos } : { codigo, mensagem }
  return { dados: null, erro }
}

// ---------------------------------------------------------------------------
// Execução de uma chamada de serviço
// ---------------------------------------------------------------------------

export type Contexto = {
  estado: EstadoMock
  /** Usuária logada; `null` em chamadas públicas sem sessão. */
  usuario: Usuario | null
  agora: Date
  iaDisponivel: boolean
}

type Opcoes = {
  /** Exige sessão ativa. */
  login?: boolean
  /** Exige sessão ativa com este papel. */
  papel?: Papel
}

const esperar = (ms: number) => (ms > 0 ? new Promise<void>(resolve => setTimeout(resolve, ms)) : Promise.resolve())

export async function executar<T>(opcoes: Opcoes, corpo: (contexto: Contexto) => Resultado<T>): Promise<Resultado<T>> {
  const config = obterDebug()
  await esperar(config.latenciaMs)
  if (config.rede) return falha('REDE', 'Sem conexão. Verifique sua internet e tente de novo.')

  const atual = obterEstado()
  const usuario = atual.usuarios.find(u => u.id === atual.sessaoUsuarioId) ?? null
  if (opcoes.login || opcoes.papel) {
    if (config.sessaoExpirada || !usuario) return falha('SEM_LOGIN', 'Sua sessão expirou. Entre de novo para continuar.')
    if (opcoes.papel && usuario.papel !== opcoes.papel) {
      return falha('SEM_PERMISSAO', 'Você não tem permissão para acessar esta área.')
    }
  }

  const resultado = corpo({ estado: atual, usuario, agora: agoraAtual(), iaDisponivel: !config.iaIndisponivel })
  salvarEstado()
  return resultado
}

export type ContextoLogado = Contexto & { usuario: Usuario }

/** Como `executar`, mas o corpo recebe a usuária logada já garantida. */
export function executarLogada<T>(corpo: (contexto: ContextoLogado) => Resultado<T>, papel?: Papel): Promise<Resultado<T>> {
  return executar({ login: true, papel }, contexto => corpo(contexto as ContextoLogado))
}
