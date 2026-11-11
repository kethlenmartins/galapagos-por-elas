INSERT INTO cases (id, title, area_id, summary, mission, context, content, status)
VALUES (
  'ib-simplificado',
  'IB simplificado: a venda da Raiz Alimentos',
  'investment-banking',
  'Ajude uma fundadora a comparar compradores e negociar a venda da sua empresa de alimentos premium.',
  'Transforme as prioridades de Marina em uma recomendação de negociação clara, com condições para avançar.',
  $$Você assessora Marina, fundadora da Raiz Alimentos, na venda de sua empresa de molhos, antepastos e conservas premium. A Raiz possui fábrica própria, 180 funcionários e distribuição regional. Marina quer receber pelo menos R$ 80 milhões na conclusão, reduzir a gestão diária em até seis meses e preservar a marca, a equipe e a qualidade dos produtos. Você vai investigar prioridades, comparar compradores e recomendar um caminho.$$,
  '{}'::jsonb,
  'publicado'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO contents (id, title, type, area_id, summary, body, url, minutes, case_ids) VALUES
(
  'ib-simplificado-pagamentos',
  'Dinheiro na conclusão, parcela fixa e earn-out',
  'glossario',
  'investment-banking',
  'Três formas comuns de estruturar o pagamento em uma venda de empresa.',
  $$**Dinheiro na conclusão** é o valor recebido quando o negócio fecha. **Parcela fixa futura** é um valor já definido, pago depois. **Earn-out** depende de metas futuras: pode aumentar o valor total, mas deixa uma parte do recebimento condicionada ao desempenho após a venda. Compare valor, prazo e risco antes de escolher uma proposta.$$,
  NULL, 4, '["ib-simplificado"]'::jsonb
),
(
  'ib-simplificado-negociacao',
  'Como transformar uma preocupação em condição de negociação',
  'artigo',
  'investment-banking',
  'Um roteiro simples para ligar a prioridade da cliente a um compromisso verificável.',
  $$Em uma negociação, comece pela preocupação concreta da cliente. Depois, peça um compromisso observável: um prazo, uma regra de aprovação, uma proteção contratual ou uma responsabilidade definida. Evite promessas vagas como “vamos preservar a qualidade”; prefira critérios que possam ser acompanhados depois do fechamento.$$,
  NULL, 5, '["ib-simplificado"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO checkpoints (id, case_id, "order", stage, title, description, points, task_ids) VALUES
('ib-cp-1', 'ib-simplificado', 1, 'entenda', 'O papel de quem assessora a venda', 'Conheça o contexto da Raiz Alimentos e as prioridades que devem orientar a negociação.', 15, '[]'::jsonb),
('ib-cp-2', 'ib-simplificado', 2, 'treino', 'A conversa com Marina', 'Identifique o que é essencial para a cliente antes de falar com compradores.', 25, '["ib-task-marina"]'::jsonb),
('ib-cp-3', 'ib-simplificado', 3, 'situacao', 'Entenda os compradores', 'Compare atrativos e riscos de cada interessado pela perspectiva de Marina.', 30, '["ib-task-compradores"]'::jsonb),
('ib-cp-4', 'ib-simplificado', 4, 'situacao', 'Pagamentos e propostas', 'Diferencie valores garantidos, condicionados e as concessões de cada proposta.', 30, '["ib-task-propostas"]'::jsonb),
('ib-cp-5', 'ib-simplificado', 5, 'defesa', 'Nova informação e pitch final', 'Atualize a recomendação e apresente o caminho para Marina.', 40, '["ib-task-pitch"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, case_id, checkpoint_id, title, prompt, fields, support_data, answer_key) VALUES
(
  'ib-task-marina', 'ib-simplificado', 'ib-cp-2', 'O que Marina quer proteger',
  'Leia as opções e registre uma pergunta que ajudaria a preparar a próxima conversa.',
  $$[
    {"id":"pagamento","tipo":"opcao","rotulo":"Qual condição de pagamento respeita melhor o pedido de Marina?","obrigatorio":true,"opcoes":["A. R$ 75 milhões na conclusão e R$ 35 milhões fixos após um ano.","B. R$ 85 milhões na conclusão e R$ 15 milhões fixos após um ano.","C. R$ 80 milhões na conclusão e até R$ 30 milhões conforme metas futuras de lucro.","D. R$ 70 milhões na conclusão e R$ 40 milhões após seis meses."]},
    {"id":"saida","tipo":"opcao","rotulo":"Qual proposta de transição está mais alinhada ao pedido de Marina?","obrigatorio":true,"opcoes":["A. Continuar como diretora por um ano, com dedicação reduzida depois do sexto mês.","B. Deixar o cargo na conclusão, mas continuar responsável pelas decisões comerciais por 18 meses.","C. Deixar a gestão em seis meses e prestar apoio por mais seis meses, até dois dias por semana, com responsabilidades definidas.","D. Permanecer na gestão até que o comprador encontre uma substituta, sem prazo determinado."]},
    {"id":"qualidade","tipo":"opcao","rotulo":"Como interpretar a preocupação de Marina com os produtos?","obrigatorio":true,"opcoes":["A. Ela exige que todos os ingredientes permaneçam iguais para sempre.","B. Basta manter a marca, mesmo que as receitas sejam alteradas.","C. Ela aceita qualquer mudança se o preço for maior.","D. Ela quer preservar características importantes da qualidade, que ainda precisam ser esclarecidas e protegidas."]},
    {"id":"pergunta_adicional","tipo":"texto","rotulo":"Que pergunta adicional você faria a Marina e como a resposta ajudaria na negociação?","obrigatorio":true,"limiteCaracteres":400}
  ]$$::jsonb,
  NULL,
  '{"referencias":{"pagamento":"B","saida":"C","qualidade":"D"}}'::jsonb
),
(
  'ib-task-compradores', 'ib-simplificado', 'ib-cp-3', 'Atrativos, riscos e compromissos',
  'Para cada comprador, escolha o maior atrativo e o maior risco para Marina. As escolhas de uma mesma empresa devem ser diferentes. Depois, transforme um risco em pedido de negociação.',
  $$[
    {"id":"mesa_atrativo","tipo":"opcao","rotulo":"Grupo Mesa — maior atrativo","obrigatorio":true,"opcoes":["Distribuição nacional amplia o alcance da Raiz.","Integração administrativa elimina funções.","Pouca presença atual em conservas premium.","Padronização pressiona ingredientes e processos.","Integra compras, finanças e logística.","Entrada rápida na categoria sem criar marca do zero."]},
    {"id":"mesa_risco","tipo":"opcao","rotulo":"Grupo Mesa — maior risco","obrigatorio":true,"opcoes":["Distribuição nacional amplia o alcance da Raiz.","Integração administrativa elimina funções.","Pouca presença atual em conservas premium.","Padronização pressiona ingredientes e processos.","Integra compras, finanças e logística.","Entrada rápida na categoria sem criar marca do zero."]},
    {"id":"semente_atrativo","tipo":"opcao","rotulo":"Fundo Semente — maior atrativo","obrigatorio":true,"opcoes":["Venda futura da participação.","Compra de outras marcas torna o grupo mais complexo.","Preservar marca e não fazer cortes iniciais.","Não há nova liderança contratada.","Investimento em expansão.","Primeira empresa de uma estratégia de consolidação."]},
    {"id":"semente_risco","tipo":"opcao","rotulo":"Fundo Semente — maior risco","obrigatorio":true,"opcoes":["Venda futura da participação.","Compra de outras marcas torna o grupo mais complexo.","Preservar marca e não fazer cortes iniciais.","Não há nova liderança contratada.","Investimento em expansão.","Primeira empresa de uma estratégia de consolidação."]},
    {"id":"oliva_atrativo","tipo":"opcao","rotulo":"Casa Oliva — maior atrativo","obrigatorio":true,"opcoes":["A fábrica resolve a limitação de capacidade.","Mantém fábrica e equipe de produção.","Acesso a novos clientes.","As receitas ampliam o portfólio.","A marca Raiz desaparece gradualmente.","Já atua no segmento premium."]},
    {"id":"oliva_risco","tipo":"opcao","rotulo":"Casa Oliva — maior risco","obrigatorio":true,"opcoes":["A fábrica resolve a limitação de capacidade.","Mantém fábrica e equipe de produção.","Acesso a novos clientes.","As receitas ampliam o portfólio.","A marca Raiz desaparece gradualmente.","Já atua no segmento premium."]},
    {"id":"reduzir_risco","tipo":"texto","rotulo":"Escolha um comprador. Que compromisso ou esclarecimento pediria para reduzir um risco?","obrigatorio":true,"limiteCaracteres":520}
  ]$$::jsonb,
  NULL,
  '{"referencias":{"mesa_atrativo":"Distribuição nacional amplia o alcance da Raiz.","mesa_risco":"Padronização pressiona ingredientes e processos.","semente_atrativo":"Preservar marca e não fazer cortes iniciais.","semente_risco":"Não há nova liderança contratada.","oliva_atrativo":"Mantém fábrica e equipe de produção.","oliva_risco":"A marca Raiz desaparece gradualmente."}}'::jsonb
),
(
  'ib-task-propostas', 'ib-simplificado', 'ib-cp-4', 'Compare as propostas',
  'Use a tabela para separar valor garantido, valor condicionado e condições operacionais. Desconsidere impostos, despesas e ajustes de preço.',
  $$[
    {"id":"comparacao_financeira","tipo":"opcao","rotulo":"Qual afirmação está correta?","obrigatorio":true,"opcoes":["A. O Fundo Semente oferece R$ 110 milhões garantidos.","B. A Casa Oliva oferece mais dinheiro na conclusão; o Mesa oferece R$ 100 milhões fixos em duas datas; o Semente pode chegar a R$ 110 milhões, dependendo das metas.","C. O Mesa oferece R$ 100 milhões integralmente na conclusão.","D. O pagamento integral da Oliva garante que a operação será concluída."]},
    {"id":"recomendacao_inicial","tipo":"texto","rotulo":"Qual comprador você priorizaria agora? Relacione o pedido de Marina e a principal concessão que ela faria.","obrigatorio":true,"limiteCaracteres":650}
  ]$$::jsonb,
  $$ {"titulo":"Propostas recebidas","colunas":["Grupo Mesa","Fundo Semente","Casa Oliva"],"linhas":[{"rotulo":"Pagamento","celulas":[{"texto":"R$ 90 mi na conclusão + R$ 10 mi fixos após 1 ano","valor":100},{"texto":"R$ 80 mi na conclusão + até R$ 30 mi por metas","valor":110},{"texto":"R$ 95 mi integralmente na conclusão","valor":95}]},{"rotulo":"Papel de Marina","celulas":[{"texto":"4 meses de transição, até 2 dias/semana","valor":null},{"texto":"6 meses na gestão + 6 meses de apoio comercial","valor":null},{"texto":"8 meses de transição, sem gestão diária","valor":null}]},{"rotulo":"Marca e produtos","celulas":[{"texto":"Preserva a marca por 2 anos; quer padronizar a produção","valor":null},{"texto":"Pretende preservar marca e posicionamento; compromissos serão negociados","valor":null},{"texto":"Migra para Casa Oliva em até 18 meses","valor":null}]},{"rotulo":"Equipe e fábrica","celulas":[{"texto":"Mantém fábrica e produção; elimina 12 funções administrativas","valor":null},{"texto":"Sem cortes iniciais; contratará nova liderança","valor":null},{"texto":"Mantém fábrica e produção; avaliará sobreposições","valor":null}]}]} $$::jsonb,
  '{"referencias":{"comparacao_financeira":"B"}}'::jsonb
),
(
  'ib-task-pitch', 'ib-simplificado', 'ib-cp-5', 'Recomendação à cliente',
  'Nova informação: o Grupo Mesa não mudaria receitas no primeiro ano, mas quer liberdade para avaliar ingredientes e processos depois. Pode discutir critérios de qualidade, mas não proibição permanente.',
  $$[
    {"id":"reagir_negociar","tipo":"texto","rotulo":"Essa informação muda sua recomendação? O que você negociaria ou esclareceria antes de avançar?","obrigatorio":true,"limiteCaracteres":650},
    {"id":"pitch_final","tipo":"texto","rotulo":"Apresente sua recomendação a Marina: caminho escolhido, principal concessão e condições necessárias para avançar.","obrigatorio":true,"limiteCaracteres":1000}
  ]$$::jsonb,
  NULL,
  '{"avaliacao":"Não exigir comprador específico: procurar coerência, reconhecimento de desvantagem e próximo passo claro."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
