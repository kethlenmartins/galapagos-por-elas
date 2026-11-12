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
    oQueFaz: 'Administra carteiras e fundos conforme objetivos, limites de risco, liquidez e regras do mandato.',
    descricao: 'A equipe decide como alocar patrimônio, acompanha desempenho e controla concentração, liquidez, custos e governança.',
  },
  'wealth-management': {
    oQueFaz: 'Assessora pessoas e famílias na gestão do patrimônio: investimentos, planejamento financeiro, proteção, tributação e sucessão, sempre a partir dos objetivos da cliente.',
    descricao: 'Wealth Management organiza o patrimônio de uma pessoa ou família a partir do que ela quer alcançar, e não a partir de produtos. A atuação pode acontecer em private banking, assessoria de investimentos, consultoria de investimentos, gestão de patrimônio e family office ou planejamento financeiro. O trabalho com a cliente passa por descoberta, perfil (suitability), proposta de plano e alocação e acompanhamento. As vagas pedem Excel, comunicação, conhecimento de produtos, ética e escuta.',
  },
  'equity-research': {
    oQueFaz: 'Analisa empresas listadas em bolsa, projeta seus resultados e estima quanto suas ações valem, para recomendar a investidores se devem comprar, manter ou vender.',
    descricao: 'A analista de Equity Research estuda o negócio de uma empresa, projeta receita, margens e caixa e estima o valor da ação por métodos como fluxo de caixa descontado e múltiplos. Ela constrói cenários, calcula o potencial do preço-alvo sobre o preço atual e escreve uma tese com riscos e catalisadores. Pode atuar no sell-side (bancos e corretoras), no buy-side (gestoras de fundos) ou em casas de research independente. A recomendação orienta investidores, mas nunca garante o resultado.',
  },
  'sales-trading': {
    oQueFaz: 'Compra e vende ativos financeiros, como juros, câmbio, ações, crédito privado, derivativos e commodities, para clientes e para o próprio banco, na mesa de operações de bancos e corretoras.',
    descricao: 'Sales & Trading é a mesa de operações de bancos e corretoras. Sales atende clientes institucionais, como gestoras, fundos de pensão, seguradoras e empresas, leva ideias de investimento e de proteção e traz a operação para a mesa. Trading dá o preço, executa as operações e administra o risco das posições do banco, dentro de limites; muitas vezes faz market making, oferecendo preço de compra e de venda ao mesmo tempo e ganhando na diferença.',
  },
  quant: {
    oQueFaz: 'Aplica matemática, estatística e programação para modelar preços, riscos e estratégias financeiras.',
    descricao: 'A área testa hipóteses com dados, constrói modelos e sistemas e controla vieses, custos e riscos fora da amostra.',
  },
  'credito-risco': {
    oQueFaz: 'Avalia capacidade de pagamento, define condições de concessão e acompanha perdas potenciais.',
    descricao: 'A área analisa renda ou caixa, dívidas, garantias e histórico, além de monitorar políticas, limites e risco da carteira.',
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
    oQueFaz: 'Cuida das decisões financeiras dentro de uma empresa: em que investir, como pagar e como gerir o dinheiro do dia a dia.',
    descricao: 'Corporate Finance (finanças corporativas) é a área financeira dentro das empresas, como uma indústria, uma varejista ou uma empresa de tecnologia. Diferente do Investment Banking, que assessora empresas de fora, aqui a profissional vive as consequências das decisões. As principais equipes são FP&A, Tesouraria, Controladoria, Relações com Investidores e M&A corporativo. No dia a dia, há fechamento do mês, posição de caixa, análises de variação e, em ciclos, forecast, orçamento e business cases de novos investimentos.',
  },
  macroeconomia: {
    oQueFaz: 'Quem trabalha com macroeconomia lê os dados da economia do país (juros, inflação, emprego e dólar) e projeta o que deve acontecer, para orientar onde investir.',
    descricao: 'Macroeconomia é olhar a economia do país inteiro: juros, inflação, emprego, dólar. Economistas em departamentos econômicos de bancos, gestoras, consultorias e áreas de estratégia de empresas leem esses dados e projetam o que deve acontecer. Os gestores usam essas projeções para decidir onde investir: se a economista prevê juros subindo, a gestora pode ajustar a carteira antes.',
  },
  operacoes: {
    oQueFaz: 'Registra, confere, liquida, guarda e controla as operações do mercado financeiro, para que as decisões de compra, venda e resgate aconteçam de verdade e sem erro.',
    descricao: 'Depois que a gestora decide comprar, o trader fecha o negócio ou o cliente pede um resgate, é Operações que registra, confere, liquida (troca o ativo pelo dinheiro), guarda e controla. Ela fica nos bancos, corretoras, gestoras, administradoras e custodiantes de fundos e na própria B3, em equipes como back office, middle office, custódia, controladoria de fundos, cadastro e prevenção à lavagem de dinheiro e tesouraria operacional. Sem ela, nenhuma decisão sai do papel, e um erro pequeno pode virar um prejuízo grande.',
  },
}

export const AREAS: Area[] = AREAS_FIT.map(a => ({ id: a.id, nome: a.nome, ...TEXTOS[a.id] }))
