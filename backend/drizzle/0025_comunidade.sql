-- Comunidade: novas categorias, publicação anônima e conversas salvas.
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS anonymous boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS forum_saved_posts (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL REFERENCES forum_posts(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

UPDATE forum_posts SET category_id = 'mercado' WHERE category_id = 'cases';
UPDATE forum_categories SET name = 'Primeiros passos', description = 'Escolha de área, organização dos estudos e preparação inicial.', position = 1 WHERE id = 'boas-vindas';
UPDATE forum_categories SET name = 'Dúvidas técnicas', description = 'Finanças, contabilidade, valuation, Excel e conceitos do mercado.', position = 3 WHERE id = 'mercado';
UPDATE forum_categories SET name = 'Processos seletivos', description = 'Currículo, entrevistas, dinâmicas, cases e experiências em seleções.', position = 2 WHERE id = 'entrevistas';
UPDATE forum_categories SET name = 'Experiências e conselhos', description = 'Relatos de estágio, dificuldades, conquistas e pedidos de conselho.', position = 4 WHERE id = 'bastidores';
UPDATE forum_categories SET name = 'Conexões e estudos', description = 'Grupos de estudo, prática de entrevistas e troca entre participantes.', position = 5 WHERE id = 'vagas';
DELETE FROM forum_categories WHERE id = 'cases';
