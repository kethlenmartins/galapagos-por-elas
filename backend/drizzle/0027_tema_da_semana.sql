-- Tema da semana: categoria especial em que só a equipe publica; as participantes comentam.
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS official boolean NOT NULL DEFAULT false;
INSERT INTO forum_categories (id, name, description, position)
VALUES ('tema-da-semana', 'Tema da semana', 'Um tema proposto pela equipe para a comunidade conversar durante a semana.', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, position = EXCLUDED.position;
