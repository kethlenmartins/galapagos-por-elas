/** Simulação de entrevista de demonstração: perguntas e feedback roteirizados, sem IA. O backend real usa a IA. */
import type { ConfigSimulacao, ItemHistoricoSimulacao, SimulacaoService } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { executarLogada, falha, novoId, ok } from './store.ts'
import { liberacao } from './treino.ts'

const PERGUNTAS = (area: string) => [
  `Por que você quer atuar em ${area}?`,
  'Conte uma experiência (estudo, projeto ou estágio) que mostre seu interesse e sua preparação para esta área.',
  `Explique, com suas palavras, um conceito importante de ${area} para alguém que não conhece o assunto.`,
  'Descreva uma situação em que você errou ou não sabia a resposta. O que você fez?',
  'Como você organiza seu tempo quando tem várias entregas com prazo apertado?',
  'Como você explicaria uma conclusão difícil para alguém sênior que tem pouco tempo?',
  'Qual é o maior desafio da área hoje, na sua visão?',
  'Se você fosse contratada, o que faria nos primeiros 90 dias?',
]

const nomeDaArea = (areaId: string) => AREAS.find(a => a.id === areaId)?.nome ?? areaId

type Sessao = { config: ConfigSimulacao; respostas: (string | null)[] }
/** Simulações concluídas, por usuária (só na sessão do mock). */
const historicos = new Map<string, (ItemHistoricoSimulacao & { areaId: string })[]>()
const sessoes = new Map<string, Sessao>()
const LIMITE_POR_DIA = 5
const usadas = new Map<string, number>()

export const simulacaoService: SimulacaoService = {
  obterResumoDaSimulacao: areaId =>
    executarLogada(({ estado, usuario }) =>
      ok({ areaId, ...liberacao(estado, usuario.id, areaId), disponivel: true, demonstracao: true, restantesHoje: Math.max(0, LIMITE_POR_DIA - (usadas.get(usuario.id) ?? 0)), historico: (historicos.get(usuario.id) ?? []).filter(h => h.areaId === areaId).slice(0, 5).map(({ areaId: _a, ...item }) => item) }),
    ),

  iniciarSimulacao: config =>
    executarLogada(({ estado, usuario }) => {
      const { liberado, motivoBloqueio } = liberacao(estado, usuario.id, config.areaId)
      if (!liberado) return falha('VALIDACAO', motivoBloqueio ?? 'A simulação ainda não está liberada.')
      if ((usadas.get(usuario.id) ?? 0) >= LIMITE_POR_DIA) return falha('LIMITE_EXCEDIDO', `Você já fez ${LIMITE_POR_DIA} simulações hoje. Volte mais tarde.`)
      usadas.set(usuario.id, (usadas.get(usuario.id) ?? 0) + 1)
      const sessaoId = novoId('sim')
      sessoes.set(sessaoId, { config, respostas: [] })
      return ok({ sessaoId, numero: 1, total: config.perguntas, pergunta: PERGUNTAS(nomeDaArea(config.areaId))[0] })
    }),

  responderSimulacao: (sessaoId, resposta) =>
    executarLogada(({ usuario, agora }) => {
      const sessao = sessoes.get(sessaoId)
      if (!sessao) return falha('NAO_ENCONTRADO', 'Simulação não encontrada.')
      sessao.respostas.push(resposta?.trim() || null)
      const numero = sessao.respostas.length
      const reacao = !resposta?.trim() ? 'Sem resposta desta vez. Vamos seguir.' : resposta.trim().length < 80 ? 'Resposta curta: tente dar um exemplo concreto.' : 'Obrigada, resposta clara.'
      if (numero < sessao.config.perguntas) return ok({ reacao, proximo: { numero: numero + 1, pergunta: PERGUNTAS(nomeDaArea(sessao.config.areaId))[numero] }, feedbackFinal: null })
      const respondidas = sessao.respostas.filter((r): r is string => !!r)
      const media = respondidas.length ? respondidas.reduce((s, r) => s + r.length, 0) / respondidas.length : 0
      const nota = Math.min(10, Math.round((respondidas.length / sessao.respostas.length) * 4 + Math.min(media, 300) / 50))
      sessoes.delete(sessaoId)
      const criterios = [
        { nome: 'Respostas completas', nota, comentario: `${respondidas.length} de ${sessao.respostas.length} perguntas respondidas.` },
        { nome: 'Exemplos concretos', nota: Math.max(0, nota - 1), comentario: 'Use situações reais para sustentar o que diz.' },
      ]
      historicos.set(usuario.id, [
        { id: sessaoId, areaId: sessao.config.areaId, concluidaEm: agora.toISOString(), rigor: sessao.config.rigor, dificuldade: sessao.config.dificuldade, perguntas: sessao.config.perguntas, notaMedia: Math.round((criterios.reduce((t, c) => t + c.nota, 0) / criterios.length) * 10) / 10 },
        ...(historicos.get(usuario.id) ?? []),
      ])
      return ok({
        reacao,
        proximo: null,
        feedbackFinal: {
          resumo: 'Este é um feedback de demonstração, sem IA. Com a IA ativa você recebe uma análise real das suas respostas.',
          criterios,
          pontosFortes: respondidas.length ? ['Você respondeu às perguntas.'] : [],
          pontosAMelhorar: ['Dê exemplos concretos e números quando puder.'],
          proximosPassos: ['Faça o treino de perguntas da ilha para reforçar a parte técnica.'],
        },
      })
    }),
}
