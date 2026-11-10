INSERT INTO cases (id, title, area_id, summary, mission, context, content, status)
VALUES ('piloto-corporate-finance', 'Aurora Moda: decisão de crescimento', 'corporate-finance', 'Analise os números de uma empresa fictícia e recomende como financiar seu crescimento.', 'Avaliar o crescimento e os riscos da Aurora Moda.', 'A Aurora Moda é uma empresa fictícia de varejo que está avaliando abrir novas lojas.', '{}'::jsonb, 'publicado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO checkpoints (id, case_id, "order", stage, title, description, points, task_ids) VALUES
('piloto-cp-1', 'piloto-corporate-finance', 1, 'entenda', 'Entenda o contexto', 'Leia o contexto da empresa.', 20, '[]'::jsonb),
('piloto-cp-2', 'piloto-corporate-finance', 2, 'situacao', 'Analise os dados', 'Calcule e explique sua recomendação.', 30, '["piloto-task-1"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, case_id, checkpoint_id, title, prompt, fields, support_data, answer_key) VALUES
('piloto-task-1', 'piloto-corporate-finance', 'piloto-cp-2', 'Recomendação de investimento', 'A empresa cresceu e aumentou sua dívida. Você investiria? Explique os fatores que considerou.', '[{"id":"recomendacao","tipo":"texto","rotulo":"Sua recomendação","obrigatorio":true,"limiteCaracteres":1500}]'::jsonb, '{"titulo":"Dados resumidos","colunas":["2024","2025"],"linhas":[{"rotulo":"Receita (R$ mi)","celulas":[{"texto":"82","valor":82},{"texto":"104","valor":104}]}]}'::jsonb, '{"notaMaxima":10}'::jsonb)
ON CONFLICT (id) DO NOTHING;
