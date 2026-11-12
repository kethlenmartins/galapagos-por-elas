CREATE TABLE IF NOT EXISTS training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id text NOT NULL,
  correct boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS training_answers_user ON training_answers (user_id, created_at);
