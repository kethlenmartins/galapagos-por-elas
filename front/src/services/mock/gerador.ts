/**
 * Simula a geração de case pela IA. Gera um rascunho a partir do briefing,
 * com dados fictícios e um gabarito calculado a partir da tabela.
 * A implementação real chama o modelo no servidor e valida a saída.
 */
import type { BriefingCase, CaseAdmin, ConteudoEntenda, ItemGabarito, SecaoCase, TabelaDados } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { CONTEXTO_AURORA, montarCheckpoints, montarTarefas, tabelaEmpresa, type TipoTarefa } from './dados/case-semana.ts'
import { recalcularItem, valorDaCelula } from './gabarito.ts'

const SEQUENCIA_DE_TAREFAS: TipoTarefa[] = ['margem', 'alavancagem', 'recomendacao', 'analise', 'analise', 'analise']

const VARIANTES_DE_CONTEXTO = [
  CONTEXTO_AURORA,
  'A Aurora Moda é uma rede de varejo em expansão. A diretoria quer entender se o crescimento recente é sustentável e se a empresa aguenta o nível de dívida atual. Você vai analisar os números de 2024 e 2025 e apoiar a decisão.',
  'Uma rede de lojas de roupas apresentou resultados fortes e pretende abrir novas unidades. Antes de decidir, o comitê pede uma análise dos indicadores e uma recomendação clara. Use os dados da tabela para fundamentar sua resposta.',
]

function tiposDeTarefa(quantidade: number): TipoTarefa[] {
  return SEQUENCIA_DE_TAREFAS.slice(0, Math.max(1, quantidade))
}

/** Rascunho da etapa “Entenda a área”: a equipe precisa revisar e completar. */
function entendaGenerico(areaId: string): ConteudoEntenda {
  const area = AREAS.find(a => a.id === areaId)
  const nome = area?.nome ?? 'a área'
  return {
    resumo: area ? `${area.oQueFaz} ${area.descricao}` : `Conheça ${nome}.`,
    links: [],
    cards: [
      { titulo: `O que faz quem trabalha com ${nome}`, texto: area?.descricao ?? 'Descreva o trabalho da área.', naPratica: 'Dê um exemplo do dia a dia da área.' },
      { titulo: 'Termos que você vai usar', texto: 'Explique em linguagem simples os termos do case.', naPratica: 'Mostre onde cada termo aparece no case.' },
    ],
    comoSeEntra: {
      ondeSeTrabalha: 'A revisar pela equipe.',
      formacoes: 'A revisar pela equipe.',
      vagas: 'A revisar pela equipe.',
      oQueAjuda: 'A revisar pela equipe.',
      quandoRecrutam: 'A revisar pela equipe.',
    },
  }
}

export function gerarCase(
  briefing: BriefingCase,
  opcoes: { id: string; agora: Date; status?: 'rascunho_ia' | 'rascunho' },
): CaseAdmin {
  const tipos = tiposDeTarefa(briefing.numTarefas)
  const checkpointIds = Array.from({ length: Math.max(1, briefing.numCheckpoints) }, (_, i) => `${opcoes.id}-cp-${i + 1}`)
  const { tarefas, gabarito } = montarTarefas(opcoes.id, tipos, checkpointIds)
  return {
    id: opcoes.id,
    titulo: briefing.tema.trim(),
    areaId: briefing.areaId,
    status: opcoes.status ?? 'rascunho_ia',
    geradoPorIA: true,
    briefing,
    resumo: `Case de nível ${briefing.dificuldade}: ${briefing.tema.trim().toLowerCase()}.`,
    missao: `Sua missão: ${briefing.tema.trim().toLowerCase()}.`,
    personagem: null,
    contexto: VARIANTES_DE_CONTEXTO[0],
    entenda: entendaGenerico(briefing.areaId),
    checkpoints: montarCheckpoints(opcoes.id, tarefas.map(t => t.titulo), checkpointIds.length),
    tarefas,
    dadosApoio: tabelaEmpresa(),
    gabarito,
    conteudoIds: [],
    gabaritoConfirmado: false,
    revisadoEm: null,
    atualizadoEm: opcoes.agora.toISOString(),
  }
}

const decimal = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',')

/** Recalcula cada item do gabarito a partir da tabela de dados e reescreve o passo a passo. */
function ajustarGabaritoAosDados(gabarito: ItemGabarito[], tabela: TabelaDados | null): ItemGabarito[] {
  return gabarito.map(item => {
    const valor = recalcularItem(item, tabela)
    if (valor === null || !item.formula || !tabela) return item
    const { numerador, denominador, multiplicador } = item.formula
    const n = valorDaCelula(tabela, numerador)
    const d = valorDaCelula(tabela, denominador)
    const conta = `${numerador.linha} de ${numerador.coluna} (${decimal(n ?? 0)}) ÷ ${denominador.linha} de ${denominador.coluna} (${decimal(d ?? 0)})${multiplicador === 1 ? '' : ` × ${multiplicador}`}`
    return { ...item, valorEsperado: Math.round(valor * 10) / 10, passoAPasso: `${conta} = ${decimal(Math.round(valor * 10) / 10)}${item.unidade === '%' ? '%' : ''}.` }
  })
}

/** Regenera uma seção, sem mexer nas demais. `variante` muda a redação do contexto. */
export function regenerarSecao(caso: CaseAdmin, secao: SecaoCase, variante: number, agora: Date): CaseAdmin {
  const briefing = caso.briefing
  const quantidadeDeTarefas = briefing?.numTarefas ?? caso.tarefas.length
  const quantidadeDeCheckpoints = briefing?.numCheckpoints ?? caso.checkpoints.length
  const novo: CaseAdmin = { ...caso, atualizadoEm: agora.toISOString() }

  if (secao === 'contexto') novo.contexto = VARIANTES_DE_CONTEXTO[variante % VARIANTES_DE_CONTEXTO.length]
  if (secao === 'dados_apoio') novo.dadosApoio = tabelaEmpresa()
  if (secao === 'checkpoints') novo.checkpoints = montarCheckpoints(caso.id, caso.tarefas.map(t => t.titulo), quantidadeDeCheckpoints)
  if (secao === 'tarefas' || secao === 'gabarito') {
    const ids = novo.checkpoints.map(c => c.id)
    const refeito = montarTarefas(caso.id, tiposDeTarefa(quantidadeDeTarefas), ids.length ? ids : [`${caso.id}-cp-1`])
    if (secao === 'tarefas') novo.tarefas = refeito.tarefas
    // O gabarito é recalculado a partir da tabela de dados, não copiado do modelo.
    novo.gabarito = ajustarGabaritoAosDados(refeito.gabarito, novo.dadosApoio)
  }
  // Qualquer mudança em conteúdo gerado exige uma nova revisão do gabarito.
  novo.gabaritoConfirmado = false
  if (novo.status === 'revisado') novo.status = 'rascunho'
  return novo
}
