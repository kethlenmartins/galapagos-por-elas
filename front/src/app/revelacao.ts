/**
 * Revelação das telas do case: as falas de uma conversa aparecem uma a uma, e as alternativas
 * só depois que a conversa do trecho terminou (senão a pessoa responde antes de ler).
 */

/** Tempo entre uma fala e a seguinte. */
export const ATRASO_MENSAGEM_MS = 3000

/** `Nome: “fala”` vira um balão de conversa. */
export const FALA = /^([^\s:“"]{1,24}(?: [^\s:“"]{1,24}){0,2}):\s*([“"].*[”"])\s*$/

export const ehFala = (linha: string): boolean => FALA.test(linha)

/**
 * Quanto esperar antes de mostrar a linha `indice` do trecho atual.
 * Narração (texto sem balão) aparece na hora; cada fala espera 3 s, menos a primeira da tarefa.
 */
export function atrasoParaMostrar(linha: string, indice: number, primeiroTrecho: boolean): number {
  if (!ehFala(linha)) return 0
  if (primeiroTrecho && indice === 0) return 0
  return ATRASO_MENSAGEM_MS
}
