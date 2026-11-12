/**
 * Funções puras de data, no horário de Brasília
 * (UTC-3 fixo: o Brasil não usa horário de verão desde 2019).
 */
import type { DataISO } from '../contratos.ts'

const MS_HORA = 3_600_000
const MS_DIA = 24 * MS_HORA
const DESLOCAMENTO_BRT = -3 * MS_HORA

export const depoisDe = (base: Date, ms: number): DataISO => new Date(base.getTime() + ms).toISOString()
export const antesDe = (base: Date, ms: number): DataISO => new Date(base.getTime() - ms).toISOString()

export const MINUTO = 60_000
export const HORA = MS_HORA
export const DIA = MS_DIA

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
