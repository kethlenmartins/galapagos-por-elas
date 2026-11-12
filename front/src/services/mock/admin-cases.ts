import type { AdminCasesService, BriefingCase, CaseAdmin, CaseResumoAdmin } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { conferirGabarito } from './gabarito.ts'
import { gerarCase, regenerarSecao } from './gerador.ts'
import { executarLogada, falha, novoId, ok } from './store.ts'

/** Só é possível editar enquanto o case não foi publicado nem arquivado. */
const editavel = (caso: CaseAdmin) => caso.status !== 'publicado' && caso.status !== 'arquivado'

function validarBriefing(b: BriefingCase): Record<string, string> {
  const erros: Record<string, string> = {}
  if (!AREAS.some(a => a.id === b.areaId)) erros.areaId = 'Escolha uma área.'
  if (b.tema.trim().length < 5) erros.tema = 'Descreva o tema do case.'
  if (!Number.isInteger(b.numCheckpoints) || b.numCheckpoints < 1 || b.numCheckpoints > 8) erros.numCheckpoints = 'Use de 1 a 8 checkpoints.'
  if (!Number.isInteger(b.numTarefas) || b.numTarefas < 1 || b.numTarefas > 6) erros.numTarefas = 'Use de 1 a 6 tarefas.'
  return erros
}

export const adminCasesService: AdminCasesService = {
  listarCases: filtro =>
    executarLogada(({ estado }) => {
      const lista: CaseResumoAdmin[] = estado.cases
        .filter(c => !filtro?.status || c.status === filtro.status)
        .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
        .map(c => ({
          id: c.id,
          titulo: c.titulo,
          areaId: c.areaId,
          area: AREAS.find(a => a.id === c.areaId)?.nome ?? c.areaId,
          status: c.status,
          geradoPorIA: c.geradoPorIA,
        }))
      return ok(lista)
    }, 'equipe'),

  obterCase: caseId =>
    executarLogada(({ estado }) => {
      const caso = estado.cases.find(c => c.id === caseId)
      return caso ? ok(caso) : falha('NAO_ENCONTRADO', 'Case não encontrado.')
    }, 'equipe'),

  gerarRascunhoComIA: briefing =>
    executarLogada(({ estado, agora, iaDisponivel }) => {
      const erros = validarBriefing(briefing)
      if (Object.keys(erros).length) return falha('VALIDACAO', 'Confira os campos do briefing.', erros)
      if (!iaDisponivel) return falha('IA_INDISPONIVEL', 'Não conseguimos gerar agora. Tente de novo ou preencha manualmente.')
      const caso = gerarCase(briefing, { id: novoId('case'), agora, ordem: Math.max(0, ...estado.cases.map(c => c.ordem)) + 1 })
      estado.cases.push(caso)
      return ok(caso)
    }, 'equipe'),

  regenerarSecao: (caseId, secao) =>
    executarLogada(({ estado, agora, iaDisponivel }) => {
      const indice = estado.cases.findIndex(c => c.id === caseId)
      if (indice < 0) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      if (!editavel(estado.cases[indice])) return falha('VALIDACAO', 'Este case já foi publicado e não pode ser editado.')
      if (!iaDisponivel) return falha('IA_INDISPONIVEL', 'Não conseguimos gerar agora. Tente de novo ou edite manualmente.')
      const novo = regenerarSecao(estado.cases[indice], secao, estado.contador, agora)
      estado.contador += 1
      estado.cases[indice] = novo
      return ok(novo)
    }, 'equipe'),

  salvarCase: caso =>
    executarLogada(({ estado, agora }) => {
      const indice = estado.cases.findIndex(c => c.id === caso.id)
      if (indice < 0) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      const atual = estado.cases[indice]
      if (!editavel(atual)) return falha('VALIDACAO', 'Este case já foi publicado e não pode ser editado.')
      if (caso.titulo.trim().length < 3) return falha('VALIDACAO', 'Informe o título do case.', { titulo: 'Informe o título do case.' })
      if (caso.checkpoints.length < 1 || caso.tarefas.length < 1) return falha('VALIDACAO', 'O case precisa de pelo menos um checkpoint e uma tarefa.')

      // O status não muda por aqui. Editar um case revisado exige nova revisão.
      const novo: CaseAdmin = {
        ...caso,
        status: atual.status === 'revisado' ? 'rascunho' : atual.status,
        geradoPorIA: atual.geradoPorIA,
        gabaritoConfirmado: false,
        revisadoEm: null,
        atualizadoEm: agora.toISOString(),
      }
      estado.cases[indice] = novo
      return ok(novo)
    }, 'equipe'),

  conferirGabarito: caseId =>
    executarLogada(({ estado }) => {
      const caso = estado.cases.find(c => c.id === caseId)
      return caso ? ok(conferirGabarito(caso.gabarito, caso.dadosApoio)) : falha('NAO_ENCONTRADO', 'Case não encontrado.')
    }, 'equipe'),

  aprovarCase: (caseId, opcoes) =>
    executarLogada(({ estado, agora }) => {
      const caso = estado.cases.find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      if (!['rascunho_ia', 'rascunho', 'revisado'].includes(caso.status)) return falha('VALIDACAO', 'Este case não está em rascunho.')
      if (!opcoes.gabaritoConfirmado) return falha('VALIDACAO', 'Confirme que você revisou o gabarito.', { gabaritoConfirmado: 'Confirme a revisão do gabarito.' })
      if (!conferirGabarito(caso.gabarito, caso.dadosApoio).confere) {
        return falha('VALIDACAO', 'O gabarito não confere com os dados de apoio. Corrija antes de aprovar.')
      }
      caso.status = 'revisado'
      caso.gabaritoConfirmado = true
      caso.revisadoEm = agora.toISOString()
      caso.atualizadoEm = agora.toISOString()
      return ok(caso)
    }, 'equipe'),

  publicarCase: caseId =>
    executarLogada(({ estado, agora }) => {
      const caso = estado.cases.find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      if (caso.status !== 'revisado' && caso.status !== 'arquivado') return falha('VALIDACAO', 'Aprove o case antes de publicar.')
      caso.status = 'publicado'
      caso.atualizadoEm = agora.toISOString()
      return ok(caso)
    }, 'equipe'),

  arquivarCase: caseId =>
    executarLogada(({ estado, agora }) => {
      const caso = estado.cases.find(c => c.id === caseId)
      if (!caso) return falha('NAO_ENCONTRADO', 'Case não encontrado.')
      if (caso.status !== 'publicado') return falha('VALIDACAO', 'Só é possível arquivar um case publicado.')
      caso.status = 'arquivado'
      caso.atualizadoEm = agora.toISOString()
      return ok(caso)
    }, 'equipe'),
}
