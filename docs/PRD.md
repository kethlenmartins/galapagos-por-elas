# PRD — Galapagos por Elas

> Status: rascunho v0.1 · Base: README.md · Itens marcados com **[SUPOSIÇÃO]** ou **[EM ABERTO]** precisam de decisão do time.

## 1. Visão geral

Plataforma web responsiva (desktop e mobile) que ajuda meninas e mulheres a entrar no mercado financeiro por três caminhos combinados:

1. **Autoconhecimento**: descobrir quais áreas têm mais afinidade com o jeito de pensar e de trabalhar dela.
2. **Conhecimento das áreas**: entender o que cada área do mercado financeiro faz.
3. **Prática**: resolver cases semanais e individuais, com avaliação e certificado oficial.

Toda a jornada é gamificada.

## 2. Problema e oportunidade

Quem quer entrar no mercado financeiro costuma ter dois bloqueios:

- Não sabe quais áreas existem nem qual combina com ela.
- Não tem como testar o trabalho de cada área na prática antes de escolher.

A plataforma resolve os dois: o diagnóstico indica o caminho e os cases permitem testá-lo.

## 3. Público-alvo

Meninas e mulheres que **já querem** entrar no mercado financeiro. Podem conhecer ou não as áreas, e querem conhecimento prático para testá-las.

**[EM ABERTO]** Faixa etária mínima (menores de idade exigem consentimento e LGPD específica), nível de escolaridade esperado e se há parceria com escolas, universidades ou ONGs.

## 4. Objetivos e métricas de sucesso

| Objetivo | Métrica | Meta inicial **[SUPOSIÇÃO]** |
|---|---|---|
| Ativação | % de cadastradas que concluem o diagnóstico | ≥ 70% |
| Engajamento | % de ativas que iniciam o case da semana | ≥ 50% |
| Conclusão | % que terminam o case iniciado | ≥ 40% |
| Retenção | Participantes que fazem 3 cases consecutivos | ≥ 25% |
| Valor percebido | NPS ao final do case | ≥ 50 |
| Qualidade da correção | Concordância entre correção por IA e revisão humana (amostra) | ≥ 90% |

## 4.1 Fora do escopo (v1)

- App nativo (iOS/Android). O escopo é web responsivo.
- Mentoria ao vivo, chat entre participantes e vagas de emprego.
- Pagamento ou assinatura. **[EM ABERTO]** confirmar se a plataforma é gratuita.

## 5. Jornada da usuária

```
Cadastro/Login → Diagnóstico de fit → Mapa de Carreira → Case da semana
      → Conteúdos de apoio → Entrega (seg–sex) → Avaliação (fim de semana)
      → Resultado → Certificado → Próximo case
                 (pontos, níveis e badges em todas as etapas)
```

## 6. Requisitos funcionais

### RF1 — Cadastro e login
- Cadastro com e-mail e senha. **[SUPOSIÇÃO]** Login social (Google) como opcional.
- Recuperação de senha e verificação de e-mail.
- Aceite de termos de uso e política de privacidade (LGPD).
- Perfil básico: nome, data de nascimento, cidade/estado, escolaridade, objetivo.

### RF2 — Diagnóstico de fit
> **Especificação completa:** `PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md` (baseline congelada). O que está abaixo é só o resumo.

- 15 perguntas obrigatórias, cada uma com **A, B ou C** ("as duas me interessam igualmente"), 12 dimensões bipolares (D1–D6 Perfil, D7–D12 Modo de Trabalho) e 13 áreas.
- O cálculo é **determinístico e versionado**: mesmas respostas e mesmas versões dão o mesmo resultado. **Não usa IA.** Cada resultado guarda as versões do questionário, do scoring e da matriz.
- Resultado "Seu Mapa de Carreira" em três abas: **Perfil**, **Trabalho** e **Áreas** (as 13, em ordem, com a afinidade em **porcentagem** e o Top 3 em destaque). Cada área abre para mostrar afinidades e diferenças e "Por que combina?".
- O score é **afinidade relativa**, não probabilidade, aptidão nem previsão de desempenho. O ranking é sensível: trocar uma única resposta muda o Top 3 em cerca de 3 de cada 4 casos (auditoria em `front/src/services/fit/sensibilidade.ts`).
- Pode alterar as respostas até o envio, salvar e continuar depois e refazer (o resultado anterior fica no histórico; os pontos são dados uma vez). **[EM ABERTO]** limite de tentativas.
- O resultado direciona recomendações de cases e conteúdos.
- Pendente (PRD do diagnóstico, seção 12): revisão editorial do texto das perguntas e validação empírica de pesos, referências e explicações.

### RF3 — Case semanal
> **Em revisão:** a direção do time mudou para **cases como trilha** (ver `PRD_Cases_Trilha.md`). Este requisito vale até esse documento ser aprovado.

- A organização libera um case toda **segunda-feira**. Fica aberto até **sexta-feira**.
- Cada case tem contexto, checkpoints e tarefas.
- A participante salva progresso (rascunho) e envia a entrega final até sexta.
- Após o prazo, não há mais envio. **[EM ABERTO]** definir se haverá prorrogação.
- No **fim de semana** a avaliação é feita e o resultado é publicado. **[EM ABERTO]** dia e horário de publicação (sugestão: segunda de manhã, junto ao novo case).
- Cases anteriores ficam disponíveis para consulta. **[EM ABERTO]** podem ser feitos fora da semana?

### RF4 — Conteúdos aprofundados
> **Em revisão:** a direção do time mudou para **cases como trilha** (ver `PRD_Cases_Trilha.md`). Este requisito vale até esse documento ser aprovado.

- Durante o case, conteúdos de apoio ligados às tarefas (artigos, vídeos, glossário).
- Formatos suportados na v1: texto, vídeo (embed) e link externo. **[SUPOSIÇÃO]**
- Conteúdos aparecem dentro do case e também numa biblioteca por área.

### RF5 — Avaliação e correção
- **Parte quantitativa** (números, cálculos): corrigida por IA com gabarito e tolerância definidos pela equipe.
- **Parte qualitativa** (texto, justificativas): **[EM ABERTO]** corrigida por equipe, por IA ou por ambas.
- A equipe pode revisar e ajustar qualquer nota antes da publicação.
- Resultado inclui nota, feedback por tarefa e pontos fortes/pontos a melhorar.

### RF6 — Certificado oficial
> **Em revisão:** a direção do time mudou para **cases como trilha** (ver `PRD_Cases_Trilha.md`). Este requisito vale até esse documento ser aprovado.

- Emitido a quem **termina o case** (**[EM ABERTO]** com nota mínima ou apenas entrega).
- PDF com nome, case, data e código de verificação.
- Página pública de validação por código.
- **[EM ABERTO]** Quem assina/emite (Galapagos? parceiro?) e modelo visual oficial.

### RF7 — Gamificação
> **Decisão:** a v1 começa só com **pontos** (saldo, extrato e nível por barra de progresso). Avatar, mascote, badges, streak e ranking ficam para uma versão posterior.

- Pontos (por diagnóstico, checkpoints, entrega, nota).
- Níveis e badges (ex.: primeira entrega, 3 semanas seguidas, nota máxima).
- Sequência (streak) semanal.
- Ranking. **[EM ABERTO]** ranking público ou apenas progresso pessoal (risco de comparação desmotivar).
- Gamificação presente do início ao fim, incluindo o cadastro e o diagnóstico.

### RF8 — IA na geração de cases (uso interno)
- A equipe cria o case com auxílio da IA a partir de um briefing: gera rascunho de contexto, checkpoints, tarefas, dados e gabarito. Por isso as telas de admin entram no MVP.
- A equipe revisa, edita, confere o gabarito e publica. **A IA nunca publica sozinha.**
- Agenda de publicação automática para segunda-feira.

### RF9 — Painel administrativo (equipe)
- CRUD de áreas, cases, conteúdos, perguntas do diagnóstico, badges e regras de pontos.
- Fila de correção e revisão de notas.
- Gestão de participantes e certificados.
- Métricas de uso e conclusão.

## 7. Requisitos não funcionais

- **Responsivo**: mobile-first, funcional de 360px a desktop.
- **Acessibilidade**: WCAG 2.1 AA.
- **Segurança e privacidade**: LGPD, senhas com hash, dados pessoais minimizados, perfil de menores tratado à parte.
- **IA**: nenhum dado pessoal identificável enviado à OpenAI além do necessário. Toda saída da IA que afeta nota é auditável (guardar entrada, saída e versão do prompt).
- **Desempenho**: páginas principais carregam em menos de 3s em 4G.
- **Disponibilidade**: atenção ao pico de segunda-feira (liberação) e sexta-feira (prazo).
- **Observabilidade**: logs e alertas de erro, custo e latência das chamadas de IA.
- **Idioma**: português do Brasil.

## 8. Uso de IA

Detalhes completos em **`IA.md`**.

| Onde | O que faz | Controle humano |
|---|---|---|
| Geração de cases (admin) | Gera rascunho de case, tarefas, dados e gabarito a partir de um briefing | Equipe edita, confere o gabarito e publica |
| Correção | Interpreta respostas quantitativas e escreve o feedback | Equipe aprova a nota antes de publicar; recurso da participante |

O diagnóstico de fit **não usa IA** (decisão do PRD do diagnóstico: nunca usar LLM para definir scores). Riscos a tratar: respostas incorretas da IA, custo por chamada e vazamento de dados.

## 9. Gamificação — princípios

- Recompensar progresso e constância, não apenas nota.
- Feedback imediato (pontos e badges aparecem na hora).
- Evitar comparação negativa.
- Tom acolhedor e inspirador, alinhado à proposta "por elas".

## 10. Modelo de dados (alto nível)

`Usuária` · `Perfil` · `Área` · `Pergunta do diagnóstico` · `Avaliação do diagnóstico` · `Resultado do diagnóstico` · `Case` · `Checkpoint` · `Tarefa` · `Entrega` · `Avaliação` · `Conteúdo` · `Pontos/Evento` · `Badge` · `Certificado`

## 11. Riscos e premissas

| Risco | Mitigação |
|---|---|
| Pouco conteúdo para sustentar cases semanais | Criar banco de 4 a 6 cases antes do lançamento |
| Correção por IA errada | Gabarito com tolerância, revisão humana e canal de recurso |
| Pico de acesso em prazos | Testes de carga e filas para correção |
| Evasão após o primeiro case | Gamificação, lembretes por e-mail e streak |
| Certificado sem valor percebido | Definir emissor oficial e página pública de validação |

## 12. Perguntas em aberto (precisam de decisão)

1. A plataforma é gratuita? Haverá turmas/parcerias?
2. Quais áreas do mercado financeiro entram na v1? (lista proposta em `TELAS.md`)
3. Idade mínima e tratamento de menores.
4. Quem emite o certificado e qual o critério (entrega ou nota mínima)?
5. Correção qualitativa: humana, IA ou ambas?
6. Cases passados podem ser feitos depois da semana?
7. Ranking público ou progresso individual?
8. Stack e infraestrutura (front, back, banco e hospedagem). **Decidido:** autenticação própria, sem provedores externos, e IA pela API da OpenAI.
9. Prazo e tamanho da equipe para a v1.
