# PRD — Fórum

> Proposta para revisão. Nada disto está implementado. As decisões marcadas com **[DECIDIR]** precisam da sua resposta antes de eu construir; para cada uma há uma recomendação.

## 1. Visão geral

O fórum é um espaço público onde as participantes pedem ajuda, contam o que está acontecendo com elas e respondem umas às outras. A inspiração é o Reddit: posts com título e texto, respostas em árvore, votos, e organização por assunto.

Duas regras vêm da sua descrição e valem como princípios do produto:

1. **Todo post é público** para quem está logada na plataforma. Não há post privado, grupo fechado nem mensagem direta.
2. **O fórum vive só na sua seção.** Posts e respostas não aparecem na Home, nas ilhas, no perfil de outras pessoas nem em notificações por e-mail com o texto do post. A Home e as ilhas podem, no máximo, ter um link "Ir para o fórum".

Fora do escopo desta versão: mensagens diretas, grupos privados, imagens e anexos, enquetes, menções (@), hashtags livres, busca semântica, voz.

## 2. Por que isto precisa de cuidado

Texto livre e público de pessoas que "contam o que está acontecendo com elas" traz riscos que o resto da plataforma não tem:

- **Dados pessoais e sensíveis.** Quem desabafa conta de saúde, assédio, dívidas, família. O texto fica público e pode ser copiado.
- **Exposição profissional.** Criticar uma empresa, um processo seletivo ou uma pessoa pode ter consequência para a autora e para a plataforma.
- **Assédio, discriminação e golpes.** Spam de vaga falsa, pedido de dinheiro, cursos milagrosos.
- **Aconselhamento financeiro.** Uma resposta "compra essa ação" lida como recomendação.
- **Menores de idade e LGPD.** Ver seção 9.

Por isso moderação, denúncia e identidade da autora estão no desenho desde o começo, não como "depois".

## 3. Identidade: quem aparece em cada post

**[DECIDIR 1] Nome exibido.** Recomendação: **apelido escolhido pela participante** (ex.: "Analista_em_Formação"), único, que pode ser trocado uma vez por mês. O nome real e o e-mail nunca aparecem. A equipe vê a conta real por trás do apelido.

- Por que não nome real: o conteúdo é sensível e público; o apelido reduz exposição sem permitir anonimato total (a equipe consegue agir sobre abuso).
- Alternativa A: nome social do perfil (mais acolhedor, mais exposição).
- Alternativa B: opção "postar como anônima" por post, com a equipe ainda vendo a autora. Pode ser incluída depois sem mudar o modelo.

Mostrar ao lado do apelido, opcionalmente e só se a autora ativar: **área de interesse** (ex.: "Interesse: Equity Research") e **medalhas** (certificados da plataforma). Isso dá credibilidade às respostas sem expor dados pessoais.

## 4. Estrutura

### 4.1 Categorias (fixas, criadas pela equipe)

Recomendação inicial, cada uma com uma descrição de uma frase:

| Categoria | Para quê |
|---|---|
| Boas-vindas e apresentações | Quem é você e o que busca |
| Dúvidas sobre o mercado | Conceitos, carreira, "por onde começar" |
| Cases e estudos | Dúvidas sobre os cases e o treino (sem postar gabarito) |
| Entrevistas e processos seletivos | Experiências, dicas, preparação |
| Vagas e oportunidades | Conversa sobre as vagas da aba Vagas e outras; sem pedir ou oferecer dinheiro |
| Bastidores e desabafos | O que está acontecendo com você: dificuldades, dúvidas, vitórias |

Além das categorias, **uma etiqueta opcional por área** (as 13 áreas), para filtrar "só Equity Research". Etiqueta, não categoria, para não multiplicar espaços.

### 4.2 Post

- Título (5 a 140 caracteres) e texto (até 5.000), com formatação mínima: parágrafos, listas, negrito, itálico e links. Sem HTML, sem imagens.
- Uma categoria obrigatória; uma etiqueta de área opcional.
- Editável pela autora por 15 minutos; depois só edição com marca "editado".
- A autora pode apagar o post. Se já tem respostas, o texto vira "[removido pela autora]" e as respostas ficam.

### 4.3 Respostas

- Em árvore, até 3 níveis de aninhamento (depois, resposta ao mesmo nível).
- Até 2.000 caracteres, mesma formatação.
- A autora do post pode marcar **uma resposta como "ajudou"**, que sobe ao topo.

### 4.4 Votos

- **Útil** (um voto positivo por pessoa por post ou resposta). Sem voto negativo.
- Ordenações: **Recentes** (padrão), **Mais úteis**, **Sem resposta**.
- **[DECIDIR 2]** Recomendação: **sem voto negativo e sem placar público de pessoas** (nada de "karma" individual). Contador de úteis só no post e na resposta. Evita o efeito de ranking e a competição, que não combinam com o público e com o tema de desabafo.

## 5. Moderação e segurança

### 5.1 Regras da comunidade (texto curto, mostrado antes da primeira postagem e fixado no topo)

Respeito, sem assédio, sem discriminação, sem dados pessoais de terceiros, sem pedir ou oferecer dinheiro, sem divulgar gabarito de case, sem recomendação de compra ou venda de ativos, sem cadastro de vagas que cobram para participar.

### 5.2 Denúncia

Cada post e resposta tem "Denunciar" com motivo (assédio, spam ou golpe, dado pessoal, gabarito de case, recomendação de investimento, outro) e campo livre opcional. A denúncia entra numa **fila da equipe**.

### 5.3 Ações da equipe

Ocultar (some para as participantes, a autora vê que foi ocultado e o motivo), restaurar, apagar de vez, advertir a conta, **silenciar por N dias** (não posta nem responde), banir. Toda ação fica num **registro de auditoria**.

### 5.4 Proteções automáticas

- **Limite de uso:** por exemplo, 5 posts e 30 respostas por dia por conta; conta nova (menos de 24 h) com limite menor.
- **Filtro de padrões** antes de publicar: e-mail, telefone, CPF, endereço e links encurtados são **bloqueados com aviso** ("Você incluiu um dado pessoal; remova para publicar"). Links normais são permitidos, com `rel="noopener noreferrer nofollow"`.
- **Palavras de gatilho** (ofensas graves) mandam o post direto para a fila de moderação antes de aparecer.
- **Sem HTML e sem imagens** elimina a maior parte de XSS e conteúdo abusivo por upload. O texto é sempre escapado na exibição.

**[DECIDIR 3] Quem modera e com que prazo.** Recomendação: a **equipe** (papel `equipe` já existente) com meta de tratar denúncias em até 24 horas úteis, e um e-mail de alerta para a equipe quando entrar denúncia grave. Se não houver quem faça isso, o fórum não deve abrir: um fórum público sem moderação é pior que nenhum.

**[DECIDIR 4] Moderação com IA.** Recomendação para a v1: **sem IA decidindo nada**. Se quiser, uma sugestão de IA (classificar a denúncia por gravidade) só para ordenar a fila, nunca para ocultar sozinha. Segue o princípio do PRD de que a IA não decide sobre pessoas.

### 5.4.1 Casos de risco emocional

Posts em "Bastidores e desabafos" com sinais de crise (palavras-chave sobre autolesão, por exemplo) recebem um **aviso fixo** com recursos de apoio (CVV 188) e vão para a fila de moderação para acompanhamento humano. A plataforma não faz atendimento psicológico e isso deve estar dito nas regras.

## 6. Notificações

- Dentro da plataforma: sino com "respondeu ao seu post", "marcou sua resposta como útil", "sua publicação foi ocultada".
- **E-mail:** só aviso genérico ("Você tem uma resposta no fórum"), **sem o texto do post**, respeitando as preferências de e-mail que já existem no perfil.
- A participante pode **seguir** um post para ser avisada de respostas, e **silenciar** um post.

## 7. Telas

1. **Fórum (lista):** abas de categoria, filtro de área, ordenação, busca por título, botão "Novo post". Cada item: título, trecho, categoria, apelido, tempo, nº de respostas e de úteis.
2. **Post:** texto, ações (útil, responder, denunciar, seguir), respostas em árvore.
3. **Novo post / editar:** título, categoria, etiqueta de área, texto com prévia, regras resumidas ao lado.
4. **Meus posts e respostas:** histórico da própria autora, com apagar.
5. **Admin, fila de denúncias:** denúncia, trecho, histórico da conta, ações.
6. **Admin, categorias e regras:** edita categorias e o texto das regras.

Acessível por teclado e leitor de tela, mesmo padrão do restante. Entrada no menu principal como "Fórum".

## 8. Modelo de dados (alto nível)

- `forum_profiles`: usuária, apelido único, mostrar área e medalhas (booleanos), apelido alterado em.
- `forum_categories`: id, nome, descrição, ordem.
- `forum_posts`: id, autora, categoria, área (opcional), título, texto, status (`publicado`, `oculto`, `removido`), criado em, editado em, contador de úteis e de respostas.
- `forum_replies`: id, post, resposta pai (nula se de primeiro nível), autora, texto, status, "ajudou" (bool), criado em.
- `forum_votes`: usuária, alvo (post ou resposta), alvo id (único por par).
- `forum_follows`: usuária, post.
- `forum_reports`: denunciante, alvo, motivo, texto, status, tratado por, tratado em.
- `forum_moderation_log`: quem, ação, alvo, motivo, quando.
- `forum_sanctions`: usuária, tipo (advertência, silenciada, banida), até quando, motivo.

A API fica sob `/api/forum/*`, com checagem de papel `equipe` nas rotas de moderação, no mesmo padrão da API de vagas.

## 9. Privacidade, LGPD e menores

- **Base e transparência:** texto no cadastro e nas regras explicando que o que se posta é público para as demais participantes e que a equipe pode ver a conta por trás do apelido.
- **Direitos:** a participante pode apagar seus posts e respostas e pedir a exclusão da conta; ao excluir a conta, o conteúdo vira "[removido]" e o apelido é liberado.
- **Menores de 18 anos:** hoje o cadastro aceita data de nascimento. **[DECIDIR 5]** Recomendação: **fórum só para maiores de 18 anos** na v1 (data de nascimento já existe); menores continuam com o resto da plataforma. Se houver menores entre o público, isso precisa de consentimento parental e de moderação reforçada, e eu não recomendo começar por aí.
- **Retenção:** conteúdo oculto ou removido é apagado de vez após 90 dias, exceto o registro de auditoria da moderação.
- **Antes de abrir:** os termos de uso e a política de privacidade precisam ser atualizados e revisados por quem cuida da parte jurídica. Eu não escrevo texto jurídico definitivo.

## 10. Métricas de sucesso

- Participantes que abrem o fórum por semana e que postam ou respondem.
- Posts com pelo menos uma resposta em 24 horas (meta: 80%).
- Tempo médio para tratar uma denúncia (meta: menos de 24 horas úteis).
- Taxa de denúncias por 100 posts (saúde da comunidade).
- Respostas marcadas como "ajudou".

## 11. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Comunidade vazia no começo | Equipe semeia posts por categoria; botão "Novo post" visível; mentoras respondem nas primeiras semanas |
| Conteúdo tóxico ou assédio | Regras claras, denúncia, silenciamento, banimento, log de auditoria |
| Vazamento de dado pessoal | Filtro de padrões, apelido, sem imagens, edição e exclusão pela autora |
| Spam e golpe | Limite de uso, conta nova mais limitada, links só normais, fila de moderação |
| Recomendação de investimento | Regra explícita e categoria de denúncia própria |
| Sobrecarga da equipe | Meta de 24 h úteis, alerta de denúncia grave, abrir por fases (ver seção 12) |
| Responsabilidade legal | Termos atualizados e revisão jurídica antes de abrir |

## 12. Fases de entrega

1. **Núcleo:** apelido, categorias, posts, respostas, útil, ordenações, apagar o próprio conteúdo, regras, limites de uso e filtro de dados pessoais.
2. **Moderação:** denúncia, fila e ações da equipe, silenciamento, registro de auditoria, alertas por e-mail para a equipe.
3. **Engajamento:** seguir, notificações no sino, marcar "ajudou", etiqueta e filtro de área, medalhas ao lado do apelido.
4. **Depois:** busca melhor, sugestão de IA só para ordenar a fila, e ideias como "pergunte à mentora" ligadas ao fórum.

Recomendação: **só abrir ao público depois das fases 1 e 2 juntas.** Postar sem poder denunciar nem moderar não é seguro.

## 13. Perguntas em aberto (preciso da sua decisão)

1. **Identidade:** apelido (recomendado), nome social ou opção de anônima por post?
2. **Votos:** só "útil" e sem placar de pessoas (recomendado), ou voto negativo e ranking?
3. **Moderação:** quem da equipe cuida, com que prazo, e quem recebe o alerta de denúncia grave?
4. **IA na moderação:** nenhuma na v1 (recomendado), ou só para ordenar a fila?
5. **Menores:** fórum só para maiores de 18 anos (recomendado)?
6. **Categorias:** a lista da seção 4.1 serve? Falta alguma, ou sobra?
7. **Posts de desabafo:** mantemos "Bastidores e desabafos" com o aviso de apoio e a fila de revisão, ou melhor não ter essa categoria na v1?
8. **Abertura:** o fórum abre para todas ao mesmo tempo ou só para quem concluiu pelo menos um case (reduz spam e dá contexto)?
