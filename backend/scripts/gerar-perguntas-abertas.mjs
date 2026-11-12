/**
 * Lê docs/cases/<sigla>-entrevista-aberta.md (perguntas abertas + "o que uma boa resposta mostra") e gera:
 * - backend/drizzle/0020_perguntas_abertas.sql (tabela interview_open_questions + as perguntas)
 * - front/src/services/mock/dados/perguntas-abertas.ts (mesmos dados para a demonstração do mock)
 * O "o que uma boa resposta mostra" é a régua da IA na simulação e nunca vai para o navegador.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AREAS = { cf: 'corporate-finance', st: 'sales-trading', op: 'operacoes' }

const perguntas = []
for (const [sigla, areaId] of Object.entries(AREAS)) {
  const arquivo = join(raiz, 'docs', 'cases', `${sigla}-entrevista-aberta.md`)
  if (!existsSync(arquivo)) continue
  const linhas = readFileSync(arquivo, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
  let atual = null
  const fechar = () => {
    if (!atual) return
    if (!atual.referencia) throw new Error(`${sigla}: pergunta sem referência: ${atual.pergunta}`)
    perguntas.push(atual)
    atual = null
  }
  for (const linha of linhas) {
    const p = linha.match(/^(\d+)\.\s+(.*)$/)
    if (p) { fechar(); atual = { id: `${sigla}-aberta-${String(p[1]).padStart(2, '0')}`, areaId, posicao: Number(p[1]), pergunta: p[2], referencia: '' }; continue }
    const r = linha.match(/^-\s*O que uma boa resposta mostra:\s*(.*)$/i)
    if (r && atual) { atual.referencia = r[1].trim(); continue }
  }
  fechar()
}

const aspas = s => `'${s.replaceAll("'", "''")}'`
writeFileSync(join(raiz, 'backend/drizzle/0020_perguntas_abertas.sql'), `-- Gerado por backend/scripts/gerar-perguntas-abertas.mjs a partir de docs/cases/*-entrevista-aberta.md.
CREATE TABLE IF NOT EXISTS interview_open_questions (
  id text PRIMARY KEY,
  area_id text NOT NULL,
  position integer NOT NULL,
  prompt text NOT NULL,
  good_answer text NOT NULL
);
CREATE INDEX IF NOT EXISTS interview_open_questions_area ON interview_open_questions (area_id);
INSERT INTO interview_open_questions (id, area_id, position, prompt, good_answer) VALUES
${perguntas.map(p => `(${aspas(p.id)}, ${aspas(p.areaId)}, ${p.posicao}, ${aspas(p.pergunta)}, ${aspas(p.referencia)})`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET prompt = EXCLUDED.prompt, good_answer = EXCLUDED.good_answer, position = EXCLUDED.position;
`)
writeFileSync(join(raiz, 'front/src/services/mock/dados/perguntas-abertas.ts'), `/** Gerado por backend/scripts/gerar-perguntas-abertas.mjs a partir de docs/cases/*-entrevista-aberta.md. Não edite à mão. */
export type PerguntaAberta = { id: string; areaId: string; pergunta: string; referencia: string }

export const PERGUNTAS_ABERTAS: PerguntaAberta[] = ${JSON.stringify(perguntas.map(({ posicao, ...p }) => p), null, 2)}
`)
console.log(`${perguntas.length} perguntas abertas`, Object.fromEntries(Object.values(AREAS).map(a => [a, perguntas.filter(p => p.areaId === a).length])))
