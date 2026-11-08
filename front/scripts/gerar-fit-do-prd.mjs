/**
 * Gera as tabelas do motor de fit a partir do PRD do diagnóstico (fonte de verdade):
 *   src/services/fit/dimensoes.ts, perguntas.ts e matriz.ts
 * Uso: pnpm fit:gerar [caminho-do-prd.md]
 * Ao mudar o PRD, rode de novo, suba a versão em fit/versoes.ts e rode os testes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const raiz = path.resolve(aqui, '..')
const prd = process.argv[2] ?? path.resolve(raiz, '../docs/PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md')
const md = fs.readFileSync(prd, 'utf8')
const saida = path.resolve(raiz, 'src/services/fit')

const secao = (de, ate) => md.split(de)[1].split(ate)[0]
const celulas = linha => linha.split('|').map(c => c.trim()).filter(Boolean)
const cabecalho = `// GERADO por scripts/gerar-fit-do-prd.mjs a partir de ${path.basename(prd)}.\n// Não edite à mão: altere o PRD, suba a versão em versoes.ts e gere de novo.\n`

// --- dimensões (seção 3) ---
const dimensoes = secao('## 3.', '## 4.')
  .split('\n')
  .filter(l => /^\| D\d+ /.test(l))
  .map(l => {
    const [id, polo0, polo100, camada] = celulas(l)
    return { id, polo0, polo100, camada: camada.toLowerCase() }
  })

// --- perguntas (seção 4) ---
const perguntas = secao('## 4.', '## 5.')
  .split('### Q')
  .slice(1)
  .map(bloco => {
    const linhas = bloco.split('\n').map(l => l.trim()).filter(Boolean)
    const [num, dim] = linhas[0].split('·').map(s => s.trim())
    const opcao = letra => linhas.find(l => l.startsWith(`${letra}. `)).slice(3)
    const ponto = linhas.find(l => l.startsWith('Pontuação:'))
    const valor = letra => Number(ponto.match(new RegExp(`${letra}=(\\d+)`))[1])
    return {
      id: `Q${num}`,
      dimensaoId: dim,
      texto: linhas[1],
      opcoes: { A: opcao('A'), B: opcao('B'), C: opcao('C') },
      pontuacao: { A: valor('A'), B: valor('B'), C: valor('C') },
    }
  })

// --- matriz (seção 6) ---
const areas = []
const matriz = {}
for (const bloco of secao('## 6.', '## 7.').split('###').slice(1)) {
  const linhas = bloco.split('\n').filter(l => l.startsWith('|'))
  const colunas = celulas(linhas[0]).slice(1)
  for (const l of linhas.slice(2)) {
    const c = celulas(l)
    if (!areas.includes(c[0])) areas.push(c[0])
    matriz[c[0]] ??= {}
    colunas.forEach((d, i) => {
      const [r, w] = c[i + 1].split('/').map(Number)
      matriz[c[0]][d] = { r, w }
    })
  }
}

// --- validações: falha cedo se o PRD e o gerador divergirem ---
const falhas = []
if (dimensoes.length !== 12) falhas.push(`esperava 12 dimensões, achei ${dimensoes.length}`)
if (perguntas.length !== 15) falhas.push(`esperava 15 perguntas, achei ${perguntas.length}`)
if (areas.length !== 13) falhas.push(`esperava 13 áreas, achei ${areas.length}`)
for (const q of perguntas) if (!dimensoes.some(d => d.id === q.dimensaoId)) falhas.push(`${q.id}: dimensão ${q.dimensaoId} inexistente`)
for (const d of dimensoes) if (!perguntas.some(q => q.dimensaoId === d.id)) falhas.push(`${d.id}: sem pergunta`)
for (const a of areas) for (const d of dimensoes) {
  const c = matriz[a][d.id]
  if (!c || !(c.r >= 0 && c.r <= 100) || !Number.isInteger(c.w) || c.w < 1 || c.w > 5) falhas.push(`${a}/${d.id}: célula inválida`)
}
if (falhas.length) { console.error('PRD inconsistente:\n- ' + falhas.join('\n- ')); process.exit(1) }

// --- ids estáveis das áreas ---
const idDaArea = nome => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ids = Object.fromEntries(areas.map(a => [a, idDaArea(a)]))
const mapa = { 'Crédito e Risco': 'credito-risco', 'Sales & Trading': 'sales-trading' }
for (const [nome, id] of Object.entries(mapa)) ids[nome] = id

const j = v => JSON.stringify(v, null, 2)
fs.writeFileSync(path.join(saida, 'dimensoes.ts'), `${cabecalho}import type { DimensaoId } from './tipos.ts'\n\nexport type DefinicaoDimensao = { id: DimensaoId; camada: 'perfil' | 'trabalho'; polo0: string; polo100: string; perguntaIds: string[] }\n\nexport const DIMENSOES: DefinicaoDimensao[] = ${j(dimensoes.map(d => ({ ...d, perguntaIds: perguntas.filter(q => q.dimensaoId === d.id).map(q => q.id) })))}\n`)
fs.writeFileSync(path.join(saida, 'perguntas.ts'), `${cabecalho}import type { DimensaoId } from './tipos.ts'\n\nexport type DefinicaoPergunta = {\n  id: string\n  dimensaoId: DimensaoId\n  texto: string\n  opcoes: { A: string; B: string; C: string }\n  /** Pontuação orientada (0–100) de cada resposta. A Q04 é invertida. */\n  pontuacao: { A: number; B: number; C: number }\n}\n\nexport const PERGUNTAS: DefinicaoPergunta[] = ${j(perguntas)}\n`)
fs.writeFileSync(path.join(saida, 'matriz.ts'), `${cabecalho}import type { DimensaoId } from './tipos.ts'\n\n/** Referência (r, 0–100) e peso (w, 1–5) de cada dimensão, por área. */\nexport type CelulaMatriz = { r: number; w: number }\n\nexport const AREAS_FIT: { id: string; nome: string }[] = ${j(areas.map(a => ({ id: ids[a], nome: a })))}\n\nexport const MATRIZ: Record<string, Record<DimensaoId, CelulaMatriz>> = ${j(Object.fromEntries(areas.map(a => [ids[a], matriz[a]])))}\n`)
console.log(`ok: ${dimensoes.length} dimensões, ${perguntas.length} perguntas, ${areas.length} áreas`)
console.log(areas.map(a => `${ids[a]} (${a})`).join('\n'))
