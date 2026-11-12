CREATE TABLE forum_profiles (
  user_id uuid PRIMARY KEY, nickname text NOT NULL, show_area boolean NOT NULL DEFAULT false,
  show_badges boolean NOT NULL DEFAULT false, nickname_changed_at timestamp with time zone,
  CONSTRAINT forum_profiles_nickname_unique UNIQUE (nickname)
);
CREATE TABLE forum_categories (id text PRIMARY KEY, name text NOT NULL, description text NOT NULL, position integer NOT NULL);
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL, category_id text NOT NULL REFERENCES forum_categories(id),
  area_id text, title text NOT NULL, body text NOT NULL, status text NOT NULL DEFAULT 'published',
  created_at timestamp with time zone NOT NULL DEFAULT now(), edited_at timestamp with time zone,
  helpful_count integer NOT NULL DEFAULT 0, reply_count integer NOT NULL DEFAULT 0
);
CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES forum_posts(id), parent_id uuid,
  author_id uuid NOT NULL, body text NOT NULL, status text NOT NULL DEFAULT 'published', helpful boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(), edited_at timestamp with time zone, helpful_count integer NOT NULL DEFAULT 0
);
CREATE TABLE forum_votes (user_id uuid NOT NULL, target_type text NOT NULL, target_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY (user_id, target_type, target_id));
CREATE TABLE forum_follows (user_id uuid NOT NULL, post_id uuid NOT NULL REFERENCES forum_posts(id), created_at timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY (user_id, post_id));
CREATE TABLE forum_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL, target_type text NOT NULL, target_id uuid NOT NULL, reason text NOT NULL, detail text, status text NOT NULL DEFAULT 'open', handled_by uuid, handled_at timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now());
CREATE TABLE forum_moderation_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), moderator_id uuid NOT NULL, action text NOT NULL, target_type text NOT NULL, target_id uuid NOT NULL, reason text, created_at timestamp with time zone NOT NULL DEFAULT now());
CREATE TABLE forum_sanctions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, kind text NOT NULL, until_at timestamp with time zone, reason text NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now());
CREATE INDEX forum_posts_list ON forum_posts (status, category_id, created_at DESC);
CREATE INDEX forum_replies_post ON forum_replies (post_id, created_at);
CREATE INDEX forum_reports_queue ON forum_reports (status, created_at);
INSERT INTO forum_categories (id, name, description, position) VALUES
 ('boas-vindas', 'Boas-vindas e apresentações', 'Quem é você e o que busca', 1),
 ('mercado', 'Dúvidas sobre o mercado', 'Conceitos, carreira e por onde começar', 2),
 ('cases', 'Cases e estudos', 'Dúvidas sobre os cases e o treino, sem gabaritos', 3),
 ('entrevistas', 'Entrevistas e processos seletivos', 'Experiências, dicas e preparação', 4),
 ('vagas', 'Vagas e oportunidades', 'Conversa sobre vagas, sem pedir ou oferecer dinheiro', 5),
 ('bastidores', 'Bastidores e desabafos', 'Dificuldades, dúvidas e vitórias', 6)
ON CONFLICT (id) DO NOTHING;
