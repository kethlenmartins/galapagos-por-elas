import type {
  AdminCorrecaoService,
  CaseAdmin,
  DetalheEntregaAdmin,
  EntregaResumoAdmin,
  PedidoRevisaoAdmin,
} from '../contratos.ts'
import { CONFIG, REGRAS_DE_PONTOS } from './dados/config.ts'
import { emitirCertificado } from './certificados.ts'
import { conceder } from './pontos.ts'
import { executarLogada, falha, ok } from './store.ts'
import type { EntregaRegistro, EstadoMock, Usuario } from './tipos.ts'

const ORDEM = { pendente: 0, revisada: 1, publicada: 2 } as const

const resumoDe = (estado: EstadoMock, e: EntregaRegistro): EntregaResumoAdmin => ({
  id: e.id,
  participanteNome: estado.usuarios.find(u => u.id === e.usuarioId)?.nome ?? 'Participante removida',
  caseId: e.caseId,
  caseTitulo: estado.cases.find(c => c.id === e.caseId)?.titulo ?? '',
  enviadaEm: e.enviadaEm,
  status: e.status,
  notaSugerida: e.sugestao.notaSugerida,
  notaFinal: e.notaFinal,
  origem: e.sugestao.origem,
})

function detalheDe(estado: EstadoMock, e: EntregaRegistro): DetalheEntregaAdmin {
  const caso = estado.cases.find(c => c.id === e.caseId)
  return {
    ...resumoDe(estado, e),
    respostas: (caso?.tarefas ?? []).map(t => ({ tarefaId: t.id, titulo: t.titulo, respostas: e.respostas[t.id] ?? {} })),
    gabarito: caso?.gabarito ?? [],
    sugestao: e.sugestao,
    feedbackFinal: e.feedbackFinal,
    aprovadaPor: e.aprovadaPor,
    aprovadaEm: e.aprovadaEm,
  }
}

const bonusDeNota = (nota: number) => Math.round((nota / 10) * CONFIG.bonusResultadoMaximo)

/**
 * Bônus de nota e certificado: só quando a nota atinge o mínimo. O bônus é pago uma vez por case,
 * então uma nova tentativa aprovada não repete o que já foi pago. Devolve os pontos concedidos agora.
 */
function concederAprovacao(estado: EstadoMock, usuario: Usuario, caso: CaseAdmin, entrega: EntregaRegistro, agora: Date): number {
  const nota = entrega.notaFinal ?? 0
  if (nota < CONFIG.certificado.notaMinima) return 0
  let pontos = 0
  const bonus = conceder(estado, usuario.id, 'resultado', caso.titulo, agora, { chave: `resultado:${caso.id}`, pontos: bonusDeNota(nota) })
  if (bonus) pontos += bonus.pontos
  const certificado = emitirCertificado(estado, usuario, caso, agora)
  entrega.certificadoId = certificado.id
  const evento = conceder(estado, usuario.id, 'certificado', caso.titulo, agora, { chave: `certificado:${certificado.id}` })
  if (evento) pontos += evento.pontos
  return pontos
}

export const adminCorrecaoService: AdminCorrecaoService = {
  listarEntregas: filtro =>
    executarLogada(({ estado }) => {
      const lista = estado.entregas
        .filter(e => !filtro?.status || e.status === filtro.status)
        .sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || new Date(a.enviadaEm).getTime() - new Date(b.enviadaEm).getTime())
        .map(e => resumoDe(estado, e))
      return ok(lista)
    }, 'equipe'),

  obterEntregaComSugestaoIA: entregaId =>
    executarLogada(({ estado }) => {
      const entrega = estado.entregas.find(e => e.id === entregaId)
      return entrega ? ok(detalheDe(estado, entrega)) : falha('NAO_ENCONTRADO', 'Entrega não encontrada.')
    }, 'equipe'),

  ajustarNotaEFeedback: ajuste =>
    executarLogada(({ estado }) => {
      const entrega = estado.entregas.find(e => e.id === ajuste.entregaId)
      if (!entrega) return falha('NAO_ENCONTRADO', 'Entrega não encontrada.')
      if (entrega.status === 'publicada') return falha('VALIDACAO', 'Esta entrega já foi publicada.')
      if (!Number.isFinite(ajuste.notaFinal) || ajuste.notaFinal < 0 || ajuste.notaFinal > 10) {
        return falha('VALIDACAO', 'A nota vai de 0 a 10.', { notaFinal: 'A nota vai de 0 a 10.' })
      }
      entrega.notaFinal = Math.round(ajuste.notaFinal * 10) / 10
      entrega.feedbackFinal = ajuste.feedback.trim() || null
      // Mudar a nota depois de aprovar exige aprovar de novo.
      entrega.status = 'pendente'
      entrega.aprovadaPor = null
      entrega.aprovadaEm = null
      return ok(detalheDe(estado, entrega))
    }, 'equipe'),

  aprovarNota: entregaId =>
    executarLogada(({ estado, usuario, agora }) => {
      const entrega = estado.entregas.find(e => e.id === entregaId)
      if (!entrega) return falha('NAO_ENCONTRADO', 'Entrega não encontrada.')
      if (entrega.status === 'publicada') return falha('VALIDACAO', 'Esta entrega já foi publicada.')
      const nota = entrega.notaFinal ?? entrega.sugestao.notaSugerida
      if (nota === null) return falha('VALIDACAO', 'Defina a nota final antes de aprovar.', { notaFinal: 'Defina a nota final.' })
      entrega.notaFinal = nota
      entrega.status = 'revisada'
      entrega.aprovadaPor = usuario.nome
      entrega.aprovadaEm = agora.toISOString()
      return ok(detalheDe(estado, entrega))
    }, 'equipe'),

  publicarResultados: () =>
    executarLogada(({ estado, agora }) => {
      const pendentes = estado.entregas.filter(e => e.status === 'pendente').length
      if (pendentes > 0) {
        return falha('VALIDACAO', `Faltam ${pendentes} ${pendentes === 1 ? 'entrega' : 'entregas'} para aprovar.`)
      }
      const aprovadas = estado.entregas.filter(e => e.status === 'revisada')
      if (aprovadas.length === 0) return falha('VALIDACAO', 'Não há resultados aprovados para publicar.')

      for (const entrega of aprovadas) {
        const usuario = estado.usuarios.find(u => u.id === entrega.usuarioId)
        const caso = estado.cases.find(c => c.id === entrega.caseId)
        const nota = entrega.notaFinal ?? 0
        entrega.status = 'publicada'
        entrega.publicadaEm = agora.toISOString()
        if (!usuario || !caso) continue

        // Só quem atinge a nota mínima recebe o bônus de nota e o certificado.
        entrega.pontosGanhos = concederAprovacao(estado, usuario, caso, entrega, agora)
      }
      return ok({ publicados: aprovadas.length })
    }, 'equipe'),

  listarPedidosRevisao: () =>
    executarLogada(({ estado }) => {
      const lista: PedidoRevisaoAdmin[] = estado.pedidosRevisao
        .map(({ usuarioId: _u, resposta: _r, ...pedido }) => pedido)
        .sort((a, b) => Number(a.status === 'resolvido') - Number(b.status === 'resolvido') || new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      return ok(lista)
    }, 'equipe'),

  resolverPedidoRevisao: (pedidoId, resolucao) =>
    executarLogada(({ estado, agora }) => {
      const pedido = estado.pedidosRevisao.find(p => p.id === pedidoId)
      if (!pedido) return falha('NAO_ENCONTRADO', 'Pedido não encontrado.')
      if (pedido.status === 'resolvido') return falha('VALIDACAO', 'Este pedido já foi resolvido.')
      if (resolucao.resposta.trim().length < 5) return falha('VALIDACAO', 'Escreva uma resposta para a participante.', { resposta: 'Escreva uma resposta.' })

      if (resolucao.novaNota !== undefined) {
        const entrega = estado.entregas.find(e => e.id === pedido.entregaId)
        if (!entrega || entrega.status !== 'publicada') return falha('VALIDACAO', 'Só dá para mudar a nota de uma entrega publicada.')
        if (!Number.isFinite(resolucao.novaNota) || resolucao.novaNota < 0 || resolucao.novaNota > 10) return falha('VALIDACAO', 'A nota vai de 0 a 10.')
        const estavaAprovada = estado.certificados.some(c => c.usuarioId === entrega.usuarioId && c.caseId === entrega.caseId)
        const bonusAntes = bonusDeNota(entrega.notaFinal ?? 0)
        entrega.notaFinal = resolucao.novaNota
        const usuario = estado.usuarios.find(u => u.id === entrega.usuarioId)
        const caso = estado.cases.find(c => c.id === entrega.caseId)
        if (usuario && caso) {
          if (!estavaAprovada) {
            // A revisão aprovou quem não tinha passado: bônus e certificado, e os próximos cases abrem.
            entrega.pontosGanhos += concederAprovacao(estado, usuario, caso, entrega, agora)
          } else if (bonusDeNota(resolucao.novaNota) > bonusAntes) {
            // Nota maior gera a diferença de bônus. Nota menor não retira pontos nem o certificado.
            conceder(estado, usuario.id, 'resultado', pedido.caseTitulo, agora, {
              chave: `revisao:${pedido.id}`,
              pontos: bonusDeNota(resolucao.novaNota) - bonusAntes,
              acao: `${REGRAS_DE_PONTOS.resultado.acao} (revisão)`,
            })
          }
        }
      }
      pedido.status = 'resolvido'
      pedido.resposta = resolucao.resposta.trim()
      const { usuarioId: _u, resposta: _r, ...publico } = pedido
      return ok(publico)
    }, 'equipe'),
}
