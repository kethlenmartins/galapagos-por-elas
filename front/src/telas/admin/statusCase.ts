import type { StatusCaseAdmin } from '../../services'

export const STATUS_CASE: Record<StatusCaseAdmin, { rotulo: string; tom: 'blue' | 'pink' | 'green' | 'yellow' | 'gray' }> = {
  rascunho_ia: { rotulo: 'Rascunho (IA)', tom: 'yellow' },
  rascunho: { rotulo: 'Rascunho', tom: 'yellow' },
  revisado: { rotulo: 'Revisado', tom: 'blue' },
  publicado: { rotulo: 'Publicado', tom: 'green' },
  arquivado: { rotulo: 'Arquivado', tom: 'gray' },
}
