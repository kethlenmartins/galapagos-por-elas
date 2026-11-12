import { boolean, real, jsonb, pgEnum, pgTable, text, timestamp, date, uniqueIndex, uuid, integer } from 'drizzle-orm/pg-core'

export const role = pgEnum('role', ['participante', 'equipe'])
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), revokedAt: timestamp('revoked_at', { withTimezone: true }),
})
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), name: text('name').notNull(), email: text('email').notNull(), passwordHash: text('password_hash').notNull(),
  role: role('role').notNull().default('participante'), acceptedTermsAt: timestamp('accepted_terms_at', { withTimezone: true }).notNull(), termsVersion: text('terms_version').notNull(),
  socialName: text('social_name'), birthDate: timestamp('birth_date', { withTimezone: true }), city: text('city'), state: text('state'), education: text('education'), objective: text('objective'), emailPreferences: jsonb('email_preferences').$type<{ novosCases: boolean; lembretesPrazo: boolean; novosConteudos: boolean }>().notNull().default({ novosCases: true, lembretesPrazo: true, novosConteudos: false }), profileCompletedAt: timestamp('profile_completed_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('users_email_unique').on(t.email)])
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), status: text('status').notNull(), answers: jsonb('answers').$type<Record<string, 'A'|'B'|'C'>>().notNull().default({}), versions: jsonb('versions').$type<Record<string,string>>().notNull(), result: jsonb('result'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const cases = pgTable('cases', {
  id: text('id').primaryKey(), title: text('title').notNull(), areaId: text('area_id').notNull(), summary: text('summary').notNull(), mission: text('mission').notNull(), context: text('context').notNull().default(''), content: jsonb('content').$type<Record<string,unknown>>().notNull().default({}), status: text('status').notNull().default('publicado'), islandOrder: integer('island_order').notNull().default(100),
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
  id: uuid('id').defaultRandom().primaryKey(), enrollmentId: uuid('enrollment_id').notNull(), status: text('status').notNull().default('pendente'), grade: real('grade'), feedback: text('feedback'), publishedAt: timestamp('published_at', { withTimezone: true }), reviewedBy: uuid('reviewed_by'), reviewedAt: timestamp('reviewed_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('deliveries_enrollment_unique').on(t.enrollmentId)])
export const pointEvents = pgTable('point_events', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), actionKey: text('action_key').notNull(), action: text('action').notNull(), origin: text('origin').notNull(), points: integer('points').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('point_events_idempotent').on(t.userId, t.actionKey)])
export const contents = pgTable('contents', {
  id: text('id').primaryKey(), title: text('title').notNull(), type: text('type').notNull(), areaId: text('area_id').notNull(), summary: text('summary').notNull(), body: text('body'), url: text('url'), minutes: integer('minutes').notNull(), caseIds: jsonb('case_ids').$type<string[]>().notNull().default([]),
})
export const contentCompletions = pgTable('content_completions', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), contentId: text('content_id').notNull(), completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('content_completion_unique').on(t.userId, t.contentId)])
export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), caseId: text('case_id').notNull(), code: text('code').notNull(), issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
}, t => [uniqueIndex('certificate_user_case_unique').on(t.userId, t.caseId), uniqueIndex('certificate_code_unique').on(t.code)])
export const reviewRequests = pgTable('review_requests', {
  id: uuid('id').defaultRandom().primaryKey(), deliveryId: uuid('delivery_id').notNull(), taskId: text('task_id').notNull(), userId: uuid('user_id').notNull(), reason: text('reason').notNull(), status: text('status').notNull().default('aberto'), response: text('response'), resolvedAt: timestamp('resolved_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const aiLogs = pgTable('ai_logs', {
  id: uuid('id').defaultRandom().primaryKey(), deliveryId: uuid('delivery_id').notNull(), provider: text('provider').notNull(), model: text('model').notNull(), promptVersion: text('prompt_version').notNull(), status: text('status').notNull(), latencyMs: integer('latency_ms').notNull(), costTicks: text('cost_ticks'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const interviewQuestions = pgTable('interview_questions', {
  id: text('id').primaryKey(), areaId: text('area_id').notNull(), level: text('level').notNull(), topic: text('topic'), position: integer('position').notNull(), prompt: text('prompt').notNull(), options: jsonb('options').$type<Array<{ letra: string; texto: string }>>().notNull(), answer: text('answer').notNull(), feedback: text('feedback').notNull(),
})
export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), areaId: text('area_id').notNull(), config: jsonb('config').$type<Record<string, unknown>>().notNull(), turns: jsonb('turns').$type<Array<{ pergunta: string; resposta: string | null; reacao?: string; referencia?: string }>>().notNull().default([]), status: text('status').notNull().default('em_andamento'), feedback: jsonb('feedback').$type<Record<string, unknown> | null>(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), finishedAt: timestamp('finished_at', { withTimezone: true }),
})
export const trainingAnswers = pgTable('training_answers', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), questionId: text('question_id').notNull(), correct: boolean('correct').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(), areaId: text('area_id').notNull(), company: text('company').notNull(), title: text('title').notNull(), location: text('location').notNull(), kind: text('kind').notNull().default('outro'), url: text('url').notNull(), status: text('status').notNull().default('rascunho'), checkedAt: date('checked_at'), note: text('note'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const interviewOpenQuestions = pgTable('interview_open_questions', {
  id: text('id').primaryKey(), areaId: text('area_id').notNull(), position: integer('position').notNull(), prompt: text('prompt').notNull(), goodAnswer: text('good_answer').notNull(),
})
export const taskReviews = pgTable('task_reviews', {
  id: uuid('id').defaultRandom().primaryKey(), userId: uuid('user_id').notNull(), taskId: text('task_id').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export const forumProfiles = pgTable('forum_profiles', { userId: uuid('user_id').primaryKey(), nickname: text('nickname').notNull(), showArea: boolean('show_area').notNull().default(false), showBadges: boolean('show_badges').notNull().default(false), nicknameChangedAt: timestamp('nickname_changed_at', { withTimezone: true }) })
export const forumCategories = pgTable('forum_categories', { id: text('id').primaryKey(), name: text('name').notNull(), description: text('description').notNull(), position: integer('position').notNull() })
export const forumPosts = pgTable('forum_posts', { id: uuid('id').defaultRandom().primaryKey(), authorId: uuid('author_id').notNull(), categoryId: text('category_id').notNull(), areaId: text('area_id'), title: text('title').notNull(), body: text('body').notNull(), anonymous: boolean('anonymous').notNull().default(false), official: boolean('official').notNull().default(false), status: text('status').notNull().default('published'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), editedAt: timestamp('edited_at', { withTimezone: true }), helpfulCount: integer('helpful_count').notNull().default(0), replyCount: integer('reply_count').notNull().default(0) })
export const forumReplies = pgTable('forum_replies', { id: uuid('id').defaultRandom().primaryKey(), postId: uuid('post_id').notNull(), parentId: uuid('parent_id'), authorId: uuid('author_id').notNull(), body: text('body').notNull(), status: text('status').notNull().default('published'), helpful: boolean('helpful').notNull().default(false), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), editedAt: timestamp('edited_at', { withTimezone: true }), helpfulCount: integer('helpful_count').notNull().default(0) })
export const forumVotes = pgTable('forum_votes', { userId: uuid('user_id').notNull(), targetType: text('target_type').notNull(), targetId: uuid('target_id').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() })
export const forumFollows = pgTable('forum_follows', { userId: uuid('user_id').notNull(), postId: uuid('post_id').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() })
export const forumSavedPosts = pgTable('forum_saved_posts', { userId: uuid('user_id').notNull(), postId: uuid('post_id').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() })
export const forumReports = pgTable('forum_reports', { id: uuid('id').defaultRandom().primaryKey(), reporterId: uuid('reporter_id').notNull(), targetType: text('target_type').notNull(), targetId: uuid('target_id').notNull(), reason: text('reason').notNull(), detail: text('detail'), status: text('status').notNull().default('open'), handledBy: uuid('handled_by'), handledAt: timestamp('handled_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull() })
