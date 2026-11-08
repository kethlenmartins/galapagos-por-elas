import type { Conteudo, ConteudoService } from '../contratos.ts'
import { conceder } from './pontos.ts'
import { executarLogada, falha, ok } from './store.ts'
import type { EstadoMock } from './tipos.ts'

function paraParticipante(estado: EstadoMock, usuarioId: string, c: EstadoMock['conteudos'][number]): Conteudo {
  const { caseIds: _caseIds, ...publico } = c
  return { ...publico, concluido: (estado.conteudosConcluidos[usuarioId] ?? []).includes(c.id) }
}

export const conteudoService: ConteudoService = {
  listarConteudos: filtro =>
    executarLogada(({ estado, usuario }) => {
      const lista = estado.conteudos
        .filter(c => !filtro?.areaId || c.areaId === filtro.areaId)
        .filter(c => !filtro?.tipo || c.tipo === filtro.tipo)
        .filter(c => !filtro?.caseId || c.caseIds.includes(filtro.caseId))
        .map(c => paraParticipante(estado, usuario.id, c))
      return ok(lista)
    }),

  obterConteudo: conteudoId =>
    executarLogada(({ estado, usuario }) => {
      const conteudo = estado.conteudos.find(c => c.id === conteudoId)
      return conteudo ? ok(paraParticipante(estado, usuario.id, conteudo)) : falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.')
    }),

  concluirConteudo: conteudoId =>
    executarLogada(({ estado, usuario, agora }) => {
      const conteudo = estado.conteudos.find(c => c.id === conteudoId)
      if (!conteudo) return falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.')
      const feitos = estado.conteudosConcluidos[usuario.id] ?? []
      if (!feitos.includes(conteudoId)) estado.conteudosConcluidos[usuario.id] = [...feitos, conteudoId]
      const evento = conceder(estado, usuario.id, 'conteudo', conteudo.titulo, agora, { chave: `conteudo:${conteudoId}` })
      return ok({ eventos: evento ? [evento] : [] })
    }),
}
