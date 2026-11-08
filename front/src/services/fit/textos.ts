import type { DimensaoId } from './tipos.ts'

/**
 * Frases curtas de cada polo, usadas nos cards das áreas ("Mais analítica").
 * Descrevem tendências de trabalho; nunca capacidade ou adequação.
 * [A REVISAR] Redação editorial pendente, como as perguntas (PRD, seção 12).
 */
export const FRASES: Record<DimensaoId, { polo0: string; polo100: string }> = {
  D1: { polo0: 'mais especialista', polo100: 'mais generalista' },
  D2: { polo0: 'mais analítica', polo100: 'mais relacional' },
  D3: { polo0: 'mais aplicada', polo100: 'mais abstrata' },
  D4: { polo0: 'mais domínio técnico', polo100: 'mais impacto e influência' },
  D5: { polo0: 'resultados mais imediatos', polo100: 'construção de longo prazo' },
  D6: { polo0: 'mais estruturada', polo100: 'mais exploratória' },
  D7: { polo0: 'trabalho mais individual', polo100: 'trabalho mais em equipe' },
  D8: { polo0: 'mais direcionamento', polo100: 'mais autonomia' },
  D9: { polo0: 'rotina mais previsível', polo100: 'ritmo mais dinâmico' },
  D10: { polo0: 'mais análise aprofundada', polo100: 'decisão mais rápida' },
  D11: { polo0: 'atuação nos bastidores', polo100: 'mais exposição e interação' },
  D12: { polo0: 'mais pesquisa e planejamento', polo100: 'mais execução e implementação' },
}

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** Junta itens em português: "a", "a e b", "a, b e c". */
export function listar(itens: string[]): string {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}
