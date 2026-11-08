# PRD | Cases como trilha

Galapagos por Elas  •  Rascunho v0.1  •  07/11/2026

> Status: direção do time. **Contratos, mock e testes já implementados** (`front/src/services`): trilha, escolha semanal, prazo, checkpoints, tentativas, certificado em PDF e link do LinkedIn. **Telas prontas e ligadas aos serviços:** mapa da trilha (escolher o case da semana, com confirmação), case por etapas (entenda a área, checkpoints com tarefas e rascunho automático, envio, resultado), certificados (PDF, LinkedIn e copiar link de validação) e validação pública pelo link. **Ainda não existem** o treino, a defesa com comitê, a rubrica de 5 critérios, a avaliação às cegas e a Home ligada à trilha. **Decisões de 07/11/2026:** cada uma escolhe o seu case, mas os cases sempre abrem na segunda e fecham na sexta; concluir = aprovada com certificado; só pontos e nível (o certificado é o troféu); entram os quatro usos de IA (avaliação qualitativa com revisão da equipe, perguntas do comitê, mentora em chat livre e geração do case no admin). **Segunda rodada:** um case por semana, à escolha dela; o case liberado no meio da semana fica aberto até a sexta seguinte; o progresso é sempre mantido; o primeiro case pode ser de qualquer área do Top 3; a mentora só responde sobre mercado financeiro; vale o visual que já tínhamos (azul, rosa e branco). Substitui, quando aprovado, o modelo de "case semanal" do `PRD.md` (RF3, RF4 e RF6). Itens **[EM ABERTO]** precisam de decisão e **[SUPOSIÇÃO]** são propostas minhas. Referência de formato: `referencias/elas-na-ilha/EXTRACAO.md`.

## 1. Ideia

Cada **case** é uma **trilha dentro de uma área** do mercado financeiro: a participante entende a área, estuda o necessário, vive uma situação real de trabalho, é avaliada e sai com um **certificado**. Os cases formam a jornada da plataforma, no ritmo dela.

- O **primeiro case** é da **área que ficou em primeiro no diagnóstico de fit**.
- Os **demais** são desbloqueados **depois de concluir o primeiro** e **por escolha da usuária**.
- Cada case traz: (1) a explicação da área, (2) os conteúdos do case, (3) a parte interativa como uma situação específica e (4) o certificado, com envio ao LinkedIn **e** um PDF para baixar com o nome do case e o nome dela.

## 2. Desbloqueio

| Situação | Regra |
|---|---|
| Sem diagnóstico concluído | Nenhum case abre. O mapa mostra “Faça o diagnóstico para descobrir por onde começar” |
| Primeiro case | **Qualquer área do Top 3** do resultado mais recente, à escolha dela. A da **posição 1** vem marcada como “Comece por aqui” |
| A área da posição 1 ainda não tem case publicado | Abre o case da próxima área do ranking que tenha um, com a explicação “Começamos por X porque o case de Y chega em breve” **[EM ABERTO]** |
| Depois do primeiro concluído | Todas as áreas **com case publicado e aberto na semana** ficam disponíveis. Ela escolhe. As do Top 3 aparecem primeiro, sem trava |
| Mais de um em andamento | **Um case por semana** (decidido). Ela escolhe qual. O progresso de um case não terminado é mantido |
| Refazer o diagnóstico | Não apaga trilhas em andamento nem concluídas. Só muda a ordem das sugestões |
| Áreas sem case | Aparecem como “em breve”, sem prometer data |

**Concluir o case** (decidido): fazer todos os checkpoints **e ser aprovada na avaliação**, recebendo o certificado. Quem não atinge a nota mínima revisa no treino e refaz em uma semana seguinte.

**Fragilidade do fit (motivo de o primeiro case poder ser do Top 3):** a posição 1 é instável (em 35% dos casos fica a menos de 1 ponto da 2ª, e trocar uma resposta muda a 1ª em 36%). Por isso a tela diz que **qualquer área do Top 3 é um bom começo**, destaca a posição 1 e deixa a escolha com ela.

### Cadência (decidido, com pontos a confirmar)

**Cada uma escolhe o seu case, mas os cases sempre abrem na segunda-feira e fecham na sexta-feira.** Leitura: o ciclo semanal continua, e a diferença é que **várias opções ficam abertas na mesma semana** (as áreas que ela já pode fazer) e ela escolhe qual fazer.

1. **Segunda:** abrem os cases disponíveis para ela. Ela escolhe um e começa.
2. **Segunda a sexta:** faz as etapas e os capítulos. O progresso fica salvo.
3. **Sexta, 23h59:** fecha o prazo de envio.
4. **Fim de semana:** avaliação (regras, IA e revisão da equipe) e publicação do resultado.
5. **Aprovada:** recebe o certificado e **os próximos cases abrem** para ela nas semanas seguintes.

Tempo do case: o artefato leva cerca de 15 min de entendimento, o treino e 5 capítulos de 20 a 30 min, ou seja, **2 a 3 horas no total**, que cabem em uma semana.

**Decidido (07/11/2026):**
- **Um case por semana**, e **ela escolhe qual** dos que estão abertos para ela.
- **Case liberado no meio da semana** (ao concluir o diagnóstico ou ao ser aprovada em outro case) **fica aberto até a sexta seguinte**. **[INTERPRETAÇÃO: confirmar o corte]** Proposta: quem libera de segunda a terça tem até a sexta da mesma semana; de quarta a domingo, até a sexta da semana seguinte, para nunca sobrar só 1 ou 2 dias.
- **O progresso é sempre mantido**: se ela não terminar até a sexta, retoma quando o case voltar a estar aberto para ela, sem perder o que fez nem repetir os pontos dos checkpoints.

**Ainda em aberto:**
- Quando sai o **resultado**: na segunda de manhã (como no README), junto com o certificado? **[SUPOSIÇÃO]** sim.
- Todo case publicado abre **toda semana** para quem já o destravou, ou a equipe escolhe quais abrem em cada semana? **[SUPOSIÇÃO]** todo case publicado fica disponível a cada semana.

## 3. Estrutura de um case

Cinco etapas em ordem; cada etapa só abre quando a anterior termina. Cada etapa se traduz em **checkpoints** (unidade de progresso, salva e pontuada).

| # | Etapa | Conteúdo | Checkpoint(s) | Como conclui |
|---|---|---|---|---|
| 1 | **Entenda a área** | Explicação da área (vem do catálogo), vídeo ou leitura externa, **cards** com termos clicáveis e “na prática”, e “**Como se entra**” (onde se trabalha, formações, vagas, o que ajuda, quando recrutam) | 1 | Passar pelos cards e confirmar |
| 2 | **Conteúdos e treino** | Conteúdos de apoio do case e exercícios rápidos, **sem nota**, que pulam o que ela já domina e repetem o que errou com uma variação | 1 | Acertar todas as perguntas (com repetição) |
| 3 | **A situação** | Missão com **um personagem** (chefe ou cliente) e **4 a 5 capítulos** curtos de decisão (ler dados, diagnosticar, decidir com confiança, reagir a uma reviravolta) | 1 por capítulo | Enviar o capítulo (fica travado depois) |
| 4 | **Defesa final** (opcional por case) | Apresentar a conclusão e responder a perguntas de um comitê | 1 | Enviar a apresentação e as respostas |
| 5 | **Avaliação e certificado** | Notas por critério, feedback, certificado | — | Nota mínima atingida |

Os capítulos usam os tipos de tarefa que já temos (número com gabarito e tolerância, texto) e ganham novos: **escolher N itens com motivo**, **classificar afirmações**, **escolher e informar a confiança** e **mantém ou muda**.

### Esboço de dados (para os contratos)

```
CaseTrilha {
  id, areaId, titulo, missao, personagem { nome, papel, imagem? },
  entenda { resumo, links[], cards[ { titulo, texto, naPratica, termos[] } ], comoSeEntra { ondeSeTrabalha, formacoes, vagas, oQueAjuda, quandoRecrutam } },
  treino  { perguntas[ { texto, opcoes, correta, explicacao, variacao } ] },
  checkpoints[ { id, etapa: 'entenda'|'treino'|'situacao'|'defesa', ordem, titulo, pontos, tarefaIds[] } ],
  rubrica { criterios[ { id, nome, tipo: 'regra'|'ia'|'equipe', pesoMax: 4 } ], minimoCertificado, minimoDistincao },
  conteudoIds[]
}
EstadoDoCaseParaUsuaria = 'bloqueado' | 'disponivel' | 'em_andamento' | 'em_avaliacao' | 'concluido'
```

Serviços novos ou alterados (nomes sugeridos): `obterTrilha()` (todos os cases com estado e a sugestão “comece por aqui”), `iniciarCase(caseId)`, `obterCase(caseId)`, `concluirCheckpoint`, `responderTreino`, `enviarCapitulo`, `obterAvaliacao`, `listarMeusCertificados`, `baixarCertificadoPdf`, `validarCertificado`.

## 4. Checkpoints e gamificação

**Princípio:** o progresso é mostrado por checkpoints e os pontos pagam cada checkpoint, uma vez. O saldo continua sendo a soma do extrato, concedido só pelo servidor.

| Evento | Pontos hoje | Proposta para a trilha **[SUPOSIÇÃO]** |
|---|---|---|
| Diagnóstico concluído | 100 | 100 (igual) |
| Entenda a área (checkpoint 1) | — | 20 |
| Treino | — | 5 por acerto na 1ª tentativa, no máximo 30 |
| Cada capítulo da situação | 30 por checkpoint | 30 |
| Defesa final | — | 30 |
| Avaliação: bônus por nota | até 150 | até 150 (igual) |
| Certificado conquistado | 100 | 100 (igual) |
| Conteúdo de apoio concluído | 10 | 10 (fora das etapas obrigatórias) |
| “Entrega enviada” (100) | 100 | **Sai**: a entrega virou os capítulos |

Um case completo vale cerca de **450 pontos** (20 + 30 + 4×30 + 30 + 150 + 100 no teto), então **cerca de três cases levam ao nível Especialista** (1.400). Os níveis atuais (150, 400, 800, 1.400) continuam servindo.

**Mostrar progresso:** barra por etapa e por case, “x de N checkpoints”, o selo “+N pts” em cada checkpoint antes de fazer, e o toast ao concluir. No mapa, cada case mostra seu estado e o progresso.

**Decidido: só pontos e nível.** O **certificado do case é o troféu**. Não há medalha nem sequência de dias nesta versão (o artefato tem as duas, mas a sequência nele é fixa em “1 dia”).

## 5. Avaliação

Modelo do artefato, adaptado: **rubrica de 5 critérios de 1 a 4 (total 20)**, definida por case. Cada critério é nota por **regra**, por **IA** ou pela **equipe**.

- **Por regra (código):** o que tem resposta objetiva (dados escolhidos, decisão e calibração, números com gabarito e tolerância). É o que já fazemos hoje.
- **Por IA, sempre revisada pela equipe (decidido):** o raciocínio em texto (causa e efeito, adaptação, comunicação). A IA sugere a nota de 1 a 4 e o feedback; a equipe aprova antes de publicar. Isso muda a regra anterior do `IA.md` de deixar o qualitativo manual.
- **Aprovação:** 12 de 20 (60%) dá o certificado. 17 de 20 (85%) dá “com distinção” **[SUPOSIÇÃO: valores do artefato]**. Abaixo disso, “Revisar e refazer”: a usuária volta ao treino e tenta de novo (sem repetir os pontos dos checkpoints).
- **Nota na plataforma:** `nota = total / 20 × 10`, para casar com a escala 0 a 10 que já existe.
- **Avaliação às cegas:** quem corrige não vê nome, faculdade nem cidade. Vale para a IA **e para a fila da equipe** (hoje a fila mostra o nome). Trocar só o nome e a faculdade por marcadores é frágil: ela pode escrever outros dados pessoais no texto. **[EM ABERTO]**

## 6. Certificado

**Quando:** ao ser aprovada na avaliação de um case. Um certificado por case concluído.

**O que a usuária recebe:**

1. **PDF para baixar**, com o **nome do case** e o **nome dela**, mais área, data de emissão e **código de verificação**. Arquivo: `certificado-<case>-<nome>.pdf` (sem acentos nem espaços).
2. **“Adicionar ao LinkedIn”**: link de certificação do LinkedIn com o nome do case, a organização, mês e ano, o código e o **endereço da nossa página de validação** (`certUrl`). O artefato manda só o código, sem endereço, e por isso o certificado não é verificável por ninguém. Confirmar na documentação vigente do LinkedIn quais parâmetros são aceitos.
3. **Página pública de validação** por código (já prevista): devolve só nome, case e data.

**Regras do PDF:**

- Gerado sob demanda, com o texto **selecionável** e legível por leitores de tela.
- O **código** vem do servidor e é imprevisível; nunca gerado no navegador (como no artefato).
- Só o necessário de dados pessoais: nome (ou nome social, **[EM ABERTO]**: sugiro confirmar “nome no certificado” na emissão), case, área e data.
- Sem a nota. **[EM ABERTO]** mostrar ou não “com distinção”.
- **[EM ABERTO]** emissor oficial e assinatura (a Galapagos? parceiro?) e o modelo visual aprovado.
- No front com mock, o PDF pode ser montado no próprio navegador para demonstração. No backend, geramos no servidor.

## 7. IA nos cases

**Decidido: entram os quatro usos**, todos pela API da OpenAI.

| Uso | O que faz | Observações |
|---|---|---|
| **Avaliação qualitativa** | Notas de 1 a 4 e feedback por critério | Sempre revisada pela equipe antes de publicar. Roda no fim de semana |
| **Perguntas do comitê** | Gera uma pergunta por membro a partir da apresentação dela | Com fallback para a pergunta-base fixa, para a defesa nunca travar |
| **Mentora (chat livre)** | Responde **só dúvidas sobre o mercado financeiro** (conceitos, áreas, carreira no mercado) e dá dicas por capítulo. Nunca entrega a resposta de tarefa avaliada | **Texto livre da usuária**: exige limite de uso, teto de gasto, moderação, defesa contra prompt injection e **recusa educada de qualquer assunto fora do mercado financeiro**. Não pode inventar datas, salários ou requisitos de vagas |
| **Geração do case (admin)** | Monta o rascunho da estrutura inteira (cards, treino, capítulos, rubrica) a partir de um briefing | A equipe revisa e publica; a IA nunca publica |

Todas só no servidor, com saída estruturada e registro de cada chamada (já decidido em `IA.md`). A geração do case passa a produzir **a estrutura inteira**, o que é bem maior que o gabarito de hoje. A mentora e o comitê recebem só o contexto necessário e **nunca** o gabarito nem a rubrica de pontuação.

## 8. O que isso muda no que existe

| Área | Impacto |
|---|---|
| `PRD.md` | RF3 (case semanal), RF4 (conteúdos) e RF6 (certificado) são reescritos por este documento |
| Contratos e mock | `CaseSemana` vira `CaseTrilha`; entram trilha, estados por usuária, treino e capítulos; `Certificado` ganha PDF e `certUrl`. Pontos: ver seção 4 |
| Telas | Home e “Case” viram **Mapa da trilha** + **tela do case** (etapas); a tela de tarefa ganha os novos tipos; **Resultado do case** vira Avaliação com critérios; **Certificados** ganha PDF e LinkedIn |
| Admin | O editor de case cresce (cards, treino, capítulos, rubrica, personagem). O agendamento semanal **continua**, mas passa a abrir vários cases ao mesmo tempo, por área |
| `IA.md` | Entram mentora, comitê e avaliação qualitativa (atualizado) |
| `TODO.md` | Etapas 5 a 7 (case, correção, certificado) precisam ser redesenhadas |
| Visual | **Decidido:** vale o visual que já tínhamos (azul médio, rosa, branco e formas curvas). Bege, azul-marinho e serifada do artefato ficam só como referência |

## 8.1 O que já está no mock

- **Implementado:** estado de cada case (bloqueado, disponível, em andamento, em avaliação, concluído); desbloqueio pelo Top 3 com fallback; um case por semana; prazo até a sexta (regra da seção 2); progresso preservado; checkpoints em ordem e pagos uma vez; aprovação libera os próximos; nova tentativa; publicar e arquivar no admin; certificado em PDF e link do LinkedIn; pontos conforme a seção 4 (a regra “entrega enviada: 100” saiu).
- **Simplificações do mock:** a etapa “Entenda a área” é conteúdo de leitura sem treino e a defesa final não existe; a nota continua de 0 a 10 com gabarito numérico e parte qualitativa simulada; a regra de fallback (seguir o ranking até achar áreas com case) e “aprovada = nota ≥ 6” são suposições.

## 9. Perguntas em aberto

Resolvidas em 07/11/2026 (duas rodadas): concluir = aprovada com certificado; só pontos e nível; os quatro usos de IA; ciclo semanal com um case por semana à escolha dela; case liberado no meio da semana aberto até a sexta seguinte; progresso sempre mantido; primeiro case entre o Top 3; mentora só sobre mercado financeiro; visual atual.

1. **Corte exato** da regra “aberto até a sexta seguinte” (seção 2).
2. Quando sai o **resultado** e se o certificado vem junto.
3. Todo case publicado abre toda semana, ou a equipe escolhe?
4. Se a área escolhida não tem case publicado: qual a regra de fallback?
5. Avaliação às cegas também na fila da equipe (hoje ela mostra o nome)?
6. Certificado: nome social, emissor oficial, assinatura e se mostra “com distinção”.
7. Retratos dos personagens: origem e direito de uso.
8. Quantos cases existem no lançamento e de quais áreas?
9. Mentora: limite de mensagens por usuária e por dia, e quem faz a moderação?
