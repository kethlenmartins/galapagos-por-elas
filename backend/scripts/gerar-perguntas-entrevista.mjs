/**
 * Lê docs/cases/<área>-perguntas.md e gera o banco de perguntas do treino de entrevista:
 * - front/src/services/mock/dados/perguntas-entrevista.ts (mock)
 * - backend/drizzle/0009_treino_temas.sql (coluna de tema + upsert das perguntas; a 0008 criou a tabela e já foi aplicada)
 * Uso: node backend/scripts/gerar-perguntas-entrevista.mjs
 *   Sem argumentos: reescreve o mock e a 0009 (já aplicada; não rode isso para áreas novas).
 *   Para áreas novas, gere só a migração delas: --migracao 0018_perguntas_er_wm.sql --siglas er,wm
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AREAS = { vc: 'venture-capital', pe: 'private-equity', ib: 'investment-banking', er: 'equity-research', wm: 'wealth-management' }
const NIVEIS = { 'fácil': 'facil', 'médio': 'medio', 'difícil': 'dificil' }

function ler(sigla) {
  const arquivo = join(raiz, 'docs', 'cases', `${sigla}-perguntas.md`)
  if (!existsSync(arquivo)) return []
  const linhas = readFileSync(arquivo, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
  const perguntas = []
  let nivel = null
  let tema = null
  let atual = null
  const fechar = () => {
    if (!atual) return
    if (atual.opcoes.length !== 4 || !atual.resposta || !atual.feedback) throw new Error(`${sigla}: pergunta incompleta: ${atual.enunciado}`)
    perguntas.push(atual)
    atual = null
  }
  for (const linha of linhas) {
    // "Fácil", "Fácil — 17 perguntas" ou, com subtema, "M&A — Fácil".
    const cabecalho = linha.match(/^(?:(.+?) — )?(Fácil|Médio|Difícil)(?: — \d+ perguntas)?$/i)
    if (cabecalho) { fechar(); tema = cabecalho[1] ?? null; nivel = NIVEIS[cabecalho[2].toLowerCase()]; continue }
    const pergunta = linha.match(/^(\d+)\.\s+(.*)$/)
    if (pergunta) { fechar(); atual = { nivel, tema, enunciado: pergunta[2], opcoes: [], resposta: '', feedback: '' }; continue }
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

const arg = nome => { const i = process.argv.indexOf(`--${nome}`); return i >= 0 ? process.argv[i + 1] : null }
const todas = Object.keys(AREAS).flatMap(ler)
const arquivoSql = arg('migracao') ?? '0009_treino_temas.sql'
const siglasSql = (arg('siglas') ?? Object.keys(AREAS).join(',')).split(',')
const paraSql = todas.filter(p => siglasSql.some(s => AREAS[s] === p.areaId))
const aspas = s => `'${s.replaceAll("'", "''")}'`

const ts = `/** Gerado por backend/scripts/gerar-perguntas-entrevista.mjs a partir de docs/cases/*-perguntas.md. Não edite à mão. */
import type { NivelPergunta } from '../../contratos.ts'

export type PerguntaEntrevista = {
  id: string
  areaId: string
  nivel: NivelPergunta
  /** Subtema da área (ex.: M&A, DCM, ECM no IB); null quando a área não se divide. */
  tema: string | null
  enunciado: string
  opcoes: { letra: string; texto: string }[]
  resposta: string
  feedback: string
}

export const PERGUNTAS_ENTREVISTA: PerguntaEntrevista[] = ${JSON.stringify(todas.map(({ posicao, ...p }) => p), null, 2)}
`
writeFileSync(join(raiz, 'front/src/services/mock/dados/perguntas-entrevista.ts'), ts)

const sql = `-- Gerado por backend/scripts/gerar-perguntas-entrevista.mjs a partir de docs/cases/*-perguntas.md.
${arquivoSql.startsWith('0009') ? 'ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS topic text;\n' : ''}INSERT INTO interview_questions (id, area_id, level, topic, position, prompt, options, answer, feedback) VALUES
${paraSql.map(p => `(${aspas(p.id)}, ${aspas(p.areaId)}, ${aspas(p.nivel)}, ${p.tema ? aspas(p.tema) : 'NULL'}, ${p.posicao}, ${aspas(p.enunciado)}, ${aspas(JSON.stringify(p.opcoes))}::jsonb, ${aspas(p.resposta)}, ${aspas(p.feedback)})`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET area_id = EXCLUDED.area_id, level = EXCLUDED.level, topic = EXCLUDED.topic, position = EXCLUDED.position,
  prompt = EXCLUDED.prompt, options = EXCLUDED.options, answer = EXCLUDED.answer, feedback = EXCLUDED.feedback;
`
writeFileSync(join(raiz, 'backend/drizzle/' + arquivoSql), sql)
const porArea = Object.entries(AREAS).map(([s, a]) => `${a}: ${todas.filter(p => p.areaId === a).length}`).join(', ')
console.log(`${todas.length} perguntas (${porArea})`)
