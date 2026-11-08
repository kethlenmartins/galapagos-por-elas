import type { Area } from '../../contratos.ts'
import { AREAS_FIT } from '../../fit/matriz.ts'

/**
 * As 13 áreas do diagnóstico (PRD v1.1). Os ids e os nomes vêm da matriz de fit;
 * os textos abaixo são descrições gerais da área, não critérios de seleção.
 * [A REVISAR] Redação editorial pendente.
 */
const TEXTOS: Record<string, { oQueFaz: string; descricao: string }> = {
  'investment-banking': {
    oQueFaz: 'Ajuda empresas a captar dinheiro, fazer aquisições e fechar grandes negócios.',
    descricao: 'Estrutura operações como ofertas de ações e fusões e aquisições, com muita análise, prazos apertados e trabalho em equipe.',
  },
  'asset-management': {
    oQueFaz: 'Escolhe onde investir o dinheiro de clientes e instituições para ele render ao longo do tempo.',
    descricao: 'Monta e acompanha carteiras de investimento a partir da análise de empresas, setores e cenários.',
  },
  'wealth-management': {
    oQueFaz: 'Cuida do patrimônio de clientes, com atendimento próximo e planejamento financeiro.',
    descricao: 'Entende os objetivos de cada cliente e recomenda como investir, proteger e transmitir o patrimônio.',
  },
  'equity-research': {
    oQueFaz: 'Estuda empresas e setores e escreve análises que orientam decisões de investimento.',
    descricao: 'Constrói modelos financeiros, projeta resultados e explica o que os números significam.',
  },
  'sales-trading': {
    oQueFaz: 'Compra e vende ativos no mercado e atende clientes que querem negociar, em tempo real.',
    descricao: 'Acompanha preços, executa ordens e conversa com clientes durante o pregão, em ritmo rápido.',
  },
  quant: {
    oQueFaz: 'Usa matemática, estatística e programação para entender mercados e criar estratégias.',
    descricao: 'Finanças quantitativas: constrói modelos e sistemas que testam hipóteses com dados.',
  },
  'credito-risco': {
    oQueFaz: 'Avalia quem pode receber crédito e mede o que pode dar errado nas decisões financeiras.',
    descricao: 'Analisa a capacidade de pagamento, define limites e acompanha os riscos da carteira de empréstimos.',
  },
  fintechs: {
    oQueFaz: 'Cria produtos e serviços financeiros com tecnologia, em empresas jovens e de crescimento rápido.',
    descricao: 'Atua em empresas que misturam finanças, tecnologia e negócio, com muita experimentação e autonomia.',
  },
  'venture-capital': {
    oQueFaz: 'Investe em startups em fase inicial e apoia o crescimento delas.',
    descricao: 'Procura empresas novas e promissoras, conversa com fundadores e acompanha cada investimento por muitos anos.',
  },
  'private-equity': {
    oQueFaz: 'Compra participação em empresas para desenvolvê-las e vendê-las mais valorizadas.',
    descricao: 'Analisa negócios a fundo, negocia as compras e trabalha com as empresas para melhorar seus resultados.',
  },
  'corporate-finance': {
    oQueFaz: 'Cuida das finanças dentro de uma empresa: orçamento, caixa, investimentos e financiamento.',
    descricao: 'Planeja o futuro financeiro da empresa e apoia as decisões da diretoria com análises.',
  },
  macroeconomia: {
    oQueFaz: 'Estuda a economia como um todo, como juros, inflação e crescimento, e o que isso muda nos mercados.',
    descricao: 'Acompanha dados e políticas econômicas, projeta cenários e explica seus efeitos para investidores.',
  },
  operacoes: {
    oQueFaz: 'Garante que as operações financeiras aconteçam corretamente, no prazo e com controle.',
    descricao: 'Cuida de processos, liquidação, conciliações e sistemas que mantêm o dia a dia funcionando.',
  },
}

export const AREAS: Area[] = AREAS_FIT.map(a => ({ id: a.id, nome: a.nome, ...TEXTOS[a.id] }))
