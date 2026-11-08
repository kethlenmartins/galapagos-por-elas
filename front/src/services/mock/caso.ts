/**
 * Serviço de cases da participante, no modelo de trilha (PRD_Cases_Trilha.md).
 * As regras de quem pode o quê estão em `trilha.ts`.
 */
import type {
  CampoResposta,
  CaseAdmin,
  CaseService,
  CaseTrilha,
  Checkpoint,
  ItemTrilha,
  PedidoRevisaoParticipante,
  RespostasDaTarefa,
  ResultadoCase,
  ResultadoTarefa,
  Tarefa,
} from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { CONFIG, REGRAS_DE_PONTOS } from './dados/config.ts'
import { corrigirEntrega } from './correcao.ts'
import { diaDaSemanaBRT, inicioDaSemana, prazoDoCase, sextaDaSemana } from './datas.ts'
import { conceder } from './pontos.ts'
import { executarLogada, falha, novoId, ok, type ContextoLogado } from './store.ts'
import type { EntregaRegistro, EstadoMock } from './tipos.ts'
import {
  ETAPAS_QUE_REINICIAM,
  casesPublicados,
  casesVisiveisPara as casesVisiveis,
  caseEmAndamento,
  escolhaDaSemana,
  opcoesDoPrimeiroCase,
  posicaoNoFit,
  progressoDe,
  resultadoDoDiagnostico,
  situacaoDoCase,
  ultimaEntrega,
  concluiuAlgumCase,
  temCertificado,
  type SituacaoDoCase,
} from './trilha.ts'

const nomeDaArea = (areaId: string) => AREAS.find(a => a.id === areaId)?.nome ?? areaId

const ordenados = (caso: CaseAdmin) => [...caso.checkpoints].sort((a, b) => a.ordem - b.ordem)

const concluidosDe = (estado: EstadoMock, usuarioId: string) => new Set(estado.checkpointsConcluidos[usuarioId] ?? [])

/** Um checkpoint só abre quando todos os anteriores estão concluídos. */
function checkpointAberto(caso: CaseAdmin, checkpointId: string, concluidos: Set<string>): boolean {
  for (const cp of ordenados(caso)) {
    if (cp.id === checkpointId) return true
    if (!concluidos.has(cp.id)) return false
  }
  return false
}

const preenchido = (valor: unknown) => valor !== null && valor !== undefined && String(valor).trim() !== ''

function validarRespostas(campos: CampoResposta[], respostas: RespostasDaTarefa): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const chave of Object.keys(respostas)) {
    if (!campos.some(c => c.id === chave)) erros[chave] = 'Campo desconhecido.'
  }
  for (const campo of campos) {
    const valor = respostas[campo.id]
    if (valor === undefined || valor === null) continue
    if (campo.tipo === 'texto' && campo.limiteCaracteres && String(valor).length > campo.limiteCaracteres) {
      erros[campo.id] = `Use no máximo ${campo.limiteCaracteres} caracteres.`
    }
    if (campo.tipo === 'opcao' && campo.opcoes && !campo.opcoes.includes(String(valor))) erros[campo.id] = 'Escolha uma das opções.'
  }
  return erros
}

function montarCheckpoints(caso: CaseAdmin, ctx: ContextoLogado, situacao: SituacaoDoCase): Checkpoint[] {
  const concluidos = concluidosDe(ctx.estado, ctx.usuario.id)
  const enviado = situacao.estado === 'em_avaliacao' || situacao.estado === 'concluido'
  return ordenados(caso).map(cp => {
    const tarefaIds = caso.tarefas.filter(t => t.checkpointId === cp.id).map(t => t.id)
    const comRascunho = tarefaIds.some(id => ctx.estado.rascunhos[`${ctx.usuario.id}:${id}`])
    return {
      id: cp.id,
      ordem: cp.ordem,
      etapa: cp.etapa,
      titulo: cp.titulo,
      descricao: cp.descricao,
      pontos: cp.pontos,
      tarefaIds,
      status: enviado || concluidos.has(cp.id) ? 'concluido' : comRascunho ? 'em_andamento' : 'a_fazer',
    }
  })
}

function montarCase(caso: CaseAdmin, ctx: ContextoLogado): CaseTrilha {
  const situacao = situacaoDoCase(ctx.estado, ctx.usuario.id, caso, ctx.agora)
  // Antes de escolher, só o resumo: o conteúdo do case não é enviado.
  const escolhido = !!situacao.progresso || situacao.estado === 'em_avaliacao' || situacao.estado === 'concluido'
  const checkpoints = escolhido ? montarCheckpoints(caso, ctx, situacao) : []
  const proximo = situacao.estado === 'em_andamento' ? checkpoints.find(cp => cp.status !== 'concluido' && cp.tarefaIds.length > 0) : undefined
  return {
    id: caso.id,
    titulo: caso.titulo,
    areaId: caso.areaId,
    area: nomeDaArea(caso.areaId),
    resumo: caso.resumo,
    missao: caso.missao,
    personagem: caso.personagem,
    contexto: escolhido ? caso.contexto : '',
    entenda: escolhido ? caso.entenda : null,
    estado: situacao.estado,
    prazoEm: situacao.progresso?.prazoEm ?? null,
    tentativa: situacao.tentativa,
    pontosPossiveis: caso.checkpoints.reduce((s, c) => s + c.pontos, 0) + CONFIG.bonusResultadoMaximo + REGRAS_DE_PONTOS.certificado.pontos,
    checkpoints,
    conteudoIds: escolhido ? caso.conteudoIds : [],
    proximaTarefaId: proximo?.tarefaIds[0] ?? null,
  }
}

/** Mensagem de erro de quem tenta mexer em um case que não está em andamento. */
function naoEstaEmAndamento(situacao: SituacaoDoCase) {
  if (situacao.estado === 'em_avaliacao' || situacao.estado === 'concluido') return falha('VALIDACAO', 'A entrega já foi enviada.')
  if (situacao.progresso) return falha('VALIDACAO', 'O prazo deste case terminou. Escolha o case de novo para continuar de onde parou.')
  return falha('VALIDACAO', 'Escolha o case primeiro.')
}

function localizarTarefa(estado: EstadoMock, usuarioId: string, tarefaId: string) {
  for (const caso of casesVisiveis(estado, usuarioId)) {
    const tarefa = caso.tarefas.find(t => t.id === tarefaId)
    if (tarefa) return { caso, tarefa }
  }
  return null
}

/** Uma nova tentativa recomeça a situação e a defesa. Os pontos já pagos não se repetem (chaves únicas). */
function reiniciarTentativa(estado: EstadoMock, usuarioId: string, caso: CaseAdmin) {
  const reiniciam = new Set(caso.checkpoints.filter(c => ETAPAS_QUE_REINICIAM.includes(c.etapa)).map(c => c.id))
  estado.checkpointsConcluidos[usuarioId] = (estado.checkpointsConcluidos[usuarioId] ?? []).filter(id => !reiniciam.has(id))
  for (const tarefa of caso.tarefas) {
    if (reiniciam.has(tarefa.checkpointId)) delete estado.rascunhos[`${usuarioId}:${tarefa.id}`]
  }
}

export const caseService: CaseService = {
  obterTrilha: () =>
    executarLogada(ctx => {
      const { estado, usuario, agora } = ctx
      const resultado = resultadoDoDiagnostico(estado, usuario.id)
      const primeiroConcluido = concluiuAlgumCase(estado, usuario.id)
      const situacoes = casesVisiveis(estado, usuario.id).map(c => ({ caso: c, sit: situacaoDoCase(estado, usuario.id, c, agora) }))

      // “Comece por aqui”: só no primeiro case, o de melhor posição entre as opções.
      let sugeridoId: string | null = null
      const jaComecouAlgum = estado.progressos.some(p => p.usuarioId === usuario.id)
      if (!primeiroConcluido && resultado && !jaComecouAlgum) {
        const opcoes = opcoesDoPrimeiroCase(estado, resultado)
        const melhores = situacoes
          .filter(x => opcoes.has(x.caso.id) && x.sit.estado === 'disponivel')
          .sort((a, b) => (posicaoNoFit(resultado, a.caso.areaId) ?? 99) - (posicaoNoFit(resultado, b.caso.areaId) ?? 99))
        sugeridoId = melhores[0]?.caso.id ?? null
      }

      const concluidos = concluidosDe(estado, usuario.id)
      const cases: ItemTrilha[] = situacoes
        .map(({ caso, sit }) => {
          const total = caso.checkpoints.length
          const feitos = sit.estado === 'em_avaliacao' || sit.estado === 'concluido' ? total : sit.progresso ? caso.checkpoints.filter(c => concluidos.has(c.id)).length : 0
          const posicao = posicaoNoFit(resultado, caso.areaId)
          return {
            caseId: caso.id,
            titulo: caso.titulo,
            areaId: caso.areaId,
            area: nomeDaArea(caso.areaId),
            resumo: caso.resumo,
            estado: sit.estado,
            posicaoNoFit: posicao,
            noTop3: posicao !== null && posicao <= 3,
            sugerido: caso.id === sugeridoId,
            motivoBloqueio: sit.motivoBloqueio,
            prazoEm: sit.progresso?.prazoEm ?? null,
            progresso: { concluidos: feitos, total },
            certificadoId: estado.certificados.find(c => c.usuarioId === usuario.id && c.caseId === caso.id)?.id ?? null,
            refazer: sit.refazer,
          }
        })
        .sort((a, b) => (a.posicaoNoFit ?? 99) - (b.posicaoNoFit ?? 99) || a.titulo.localeCompare(b.titulo, 'pt-BR'))

      const escolhida = escolhaDaSemana(estado, usuario.id, agora)
      const ativo = caseEmAndamento(estado, usuario.id, agora)
      let motivo: string | null = null
      if (!resultado) motivo = 'Faça o diagnóstico para descobrir por onde começar.'
      else if (ativo) motivo = `Termine o case em andamento: ${ativo.titulo}.`
      else if (escolhida) motivo = 'Você já escolheu o case desta semana. O próximo abre na segunda-feira.'
      else if (!cases.some(c => c.estado === 'disponivel')) motivo = 'Nenhum case disponível para você agora.'

      // No sábado e no domingo a semana de trabalho já acabou: mostramos a que começa na segunda.
      const fimDeSemana = [0, 6].includes(diaDaSemanaBRT(agora))
      const inicio = fimDeSemana ? new Date(inicioDaSemana(agora).getTime() + 7 * 24 * 3_600_000) : inicioDaSemana(agora)
      return ok({
        diagnosticoConcluido: !!resultado,
        primeiroCaseConcluido: primeiroConcluido,
        semana: { inicioEm: inicio.toISOString(), fimEm: sextaDaSemana(inicio).toISOString() },
        escolhaDaSemana: escolhida?.caseId ?? null,
        podeEscolher: motivo === null,
        motivoNaoPodeEscolher: motivo,
        cases,
      })
    }),

  escolherCase: caseId =>
    executarLogada(ctx => {
      const { estado, usuario, agora } = ctx
      const caso = casesVisiveis(estado, usuario.id).find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      const sit = situacaoDoCase(estado, usuario.id, caso, agora)

      if (sit.estado === 'bloqueado') return falha('VALIDACAO', sit.motivoBloqueio ?? 'Este case ainda não está liberado.')
      if (sit.estado === 'em_avaliacao') return falha('VALIDACAO', 'Este case está em avaliação.')
      if (sit.estado === 'concluido') return falha('VALIDACAO', 'Você já concluiu este case.')
      if (sit.estado === 'em_andamento') return ok(montarCase(caso, ctx))

      const outro = caseEmAndamento(estado, usuario.id, agora)
      if (outro) return falha('VALIDACAO', `Termine o case em andamento antes de escolher outro: ${outro.titulo}.`)
      if (escolhaDaSemana(estado, usuario.id, agora, caso.id)) {
        return falha('VALIDACAO', 'Você já escolheu o case desta semana. O próximo abre na segunda-feira.')
      }

      // Nova tentativa depois de uma avaliação sem aprovação.
      if (sit.refazer) reiniciarTentativa(estado, usuario.id, caso)
      const existente = progressoDe(estado, usuario.id, caso.id)
      const registro = { usuarioId: usuario.id, caseId: caso.id, escolhidoEm: agora.toISOString(), prazoEm: prazoDoCase(agora).toISOString(), tentativa: sit.tentativa, enviadaEm: null }
      if (existente) Object.assign(existente, registro)
      else estado.progressos.push(registro)
      return ok(montarCase(caso, ctx))
    }),

  obterCase: caseId =>
    executarLogada(ctx => {
      const caso = casesVisiveis(ctx.estado, ctx.usuario.id).find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      const sit = situacaoDoCase(ctx.estado, ctx.usuario.id, caso, ctx.agora)
      if (sit.estado === 'bloqueado') return falha('VALIDACAO', sit.motivoBloqueio ?? 'Este case ainda não está liberado.')
      return ok(montarCase(caso, ctx))
    }),

  obterTarefa: tarefaId =>
    executarLogada(ctx => {
      const achado = localizarTarefa(ctx.estado, ctx.usuario.id, tarefaId)
      if (!achado) return falha('NAO_ENCONTRADO', 'Tarefa não encontrada.')
      const { caso, tarefa } = achado
      const sit = situacaoDoCase(ctx.estado, ctx.usuario.id, caso, ctx.agora)
      if (sit.estado === 'bloqueado') return falha('VALIDACAO', sit.motivoBloqueio ?? 'Este case ainda não está liberado.')
      const enviado = sit.estado === 'em_avaliacao' || sit.estado === 'concluido'
      if (!sit.progresso && !enviado) return falha('VALIDACAO', 'Escolha o case primeiro.')

      const concluidos = concluidosDe(ctx.estado, ctx.usuario.id)
      if (!enviado && !concluidos.has(tarefa.checkpointId) && !checkpointAberto(caso, tarefa.checkpointId, concluidos)) {
        return falha('VALIDACAO', 'Conclua o checkpoint anterior para abrir esta tarefa.')
      }
      const rascunho = ctx.estado.rascunhos[`${ctx.usuario.id}:${tarefaId}`]
      const entrega = enviado ? ultimaEntrega(ctx.estado, ctx.usuario.id, caso.id) : undefined
      const tarefaPublica: Tarefa = {
        id: tarefa.id,
        caseId: caso.id,
        checkpointId: tarefa.checkpointId,
        titulo: tarefa.titulo,
        enunciado: tarefa.enunciado,
        dadosApoio: caso.dadosApoio,
        campos: tarefa.campos,
        rascunho: entrega ? (entrega.respostas[tarefaId] ?? null) : (rascunho?.respostas ?? null),
        rascunhoSalvoEm: rascunho?.salvoEm ?? null,
        somenteLeitura: sit.estado !== 'em_andamento' || concluidos.has(tarefa.checkpointId),
      }
      return ok(tarefaPublica)
    }),

  salvarRascunho: (tarefaId, respostas) =>
    executarLogada(ctx => {
      const achado = localizarTarefa(ctx.estado, ctx.usuario.id, tarefaId)
      if (!achado) return falha('NAO_ENCONTRADO', 'Tarefa não encontrada.')
      const sit = situacaoDoCase(ctx.estado, ctx.usuario.id, achado.caso, ctx.agora)
      if (sit.estado !== 'em_andamento') return naoEstaEmAndamento(sit)

      const concluidos = concluidosDe(ctx.estado, ctx.usuario.id)
      if (concluidos.has(achado.tarefa.checkpointId)) return falha('VALIDACAO', 'Este checkpoint já foi concluído e não pode mais ser alterado.')
      if (!checkpointAberto(achado.caso, achado.tarefa.checkpointId, concluidos)) return falha('VALIDACAO', 'Conclua o checkpoint anterior para abrir esta tarefa.')

      const erros = validarRespostas(achado.tarefa.campos, respostas)
      if (Object.keys(erros).length) return falha('VALIDACAO', 'Confira os campos destacados.', erros)
      const salvoEm = ctx.agora.toISOString()
      ctx.estado.rascunhos[`${ctx.usuario.id}:${tarefaId}`] = { respostas: { ...respostas }, salvoEm }
      return ok({ salvoEm })
    }),

  concluirCheckpoint: checkpointId =>
    executarLogada(ctx => {
      const caso = casesVisiveis(ctx.estado, ctx.usuario.id).find(c => c.checkpoints.some(cp => cp.id === checkpointId))
      const checkpoint = caso?.checkpoints.find(cp => cp.id === checkpointId)
      if (!caso || !checkpoint) return falha('NAO_ENCONTRADO', 'Checkpoint não encontrado.')

      const concluidos = concluidosDe(ctx.estado, ctx.usuario.id)
      if (concluidos.has(checkpointId)) return ok({ eventos: [] })
      const sit = situacaoDoCase(ctx.estado, ctx.usuario.id, caso, ctx.agora)
      if (sit.estado !== 'em_andamento') return naoEstaEmAndamento(sit)
      if (!checkpointAberto(caso, checkpointId, concluidos)) return falha('VALIDACAO', 'Conclua o checkpoint anterior primeiro.')

      const erros: Record<string, string> = {}
      for (const tarefa of caso.tarefas.filter(t => t.checkpointId === checkpointId)) {
        const respostas = ctx.estado.rascunhos[`${ctx.usuario.id}:${tarefa.id}`]?.respostas ?? {}
        for (const campo of tarefa.campos.filter(c => c.obrigatorio)) {
          if (!preenchido(respostas[campo.id])) erros[`${tarefa.id}.${campo.id}`] = 'Preencha este campo.'
        }
      }
      if (Object.keys(erros).length) return falha('VALIDACAO', 'Preencha os campos obrigatórios antes de concluir o checkpoint.', erros)

      ctx.estado.checkpointsConcluidos[ctx.usuario.id] = [...(ctx.estado.checkpointsConcluidos[ctx.usuario.id] ?? []), checkpointId]
      const evento = conceder(ctx.estado, ctx.usuario.id, 'checkpoint', caso.titulo, ctx.agora, {
        chave: `checkpoint:${checkpointId}`,
        pontos: checkpoint.pontos,
      })
      return ok({ eventos: evento ? [evento] : [] })
    }),

  enviarCase: caseId =>
    executarLogada(ctx => {
      const caso = casesVisiveis(ctx.estado, ctx.usuario.id).find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      const sit = situacaoDoCase(ctx.estado, ctx.usuario.id, caso, ctx.agora)
      if (sit.estado !== 'em_andamento' || !sit.progresso) return naoEstaEmAndamento(sit)

      const concluidos = concluidosDe(ctx.estado, ctx.usuario.id)
      if (!caso.checkpoints.every(c => concluidos.has(c.id))) return falha('VALIDACAO', 'Conclua todos os checkpoints antes de enviar.')

      const respostas: Record<string, RespostasDaTarefa> = {}
      for (const tarefa of caso.tarefas) {
        respostas[tarefa.id] = { ...(ctx.estado.rascunhos[`${ctx.usuario.id}:${tarefa.id}`]?.respostas ?? {}) }
      }
      const entrega: EntregaRegistro = {
        id: novoId('entrega'),
        usuarioId: ctx.usuario.id,
        caseId,
        enviadaEm: ctx.agora.toISOString(),
        tentativa: sit.progresso.tentativa,
        status: 'pendente',
        respostas,
        sugestao: corrigirEntrega(caso, respostas, ctx.iaDisponivel),
        notaFinal: null,
        feedbackFinal: null,
        aprovadaPor: null,
        aprovadaEm: null,
        publicadaEm: null,
        pontosGanhos: 0,
        certificadoId: null,
      }
      ctx.estado.entregas.push(entrega)
      sit.progresso.enviadaEm = entrega.enviadaEm
      // Os checkpoints já pagaram os pontos; o bônus de nota e o certificado vêm com o resultado.
      return ok({ entregaId: entrega.id })
    }),

  obterResultadoCase: caseId =>
    executarLogada(ctx => {
      const caso = ctx.estado.cases.find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      const entrega = ultimaEntrega(ctx.estado, ctx.usuario.id, caseId)
      if (!entrega) return ok<ResultadoCase>({ estado: 'sem_entrega' })
      // Nota e feedback só existem para a participante depois de publicados pela equipe.
      if (entrega.status !== 'publicada' || entrega.notaFinal === null || !entrega.publicadaEm) {
        return ok<ResultadoCase>({ estado: 'em_avaliacao', entregueEm: entrega.enviadaEm })
      }

      const sugestao = entrega.sugestao
      const notasNumericas = new Map<string, number>()
      for (const item of sugestao.itens) notasNumericas.set(item.tarefaId, (notasNumericas.get(item.tarefaId) ?? 0) + item.pontos)
      const somaNumerica = [...notasNumericas.values()].reduce((s, n) => s + n, 0)
      const qualitativas = caso.tarefas.filter(t => t.correcao === 'qualitativa')
      const maxQualitativo = qualitativas.reduce((s, t) => s + t.notaMaxima, 0)
      const restante = Math.max(0, entrega.notaFinal - somaNumerica)

      const porTarefa: ResultadoTarefa[] = caso.tarefas.map(t => ({
        tarefaId: t.id,
        titulo: t.titulo,
        notaMaxima: t.notaMaxima,
        nota:
          t.correcao === 'numerica'
            ? Math.round((notasNumericas.get(t.id) ?? 0) * 10) / 10
            : maxQualitativo > 0
              ? Math.round(Math.min(t.notaMaxima, (restante * t.notaMaxima) / maxQualitativo) * 10) / 10
              : 0,
        feedback: sugestao.feedbackPorTarefa.find(f => f.tarefaId === t.id)?.feedback ?? '',
      }))

      return ok<ResultadoCase>({
        estado: 'publicado',
        entregueEm: entrega.enviadaEm,
        publicadoEm: entrega.publicadaEm,
        nota: entrega.notaFinal,
        notaMaxima: 10,
        feedbackGeral: entrega.feedbackFinal ?? sugestao.feedbackGeral,
        pontosFortes: sugestao.pontosFortes,
        pontosAMelhorar: sugestao.pontosAMelhorar,
        porTarefa,
        pontosGanhos: entrega.pontosGanhos,
        certificadoId: entrega.certificadoId,
        aprovada: temCertificado(ctx.estado, ctx.usuario.id, caseId),
        notaMinima: CONFIG.certificado.notaMinima,
        tentativa: entrega.tentativa,
      })
    }),

  pedirRevisao: (tarefaId, motivo) =>
    executarLogada(ctx => {
      const caso = ctx.estado.cases.find(c => c.tarefas.some(t => t.id === tarefaId))
      const entrega = caso ? ultimaEntrega(ctx.estado, ctx.usuario.id, caso.id) : undefined
      if (!caso || !entrega || entrega.status !== 'publicada') {
        return falha('VALIDACAO', 'Só é possível pedir revisão depois de o resultado ser publicado.')
      }
      const texto = motivo.trim()
      if (texto.length < 10 || texto.length > 500) {
        return falha('VALIDACAO', 'Explique o motivo com 10 a 500 caracteres.', { motivo: 'Explique o motivo com 10 a 500 caracteres.' })
      }
      if (ctx.estado.pedidosRevisao.some(p => p.usuarioId === ctx.usuario.id && p.tarefaId === tarefaId && p.status === 'aberto')) {
        return falha('VALIDACAO', 'Você já pediu revisão desta tarefa.')
      }
      const pedido = {
        id: novoId('pedido'),
        entregaId: entrega.id,
        tarefaId,
        usuarioId: ctx.usuario.id,
        participanteNome: ctx.usuario.nome,
        caseTitulo: caso.titulo,
        motivo: texto,
        status: 'aberto' as const,
        criadoEm: ctx.agora.toISOString(),
        resposta: null,
      }
      ctx.estado.pedidosRevisao.push(pedido)
      const resposta: PedidoRevisaoParticipante = { id: pedido.id, tarefaId, motivo: texto, status: 'aberto', criadoEm: pedido.criadoEm, resposta: null }
      return ok(resposta)
    }),
}
