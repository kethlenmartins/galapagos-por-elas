/**
 * Lê docs/cases/<sigla>-vagas.md (tabelas de vagas conferidas) e gera:
 * - backend/drizzle/0019_vagas.sql (tabela `jobs` + as vagas como RASCUNHO)
 * - front/src/services/mock/dados/vagas.ts (mesmos dados para o mock)
 * As vagas entram como rascunho de propósito: os documentos pedem nova conferência antes de publicar,
 * então a equipe confere e publica cada uma na tela de admin.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AREAS = { cf: 'corporate-finance', st: 'sales-trading', op: 'operacoes', er: 'equity-research', wm: 'wealth-management' }

const tipoDe = titulo => (/est[áa]gio|estagi[áa]ri/i.test(titulo) ? 'estagio' : /j[úu]nior|\bjr\b/i.test(titulo) ? 'junior' : 'outro')
const dataISO = br => { const [d, m, a] = br.split('/'); return `${a}-${m}-${d}` }

const vagas = []
for (const [sigla, areaId] of Object.entries(AREAS)) {
  const arquivo = join(raiz, 'docs', 'cases', `${sigla}-vagas.md`)
  if (!existsSync(arquivo)) continue
  for (const linha of readFileSync(arquivo, 'utf8').split('\n')) {
    const c = linha.split('|').map(x => x.trim())
    if (c.length < 8 || !/^\d+$/.test(c[1])) continue
    const url = (c[5].match(/\((https?:\/\/[^)]+)\)/) ?? c[5].match(/(https?:\/\/\S+)/))?.[1]
    if (!url) throw new Error(`${sigla}: vaga sem link: ${linha}`)
    vagas.push({ id: `vaga-${sigla}-${c[1]}`, areaId, empresa: c[2], titulo: c[3], local: c[4], tipo: tipoDe(c[3]), url, conferidaEm: dataISO(c[6]) })
  }
}

const aspas = s => `'${s.replaceAll("'", "''")}'`
writeFileSync(join(raiz, 'backend/drizzle/0019_vagas.sql'), `-- Gerado por backend/scripts/gerar-vagas.mjs a partir de docs/cases/*-vagas.md.
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  area_id text NOT NULL,
  company text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  kind text NOT NULL DEFAULT 'outro',
  url text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho',
  checked_at date,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_area_status ON jobs (area_id, status);
-- Rascunho: a equipe confere de novo e publica na tela de admin.
INSERT INTO jobs (id, area_id, company, title, location, kind, url, status, checked_at) VALUES
${vagas.map(v => `(${aspas(v.id)}, ${aspas(v.areaId)}, ${aspas(v.empresa)}, ${aspas(v.titulo)}, ${aspas(v.local)}, ${aspas(v.tipo)}, ${aspas(v.url)}, 'rascunho', ${aspas(v.conferidaEm)})`).join(',\n')}
ON CONFLICT (id) DO NOTHING;
`)
writeFileSync(join(raiz, 'front/src/services/mock/dados/vagas.ts'), `/** Gerado por backend/scripts/gerar-vagas.mjs a partir de docs/cases/*-vagas.md. Não edite à mão. */
import type { TipoVaga } from '../../contratos.ts'

export type VagaInicial = { id: string; areaId: string; empresa: string; titulo: string; local: string; tipo: TipoVaga; url: string; conferidaEm: string }

/** Entram como rascunho: a equipe confere de novo e publica uma a uma. */
export const VAGAS_INICIAIS: VagaInicial[] = ${JSON.stringify(vagas, null, 2)}
`)
console.log(`${vagas.length} vagas`, Object.fromEntries(Object.values(AREAS).map(a => [a, vagas.filter(v => v.areaId === a).length])))
