# PRD para a IA — Primeira versão das telas · Galapagos por Elas

> Este documento é o briefing para uma IA gerar as telas. Ele não substitui o `PRD.md` (produto), o `TELAS.md` (lista de telas) nem o `IA.md` (onde e como a IA é usada). Aqui está tudo o que a IA precisa para construir sem perguntar.
>
> **Versão 2.** Em relação à v1, entram: diagnóstico de fit com 15 perguntas A/B/C (sem IA, ver `PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md`), IA na geração de cases e na correção; autenticação e papéis; camada de dados pronta para backend; e 3 telas novas (termos e privacidade, extrato de pontos, páginas de sistema). **Se você já gerou telas com a versão 1, revise tudo contra as seções marcadas como NOVO.**

## 1. Contexto

**Galapagos por Elas** é uma plataforma web para meninas e mulheres que querem entrar no mercado financeiro. Fluxo:

1. Cadastro/login
2. Diagnóstico de fit: descobre como ela gosta de pensar e trabalhar e quais áreas explorar primeiro (afinidade relativa, não probabilidade)
3. **Case semanal**: liberado na segunda, aberto até sexta, com checkpoints e tarefas. Resultado no fim de semana
4. Conteúdos de apoio durante o case
5. Certificado oficial para quem termina o case
6. Gamificação do início ao fim

**Público:** mulheres jovens, muitas no celular, algumas sem familiaridade com finanças. O tom é acolhedor, claro e profissional, sem infantilizar e sem ser frio como um banco.

## 2. O que a IA deve entregar

- **Todas as 22 telas** da seção 7, navegáveis, em **mobile (360–430px) e desktop (≥1200px)**.
- **NOVO: fluxo de autenticação completo** (seção 14): cadastro, login, recuperação de senha, rotas protegidas, papéis (participante e equipe), sessão expirada.
- **NOVO: a IA visível nas telas** (seção 15): geração de cases e correção, com o selo “IA” e os estados de falha. **O diagnóstico não usa IA.**
- **NOVO: camada de serviços** (seção 16): toda tela busca e grava dados por funções de serviço tipadas, com um **adaptador mock** (dados fictícios em português) e **pronta para trocar por backend real** sem mexer nas telas.
- Tokens de design em um único arquivo (variáveis CSS) e componentes reutilizáveis.
- Todos os estados das seções 9 e 15.
- **Escopo: somente front-end.** A ferramenta **não** cria backend, banco, autenticação real nem chamadas reais de IA. Tudo isso será construído depois, por nós, atrás da camada de serviços (seção 16).
- Stack do front: React (preferência: Next.js, usado só como front) ou HTML + CSS + JS puro, sem dependências pesadas. O backend será **nosso**, com autenticação própria e sem provedores externos de login; a IA será a **API da OpenAI (ChatGPT)**, chamada só pelo servidor. Banco e hospedagem ainda não estão decididos, então **nenhuma tela pode depender deles**.
- O que a ferramenta entrega além das telas: o arquivo de **contratos** (tipos das entidades e assinaturas das funções de serviço da seção 16) e o **adaptador mock**, que serão a especificação do backend.

**Fora do escopo:** pagamento, app nativo, login social, **avatar, mascote, ranking, badges e streak** (ver seção 5), certificado com assinatura digital e ferramentas de BI.

## 3. Identidade visual

### 3.1 Direção
Confiança de mercado financeiro, com leveza e calor humano. O azul domina. O rosa aparece como destaque pontual. O branco dá respiro. **Formas curvas** suavizam a interface.

### 3.2 Paleta (valores de partida, a IA pode ajustar em até ±5% de luminosidade)

| Token | Hex | Uso |
|---|---|---|
| `--blue-700` | `#1A3F8A` | Títulos sobre claro, hover/pressed do primário |
| `--blue-600` | `#2457B8` | **Cor primária**: botões, links, barra de navegação, destaques |
| `--blue-500` | `#3F72D1` | Gráficos, estados ativos secundários |
| `--blue-100` | `#E3ECFA` | Fundos de cards e seções, chips |
| `--blue-50` | `#F3F7FD` | Fundo geral das telas internas |
| `--pink-600` | `#C2336F` | Texto/ícone rosa sobre fundo claro (contraste ok) |
| `--pink-500` | `#E8508F` | **Destaque**: pontos, conquistas, CTA secundário |
| `--pink-100` | `#FDE6F0` | Fundo de chips e avisos de pontos |
| `--white` | `#FFFFFF` | Fundo de cards e superfícies |
| `--ink-900` | `#14213D` | Texto principal |
| `--ink-600` | `#4A5877` | Texto secundário |
| `--ink-300` | `#C5CCDA` | Bordas e divisores |
| `--success` | `#1F9D6B` | Sucesso, concluído |
| `--warning` | `#E09A1A` | Prazo próximo |
| `--danger` | `#D14343` | Erro, prazo encerrado |

### 3.3 Regras de uso das cores
- **Proporção:** ~60% branco/azul muito claro, ~30% azul, ~10% rosa.
- O rosa é **acento**: pontos, conquista, um CTA secundário por tela no máximo. Nunca como fundo de tela inteira.
- Texto branco só sobre `--blue-600` ou mais escuro. Texto sobre rosa: usar `--pink-600` em fundo claro, ou branco só sobre `--pink-600`. **`--pink-500` com texto pequeno não passa em contraste** e deve ser usado só em formas, ícones grandes e preenchimentos.
- Contraste mínimo **WCAG AA** (4.5:1 para texto, 3:1 para elementos de interface).
- Sem gradientes pesados. Um gradiente sutil de `--blue-600` para `--blue-700` é aceito em cabeçalhos e no cartão de pontos.

### 3.4 Formas e curvas
- Raio padrão: cards `20px`, botões `999px` (pílula), inputs `14px`, chips `999px`.
- **Formas orgânicas curvas** como elemento de marca: ondas e blobs suaves em azul claro/rosa claro atrás de cabeçalhos, hero da landing e tela de resultado. Devem ser decorativos (`aria-hidden`), sem competir com o conteúdo.
- Cabeçalhos de página podem ter borda inferior curva (arco ou onda suave).
- Sombras suaves e difusas (`0 8px 24px rgba(20,33,61,.08)`). Nada de sombras duras.

### 3.5 Tipografia
- Fonte sem serifa, geométrica e legível (ex.: **Plus Jakarta Sans**, **Poppins** ou **Manrope**, via Google Fonts). Uma única família.
- Escala: 12 / 14 / 16 / 20 / 24 / 32 / 40. Corpo mínimo 16px no mobile. Títulos com peso 700, corpo 400/500.
- Números de pontos e notas em peso 700 com `font-variant-numeric: tabular-nums`.

### 3.6 Ícones e imagens
- Conjunto único de ícones de traço arredondado (ex.: Lucide). Sem emojis como ícones funcionais.
- Sem fotos de banco de imagens. Quando precisar de ilustração, usar formas geométricas curvas nas cores da marca.

### 3.7 Tom de voz (microcopy)
Português do Brasil, segunda pessoa informal (“você”), frases curtas, encorajadoras sem exagero. Ex.: “Você ganhou 50 pontos”, “Faltam 2 dias para entregar o case”. Evitar jargão sem explicação; termos financeiros novos ganham uma dica curta.

## 4. Princípios de UX

1. **Mobile-first.** O fluxo de entrega do case precisa funcionar bem no celular.
2. **Um objetivo principal por tela**, com um CTA primário visível.
3. **Progresso sempre visível** (diagnóstico, case, checkpoints).
4. **Prazo sempre claro** no case da semana (dias e horas restantes).
5. **Sem comparação entre participantes** nesta versão.
6. **Acessibilidade:** foco visível, alvos de toque ≥ 44px, rótulos em todos os campos, navegação por teclado, `prefers-reduced-motion` respeitado.

## 5. Gamificação: apenas pontos (v1)

Decisão do time: **começamos só com pontos**, antes de avatar ou mascote.

**Entra nesta versão**
- **Saldo de pontos** visível no topo (mobile e desktop) e na Home.
- **Ganho de pontos com feedback imediato**: ao concluir uma ação, aparece um aviso curto (“+50 pontos”) com a origem do ganho.
- **Extrato de pontos**: lista simples de quando e por que ganhou.
- **Nível simples derivado dos pontos**: nome do nível + barra de progresso até o próximo. Só como barra, sem personagem.
- Gamificação presente em: onboarding, diagnóstico, checkpoints do case, entrega, resultado e conteúdos.

**Fica fora desta versão:** avatar, mascote, badges, streak, ranking, loja de recompensas. Não desenhar telas nem espaços reservados para eles.

### 5.1 Tabela de pontos (valores de exemplo para o mock)

| Ação | Pontos |
|---|---|
| Completar o perfil | 20 |
| Concluir o diagnóstico | 100 |
| Concluir um conteúdo | 10 |
| Concluir um checkpoint do case | 30 (20 no “entenda a área”) |
| Resultado do case (bônus por nota, só para quem é aprovada) | até 150 |
| Concluir o case e receber o certificado | 100 |

### 5.2 Níveis (valores de exemplo)

| Nível | Pontos necessários |
|---|---|
| 1 · Exploradora | 0 |
| 2 · Aprendiz | 150 |
| 3 · Analista | 400 |
| 4 · Estrategista | 800 |
| 5 · Especialista | 1400 |

### 5.3 Componentes de pontos
- **Contador de pontos**: pílula com ícone e número, no cabeçalho (rosa claro com texto `--pink-600`).
- **Cartão de nível**: nível atual, pontos, barra até o próximo nível, “Faltam X pontos”.
- **Aviso de pontos (toast)**: aparece por ~3s, com animação curta de entrada e saída. Sem animação se `prefers-reduced-motion`.
- **Extrato**: lista com ação, data e pontos (+N).
- **Selo “+N pts”** em cada checkpoint e tarefa, mostrando quanto vale antes de fazer.

## 6. Navegação e layout

- **Mobile:** barra de navegação inferior com 4 itens: **Início, Case, Conteúdos, Perfil**. Cabeçalho superior com logo e contador de pontos. Certificados e extrato de pontos ficam acessíveis pelo Perfil.
- **Desktop:** barra lateral esquerda com os mesmos itens mais Certificados. Cabeçalho com contador de pontos e menu da usuária.
- **Telas públicas:** cabeçalho simples com logo, “Entrar” e “Quero participar”. Rodapé com links para **Termos de uso** e **Política de privacidade**.
- **Admin:** layout próprio em desktop, barra lateral com Cases, Correção e Conteúdos, e o selo “Equipe” no cabeçalho. Mobile do admin é secundário, mas não pode quebrar.
- **Menu da usuária:** nome, “Meu perfil”, “Sair”. Para a equipe, também “Ir para a administração” / “Ir para a área da participante”.
- Largura máxima de conteúdo: 1120px no desktop. Margens laterais de 16px no mobile.

## 7. Telas a produzir (MVP — 22 telas)

Cada tela abaixo lista o objetivo, o conteúdo obrigatório e o CTA principal. As telas **20 a 22 são novas** nesta versão. A tela 4 contém duas rotas (pedir e redefinir).

**Mapa de rotas sugerido**

| Área | Rotas |
|---|---|
| Públicas | `/`, `/cadastro`, `/entrar`, `/recuperar-senha`, `/redefinir-senha`, `/certificado/validar`, `/termos`, `/privacidade` |
| Participante (login obrigatório) | `/onboarding`, `/diagnostico`, `/diagnostico/resultado`, `/inicio`, `/case`, `/case/tarefa/:id`, `/case/resultado`, `/conteudos/:id`, `/certificados`, `/perfil`, `/pontos` |
| Equipe (login + papel “equipe”) | `/admin/cases`, `/admin/cases/novo`, `/admin/cases/:id`, `/admin/correcao`, `/admin/correcao/:entregaId`, `/admin/conteudos` |
| Sistema | `404`, `403`, erro genérico, sessão expirada, manutenção |

### Públicas

**1. Landing**
- Objetivo: explicar a proposta e converter em cadastro.
- Conteúdo: hero com título, subtítulo e formas curvas; “Como funciona” em 4 passos (diagnóstico, case semanal, conteúdos, certificado); bloco de pontos (“ganhe pontos a cada passo”); prévia de um case; FAQ curto; rodapé.
- Qualquer exemplo de resultado na landing deve seguir a regra da tela 8: afinidade relativa em porcentagem, sem “match”, e com a legenda “exemplo”.
- CTA: **Quero participar**.

**2. Cadastro**
- Campos: nome, e-mail, senha (com indicador de força e requisitos visíveis: mínimo de 8 caracteres), confirmar senha, aceite de termos e privacidade (checkbox obrigatório com links).
- Aviso curto: “Usamos seus dados só para a plataforma. Veja a Política de privacidade.”
- Estados: erro por campo, e-mail já cadastrado, senha fraca, carregando, sucesso.
- Após criar: ir para **Verifique seu e-mail** (estado dentro desta tela, com “reenviar e-mail”, ativo quando a verificação estiver ligada) e depois para o onboarding.
- CTA: **Criar conta**. Link: “Já tenho conta”.

**3. Login**
- Campos: e-mail e senha (com mostrar/ocultar), “Esqueci minha senha”.
- Mensagem de erro **genérica** (“E-mail ou senha incorretos”), sem revelar se o e-mail existe.
- Estados: carregando, erro, **muitas tentativas** (“Aguarde alguns minutos e tente de novo”), e-mail não verificado.
- Após entrar: voltar à página que ela tentava abrir; se não houver, ir para `/inicio` (participante) ou `/admin/cases` (equipe). Se o perfil estiver incompleto, ir para `/onboarding`.
- CTA: **Entrar**. Link: “Criar conta”.

**4. Recuperar e redefinir senha**
- **Recuperar:** campo de e-mail. Mensagem de confirmação **sempre igual**, exista ou não a conta (“Se o e-mail estiver cadastrado, enviamos as instruções”).
- **Redefinir** (abre pelo link do e-mail): nova senha com indicador de força, confirmar senha. Estados: link inválido ou expirado (com “pedir novo link”), sucesso (“Senha alterada”, botão **Entrar**).

**5. Validação de certificado (pública)**
- Campo de código; resultado válido (nome, case, data de emissão) ou inválido (“Não encontramos este certificado”). Sem login. Mostrar só o necessário: nome completo, título do case e data.
- Aceita o código também pela URL (`/certificado/validar?codigo=...`).
- CTA: **Validar**.

### Participante

**6. Onboarding / perfil inicial**
- Boas-vindas, campos de perfil (nome social, data de nascimento, cidade/UF, escolaridade, objetivo) em etapas curtas, com barra de progresso.
- **[EM ABERTO]** Idade mínima: se a data indicar menor que a idade mínima, mostrar mensagem de bloqueio acolhedora (sem prosseguir). Deixar o texto fácil de trocar.
- Ao concluir: aviso **+20 pontos** e convite para o diagnóstico.

**7. Diagnóstico de fit** (especificação completa em `PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md`)
- **Introdução** (tela própria, antes da 1ª pergunta): título “Descubra como você gosta de pensar e trabalhar”; texto obrigatório “Este diagnóstico é exploratório. Não há respostas certas e nenhuma área será descartada.”; três pontos (15 perguntas, resultado em 3 abas, você pode voltar e mudar respostas); **consentimento informativo** (para que servem os dados, por quanto tempo ficam, como excluir, com link para a Política de privacidade). CTA **Começar**.
- **15 perguntas obrigatórias**, com o texto exato de `obterConfiguracao()` (Q01–Q15). A tela **nunca escreve o texto das perguntas à mão**. Cada pergunta tem três botões grandes **A**, **B** e **C**, com o texto completo da opção. A **C** (“As duas me interessam igualmente.”) tem o mesmo peso visual das outras: não pode parecer “pular”.
- **Moldura de conversa**: a **Galá** mostra a pergunta em um balão e a resposta escolhida aparece como balão da participante. **Sem avatar, sem mascote, sem selo “IA” e sem campo de texto livre.** A Galá aparece só com o nome e um ícone neutro.
- **Falas da Galá pré-escritas e fixas**, curtas: abertura, uma transição a cada 5 perguntas (“Você já respondeu 5 de 15”) e o fechamento. Nada é gerado por IA.
- Progresso **“x/15”**, **Voltar e revisar** (ir a qualquer pergunta anterior e mudar a resposta), **Salvar e continuar depois**. O estado de seleção é visível sem depender de cor, acessível por teclado, com alvos de toque ≥ 44px.
- **Revisão antes do envio**: lista das 15 respostas (A, B ou C) com “editar” em cada uma. **Ver meu resultado** só fica habilitado com as 15 respondidas; antes disso mostra “Faltam N perguntas”.
- Estados: não iniciado, em andamento, retomado, enviando, erro ao enviar (com tentar de novo) e concluído.

**8. Resultado: Seu Mapa de Carreira** (layout de `docs/ref-visual-resultado-diagnóstico.png`)
- A imagem de referência é **verde e vale só como layout**. Usar a paleta da marca (azul e rosa).
- Cabeçalho “Seu Mapa de Carreira”. **Não mostrar** o título de arquétipo do exemplo (“Investigadora estratégica”): o PRD não define regra para isso. **[EM ABERTO]**
- Abas **1. Perfil**, **2. Trabalho**, **3. Áreas**, como controle segmentado navegável por teclado.
- **1. Perfil** (“Quem é você?”): seis indicadores bipolares D1–D6. Cada um mostra os dois polos nas pontas, a trilha e o marcador na posição `valor` (0 = polo da esquerda, 100 = polo da direita, na ordem da taxonomia do PRD), **sem número nem porcentagem**: só a posição do marcador (decisão do time, a partir de uma captura de tela). O marcador no meio é equilíbrio, não desinteresse. O lado também vai em texto para leitores de tela (`aria-label`), sem depender da cor. Caixa “O que isso significa?”: “Esses indicadores mostram tendências relativas, não capacidades ou limitações. É possível ter interesse nos dois extremos de um mesmo eixo.”
- **2. Trabalho** (“Como você prefere trabalhar?”): seis indicadores D7–D12, no mesmo formato. A seção “Ambientes que mais combinam com você” da imagem **fica fora desta versão**: o PRD proíbe percentuais de ambientes sem uma matriz própria. **[EM ABERTO]**
- **3. Áreas** (“Onde você pode se encontrar?”): as **13 áreas** em ordem de `posicao`. Cada card mostra ícone, nome e a **afinidade em porcentagem** (`pontuacao`, inteiro, sempre com “%”, ex.: “77%”). O **Top 3** tem destaque visual e aparece como um grupo, “Áreas para explorar primeiro”, sem “melhor match”. Abaixo do Top 3: “Pequenas mudanças nas respostas podem mudar a ordem das áreas.”
- **Card expandido** (um aberto por vez; o primeiro vem aberto): duas colunas, **Perfil (quem você é)** e **Trabalho (como você prefere atuar)**, cada uma com até 3 características e barra; bloco **Por que combina?** com o texto de `porQueCombina`; bloco **Diferenças para explorar** com `diferencas` (“Na área: … · Para você: …”), que pode vir vazio (“Sem diferenças relevantes nas dimensões mais importantes da área.”). Abaixo de 480px, as duas colunas viram uma.
- Caixa fixa **“Importante”**: “As pontuações indicam afinidade relativa, não uma recomendação única. Explore as áreas, converse com profissionais e experimente na prática para descobrir o que realmente faz sentido para você.” Em letra pequena, as versões do questionário, do scoring e da matriz.
- Se `respostasC` ≥ 10: aviso “Você marcou ‘as duas me interessam igualmente’ em muitas perguntas. Isso é normal, mas deixa o resultado menos distintivo. Você pode revisar suas respostas.” **[SUPOSIÇÃO]** do limite.
- **Nunca** chamar o score de “match”, “probabilidade”, “nota” ou “chance”. Ordenar sempre por `posicao`. Barras proporcionais à porcentagem.
- Aviso **+100 pontos** no primeiro envio. CTA **Ver o case da semana**; secundário **Refazer diagnóstico** (o resultado anterior fica no histórico e os pontos não se repetem).

**9. Home**
- Cartão de pontos e nível (seção 5.3).
- Cartão do **case da semana**: título, área, prazo (contagem regressiva), progresso dos checkpoints, CTA **Continuar case**.
- Top 3 do diagnóstico, com o nome e a porcentagem de afinidade de cada área e o link “Ver meu mapa”.
- Últimos pontos ganhos (3 itens) com link “ver extrato” (leva a `/pontos`).
- Se o diagnóstico não foi feito, o cartão principal passa a ser **“Faça seu diagnóstico”**.

**10. Case da semana**
- Cabeçalho com título, área, prazo e pontos totais possíveis.
- Contexto do case (texto).
- Lista de **checkpoints** em linha do tempo vertical, cada um com status (a fazer, em andamento, concluído) e “+30 pts”.
- Conteúdos de apoio sugeridos (cards).
- Estados do case: **ainda não liberado** (“Seu case chega na segunda”, com contagem regressiva), aberto, prazo próximo (menos de 24h), encerrado sem entrega, entregue (aguardando avaliação), resultado publicado.
- CTA: **Continuar** (leva ao próximo checkpoint/tarefa).

**11. Tarefa / entrega**
- Enunciado, material de apoio (tabela de dados simples), campos de resposta (texto longo, **numérico com unidade e aceitação de vírgula decimal**, upload de arquivo).
- **Nunca mostrar o gabarito** em nenhuma situação nesta tela. Ele não existe nos dados que a participante recebe.
- Salvar rascunho automático com indicador “Salvo às 14:32”.
- Resumo da entrega antes de enviar, com confirmação.
- Estado de prazo encerrado (somente leitura).
- CTA: **Enviar entrega** (+100 pts).

**12. Resultado do case**
- Estado “em avaliação” (antes do resultado) e estado “resultado disponível”.
- Nota geral, feedback por tarefa, pontos fortes, pontos a melhorar, pontos ganhos.
- O feedback aparece com o selo **IA** e a legenda “Gerado com apoio de IA e revisado pela equipe”. Só é exibido **depois que a equipe publica**.
- Botão **Pedir revisão** (recurso) em cada tarefa, com campo de motivo (texto curto) e confirmação.
- CTA: **Baixar certificado**. Secundário: ir para o próximo case.

**13. Conteúdo**
- Leitura ou vídeo incorporado, tempo estimado, termos explicados em destaque, botão **Marcar como concluído** (+10 pts).

**14. Meus certificados**
- Lista de certificados com pré-visualização, data, código, **Baixar PDF** e **Copiar link de validação**. Estado vazio.

**15. Perfil e configurações**
- Abas: **Dados**, **Segurança** (alterar senha, sair de todos os aparelhos), **Notificações**, **Privacidade** (baixar meus dados, excluir conta).
- Cartão de nível com link para `/pontos` e acesso a **Meus certificados**.
- Excluir conta: modal que explica o que será apagado, exige digitar a senha e confirma.

### Equipe (admin)

**16. Lista de cases**
- Tabela com título, área, status (**Rascunho (IA)**, Revisado, Publicado, Arquivado) e ações. Filtro por status. Botão **Novo case**.
- Cases gerados por IA mostram o selo **IA** até serem revisados.
- Acesso só para o papel “equipe”: quem não tem o papel vê a tela 22 (403).

**17. Editor de case com IA**
- **Passo 1: Briefing.** Campos: área, dificuldade, tema, número de checkpoints e tarefas, tipo de dados de apoio, observações. Botão **Gerar rascunho com IA** com estado de carregando.
- **Passo 2: Rascunho editável.** Seções: contexto, checkpoints, tarefas (com pontos), dados de apoio (tabela editável), **gabarito** com a conta passo a passo e tolerância numérica, conteúdos vinculados. Cada seção tem o selo **IA** e o botão **Regenerar esta seção**.
- Aviso de **divergência de gabarito** quando a conferência automática não bate com o valor gerado.
- Status visível: “Rascunho (IA)” → “Revisado” → “Publicado”. Para aprovar, a equipe marca “Revisei o gabarito”.
- Sem agendamento: o case publicado entra na trilha e abre toda semana (segunda a sexta). CTA: **Salvar rascunho**, **Aprovar case** e **Publicar**.
- Tudo com dados fictícios no mock, mas com os estados de carregando, erro de geração e sucesso.

**18. Fila de correção**
- Lista de entregas com participante, case, **nota sugerida pela IA** (selo **IA**) e status (pendente, revisada, publicada). Detalhe lado a lado: resposta da participante × gabarito × sugestão da IA, com o feedback gerado editável e campo para ajustar a nota.
- A fila mostra **como a nota foi calculada**: parte conferida por código (número × gabarito com tolerância) e parte interpretada pela IA. Respostas fora do formato aparecem destacadas.
- Fila de **pedidos de revisão** das participantes, com o motivo.
- Nota e feedback só chegam à participante depois de **Aprovar** e **Publicar resultados**. Mostrar quantas entregas faltam aprovar antes de habilitar a publicação em lote.
- CTA: **Aprovar nota**. Ação em lote: **Publicar resultados**.

**19. Conteúdos (admin)**
- Lista e formulário de conteúdo (título, tipo, área, texto/URL, vínculo com case).

### Novas telas (v2)

**20. Termos de uso e Política de privacidade**
- Duas páginas de texto simples, legíveis, com índice lateral no desktop e a data da última atualização. O texto é **provisório** e fácil de substituir (marcado “Texto a ser revisado pelo jurídico”). Inclui direitos da titular (acesso, correção, exclusão) e menção ao uso de IA.

**21. Extrato de pontos**
- Cartão de nível no topo. Lista cronológica: ação, case ou origem, data, **+N pontos**. Filtro por período. Estado vazio (“Você ainda não ganhou pontos. Comece pelo diagnóstico.”). Tabela de “como ganhar pontos” (seção 5.1) numa seção recolhível.

**22. Páginas de sistema**
- **404** (página não encontrada), **403** (sem permissão, ex.: participante tentando abrir `/admin`), **erro genérico** (“Algo deu errado. Tente de novo”) e **sessão expirada** (modal “Sua sessão expirou. Entre de novo”, que preserva o que ela estava fazendo quando possível). Opcional: **manutenção**. Todas com forma curva, botão para voltar ao início.

## 8. Componentes a criar (biblioteca)

**Selo IA** (pílula rosa clara, ícone de brilho, com dica “Gerado com apoio de IA e revisado pela equipe”; no admin, “Sugerido pela IA, aguardando revisão”) · Balão de conversa (Galá e participante) · Botões de opção A/B/C · Tela de revisão de respostas · Indicador bipolar (polos, trilha e marcador, sem número) · Abas segmentadas · Card de área expansível com duas colunas · Caixa informativa (“Importante”, “O que isso significa?”) · Botão (primário, secundário rosa, texto, desabilitado, carregando) · Input, textarea, select, escolha única/múltipla, escala 1–5 · Card · Chip · Barra de progresso · Linha do tempo de checkpoints · Contador de pontos · Cartão de nível · Toast de pontos · Selo “+N pts” · Tabela · Abas · Modal de confirmação · Alerta (info, sucesso, aviso, erro) · Estado vazio · Skeleton de carregamento · Barra de navegação (inferior e lateral) · Cabeçalho com onda · Upload de arquivo · Contagem regressiva de prazo · **Indicador de força de senha** · **Etapas (stepper)** · **Tabela editável** (dados de apoio do case) · **Comparação lado a lado** (resposta × gabarito × sugestão da IA) · **Badge de status** (rascunho, revisado, agendado, publicado) · **Tooltip** · **Guarda de rota** (redireciona quem não tem login ou papel) · **Banner de sessão expirada**.

## 9. Estados obrigatórios

Para cada tela com dados: **carregando** (skeleton), **vazio**, **erro** (com tentar de novo) e **sucesso**. Casos específicos:

- Case da semana: antes da liberação, aberto, prazo próximo (menos de 24h, cor de aviso), encerrado, em avaliação, resultado publicado.
- Diagnóstico: não iniciado, em andamento (parcial), retomado, completo para enviar, enviando, erro ao enviar, concluído; resultado com muitas respostas C.
- Formulários: validação em tempo real, mensagem de erro clara abaixo do campo.
- Autenticação: sem login, sessão expirada, sem permissão, muitas tentativas, e-mail não verificado, link de redefinição expirado.
- IA (ver seção 15, só geração de cases e correção): gerando, falha, indisponível com fallback, divergência de gabarito, rascunho aguardando revisão.
- Conexão: sem internet (aviso e botão de tentar de novo), com rascunho salvo localmente quando possível.

## 10. Dados fictícios de exemplo

- Participante: “Marina Costa”, com resultado do diagnóstico pré-calculado pelo mock (Top 3: Quant 77%, Equity Research 72% e Macroeconomia 72%), 210 pontos, nível 2 · Aprendiz (faltam 190 para Analista). Está no meio do case da semana: 3 de 4 checkpoints concluídos.
- Case da semana: “Avaliando uma empresa para investir” (área Investimentos), 4 checkpoints, 3 tarefas, prazo sexta 23:59.
- Conteúdos: 4 itens (artigo “O que é valuation?”, vídeo “Lendo um balanço”, glossário, link externo).
- Equipe: “Ana Souza” (papel equipe). Participantes extras para a fila de correção: “Júlia Lima”, “Beatriz Rocha”, “Camila Dias”.
- Diagnóstico: perguntas e opções **exatamente** como no PRD do diagnóstico (Q01–Q15), vindas de `obterConfiguracao()`. Falas da Galá, pré-escritas: “Oi! Eu sou a Galá. Vou te fazer 15 perguntas rápidas para você descobrir como gosta de pensar e trabalhar. Não existe resposta certa.” · “Você já respondeu 5 de 15.” · “Metade do caminho: 8 de 15!” · “Pronto! Vamos ver o seu mapa.”
- Case: resposta numérica de exemplo “Margem líquida = 12,4%” com tolerância ±0,2 p.p. (só no admin, nunca na participante).
- Entrega em correção: resposta da participante “12,35%”, nota sugerida 9,0, feedback gerado e uma resposta fora do formato (“12.4 %”) destacada.
- Cases no admin: 1 rascunho gerado por IA com aviso de divergência de gabarito, 1 agendado, 1 publicado.
- Áreas (13, do PRD do diagnóstico): Investment Banking, Asset Management, Wealth Management, Equity Research, Sales & Trading, Quant, Crédito e Risco, Fintechs, Venture Capital, Private Equity, Corporate Finance, Macroeconomia e Operações. 

## 11. Critérios de aceite

- [ ] As 22 telas (e as rotas do mapa da seção 7) existem e estão navegáveis entre si.
- [ ] **Autenticação:** cadastro, login, recuperar e redefinir senha funcionam como na seção 14, com mensagens genéricas e rotas protegidas por login e por papel.
- [ ] **IA:** o selo “IA” aparece no feedback do resultado do case, no editor de case e na fila de correção. **Não aparece no diagnóstico**, que não usa IA.
- [ ] **Diagnóstico:** introdução com consentimento; 15 perguntas com o texto vindo de `obterConfiguracao()`; A, B e C com o mesmo peso visual; sem texto livre; voltar, revisar e alterar respostas; envio só com as 15; resultado em 3 abas conforme a tela 8.
- [ ] **Resultado:** as áreas aparecem em porcentagem e os indicadores de Perfil e Trabalho mostram só a posição do marcador, sem número; Top 3 em destaque como grupo; nenhum uso de “match”, “probabilidade” ou “nota”; aviso “Importante” sempre visível; sem arquétipo e sem “ambientes” enquanto não houver regra no PRD.
- [ ] **Admin:** editor de case gera rascunho (mock) com seções editáveis, regenera por seção, alerta divergência de gabarito e só agenda após “Revisei o gabarito”.
- [ ] **Correção:** nota só chega à participante após aprovada e publicada pela equipe.
- [ ] **Segurança de dados:** o gabarito não aparece em nenhuma estrutura de dados entregue às telas da participante.
- [ ] **Camada de serviços:** nenhuma tela acessa dados diretamente; tudo passa pelas funções da seção 16, com adaptador mock com estado.
- [ ] **Fluxo de ponta a ponta no mock:** cadastrar → diagnóstico → resultado → case → entrega → (equipe) gerar e aprovar case, corrigir e publicar → resultado e certificado para a participante.
- [ ] **Estados forçáveis:** é possível provocar erro de rede, IA indisponível, sessão expirada e sem permissão sem mexer no código das telas.
- [ ] Arquivo de contratos (tipos e assinaturas) entregue e coerente com o mock.
- [ ] Aviso visível “Ambiente de demonstração” e nenhum segredo, chave ou URL de serviço real no código.
- [ ] Funcionam em 360px, 768px e 1280px sem rolagem horizontal.
- [ ] Todos os valores de cor, raio, sombra e espaçamento vêm de tokens, sem valores soltos.
- [ ] Paleta respeitada: azul dominante, rosa só como acento, branco como base.
- [ ] Contraste AA verificado nos textos e botões.
- [ ] Formas curvas presentes no cabeçalho da landing, no resultado do diagnóstico e nos cabeçalhos principais, sem atrapalhar a leitura.
- [ ] Pontos visíveis no cabeçalho em todas as telas internas, com toast no ganho.
- [ ] Nenhuma tela ou espaço para avatar, mascote, badge, streak ou ranking.
- [ ] Todos os estados da seção 9 representados.
- [ ] Textos em português do Brasil, sem texto genérico tipo “Lorem ipsum”.
- [ ] Navegação por teclado e foco visível nos elementos interativos.

## 12. Ordem sugerida de geração

1. Tokens, tipografia e componentes base (incluindo selo IA, balão de conversa, botões A/B/C e indicador bipolar).
2. Camada de serviços com adaptador mock, sessão e guarda de rotas.
3. Layouts (público, participante, admin) e navegação.
4. Autenticação: Cadastro, Login, Recuperar/Redefinir, Termos e Privacidade.
5. Fluxo principal: Landing → Onboarding → Diagnóstico (introdução, 15 perguntas, revisão) → Resultado em 3 abas → Home.
6. Fluxo do case: Case → Tarefa → Resultado → Certificados → Validação pública.
7. Conteúdo, Perfil e Extrato de pontos.
8. Admin: Lista de cases → Editor com IA → Fila de correção → Conteúdos.
9. Páginas de sistema (404, 403, erro, sessão expirada).
10. Revisão de consistência, acessibilidade, estados e critérios de aceite.

## 13. Pontos em aberto

- Nome do logotipo e arquivo da marca (usar um logotipo provisório em texto até receber o oficial).
- Stack definitiva (a da seção 2 é recomendação).
- Valores finais da tabela de pontos e dos níveis (os da seção 5 são de exemplo).
- Lista final de áreas do mercado financeiro.
- Idade mínima, verificação de e-mail no MVP, modelo da API da OpenAI, correção qualitativa e nome do agente (“Galá” é provisório), título de arquétipo do resultado e seção de ambientes sugeridos (ambos sem regra no PRD do diagnóstico). Ver `PRD.md` seção 12 e `IA.md`.

## 14. NOVO — Autenticação e acesso

**Decisão: autenticação própria (e-mail e senha), implementada no nosso backend, sem provedores externos** (nada de Supabase Auth, Firebase, Clerk, Auth0 nem login social). O contrato de `sessaoService` não muda: o mock de hoje e o backend próprio de amanhã cumprem a mesma interface.

**Fluxos**
1. **Cadastro** → (verificação de e-mail, se ligada) → onboarding → diagnóstico.
2. **Login** → destino conforme o papel e o estado do perfil (seção 7, tela 3).
3. **Esqueci a senha** → e-mail com link → redefinir → login.
4. **Sair** (menu da usuária) e **sair de todos os aparelhos** (Perfil → Segurança).
5. **Excluir conta** (Perfil → Privacidade).

**Papéis**
- `participante` (padrão) e `equipe`. O papel **nunca** é escolhido no cadastro nem enviado pelo cliente. No mock, definir por usuário fictício.
- A guarda de rota bloqueia `/admin/*` para quem não é `equipe` (tela 403) e redireciona visitantes sem login para `/entrar`, guardando o destino.

**Regras de experiência**
- Mensagens de erro de login e de recuperação **não revelam** se o e-mail existe.
- Senha: mínimo de 8 caracteres, indicador de força, bloqueio de senhas comuns (mensagem amigável).
- Sessão expirada: modal que leva ao login e volta ao ponto anterior.
- Botões de envio ficam desabilitados com estado de carregando para evitar duplo envio.
- Nunca guardar senha, token ou gabarito em `localStorage` de forma exposta além do necessário para a sessão do provedor.

## 15. NOVO — A IA na interface

Resumo do `IA.md`. Em toda tela abaixo, mostrar o **selo “IA”** e implementar os estados de falha. **O diagnóstico (telas 7 e 8) não usa IA e não leva o selo.**

| Uso | Telas | O que a interface mostra | Estados obrigatórios |
|---|---|---|---|

| Geração de cases | 16, 17 | Briefing → rascunho editável, selo IA em cada seção, regenerar seção, **aviso de divergência de gabarito**, status “Rascunho (IA)” | Gerando, falha de geração (“Não conseguimos gerar agora. Tente de novo ou preencha manualmente”), rascunho salvo, aprovado |
| Correção | 12, 18 | Nota sugerida e feedback com selo IA, comparação lado a lado, fila de revisão e pedidos de recurso | Corrigindo, IA falhou (entrega vai para a fila como “correção manual”), aguardando aprovação, publicado |

**Regras**
- A IA **sugere**; nada de nota, case ou certificado sai sem a aprovação da equipe.

- Nenhum campo de texto livre para a participante falar com a IA. O único texto livre da participante é a **resposta do case** e o **motivo do recurso**, que **não** passam por conversa.
- Dica do selo: “Gerado com apoio de IA e revisado pela equipe” (participante) · “Sugerido pela IA, aguardando revisão” (equipe).
- Nenhum dado pessoal vai à IA: no mock, simular isso mostrando só ID de sessão nas chamadas.

## 16. NOVO — Camada de serviços e contratos

Toda tela usa estas funções. Como só o front é gerado, **o adaptador mock é a única implementação**: retorna dados fictícios com atraso simulado (300–800ms) e **simula erros e falhas de IA** (por exemplo, por uma chave de debug na URL ou em um painel oculto de desenvolvimento) para que todos os estados possam ser vistos. Quando o backend existir, só o adaptador muda.

**Mock com estado:** o adaptador mantém o estado em memória, e opcionalmente em `localStorage` para sobreviver a recarregamentos, só para fins de demonstração. Cadastro cria uma usuária fictícia, o diagnóstico guarda respostas, a entrega aparece na fila de correção, a nota aprovada chega ao resultado, e os pontos mudam conforme as ações. Assim o fluxo completo é demonstrável de ponta a ponta. Incluir dois logins de demonstração: `participante@demo` e `equipe@demo` (senhas fictícias exibidas num aviso “Ambiente de demonstração”).

**Entidades principais:** `Perfil` (inclui `papel`), `Area`, `PerguntaDiagnostico`, `Dimensao`, `ResultadoDiagnostico`, `AfinidadeArea`, `Case`, `Checkpoint`, `Tarefa`, `Gabarito` (**somente servidor e equipe**), `Entrega`, `Correcao`, `Conteudo`, `EventoPontos`, `Certificado`, `LogIA`.

**Serviços**

| Grupo | Funções |
|---|---|
| Sessão | `cadastrar`, `entrar`, `sair`, `sairDeTodosOsAparelhos`, `recuperarSenha`, `redefinirSenha`, `obterSessao`, `excluirConta` |
| Perfil | `obterPerfil`, `atualizarPerfil`, `registrarAceiteTermos`, `exportarMeusDados` |
| Catálogo | `listarAreas`, `obterArea` |
| Pontos | `obterSaldoENivel`, `listarExtrato`, `listarRegrasDePontos` (**só leitura**: os pontos são concedidos pelo servidor) |
| Diagnóstico | `obterConfiguracao`, `iniciarDiagnostico`, `responderPergunta` (A, B ou C; qualquer ordem até o envio), `finalizarDiagnostico`, `obterResultadoDiagnostico` (sem IA; cálculo determinístico e versionado) |
| Case (participante) | `obterTrilha` (todos os cases com estado, semana e “pode escolher”), `escolherCase` (um por semana; define o prazo), `obterCase`, `obterTarefa`, `salvarRascunho`, `concluirCheckpoint` (em ordem; trava as respostas), `enviarCase`, `obterResultadoCase`, `pedirRevisao`. **Modelo de trilha:** ver `PRD_Cases_Trilha.md` |
| Conteúdos | `listarConteudos`, `obterConteudo`, `concluirConteudo` |
| Certificados | `listarMeusCertificados`, `baixarCertificado` (PDF), `obterLinkLinkedIn`, `validarCertificado` (público) |
| Admin: cases | `listarCases`, `obterCase`, `gerarRascunhoComIA`, `regenerarSecao`, `salvarCase`, `conferirGabarito`, `aprovarCase`, `publicarCase`, `arquivarCase` |
| Admin: correção | `listarEntregas`, `obterEntregaComSugestaoIA`, `ajustarNotaEFeedback`, `aprovarNota`, `publicarResultados`, `listarPedidosRevisao`, `resolverPedidoRevisao` |
| Admin: conteúdos | `listarConteudosAdmin`, `salvarConteudo`, `removerConteudo` |

**Fonte da verdade:** os contratos em código estão em `front/src/services/contratos.ts` (tipos e interfaces) e o adaptador mock em `front/src/services/mock/`. Em caso de divergência, vale o código. A tabela acima é só um resumo.

**Regras dos contratos**
- Funções que concedem pontos (`finalizarDiagnostico`, `concluirCheckpoint`, `concluirConteudo`, etc.) **retornam os eventos de pontos criados**, e a tela só exibe o toast a partir deles. A tela nunca soma pontos por conta própria.
- `obterTarefa` e `obterCase` **nunca** devolvem gabarito.
- Saídas de IA são **estruturadas** (JSON) e validadas; se inválidas, usar o fallback.
- Todas as funções devolvem `{ dados, erro }` com erro tipado (`SEM_LOGIN`, `SEM_PERMISSAO`, `NAO_ENCONTRADO`, `VALIDACAO`, `LIMITE_EXCEDIDO`, `IA_INDISPONIVEL`, `REDE`). As telas tratam cada um.

**Nota para a construção do backend (fora do escopo da ferramenta de telas, mantida aqui como referência)**
- Tabelas: `perfis` (com `papel` definido só pelo servidor), `areas`, `avaliacoes_diagnostico` e `resultados_diagnostico` (com as versões do questionário, do scoring e da matriz), `cases`, `checkpoints`, `tarefas`, `gabaritos`, `entregas`, `correcoes`, `conteudos`, `eventos_pontos`, `certificados`, `logs_ia`.
- **Autorização na própria API, em toda rota:** a participante só lê e escreve as próprias linhas; `gabaritos` e `logs_ia` **não** são legíveis por participantes; rotas de admin exigem o papel `equipe`. Com Postgres, dá para reforçar com RLS.
- **Autenticação própria:** senha guardada só como hash lento com sal (argon2id ou bcrypt), nunca em texto; sessão em cookie `httpOnly`, `Secure` e `SameSite`, com expiração e revogação; proteção contra CSRF; limite de tentativas de login; token de redefinição de senha aleatório, de uso único, com validade curta e guardado só como hash; resposta de recuperação igual para qualquer e-mail.
- Pontos, correção, publicação e certificado **só por rotas de servidor**. Chaves de IA e de serviço só em variáveis de ambiente do servidor.
- Limite de requisições nas rotas de IA e registro de cada chamada (entrada, saída, versão do prompt, custo, latência).
- Chamadas de IA (API da OpenAI) só do servidor; **nenhuma chave no front**.
