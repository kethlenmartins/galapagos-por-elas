CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"case_id" text NOT NULL,
	"code" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"area_id" text NOT NULL,
	"summary" text NOT NULL,
	"body" text,
	"url" text,
	"minutes" integer NOT NULL,
	"case_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"task_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'aberto' NOT NULL,
	"response" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "objective" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_preferences" jsonb DEFAULT '{"novosCases":true,"lembretesPrazo":true,"novosConteudos":false}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_user_case_unique" ON "certificates" USING btree ("user_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_code_unique" ON "certificates" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "content_completion_unique" ON "content_completions" USING btree ("user_id","content_id");