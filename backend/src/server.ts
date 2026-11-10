import Fastify, { type FastifyRequest } from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { randomBytes, createHmac } from 'node:crypto'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'
import argon2 from 'argon2'
import { z } from 'zod'
import { db } from './db/client.js'
import { users, sessions, cases, checkpoints, tasks, enrollments, checkpointProgress, deliveries, assessments, pointEvents } from './db/schema.js'
import { configuracaoPublica, gerarResultado } from '../../front/src/services/fit/motor.ts'

const app = Fastify({ logger: true, trustProxy: true })
const secure = process.env.COOKIE_SECURE !== 'false'
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret || Buffer.byteLength(sessionSecret) < 32) throw new Error('SESSION_SECRET precisa ter pelo menos 32 bytes.')
if (process.env.NODE_ENV === 'production' && !process.env.APP_ORIGIN) throw new Error('APP_ORIGIN precisa ser a origem HTTPS do Static Site.')
const hash = (value: string) => createHmac('sha256', sessionSecret).update(value).digest('hex')
await app.register(cookie)
await app.register(helmet)
await app.register(cors, { origin: process.env.APP_ORIGIN ?? false, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] })
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
  return { dados: { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false }, erro: null }
})

app.post('/api/session/login', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async (req, reply) => {
  const body = z.object({ email: z.email(), senha: z.string() }).safeParse(req.body)
  if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'E-mail ou senha inválidos.' } })
  const [user] = await db.select().from(users).where(eq(users.email, body.data.email.toLowerCase().trim())).limit(1)
  if (!user || !(await argon2.verify(user.passwordHash, body.data.senha))) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'E-mail ou senha inválidos.' } })
  const token = randomBytes(32).toString('base64url')
  await db.insert(sessions).values({ userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000) })
  reply.setCookie('gpe_session', token, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/', maxAge: 604800 })
  return { dados: { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false }, erro: null }
})

app.get('/api/session', async (req, reply) => {
  const token = req.cookies.gpe_session
  if (!token) return { dados: null, erro: null }
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, hash(token)), isNull(sessions.revokedAt))).limit(1)
  if (!session || session.expiresAt < new Date()) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Sua sessão expirou.' } })
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return { dados: user ? { id: user.id, nome: user.name, email: user.email, papel: user.role, perfilCompleto: false } : null, erro: null }
})

app.post('/api/session/logout', async (req, reply) => {
  const token = req.cookies.gpe_session
  if (token) await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, hash(token)))
  reply.clearCookie('gpe_session', { path: '/' })
  return { dados: true, erro: null }
})

async function usuarioAtual(req: FastifyRequest) {
  const token = req.cookies.gpe_session
  if (!token) return null
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, hash(token)), isNull(sessions.revokedAt))).limit(1)
  if (!session || session.expiresAt < new Date()) return null
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
}

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
  return { dados: { estado: 'publicado', entregueEm: delivery.createdAt.toISOString(), publicadoEm: delivery.publishedAt.toISOString(), nota: delivery.grade ?? 0, notaMaxima: 10, feedbackGeral: delivery.feedback ?? '', pontosFortes: [], pontosAMelhorar: [], porTarefa: [], pontosGanhos: 0, certificadoId: null, aprovada: (delivery.grade ?? 0) >= 6, notaMinima: 6, tentativa: enrollment?.attempt ?? 1 }, erro: null }
})

const start = async () => {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
}
start()
