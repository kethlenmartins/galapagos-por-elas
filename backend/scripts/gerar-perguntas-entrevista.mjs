/**
 * Lê docs/cases/<área>-perguntas.md e gera o banco de perguntas do treino de entrevista:
 * - front/src/services/mock/dados/perguntas-entrevista.ts (mock)
 * - backend/drizzle/0008_treino_entrevista.sql (tabela + perguntas)
 * Uso: node backend/scripts/gerar-perguntas-entrevista.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AREAS = { vc: 'venture-capital', pe: 'private-equity', ib: 'investment-banking' }
const NIVEIS = { 'fácil': 'facil', 'médio': 'medio', 'difícil': 'dificil' }

function ler(sigla) {
  const arquivo = join(raiz, 'docs', 'cases', `${sigla}-perguntas.md`)
  if (!existsSync(arquivo)) return []
  const linhas = readFileSync(arquivo, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
  const perguntas = []
  let nivel = null
  let atual = null
  const fechar = () => {
    if (!atual) return
    if (atual.opcoes.length !== 4 || !atual.resposta || !atual.feedback) throw new Error(`${sigla}: pergunta incompleta: ${atual.enunciado}`)
    perguntas.push(atual)
    atual = null
  }
  for (const linha of linhas) {
    const cabecalho = linha.match(/^(Fácil|Médio|Difícil)(?: — \d+ perguntas)?$/i)
    if (cabecalho) { fechar(); nivel = NIVEIS[cabecalho[1].toLowerCase()]; continue }
    const pergunta = linha.match(/^(\d+)\.\s+(.*)$/)
    if (pergunta) { fechar(); atual = { nivel, enunciado: pergunta[2], opcoes: [], resposta: '', feedback: '' }; continue }
    if (!atual) continue
    const opcao = linha.match(/^([A-D])\)\s+(.*)$/)
    if (opcao) { atual.opcoes.push({ letra: opcao[1], texto: opcao[2] }); continue }
    const feedback = linha.match(/^Feedback:\s*(.*?)\s*Resposta:\s*([A-D])\.?$/)
    if (feedback) { atual.feedback = feedback[1]; atual.resposta = feedback[2]; continue }
    throw new Error(`${sigla}: linha inesperada: ${linha}`)
  }
  fechar()
  return perguntas.map((p, i) => ({ id: `${sigla}-${p.nivel}-${String(i + 1).padStart(2, '0')}`, areaId: AREAS[sigla], posicao: i + 1, ...p }))
}

const todas = Object.keys(AREAS).flatMap(ler)
const aspas = s => `'${s.replaceAll("'", "''")}'`

const ts = `/** Gerado por backend/scripts/gerar-perguntas-entrevista.mjs a partir de docs/cases/*-perguntas.md. Não edite à mão. */
import type { NivelPergunta } from '../../contratos.ts'

export type PerguntaEntrevista = {
  id: string
  areaId: string
  nivel: NivelPergunta
  enunciado: string
  opcoes: { letra: string; texto: string }[]
  resposta: string
  feedback: string
}

export const PERGUNTAS_ENTREVISTA: PerguntaEntrevista[] = ${JSON.stringify(todas.map(({ posicao, ...p }) => p), null, 2)}
`
writeFileSync(join(raiz, 'front/src/services/mock/dados/perguntas-entrevista.ts'), ts)

const sql = `-- Gerado por backend/scripts/gerar-perguntas-entrevista.mjs a partir de docs/cases/*-perguntas.md.
CREATE TABLE IF NOT EXISTS interview_questions (
  id text PRIMARY KEY,
  area_id text NOT NULL,
  level text NOT NULL,
  position integer NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL,
  answer text NOT NULL,
  feedback text NOT NULL
);
CREATE INDEX IF NOT EXISTS interview_questions_area_level ON interview_questions (area_id, level);
INSERT INTO interview_questions (id, area_id, level, position, prompt, options, answer, feedback) VALUES
${todas.map(p => `(${aspas(p.id)}, ${aspas(p.areaId)}, ${aspas(p.nivel)}, ${p.posicao}, ${aspas(p.enunciado)}, ${aspas(JSON.stringify(p.opcoes))}::jsonb, ${aspas(p.resposta)}, ${aspas(p.feedback)})`).join(',\n')}
ON CONFLICT (id) DO NOTHING;
`
writeFileSync(join(raiz, 'backend/drizzle/0008_treino_entrevista.sql'), sql)
const porArea = Object.entries(AREAS).map(([s, a]) => `${a}: ${todas.filter(p => p.areaId === a).length}`).join(', ')
console.log(`${todas.length} perguntas (${porArea})`)
