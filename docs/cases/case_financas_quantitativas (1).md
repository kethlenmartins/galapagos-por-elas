# Guia da área — Finanças Quantitativas (Quant Finance)

## O que a área faz?

**Finanças Quantitativas (Quant Finance)** Aplica matemática, estatística, programação e métodos computacionais para modelar preços, riscos e estratégias financeiras. O trabalho pode envolver pesquisa de sinais, precificação de derivativos, execução sistemática ou modelos de risco.

**NA PRÁTICA**  
Uma equipe testa uma estratégia de negociação com dados históricos, desconta custos e verifica se o resultado continua consistente em períodos não usados na construção do modelo.

---

## Quais são as áreas e funções mais comuns?

**Pesquisa quantitativa**  
Formula hipóteses e testa modelos e estratégias com dados.

**Desenvolvimento quantitativo**  
Constrói sistemas, pipelines e bibliotecas para pesquisa e produção.

**Trading sistemático**  
Implementa e monitora decisões de negociação baseadas em regras.

**Precificação de derivativos**  
Modela preços e sensibilidades de instrumentos complexos.

**Modelagem de risco**  
Estima exposições, perdas e cenários extremos.

As equipes e os nomes dos cargos variam conforme a instituição e seu porte.

---

## Quais conteúdos são importantes para entender a área?

**Dados e qualidade**  
Evitar vazamento temporal, viés de sobrevivência e inconsistências.

**Hipóteses e validação**  
Separar treino, validação e teste e comparar com benchmarks simples.

**Overfitting**  
Uma estratégia que parece ótima no passado pode não generalizar.

**Custos de negociação**  
Corretagem, spread, slippage e giro podem eliminar o retorno.

**Modelos estocásticos**  
Probabilidade, séries temporais e simulação descrevem incertezas.

**Risco e implementação**  
Controlar perdas, latência, falhas de dados e comportamento fora da amostra.

---

## Quais são as skills necessárias?

**Programação**  
Python, SQL e, em certas funções, C++ para análise e sistemas eficientes.

**Estatística e probabilidade**  
Inferência, testes, distribuições e estimação.

**Álgebra linear e cálculo**  
Bases de otimização, modelos de fatores e derivativos.

**Experimentação rigorosa**  
Backtests reproduzíveis e prevenção de vieses.

**Comunicação técnica**  
Explicar premissas, limites e evidências de um modelo.

---

## Métricas e indicadores importantes

**Retorno anualizado**  
Retorno composto expresso em base anual; depende da frequência observada.

**Volatilidade anualizada**  
Desvio-padrão dos retornos ajustado à frequência sob hipóteses adequadas.

**Sharpe**  
Retorno excedente médio dividido pela volatilidade do retorno excedente.

**Drawdown máximo**  
Maior perda percentual entre pico e vale.

**Hit rate**  
Proporção de operações com resultado positivo; não determina sozinho a rentabilidade.

**Turnover**  
Intensidade de negociação ou renovação da carteira.

**Slippage**  
Diferença entre preço esperado e preço efetivo de execução.

**Erro fora da amostra**  
Desempenho do modelo em dados não usados para ajustá-lo.

---

## Termos comuns na área

**Backtest**  
Simulação histórica de uma regra de investimento.

**Out-of-sample**  
Amostra reservada para avaliar generalização.

**Look-ahead bias**  
Uso indevido de informação que ainda não existia na data da decisão.

**Survivorship bias**  
Exclusão de ativos que desapareceram do universo histórico.

**Overfitting**  
Ajuste excessivo a ruídos da amostra.

**Walk-forward**  
Validação em janelas temporais sucessivas.

**Factor**  
Variável sistemática associada a retorno ou risco.

**Monte Carlo**  
Simulação de muitos cenários possíveis a partir de um modelo probabilístico.

---

# Banco de 50 perguntas de entrevista

As perguntas são exemplos para preparação de entrevistas de estágio e posições de entrada. Incluem fundamentos, raciocínio aplicado e situações comportamentais; não são perguntas atribuídas a empregadores específicos.

### Fundamentos e carreira

1. O que faz uma pesquisadora quantitativa?
2. Qual a diferença entre quant researcher e quant developer?
3. O que é uma estratégia sistemática?
4. Como matemática e programação se combinam em quant finance?
5. Quais dados são comuns em pesquisa quantitativa?
6. O que diferencia previsão de preço de decisão de trading?
7. Por que modelos simples devem ser benchmarks?
8. O que é hipótese nula em um experimento?
9. O que significa um modelo ser interpretável?
10. Que riscos existem ao automatizar decisões financeiras?

### Probabilidade e estatística

11. Qual a diferença entre média e mediana?
12. O que é variância e como se relaciona ao desvio-padrão?
13. O que é correlação e por que não implica causalidade?
14. Explique o teorema de Bayes com um exemplo.
15. O que é valor esperado de uma variável aleatória?
16. Qual a diferença entre amostragem com e sem reposição?
17. O que é um intervalo de confiança?
18. O que é um p-valor e o que ele não significa?
19. Como identificaria uma série temporal não estacionária?
20. O que é autocorrelação em retornos?

### Programação e modelagem

21. Como trataria valores ausentes em uma série de preços?
22. Por que ordenar eventos por tempo antes de testar um modelo?
23. Como evitar vazamento de dados entre treino e teste?
24. Como calcular retornos simples e logarítmicos?
25. Como implementaria uma média móvel em Python?
26. Como avaliaria a complexidade de um algoritmo de backtest?
27. Quando usaria vetorização em vez de loops?
28. Como garantiria reprodutibilidade de um experimento?
29. O que é regularização em modelos preditivos?
30. Como compararia regressão linear e árvore de decisão?

### Backtest e risco

31. O que é overfitting e como identificá-lo?
32. O que é look-ahead bias?
33. O que é survivorship bias?
34. Por que custos de transação precisam entrar no backtest?
35. O que é slippage?
36. Como calcular o Sharpe de uma estratégia?
37. O que significa um drawdown de 20%?
38. Como faria uma validação walk-forward?
39. Por que hit rate alto não garante lucro?
40. Como avaliaria uma estratégia que só funciona em um regime de mercado?

### Casos e comportamento

41. Uma estratégia perde rentabilidade após custos: o que recomendaria?
42. Seu modelo melhora no treino e piora no teste: qual hipótese investigaria?
43. Uma variável tem alta correlação com retornos futuros: o que checaria?
44. O backtest muda após correção de dados: como documentaria?
45. Como explicaria um modelo complexo a uma gestora não técnica?
46. Como priorizaria robustez versus performance?
47. Conte uma ocasião em que depurou um erro difícil.
48. Como reagiria a uma hipótese sua rejeitada pelos dados?
49. Que testes faria antes de colocar uma estratégia em produção?
50. Por que você quer atuar em finanças quantitativas?

---

# Simulação prática — Case interativo

# Case de Finanças Quantitativas

## Documento para implementação na plataforma

**Público:** universitárias iniciantes em finanças quantitativas.  
**Formato:** jogo para celular, com cinco etapas.  
**Duração estimada:** 15–20 minutos.  
**Papel da participante:** analista quantitativa júnior de uma equipe de estratégias sistemáticas.

Todos os nomes, instituições, números e situações são fictícios. Os exercícios simplificam decisões profissionais para fins educacionais.

---

## Orientações gerais de implementação

- Experiência mobile-first, com **uma interação por tela** e diálogos exibidos progressivamente pelo botão **Continuar**.
- Em cada situação: apresentar contexto; solicitar **exatamente duas de seis caixas de atenção**; revelar fatos por conversa ou documento; pedir decisão binária e justificativa de **até 40 palavras**; só então mostrar feedback da decisão, da justificativa e das caixas.
- As caixas selecionadas **não alteram os fatos** revelados. Não corrigir escolhas nem antecipar a recomendação antes da decisão.
- Os números apresentados como verificados devem ser tratados como verdadeiros no exercício; projeções, promessas e hipóteses não são fatos verificados.
- Gabaritos, critérios de avaliação e feedbacks são **exclusivos da implementação**. Não revelar quantas decisões positivas são esperadas.
- Linguagem acessível e acolhedora, sem infantilizar a participante. Não exigir conhecimento técnico externo ao conteúdo apresentado.
- Salvar: caixas escolhidas, decisão, justificativa, resposta de cálculo (quando houver) e respostas da reflexão final.

---

# Etapa 1 — Seu primeiro laboratório quant

Você integra a equipe **Nexo Quant**, que testa estratégias com dados e modelos antes de colocá-las em produção.

Sua gestora apresenta três verificações independentes. Os aspectos não mencionados já foram aprovados; você deve decidir com base nas evidências de cada teste.

> “Um resultado numérico pode parecer convincente e ainda estar errado. Nosso trabalho é distinguir sinal, vazamento de informação e risco de modelo.”

**Botão:** Começar a primeira análise.

---
# Etapa 2 — O backtest impressionante

## Tela 1 — O contexto

Uma estratégia de ações mostrou **24% de retorno anualizado** em uma simulação histórica. Custos e regras operacionais já foram revisados. Falta verificar se o teste usou apenas informações disponíveis no momento de cada decisão.

## Tela 2 — Escolha duas caixas de atenção

> Quais dois pontos você priorizaria para concluir esta análise?

- ☐ **Momento em que os dados estavam disponíveis**
- ☐ **Uso de informação futura na seleção**
- ☐ **Cor do gráfico de retorno**
- ☐ **Nome do servidor de execução**
- ☐ **Quantidade de slides da apresentação**
- ☐ **Marca do notebook de pesquisa**

**Implementação:** exigir exatamente duas escolhas. Não corrigir agora.

## Tela 3 — A construção da amostra

**Você:** “Como foram escolhidas as ações testadas em 2021?”

**Pesquisadora:** “Pegamos a lista das empresas que continuavam no índice no fim de 2025 e voltamos no tempo. Empresas que saíram do índice ficaram fora do teste.”

## Tela 4 — O efeito

**Você:** “Essa lista existia em 2021?”

**Pesquisadora:** “Não. Ela inclui informação sobre quem sobreviveu até 2025. Ainda não refizemos o teste com a composição histórica do índice.”

## Tela 5 — Sua decisão

> Você recomenda liberar a estratégia para produção com base nesse backtest?

**Sim / Não**

> Justifique com base nos fatos apresentados.

**Limite:** 40 palavras.

## Feedback — exibir somente após decisão e justificativa

### Referência de correção (interna)

**Recomendação esperada: não liberar.**

A seleção retrospectiva de sobreviventes usa informação futura (viés de sobrevivência). É preciso reconstruir o universo elegível em cada data e repetir o teste antes de confiar no resultado.

### Se acertar com justificativa consistente

> Boa identificação. O universo de ativos foi escolhido com conhecimento do futuro, o que compromete a validade do backtest.

### Se escolher a outra decisão

> O retorno de 24% não basta: a amostra excluiu retrospectivamente empresas que saíram do índice. É necessário refazer o teste.

### Se acertar com justificativa genérica ou inadequada

> Não basta dizer que “o retorno parece alto”. Explique por que a lista de empresas de 2025 não poderia orientar decisões em 2021.

### Feedback das caixas

**Prioridades de referência:** Momento em que os dados estavam disponíveis; Uso de informação futura na seleção.

**Se escolher ambas:** Você priorizou as duas informações necessárias para concluir a pendência desta análise.

**Se escolher uma:** Você identificou uma prioridade. A outra era **[inserir opção correta não selecionada]**, importante para sustentar a decisão.

**Se não escolher nenhuma:** Os temas selecionados podem ser relevantes na profissão, mas já estavam resolvidos neste exercício. A pendência era investigar **momento em que os dados estavam disponíveis** e **uso de informação futura na seleção**.

**Botão:** Avançar para a próxima situação.

---
# Etapa 3 — O modelo de previsão

## Tela 1 — O contexto

A equipe desenvolveu um modelo para prever o retorno do dia seguinte. A métrica de erro no treinamento é baixa. Falta validar se o resultado se sustenta em dados que não foram usados no ajuste do modelo.

## Tela 2 — Escolha duas caixas de atenção

> Quais dois pontos você priorizaria para concluir esta análise?

- ☐ **Separação temporal entre treino e teste**
- ☐ **Desempenho fora da amostra**
- ☐ **Quantidade de ícones do dashboard**
- ☐ **Nome da biblioteca de visualização**
- ☐ **Marca da nuvem contratada**
- ☐ **Tamanho da sala da equipe**

**Implementação:** exigir exatamente duas escolhas. Não corrigir agora.

## Tela 3 — A divisão dos dados

**Você:** “Como vocês separaram treino e teste?”

**Pesquisador:** “Misturamos aleatoriamente todas as observações diárias de 2022 a 2025. Algumas datas posteriores ficaram no treino e anteriores no teste.”

## Tela 4 — O experimento

**Você:** “Já testamos um período inteiramente posterior ao treinamento?”

**Pesquisador:** “Não. Ainda não fizemos uma avaliação cronológica, com treinamento no passado e teste no futuro. O desempenho reportado é só da divisão aleatória.”

## Tela 5 — Sua decisão

> Você recomenda considerar o desempenho apresentado suficiente para aprovar o modelo?

**Sim / Não**

> Justifique com base nos fatos apresentados.

**Limite:** 40 palavras.

## Feedback — exibir somente após decisão e justificativa

### Referência de correção (interna)

**Recomendação esperada: não considerar suficiente.**

A avaliação precisa respeitar a ordem temporal e simular previsão de dados futuros. A divisão aleatória pode produzir estimativa otimista em séries dependentes e não substitui teste temporal fora da amostra.

### Se acertar com justificativa consistente

> Isso. Um modelo de previsão deve ser avaliado em períodos posteriores ao treino, preservando a sequência temporal.

### Se escolher a outra decisão

> O erro baixo não demonstra generalização futura: falta um teste cronológico fora da amostra.

### Se acertar com justificativa genérica ou inadequada

> Explique qual validação está faltando: treinar em datas anteriores e testar em datas posteriores, sem ajustar o modelo ao teste.

### Feedback das caixas

**Prioridades de referência:** Separação temporal entre treino e teste; Desempenho fora da amostra.

**Se escolher ambas:** Você priorizou as duas informações necessárias para concluir a pendência desta análise.

**Se escolher uma:** Você identificou uma prioridade. A outra era **[inserir opção correta não selecionada]**, importante para sustentar a decisão.

**Se não escolher nenhuma:** Os temas selecionados podem ser relevantes na profissão, mas já estavam resolvidos neste exercício. A pendência era investigar **separação temporal entre treino e teste** e **desempenho fora da amostra**.

**Botão:** Avançar para a próxima situação.

---
# Etapa 4 — O risco escondido na média

## Tela 1 — O contexto

Uma estratégia sistemática foi avaliada em **100 dias**. O retorno médio foi positivo, mas a gestora quer verificar o risco de perdas extremas antes de aprová-la.

**Regra simplificada do exercício:** a estratégia só pode ser aprovada se a perda do pior dia observado não ultrapassar **R$ 50 mil** em uma carteira de R$ 1 milhão. Os demais testes estão aprovados.

## Tela 2 — Escolha duas caixas de atenção

> Quais dois pontos você priorizaria para concluir esta análise?

- ☐ **Magnitude da pior perda observada**
- ☐ **Limite de perda definido para a estratégia**
- ☐ **Cor da curva de patrimônio**
- ☐ **Nome do índice de ações mais famoso**
- ☐ **Número de pessoas na equipe**
- ☐ **Versão do sistema operacional**

**Implementação:** exigir exatamente duas escolhas. Não corrigir agora.

## Tela 3 — A distribuição

**Você:** “Qual foi a pior perda em um único dia?”

**Pesquisadora:** “R$ 80 mil. Em outros dias tivemos ganhos que deixaram a média positiva.”

## Tela 4 — A regra

**Você:** “A média positiva permite exceção?”

**Gestora:** “Não. O limite é para o pior dia observado. O comitê ainda não autorizou revisão da regra.”

## Tela 5 — Verifique o número

Qual foi a perda percentual no pior dia? **Perda percentual = perda em R$ ÷ valor da carteira × 100.**

- A. 0,8%
- B. 5%
- C. 8%
- D. 80%

**Gabarito (não exibir):** C. 8%

**Se acertar:** R$ 80 mil ÷ R$ 1 milhão = 8%.

**Se errar:** Divida R$ 80.000 por R$ 1.000.000 e multiplique por 100: 8%.

**Implementação:** explicar somente o cálculo; não antecipar a decisão.

## Tela 6 — Sua decisão

> Você recomenda aprovar a estratégia nas condições atuais?

**Sim / Não**

> Justifique com base nos fatos apresentados.

**Limite:** 40 palavras.

## Feedback — exibir somente após decisão e justificativa

### Referência de correção (interna)

**Recomendação esperada: não aprovar.**

A pior perda foi de 8% da carteira, acima do limite de 5% (R$ 50 mil). Média positiva não compensa violação de limite de perda extrema.

### Se acertar com justificativa consistente

> Correto. A pior perda observada foi R$ 80 mil, enquanto o limite é R$ 50 mil. O retorno médio não elimina essa violação.

### Se escolher a outra decisão

> A média positiva não basta. O pior dia perdeu R$ 80 mil, ultrapassando o teto estabelecido.

### Se acertar com justificativa genérica ou inadequada

> A justificativa precisa comparar a pior perda com o limite; volatilidade e média são conceitos diferentes.

### Feedback das caixas

**Prioridades de referência:** Magnitude da pior perda observada; Limite de perda definido para a estratégia.

**Se escolher ambas:** Você priorizou as duas informações necessárias para concluir a pendência desta análise.

**Se escolher uma:** Você identificou uma prioridade. A outra era **[inserir opção correta não selecionada]**, importante para sustentar a decisão.

**Se não escolher nenhuma:** Os temas selecionados podem ser relevantes na profissão, mas já estavam resolvidos neste exercício. A pendência era investigar **magnitude da pior perda observada** e **limite de perda definido para a estratégia**.

**Botão:** Avançar para a próxima situação.

---
# Etapa 5 — O que faria você mudar de decisão?

> Uma boa recomendação pode mudar quando surgem novas evidências ou quando as condições são revistas. Para cada situação abaixo, explique qual informação concreta justificaria reabrir a análise.

## Pergunta aberta 1 — Backtest

> O que precisaria ser refeito para tornar o backtest confiável?

**Limite:** 80 palavras.

**Referência interna:** Aceitar reconstrução do universo histórico de ações por data, incluindo ativos que saíram do índice, e repetição do teste sem conhecimento futuro.

**Feedback para resposta fundamentada:** Você indicou uma correção concreta no processo de simulação.

**Feedback para resposta genérica:** Qual informação do futuro deve ser retirada do teste?

## Pergunta aberta 2 — Modelo de previsão

> Que experimento ajudaria a verificar se o modelo generaliza?

**Limite:** 80 palavras.

**Referência interna:** Aceitar divisão temporal, janela futura não usada no ajuste, comparação com baseline e prevenção de vazamento temporal.

**Feedback para resposta fundamentada:** Você descreveu uma validação fora da amostra.

**Feedback para resposta genérica:** Como separar datas de treino e teste para simular uma previsão real?

---

# Guia de avaliação e conferência (exclusivo da implementação)

| Situação | Recomendação | Fundamento |
|---|---|---|
| Backtest | Não liberar | Viés de sobrevivência e informação futura |
| Previsão | Não aprovar validação | Falta teste cronológico fora da amostra |
| Risco | Não aprovar | Perda extrema de 8% supera limite de 5% |

## Rubrica comum

Avaliar separadamente: **decisão** (alinhamento ao contexto), **evidência** (uso de fatos fornecidos), **raciocínio** (relação entre fatos e recomendação) e **limites** (não extrapolar dados). Uma decisão correta com argumento fraco não recebe feedback de acerto pleno. Priorizar a falha mais importante; não exibir vários feedbacks contraditórios.

**Critérios operacionais:** respostas equivalentes em linguagem natural são válidas; não exigir palavras-chave literais. Em respostas abertas, aceitar caminhos alternativos desde que coerentes com o problema e verificáveis. Nunca avaliar identidade, estilo de escrita ou perfil pessoal.
