import type { NivelPergunta, PerguntaTreino, ResumoTreino, TreinoService } from '../contratos.ts'
import { PERGUNTAS_ENTREVISTA } from './dados/perguntas-entrevista.ts'
import { executarLogada, falha, ok } from './store.ts'
import type { EstadoMock } from './tipos.ts'
import { casesDaArea, temCertificado } from './trilha.ts'

const NIVEIS: NivelPergunta[] = ['facil', 'medio', 'dificil']

/** O treino da ilha abre com o certificado do case básico da área. */
function liberacao(estado: EstadoMock, usuarioId: string, areaId: string): { liberado: boolean; motivoBloqueio: string | null } {
  const basico = casesDaArea(estado, areaId)[0]
  if (!basico) return { liberado: false, motivoBloqueio: 'Esta ilha ainda não tem case básico.' }
  if (!temCertificado(estado, usuarioId, basico.id)) return { liberado: false, motivoBloqueio: 'Abre depois que você concluir o case básico desta ilha.' }
  return { liberado: true, motivoBloqueio: null }
}

const embaralhar = <T>(lista: T[]): T[] => {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export const treinoService: TreinoService = {
  obterResumoDoTreino: areaId =>
    executarLogada(({ estado, usuario }) => {
      const perguntasPorNivel = Object.fromEntries(
        NIVEIS.map(n => [n, PERGUNTAS_ENTREVISTA.filter(p => p.areaId === areaId && p.nivel === n).length]),
      ) as ResumoTreino['perguntasPorNivel']
      const temas = [...new Set(PERGUNTAS_ENTREVISTA.filter(p => p.areaId === areaId && p.tema).map(p => p.tema as string))]
      return ok({ areaId, ...liberacao(estado, usuario.id, areaId), perguntasPorNivel, temas })
    }),

  sortearPerguntas: ({ areaId, nivel, quantidade, tema }) =>
    executarLogada(({ estado, usuario }) => {
      const { liberado, motivoBloqueio } = liberacao(estado, usuario.id, areaId)
      if (!liberado) return falha('VALIDACAO', motivoBloqueio ?? 'O treino ainda não está liberado.')
      const banco = PERGUNTAS_ENTREVISTA.filter(p => p.areaId === areaId && (nivel === 'misto' || p.nivel === nivel) && (!tema || p.tema === tema))
      if (!banco.length) return falha('NAO_ENCONTRADO', 'Ainda não há perguntas publicadas para esta escolha.')
      const sorteadas = embaralhar(banco).slice(0, Math.max(1, quantidade))
      return ok(sorteadas.map<PerguntaTreino>(({ resposta: _r, feedback: _f, ...publica }) => publica))
    }),

  responderPergunta: (perguntaId, letra) =>
    executarLogada(() => {
      const pergunta = PERGUNTAS_ENTREVISTA.find(p => p.id === perguntaId)
      if (!pergunta) return falha('NAO_ENCONTRADO', 'Pergunta não encontrada.')
      return ok({ correta: letra !== null && pergunta.resposta === letra, letraCerta: pergunta.resposta, feedback: pergunta.feedback })
    }),
}
