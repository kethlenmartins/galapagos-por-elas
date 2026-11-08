import type { ConteudoAdmin } from '../../contratos.ts'

/** Conteúdos fictícios. As URLs usam example.com de propósito. */
export const CONTEUDOS_INICIAIS: ConteudoAdmin[] = [
  {
    id: 'cont-1',
    titulo: 'O que é valuation?',
    tipo: 'artigo',
    areaId: 'equity-research',
    resumo: 'Entenda como se estima quanto vale uma empresa.',
    corpo:
      'Valuation é o processo de estimar quanto uma empresa vale.\n\nExistem várias formas de fazer isso. Uma das mais comuns compara a empresa com outras parecidas, usando múltiplos como preço sobre lucro. Outra projeta o dinheiro que a empresa vai gerar no futuro e traz esse valor para os dias de hoje.\n\nNenhum método dá um número exato: o valuation é uma estimativa, e o que importa é explicar bem as hipóteses usadas.',
    url: null,
    minutos: 6,
    caseIds: ['case-1'],
  },
  {
    id: 'cont-2',
    titulo: 'Lendo um balanço',
    tipo: 'video',
    areaId: 'corporate-finance',
    resumo: 'Um passo a passo para entender o que está em cada parte do balanço.',
    corpo: null,
    url: 'https://example.com/videos/lendo-um-balanco',
    minutos: 12,
    caseIds: ['case-1'],
  },
  {
    id: 'cont-3',
    titulo: 'Termos para ler uma demonstração de resultados',
    tipo: 'glossario',
    areaId: 'equity-research',
    resumo: 'Receita, EBITDA, margem e lucro líquido, em linguagem simples.',
    corpo:
      '**Receita**: tudo o que a empresa vendeu no período.\n\n**EBITDA**: o resultado da operação antes de juros, impostos, depreciação e amortização.\n\n**Margem**: o resultado dividido pela receita, em porcentagem.\n\n**Lucro líquido**: o que sobra depois de todas as despesas, juros e impostos.\n\n**Dívida líquida**: a dívida total menos o dinheiro em caixa.',
    url: null,
    minutos: 4,
    caseIds: ['case-1'],
  },
  {
    id: 'cont-4',
    titulo: 'Como funciona o mercado de crédito',
    tipo: 'link',
    areaId: 'credito-risco',
    resumo: 'Uma visão geral de quem empresta, quem toma e como o risco é medido.',
    corpo: null,
    url: 'https://example.com/leituras/mercado-de-credito',
    minutos: 8,
    caseIds: ['case-2'],
  },
]
