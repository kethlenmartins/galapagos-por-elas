/** Datas para a tela, sempre no horário de Brasília. */
const FUSO = 'America/Sao_Paulo'

const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: FUSO })
const diaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: FUSO })
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO })
const completa = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: FUSO })

/** "sexta-feira, 14/11 às 23:59" */
export const dataEHora = (iso: string) => `${diaCurto.format(new Date(iso))} às ${hora.format(new Date(iso))}`

/** "7 de novembro de 2026" */
export const dataLonga = (iso: string) => completa.format(new Date(iso))

/** "14:32" */
export const horaCurta = (iso: string) => hora.format(new Date(iso))

/** "9 a 13 de novembro" (ou "27 de outubro a 2 de novembro" quando cruza o mês). */
export function faixaDaSemana(inicioIso: string, fimIso: string): string {
  const a = new Date(inicioIso)
  const b = new Date(fimIso)
  const mesA = new Intl.DateTimeFormat('pt-BR', { month: 'numeric', timeZone: FUSO }).format(a)
  const mesB = new Intl.DateTimeFormat('pt-BR', { month: 'numeric', timeZone: FUSO }).format(b)
  if (mesA === mesB) return `${new Intl.DateTimeFormat('pt-BR', { day: 'numeric', timeZone: FUSO }).format(a)} a ${dia.format(b)}`
  return `${dia.format(a)} a ${dia.format(b)}`
}

/** Menos de 24 horas para o prazo. */
export const prazoProximo = (prazoIso: string, agora = Date.now()) => {
  const restante = new Date(prazoIso).getTime() - agora
  return restante > 0 && restante < 24 * 3_600_000
}

/** "2d 14h restantes", "5h restantes", "Prazo encerrado". */
export function prazoRestante(prazoIso: string, agora = Date.now()): string {
  const minutos = Math.floor((new Date(prazoIso).getTime() - agora) / 60_000)
  if (minutos <= 0) return 'Prazo encerrado'
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  if (dias) return `${dias}d ${horas}h restantes`
  return horas ? `${horas}h restantes` : `${minutos} min restantes`
}

/** "Hoje, 14:32", "Ontem, 19:10" ou "12 nov, 17:45". */
export function dataDoEvento(iso: string, agora = Date.now()): string {
  const chave = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(t)
  const d = new Date(iso).getTime()
  const h = horaCurta(iso)
  if (chave(d) === chave(agora)) return `Hoje, ${h}`
  if (chave(d) === chave(agora - 86_400_000)) return `Ontem, ${h}`
  return `${new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: FUSO }).format(d).replace('.', '')}, ${h}`
}
