/**
 * Interpretação de respostas numéricas e recálculo do gabarito.
 * A conta exata é sempre do código; a IA só interpreta e explica.
 */
import type { ConferenciaGabarito, ItemGabarito, RefCelula, RespostaCampo, TabelaDados } from '../contratos.ts'

export type NumeroInterpretado = { valor: number | null; foraDoPadrao: boolean }

/**
 * Lê "12,4", "12,4%", "12.4 %", "R$ 1.234,50" e números. Vírgula é o separador
 * decimal esperado; aceitamos ponto e espaço antes da unidade, mas marcamos
 * como "fora do padrão" para a equipe ver.
 */
export function interpretarNumero(resposta: RespostaCampo): NumeroInterpretado {
  if (typeof resposta === 'number') return { valor: Number.isFinite(resposta) ? resposta : null, foraDoPadrao: false }
  if (typeof resposta !== 'string' || resposta.trim() === '') return { valor: null, foraDoPadrao: false }

  const bruto = resposta.trim()
  const limpo = bruto.replace(/r\$/gi, '').replace(/[%xX]/g, '').replace(/\s+/g, '')
  if (!/^-?[\d.,]+$/.test(limpo)) return { valor: null, foraDoPadrao: false }

  const temVirgula = limpo.includes(',')
  const normalizado = temVirgula ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const valor = Number(normalizado)
  if (!Number.isFinite(valor)) return { valor: null, foraDoPadrao: false }

  const usaPontoDecimal = !temVirgula && limpo.includes('.')
  const espacoAntesDaUnidade = /\d\s+(%|x)/i.test(bruto)
  return { valor, foraDoPadrao: usaPontoDecimal || espacoAntesDaUnidade }
}

export function valorDaCelula(tabela: TabelaDados, ref: RefCelula): number | null {
  const coluna = tabela.colunas.indexOf(ref.coluna)
  const linha = tabela.linhas.find(l => l.rotulo === ref.linha)
  if (coluna < 0 || !linha) return null
  return linha.celulas[coluna]?.valor ?? null
}

/** Recalcula o valor esperado a partir da tabela de dados. `null` se não houver fórmula ou dados. */
export function recalcularItem(item: ItemGabarito, tabela: TabelaDados | null): number | null {
  if (!item.formula || !tabela) return null
  const numerador = valorDaCelula(tabela, item.formula.numerador)
  const denominador = valorDaCelula(tabela, item.formula.denominador)
  if (numerador === null || denominador === null || denominador === 0) return null
  return (numerador / denominador) * item.formula.multiplicador
}

export function conferirGabarito(gabarito: ItemGabarito[], tabela: TabelaDados | null): ConferenciaGabarito {
  const itens = gabarito.map(item => {
    const valorCalculado = recalcularItem(item, tabela)
    const confere = valorCalculado === null ? false : Math.abs(valorCalculado - item.valorEsperado) <= item.tolerancia
    return {
      itemId: item.id,
      descricao: item.descricao,
      valorGabarito: item.valorEsperado,
      valorCalculado: valorCalculado === null ? null : Math.round(valorCalculado * 100) / 100,
      confere,
    }
  })
  return { confere: itens.every(i => i.confere), itens }
}
