/** Vagas do mock (na memória). As iniciais entram como rascunho: a equipe confere e publica na tela de admin. */
import type { AdminVagasService, VagaAdmin, VagaService } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { VAGAS_INICIAIS } from './dados/vagas.ts'
import { executarLogada, falha, novoId, ok } from './store.ts'

let vagas: VagaAdmin[] = VAGAS_INICIAIS.map(v => ({ ...v, status: 'rascunho', observacao: null }))

/** Só para os testes: volta ao conjunto inicial. */
export const resetarVagasDoMock = () => {
  vagas = VAGAS_INICIAIS.map(v => ({ ...v, status: 'rascunho', observacao: null }))
}

const publica = ({ status: _s, observacao: _o, ...vaga }: VagaAdmin) => vaga

export const vagaService: VagaService = {
  listarVagas: filtro =>
    executarLogada(() =>
      ok(
        vagas
          .filter(v => v.status === 'aberta' && (!filtro?.areaId || v.areaId === filtro.areaId))
          .sort((a, b) => (b.conferidaEm ?? '').localeCompare(a.conferidaEm ?? '') || a.empresa.localeCompare(b.empresa))
          .map(publica),
      ),
    ),
}

export const adminVagasService: AdminVagasService = {
  listarVagasAdmin: () => executarLogada(() => ok([...vagas].sort((a, b) => a.areaId.localeCompare(b.areaId) || a.empresa.localeCompare(b.empresa))), 'equipe'),

  salvarVaga: dados =>
    executarLogada(() => {
      const campos: Record<string, string> = {}
      if (!dados.empresa.trim()) campos.empresa = 'Informe a empresa.'
      if (!dados.titulo.trim()) campos.titulo = 'Informe o nome da vaga.'
      if (!dados.local.trim()) campos.local = 'Informe o local.'
      if (!AREAS.some(a => a.id === dados.areaId)) campos.areaId = 'Escolha uma área.'
      if (!dados.url.trim().startsWith('https://')) campos.url = 'O link precisa começar com https://'
      if (Object.keys(campos).length) return falha('VALIDACAO', 'Revise os campos da vaga.', campos)
      const existente = dados.id ? vagas.find(v => v.id === dados.id) : undefined
      if (dados.id && !existente) return falha('NAO_ENCONTRADO', 'Vaga não encontrada.')
      if (existente) {
        const mudou = existente.url !== dados.url || existente.titulo !== dados.titulo || existente.empresa !== dados.empresa
        Object.assign(existente, { ...dados, status: mudou && existente.status === 'aberta' ? 'rascunho' : existente.status })
        return ok(existente)
      }
      const nova: VagaAdmin = { ...dados, id: novoId('vaga'), status: 'rascunho', conferidaEm: null, observacao: dados.observacao ?? null }
      vagas.push(nova)
      return ok(nova)
    }, 'equipe'),

  publicarVaga: id =>
    executarLogada(({ agora }) => {
      const v = vagas.find(x => x.id === id)
      if (!v) return falha('NAO_ENCONTRADO', 'Vaga não encontrada.')
      v.status = 'aberta'
      v.conferidaEm = agora.toISOString().slice(0, 10)
      return ok(v)
    }, 'equipe'),

  encerrarVaga: id =>
    executarLogada(() => {
      const v = vagas.find(x => x.id === id)
      if (!v) return falha('NAO_ENCONTRADO', 'Vaga não encontrada.')
      v.status = 'encerrada'
      return ok(v)
    }, 'equipe'),

  removerVaga: id =>
    executarLogada(() => {
      vagas = vagas.filter(v => v.id !== id)
      return ok(null)
    }, 'equipe'),
}
