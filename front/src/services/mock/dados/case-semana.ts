import type {
  CampoResposta,
  CaseAdmin,
  CelulaDados,
  CheckpointAdmin,
  ConteudoEntenda,
  ItemGabarito,
  TabelaDados,
  TarefaAdmin,
} from '../../contratos.ts'
import { DIA, antesDe } from '../datas.ts'

const celula = (texto: string, valor: number | null): CelulaDados => ({ texto, valor })

/** Dados fictícios de uma empresa de varejo (R$ milhões). Nenhuma empresa real. */
export function tabelaEmpresa(): TabelaDados {
  return {
    titulo: 'Dados da empresa (R$ milhões)',
    colunas: ['2024', '2025'],
    linhas: [
      { rotulo: 'Receita', celulas: [celula('R$ 82 mi', 82), celula('R$ 104 mi', 104)] },
      { rotulo: 'EBITDA', celulas: [celula('R$ 10,2 mi', 10.2), celula('R$ 14,7 mi', 14.7)] },
      { rotulo: 'Margem EBITDA', celulas: [celula('12,4%', 12.4), celula('14,1%', 14.1)] },
      { rotulo: 'Lucro líquido', celulas: [celula('R$ 7,0 mi', 7.0), celula('R$ 12,9 mi', 12.9)] },
      { rotulo: 'Dívida líquida', celulas: [celula('R$ 18 mi', 18), celula('R$ 31 mi', 31)] },
      { rotulo: 'Crescimento da receita', celulas: [celula('18%', 18), celula('27%', 27)] },
    ],
  }
}

export type TipoTarefa = 'margem' | 'alavancagem' | 'recomendacao' | 'analise'

const numerico = (id: string, rotulo: string, unidade: string, dica: string): CampoResposta => ({
  id,
  tipo: 'numerico',
  rotulo,
  unidade,
  dica,
  obrigatorio: true,
})

const DEFINICOES: Record<TipoTarefa, { titulo: string; enunciado: string; campos: CampoResposta[] }> = {
  margem: {
    titulo: 'Calcule a margem líquida',
    enunciado: 'Calcule a margem líquida da empresa em 2025 (lucro líquido ÷ receita × 100).',
    campos: [numerico('margem', 'Margem líquida de 2025', '%', 'Use vírgula como separador decimal. Ex.: 12,4')],
  },
  alavancagem: {
    titulo: 'Avalie o endividamento',
    enunciado: 'Calcule quantas vezes o EBITDA de 2025 cabe na dívida líquida (dívida líquida ÷ EBITDA).',
    campos: [numerico('alavancagem', 'Dívida líquida ÷ EBITDA de 2025', 'x', 'Use vírgula como separador decimal. Ex.: 2,1')],
  },
  recomendacao: {
    titulo: 'Faça sua recomendação',
    enunciado: 'Com base nos dados, você recomendaria o investimento nesta empresa? Explique os principais motivos.',
    campos: [
      { id: 'recomendacao', tipo: 'opcao', rotulo: 'Recomendação', opcoes: ['Investir', 'Investir com ressalvas', 'Não investir'], obrigatorio: true },
      { id: 'valorJusto', tipo: 'numerico', rotulo: 'Valor justo estimado', unidade: 'R$', obrigatorio: false },
      { id: 'analise', tipo: 'texto', rotulo: 'Sua análise', limiteCaracteres: 1500, obrigatorio: true },
      { id: 'planilha', tipo: 'arquivo', rotulo: 'Anexar planilha', dica: 'PDF, XLSX ou CSV, até 10 MB', obrigatorio: false },
    ],
  },
  analise: {
    titulo: 'Aponte os principais riscos',
    enunciado: 'Descreva os principais riscos que podem mudar o resultado da empresa nos próximos anos.',
    campos: [{ id: 'analise', tipo: 'texto', rotulo: 'Sua análise', limiteCaracteres: 1200, obrigatorio: true }],
  },
}

/**
 * Monta as tarefas e o gabarito de um case a partir da lista de tipos.
 * A nota total do case é sempre 10: as tarefas numéricas valem 2 cada e as
 * qualitativas dividem o restante (ou 10 divididos entre as numéricas, se não
 * houver qualitativa).
 */
export function montarTarefas(
  caseId: string,
  tipos: TipoTarefa[],
  checkpointIds: string[],
): { tarefas: TarefaAdmin[]; gabarito: ItemGabarito[] } {
  const numericas = tipos.filter(t => t === 'margem' || t === 'alavancagem').length
  const qualitativas = tipos.length - numericas
  const notaNumerica = qualitativas > 0 ? 2 : numericas > 0 ? 10 / numericas : 0
  const notaQualitativa = qualitativas > 0 ? Math.round(((10 - numericas * 2) / qualitativas) * 10) / 10 : 0

  const tarefas: TarefaAdmin[] = []
  const gabarito: ItemGabarito[] = []

  tipos.forEach((tipo, indice) => {
    const def = DEFINICOES[tipo]
    const tarefaId = `${caseId}-t-${indice + 1}`
    const numerica = tipo === 'margem' || tipo === 'alavancagem'
    tarefas.push({
      id: tarefaId,
      checkpointId: checkpointIds.length > 1 ? checkpointIds[Math.min(indice + 1, checkpointIds.length - 1)] : checkpointIds[0],
      titulo: def.titulo,
      enunciado: def.enunciado,
      campos: def.campos,
      correcao: numerica ? 'numerica' : 'qualitativa',
      notaMaxima: numerica ? notaNumerica : notaQualitativa,
    })
    if (tipo === 'margem') {
      gabarito.push({
        id: `${caseId}-g-${indice + 1}`,
        tarefaId,
        campoId: 'margem',
        descricao: 'Margem líquida de 2025',
        valorEsperado: 12.4,
        tolerancia: 0.2,
        unidade: '%',
        pontos: notaNumerica,
        formula: {
          tipo: 'razao',
          numerador: { linha: 'Lucro líquido', coluna: '2025' },
          denominador: { linha: 'Receita', coluna: '2025' },
          multiplicador: 100,
        },
        passoAPasso: 'Lucro líquido de 2025 (12,9) ÷ receita de 2025 (104) × 100 = 12,4%.',
      })
    }
    if (tipo === 'alavancagem') {
      gabarito.push({
        id: `${caseId}-g-${indice + 1}`,
        tarefaId,
        campoId: 'alavancagem',
        descricao: 'Dívida líquida ÷ EBITDA de 2025',
        valorEsperado: 2.1,
        tolerancia: 0.1,
        unidade: 'x',
        pontos: notaNumerica,
        formula: {
          tipo: 'razao',
          numerador: { linha: 'Dívida líquida', coluna: '2025' },
          denominador: { linha: 'EBITDA', coluna: '2025' },
          multiplicador: 1,
        },
        passoAPasso: 'Dívida líquida de 2025 (31) ÷ EBITDA de 2025 (14,7) = 2,1 vezes.',
      })
    }
  })
  return { tarefas, gabarito }
}

export function montarCheckpoints(caseId: string, titulosDasTarefas: string[], quantidade: number): CheckpointAdmin[] {
  if (quantidade <= 1) {
    return [{ id: `${caseId}-cp-1`, ordem: 1, etapa: 'situacao', titulo: 'Resolva o case', descricao: 'Leia o contexto e faça as tarefas.', pontos: 30 }]
  }
  return Array.from({ length: quantidade }, (_, i) => {
    const entenda = i === 0
    return {
      id: `${caseId}-cp-${i + 1}`,
      ordem: i + 1,
      etapa: entenda ? ('entenda' as const) : ('situacao' as const),
      titulo: entenda ? 'Entenda a área' : (titulosDasTarefas[i - 1] ?? 'Revise sua análise'),
      descricao: entenda ? 'Conheça a área, os termos e como se entra nela.' : 'Resolva a tarefa deste checkpoint.',
      // “Entenda a área” paga 20 pontos; os demais checkpoints, 30.
      pontos: entenda ? 20 : 30,
    }
  })
}

export const CONTEXTO_AURORA =
  'A Aurora Moda é uma rede de lojas de roupas que cresceu rapidamente nos últimos três anos. Para continuar crescendo, a diretoria busca um investidor e apresentou os resultados de 2024 e 2025. Seu papel é analisar os números, avaliar o endividamento e recomendar se vale a pena investir.'

/**
 * Conteúdo da etapa “Entenda a área” do case de Equity Research.
 * [A REVISAR] Redação editorial pendente: são descrições gerais, não critérios de seleção.
 */
export const ENTENDA_EQUITY_RESEARCH: ConteudoEntenda = {
  resumo:
    'Equity Research estuda empresas e setores e escreve análises que ajudam a decidir onde investir. Neste case, você vai analisar uma empresa de varejo em crescimento e recomendar se vale investir.',
  links: [],
  cards: [
    {
      titulo: 'O que faz quem trabalha com research',
      texto: 'Analistas de research estudam empresas e setores, projetam os resultados e escrevem relatórios com uma recomendação. Gestores e investidores usam esses relatórios para decidir.',
      naPratica: 'Uma boa análise liga os números a uma decisão clara.',
    },
    {
      titulo: 'Margem líquida',
      texto: 'Mostra quanto do que a empresa vende vira lucro depois de todas as despesas: o lucro líquido dividido pela receita.',
      naPratica: 'Margem subindo junto com a receita é sinal de que o crescimento está dando lucro.',
    },
    {
      titulo: 'Endividamento: dívida líquida ÷ EBITDA',
      texto: 'Mede quantos anos de geração de caixa da operação seriam necessários para pagar a dívida.',
      naPratica: 'Quanto maior o número, mais atenção o analista dá ao risco de a empresa não conseguir pagar.',
    },
  ],
  comoSeEntra: {
    ondeSeTrabalha: 'Bancos, corretoras e gestoras de investimentos, em equipes de análise de empresas e setores.',
    formacoes: 'Economia, Administração, Ciências Contábeis e Engenharia são as mais comuns.',
    vagas: 'Estágio em research, em análise de empresas e em programas de estágio de bancos e gestoras.',
    oQueAjuda: 'Excel, noções de contabilidade e de valuation, ler resultados trimestrais e escrever análises curtas.',
    quandoRecrutam: 'Muitos programas abrem uma vez por ano. Acompanhe as páginas de carreira das empresas.',
  },
}

/** O case publicado que aparece na demonstração. */
export function criarCaseAtual(agora: Date): CaseAdmin {
  const caseId = 'case-1'
  const tipos: TipoTarefa[] = ['margem', 'alavancagem', 'recomendacao']
  const tarefasBase = montarTarefas(caseId, tipos, [1, 2, 3, 4].map(n => `${caseId}-cp-${n}`))
  return {
    id: caseId,
    titulo: 'Avaliando uma empresa para investir',
    areaId: 'equity-research',
    status: 'publicado',
    geradoPorIA: true,
    briefing: null,
    resumo: 'Analise os dados financeiros e construa uma recomendação de investimento.',
    missao: 'Sua missão: analisar uma empresa de varejo em crescimento e recomendar se vale investir.',
    personagem: { nome: 'Clara Menezes', papel: 'Diretora de análise da Horizonte Investimentos (empresa fictícia)' },
    contexto: CONTEXTO_AURORA,
    entenda: ENTENDA_EQUITY_RESEARCH,
    checkpoints: montarCheckpoints(caseId, tarefasBase.tarefas.map(t => t.titulo), 4),
    tarefas: tarefasBase.tarefas,
    dadosApoio: tabelaEmpresa(),
    gabarito: tarefasBase.gabarito,
    conteudoIds: ['cont-1', 'cont-2', 'cont-3'],
    gabaritoConfirmado: true,
    revisadoEm: antesDe(agora, 5 * DIA),
    atualizadoEm: antesDe(agora, 5 * DIA),
  }
}
