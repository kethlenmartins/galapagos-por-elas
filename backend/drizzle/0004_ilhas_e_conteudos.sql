-- Os cases viram ilhas em ordem: uma ilha só abre quando as anteriores têm certificado.
ALTER TABLE cases ADD COLUMN IF NOT EXISTS island_order integer NOT NULL DEFAULT 100;
UPDATE cases SET island_order = 1 WHERE id = 'ib-simplificado';

-- Os conteúdos do case passam a ser uma etapa obrigatória, entre "Entenda a área" e o treino.
-- O progresso já salvo continua valendo: ele é guardado pelo id do checkpoint, não pela ordem.
UPDATE checkpoints SET "order" = "order" + 1 WHERE case_id = 'ib-simplificado' AND "order" >= 2 AND id <> 'ib-cp-conteudos';
INSERT INTO checkpoints (id, case_id, "order", stage, title, description, points, task_ids) VALUES
('ib-cp-conteudos', 'ib-simplificado', 2, 'conteudos', 'Conteúdos do case', 'Leia todos os conteúdos do case antes de seguir: eles trazem os conceitos que você vai usar na conversa com Marina e na comparação das propostas.', 10, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
