INSERT INTO cases (id, title, area_id, summary, mission, context, content, status, island_order)
VALUES (
  'vc-simplificado',
  'VC simplificado: três conversas, três decisões',
  'venture-capital',
  'Atue como analista de um fundo de VC e decida, em três conversas, se recomenda investir em cada startup.',
  'Investigue a questão pendente de cada oportunidade, recomende investir ou não e justifique com os fatos da conversa.',
  $$Você integra a equipe do Fundo Entrelinhas, que investe em startups de tecnologia em estágio inicial. Sua gestora apresenta o desafio: “Você vai concluir a análise de três startups que chegaram por caminhos diferentes. A equipe já avaliou os demais critérios de cada oportunidade; falta investigar a questão apresentada em cada conversa. Há orçamento para investir nas três, se fizer sentido. Não precisamos escolher uma vencedora nem aprovar uma quantidade mínima.” Considere aprovadas as demais análises de cada oportunidade. Sua recomendação deve se apoiar na última questão investigada e nas condições apresentadas. Considere verdadeiros os dados apresentados como verificados nos materiais; diferencie esses dados das projeções dos fundadores. Todos os nomes, empresas, números e situações são fictícios.$$,
  $${
    "resumo": "Venture Capital (VC) é a área que investe em empresas jovens, geralmente de tecnologia, com potencial de crescer rápido. Quem trabalha com VC analisa muitas oportunidades, conversa com fundadores e decide, com informação incompleta, em quais vale apostar.",
    "links": [],
    "cards": [
      {"titulo": "O que faz um fundo de VC", "texto": "Um fundo de VC recebe dinheiro de investidores e o aplica em startups em troca de uma participação na empresa. O retorno vem se a startup crescer e a participação valer mais no futuro.", "naPratica": "O fundo analisa muitas empresas e investe em poucas."},
      {"titulo": "Deal flow: de onde vêm as oportunidades", "texto": "Deal flow é o fluxo de oportunidades que chegam ao fundo: formulários no site, eventos, indicações de pessoas da rede e busca ativa.", "naPratica": "A origem da oportunidade abre a conversa, mas não substitui a análise."},
      {"titulo": "Os critérios de análise", "texto": "Uma análise costuma olhar equipe, produto, mercado, tração (resultados que a empresa já mostra), condições da rodada e plano de execução.", "naPratica": "Cada conversa pode testar um critério diferente, e a decisão precisa se apoiar nos fatos levantados."},
      {"titulo": "Fatos, projeções e decisão", "texto": "Dados verificados descrevem o que já aconteceu. Projeções dos fundadores descrevem o que eles esperam que aconteça. A recomendação conecta os fatos à decisão e reconhece o que os dados não permitem concluir.", "naPratica": "Investir ou não investir é uma decisão que se justifica em poucas palavras, com evidências."}
    ],
    "comoSeEntra": {
      "ondeSeTrabalha": "Fundos de venture capital, aceleradoras, corporate ventures (braços de investimento de grandes empresas) e fundos de investimento que também olham para startups.",
      "formacoes": "Administração, Economia, Engenharia, Ciências Contábeis e áreas ligadas a tecnologia e negócios.",
      "vagas": "Estágio ou posição de analista em fundos de VC, aceleradoras e áreas de inovação de empresas.",
      "oQueAjuda": "Curiosidade sobre startups e tecnologia, leitura de números básicos de negócios, escrita clara e participar de comunidades de empreendedorismo.",
      "quandoRecrutam": "Muitos fundos são pequenos e recrutam ao longo do ano, sem um calendário fixo. Acompanhe as páginas e redes dos fundos e eventos do ecossistema."
    }
  }$$::jsonb,
  'publicado',
  2
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO contents (id, title, type, area_id, summary, body, url, minutes, case_ids) VALUES
(
  'vc-simplificado-receita-e-tracao',
  'Receita recorrente, receita pontual e tração',
  'glossario',
  'venture-capital',
  'Como separar o que se repete do que acontece uma vez só ao olhar os números de uma startup.',
  $$**Receita recorrente** é a que se repete em períodos regulares, como uma assinatura mensal. **Receita pontual** acontece por um evento específico, como um projeto de implantação cobrado na entrada do cliente. Misturar as duas pode fazer a empresa parecer maior do que a base que se repete. **Tração** é o conjunto de evidências de que o produto está funcionando no mercado: clientes pagantes, crescimento e permanência. **Conversão** é a parcela de quem testa o produto e passa a pagar. Ao ouvir uma projeção, compare as premissas com o histórico já observado e pergunte o que sustenta a diferença.$$,
  NULL, 5, '["vc-simplificado"]'::jsonb
),
(
  'vc-simplificado-valuation-e-rodada',
  'Valuation, rodada e participação',
  'artigo',
  'venture-capital',
  'O que significam o valor da empresa antes do investimento e a participação que o fundo recebe.',
  $$Em uma rodada, a startup recebe um valor de investimento e entrega ao fundo uma participação. O **valuation pre-money** é o valor atribuído à empresa antes do aporte; somando o aporte, chega-se ao valor depois do investimento. Por exemplo, com valor antes de R$ 10 milhões e aporte de R$ 2 milhões, o valor depois é R$ 12 milhões, e o fundo fica com 2 ÷ 12 da empresa. O preço pedido costuma refletir o plano que o fundador apresenta. Por isso, quando as premissas do plano não são comprovadas, vale discutir se o preço continua fazendo sentido. Um preço mais baixo ajuda, mas só se for justificável pelos dados verificados.$$,
  NULL, 6, '["vc-simplificado"]'::jsonb
),
(
  'vc-simplificado-mercado-e-confianca',
  'Mercado acessível e confiança entre sócios',
  'artigo',
  'venture-capital',
  'Duas perguntas que aparecem em toda análise: quão grande é o mercado possível e dá para confiar na relação com o fundador.',
  $$**Mercado acessível** é o universo de clientes que o produto consegue atender hoje multiplicado pelo que cada um gastaria por ano. É o espaço de vendas possível, não uma previsão de receita da startup: a empresa ainda precisa conquistar clientes para capturar uma parcela dele. Para testar se o mercado é real, procure evidências de necessidade (por que comprar agora) e de pagamento (quem já paga e quanto). A concorrência inclui também a alternativa de continuar fazendo como hoje. Em uma relação de investimento, o fundo vira sócio: transparência e prestação de contas importam. Observe comportamentos verificáveis, como informar problemas, corrigir dados e permitir que o investidor verifique. Estilo pessoal e discordâncias não são, sozinhos, motivo para recusar uma oportunidade.$$,
  NULL, 5, '["vc-simplificado"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO checkpoints (id, case_id, "order", stage, title, description, points, task_ids) VALUES
('vc-cp-1', 'vc-simplificado', 1, 'entenda', 'O trabalho de um analista de VC', 'Conheça o Fundo Entrelinhas, a sua missão no deal flow e como funciona a análise de uma startup.', 15, '[]'::jsonb),
('vc-cp-2', 'vc-simplificado', 2, 'conteudos', 'Conteúdos do case', 'Leia todos os conteúdos do case antes de abrir as oportunidades.', 10, '[]'::jsonb),
('vc-cp-3', 'vc-simplificado', 3, 'situacao', 'A startup do formulário: Projeto Prisma', 'Investigue a tração e as premissas que sustentam o preço pedido.', 30, '["vc-task-prisma"]'::jsonb),
('vc-cp-4', 'vc-simplificado', 4, 'situacao', 'O fundador do evento: Projeto Compasso', 'Investigue a relação do fundador com a equipe e os investidores.', 30, '["vc-task-compasso"]'::jsonb),
('vc-cp-5', 'vc-simplificado', 5, 'situacao', 'A startup indicada: Projeto Mosaico', 'Conclua a análise de mercado e dimensione o mercado acessível.', 35, '["vc-task-mosaico"]'::jsonb),
('vc-cp-6', 'vc-simplificado', 6, 'defesa', 'O que faria você mudar de decisão?', 'Explique o que reabriria as duas oportunidades não aprovadas.', 40, '["vc-task-mudar-decisao"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, case_id, checkpoint_id, title, prompt, fields, support_data, answer_key) VALUES
(
  'vc-task-prisma', 'vc-simplificado', 'vc-cp-3', 'Projeto Prisma',
  $$Origem: formulário no site do fundo. Produto: software para organizar o atendimento comercial de pequenas empresas.
O material enviado destaca: 100 empresas atendidas; R$ 200 mil de receita mensal recorrente; base de empresas triplicou em seis meses.
A fundadora escreve: “Buscamos R$ 4 milhões, com valuation de R$ 40 milhões antes do investimento. Queremos acelerar as vendas.”
O processo avançou até a verificação da tração e das premissas que sustentam o preço pedido.
[[continuar]]
[[campos: caixa_1, caixa_2]]
Antes da conversa, escolha duas caixas de atenção para esta oportunidade. Elas só serão comentadas depois da sua decisão.
[[continuar]]
Você: “Como os R$ 200 mil se dividem entre assinaturas e outros serviços?”
Fundadora: “São R$ 80 mil de assinaturas e R$ 120 mil de projetos de implantação realizados no último mês.”
Você: “As implantações se repetem todo mês?”
Fundadora: “Não. São serviços cobrados quando o cliente entra ou pede um projeto adicional.”
[[continuar]]
Você: “E as 100 empresas atendidas?”
Fundadora: “Quarenta pagam assinatura e sessenta estão em teste gratuito. Há seis meses, tínhamos vinte assinantes.”
Você: “Qual conversão dos testes vocês utilizaram na projeção?”
Fundadora: “Consideramos que nove em cada dez vão contratar. Nas turmas de teste que já terminaram, três em cada dez contrataram. Acreditamos que as próximas serão melhores.”
[[continuar]]
Você: “O que sustenta essa melhora na conversão?”
Fundadora: “Pretendemos reforçar o acompanhamento dos testes, mas ainda não medimos o resultado dessa mudança.”
Você: “Se a projeção considerar o histórico observado, vocês discutiriam outro valuation?”
Fundadora: “Por enquanto, não. O preço de R$ 40 milhões foi definido com base no plano apresentado.”$$,
  $$[
    {"id":"caixa_1","tipo":"opcao","rotulo":"Primeiro ponto que você priorizaria nesta análise","obrigatorio":true,"opcoes":["Composição da receita apresentada.","Tamanho do mercado atendível.","Direitos dos investidores na rodada.","Evolução dos clientes pagantes.","Experiência técnica da equipe.","Titularidade do código do produto."]},
    {"id":"caixa_2","tipo":"opcao","rotulo":"Segundo ponto que você priorizaria nesta análise (diferente do primeiro)","obrigatorio":true,"opcoes":["Composição da receita apresentada.","Tamanho do mercado atendível.","Direitos dos investidores na rodada.","Evolução dos clientes pagantes.","Experiência técnica da equipe.","Titularidade do código do produto."]},
    {"id":"decisao","tipo":"opcao","rotulo":"Você recomenda investir na Prisma nas condições apresentadas?","obrigatorio":true,"opcoes":["Sim","Não"]},
    {"id":"justificativa","tipo":"texto","rotulo":"Justifique sua decisão em poucas palavras (até 40 palavras).","obrigatorio":true,"limiteCaracteres":320}
  ]$$::jsonb,
  NULL,
  $${
    "decisaoEsperada": "Não",
    "recomendacaoEsperada": "Não investir nas condições atuais.",
    "criterioJustificativa": "Relacionar a qualidade das receitas ou a conversão não comprovada à sustentação da projeção e do preço pedido. Não exigir fórmula de valuation nem afirmar que um valor específico seria necessariamente justo.",
    "fundamentoCentral": "Receita recorrente mal classificada (R$ 80 mil de R$ 200 mil) e conversão projetada (9 em 10) muito acima do histórico (3 em 10), sem evidência, enfraquecem o plano usado para justificar o preço.",
    "caixasDeReferencia": ["Composição da receita apresentada.", "Evolução dos clientes pagantes."],
    "feedbackDecisao": {
      "naoConsistente": "Boa análise! A receita recorrente é de R$ 80 mil, e a projeção usa uma conversão muito acima do histórico, sem evidência da melhora. Como o preço permanece baseado nesse plano, há fundamento para não investir nas condições atuais.",
      "sim": "O crescimento dos assinantes é um sinal positivo. Porém, parte da receita apresentada não se repete, e a conversão projetada ainda não foi demonstrada. Como o preço depende desse plano, a recomendação é não investir nas condições atuais.",
      "naoGenerico": "Sua decisão vai na direção esperada. Para sustentá-la, conecte o preço aos dados: parte da receita é pontual e a conversão projetada supera bastante o histórico, sem evidência que justifique a diferença.",
      "implantacaoSempreRuim": "A receita de implantação não é um problema por si só. O cuidado é não tratá-la como recorrente. Aqui, a classificação da receita e a conversão não comprovada enfraquecem o plano usado para justificar o preço."
    },
    "feedbackCaixas": {
      "duas": "Você priorizou os pontos que permitiam testar a tração apresentada: o que se repete na receita e quantos usuários realmente se tornam clientes pagantes.",
      "uma": "Você identificou uma das prioridades. A outra era [opção não selecionada], importante para verificar se os indicadores sustentavam a projeção.",
      "nenhuma": "Os pontos escolhidos importam em VC, mas já estavam avaliados neste exercício. A pendência era entender a composição da receita e a evolução dos clientes pagantes."
    }
  }$$::jsonb
),
(
  'vc-task-compasso', 'vc-simplificado', 'vc-cp-4', 'Projeto Compasso',
  $$Origem: encontro em um evento de empreendedorismo. Produto: software para organizar compras de pequenas indústrias.
O fundador inicia: “Trabalhei anos nesse setor e conheço o problema de perto. Já temos clientes pagando e reduzimos o trabalho manual das equipes de compras. Com a rodada, quero acelerar as vendas.”
Produto, mercado, números e condições da rodada já foram avaliados. Esta conversa conclui a análise da relação do fundador com a equipe e os investidores.
[[continuar]]
[[campos: caixa_1, caixa_2]]
Antes da conversa, escolha duas caixas de atenção para esta oportunidade. Elas só serão comentadas depois da sua decisão.
[[continuar]]
Você: “Conte sobre uma meta importante que vocês não atingiram.”
Fundador: “Ficamos abaixo da meta comercial. A equipe não entregou. Também perdemos um cliente importante.”
Você: “O que vocês aprenderam com a saída dele?”
Fundador: “Não conversei com o cliente depois disso. Estou trocando o responsável comercial e mantendo a estratégia.”
[[continuar]]
Você: “Como essa perda apareceu no relatório enviado aos investidores?”
Fundador: “Ainda não apareceu. O cliente continua na lista de ativos. Quero resolver antes de levantar preocupação.”
Você: “Podemos corrigir o relatório e verificar os motivos da saída?”
Fundador: “Prefiro não alterar o material durante a rodada. Depois do aporte, mando os números consolidados. Não quero abrir os detalhes nem discutir essa perda agora.”$$,
  $$[
    {"id":"caixa_1","tipo":"opcao","rotulo":"Primeiro ponto que você priorizaria nesta conversa","obrigatorio":true,"opcoes":["Margem do produto.","Como o fundador reage a metas não atingidas.","Participação oferecida na rodada.","Proteção da propriedade intelectual.","Como comunica problemas e compartilha informações.","Tamanho do mercado potencial."]},
    {"id":"caixa_2","tipo":"opcao","rotulo":"Segundo ponto que você priorizaria nesta conversa (diferente do primeiro)","obrigatorio":true,"opcoes":["Margem do produto.","Como o fundador reage a metas não atingidas.","Participação oferecida na rodada.","Proteção da propriedade intelectual.","Como comunica problemas e compartilha informações.","Tamanho do mercado potencial."]},
    {"id":"decisao","tipo":"opcao","rotulo":"Você recomenda investir na Compasso?","obrigatorio":true,"opcoes":["Sim","Não"]},
    {"id":"justificativa","tipo":"texto","rotulo":"Justifique sua decisão em poucas palavras (até 40 palavras).","obrigatorio":true,"limiteCaracteres":320}
  ]$$::jsonb,
  NULL,
  $${
    "decisaoEsperada": "Não",
    "recomendacaoEsperada": "Não investir.",
    "criterioJustificativa": "Apontar comportamentos verificáveis: manutenção de informação relevante incorreta e recusa em corrigir ou permitir sua verificação. Não considerar suficiente criticar simpatia, personalidade ou discordância.",
    "fundamentoCentral": "Manutenção de informação relevante incorreta no relatório aos investidores e recusa em corrigir ou permitir verificação.",
    "caixasDeReferencia": ["Como o fundador reage a metas não atingidas.", "Como comunica problemas e compartilha informações."],
    "feedbackDecisao": {
      "naoConsistente": "Boa decisão. Você identificou comportamentos concretos: o relatório mantém informação relevante incorreta, e o fundador rejeita sua correção e verificação. Isso compromete a confiança necessária entre sócios.",
      "sim": "A experiência do fundador é relevante, mas não substitui transparência. Perder um cliente pode acontecer; manter essa informação incorreta e recusar sua correção é o que impede a recomendação neste caso.",
      "naoPersonalidade": "A conclusão esperada é não investir, mas vale ajustar o motivo. Fundadores podem discordar de investidores. O problema aqui é a informação incorreta e a resistência em corrigi-la, não o estilo de comunicação.",
      "apenasPerdaDoCliente": "A perda merece investigação, mas não elimina uma startup por si só. O ponto decisivo é como o fundador lidou com ela: manteve o cliente no relatório e rejeitou a correção e a verificação."
    },
    "feedbackCaixas": {
      "duas": "Você selecionou duas dimensões importantes para observar aprendizado e transparência. A conversa trouxe evidências concretas sobre ambas.",
      "uma": "Você identificou uma prioridade. Também era importante investigar [opção não selecionada], para entender como o fundador lida com problemas e presta contas.",
      "nenhuma": "Os pontos selecionados fazem parte de uma análise de VC, mas já estavam avaliados. Nesta conversa, faltava investigar aprendizado e transparência do fundador."
    }
  }$$::jsonb
),
(
  'vc-task-mosaico', 'vc-simplificado', 'vc-cp-5', 'Projeto Mosaico',
  $$Origem: indicação de uma empreendedora da sua rede. Produto: software que automatiza documentação e rastreabilidade para fabricantes de alimentos.
A mensagem recebida diz: “Conheci a equipe e achei a solução interessante. Estão abrindo uma rodada. Vale conversar.”
Equipe, produto, tração, condições da rodada e plano de execução já foram avaliados. Falta concluir a análise de mercado. Para esta oportunidade, o fundo busca um mercado acessível de pelo menos R$ 200 milhões anuais em receita potencial de software.
[[continuar]]
[[campos: caixa_1, caixa_2]]
Antes da conversa, escolha duas caixas de atenção para esta oportunidade. Elas só serão comentadas depois da sua decisão.
[[continuar]]
Você: “Quem consegue usar o produto atual?”
Fundadora: “Identificamos vinte mil fabricantes compatíveis com o produto e com os canais comerciais disponíveis. O levantamento considera empresas com o porte e a estrutura necessários para contratar.”
Você: “Quanto pagariam?”
Fundadora: “R$ 12 mil por ano, em média. Esse valor foi testado em clientes pagantes. O levantamento e as premissas estão nos documentos que enviamos.”
[[continuar]]
Você: “Por que esse problema ficou mais importante agora?”
Fundadora: “Grandes compradores aumentaram as exigências de documentação dos fornecedores. Os fabricantes precisam organizar mais informações e rastrear insumos e lotes.”
Você: “Como resolvem isso hoje?”
Fundadora: “Com planilhas, arquivos, trabalho manual e alguns softwares mais amplos. Nos clientes atuais, verificamos redução do esforço e disposição para pagar pela solução.”
[[continuar]]
Você: “Há poucos concorrentes especializados. Isso torna a venda fácil?”
Fundadora: “Não. Disputamos orçamento com outras prioridades e precisamos convencer o cliente a mudar sua rotina. A concorrência também inclui continuar fazendo como ele faz hoje.”
[[continuar]]
Apoio ao cálculo: mercado acessível anual = clientes atendíveis × gasto anual por cliente.$$,
  $$[
    {"id":"caixa_1","tipo":"opcao","rotulo":"Primeiro ponto que você priorizaria nesta análise","obrigatorio":true,"opcoes":["Distribuição das participações entre os sócios.","Qualidade técnica do código.","Quantidade de clientes que o produto consegue atender e quanto pagariam.","Experiência dos fundadores.","Direitos previstos no contrato de investimento.","Motivos para comprar agora e alternativas utilizadas pelos clientes."]},
    {"id":"caixa_2","tipo":"opcao","rotulo":"Segundo ponto que você priorizaria nesta análise (diferente do primeiro)","obrigatorio":true,"opcoes":["Distribuição das participações entre os sócios.","Qualidade técnica do código.","Quantidade de clientes que o produto consegue atender e quanto pagariam.","Experiência dos fundadores.","Direitos previstos no contrato de investimento.","Motivos para comprar agora e alternativas utilizadas pelos clientes."]},
    {"id":"mercado_acessivel","tipo":"opcao","rotulo":"Com 20 mil fabricantes e gasto de R$ 12 mil por ano, qual é o mercado acessível estimado?","obrigatorio":true,"opcoes":["A. R$ 24 milhões.","B. R$ 240 milhões.","C. R$ 2,4 bilhões.","D. R$ 12 milhões."]},
    {"id":"decisao","tipo":"opcao","rotulo":"Você recomenda investir na Mosaico?","obrigatorio":true,"opcoes":["Sim","Não"]},
    {"id":"justificativa","tipo":"texto","rotulo":"Justifique sua decisão em poucas palavras (até 40 palavras).","obrigatorio":true,"limiteCaracteres":320}
  ]$$::jsonb,
  NULL,
  $${
    "referencias": {"mercado_acessivel": "B. R$ 240 milhões."},
    "feedbackCalculo": {
      "acertou": "Isso! 20 mil × R$ 12 mil = R$ 240 milhões por ano. Esse é o potencial do mercado acessível, não uma previsão de receita da startup.",
      "errou": "Vamos conferir: 20.000 × 12.000 = R$ 240 milhões por ano. Esse valor representa o mercado acessível; a startup ainda precisará conquistar uma parcela dele.",
      "observacao": "Este feedback explica somente o cálculo. Não antecipar a recomendação de investimento."
    },
    "decisaoEsperada": "Sim",
    "recomendacaoEsperada": "Investir.",
    "criterioJustificativa": "Relacionar o mercado acessível acima do mínimo às evidências de necessidade e pagamento, considerando as demais análises aprovadas.",
    "fundamentoCentral": "Mercado acessível de R$ 240 milhões, acima do mínimo de R$ 200 milhões do fundo, com evidências de necessidade e pagamento e demais análises aprovadas.",
    "caixasDeReferencia": ["Quantidade de clientes que o produto consegue atender e quanto pagariam.", "Motivos para comprar agora e alternativas utilizadas pelos clientes."],
    "feedbackDecisao": {
      "simConsistente": "Boa conclusão! O mercado acessível supera o mínimo do fundo, e há evidências de necessidade e disposição para pagar. Como as demais análises já estavam aprovadas, a recomendação é investir.",
      "nao": "Os riscos de conquistar clientes continuam existindo. Neste exercício, porém, o plano de execução já foi aprovado. A pendência era o mercado: ele supera o mínimo e tem evidências de demanda e pagamento, sustentando a recomendação de investir.",
      "simPelaIndicacao": "A recomendação esperada é investir, mas a indicação não é o fundamento. Ela abriu a conversa; o que sustenta a decisão é o mercado acessível acima do mínimo, as evidências de demanda e as demais análises aprovadas.",
      "simPelaPoucaConcorrencia": "Poucos concorrentes não bastam para justificar o investimento. Aqui, a decisão se apoia no mercado acessível e nas evidências de que clientes têm o problema e pagam para resolvê-lo.",
      "receitaGarantida": "O mercado acessível supera o mínimo, mas R$ 240 milhões não são receita garantida da startup. Esse valor representa o universo de vendas possível; a empresa precisa conquistar clientes para capturá-lo."
    },
    "feedbackCaixas": {
      "duas": "Você conectou dimensão e demanda: quanto o mercado pode representar e por que os clientes comprariam a solução.",
      "uma": "Você identificou uma prioridade. Faltava também investigar [opção não selecionada], para conectar tamanho de mercado com demanda real.",
      "nenhuma": "Os pontos selecionados também importam, mas já estavam avaliados. A pendência era dimensionar os clientes atendíveis e entender sua necessidade de compra."
    }
  }$$::jsonb
),
(
  'vc-task-mudar-decisao', 'vc-simplificado', 'vc-cp-6', 'O que faria você mudar de decisão?',
  $$Uma decisão de não investir pode ser revista quando as condições mudam ou surgem novas evidências. Agora, pense no que seria necessário para reabrir as duas oportunidades não aprovadas. Se você recomendou investir em Prisma ou Compasso, responda considerando a recomendação explicada no feedback de cada uma.$$,
  $$[
    {"id":"reconsiderar_prisma","tipo":"texto","rotulo":"Projeto Prisma: considerando a recomendação de não investir nas condições atuais, o que precisaria mudar ou quais novas informações fariam você reconsiderar? Explique como isso afetaria sua análise (até 80 palavras).","obrigatorio":true,"limiteCaracteres":600},
    {"id":"reconsiderar_compasso","tipo":"texto","rotulo":"Projeto Compasso: o que precisaria mudar no comportamento do fundador ou quais evidências você buscaria para reconsiderar o investimento? (até 80 palavras)","obrigatorio":true,"limiteCaracteres":600}
  ]$$::jsonb,
  NULL,
  $${
    "prisma": {
      "caminhosAceitos": [
        "Evidências de conversão e permanência dos clientes que sustentem o crescimento projetado.",
        "Separação correta entre receitas recorrentes e pontuais, acompanhada de projeções revisadas.",
        "Redução do valuation para um preço justificável pelos dados corrigidos."
      ],
      "criterio": "A resposta deve conectar a mudança à decisão. Não é necessário citar todos os caminhos.",
      "feedback": {
        "bemFundamentada": "Boa! Você explicou o que poderia mudar sua conclusão e por quê. A Prisma pode voltar à análise se novas evidências sustentarem o crescimento ou se o preço passar a refletir melhor os resultados comprovados.",
        "generica": "Você apontou uma direção. Agora, seja mais específica: qual evidência de crescimento ou mudança no preço tornaria o investimento justificável? “Crescer mais” sozinho não mostra o que precisamos verificar.",
        "qualquerDesconto": "Um preço menor pode ajudar, mas não basta qualquer desconto. Precisamos verificar se o novo preço é justificável pelos indicadores corrigidos e pelas projeções sustentadas em evidências."
      }
    },
    "compasso": {
      "caminhosAceitos": [
        "Correção do relatório e comunicação da perda do cliente aos investidores.",
        "Acesso às informações necessárias para verificar os dados.",
        "Investigação da saída do cliente e disposição para rever decisões.",
        "Histórico posterior de prestação de contas consistente."
      ],
      "criterio": "Uma promessa isolada, um valuation menor ou a troca do responsável comercial não resolvem, por si só, o problema identificado. Reabrir a análise não significa aprovar automaticamente o investimento.",
      "feedback": {
        "bemFundamentada": "Boa análise! Você buscou ações verificáveis, não apenas uma promessa. Corrigir as informações e demonstrar transparência de forma consistente poderia permitir uma nova análise — ainda seria necessário avaliar se a confiança foi restabelecida.",
        "insuficiente": "Esse ponto pode ajudar, mas precisamos enfrentar o motivo da recusa: a informação incorreta e a resistência em corrigi-la. Que ações concretas permitiriam verificar uma mudança nessa postura?",
        "apenasDescontoOuParticipacao": "Melhorar o preço ou a participação não resolve a falta de transparência. Para reconsiderar, precisaríamos verificar a correção das informações e uma mudança consistente na prestação de contas."
      }
    },
    "avaliacao": "Avaliar separadamente decisão, evidência (fatos da conversa), raciocínio (liga fatos à decisão) e limites (evita conclusões que os dados não permitem). Uma escolha correta com justificativa inadequada deve receber feedback explicando essa diferença."
  }$$::jsonb
)
ON CONFLICT (id) DO NOTHING;
