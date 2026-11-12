import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { feedbackFinal, iaDisponivel, promptDoSistema, proximaPergunta, reagir, type ConfigSimulacao } from './entrevista-ia.ts'

const config: ConfigSimulacao = { vaga: 'Estágio em IB', rigor: 'exigente', dificuldade: 'intermediario', perguntas: 3 }
const resposta = (conteudo: unknown, ok = true) => (async () => ({ ok, json: async () => ({ choices: [{ message: { content: typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo) } }] }) })) as unknown as typeof fetch

beforeEach(() => { process.env.GROQ_API_KEY = 'k'; process.env.GROQ_MODEL = 'm' })
afterEach(() => { delete process.env.GROQ_API_KEY; delete process.env.GROQ_MODEL })

test('sem chave a IA fica indisponível e nada é chamado', async () => {
  delete process.env.GROQ_API_KEY
  assert.equal(iaDisponivel(), false)
  let chamou = false
  assert.equal(await proximaPergunta('IB', config, [], (async () => { chamou = true; return {} }) as unknown as typeof fetch), null)
  assert.equal(chamou, false)
})

test('o prompt do sistema trata respostas e vaga como dados, não instruções', () => {
  const p = promptDoSistema('Investment Banking', config)
  assert.match(p, /nunca instruções/)
  assert.match(p, /Exigente/)
  assert.match(p, /Investment Banking/)
})

test('a primeira pergunta e as seguintes validam o formato devolvido', async () => {
  const primeira = await proximaPergunta('IB', config, [], resposta({ proximaPergunta: 'Por que banco de investimento?' }))
  assert.equal(primeira?.proximaPergunta, 'Por que banco de investimento?')
  const seguinte = await proximaPergunta('IB', config, [{ pergunta: 'Q1?', resposta: 'R1' }], resposta({ reacao: 'Boa.', proximaPergunta: 'Explique um DCF.' }))
  assert.equal(seguinte?.reacao, 'Boa.')
})

test('formato inválido da IA tenta de novo e, sem sucesso, devolve null', async () => {
  let chamadas = 0
  const ruim = (async () => { chamadas++; return { ok: true, json: async () => ({ choices: [{ message: { content: '{"nota": 10}' } }] }) } }) as unknown as typeof fetch
  assert.equal(await proximaPergunta('IB', config, [], ruim), null)
  assert.equal(chamadas, 2)
  assert.equal(await feedbackFinal('IB', config, [], resposta('isto não é json')), null)
})

test('o feedback final exige critérios com nota de 0 a 10', async () => {
  const bom = { resumo: 'Bom treino.', criterios: [{ nome: 'Clareza', nota: 7, comentario: 'Ok' }], pontosFortes: ['a'], pontosAMelhorar: ['b'], proximosPassos: ['c'] }
  assert.equal((await feedbackFinal('IB', config, [{ pergunta: 'Q?', resposta: 'R' }], resposta(bom)))?.criterios[0].nota, 7)
  const nota11 = { ...bom, criterios: [{ nome: 'Clareza', nota: 11, comentario: 'x' }] }
  assert.equal(await feedbackFinal('IB', config, [], resposta(nota11)), null)
})

test('com banco de perguntas, a IA recebe o critério da pergunta e só devolve a reação', async () => {
  let corpo = ''
  const espia = (async (_url: string, init: { body: string }) => { corpo = init.body; return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ reacao: 'Cobriu o essencial, faltou falar de caixa.' }) } }] }) } }) as unknown as typeof fetch
  const r = await reagir('Corporate Finance', config, [{ pergunta: 'Uma empresa com lucro pode quebrar?', resposta: 'Pode.', referencia: 'Lucro não é caixa' }], espia)
  assert.equal(r?.reacao, 'Cobriu o essencial, faltou falar de caixa.')
  assert.match(corpo, /Lucro não é caixa/)
  assert.match(corpo, /criterio/)
  assert.equal(await reagir('CF', config, [], resposta({ outra: 1 })), null)
})
