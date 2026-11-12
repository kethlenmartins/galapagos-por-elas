import Fastify, { type FastifyRequest } from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { randomBytes, createHmac, randomUUID } from 'node:crypto'
import { eq, and, isNull, desc, sql, inArray } from 'drizzle-orm'
import argon2 from 'argon2'
import { z } from 'zod'
import { db } from './db/client.js'
import { users, sessions, cases, checkpoints, tasks, enrollments, checkpointProgress, deliveries, assessments, pointEvents, contents, contentCompletions, certificates, reviewRequests, aiLogs, taskReviews, interviewQuestions, interviewSessions, trainingAnswers, jobs, interviewOpenQuestions, forumProfiles, forumCategories, forumPosts, forumReplies, forumVotes, forumFollows, forumReports, forumSavedPosts } from './db/schema.js'
import { configuracaoPublica, gerarResultado } from '../../front/src/services/fit/motor.ts'
import { AREAS } from '../../front/src/services/mock/dados/areas.ts'
import { revisarEtapa } from './revisao-ia.js'
import { GROQ_URL, diagnosticarIA, feedbackFinal, iaDisponivel, proximaPergunta, reagir, type TurnoSalvo } from './entrevista-ia.js'
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
// Só os testes e2e sobem o limite (RATE_LIMIT_MAX); em produção vale o padrão.
await app.register(rateLimit, { max: Number(process.env.RATE_LIMIT_MAX ?? 100), timeWindow: '1 minute' })

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
const areasPublicas = AREAS.map(a => ({ id: a.id, nome: a.nome, oQueFaz: a.oQueFaz, descricao: a.descricao }))
const nomeDaArea = (areaId: string) => areasPublicas.find(a => a.id === areaId)?.nome ?? areaId
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
    const response = await fetch(GROQ_URL, { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Você sugere feedback curto em português do Brasil para uma equipe revisora. Não decide nota, não use dados pessoais e retorne JSON com feedbackGeral, pontosFortes e pontosAMelhorar.' }, { role: 'user', content: JSON.stringify({ respostas }) }] }) })
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
    const code = `ALU-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`
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

// --- Fórum ----------------------------------------------------------------------------------------------------------
const erroLoginForum = { dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }
const dadosPessoaisNoTexto = /(\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[-\s]?\d{2}\b|\b\d{10,11}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co)\/)/i
const perfilForumPublico = (p: typeof forumProfiles.$inferSelect) => ({ apelido: p.nickname, mostrarArea: p.showArea, mostrarMedalhas: p.showBadges, alteradoEm: p.nicknameChangedAt?.toISOString() ?? null })
const categoriaForumPublica = (c: typeof forumCategories.$inferSelect) => ({ id: c.id, nome: c.name, descricao: c.description, ordem: c.position })
async function perfilForumDoUsuario(id: string) { const [perfil] = await db.select().from(forumProfiles).where(eq(forumProfiles.userId, id)).limit(1); return perfil }
async function podePublicarNoForum(user: typeof users.$inferSelect) {
  if (user.birthDate) { const idade = (Date.now() - user.birthDate.getTime()) / 31557600000; if (idade < 18) return 'O fórum está disponível apenas para maiores de 18 anos nesta fase.' }
  const silenciada = await db.execute(sql`select 1 from forum_sanctions where user_id = ${user.id} and kind in ('silenciada', 'banida') and (until_at is null or until_at > now()) limit 1`)
  return silenciada.rows.length ? 'Sua conta está impedida de publicar no fórum. Procure a equipe se precisar de ajuda.' : null
}
function validarTextoForum(texto: string, maximo: number, nome: string, campos: Record<string, string>) { if (!texto.trim()) campos[nome] = 'Este campo é obrigatório.'; else if (texto.trim().length > maximo) campos[nome] = `Use no máximo ${maximo} caracteres.`; else if (dadosPessoaisNoTexto.test(texto)) campos[nome] = 'Remova dados pessoais, e-mails, telefones ou links encurtados antes de publicar.' }
app.get('/api/forum/categories', async (req, reply) => { if (!(await usuarioAtual(req))) return reply.code(401).send(erroLoginForum); return { dados: (await db.select().from(forumCategories).orderBy(forumCategories.position)).map(categoriaForumPublica), erro: null } })
app.get('/api/forum/profile', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const perfil = await perfilForumDoUsuario(user.id); return { dados: perfil ? perfilForumPublico(perfil) : null, erro: null } })
app.put('/api/forum/profile', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum)
  const body = z.object({ apelido: z.string().trim().min(3).max(30).regex(/^[\p{L}\p{N}_ .-]+$/u), mostrarArea: z.boolean(), mostrarMedalhas: z.boolean() }).safeParse(req.body)
  if (!body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escolha um apelido de 3 a 30 caracteres.', campos: { apelido: 'Use letras, números, espaços, ponto, hífen ou sublinhado.' } } })
  const atual = await perfilForumDoUsuario(user.id)
  if (atual?.nicknameChangedAt && atual.nickname !== body.data.apelido && Date.now() - atual.nicknameChangedAt.getTime() < 30 * 86400000) return reply.code(429).send({ dados: null, erro: { codigo: 'LIMITE_EXCEDIDO', mensagem: 'O apelido só pode ser alterado uma vez por mês.' } })
  const [emUso] = await db.select().from(forumProfiles).where(eq(forumProfiles.nickname, body.data.apelido)).limit(1)
  if (emUso && emUso.userId !== user.id) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Esse apelido já está em uso.', campos: { apelido: 'Escolha outro apelido.' } } })
  const mudou = !atual || atual.nickname !== body.data.apelido
  const valores = { nickname: body.data.apelido, showArea: body.data.mostrarArea, showBadges: body.data.mostrarMedalhas, nicknameChangedAt: mudou ? new Date() : atual.nicknameChangedAt }
  const [salvo] = atual ? await db.update(forumProfiles).set(valores).where(eq(forumProfiles.userId, user.id)).returning() : await db.insert(forumProfiles).values({ userId: user.id, ...valores }).returning()
  return { dados: perfilForumPublico(salvo), erro: null }
})
app.get('/api/forum/posts', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum)
  const q = req.query as { categoriaId?: string; areaId?: string; busca?: string; ordem?: string }; const condicoes = [eq(forumPosts.status, 'published')]
  if (q.categoriaId) condicoes.push(eq(forumPosts.categoryId, q.categoriaId)); if (q.areaId) condicoes.push(eq(forumPosts.areaId, q.areaId)); if (q.busca?.trim()) condicoes.push(sql`lower(${forumPosts.title}) like ${`%${q.busca.trim().toLowerCase()}%`}`)
  const linhas = await db.select({ post: forumPosts, categoria: forumCategories, perfil: forumProfiles, meuVoto: forumVotes.userId }).from(forumPosts).innerJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id)).innerJoin(forumProfiles, eq(forumPosts.authorId, forumProfiles.userId)).leftJoin(forumVotes, and(eq(forumVotes.targetId, forumPosts.id), eq(forumVotes.targetType, 'post'), eq(forumVotes.userId, user.id))).where(and(...condicoes)).orderBy(q.ordem === 'uteis' ? desc(forumPosts.helpfulCount) : q.ordem === 'sem_resposta' ? forumPosts.replyCount : desc(forumPosts.createdAt))
  return { dados: linhas.map(x => ({ id: x.post.id, titulo: x.post.title, texto: x.post.status === 'removed' ? '[removido pela autora]' : x.post.body, categoria: categoriaForumPublica(x.categoria), areaId: x.post.areaId, autora: { apelido: x.post.anonymous ? 'Participante anônima' : x.perfil.nickname, areaId: !x.post.anonymous && x.perfil.showArea ? x.post.areaId : null }, anonima: x.post.anonymous, criadoEm: x.post.createdAt.toISOString(), editadoEm: x.post.editedAt?.toISOString() ?? null, respostas: x.post.replyCount, uteis: x.post.helpfulCount, meuVoto: !!x.meuVoto, removido: x.post.status === 'removed' })), erro: null }
})
app.post('/api/forum/posts', { config: { rateLimit: { max: 5, timeWindow: '1 day' } } }, async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const bloqueio = await podePublicarNoForum(user); if (bloqueio) return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: bloqueio } })
  const body = z.object({ titulo: z.string(), texto: z.string(), categoriaId: z.string(), areaId: z.string().nullable().optional(), anonima: z.boolean().optional() }).safeParse(req.body); const campos: Record<string, string> = {}; if (!body.success) campos.geral = 'Confira os campos.'; else { validarTextoForum(body.data.titulo, 140, 'titulo', campos); if (body.data.titulo.trim().length < 5) campos.titulo = 'Use pelo menos 5 caracteres.'; validarTextoForum(body.data.texto, 5000, 'texto', campos) }
  const perfil = await perfilForumDoUsuario(user.id); if (!perfil) campos.apelido = 'Defina seu nome de usuário no Perfil antes de publicar.'; const categoria = body.success ? (await db.select().from(forumCategories).where(eq(forumCategories.id, body.data.categoriaId)).limit(1))[0] : null; if (!categoria) campos.categoriaId = 'Escolha uma categoria.'; if (body.success && body.data.areaId && !areasPublicas.some(a => a.id === body.data.areaId)) campos.areaId = 'Escolha uma área válida.'
  if (Object.keys(campos).length || !body.success || !categoria || !perfil) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Confira os campos destacados.', campos } })
  const dadosPost = body.data
  const [post] = await db.insert(forumPosts).values({ authorId: user.id, categoryId: categoria.id, areaId: dadosPost.areaId ?? null, title: dadosPost.titulo.trim(), body: dadosPost.texto.trim(), anonymous: dadosPost.anonima ?? false }).returning()
  return { dados: { id: post!.id, titulo: post!.title, texto: post!.body, categoria: categoriaForumPublica(categoria), areaId: post!.areaId, autora: { apelido: post!.anonymous ? 'Participante anônima' : perfil.nickname, areaId: !post!.anonymous && perfil.showArea ? post!.areaId : null }, anonima: post!.anonymous, criadoEm: post!.createdAt.toISOString(), editadoEm: null, respostas: 0, uteis: 0, meuVoto: false, removido: false }, erro: null }
})
app.get('/api/forum/posts/:id', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const { id } = req.params as { id: string }
  const [linha] = await db.select({ post: forumPosts, categoria: forumCategories, perfil: forumProfiles, meuVoto: forumVotes.userId }).from(forumPosts).innerJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id)).innerJoin(forumProfiles, eq(forumPosts.authorId, forumProfiles.userId)).leftJoin(forumVotes, and(eq(forumVotes.targetId, forumPosts.id), eq(forumVotes.targetType, 'post'), eq(forumVotes.userId, user.id))).where(and(eq(forumPosts.id, id), sql`${forumPosts.status} in ('published', 'removed')`)).limit(1)
  if (!linha) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Publicação não encontrada.' } })
  const replies = await db.select({ resposta: forumReplies, perfil: forumProfiles, meuVoto: forumVotes.userId }).from(forumReplies).innerJoin(forumProfiles, eq(forumReplies.authorId, forumProfiles.userId)).leftJoin(forumVotes, and(eq(forumVotes.targetId, forumReplies.id), eq(forumVotes.targetType, 'resposta'), eq(forumVotes.userId, user.id))).where(and(eq(forumReplies.postId, id), sql`${forumReplies.status} in ('published', 'removed')`)).orderBy(forumReplies.helpful, desc(forumReplies.helpfulCount), forumReplies.createdAt)
  const [follow] = await db.select().from(forumFollows).where(and(eq(forumFollows.userId, user.id), eq(forumFollows.postId, id))).limit(1)
  return { dados: { id: linha.post.id, titulo: linha.post.title, texto: linha.post.status === 'removed' ? '[removido pela autora]' : linha.post.body, categoria: categoriaForumPublica(linha.categoria), areaId: linha.post.areaId, autora: { apelido: linha.post.anonymous ? 'Participante anônima' : linha.perfil.nickname, areaId: !linha.post.anonymous && linha.perfil.showArea ? linha.post.areaId : null }, anonima: linha.post.anonymous, criadoEm: linha.post.createdAt.toISOString(), editadoEm: linha.post.editedAt?.toISOString() ?? null, respostas: linha.post.replyCount, uteis: linha.post.helpfulCount, meuVoto: !!linha.meuVoto, removido: linha.post.status === 'removed', seguindo: !!follow, respostasArvore: replies.map(x => ({ id: x.resposta.id, postId: x.resposta.postId, paiId: x.resposta.parentId, texto: x.resposta.status === 'removed' ? '[removido pela autora]' : x.resposta.body, autora: { apelido: linha.post.anonymous && x.resposta.authorId === linha.post.authorId ? 'Participante anônima' : x.perfil.nickname, areaId: null }, criadoEm: x.resposta.createdAt.toISOString(), uteis: x.resposta.helpfulCount, meuVoto: !!x.meuVoto, ajudou: x.resposta.helpful, removida: x.resposta.status === 'removed' })) }, erro: null }
})
app.post('/api/forum/posts/:id/replies', { config: { rateLimit: { max: 30, timeWindow: '1 day' } } }, async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const bloqueio = await podePublicarNoForum(user); if (bloqueio) return reply.code(403).send({ dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: bloqueio } }); const { id } = req.params as { id: string }; const body = z.object({ texto: z.string(), paiId: z.string().uuid().nullable().optional() }).safeParse(req.body); const campos: Record<string, string> = {}; if (!body.success) campos.texto = 'Escreva sua resposta.'; else validarTextoForum(body.data.texto, 2000, 'texto', campos)
  const [post] = await db.select().from(forumPosts).where(and(eq(forumPosts.id, id), eq(forumPosts.status, 'published'))).limit(1); const perfil = await perfilForumDoUsuario(user.id); if (!post) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Publicação não encontrada.' } }); if (!perfil) campos.apelido = 'Defina seu nome de usuário no Perfil antes de responder.'
  if (body.success && body.data.paiId) { const [pai] = await db.select().from(forumReplies).where(and(eq(forumReplies.id, body.data.paiId), eq(forumReplies.postId, id))).limit(1); if (!pai) campos.paiId = 'Resposta de origem inválida.' }
  if (Object.keys(campos).length || !body.success || !perfil) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Confira os campos destacados.', campos } }); const dadosResposta = body.data; const [nova] = await db.insert(forumReplies).values({ postId: id, parentId: dadosResposta.paiId ?? null, authorId: user.id, body: dadosResposta.texto.trim() }).returning(); await db.update(forumPosts).set({ replyCount: sql`${forumPosts.replyCount} + 1` }).where(eq(forumPosts.id, id)); return { dados: { id: nova!.id, postId: id, paiId: nova!.parentId, texto: nova!.body, autora: { apelido: perfil.nickname, areaId: null }, criadoEm: nova!.createdAt.toISOString(), uteis: 0, meuVoto: false, ajudou: false, removida: false }, erro: null }
})
app.post('/api/forum/:alvo/:id/vote', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const { alvo, id } = req.params as { alvo: string; id: string }; if (alvo !== 'posts' && alvo !== 'respostas') return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } }); const tipo = alvo === 'posts' ? 'post' : 'resposta'; const tabela = tipo === 'post' ? forumPosts : forumReplies; const [item] = await db.select().from(tabela).where(eq(tabela.id, id)).limit(1); if (!item) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } }); const [voto] = await db.select().from(forumVotes).where(and(eq(forumVotes.userId, user.id), eq(forumVotes.targetType, tipo), eq(forumVotes.targetId, id))).limit(1); if (voto) { await db.delete(forumVotes).where(and(eq(forumVotes.userId, user.id), eq(forumVotes.targetType, tipo), eq(forumVotes.targetId, id))); await db.update(tabela).set({ helpfulCount: sql`greatest(0, ${tabela.helpfulCount} - 1)` }).where(eq(tabela.id, id)); return { dados: { uteis: Math.max(0, item.helpfulCount - 1), meuVoto: false }, erro: null } }; await db.insert(forumVotes).values({ userId: user.id, targetType: tipo, targetId: id }); await db.update(tabela).set({ helpfulCount: sql`${tabela.helpfulCount} + 1` }).where(eq(tabela.id, id)); return { dados: { uteis: item.helpfulCount + 1, meuVoto: true }, erro: null }
})
app.post('/api/forum/:alvo/:id/report', async (req, reply) => {
  const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const { alvo, id } = req.params as { alvo: string; id: string }; const tipo = alvo === 'posts' ? 'post' : alvo === 'respostas' ? 'resposta' : null; const body = z.object({ motivo: z.enum(['assedio', 'spam_golpe', 'dado_pessoal', 'gabarito_case', 'investimento', 'outro']), detalhe: z.string().max(1000).optional() }).safeParse(req.body); if (!tipo || !body.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escolha o motivo da denúncia.' } }); await db.insert(forumReports).values({ reporterId: user.id, targetType: tipo, targetId: id, reason: body.data.motivo, detail: body.data.detalhe?.trim() || null }); return { dados: true, erro: null }
})
app.post('/api/forum/posts/:id/follow', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send(erroLoginForum); const { id } = req.params as { id: string }; const [atual] = await db.select().from(forumFollows).where(and(eq(forumFollows.userId, user.id), eq(forumFollows.postId, id))).limit(1); if (atual) { await db.delete(forumFollows).where(and(eq(forumFollows.userId, user.id), eq(forumFollows.postId, id))); return { dados: false, erro: null } }; await db.insert(forumFollows).values({ userId: user.id, postId: id }); return { dados: true, erro: null } })
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
app.get('/api/certificates/:id/linkedin', async (req, reply) => { const user = await usuarioAtual(req); if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); const { id } = req.params as { id: string }; const [c] = await db.select().from(certificates).where(and(eq(certificates.id, id), eq(certificates.userId, user.id))); if (!c) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Certificado não encontrado.' } }); const [k] = await db.select().from(cases).where(eq(cases.id, c.caseId)); const d = c.issuedAt; return { dados: { url: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(k.title)}&organizationName=Alumna&issueYear=${d.getUTCFullYear()}&issueMonth=${d.getUTCMonth() + 1}&certUrl=${encodeURIComponent(urlValidacao(c.code))}&certId=${encodeURIComponent(c.code)}` }, erro: null } })
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

type EstadoIlha = 'bloqueado' | 'disponivel' | 'em_andamento' | 'em_avaliacao' | 'concluido'
type SituacaoIlha = { caso: typeof cases.$inferSelect; estado: EstadoIlha; motivoBloqueio: string | null; refazer: boolean; enrollment: typeof enrollments.$inferSelect | undefined }

/**
 * Cada área é uma ilha, e os cases da área seguem a ordem de `island_order`: o primeiro é o case básico,
 * e os seguintes só abrem quando todos os anteriores da mesma área têm certificado.
 * As áreas são independentes entre si. Quem já começou um case mantém o acesso a ele.
 */
async function situacaoDasIlhas(userId: string): Promise<{ diagnosticoConcluido: boolean; ilhas: SituacaoIlha[] }> {
  const rows = (await db.select().from(cases).where(eq(cases.status, 'publicado'))).sort((a, b) => a.islandOrder - b.islandOrder || a.id.localeCompare(b.id))
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, userId), eq(assessments.status, 'concluido'))).limit(1)
  const certs = await db.select().from(certificates).where(eq(certificates.userId, userId))
  const matriculas = await db.select().from(enrollments).where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.attempt))
  const entregas = matriculas.length ? await db.select().from(deliveries).where(inArray(deliveries.enrollmentId, matriculas.map(m => m.id))) : []
  const diagnosticoConcluido = !!assessment
  const ilhas: SituacaoIlha[] = []
  for (const caso of rows) {
    const enrollment = matriculas.find(m => m.caseId === caso.id)
    const entrega = enrollment ? entregas.find(e => e.enrollmentId === enrollment.id) : undefined
    const base = { caso, enrollment, refazer: false, motivoBloqueio: null }
    if (certs.some(c => c.caseId === caso.id)) { ilhas.push({ ...base, estado: 'concluido' }); continue }
    if (enrollment?.status === 'em_andamento') { ilhas.push({ ...base, estado: 'em_andamento' }); continue }
    if (enrollment && entrega?.publishedAt) { ilhas.push({ ...base, estado: 'disponivel', refazer: true }); continue }
    if (enrollment) { ilhas.push({ ...base, estado: 'em_avaliacao' }); continue }
    const anterior = ilhas.find(i => i.caso.areaId === caso.areaId && i.estado !== 'concluido')
    if (!diagnosticoConcluido) ilhas.push({ ...base, estado: 'bloqueado', motivoBloqueio: 'Conclua o diagnóstico primeiro.' })
    else if (anterior) ilhas.push({ ...base, estado: 'bloqueado', motivoBloqueio: `Conclua o case "${anterior.caso.title}" primeiro.` })
    else ilhas.push({ ...base, estado: 'disponivel' })
  }
  return { diagnosticoConcluido, ilhas }
}

app.get('/api/cases', async (_req, reply) => {
  const rows = (await db.select().from(cases).where(eq(cases.status, 'publicado'))).sort((a, b) => a.islandOrder - b.islandOrder || a.id.localeCompare(b.id))
  return reply.send({ dados: rows.map(c => ({ id: c.id, titulo: c.title, areaId: c.areaId, area: nomeDaArea(c.areaId), resumo: c.summary, missao: c.mission, ordem: c.islandOrder })), erro: null })
})

app.get('/api/trail', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { diagnosticoConcluido, ilhas } = await situacaoDasIlhas(user.id)
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), eq(assessments.status, 'concluido'))).orderBy(desc(assessments.createdAt)).limit(1)
  const ranking = ((assessment?.result as { areas?: Array<{ areaId: string; posicao: number }> } | null)?.areas) ?? []
  const todosCps = await db.select().from(checkpoints)
  const progresso = await db.select().from(checkpointProgress)
  const posicaoDaArea = (areaId: string) => ranking.find(a => a.areaId === areaId)?.posicao ?? 999
  // “Comece por aqui”: o case aberto da área que melhor combina com ela (ou o que ela já começou).
  const proxima = [...ilhas].filter(i => i.estado === 'em_andamento' || i.estado === 'disponivel')
    .sort((a, b) => Number(b.estado === 'em_andamento') - Number(a.estado === 'em_andamento') || posicaoDaArea(a.caso.areaId) - posicaoDaArea(b.caso.areaId) || a.caso.islandOrder - b.caso.islandOrder)[0]
  const motivo = !diagnosticoConcluido ? 'Conclua o diagnóstico primeiro.' : !ilhas.some(i => i.estado === 'disponivel') ? 'Nenhum case disponível para você agora.' : null
  return {
    dados: {
      diagnosticoConcluido, primeiroCaseConcluido: ilhas.some(i => i.estado === 'concluido'),
      podeEscolher: !motivo, motivoNaoPodeEscolher: motivo,
      proximoCaseId: proxima?.caso.id ?? null,
      cases: ilhas.map(i => {
        const daArea = ilhas.filter(x => x.caso.areaId === i.caso.areaId)
        const posicaoNaArea = daArea.indexOf(i) + 1
        const total = todosCps.filter(c => c.caseId === i.caso.id).length
        const feitos = i.estado === 'concluido' || i.estado === 'em_avaliacao' ? total : i.enrollment && i.estado === 'em_andamento' ? progresso.filter(p => p.enrollmentId === i.enrollment!.id && p.completedAt).length : 0
        const posicao = ranking.find(a => a.areaId === i.caso.areaId)?.posicao ?? null
        return { caseId: i.caso.id, titulo: i.caso.title, areaId: i.caso.areaId, area: nomeDaArea(i.caso.areaId), resumo: i.caso.summary, ordem: posicaoNaArea, nivel: posicaoNaArea === 1 ? 'basico' : 'avancado', estado: i.estado, posicaoNoFit: posicao, noTop3: posicao !== null && posicao <= 3, sugerido: i.caso.id === proxima?.caso.id && i.estado === 'disponivel', motivoBloqueio: i.motivoBloqueio, progresso: { concluidos: feitos, total }, certificadoId: null, refazer: i.refazer }
      }),
    },
    erro: null,
  }
})

/** O treino de entrevista de uma ilha abre com o certificado do case básico (o primeiro por `island_order`) da área. */
async function treinoLiberado(userId: string, areaId: string): Promise<{ liberado: boolean; motivoBloqueio: string | null }> {
  const daArea = (await db.select().from(cases).where(and(eq(cases.areaId, areaId), eq(cases.status, 'publicado')))).sort((a, b) => a.islandOrder - b.islandOrder || a.id.localeCompare(b.id))
  if (!daArea.length) return { liberado: false, motivoBloqueio: 'Esta ilha ainda não tem case básico.' }
  const [cert] = await db.select().from(certificates).where(and(eq(certificates.userId, userId), eq(certificates.caseId, daArea[0].id))).limit(1)
  return cert ? { liberado: true, motivoBloqueio: null } : { liberado: false, motivoBloqueio: 'Abre depois que você concluir o case básico desta ilha.' }
}
const NIVEIS_TREINO = ['facil', 'medio', 'dificil'] as const
/** Quantas perguntas da área ela já respondeu no treino (todas as tentativas) e quantas acertou. */
async function desempenhoNoTreino(userId: string, areaId: string) {
  const [linha] = await db.select({ respondidas: sql<number>`count(*)::int`, acertos: sql<number>`count(*) filter (where ${trainingAnswers.correct})::int` })
    .from(trainingAnswers).innerJoin(interviewQuestions, eq(interviewQuestions.id, trainingAnswers.questionId))
    .where(and(eq(trainingAnswers.userId, userId), eq(interviewQuestions.areaId, areaId)))
  return { respondidas: linha?.respondidas ?? 0, acertos: linha?.acertos ?? 0 }
}

app.get('/api/training/:areaId', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { areaId } = req.params as { areaId: string }
  const rows = await db.select({ level: interviewQuestions.level, topic: interviewQuestions.topic }).from(interviewQuestions).where(eq(interviewQuestions.areaId, areaId))
  const perguntasPorNivel = Object.fromEntries(NIVEIS_TREINO.map(n => [n, rows.filter(r => r.level === n).length]))
  return { dados: { areaId, ...(await treinoLiberado(user.id, areaId)), perguntasPorNivel, desempenho: await desempenhoNoTreino(user.id, areaId), temas: [...new Set(rows.flatMap(r => (r.topic ? [r.topic] : [])))] }, erro: null }
})

app.get('/api/training/:areaId/questions', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { areaId } = req.params as { areaId: string }
  const consulta = z.object({ nivel: z.enum(['facil', 'medio', 'dificil', 'misto']).default('misto'), quantidade: z.coerce.number().int().min(1).max(50).default(10), tema: z.string().max(60).optional() }).safeParse(req.query)
  if (!consulta.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escolha um nível e uma quantidade válidos.' } })
  const { liberado, motivoBloqueio } = await treinoLiberado(user.id, areaId)
  if (!liberado) return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: motivoBloqueio ?? 'O treino ainda não está liberado.' } })
  const { nivel, quantidade, tema } = consulta.data
  const filtros = [eq(interviewQuestions.areaId, areaId), ...(nivel === 'misto' ? [] : [eq(interviewQuestions.level, nivel)]), ...(tema ? [eq(interviewQuestions.topic, tema)] : [])]
  const rows = await db.select().from(interviewQuestions).where(and(...filtros)).orderBy(sql`random()`).limit(quantidade)
  if (!rows.length) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Ainda não há perguntas publicadas para esta escolha.' } })
  return { dados: rows.map(q => ({ id: q.id, areaId: q.areaId, nivel: q.level, tema: q.topic, enunciado: q.prompt, opcoes: q.options })), erro: null }
})

app.post('/api/training/questions/:id/answer', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { id } = req.params as { id: string }
  const corpo = z.object({ letra: z.enum(['A', 'B', 'C', 'D']).nullable() }).safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escolha uma alternativa.' } })
  const [q] = await db.select().from(interviewQuestions).where(eq(interviewQuestions.id, id)).limit(1)
  if (!q) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Pergunta não encontrada.' } })
  if (!(await treinoLiberado(user.id, q.areaId)).liberado) return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'O treino ainda não está liberado.' } })
  const correta = corpo.data.letra !== null && q.answer === corpo.data.letra
  await db.insert(trainingAnswers).values({ userId: user.id, questionId: q.id, correct: correta })
  return { dados: { correta, letraCerta: q.answer, feedback: q.feedback }, erro: null }
})

const SIMULACOES_POR_DIA = 5
const ConfigSimulacaoSchema = z.object({
  areaId: z.string().min(1).max(60),
  vaga: z.string().trim().max(600).optional(),
  rigor: z.enum(['acolhedor', 'equilibrado', 'exigente']),
  dificuldade: z.enum(['iniciante', 'intermediario', 'avancado']),
  perguntas: z.number().int().min(3).max(8),
})
const simulacoesDeHoje = async (userId: string) => (await db.select({ id: interviewSessions.id }).from(interviewSessions).where(and(eq(interviewSessions.userId, userId), sql`${interviewSessions.createdAt} > now() - interval '24 hours'`))).length

async function historicoDaSimulacao(userId: string, areaId: string) {
  const rows = await db.select().from(interviewSessions).where(and(eq(interviewSessions.userId, userId), eq(interviewSessions.areaId, areaId), eq(interviewSessions.status, 'concluida'))).orderBy(desc(interviewSessions.finishedAt)).limit(5)
  return rows.map(r => {
    const config = r.config as { rigor: string; dificuldade: string; perguntas: number }
    const notas = ((r.feedback as { criterios?: Array<{ nota: number }> } | null)?.criterios ?? []).map(c => c.nota)
    return { id: r.id, concluidaEm: (r.finishedAt ?? r.createdAt).toISOString(), rigor: config.rigor, dificuldade: config.dificuldade, perguntas: config.perguntas, notaMedia: notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null }
  })
}

app.get('/api/interview/:areaId', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { areaId } = req.params as { areaId: string }
  return { dados: { areaId, ...(await treinoLiberado(user.id, areaId)), disponivel: iaDisponivel(), demonstracao: false, perguntasReais: (await db.select({ id: interviewOpenQuestions.id }).from(interviewOpenQuestions).where(eq(interviewOpenQuestions.areaId, areaId)).limit(1)).length > 0, restantesHoje: Math.max(0, SIMULACOES_POR_DIA - (await simulacoesDeHoje(user.id))), historico: await historicoDaSimulacao(user.id, areaId) }, erro: null }
})

app.post('/api/interview/sessions', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const corpo = ConfigSimulacaoSchema.safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Revise as opções da simulação.' } })
  const { areaId, vaga, rigor, dificuldade, perguntas } = corpo.data
  const area = areasPublicas.find(a => a.id === areaId)
  if (!area) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Área não encontrada.' } })
  const { liberado, motivoBloqueio } = await treinoLiberado(user.id, areaId)
  if (!liberado) return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: motivoBloqueio ?? 'A simulação ainda não está liberada.' } })
  if (!iaDisponivel()) return reply.code(503).send({ dados: null, erro: { codigo: 'IA_INDISPONIVEL', mensagem: 'A simulação com IA não está disponível agora. Tente o treino de perguntas.' } })
  if ((await simulacoesDeHoje(user.id)) >= SIMULACOES_POR_DIA) return reply.code(429).send({ dados: null, erro: { codigo: 'LIMITE_EXCEDIDO', mensagem: `Você já fez ${SIMULACOES_POR_DIA} simulações nas últimas 24 horas. Volte mais tarde.` } })
  // Áreas com banco de perguntas reais: sorteia as perguntas; a IA só reage e avalia. As demais: a IA conduz a conversa.
  const banco = (await db.select().from(interviewOpenQuestions).where(eq(interviewOpenQuestions.areaId, areaId))).sort(() => Math.random() - 0.5).slice(0, perguntas)
  if (banco.length >= perguntas) {
    const config = { vaga: vaga || null, rigor, dificuldade, perguntas, banco: banco.map(q => q.id) }
    const [sessao] = await db.insert(interviewSessions).values({ userId: user.id, areaId, config, turns: [{ pergunta: banco[0].prompt, resposta: null, referencia: banco[0].goodAnswer }] }).returning()
    return { dados: { sessaoId: sessao.id, numero: 1, total: perguntas, pergunta: banco[0].prompt }, erro: null }
  }
  const config = { vaga: vaga || null, rigor, dificuldade, perguntas }
  const primeira = await proximaPergunta(area.nome, config, [])
  if (!primeira) return reply.code(502).send({ dados: null, erro: { codigo: 'IA_INDISPONIVEL', mensagem: 'A entrevistadora não respondeu agora. Tente de novo em instantes.' } })
  const [sessao] = await db.insert(interviewSessions).values({ userId: user.id, areaId, config, turns: [{ pergunta: primeira.proximaPergunta, resposta: null }] }).returning()
  return { dados: { sessaoId: sessao.id, numero: 1, total: perguntas, pergunta: primeira.proximaPergunta }, erro: null }
})

app.post('/api/interview/sessions/:id/answer', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { id } = req.params as { id: string }
  const corpo = z.object({ resposta: z.string().trim().max(2000).nullable() }).safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'A resposta pode ter até 2000 caracteres.' } })
  if (!z.string().uuid().safeParse(id).success) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Simulação não encontrada.' } })
  const [sessao] = await db.select().from(interviewSessions).where(and(eq(interviewSessions.id, id), eq(interviewSessions.userId, user.id))).limit(1)
  if (!sessao) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Simulação não encontrada.' } })
  if (sessao.status !== 'em_andamento') return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Esta simulação já terminou.' } })
  const config = sessao.config as { vaga: string | null; rigor: 'acolhedor' | 'equilibrado' | 'exigente'; dificuldade: 'iniciante' | 'intermediario' | 'avancado'; perguntas: number; banco?: string[] }
  const area = areasPublicas.find(a => a.id === sessao.areaId)
  const turnos: TurnoSalvo[] = sessao.turns.map(t => ({ ...t }))
  turnos[turnos.length - 1] = { ...turnos[turnos.length - 1], resposta: corpo.data.resposta || null }
  const indisponivel = () => reply.code(502).send({ dados: null, erro: { codigo: 'IA_INDISPONIVEL', mensagem: 'A entrevistadora não respondeu agora. Envie a resposta de novo.' } })
  if (turnos.length < config.perguntas && config.banco) {
    const reacao = await reagir(area?.nome ?? sessao.areaId, config, turnos)
    if (!reacao) return indisponivel()
    const [proximaDoBanco] = await db.select().from(interviewOpenQuestions).where(eq(interviewOpenQuestions.id, config.banco[turnos.length])).limit(1)
    if (!proximaDoBanco) return indisponivel()
    turnos[turnos.length - 1].reacao = reacao.reacao
    turnos.push({ pergunta: proximaDoBanco.prompt, resposta: null, referencia: proximaDoBanco.goodAnswer })
    await db.update(interviewSessions).set({ turns: turnos }).where(eq(interviewSessions.id, id))
    return { dados: { reacao: reacao.reacao, proximo: { numero: turnos.length, pergunta: proximaDoBanco.prompt }, feedbackFinal: null }, erro: null }
  }
  if (turnos.length < config.perguntas) {
    const proxima = await proximaPergunta(area?.nome ?? sessao.areaId, config, turnos)
    if (!proxima) return indisponivel()
    turnos[turnos.length - 1].reacao = proxima.reacao
    turnos.push({ pergunta: proxima.proximaPergunta, resposta: null })
    await db.update(interviewSessions).set({ turns: turnos }).where(eq(interviewSessions.id, id))
    return { dados: { reacao: proxima.reacao ?? '', proximo: { numero: turnos.length, pergunta: proxima.proximaPergunta }, feedbackFinal: null }, erro: null }
  }
  const feedback = await feedbackFinal(area?.nome ?? sessao.areaId, config, turnos)
  if (!feedback) return indisponivel()
  await db.update(interviewSessions).set({ turns: turnos, status: 'concluida', feedback, finishedAt: new Date() }).where(eq(interviewSessions.id, id))
  return { dados: { reacao: '', proximo: null, feedbackFinal: feedback }, erro: null }
})

// --- Vagas ---------------------------------------------------------------------------------------------------------

const vagaPublica = (j: typeof jobs.$inferSelect) => ({ id: j.id, areaId: j.areaId, empresa: j.company, titulo: j.title, local: j.location, tipo: j.kind, url: j.url, conferidaEm: j.checkedAt ? new Date(j.checkedAt).toISOString() : null })
const vagaAdmin = (j: typeof jobs.$inferSelect) => ({ ...vagaPublica(j), status: j.status, observacao: j.note })
const hojeISO = () => new Date().toISOString().slice(0, 10)
const SEM_PERMISSAO = { dados: null, erro: { codigo: 'SEM_PERMISSAO', mensagem: 'Só a equipe pode fazer isso.' } }
const apenasHttps = z.string().trim().url().max(500).refine(u => u.startsWith('https://'), 'O link precisa começar com https://')
const VagaSchema = z.object({
  areaId: z.string().min(1).max(60), empresa: z.string().trim().min(1).max(120), titulo: z.string().trim().min(1).max(200), local: z.string().trim().min(1).max(120),
  tipo: z.enum(['estagio', 'junior', 'outro']), url: apenasHttps, observacao: z.string().trim().max(400).nullable().optional(),
})

app.get('/api/jobs', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { areaId } = req.query as { areaId?: string }
  const rows = await db.select().from(jobs).where(areaId ? and(eq(jobs.status, 'aberta'), eq(jobs.areaId, areaId)) : eq(jobs.status, 'aberta')).orderBy(desc(jobs.checkedAt), jobs.company)
  return { dados: rows.map(vagaPublica), erro: null }
})

app.get('/api/admin/jobs', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  if (user.role !== 'equipe') return reply.code(403).send(SEM_PERMISSAO)
  return { dados: (await db.select().from(jobs).orderBy(jobs.areaId, jobs.company)).map(vagaAdmin), erro: null }
})

app.post('/api/admin/jobs', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  if (user.role !== 'equipe') return reply.code(403).send(SEM_PERMISSAO)
  const corpo = VagaSchema.extend({ id: z.string().max(80).optional() }).safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Revise os campos da vaga.', campos: Object.fromEntries(corpo.error.issues.map(i => [String(i.path[0] ?? 'geral'), i.message])) } })
  const v = corpo.data
  if (!areasPublicas.some(a => a.id === v.areaId)) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escolha uma área.', campos: { areaId: 'Escolha uma área.' } } })
  const campos = { areaId: v.areaId, company: v.empresa, title: v.titulo, location: v.local, kind: v.tipo, url: v.url, note: v.observacao ?? null }
  if (v.id) {
    const [atual] = await db.select().from(jobs).where(eq(jobs.id, v.id)).limit(1)
    if (!atual) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Vaga não encontrada.' } })
    // Mudou o link ou a vaga: precisa conferir de novo antes de aparecer para as participantes.
    const mudou = atual.url !== v.url || atual.title !== v.titulo || atual.company !== v.empresa
    const [novo] = await db.update(jobs).set({ ...campos, ...(mudou && atual.status === 'aberta' ? { status: 'rascunho' } : {}) }).where(eq(jobs.id, v.id)).returning()
    return { dados: vagaAdmin(novo), erro: null }
  }
  const [criada] = await db.insert(jobs).values({ id: `vaga-${randomUUID().slice(0, 8)}`, ...campos }).returning()
  return { dados: vagaAdmin(criada), erro: null }
})

for (const [acao, status] of [['publicar', 'aberta'], ['encerrar', 'encerrada']] as const) {
  app.post(`/api/admin/jobs/:id/${acao}`, async (req, reply) => {
    const user = await usuarioAtual(req)
    if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
    if (user.role !== 'equipe') return reply.code(403).send(SEM_PERMISSAO)
    const { id } = req.params as { id: string }
    const [novo] = await db.update(jobs).set(status === 'aberta' ? { status, checkedAt: hojeISO() } : { status }).where(eq(jobs.id, id)).returning()
    if (!novo) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Vaga não encontrada.' } })
    return { dados: vagaAdmin(novo), erro: null }
  })
}

app.delete('/api/admin/jobs/:id', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  if (user.role !== 'equipe') return reply.code(403).send(SEM_PERMISSAO)
  const { id } = req.params as { id: string }
  await db.delete(jobs).where(eq(jobs.id, id))
  return { dados: null, erro: null }
})

// --- Avaliação dos cases pela equipe --------------------------------------------------------------------------------

/** Só a equipe passa: responde 401/403 e devolve `null` quando não pode. */
async function usuarioEquipe(req: FastifyRequest, reply: { code: (n: number) => { send: (b: unknown) => unknown } }) {
  const user = await usuarioAtual(req)
  if (!user) { reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } }); return null }
  if (user.role !== 'equipe') { reply.code(403).send(SEM_PERMISSAO); return null }
  return user
}
const STATUS_ENTREGA = ['pendente', 'revisada', 'publicada'] as const

async function resumoDaEntrega(d: typeof deliveries.$inferSelect) {
  const [m] = await db.select().from(enrollments).where(eq(enrollments.id, d.enrollmentId)).limit(1)
  const [u] = m ? await db.select().from(users).where(eq(users.id, m.userId)).limit(1) : []
  const [c] = m ? await db.select().from(cases).where(eq(cases.id, m.caseId)).limit(1) : []
  return { m, u, c, resumo: { id: d.id, participanteNome: u?.name ?? '—', caseId: m?.caseId ?? '', caseTitulo: `${c?.title ?? '—'}${m && m.attempt > 1 ? ` (tentativa ${m.attempt})` : ''}`, enviadaEm: d.createdAt.toISOString(), status: d.publishedAt ? 'publicada' : d.reviewedAt ? 'revisada' : 'pendente', notaSugerida: null, notaFinal: d.grade ?? null, origem: 'manual' as const } }
}

async function detalheDaEntrega(d: typeof deliveries.$inferSelect) {
  const { m, resumo } = await resumoDaEntrega(d)
  const cps = m ? await db.select().from(checkpoints).where(eq(checkpoints.caseId, m.caseId)).orderBy(checkpoints.order) : []
  const ordem = new Map(cps.map((c, i) => [c.id, i]))
  const taskRows = m ? (await db.select().from(tasks).where(eq(tasks.caseId, m.caseId))).sort((a, b) => (ordem.get(a.checkpointId) ?? 0) - (ordem.get(b.checkpointId) ?? 0) || a.id.localeCompare(b.id)) : []
  const progresso = m ? await db.select().from(checkpointProgress).where(eq(checkpointProgress.enrollmentId, m.id)) : []
  const respostas = taskRows.filter(t => t.fields.length > 0).map(t => {
    const dadas = progresso.map(p => p.answers[t.id]).find(a => a) ?? {}
    const rotulos = Object.fromEntries((t.fields as Array<{ id: string; rotulo?: string }>).map(f => [f.id, f.rotulo ?? f.id]))
    return { tarefaId: t.id, titulo: t.title, respostas: dadas, rotulos, referencia: t.answerKey ? JSON.stringify(t.answerKey, null, 2) : null }
  })
  const sugestao = { itens: [], notaCodigo: 0, maxCodigo: 0, notaIA: null, maxIA: 0, notaSugerida: null, origem: 'manual', feedbackGeral: '', feedbackPorTarefa: [], pontosFortes: [], pontosAMelhorar: [], versaoPrompt: 'manual-v1' }
  const [revisor] = d.reviewedBy ? await db.select().from(users).where(eq(users.id, d.reviewedBy)).limit(1) : []
  return { ...resumo, respostas, gabarito: [], sugestao, feedbackFinal: d.feedback ?? null, aprovadaPor: revisor?.name ?? null, aprovadaEm: d.reviewedAt?.toISOString() ?? null }
}

app.get('/api/admin/deliveries', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { status } = req.query as { status?: string }
  const rows = await db.select().from(deliveries).orderBy(desc(deliveries.createdAt))
  const itens = await Promise.all(rows.map(async d => (await resumoDaEntrega(d)).resumo))
  return { dados: itens.filter(i => !status || (STATUS_ENTREGA as readonly string[]).includes(status) && i.status === status), erro: null }
})

app.get('/api/admin/deliveries/:id', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { id } = req.params as { id: string }
  const [d] = z.string().uuid().safeParse(id).success ? await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1) : []
  if (!d) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Entrega não encontrada.' } })
  return { dados: await detalheDaEntrega(d), erro: null }
})

app.put('/api/admin/deliveries/:id/grade', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { id } = req.params as { id: string }
  const corpo = z.object({ notaFinal: z.number().min(0).max(10), feedback: z.string().trim().max(4000) }).safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Revise a nota (0 a 10) e o feedback.', campos: { notaFinal: 'Digite a nota de 0 a 10.' } } })
  const [d] = z.string().uuid().safeParse(id).success ? await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1) : []
  if (!d) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Entrega não encontrada.' } })
  if (d.publishedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'O resultado já foi publicado. Mudanças só por pedido de revisão.' } })
  const [novo] = await db.update(deliveries).set({ grade: Math.round(corpo.data.notaFinal * 10) / 10, feedback: corpo.data.feedback }).where(eq(deliveries.id, id)).returning()
  return { dados: await detalheDaEntrega(novo), erro: null }
})

app.post('/api/admin/deliveries/:id/approve', async (req, reply) => {
  const equipe = await usuarioEquipe(req, reply)
  if (!equipe) return
  const { id } = req.params as { id: string }
  const [d] = z.string().uuid().safeParse(id).success ? await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1) : []
  if (!d) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Entrega não encontrada.' } })
  if (d.publishedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'O resultado já foi publicado.' } })
  if (d.grade === null) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Defina a nota final antes de aprovar.' } })
  const [novo] = await db.update(deliveries).set({ status: 'revisada', reviewedBy: equipe.id, reviewedAt: new Date() }).where(eq(deliveries.id, id)).returning()
  return { dados: await detalheDaEntrega(novo), erro: null }
})

/** Publica em lote as entregas aprovadas, com certificado e pontos. Recusa se ainda houver pendentes. */
app.post('/api/admin/deliveries/publish', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const todas = await db.select().from(deliveries).where(isNull(deliveries.publishedAt))
  const pendentes = todas.filter(d => !d.reviewedAt).length
  if (pendentes > 0) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: `Ainda há ${pendentes} ${pendentes === 1 ? 'entrega pendente' : 'entregas pendentes'}. Aprove todas antes de publicar.` } })
  let publicados = 0
  for (const d of todas) {
    const [publicada] = await db.update(deliveries).set({ status: 'publicada', publishedAt: new Date() }).where(eq(deliveries.id, d.id)).returning()
    const { m, u, c } = await resumoDaEntrega(publicada)
    if (m && u && c) await certificadoDaEntrega(u, c, publicada)
    publicados++
  }
  return { dados: { publicados }, erro: null }
})

app.get('/api/admin/reviews', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const rows = await db.select().from(reviewRequests).orderBy(desc(reviewRequests.createdAt))
  const dados = await Promise.all(rows.map(async r => {
    const [d] = await db.select().from(deliveries).where(eq(deliveries.id, r.deliveryId)).limit(1)
    const { resumo } = d ? await resumoDaEntrega(d) : { resumo: null }
    return { id: r.id, entregaId: r.deliveryId, tarefaId: r.taskId, participanteNome: resumo?.participanteNome ?? '—', caseTitulo: resumo?.caseTitulo ?? '—', motivo: r.reason, status: r.status === 'resolvido' ? 'resolvido' : 'aberto', criadoEm: r.createdAt.toISOString() }
  }))
  return { dados, erro: null }
})

app.post('/api/admin/reviews/:id/resolve', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { id } = req.params as { id: string }
  const corpo = z.object({ resposta: z.string().trim().min(1).max(2000), novaNota: z.number().min(0).max(10).optional() }).safeParse(req.body)
  if (!corpo.success) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Escreva a resposta para a participante (e, se houver, a nova nota de 0 a 10).' } })
  const [pedido] = z.string().uuid().safeParse(id).success ? await db.select().from(reviewRequests).where(eq(reviewRequests.id, id)).limit(1) : []
  if (!pedido) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Pedido não encontrado.' } })
  if (corpo.data.novaNota !== undefined) {
    const [d] = await db.update(deliveries).set({ grade: Math.round(corpo.data.novaNota * 10) / 10 }).where(eq(deliveries.id, pedido.deliveryId)).returning()
    const { m, u, c } = d ? await resumoDaEntrega(d) : { m: null, u: null, c: null }
    if (d?.publishedAt && m && u && c) await certificadoDaEntrega(u, c, d)
  }
  const [novo] = await db.update(reviewRequests).set({ status: 'resolvido', response: corpo.data.resposta, resolvedAt: new Date() }).where(eq(reviewRequests.id, id)).returning()
  const [d] = await db.select().from(deliveries).where(eq(deliveries.id, novo.deliveryId)).limit(1)
  const { resumo } = d ? await resumoDaEntrega(d) : { resumo: null }
  return { dados: { id: novo.id, entregaId: novo.deliveryId, tarefaId: novo.taskId, participanteNome: resumo?.participanteNome ?? '—', caseTitulo: resumo?.caseTitulo ?? '—', motivo: novo.reason, status: 'resolvido', criadoEm: novo.createdAt.toISOString() }, erro: null }
})

// --- Cases e conteúdos para a equipe -------------------------------------------------------------------------------

const STATUS_CASE_ADMIN = ['rascunho_ia', 'rascunho', 'revisado', 'publicado', 'arquivado']
const resumoDoCase = (c: typeof cases.$inferSelect) => ({ id: c.id, titulo: c.title, areaId: c.areaId, area: nomeDaArea(c.areaId), status: STATUS_CASE_ADMIN.includes(c.status) ? c.status : 'rascunho', geradoPorIA: false })

app.get('/api/admin/cases', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { status } = req.query as { status?: string }
  const rows = (await db.select().from(cases)).sort((a, b) => a.areaId.localeCompare(b.areaId) || a.islandOrder - b.islandOrder || a.id.localeCompare(b.id))
  return { dados: rows.map(resumoDoCase).filter(c => !status || c.status === status), erro: null }
})

for (const [acao, de, para] of [['archive', ['publicado'], 'arquivado'], ['publish', ['arquivado', 'revisado'], 'publicado']] as const) {
  app.post(`/api/admin/cases/:id/${acao}`, async (req, reply) => {
    if (!(await usuarioEquipe(req, reply))) return
    const { id } = req.params as { id: string }
    const [atual] = await db.select().from(cases).where(eq(cases.id, id)).limit(1)
    if (!atual) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Case não encontrado.' } })
    if (!(de as readonly string[]).includes(atual.status)) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: acao === 'archive' ? 'Só um case publicado pode ser arquivado.' : 'Só um case arquivado ou revisado pode ser publicado.' } })
    // Quem já começou o case mantém o progresso: arquivar só tira o case da oferta.
    const [novo] = await db.update(cases).set({ status: para }).where(eq(cases.id, id)).returning()
    return { dados: resumoDoCase(novo), erro: null }
  })
}

const conteudoAdmin = (c: typeof contents.$inferSelect) => ({ id: c.id, titulo: c.title, tipo: c.type, areaId: c.areaId, resumo: c.summary, corpo: c.body, url: c.url, minutos: c.minutes, caseIds: c.caseIds })
const ConteudoSchema = z.object({
  id: z.string().max(80).optional(), titulo: z.string().trim().min(3).max(160), tipo: z.enum(['artigo', 'video', 'glossario', 'link']), areaId: z.string().min(1).max(60),
  resumo: z.string().trim().max(400), corpo: z.string().max(20000).nullable().optional(), url: z.string().trim().max(500).nullable().optional(), minutos: z.number().int().min(1).max(600), caseIds: z.array(z.string().max(80)).max(50),
})

app.get('/api/admin/contents', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  return { dados: (await db.select().from(contents).orderBy(contents.areaId, contents.title)).map(conteudoAdmin), erro: null }
})

app.post('/api/admin/contents', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const corpo = ConteudoSchema.safeParse(req.body)
  const erros: Record<string, string> = {}
  if (!corpo.success) for (const i of corpo.error.issues) erros[String(i.path[0] ?? 'geral')] = i.path[0] === 'titulo' ? 'Informe o título.' : i.path[0] === 'minutos' ? 'Informe o tempo estimado em minutos.' : 'Revise este campo.'
  const c = corpo.success ? corpo.data : null
  if (c) {
    if (!areasPublicas.some(a => a.id === c.areaId)) erros.areaId = 'Escolha uma área.'
    if ((c.tipo === 'video' || c.tipo === 'link') && !/^https:\/\//.test(c.url ?? '')) erros.url = 'Informe um link que comece com https://.'
    if ((c.tipo === 'artigo' || c.tipo === 'glossario') && !(c.corpo ?? '').trim()) erros.corpo = 'Escreva o conteúdo.'
  }
  if (!c || Object.keys(erros).length) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Confira os campos destacados.', campos: erros } })
  const externo = c.tipo === 'video' || c.tipo === 'link'
  const existentes = c.caseIds.length ? await db.select({ id: cases.id }).from(cases).where(inArray(cases.id, c.caseIds)) : []
  const valores = { title: c.titulo, type: c.tipo, areaId: c.areaId, summary: c.resumo, body: externo ? null : c.corpo ?? null, url: externo ? c.url ?? null : null, minutes: c.minutos, caseIds: existentes.map(x => x.id) }
  if (c.id) {
    const [novo] = await db.update(contents).set(valores).where(eq(contents.id, c.id)).returning()
    if (!novo) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } })
    return { dados: conteudoAdmin(novo), erro: null }
  }
  const [criado] = await db.insert(contents).values({ id: `cont-${randomUUID().slice(0, 8)}`, ...valores }).returning()
  return { dados: conteudoAdmin(criado), erro: null }
})

app.delete('/api/admin/contents/:id', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  const { id } = req.params as { id: string }
  const apagados = await db.delete(contents).where(eq(contents.id, id)).returning({ id: contents.id })
  if (!apagados.length) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Conteúdo não encontrado.' } })
  await db.delete(contentCompletions).where(eq(contentCompletions.contentId, id))
  return { dados: true, erro: null }
})

// --- Revisão da IA ao fechar uma etapa -------------------------------------------------------------------------------

const REVISOES_POR_ETAPA_POR_DIA = 3
const REVISOES_POR_DIA = 40

/** Visão geral da IA sobre as respostas de uma etapa já concluída: rumo, o que viu de bom e de ruim. */
app.post('/api/checkpoints/:checkpointId/ai-review', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { checkpointId } = req.params as { checkpointId: string }
  const [cp] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  const [enrollment] = cp ? await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, cp.caseId), eq(enrollments.status, 'em_andamento'))).limit(1) : []
  if (!cp || !enrollment) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Etapa não encontrada.' } })
  const [progresso] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, cp.id))).limit(1)
  if (!progresso?.completedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua a etapa antes de ver a revisão da IA.' } })
  const doCheckpoint = (await db.select().from(tasks).where(eq(tasks.checkpointId, cp.id))).filter(t => t.fields.length > 0)
  // Etapas sem atividade (entenda, conteúdos) não têm o que revisar.
  if (!doCheckpoint.length) return { dados: null, erro: null }
  if (!iaDisponivel()) return reply.code(503).send({ dados: null, erro: { codigo: 'IA_INDISPONIVEL', mensagem: 'A revisão da IA não está disponível agora. Você pode avançar sem ela.' } })
  const respostas = Object.fromEntries(doCheckpoint.map(t => [t.id, progresso.answers[t.id] ?? {}]))
  if (!Object.values(respostas).some(r => Object.values(r).some(v => v !== null && v !== ''))) return { dados: null, erro: null }
  const ultimas = await db.select({ taskId: taskReviews.taskId }).from(taskReviews).where(and(eq(taskReviews.userId, user.id), sql`${taskReviews.createdAt} > now() - interval '24 hours'`))
  if (ultimas.filter(r => r.taskId === cp.id).length >= REVISOES_POR_ETAPA_POR_DIA || ultimas.length >= REVISOES_POR_DIA) return reply.code(429).send({ dados: null, erro: { codigo: 'LIMITE_EXCEDIDO', mensagem: 'O limite de revisões da IA de hoje acabou. Você pode avançar sem ela.' } })
  const revisao = await revisarEtapa(doCheckpoint.map(t => ({ id: t.id, titulo: t.title, prompt: t.prompt, fields: t.fields, answerKey: t.answerKey })), respostas as Record<string, Record<string, string | number | null>>)
  if (!revisao) return reply.code(502).send({ dados: null, erro: { codigo: 'IA_INDISPONIVEL', mensagem: 'A mentora não respondeu agora. Você pode avançar sem a revisão.' } })
  await db.insert(taskReviews).values({ userId: user.id, taskId: cp.id })
  return { dados: revisao, erro: null }
})

/** A equipe confere se a IA responde (modelo e chave certos) sem precisar ler os logs do servidor. */
app.get('/api/admin/ia/status', async (req, reply) => {
  if (!(await usuarioEquipe(req, reply))) return
  // ?modelo=... testa outro modelo com a mesma chave, sem trocar a variável do servidor.
  const { modelo } = req.query as { modelo?: string }
  return { dados: await diagnosticarIA(fetch, modelo && /^[\w./:-]{1,80}$/.test(modelo) ? modelo : undefined), erro: null }
})

app.post('/api/cases/:caseId/start', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const [assessment] = await db.select().from(assessments).where(and(eq(assessments.userId, user.id), eq(assessments.status, 'concluido'))).limit(1)
  if (!assessment) return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua o diagnóstico antes de começar um case.' } })
  const { caseId } = req.params as { caseId: string }
  const [caseRow] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.status, 'publicado'))).limit(1)
  if (!caseRow) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Case não encontrado.' } })
  const { ilhas } = await situacaoDasIlhas(user.id)
  const ilha = ilhas.find(i => i.caso.id === caseId)
  if (ilha?.estado === 'bloqueado') return reply.code(403).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: ilha.motivoBloqueio ?? 'Esta ilha ainda não está liberada.' } })
  if (ilha?.estado === 'concluido') return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Você já concluiu este case.' } })
  if (ilha?.estado === 'em_avaliacao') return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Este case está em avaliação.' } })
  const outra = ilhas.find(i => i.estado === 'em_andamento' && i.caso.id !== caseId && i.caso.areaId === caseRow.areaId)
  if (outra) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: `Termine o case em andamento antes de escolher outro: ${outra.caso.title}.` } })
  let enrollment = ilha?.estado === 'em_andamento' ? ilha.enrollment : undefined
  // Nova tentativa depois de uma avaliação sem aprovação.
  if (!enrollment) [enrollment] = await db.insert(enrollments).values({ userId: user.id, caseId, attempt: (ilha?.enrollment?.attempt ?? 0) + 1 }).returning()
  // Nova tentativa: o que vem antes da situação (entenda, conteúdos, treino) continua feito e as respostas
  // anteriores viram rascunho para ela melhorar em vez de recomeçar do zero. Situação e defesa voltam a fazer.
  if (ilha?.enrollment && enrollment.id !== ilha.enrollment.id) {
    const cpsDoCase = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId))
    const mantem = new Set(['entenda', 'conteudos', 'treino'])
    for (const p of await db.select().from(checkpointProgress).where(eq(checkpointProgress.enrollmentId, ilha.enrollment.id))) {
      const etapa = cpsDoCase.find(c => c.id === p.checkpointId)?.stage
      await db.insert(checkpointProgress).values({ enrollmentId: enrollment.id, checkpointId: p.checkpointId, answers: p.answers, completedAt: etapa && mantem.has(etapa) ? p.completedAt : null })
    }
  }
  const rows = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId)).orderBy(checkpoints.order)
  return { dados: { enrollmentId: enrollment.id, case: caseRow, checkpoints: rows.map((c, i) => ({ ...c, status: i === 0 ? 'a_fazer' : 'a_fazer' })) }, erro: null }
})

app.get('/api/cases/:caseId', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { caseId } = req.params as { caseId: string }
  const [caseRow] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.status, 'publicado'))).limit(1)
  if (!caseRow) return reply.code(404).send({ dados: null, erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Case não encontrado.' } })
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId))).orderBy(desc(enrollments.attempt)).limit(1)
  const cps = await db.select().from(checkpoints).where(eq(checkpoints.caseId, caseId)).orderBy(checkpoints.order)
  const { ilhas } = await situacaoDasIlhas(user.id)
  const ilha = ilhas.find(i => i.caso.id === caseId)
  const conteudoIds = (await db.select().from(contents)).filter(c => c.caseIds.includes(caseId)).map(c => c.id)
  if (!enrollment) return { dados: { id: caseRow.id, titulo: caseRow.title, areaId: caseRow.areaId, area: nomeDaArea(caseRow.areaId), resumo: caseRow.summary, missao: caseRow.mission, personagem: null, contexto: '', entenda: null, estado: ilha?.estado ?? 'disponivel', tentativa: 1, pontosPossiveis: 0, checkpoints: [], conteudoIds: [], proximaTarefaId: null }, erro: null }
  const progress = await db.select().from(checkpointProgress).where(eq(checkpointProgress.enrollmentId, enrollment.id))
  const checkpointsOut = cps.map(c => ({ id: c.id, ordem: c.order, etapa: c.stage, titulo: c.title, descricao: c.description, pontos: c.points, tarefaIds: c.taskIds, status: progress.find(p => p.checkpointId === c.id)?.completedAt ? 'concluido' : 'a_fazer' }))
  const tasksRows = await db.select().from(tasks).where(eq(tasks.caseId, caseId))
  const nextTask = tasksRows.find(t => !progress.find(p => p.checkpointId === t.checkpointId)?.completedAt)?.id ?? null
  // `content` ainda é um JSON técnico do case. Só deve virar `entenda` quando
  // tiver o formato editorial completo; um objeto vazio não pode quebrar a tela.
  const content = caseRow.content as { resumo?: unknown; links?: unknown; cards?: unknown; comoSeEntra?: unknown }
  const entenda = typeof content.resumo === 'string' && Array.isArray(content.links) && Array.isArray(content.cards) && content.comoSeEntra && typeof content.comoSeEntra === 'object' ? content : null
  return { dados: { id: caseRow.id, titulo: caseRow.title, areaId: caseRow.areaId, area: nomeDaArea(caseRow.areaId), resumo: caseRow.summary, missao: caseRow.mission, personagem: null, contexto: caseRow.context, entenda, estado: ilha?.estado ?? 'em_andamento', tentativa: enrollment.attempt, pontosPossiveis: cps.reduce((sum, c) => sum + c.points, 0), checkpoints: checkpointsOut, conteudoIds, proximaTarefaId: nextTask }, erro: null }
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
  if (cp.stage === 'conteudos') {
    const doCase = (await db.select().from(contents)).filter(c => c.caseIds.includes(cp.caseId))
    const feitos = await db.select().from(contentCompletions).where(eq(contentCompletions.userId, user.id))
    if (doCase.some(c => !feitos.some(f => f.contentId === c.id))) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Conclua todos os conteúdos do case para avançar.' } })
  }
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
  const [jaPago] = await db.select().from(pointEvents).where(and(eq(pointEvents.userId, user.id), sql`${pointEvents.actionKey} like ${`checkpoint:%:${cp.id}`}`)).limit(1)
  const [event] = jaPago ? [] : await db.insert(pointEvents).values({ userId: user.id, actionKey: `checkpoint:${enrollment.id}:${cp.id}`, action: 'Checkpoint concluído', origin: cp.title, points: cp.points }).onConflictDoNothing().returning()
  return { dados: { eventos: event ? [{ id: event.id, acao: event.action, origem: event.origin, data: event.createdAt.toISOString(), pontos: event.points }] : [] }, erro: null }
})

/** Reabre uma etapa antes do envio e também as seguintes, para manter a sequência do case. */
app.post('/api/checkpoints/:checkpointId/reopen', async (req, reply) => {
  const user = await usuarioAtual(req)
  if (!user) return reply.code(401).send({ dados: null, erro: { codigo: 'SEM_LOGIN', mensagem: 'Entre para continuar.' } })
  const { checkpointId } = req.params as { checkpointId: string }
  const [cp] = await db.select().from(checkpoints).where(eq(checkpoints.id, checkpointId)).limit(1)
  const [enrollment] = cp ? await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, cp.caseId), eq(enrollments.status, 'em_andamento'))).limit(1) : []
  if (!cp || !enrollment) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Só é possível refazer etapas de um case em andamento.' } })
  const cps = await db.select().from(checkpoints).where(eq(checkpoints.caseId, cp.caseId)).orderBy(checkpoints.order)
  const index = cps.findIndex(item => item.id === checkpointId)
  const [progress] = await db.select().from(checkpointProgress).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), eq(checkpointProgress.checkpointId, checkpointId))).limit(1)
  if (index < 0 || !progress?.completedAt) return reply.code(400).send({ dados: null, erro: { codigo: 'VALIDACAO', mensagem: 'Esta etapa ainda não foi concluída.' } })
  const idsParaReabrir = cps.slice(index).map(item => item.id)
  await db.update(checkpointProgress).set({ completedAt: null }).where(and(eq(checkpointProgress.enrollmentId, enrollment.id), inArray(checkpointProgress.checkpointId, idsParaReabrir)))
  return { dados: true, erro: null }
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
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.caseId, caseId))).orderBy(desc(enrollments.attempt)).limit(1)
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
