/**
 * Aplica docs/cases/<sigla>-area.json (o texto da página de cada ilha) em front/src/services/mock/dados/areas.ts.
 * O backend lê o mesmo arquivo, então o texto vale para o mock e para a API. Pode rodar quantas vezes quiser.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AREAS = { er: 'equity-research', wm: 'wealth-management', cf: 'corporate-finance', st: 'sales-trading', op: 'operacoes', mc: 'macroeconomia' }
const arquivo = join(raiz, 'front/src/services/mock/dados/areas.ts')
let codigo = readFileSync(arquivo, 'utf8')
const aspas = s => `'${s.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

for (const [sigla, areaId] of Object.entries(AREAS)) {
  const json = join(raiz, 'docs/cases', `${sigla}-area.json`)
  if (!existsSync(json)) { console.log(`sem ${sigla}-area.json: ${areaId} fica como está`); continue }
  const { oQueFaz, descricao } = JSON.parse(readFileSync(json, 'utf8'))
  const bloco = new RegExp(`(  (?:'${areaId}'|${areaId}): \\{\\n)    oQueFaz: .*\\n    descricao: .*\\n`)
  if (!bloco.test(codigo)) throw new Error(`entrada de ${areaId} não encontrada em areas.ts`)
  codigo = codigo.replace(bloco, `$1    oQueFaz: ${aspas(oQueFaz)},\n    descricao: ${aspas(descricao)},\n`)
  console.log(`${areaId}: texto aplicado`)
}
writeFileSync(arquivo, codigo)
