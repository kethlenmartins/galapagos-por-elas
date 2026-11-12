-- Gerado por backend/scripts/gerar-vagas.mjs a partir de docs/cases/*-vagas.md.
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  area_id text NOT NULL,
  company text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  kind text NOT NULL DEFAULT 'outro',
  url text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho',
  checked_at date,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_area_status ON jobs (area_id, status);
-- Rascunho: a equipe confere de novo e publica na tela de admin.
INSERT INTO jobs (id, area_id, company, title, location, kind, url, status, checked_at) VALUES
('vaga-cf-1', 'corporate-finance', 'Genial Investimentos', 'Analista de Controle Financeiro Jr (contas a receber e faturamento)', 'São Paulo', 'junior', 'https://genial.gupy.io/jobs/12777838', 'rascunho', '2026-11-11'),
('vaga-cf-2', 'corporate-finance', 'Genial Investimentos', 'Analista Contábil Júnior', 'Rio de Janeiro', 'junior', 'https://genial.gupy.io/jobs/12788102', 'rascunho', '2026-11-11'),
('vaga-cf-3', 'corporate-finance', 'XP Inc.', 'Analista de Estratégia e Performance Júnior', 'São Paulo', 'junior', 'https://job-boards.greenhouse.io/xpinc/jobs/8839562002', 'rascunho', '2026-11-11'),
('vaga-cf-4', 'corporate-finance', 'Sicoob UniCentro Br', 'Assistente de Controladoria', 'Goiânia', 'outro', 'https://sicoobunicentrobr.gupy.io/jobs/12780982', 'rascunho', '2026-11-11'),
('vaga-cf-5', 'corporate-finance', 'Itaú Unibanco', 'Programa de Estágio Corporativo 2026 (banco de talentos, inclui a carreira Corporativo)', 'São Paulo', 'estagio', 'https://vemproitau.gupy.io/jobs/11511312', 'rascunho', '2026-11-11'),
('vaga-st-1', 'sales-trading', 'Rabobank', 'Estágio — Corporate Sales Desk', 'São Paulo', 'estagio', 'https://rabobank.jobs/en/job/estagio-corporate-sales-desk/JR_00142377/', 'rascunho', '2026-11-11'),
('vaga-st-2', 'sales-trading', 'XP Inc.', 'Estagiário(a) — Corporate Desk', 'São Paulo', 'estagio', 'https://job-boards.greenhouse.io/xpinc/jobs/8639452002', 'rascunho', '2026-11-11'),
('vaga-st-3', 'sales-trading', 'Itaú Unibanco', 'Programa de Estágio Corporativo 2026 (banco de talentos, inclui a carreira Negócios Atacado, onde ficam as mesas)', 'São Paulo', 'estagio', 'https://vemproitau.gupy.io/jobs/11511312', 'rascunho', '2026-11-11'),
('vaga-op-1', 'operacoes', 'Genial Investimentos', 'Analista de Back Office Jr (Asset — fundos estruturados)', 'São Paulo', 'junior', 'https://genial.gupy.io/jobs/12502759', 'rascunho', '2026-11-11'),
('vaga-op-2', 'operacoes', 'Sicoob UniCentro Br', 'Estágio — Banco de Talentos', 'Goiânia', 'estagio', 'https://sicoobunicentrobr.gupy.io/jobs/11014905', 'rascunho', '2026-11-11'),
('vaga-op-3', 'operacoes', 'Oliveira Trust', 'Analista Contábil em Fundos de Investimentos Jr', 'Rio de Janeiro', 'junior', 'https://vempraot.gupy.io/jobs/12483303', 'rascunho', '2026-11-11'),
('vaga-op-4', 'operacoes', 'Oliveira Trust', 'Assistente de Auditoria de Administração de Fundos', 'Rio de Janeiro', 'outro', 'https://vempraot.gupy.io/jobs/12849177', 'rascunho', '2026-11-11'),
('vaga-op-5', 'operacoes', 'Oliveira Trust', 'Banco de talentos', 'Rio de Janeiro', 'outro', 'https://vempraot.gupy.io/jobs/5670237', 'rascunho', '2026-11-11')
ON CONFLICT (id) DO NOTHING;
