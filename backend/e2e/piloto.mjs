import assert from 'node:assert/strict'
import pg from 'pg'

const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000/api'
const origin = process.env.E2E_ORIGIN ?? new URL(base).origin
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
let cookie = ''
async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(base + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? { origin } : {}), ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]
  const data = await response.json()
  assert.ok(response.ok, `${method} ${path}: ${response.status} ${JSON.stringify(data)}`)
  return data.dados
}

try {
  const preflight = await fetch(`${base}/session/login`, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } })
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
  assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true')
  const email = `e2e-${Date.now()}@example.test`
  const session = await request('/session/register', { method: 'POST', body: { nome: 'Participante E2E', email, senha: 'SenhaSegura!123', aceitouTermos: true } })
  assert.equal(session.papel, 'participante')
  assert.equal((await request('/session')).id, session.id)

  const secondEmail = `other-${Date.now()}@example.test`
  await request('/session/register', { method: 'POST', body: { nome: 'Outra Participante', email: secondEmail, senha: 'SenhaSegura!123', aceitouTermos: true } })
  assert.equal((await request('/assessment/state')).status, 'nao_iniciado')
  await request('/session/login', { method: 'POST', body: { email, senha: 'SenhaSegura!123' } })

  const config = await request('/assessment/config')
  assert.equal(config.perguntas.length, 15)
  await request('/assessment/start', { method: 'POST' })
  for (const pergunta of config.perguntas) await request('/assessment/answer', { method: 'PUT', body: { perguntaId: pergunta.id, resposta: 'C' } })
  const assessment = await request('/assessment/score', { method: 'POST' })
  const result = await request(`/assessment/result/${assessment.resultadoId}`)
  assert.equal(result.areas.length, 13)

  const started = await request('/cases/piloto-corporate-finance/start', { method: 'POST' })
  assert.equal(started.checkpoints.length, 2)
  await request('/checkpoints/piloto-cp-1/complete', { method: 'POST' })
  const visibleTask = await request('/tasks/piloto-task-1')
  assert.equal('answerKey' in visibleTask, false, 'o gabarito nunca é enviado à participante')
  await request('/tasks/piloto-task-1/draft', { method: 'PUT', body: { respostas: { recomendacao: 'Investiria com ressalvas, acompanhando o endividamento.' } } })
  await request('/checkpoints/piloto-cp-2/complete', { method: 'POST' })
  const submission = await request('/cases/piloto-corporate-finance/submit', { method: 'POST' })
  const pending = await request('/cases/piloto-corporate-finance/result')
  assert.equal(pending.estado, 'em_avaliacao')

  await pool.query("UPDATE deliveries SET status='publicada', grade=8, feedback='Boa análise dos riscos.', published_at=now() WHERE id=$1", [submission.entregaId])
  const published = await request('/cases/piloto-corporate-finance/result')
  assert.equal(published.estado, 'publicado')
  assert.equal(published.nota, 8)
  assert.match(published.feedbackGeral, /Boa análise/)
  await request('/session/login', { method: 'POST', body: { email: secondEmail, senha: 'SenhaSegura!123' } })
  const privateResult = await fetch(`${base}/assessment/result/${assessment.resultadoId}`, { headers: { cookie, origin: new URL(base).origin } })
  assert.equal(privateResult.status, 404, 'outra participante não pode ler resultado do diagnóstico alheio')
  console.log('E2E piloto aprovado: cadastro → diagnóstico → checkpoints → envio → correção publicada → resultado.')
} finally {
  await pool.end()
}
