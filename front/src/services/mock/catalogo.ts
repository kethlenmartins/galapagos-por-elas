import type { CatalogoService } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { executar, falha, ok } from './store.ts'

export const catalogoService: CatalogoService = {
  listarAreas: () => executar({}, () => ok(AREAS)),
  obterArea: areaId =>
    executar({}, () => {
      const area = AREAS.find(a => a.id === areaId)
      return area ? ok(area) : falha('NAO_ENCONTRADO', 'Área não encontrada.')
    }),
}
