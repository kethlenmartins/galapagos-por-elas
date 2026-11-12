-- Revisões formativas da IA durante as etapas de um case (para limitar o uso por tarefa e por dia).
CREATE TABLE IF NOT EXISTS task_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS task_reviews_user_day ON task_reviews (user_id, created_at);
