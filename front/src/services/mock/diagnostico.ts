/**
 * Diagnóstico de fit (PRD v1.1). Não usa IA: o cálculo é determinístico e vem do
 * motor em `../fit`. A Galá é só a moldura visual da tela.
 */
import type { DiagnosticoService, EstadoDiagnostico, RespostaOpcao } from '../contratos.ts'
import { configuracaoPublica, gerarResultado, TOTAL_PERGUNTAS, validarRespostas, respostasCompletas } from '../fit/motor.ts'
import { PERGUNTAS } from '../fit/perguntas.ts'
import { VERSOES } from '../fit/versoes.ts'
import { conceder } from './pontos.ts'
import { executar, executarLogada, falha, novoId, ok } from './store.ts'
import type { DiagnosticoRegistro } from './tipos.ts'

const estadoDe = (registro: DiagnosticoRegistro | undefined): EstadoDiagnostico => ({
  status: registro ? registro.status : 'nao_iniciado',
  total: TOTAL_PERGUNTAS,
  respostas: registro?.respostas ?? {},
  versoes: VERSOES,
})

const OPCOES: RespostaOpcao[] = ['A', 'B', 'C']

export const diagnosticoService: DiagnosticoService = {
  obterConfiguracao: () => executar({}, () => ok(configuracaoPublica())),

  obterEstadoDiagnostico: () => executarLogada(({ estado, usuario }) => ok(estadoDe(estado.diagnosticos[usuario.id]))),

  iniciarDiagnostico: () =>
    executarLogada(({ estado, usuario, agora }) => {
      const atual = estado.diagnosticos[usuario.id]
      // Retoma o que estava em andamento. Se já concluiu, começa uma nova tentativa e guarda os resultados anteriores.
      if (!atual || atual.status === 'concluido') {
        estado.diagnosticos[usuario.id] = {
          status: 'em_andamento',
          respostas: {},
          iniciadoEm: agora.toISOString(),
          concluidoEm: null,
          resultados: atual?.resultados ?? [],
        }
      }
      return ok(estadoDe(estado.diagnosticos[usuario.id]))
    }),

  responderPergunta: (perguntaId, resposta) =>
    executarLogada(({ estado, usuario }) => {
      const registro = estado.diagnosticos[usuario.id]
      if (!registro || registro.status !== 'em_andamento') return falha('VALIDACAO', 'Inicie o diagnóstico para responder.')
      if (!PERGUNTAS.some(p => p.id === perguntaId)) return falha('NAO_ENCONTRADO', 'Pergunta não encontrada.')
      if (!OPCOES.includes(resposta)) return falha('VALIDACAO', 'Escolha A, B ou C.')
      registro.respostas[perguntaId] = resposta
      return ok(estadoDe(registro))
    }),

  finalizarDiagnostico: () =>
    executarLogada(({ estado, usuario, agora }) => {
      const registro = estado.diagnosticos[usuario.id]
      if (!registro || registro.status !== 'em_andamento') return falha('VALIDACAO', 'Não há diagnóstico em andamento.')

      const problemas = validarRespostas(registro.respostas)
      if (!respostasCompletas(problemas)) {
        const campos = Object.fromEntries(problemas.faltantes.map(id => [id, 'Responda esta pergunta.']))
        const respondidas = TOTAL_PERGUNTAS - problemas.faltantes.length
        return falha('VALIDACAO', `Responda todas as perguntas para ver o resultado (${respondidas} de ${TOTAL_PERGUNTAS}).`, campos)
      }

      const resultado = gerarResultado(registro.respostas, { id: novoId('diag'), agora })
      registro.resultados.push(resultado)
      registro.status = 'concluido'
      registro.concluidoEm = agora.toISOString()
      // Os pontos são concedidos uma única vez, mesmo que ela refaça o diagnóstico.
      const evento = conceder(estado, usuario.id, 'diagnostico', 'Diagnóstico de fit', agora)
      return ok({ resultadoId: resultado.id, eventos: evento ? [evento] : [] })
    }),

  obterResultadoDiagnostico: resultadoId =>
    executarLogada(({ estado, usuario }) => {
      const resultados = estado.diagnosticos[usuario.id]?.resultados ?? []
      const resultado = resultadoId ? resultados.find(r => r.id === resultadoId) : resultados[resultados.length - 1]
      return resultado ? ok(resultado) : falha('NAO_ENCONTRADO', 'Você ainda não fez o diagnóstico.')
    }),
}
