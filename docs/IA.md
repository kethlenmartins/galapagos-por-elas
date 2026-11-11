# Onde a IA é usada — Galapagos por Elas

> Mapa único dos usos de IA na plataforma. Os outros documentos apontam para cá. Vale para o MVP (um case semanal para testes).
>
> **Provedor decidido: API da Groq.** Modelo e teto de gasto são configurados no backend; a chave nunca chega ao navegador.

## Visão rápida

| # | Uso | Quem vê | Tela(s) | Entrada da IA | Saída da IA | Decisão final |
|---|---|---|---|---|---|---|
| 1 | **Geração de cases** | Equipe (admin) | Lista de cases, Editor de case com IA | Briefing da equipe (texto) | Rascunho de contexto, checkpoints, tarefas, dados, gabarito | **Equipe** revisa e publica |
| 2 | **Correção** | Equipe e participante | Fila de correção, Resultado do case | Resposta da participante + gabarito | Nota sugerida e feedback | **Equipe** aprova antes de publicar |

Decisão de 07/11/2026 (ver `PRD_Cases_Trilha.md`): entram **quatro usos** nos cases: geração de cases, avaliação (numérica e qualitativa), perguntas do comitê e mentora em chat livre. Os dois últimos são novos e estão descritos abaixo.

Regra geral: **a IA sugere, nunca decide sozinha** sobre nota, publicação ou certificado.

## Convenção visual: o selo "IA"

Em toda tela onde a IA participa, mostrar um **selo "IA"** discreto (ícone de brilho, pílula rosa clara com texto `--pink-600`) com uma dica ao tocar: "Gerado com apoio de IA e revisado pela equipe" (ou "...sugerido pela IA, aguardando revisão" no admin). Assim fica fácil ver onde ela atua, para a equipe e para as participantes. Detalhes visuais em `PRD-TELAS-IA.md`.

---

## O diagnóstico de fit não usa IA

O diagnóstico (`PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md`) é **determinístico**: 15 perguntas fixas com A, B ou C, pontuação por regras e resultado reprodutível e versionado. O PRD dele proíbe usar IA para calcular scores, e as justificativas dos cards também saem de regras (contribuições por dimensão), não de um modelo.

A **Galá** é só a moldura visual da tela: mostra as perguntas em balões e as falas pré-escritas. Não há selo "IA", chamada a modelo, fallback nem custo de IA no diagnóstico.

Isso também elimina, para o diagnóstico, os riscos de prompt injection, de texto inventado e de dados pessoais indo a um provedor de IA.

---

## 2. Geração de cases (admin)

### Ideia
A equipe descreve o que quer e a IA devolve um **rascunho completo** que a equipe edita. É por isso que as telas de admin fazem parte do MVP.

### Fluxo
1. Admin abre **Novo case** e preenche um **briefing**: área, nível de dificuldade, tema, número de checkpoints e tarefas, tipo de dados (ex.: demonstrações financeiras fictícias).
2. Clica em **Gerar rascunho com IA** (estado de carregando).
3. A IA devolve, em campos separados e editáveis:
   - Contexto do caso (história e empresa fictícia)
   - Checkpoints e tarefas, com pontos
   - **Dados de apoio** (tabelas fictícias coerentes)
   - **Gabarito** das respostas quantitativas, com a conta passo a passo e tolerância sugerida
   - Conteúdos de apoio sugeridos
4. A equipe **revisa tudo**, edita, pode **regenerar uma seção** isolada e confere o gabarito.
5. **Aprovar** exige marcar a revisão do gabarito. Só então é possível **Agendar publicação** (segunda a sexta).

### Regras
- **A IA nunca publica.** O status do rascunho gerado é “Rascunho (IA)” até alguém aprovar.
- O gabarito gerado é **verificado por recálculo** no servidor (a conta do gabarito é refeita por código, não só confiada à IA) e sinalizado se houver divergência.
- Dados 100% fictícios. Nada de empresas reais com números inventados.
- Guardar briefing, saída e versão do prompt.

### Telas
Lista de cases e Editor de case com IA (seção abaixo e em `PRD-TELAS-IA.md`).

---

## 3. Correção

### Ideia
Respostas **quantitativas** são corrigidas com apoio da IA e revisadas pela equipe antes de a participante ver.

### Fluxo
1. A participante envia a entrega.
2. O servidor corrige **primeiro por código**: compara números ao gabarito com a tolerância definida.
3. A **IA entra para**: interpretar respostas fora do formato esperado (unidade, arredondamento, vírgula e ponto), reconhecer **raciocínio parcialmente correto** e escrever o **feedback** por tarefa (pontos fortes e a melhorar).
4. O resultado vai para a **Fila de correção** como “Nota sugerida pela IA”, com a comparação lado a lado.
5. A equipe **aprova ou ajusta**. Em lote, **Publicar resultados** (fim de semana).
6. A participante vê nota, feedback e pontos.

### Regras
- **Nota nunca sai direto da IA para a participante**: sempre passa pela aprovação da equipe.
- A conta exata é do código. A IA só **interpreta e explica**.
- Cada correção guarda: resposta, gabarito, saída da IA, versão do prompt, nota final e quem aprovou.
- **Recurso:** a participante pode pedir revisão do resultado.
- **Decidido:** a parte qualitativa também é sugerida pela IA (nota de 1 a 4 por critério e feedback), **sempre revisada e aprovada pela equipe** antes de publicar. A avaliação roda no fim de semana, junto da publicação dos resultados.

---

## 4. Perguntas do comitê (novo)

Na defesa final do case, cada membro do comitê (personagem do case) faz **uma pergunta curta** (até 30 palavras) a partir da apresentação e das respostas anteriores da participante. Se a IA falhar ou demorar, usa a **pergunta-base fixa** do case: a defesa nunca trava. As perguntas e as respostas entram na avaliação. Recebe só o texto da defesa, **sem** nome, faculdade, cidade nem outros dados pessoais.

## 5. Mentora em chat livre (novo)

Uma gaveta de conversa disponível dentro do case, com **campo de texto livre**. **Ela só responde dúvidas relacionadas ao mercado financeiro** (conceitos, áreas, carreira no mercado) e dá dicas por capítulo. Sobre qualquer outro assunto, recusa com educação e convida a voltar ao tema. Regras:

- **Nunca entrega a resposta** de uma tarefa avaliada; ajuda com perguntas que levem a pessoa a pensar.
- **Não inventa** datas, salários, requisitos nem informações do processo seletivo; remete às fontes oficiais.
- **Fora do escopo, não responde:** temas que não são de mercado financeiro (política, saúde, tarefas de outras matérias, conversa pessoal) recebem uma recusa curta e gentil. O escopo é reforçado no prompt **e** conferido por uma checagem de tema na entrada, para não depender só do modelo.
- Respostas curtas, em português do Brasil, sem emoji, sem jargão sem explicar.
- Recebe só o contexto necessário (qual etapa do case, o nível dela), **nunca** o gabarito nem a rubrica.
- **Riscos do texto livre:** prompt injection, conversa fora do tema, dados pessoais digitados e custo. Exige **limite de uso por usuária e por dia, teto de gasto, moderação da entrada e da saída, registro das conversas e aviso de que ela fala com uma IA**.
- Fallback: se a IA estiver indisponível, mostra uma mensagem simples e as dicas fixas de cada capítulo.

## Arquitetura e segurança (válido para os 4 usos)

- As chamadas à IA acontecem **só no servidor**. A chave nunca vai ao navegador.
- **Limite de uso** por usuária e por rota, e **teto de gasto** no provedor.
- Saídas da IA em **formato estruturado (JSON)** e validadas antes de uso.
- **Log de auditoria** de cada chamada: entrada, saída, versão do prompt, custo e latência.
- **Gabarito** só no servidor, nunca enviado ao front.
- **Fallback** definido para cada uso (ver acima).
- A OpenAI recebe o mínimo de dados pessoais (idealmente nenhum identificável): respostas de case e briefings vão com o id da entrega, nunca com nome, e-mail ou outros dados da participante.
- A chave da API fica só em variável de ambiente do servidor, com **teto de gasto** configurado na conta e limite de uso por usuária.
- Saída estruturada (JSON com esquema) e validada no servidor; se inválida, usa o fallback.
- Antes de ir ao ar, confirmar nos termos vigentes da API a retenção e o uso dos dados enviados, e refletir isso na Política de privacidade (os dados saem do nosso servidor para a Groq).
- O modelo é configurável (não fixo no código), e cada chamada registra o modelo e a versão do prompt usados.

## Métricas de IA

| Uso | Métrica | Meta inicial **[SUPOSIÇÃO]** |
|---|---|---|

| Geração de cases | Tempo para o primeiro rascunho aprovado | A medir |
| Geração de cases | % do rascunho mantido pela equipe | A medir |
| Correção | Concordância IA × equipe | ≥ 90% |
| Correção | Notas ajustadas pela equipe | A medir |
| Geral | Custo de IA por participante | A medir |

## Perguntas em aberto

1. Qual modelo da API da Groq (custo, qualidade em cálculo e em português, latência) e qual o teto de gasto mensal?
2. Mentora em chat livre: quais limites de uso por usuária e por dia, e quem faz a moderação?
3. Quem revisa e aprova cases e notas (quantas pessoas na equipe)?
