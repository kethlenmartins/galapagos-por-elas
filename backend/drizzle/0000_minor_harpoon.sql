CREATE TYPE "public"."role" AS ENUM('participante', 'equipe');--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"versions" jsonb NOT NULL,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"area_id" text NOT NULL,
	"summary" text NOT NULL,
	"mission" text NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'publicado' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkpoint_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"checkpoint_id" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "checkpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"order" integer NOT NULL,
	"stage" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"points" integer NOT NULL,
	"task_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"grade" integer,
	"feedback" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"case_id" text NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'em_andamento' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deadline" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_key" text NOT NULL,
	"action" text NOT NULL,
	"origin" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"checkpoint_id" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"fields" jsonb NOT NULL,
	"support_data" jsonb,
	"answer_key" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'participante' NOT NULL,
	"accepted_terms_at" timestamp with time zone NOT NULL,
	"terms_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "checkpoint_progress_unique" ON "checkpoint_progress" USING btree ("enrollment_id","checkpoint_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deliveries_enrollment_unique" ON "deliveries" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_user_case_attempt" ON "enrollments" USING btree ("user_id","case_id","attempt");--> statement-breakpoint
CREATE UNIQUE INDEX "point_events_idempotent" ON "point_events" USING btree ("user_id","action_key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");