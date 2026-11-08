# PRD | Diagnóstico de Fit

Galapagos por Elas  •  Versão 1.1 congelada para implementação  •  07/11/2026

Status: baseline funcional congelada. A calibração dos perfis profissionais e a validade do instrumento ainda não foram demonstradas empiricamente.

## 1. Resumo e objetivo

Criar um diagnóstico exploratório de interesses e preferências de trabalho para jovens mulheres que desejam conhecer carreiras no mercado financeiro. A experiência responde: (1) como gosto de pensar e me motivar; (2) como prefiro trabalhar; (3) quais áreas merecem ser exploradas primeiro. Não é teste de personalidade, aptidão, seleção ou previsão de sucesso.

- 15 perguntas obrigatórias, com A, B ou C (ambas igualmente interessantes).

- 12 dimensões bipolares: D1–D6 Perfil e D7–D12 Modo de Trabalho.

- 13 áreas com pontuação relativa de afinidade (0–100), ranking completo e Top 3 em destaque.

- Resultado explicável, reprodutível e versionado; linguagem não excludente.

## 2. Escopo e jornadas

Fluxo: introdução e consentimento informativo → 15 questões (uma por tela ou pequenos blocos) → processamento determinístico → resultados em três abas: Meu Perfil, Meu Modo de Trabalho, Áreas para Explorar. Na aba Áreas, todas as 13 aparecem ordenadas; cada card abre para mostrar afinidades e diferenças em duas colunas (Perfil / Trabalho), mais uma justificativa curta.

Incluído: navegação, indicador de progresso, alteração de respostas antes do envio, armazenamento de versão e respostas, motor de scoring, resultados, textos explicativos e estados de erro. Fora do escopo: cadastro de vagas, trilhas específicas, IA generativa para calcular scores, diagnóstico clínico ou contratação automática.

## 3. Taxonomia das dimensões

| ID | 0 (polo A) | 100 (polo B) | Camada |
| --- | --- | --- | --- |
| D1 | Especialista | Generalista | Perfil |
| D2 | Analítica | Relacional/comercial | Perfil |
| D3 | Aplicada/concreta | Abstrata/conceitual | Perfil |
| D4 | Domínio técnico | Impacto/influência | Perfil |
| D5 | Resultados imediatos | Construção de longo prazo | Perfil |
| D6 | Estruturada | Exploratória | Perfil |
| D7 | Individual | Em equipe | Trabalho |
| D8 | Direcionamento claro | Autonomia | Trabalho |
| D9 | Previsível | Dinâmico | Trabalho |
| D10 | Análise aprofundada | Decisão rápida | Trabalho |
| D11 | Bastidores | Exposição/interação | Trabalho |
| D12 | Pesquisa/planejamento | Execução/implementação | Trabalho |

Cada dimensão expressa preferência relativa, não capacidade. O valor 50 indica interesse equivalente nos polos; não significa desinteresse. Os polos podem coexistir na vida real; o modelo bipolar é uma simplificação do MVP.

## 4. Questionário canônico para implementação

As redações abaixo consolidam a especificação operacional. Como as versões integrais das questões anteriores não estão transcritas neste documento, o texto é uma redação canônica proposta para revisão editorial; IDs, mapeamentos e orientação do scoring estão congelados. A opção C é idêntica em todas: “As duas me interessam igualmente.”

### Q01 · D1

Ao começar um projeto novo, o que mais te anima?

A. Aprofundar um assunto específico até conhecê-lo muito bem.

B. Conhecer diferentes partes do projeto e conectá-las.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q02 · D12

Você vai participar de um projeto importante. Qual etapa mais te interessa?

A. Investigar o problema, definir a estratégia e planejar a solução.

B. Colocar a solução em prática, resolver obstáculos e acompanhar sua implementação.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q03 · D2

As vendas de uma empresa caíram. Por onde você começaria?

A. Analisar números e padrões para entender o que aconteceu.

B. Conversar com pessoas envolvidas para entender necessidades e comportamentos.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q04 · D3

Qual tipo de desafio te atrai mais?

A. Construir um modelo ou explicação conceitual para entender um fenômeno.

B. Resolver um problema concreto com uma solução diretamente aplicável.

C. As duas me interessam igualmente.

Pontuação: A=100, B=0, C=50 (inversão de D3).

### Q05 · D2

Você precisa defender uma recomendação. O que mais te interessa?

A. Construir a análise e as evidências que sustentam a conclusão.

B. Entender os interlocutores e adaptar a comunicação para convencê-los.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q06 · D4

O que te dá mais satisfação em um projeto?

A. Dominar um método ou ferramenta e entregar uma solução tecnicamente excelente.

B. Mobilizar pessoas e influenciar decisões que geram impacto.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q07 · D5

Qual resultado profissional te motiva mais?

A. Ver resultados concretos em um prazo curto.

B. Construir algo cujo impacto apareça e cresça ao longo do tempo.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q08 · D6

Você recebe um desafio sem instruções claras. O que prefere?

A. Organizar etapas e critérios antes de começar.

B. Experimentar caminhos diferentes até descobrir uma direção.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q09 · D6

Surge uma oportunidade inesperada durante um projeto. O que mais te atrai?

A. Avaliar o plano e preservar uma execução bem estruturada.

B. Explorar a nova possibilidade e adaptar o caminho.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q10 · D7

Ao desenvolver uma solução, o que mais te atrai?

A. Ter um espaço individual para aprofundar minhas ideias e construir minha contribuição.

B. Trocar ideias constantemente e desenvolver a solução junto com outras pessoas.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q11 · D11

Em um projeto, qual responsabilidade você preferiria assumir?

A. Preparar análises, materiais e recomendações nos bastidores.

B. Apresentar resultados, defender ideias e interagir com as pessoas envolvidas.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q12 · D8

Ao começar uma tarefa nova, como você prefere trabalhar?

A. Receber objetivos, orientações e etapas bem definidos.

B. Receber o objetivo e ter liberdade para decidir como chegar ao resultado.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q13 · D8

Se aparece uma dificuldade no trabalho, como você prefere avançar?

A. Contar com direcionamento e alinhamentos frequentes para ajustar a rota.

B. Investigar alternativas por conta própria e propor um caminho.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q14 · D9

Qual ambiente profissional parece mais interessante para você?

A. Uma rotina relativamente previsível, com prioridades e prazos organizados.

B. Um ambiente em que as prioridades mudam rapidamente e surgem desafios inesperados.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

### Q15 · D10

Quando precisa tomar uma decisão importante, o que mais te atrai?

A. Ter tempo para aprofundar a análise e comparar diferentes possibilidades.

B. Precisar decidir rapidamente, usando as informações disponíveis naquele momento.

C. As duas me interessam igualmente.

Pontuação: A=0, B=100, C=50.

## 5. Cobertura e agregação

| Dimensão | Perguntas | Nº observações |
| --- | --- | --- |
| D1 | Q01 | 1 |
| D2 | Q03, Q05 | 2 |
| D3 | Q04 | 1 |
| D4 | Q06 | 1 |
| D5 | Q07 | 1 |
| D6 | Q08, Q09 | 2 |
| D7 | Q10 | 1 |
| D8 | Q12, Q13 | 2 |
| D9 | Q14 | 1 |
| D10 | Q15 | 1 |
| D11 | Q11 | 1 |
| D12 | Q02 | 1 |

Para cada dimensão d, U[d] = média aritmética das pontuações orientadas das perguntas vinculadas. Exemplo: D8 com Q12=B (100) e Q13=C (50) resulta U[D8]=75. Não imputar 50 em perguntas ausentes; a submissão exige as 15 respostas.

## 6. Matriz de referência congelada

Cada área tem 12 referências R (0–100) e 12 pesos W (inteiros 1–5). As referências descrevem tendências de trabalho hipotéticas, não critérios de contratação. A matriz abaixo é a fonte de verdade da versão 1.1. D1–D6 foram preservadas da v1.0; D7–D12 refletem a revisão v1.1.

### Perfil D1–D6 · célula R/P

| Área | D1 | D2 | D3 | D4 | D5 | D6 |
| --- | --- | --- | --- | --- | --- | --- |
| Investment Banking | 55/2 | 45/3 | 25/3 | 70/4 | 35/3 | 20/4 |
| Asset Management | 25/4 | 15/5 | 70/4 | 40/3 | 80/5 | 40/4 |
| Wealth Management | 65/2 | 90/5 | 20/3 | 85/5 | 85/4 | 35/3 |
| Equity Research | 15/5 | 15/5 | 70/4 | 40/3 | 75/4 | 25/5 |
| Sales & Trading | 45/3 | 65/4 | 35/3 | 75/4 | 20/4 | 65/4 |
| Quant | 10/5 | 5/5 | 95/5 | 20/4 | 70/3 | 40/4 |
| Crédito e Risco | 35/3 | 15/5 | 55/4 | 40/3 | 75/4 | 15/5 |
| Fintechs | 75/4 | 40/4 | 20/4 | 75/5 | 45/3 | 95/5 |
| Venture Capital | 90/5 | 75/4 | 45/3 | 90/5 | 90/5 | 90/5 |
| Private Equity | 55/4 | 40/5 | 45/4 | 80/5 | 90/5 | 35/4 |
| Corporate Finance | 70/4 | 40/4 | 20/4 | 65/4 | 75/4 | 15/5 |
| Macroeconomia | 35/4 | 15/5 | 90/5 | 40/3 | 90/5 | 55/3 |
| Operações | 65/3 | 40/3 | 10/5 | 65/4 | 30/3 | 10/5 |

### Trabalho D7–D12 · célula R/P

| Área | D7 | D8 | D9 | D10 | D11 | D12 |
| --- | --- | --- | --- | --- | --- | --- |
| Investment Banking | 85/5 | 60/3 | 90/5 | 55/3 | 70/4 | 85/5 |
| Asset Management | 55/3 | 80/4 | 65/4 | 50/4 | 40/2 | 45/3 |
| Wealth Management | 80/4 | 70/3 | 60/3 | 55/3 | 95/5 | 75/4 |
| Equity Research | 50/3 | 80/4 | 55/3 | 30/5 | 55/3 | 35/4 |
| Sales & Trading | 80/4 | 80/4 | 95/5 | 95/5 | 90/5 | 95/5 |
| Quant | 50/3 | 85/4 | 50/2 | 35/4 | 30/2 | 55/3 |
| Crédito e Risco | 60/3 | 65/3 | 45/3 | 35/4 | 45/3 | 55/4 |
| Fintechs | 85/5 | 85/5 | 90/5 | 80/4 | 65/3 | 95/5 |
| Venture Capital | 85/4 | 85/4 | 80/4 | 65/3 | 95/5 | 60/3 |
| Private Equity | 80/5 | 80/4 | 75/4 | 55/4 | 75/4 | 80/4 |
| Corporate Finance | 80/4 | 65/3 | 45/3 | 35/4 | 60/3 | 80/5 |
| Macroeconomia | 50/3 | 85/4 | 60/3 | 30/5 | 55/3 | 25/4 |
| Operações | 85/5 | 55/3 | 65/4 | 65/4 | 50/3 | 95/5 |

## 7. Algoritmo de fit

Similaridade por dimensão: S[j,d] = 100 − |U[d] − R[j,d]|. Fit bruto por área: F[j] = Σ(W[j,d] × S[j,d]) / Σ W[j,d], considerando as 12 dimensões. Arredondar apenas para apresentação (inteiro mais próximo); armazenar score não arredondado. Ordenar decrescente; desempate por identificador estável da área, nunca por aleatoriedade.

Contribuição: C[j,d] = W[j,d] × S[j,d]. Para explicações, priorizar dimensões com peso ≥4 e alta similaridade; para pontos de exploração, peso ≥4 e distância maior. Exibir até três características por camada, sem afirmações de incapacidade. O score NÃO é probabilidade, percentil populacional, aptidão ou previsão de desempenho.

## 8. Requisitos de interface e conteúdo

- Introdução: “Este diagnóstico é exploratório. Não há respostas certas e nenhuma área será descartada.”

- Questões: três opções de resposta, progresso (x/15), voltar e revisar, estado de seleção visível e acessível.

- Resultado 1 — Meu Perfil: seis indicadores bipolares D1–D6, rótulos de ambos os polos e marcador posicionado conforme U[d].

- Resultado 2 — Meu Modo de Trabalho: seis indicadores bipolares D7–D12 e cards compactos de ambientes sugeridos; não inventar percentuais de ambientes sem uma matriz de ambientes separada.

- Resultado 3 — Áreas: ranking completo das 13 áreas, Top 3 visualmente destacado, score relativo de 0 a 100 e cards expansíveis.

- Card expandido: duas colunas (características de Perfil e de Trabalho), explicação “Por que combina?” e diferenças relevantes para explorar.

- Acessibilidade: navegação por teclado, rótulos sem depender de cor, contraste, responsividade mobile-first.

## 9. Modelo de dados e contratos

Question {id, text, dimensionId, options:{A,B,C}, scoring:{A,B,C}, version}. Dimension {id, layer, leftPole, rightPole, questionIds}. CareerProfile {id, name, dimensions:{dimensionId:{reference,weight}}, matrixVersion}. Assessment {id, questionnaireVersion, scoringVersion, matrixVersion, answers:{questionId: A|B|C}, createdAt}. Result {dimensionScores, careerFits:[{careerId, rawScore, displayScore, rank, highlights, differences}]}.

Endpoints sugeridos: GET /assessment/config (perguntas, dimensões, versões); POST /assessment/score (15 respostas e versão) → resultado calculado; GET /assessment/:id (somente para usuário autorizado). A lógica de pontuação deve residir no backend ou em biblioteca compartilhada testada; nunca usar LLM para definir scores.

## 10. Validações e critérios de aceite

- Exatamente 15 respostas válidas; nenhuma dimensão sem observação; Q04 invertida.

- D8 agrega duas respostas; D2 e D6 também agregam duas; demais dimensões têm uma.

- O vetor final contém 12 números entre 0 e 100; 13 scores finitos no mesmo intervalo.

- Com mesmo conjunto de respostas e mesmas versões, o resultado é idêntico.

- Top 3 e ranking completo correspondem ao score bruto, sem arredondamento prévio.

- Alterações de referência exigem nova matrixVersion; resultados históricos preservam versões.

- Todos os cards explicam afinidades e diferenças sem afirmar capacidade, sucesso ou adequação para contratação.

- Testes de borda: todas A, todas B, todas C, mistura e inversão Q04; empates determinísticos.

- Testes de sensibilidade: registrar alterações de Top 3 ao mudar uma resposta, para auditoria posterior.

## 11. Riscos, ética e validação

- Risco: bipolaridade força escolhas onde ambos os interesses podem ser altos; C representa equivalência, não intensidade.

- Risco: nove dimensões são avaliadas por apenas uma questão; não reivindicar confiabilidade psicométrica.

- Risco: “Fintechs” é categoria de organização, enquanto outras linhas são funções; “Operações” e “Quant” também são amplas.

- Risco: pesos e referências são julgamentos de design; revisão conceitual inspirada em O*NET não equivale a extração de dados ocupacionais.

- Antes de decisões reais: revisão editorial com participantes, entrevistas com profissionais de cada área, estudo de estabilidade e análise de vieses.

- Dados pessoais: coletar o mínimo necessário, explicar finalidade, retenção e exclusão; não utilizar resultados como filtro de contratação.

## 12. Referências metodológicas e decisões congeladas

Referência conceitual da Etapa 2: O*NET Content Model — Work Context, Work Activities e Work Styles: https://www.onetcenter.org/content.html. O questionário é autoral e não corresponde ao O*NET Interest Profiler nem a instrumento psicométrico validado. Etapa 1 é taxonomia própria, mantida como acordado.

Congelado: 15 questões (com Q02 para D12), 12 dimensões, 13 áreas, mapeamento de perguntas, regras de orientação, matriz R/P e fórmula. Pendente de revisão editorial: redação exata das perguntas consolidadas aqui. Pendente de validação empírica: pesos, referências, explicações e interpretação dos scores.

