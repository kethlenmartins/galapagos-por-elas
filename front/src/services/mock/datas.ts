/**
 * Funções puras de data. A semana dos cases segue o horário de Brasília
 * (UTC-3 fixo: o Brasil não usa horário de verão desde 2019).
 */
import type { DataISO } from '../contratos.ts'

const MS_HORA = 3_600_000
const MS_DIA = 24 * MS_HORA
const DESLOCAMENTO_BRT = -3 * MS_HORA

/** 0 = domingo ... 6 = sábado, no horário de Brasília. */
export function diaDaSemanaBRT(data: Date | DataISO): number {
  const instante = typeof data === 'string' ? new Date(data) : data
  return new Date(instante.getTime() + DESLOCAMENTO_BRT).getUTCDay()
}

/** Segunda-feira 00:00 (Brasília) da próxima semana. */
export function proximaSegunda(agora: Date): Date {
  const deslocado = new Date(agora.getTime() + DESLOCAMENTO_BRT)
  const dia = deslocado.getUTCDay()
  const diasAteSegunda = (8 - dia) % 7 || 7
  const meiaNoiteUTC = Date.UTC(deslocado.getUTCFullYear(), deslocado.getUTCMonth(), deslocado.getUTCDate())
  return new Date(meiaNoiteUTC + diasAteSegunda * MS_DIA - DESLOCAMENTO_BRT)
}

/** Sexta-feira 23:59 (Brasília) da semana que começa na segunda dada. */
export function sextaDaSemana(segunda: Date): Date {
  return new Date(segunda.getTime() + 4 * MS_DIA + 23 * MS_HORA + 59 * 60_000)
}

export const depoisDe = (base: Date, ms: number): DataISO => new Date(base.getTime() + ms).toISOString()
export const antesDe = (base: Date, ms: number): DataISO => new Date(base.getTime() - ms).toISOString()

export const MINUTO = 60_000
export const HORA = MS_HORA
export const DIA = MS_DIA

/** Segunda-feira 00:00 (Brasília) da semana (segunda a domingo) que contém `data`. */
export function inicioDaSemana(data: Date): Date {
  const deslocado = new Date(data.getTime() + DESLOCAMENTO_BRT)
  const desdeSegunda = (deslocado.getUTCDay() + 6) % 7
  const meiaNoiteUTC = Date.UTC(deslocado.getUTCFullYear(), deslocado.getUTCMonth(), deslocado.getUTCDate())
  return new Date(meiaNoiteUTC - desdeSegunda * MS_DIA - DESLOCAMENTO_BRT)
}

/** Identifica a semana: duas datas da mesma semana têm a mesma chave. */
export const chaveDaSemana = (data: Date): string => inicioDaSemana(data).toISOString()

/**
 * Prazo de um case escolhido em `escolhidoEm` (PRD_Cases_Trilha.md):
 * escolhido de segunda a terça, vale a sexta da mesma semana; de quarta a domingo, a sexta da semana
 * seguinte, para nunca sobrar só um ou dois dias. Sempre sexta-feira, 23h59 (Brasília).
 */
export function prazoDoCase(escolhidoEm: Date): Date {
  const segunda = inicioDaSemana(escolhidoEm)
  const dia = diaDaSemanaBRT(escolhidoEm)
  const mesmaSemana = dia === 1 || dia === 2
  return sextaDaSemana(mesmaSemana ? segunda : new Date(segunda.getTime() + 7 * MS_DIA))
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** "7 de novembro de 2026", no horário de Brasília. */
export function dataPorExtenso(data: Date | DataISO): string {
  const d = new Date((typeof data === 'string' ? new Date(data) : data).getTime() + DESLOCAMENTO_BRT)
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

/** Ano e mês (1 a 12) no horário de Brasília. */
export function anoEMes(data: Date | DataISO): { ano: number; mes: number } {
  const d = new Date((typeof data === 'string' ? new Date(data) : data).getTime() + DESLOCAMENTO_BRT)
  return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 }
}
