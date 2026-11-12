CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area_id text NOT NULL,
  config jsonb NOT NULL,
  turns jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'em_andamento',
  feedback jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone
);
CREATE INDEX IF NOT EXISTS interview_sessions_user_day ON interview_sessions (user_id, created_at);
