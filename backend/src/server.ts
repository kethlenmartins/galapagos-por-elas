import Fastify, { type FastifyRequest } from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { randomBytes, createHmac, randomUUID } from 'node:crypto'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'
import argon2 from 'argon2'
import { z } from 'zod'
import { db } from './db/client.js'
import { users, sessions, cases, checkpoints, tasks, enrollments, checkpointProgress, deliveries, assessments, pointEvents, contents, contentCompletions, certificates, reviewRequests, aiLogs } from './db/schema.js'
import { configuracaoPublica, gerarResultado } from '../../front/src/services/fit/motor.ts'
import { AREAS_FIT } from '../../front/src/services/fit/matriz.ts'
import { montarPdfCertificado, slug } from '../../front/src/services/mock/pdf.ts'

const app = Fastify({ logger: true, trustProxy: true })
const secure = process.env.COOKIE_SECURE !== 'false'
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret || Buffer.byteLength(sessionSecret) < 32) throw new Error('SESSION_SECRET precisa ter pelo menos 32 bytes.')
if (process.env.NODE_ENV === 'production' && !process.env.APP_ORIGIN) throw new Error('APP_ORIGIN precisa ser a origem HTTPS do Static Site.')
const hash = (value: string) => createHmac('sha256', sessionSecret).update(value).digest('hex')
/** Cookie é a via preferida. O bearer cobre navegadores que bloqueiam cookies entre os hosts do Render. */
const tokenDaRequisicao = (req: FastifyRequest) => {
  const authorization = req.headers.authorization
  return req.cookies.gpe_session ?? (authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : undefined)
}
await app.register(cookie)
await app.register(helmet)
await app.register(cors, { origin: process.env.APP_ORIGIN ?? false, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['content-type', 'authorization'] })
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

app.addHook('preHandler', async (req, reply) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.cookies.gpe_session) return
  const origin = req.headers.origin
  const expectedOrigin = process.env.APP_ORIGIN ?? `${req.protocol}://${req.headers.host}`
  if (!origin) return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: 'Origem da requisição não autorizada.' } })
  try {
    if (new URL(origin).origin !== new URL(expectedOrigin).origin) return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: 'Origem da requisição não autorizada.' } })
  } catch {
    return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: 'Origem da requisição não autorizada.' } })
  }
})

app.get('/api/health', async (_req, reply) => {
  try {
    await db.execute(sql`select 1`)
    return { ok: true }
  } catch {
    return reply.code(503).send({ ok: false })
  }
})
app.get('/api/assessment/config', async () => ({ dados: configuracaoPublica(), erro: null }))

app.post('/api/session/register', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async (req, reply) => {
  const body = z.object({ nome: z.string().min(2), email: z.email(), senha: z.string().min(8), aceitouTermos: z.literal(true) }).safeParse(req.body)
  if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Confira os dados informados.' } })
  const email = body.data.email.toLowerCase().trim()
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Não foi possível concluir o cadastro.' } })
  const [user] = await db.insert(users).values({ name: body.data.nome, email, passwordHash: await argon2.hash(body.data.senha), acceptedTermsAt: new Date(), termsVersion: process.env.TERMS_VERSION ?? '1' }).returning()
  const token = randomBytes(32).toString('base64url')
  await db.insert(sessions).values({ userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000) })
  reply.setCookie('gpe_session', token, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/', maxAge: 604800 })
  return { dados: { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false, accessToken: token }, erro: null }
})

app.post('/api/session/login', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async (req, reply) => {
  const body = z.object({ email: z.email(), senha: z.string() }).safeParse(req.body)
  if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'E-mail ou senha inválidos.' } })
  const [user] = await db.select().from(users).where(eq(users.email, body.data.email.toLowerCase().trim())).limit(1)
  if (!user || !(await argon2.verify(user.passwordHash, body.data.senha))) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'E-mail ou senha inválidos.' } })
  const token = randomBytes(32).toString('base64url')
  await db.insert(sessions).values({ userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000) })
  reply.setCookie('gpe_session', token, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/', maxAge: 604800 })
  return { dados: { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false, accessToken: token }, erro: null }
})

app.get('/api/session', async (req, reply) => {
  const token = tokenDaRequisicao(req)
  if (!token) return { dados: null, erro: null }
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, hash(token)), isNull(sessions.revokedAt))).limit(1)
  if (!session || session.expiresAt < new Date()) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Sua sessão expirou.' } })
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return { dados: user ? { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false } : null, erro: null }
})

app.post('/api/session/logout', async (req, reply) => {
  const token = tokenDaRequisicao(req)
  if (token) await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, hash(token)))
  reply.clearCookie('gpe_session', { path: '/' })
  return { dados: true, erro: null }
})

async function usuarioAtual(req: FastifyRequest) {
  const token = tokenDaRequisicao(req)
  if (!token) return null
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, hash(token)), isNull(sessions.revokedAt))).limit(1)
  if (!session || session.expiresAt < new Date()) return null
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
}

const preferenciasPadrao = { novosCases: true, lembretesPrazo: true, novosConteudos: false }
const niveis = [
  { numero: 1, nome: 'Exploradora', pontosNecessarios: 0 }, { numero: 2, nome: 'Aprendiz', pontosNecessarios: 150 },
  { numero: 3, nome: 'Analista', pontosNecessarios: 400 }, { numero: 4, nome: 'Estrategista', pontosNecessarios: 800 }, { numero: 5, nome: 'Especialista', pontosNecessarios: 1400 },
]
const regrasDePontos = [
  { id: 'perfil_completo', acao: 'Perfil completo', pontos: 20, descricao: 'Preencha seus dados no primeiro acesso.' }, { id: 'diagnostico', acao: 'Diagnóstico concluído', pontos: 100, descricao: 'Converse com a Galá e descubra suas áreas.' },
  { id: 'conteudo', acao: 'Conteúdo concluído', pontos: 10, descricao: 'Cada conteúdo de apoio que você conclui.' }, { id: 'checkpoint', acao: 'Checkpoint concluído', pontos: 30, descricao: 'Cada checkpoint do case.' },
  { id: 'resultado', acao: 'Bônus de resultado', pontos: 150, descricao: 'Até 150 pontos, conforme a nota do case.' }, { id: 'certificado', acao: 'Certificado conquistado', pontos: 100, descricao: 'Ao concluir o case e receber o certificado.' },
]
const areasPublicas = AREAS_FIT.map(a => ({ id: a.id, nome: a.nome, oQueFaz: `Conheça a área de ${a.nome}.`, descricao: `Informações introdutórias sobre ${a.nome} no mercado financeiro.` }))
const perfilPublico = (u: typeof users.$inferSelect) => ({ id: u.id, nome: u.name, nomeSocial: u.socialName, email: u.email, papel: u.role, dataNascimento: u.birthDate?.toISOString() ?? null, cidade: u.city, uf: u.state, escolaridade: u.education, objetivo: u.objective, perfilCompleto: !!u.profileCompletedAt, termosAceitosEm: u.acceptedTermsAt.toISOString(), termosVersao: u.termsVersion, preferenciasEmail: u.emailPreferences ?? preferenciasPadrao })
const eventoPublico = (e: typeof pointEvents.$inferSelect) => ({ id: e.id, acao: e.action, origem: e.origin, data: e.createdAt.toISOString(), pontos: e.points })
async function concederPontos(userId: string, actionKey: string, action: string, origin: string, points: number) {
  const [event] = await db.insert(pointEvents).values({ userId, actionKey, action, origin, points }).onConflictDoNothing().returning()
  return event ? eventoPublico(event) : null
}
async function sugerirCorrecaoGroq(deliveryId: string, respostas: unknown) {
  const key = process.env.GROQ_API_KEY; const model = process.env.GROQ_MODEL
  if (!key || !model) return
  const started = Date.now(); let status = 'falha'; let costTicks: string | null = null
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Você sugere feedback curto em português do Brasil para uma equipe revisora. Não decide nota, não use dados pessoais e retorne JSON com feedbackGeral, pontosFortes e pontosAMelhorar.' }, { role: 'user', content: JSON.stringify({ respostas }) }] }) })
    const payload = await response.json().catch(() => null) as { usage?: { cost_in_usd_ticks?: number }; choices?: Array<{ message?: { content?: string | null } }> } | null
    const content = payload?.choices?.[0]?.message?.content
    if (response.ok && content) { z.object({ feedbackGeral: z.string(), pontosFortes: z.array(z.string()), pontosAMelhorar: z.array(z.string()) }).parse(JSON.parse(content)); status = 'concluida'; costTicks = payload.usage?.cost_in_usd_ticks?.toString() ?? null }
  } catch { /* correção manual é o fallback */ }
  await db.insert(aiLogs).values({ deliveryId, provider: 'groq', model, promptVersion: 'correcao-v1', status, latencyMs: Date.now() - started, costTicks })
}
const urlValidacao = (code: string) => `${process.env.APP_ORIGIN ?? 'http://localhost:8443'}/#/validate?codigo=${encodeURIComponent(code)}`
async function certificadoDaEntrega(user: typeof users.$inferSelect, caseRow: typeof cases.$inferSelect, delivery: typeof deliveries.$inferSelect) {
  if (!delivery.publishedAt || (delivery.grade ?? 0) < 6) return null
  let [cert] = await db.select().from(certificates).where(and(eq(certificates.userId, user.id), eq(certificates.caseId, caseRow.id))).limit(1)
  if (!cert) {
    const code = `GPE-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`
    ;[cert] = await db.insert(certificates).values({ userId: user.id, caseId: caseRow.id, code }).returning()
    await concederPontos(user.id, `resultado:${caseRow.id}`, 'Bônus de resultado', caseRow.title, Math.round(((delivery.grade ?? 0) / 10) * 150))
    await concederPontos(user.id, `certificado:${cert.id}`, 'Certificado conquistado', caseRow.title, 100)
  }
  return cert
}

app.get('/api/profile', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  return { dados: perfilPublico(user), erro: null }
})
app.put('/api/profile', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const body = z.object({ nome: z.string().min(2).optional(), nomeSocial: z.string().nullable().optional(), dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/).nullable().optional(), cidade: z.string().nullable().optional(), uf: z.string().regex(/^[A-Za-z]{2}$/).nullable().optional(), escolaridade: z.string().nullable().optional(), objetivo: z.string().nullable().optional(), preferenciasEmail: z.object({ novosCases: z.boolean().optional(), lembretesPrazo: z.boolean().optional(), novosConteudos: z.boolean().optional() }).optional() }).safeParse(req.body)
  const nascimento = body.success && body.data.dataNascimento ? new Date(body.data.dataNascimento) : null
  if (!body.success || (nascimento && (Number.isNaN(nascimento.getTime()) || nascimento > new Date()))) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Confira os campos destacados.', campos: { dataNascimento: 'Informe uma data de nascimento válida.' } } })
  const d = body.data
  const update = { name: d.nome?.trim() ?? user.name, socialName: d.nomeSocial === undefined ? user.socialName : d.nomeSocial?.trim() || null, birthDate: d.dataNascimento === undefined ? user.birthDate : d.dataNascimento ? new Date(d.dataNascimento) : null, city: d.cidade === undefined ? user.city : d.cidade?.trim() || null, state: d.uf === undefined ? user.state : d.uf?.toUpperCase() || null, education: d.escolaridade === undefined ? user.education : d.escolaridade?.trim() || null, objective: d.objetivo === undefined ? user.objective : d.objetivo?.trim() || null, emailPreferences: { ...(user.emailPreferences ?? preferenciasPadrao), ...(d.preferenciasEmail ?? {}) } }
  const completo = [update.birthDate, update.city, update.state, update.education, update.objective].every(Boolean)
  const [saved] = await db.update(users).set({ ...update, profileCompletedAt: completo && !user.profileCompletedAt ? new Date() : user.profileCompletedAt }).where(eq(users.id, user.id)).returning()
  const event = completo && !user.profileCompletedAt ? await concederPontos(user.id, 'perfil_completo', 'Perfil completo', 'Onboarding', 20) : null
  return { dados: { perfil: perfilPublico(saved), eventos: event ? [event] : [] }, erro: null }
})
app.post('/api/profile/terms', async (req, reply) => {
  const user = await usuarioAtual(req); const body = z.object({ versao: z.string().min(1) }).safeParse(req.body)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Informe a versão dos termos.' } })
  const [saved] = await db.update(users).set({ acceptedTermsAt: new Date(), termsVersion: body.data.versao }).where(eq(users.id, user.id)).returning(); return { dados: perfilPublico(saved), erro: null }
})
app.get('/api/profile/export', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const [assessment] = await db.select().from(assessments).where(eq(assessments.userId, user.id)); const events = await db.select().from(pointEvents).where(eq(pointEvents.userId, user.id)); const deliveriesForUser = await db.select().from(enrollments).where(eq(enrollments.userId, user.id)); return { dados: { exportadoEm: new Date().toISOString(), perfil: perfilPublico(user), diagnostico: assessment ?? null, pontos: events.map(eventoPublico), entregas: deliveriesForUser.map(e => ({ caseId: e.caseId, status: e.status, tentativa: e.attempt })) }, erro: null } })
app.get('/api/points/balance', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const rows = await db.select({ total: sql<number>`coalesce(sum(${pointEvents.points}), 0)` }).from(pointEvents).where(eq(pointEvents.userId, user.id)); const saldo = Number(rows[0].total)
  const nivel = [...niveis].reverse().find(n => saldo >= n.pontosNecessarios) ?? niveis[0]; const proximoNivel = niveis.find(n => n.numero === nivel.numero + 1) ?? null
  return { dados: { saldo, nivel, proximoNivel, faltam: proximoNivel ? Math.max(0, proximoNivel.pontosNecessarios - saldo) : 0, progresso: proximoNivel ? Math.min(1, (saldo - nivel.pontosNecessarios) / (proximoNivel.pontosNecessarios - nivel.pontosNecessarios)) : 1 }, erro: null }
})
app.get('/api/points/events', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); return { dados: (await db.select().from(pointEvents).where(eq(pointEvents.userId, user.id)).orderBy(desc(pointEvents.createdAt))).map(eventoPublico), erro: null } })
app.get('/api/points/rules', async () => ({ dados: regrasDePontos, erro: null }))
app.get('/api/catalog/areas', async () => ({ dados: areasPublicas, erro: null }))
app.get('/api/catalog/areas/:id', async (req, reply) => { const { id } = req.params as { id: string }; const area = areasPublicas.find(a => a.id === id); return area ? { dados: area, erro: null } : reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Área não encontrada.' } }) })
app.get('/api/contents', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const q = req.query as { areaId?: string; tipo?: string; caseId?: string }; const rows = await db.select().from(contents); const done = await db.select().from(contentCompletions).where(eq(contentCompletions.userId, user.id))
  return { dados: rows.filter(c => (!q.areaId || c.areaId === q.areaId) && (!q.tipo || c.type === q.tipo) && (!q.caseId || c.caseIds.includes(q.caseId))).map(c => ({ id: c.id, titulo: c.title, tipo: c.type, areaId: c.areaId, resumo: c.summary, corpo: c.body, url: c.url, minutos: c.minutes, concluido: done.some(d => d.contentId === c.id) })), erro: null }
})
app.get('/api/contents/:id', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const { id } = req.params as { id: string }; const [c] = await db.select().from(contents).where(eq(contents.id, id)); if (!c) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } }); const [done] = await db.select().from(contentCompletions).where(and(eq(contentCompletions.userId, user.id), eq(contentCompletions.contentId, id))); return { dados: { id: c.id, titulo: c.title, tipo: c.type, areaId: c.areaId, resumo: c.summary, corpo: c.body, url: c.url, minutos: c.minutes, concluido: !!done }, erro: null } })
app.post('/api/contents/:id/complete', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const { id } = req.params as { id: string }; const [c] = await db.select().from(contents).where(eq(contents.id, id)); if (!c) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } }); await db.insert(contentCompletions).values({ userId: user.id, contentId: id }).onConflictDoNothing(); const event = await concederPontos(user.id, `conteudo:${id}`, 'Conteúdo concluído', c.title, 10); return { dados: { eventos: event ? [event] : [] }, erro: null } })
app.get('/api/certificates', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const rows = await db.select().from(certificates).where(eq(certificates.userId, user.id)); const out = await Promise.all(rows.map(async c => { const [k] = await db.select().from(cases).where(eq(cases.id, c.caseId)); return { id: c.id, codigo: c.code, caseId: c.caseId, tituloCase: k.title, area: k.areaId, nomeParticipante: user.name, emitidoEm: c.issuedAt.toISOString(), urlValidacao: urlValidacao(c.code) } })); return { dados: out, erro: null } })
app.get('/api/certificates/validate/:code', async (req) => { const { code } = req.params as { code: string }; const [c] = await db.select().from(certificates).where(eq(certificates.code, code.trim().toUpperCase())); if (!c) return { dados: null, erro: null }; const [u] = await db.select().from(users).where(eq(users.id, c.userId)); const [k] = await db.select().from(cases).where(eq(cases.id, c.caseId)); return { dados: { nome: u.name, tituloCase: k.title, emitidoEm: c.issuedAt.toISOString() }, erro: null } })
app.get('/api/certificates/:id/pdf', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const { id } = req.params as { id: string }; const [c] = await db.select().from(certificates).where(and(eq(certificates.id, id), eq(certificates.userId, user.id))); if (!c) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Certificado não encontrado.' } }); const [k] = await db.select().from(cases).where(eq(cases.id, c.caseId)); const pdf = montarPdfCertificado({ nome: user.name, tituloCase: k.title, area: k.areaId, emitidoEm: c.issuedAt.toISOString(), codigo: c.code, urlValidacao: urlValidacao(c.code) }); return { dados: { nomeArquivo: `certificado-${slug(k.title)}-${slug(user.name)}.pdf`, mimeType: 'application/pdf', url: `data:application/pdf;base64,${Buffer.from(pdf, 'binary').toString('base64')}` }, erro: null } })
app.get('/api/certificates/:id/linkedin', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const { id } = req.params as { id: string }; const [c] = await db.select().from(certificates).where(and(eq(certificates.id, id), eq(certificates.userId, user.id))); if (!c) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Certificado não encontrado.' } }); const [k] = await db.select().from(cases).where(eq(cases.id, c.caseId)); const d = c.issuedAt; return { dados: { url: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(k.title)}&organizationName=Galapagos%20por%20Elas&issueYear=${d.getUTCFullYear()}&issueMonth=${d.getUTCMonth() + 1}&certUrl=${encodeURIComponent(urlValidacao(c.code))}&certId=${encodeURIComponent(c.code)}` }, erro: null } })
app.post('/api/reviews', async (req, reply) => { const user = await usuarioAtual(req); const body = z.object({ tarefaId: z.string(), motivo: z.string().min(10).max(500) }).safeParse(req.body); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Explique o pedido entre 10 e 500 caracteres.' } }); const [task] = await db.select().from(tasks).where(eq(tasks.id, body.data.tarefaId)); const [enrollment] = task ? await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, task.caseId))) : []; const [delivery] = enrollment ? await db.select().from(deliveries).where(eq(deliveries.enrollmentId, enrollment.id)) : []; if (!task || !delivery?.publishedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'O resultado precisa estar publicado para pedir revisão.' } }); const [review] = await db.insert(reviewRequests).values({ userId: user.id, deliveryId: delivery.id, taskId: task.id, reason: body.data.motivo }).returning(); return { dados: { id: review.id, tarefaId: review.taskId, motivo: review.reason, status: 'aberto', criadoEm: review.createdAt.toISOString(), resposta: null }, erro: null } })

app.get('/api/assessment/state', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const [assessment] = await db.select().from(assessments).where(eq(assessments.userId, user.id)).orderBy(desc(assessments.createdAt)).limit(1)
  return { dados: assessment ? { status: assessment.status, total: 15, respostas: assessment.answers, versoes: assessment.versions } : { status: 'nao_iniciado', total: 15, respostas: {}, versoes: { questionario: '1.1', scoring: '1.1', matriz: '1.1' } }, erro: null }
})

app.post('/api/assessment/start', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const [assessment] = await db.insert(assessments).values({ userId: user.id, status: 'em_andamento', versions: { questionario: '1.1', scoring: '1.1', matriz: '1.1' } }).returning()
  return { dados: { status: assessment.status, total: 15, respostas: assessment.answers, versoes: assessment.versions }, erro: null }
})

app.put('/api/assessment/answer', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const body = z.object({ perguntaId: z.string(), resposta: z.enum(['A', 'B', 'C']) }).safeParse(req.body)
  if (!body.success || !configuracaoPublica().perguntas.some(p => p.id === body.data?.perguntaId)) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Resposta inválida.' } })
  let [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), eq(assessments.status, 'em_andamento'))).limit(1)
  if (!assessment) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Inicie o diagnóstico primeiro.' } })
  const answers = { ...assessment.answers, [body.data.perguntaId]: body.data.resposta }
  ;[assessment] = await db.update(assessments).set({ answers }).where(eq(assessments.id, assessment.id)).returning()
  return { dados: { status: assessment.status, total: 15, respostas: answers, versoes: assessment.versions }, erro: null }
})

app.post('/api/assessment/score', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), eq(assessments.status, 'em_andamento'))).limit(1)
  if (!assessment || Object.keys(assessment.answers).length !== 15) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Responda às 15 perguntas antes de enviar.' } })
  const result = gerarResultado(assessment.answers, { id: assessment.id, agora: new Date() })
  const [saved] = await db.update(assessments).set({ status: 'concluido', result }).where(eq(assessments.id, assessment.id)).returning()
  const [event] = await db.insert(pointEvents).values({ userId: user.id, actionKey: 'diagnostico:' + assessment.id, action: 'Diagnóstico concluído', origin: 'Diagnóstico de Fit', points: 100 }).onConflictDoNothing().returning()
  return { dados: { resultadoId: saved.id, eventos: event ? [{ id: event.id, acao: event.action, origem: event.origin, data: event.createdAt.toISOString(), pontos: event.points }] : [] }, erro: null }
})

app.get('/api/assessment/result/:id?', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { id } = req.params as { id?: string }
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), ...(id ? [eq(assessments.id, id)] : []))).limit(1)
  if (!assessment?.result) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Resultado ainda não encontrado.' } })
  return { dados: assessment.result, erro: null }
})

app.get('/api/cases', async (_req, reply) => {
  const rows = await db.select().from(cases).where(eq(cases.status, 'publicado'))
  return reply.send({ dados: rows.map(c => ({ id: c.id, titulo: c.title, areaId: c.areaId, area: c.areaId, resumo: c.summary, missao: c.mission })), erro: null })
})

app.post('/api/cases/:caseId/start', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), eq(assessments.status, 'concluido'))).limit(1)
  if (!assessment) return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua o diagnóstico antes de começar um case.' } })
  const { caseId } = req.params as { caseId: string }
  const [caseRow] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.status, 'publicado'))).limit(1)
  if (!caseRow) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Case não encontrado.' } })
  let [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId), eq(enrollments.status, 'em_andamento'))).limit(1)
  if (!enrollment) [enrollment] = await db.insert(enrollments).values({ userId: user.id, caseId }).returning()
  const rows = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId)).orderBy(checkpoints.order)
  return { dados: { enrollmentId: enrollment.id, case: caseRow, checkpoints: rows.map((c, i) => ({ ...c, status: i === 0 ? 'a_fazer' : 'a_fazer' })) }, erro: null }
})

app.get('/api/cases/:caseId', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { caseId } = req.params as { caseId: string }
  const [caseRow] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.status, 'publicado'))).limit(1)
  if (!caseRow) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Case não encontrado.' } })
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId))).limit(1)
  const cps = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId)).orderBy(checkpoints.order)
  if (!enrollment) return { dados: { id: caseRow.id, titulo: caseRow.title, areaId: caseRow.areaId, area: caseRow.areaId, resumo: caseRow.summary, missao: caseRow.mission, personagem: null, contexto: '', entenda: null, estado: 'disponivel', prazoEm: null, tentativa: 1, pontosPossiveis: 0, checkpoints: [], conteudoIds: [], proximaTarefaId: null }, erro: null }
  const progress = await db.select().from(checkpointProgress).where(eq(checkpointProgress.enrollmentId, enrollment.id))
  const checkpointsOut = cps.map(c => ({ id: c.id, ordem: c.order, etapa: c.stage, titulo: c.title, descricao: c.description, pontos: c.points, tarefaIds: c.taskIds, status: progress.find(p => p.checkpointId === c.id)?.completedAt ? 'concluido' : 'a_fazer' }))
  const allDone = checkpointsOut.every(c => c.status === 'concluido')
  const tasksRows = await db.select().from(tasks).where(eq(tasks.caseId, caseId))
  const nextTask = tasksRows.find(t => !progress.find(p => p.checkpointId === t.checkpointId)?.completedAt)?.id ?? null
  return { dados: { id: caseRow.id, titulo: caseRow.title, areaId: caseRow.areaId, area: caseRow.areaId, resumo: caseRow.summary, missao: caseRow.mission, personagem: null, contexto: caseRow.context, entenda: caseRow.content, estado: enrollment.status === 'em_avaliacao' ? 'em_avaliacao' : allDone ? 'em_andamento' : 'em_andamento', prazoEm: enrollment.deadline?.toISOString() ?? null, tentativa: enrollment.attempt, pontosPossiveis: cps.reduce((sum, c) => sum + c.points, 0), checkpoints: checkpointsOut, conteudoIds: [], proximaTarefaId: nextTask }, erro: null }
})

app.get('/api/tasks/:taskId', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { taskId } = req.params as { taskId: string }
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
  if (!task) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada.' } })
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, task.caseId), eq(enrollments.status, 'em_andamento'))).limit(1)
  if (!enrollment) return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: 'Comece este case para acessar a atividade.' } })
  const [progress] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, task.checkpointId))).limit(1)
  const answers = (progress?.answers ?? {})[taskId] ?? null
  return { dados: { id: task.id, caseId: task.caseId, checkpointId: task.checkpointId, titulo: task.title, enunciado: task.prompt, campos: task.fields, dadosApoio: task.supportData, rascunho: answers, rascunhoSalvoEm: null, somenteLeitura: !!progress?.completedAt }, erro: null }
})

app.put('/api/tasks/:taskId/draft', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { taskId } = req.params as { taskId: string }
  const body = z.object({ respostas: z.record(z.string(), z.union([z.string(), z.number(), z.null()])) }).safeParse(req.body)
  if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Respostas inválidas.' } })
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
  const [enrollment] = task ? await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, task.caseId), eq(enrollments.status, 'em_andamento'))).limit(1) : []
  if (!task || !enrollment) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada.' } })
  const [progress] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, task.checkpointId))).limit(1)
  if (progress?.completedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Este checkpoint já foi concluído.' } })
  const answers = { ...(progress?.answers ?? {}), [taskId]: body.data.respostas }
  if (progress) await db.update(checkpointProgress).set({ answers }).where(eq(checkpointProgress.id, progress.id))
  else await db.insert(checkpointProgress).values({ enrollmentId: enrollment.id, checkpointId: task.checkpointId, answers })
  return { dados: { salvoEm: new Date().toISOString() }, erro: null }
})

app.post('/api/checkpoints/:checkpointId/complete', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { checkpointId } = req.params as { checkpointId: string }
  const [cp] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  const [enrollment] = cp ? await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, cp.caseId), eq(enrollments.status, 'em_andamento'))).limit(1) : []
  if (!cp || !enrollment) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Checkpoint não encontrado.' } })
  const cps = await db.select().from(checkpoints).where(eq(checkpoints.caseId, cp.caseId)).orderBy(checkpoints.order)
  const idx = cps.findIndex(c => c.id === cp.id)
  const [previous] = idx > 0 ? await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, cps[idx - 1].id))).limit(1) : []
  if (idx > 0 && !previous?.completedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua os checkpoints anteriores primeiro.' } })
  const taskRows = await db.select().from(tasks).where(eq(tasks.checkpointId, cp.id))
  const [existingProgress] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, cp.id))).limit(1)
  for (const task of taskRows) {
    const saved = existingProgress?.answers[task.id] ?? {}
    for (const field of task.fields as Array<{ id: string; obrigatorio?: boolean; limiteCaracteres?: number }>) {
      const value = saved[field.id]
      if (field.obrigatorio && (value === undefined || value === null || value === '')) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Preencha os campos obrigatórios antes de concluir.' } })
      if (typeof value === 'string' && field.limiteCaracteres && value.length > field.limiteCaracteres) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Uma resposta excede o limite de caracteres.' } })
    }
  }
  let [progress] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, cp.id))).limit(1)
  if (!progress?.completedAt) {
    if (progress) [progress] = await db.update(checkpointProgress).set({ completedAt: new Date() }).where(eq(checkpointProgress.id, progress.id)).returning()
    else [progress] = await db.insert(checkpointProgress).values({ enrollmentId: enrollment.id, checkpointId: cp.id, completedAt: new Date() }).returning()
  }
  const [event] = await db.insert(pointEvents).values({ userId: user.id, actionKey: `checkpoint:${enrollment.id}:${cp.id}`, action: 'Checkpoint concluído', origin: cp.title, points: cp.points }).onConflictDoNothing().returning()
  return { dados: { eventos: event ? [{ id: event.id, acao: event.action, origem: event.origin, data: event.createdAt.toISOString(), pontos: event.points }] : [] }, erro: null }
})

app.post('/api/cases/:caseId/submit', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { caseId } = req.params as { caseId: string }
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId), eq(enrollments.status, 'em_andamento'))).limit(1)
  const cps = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId))
  const done = enrollment ? await db.select().from(checkpointProgress).where(eq(checkpointProgress.enrollmentId, enrollment.id)) : []
  if (!enrollment || cps.some(c => !done.some(p => p.checkpointId === c.id && p.completedAt))) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua todos os checkpoints antes de enviar.' } })
  const [delivery] = await db.insert(deliveries).values({ enrollmentId: enrollment.id }).returning()
  await db.update(enrollments).set({ status: 'em_avaliacao' }).where(eq(enrollments.id, enrollment.id))
  void sugerirCorrecaoGroq(delivery.id, done.map(p => p.answers))
  return { dados: { entregaId: delivery.id }, erro: null }
})

app.get('/api/cases/:caseId/result', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { caseId } = req.params as { caseId: string }
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId))).limit(1)
  const [delivery] = enrollment ? await db.select().from(deliveries).where(eq(deliveries.enrollmentId, enrollment.id)).limit(1) : []
  if (!delivery) return { dados: { estado: 'sem_entrega' }, erro: null }
  if (!delivery.publishedAt) return { dados: { estado: 'em_avaliacao', entregueEm: delivery.createdAt.toISOString() }, erro: null }
  const [caseRow] = await db.select().from(cases).where(eq(cases.id, caseId)); const cert = await certificadoDaEntrega(user, caseRow, delivery)
  return { dados: { estado: 'publicado', entregueEm: delivery.createdAt.toISOString(), publicadoEm: delivery.publishedAt.toISOString(), nota: delivery.grade ?? 0, notaMaxima: 10, feedbackGeral: delivery.feedback ?? '', pontosFortes: [], pontosAMelhorar: [], porTarefa: [], pontosGanhos: cert ? Math.round((delivery.grade ?? 0) / 10 * 150) + 100 : 0, certificadoId: cert?.id ?? null, aprovada: (delivery.grade ?? 0) >= 6, notaMinima: 6, tentativa: enrollment?.attempt ?? 1 }, erro: null }
})

const start = async () => {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
}
start()
