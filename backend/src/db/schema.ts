import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, integer } from 'drizzle-orm/pg-core'

export const role = pgEnum('role', ['participante', 'equipe'])
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), revokedAt: timestamp('revoked_at', { withTimezone: true }),
})
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), name: text('name').notNull(), email: text('email').notNull(), passwordHash: text('password_hash').notNull(),
  role: role('role').notNull().default('participante'), acceptedTermsAt: timestamp('accepted_terms_at', { withTimezone: true }).notNull(), termsVersion: text('terms_version').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('users_email_unique').on(t.email)])
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), status: text('status').notNull(), answers: jsonb('answers').$type<Record<string, 'A'|'B'|'C'>>().notNull().default({}), versions: jsonb('versions').$type<Record<string,string>>().notNull(), result: jsonb('result'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const cases = pgTable('cases', {
  id: text('id').primaryKey(), title: text('title').notNull(), areaId: text('area_id').notNull(), summary: text('summary').notNull(), mission: text('mission').notNull(), context: text('context').notNull().default(''), content: jsonb('content').$type<Record<string,unknown>>().notNull().default({}), status: text('status').notNull().default('publicado'),
})
export const checkpoints = pgTable('checkpoints', {
  id: text('id').primaryKey(), caseId: text('case_id').notNull(), order: integer('order').notNull(), stage: text('stage').notNull(), title: text('title').notNull(), description: text('description').notNull(), points: integer('points').notNull(), taskIds: jsonb('task_ids').$type<string[]>().notNull().default([]),
})
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(), caseId: text('case_id').notNull(), checkpointId: text('checkpoint_id').notNull(), title: text('title').notNull(), prompt: text('prompt').notNull(), fields: jsonb('fields').$type<unknown[]>().notNull(), supportData: jsonb('support_data'), answerKey: jsonb('answer_key'),
})
export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), caseId: text('case_id').notNull(), attempt: integer('attempt').notNull().default(1), status: text('status').notNull().default('em_andamento'), startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(), deadline: timestamp('deadline', { withTimezone: true }),
}, t => [uniqueIndex('enrollment_user_case_attempt').on(t.userId, t.caseId, t.attempt)])
export const checkpointProgress = pgTable('checkpoint_progress', {
  id: uuid('id').defaultRandom().primaryKey(), enrollmentId: uuid('enrollment_id').notNull(), checkpointId: text('checkpoint_id').notNull(), answers: jsonb('answers').$type<Record<string,Record<string,string|number|null>>>().notNull().default({}), completedAt: timestamp('completed_at', { withTimezone: true }),
}, t => [uniqueIndex('checkpoint_progress_unique').on(t.enrollmentId, t.checkpointId)])
export const deliveries = pgTable('deliveries', {
  id: uuid('id').defaultRandom().primaryKey(), enrollmentId: uuid('enrollment_id').notNull(), status: text('status').notNull().default('pendente'), grade: integer('grade'), feedback: text('feedback'), publishedAt: timestamp('published_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('deliveries_enrollment_unique').on(t.enrollmentId)])
export const pointEvents = pgTable('point_events', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), actionKey: text('action_key').notNull(), action: text('action').notNull(), origin: text('origin').notNull(), points: integer('points').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('point_events_idempotent').on(t.userId, t.actionKey)])
