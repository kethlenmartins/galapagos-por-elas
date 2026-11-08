import type { AdminConteudosService, ConteudoAdmin } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { executarLogada, falha, novoId, ok } from './store.ts'
import type { EstadoMock } from './tipos.ts'

const TIPOS = ['artigo', 'video', 'glossario', 'link']

/** Mantém o vínculo conteúdo ↔ case coerente nos dois lados. */
function sincronizarVinculos(estado: EstadoMock, conteudo: ConteudoAdmin) {
  for (const caso of estado.cases) {
    const vinculado = conteudo.caseIds.includes(caso.id)
    const tem = caso.conteudoIds.includes(conteudo.id)
    if (vinculado && !tem) caso.conteudoIds.push(conteudo.id)
    if (!vinculado && tem) caso.conteudoIds = caso.conteudoIds.filter(id => id !== conteudo.id)
  }
}

function validar(c: Omit<ConteudoAdmin, 'id'>): Record<string, string> {
  const erros: Record<string, string> = {}
  if (c.titulo.trim().length < 3) erros.titulo = 'Informe o título.'
  if (!TIPOS.includes(c.tipo)) erros.tipo = 'Escolha o tipo.'
  if (!AREAS.some(a => a.id === c.areaId)) erros.areaId = 'Escolha uma área.'
  if (!Number.isFinite(c.minutos) || c.minutos < 1) erros.minutos = 'Informe o tempo estimado em minutos.'
  if ((c.tipo === 'video' || c.tipo === 'link') && !/^https?:\/\//.test(c.url ?? '')) erros.url = 'Informe um link que comece com http:// ou https://.'
  if ((c.tipo === 'artigo' || c.tipo === 'glossario') && !(c.corpo ?? '').trim()) erros.corpo = 'Escreva o conteúdo.'
  return erros
}

export const adminConteudosService: AdminConteudosService = {
  listarConteudosAdmin: () => executarLogada(({ estado }) => ok(estado.conteudos), 'equipe'),

  salvarConteudo: conteudo =>
    executarLogada(({ estado }) => {
      const erros = validar(conteudo)
      if (Object.keys(erros).length) return falha('VALIDACAO', 'Confira os campos destacados.', erros)
      const semId: Omit<ConteudoAdmin, 'id'> = {
        titulo: conteudo.titulo.trim(),
        tipo: conteudo.tipo,
        areaId: conteudo.areaId,
        resumo: conteudo.resumo.trim(),
        corpo: conteudo.corpo,
        url: conteudo.url,
        minutos: conteudo.minutos,
        caseIds: conteudo.caseIds.filter(id => estado.cases.some(c => c.id === id)),
      }
      if (conteudo.id) {
        const indice = estado.conteudos.findIndex(c => c.id === conteudo.id)
        if (indice < 0) return falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.')
        estado.conteudos[indice] = { id: conteudo.id, ...semId }
        sincronizarVinculos(estado, estado.conteudos[indice])
        return ok(estado.conteudos[indice])
      }
      const novo: ConteudoAdmin = { id: novoId('cont'), ...semId }
      estado.conteudos.push(novo)
      sincronizarVinculos(estado, novo)
      return ok(novo)
    }, 'equipe'),

  removerConteudo: conteudoId =>
    executarLogada(({ estado }) => {
      if (!estado.conteudos.some(c => c.id === conteudoId)) return falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.')
      estado.conteudos = estado.conteudos.filter(c => c.id !== conteudoId)
      for (const caso of estado.cases) caso.conteudoIds = caso.conteudoIds.filter(id => id !== conteudoId)
      return ok(true as const)
    }, 'equipe'),
}
