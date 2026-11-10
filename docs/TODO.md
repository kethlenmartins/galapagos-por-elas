# To-dos por etapa — Galapagos por Elas

> Marque `[x]` ao concluir. Cada etapa termina com uma **entrega verificável**. Tamanhos são relativos (`P`/`M`/`G`), não prazos, pois ainda não definimos equipe nem data.
>
> **Escopo do MVP:** um único case semanal para testes, com autenticação, backend e IA reais (geração de cases no admin e correção; o diagnóstico de fit é determinístico, sem IA). Gamificação só com pontos. Ver `PRD.md`, `PRD-TELAS-IA.md` e `IA.md`.
>
> **Duas trilhas:** o front é gerado por uma IA (só front, com adaptador mock). O backend é construído por nós atrás da camada de serviços. Tags: **[F]** front · **[B]** backend · **[F+B]** integração.

## Etapa 0 — Decisões e fundação

**Entrega:** decisões fechadas e ambientes prontos.

Feito
- [x] README com escopo
- [x] PRD de produto (`PRD.md`)
- [x] Lista de telas e corte do MVP (`TELAS.md`)
- [x] Mapa de usos de IA (`IA.md`)
- [x] Briefing para a IA gerar as telas (`PRD-TELAS-IA.md`, v2)
- [x] Decisão: gamificação só com pontos (sem avatar, mascote, badges, streak ou ranking)

A decidir
- [x] **Cases como trilha (base e telas principais):** contratos, mock, testes e as telas do mapa da trilha, do case por etapas, dos certificados (PDF e LinkedIn) e da validação pública estão prontas (ver `PRD_Cases_Trilha.md`). Falta: fechar o corte do prazo, quando sai o resultado e quantos cases há no lançamento; treino, defesa com comitê e rubrica. Todas as telas já leem dos serviços (Home, extrato, nível, conteúdos, perfil, onboarding e admin de cases, conteúdos e correção); só a Landing mantém um exemplo ilustrativo `G`
- [x] Decidir e registrar como ADR: backend próprio (TypeScript + Node/Fastify), PostgreSQL/Drizzle e hospedagem Render. **Decidido:** autenticação própria, sem provedores externos; ver `docs/adr/0001-stack-e-escopo-do-piloto.md` `M`
- [ ] Escolher o modelo da API da OpenAI, definir o **teto de gasto** na conta e revisar os termos de dados e de retenção da API (LGPD) `M`
- [ ] Definir se a verificação de e-mail entra no MVP `P`
- [ ] Definir idade mínima e tratamento de menores `P`
- [x] Correção qualitativa: IA sugere e a equipe revisa (decidido)
- [ ] Mentora: definir o limite de mensagens por usuária e por dia, o teto de gasto e a moderação (escopo já decidido: só mercado financeiro) `M`
- [ ] Fechar a lista de áreas do mercado financeiro `P`
- [ ] Definir critério e emissor do certificado `P`
- [ ] Definir quem da equipe revisa e aprova cases e notas `P`
- [ ] Definir o nome do agente da moldura do diagnóstico (provisório: “Galá”) e o tom das falas pré-escritas `P`
- [ ] Revisão editorial do texto das 15 perguntas e das descrições das 13 áreas (pendente no PRD do diagnóstico) `M`
- [ ] Decidir o título de arquétipo do resultado e a seção de “ambientes sugeridos” (a imagem de referência tem; o PRD não define regra) `P`
- [ ] Levantar a identidade visual da Galapagos (logo, cores, fonte) `P`

Fundação técnica
- [ ] Criar a estrutura do backend, lint, formatação e CI básico `M`
- [x] Escopo do piloto definido para um único ambiente Render; Blueprint preparado em `render.yaml` (provisionamento aguarda autorização/conta Render) `M`
- [ ] Configurar gestão de segredos (chave da OpenAI, segredo de sessão e acesso ao banco em variáveis de ambiente; nada no repositório) `M`
- [ ] **Decidir como enviar o e-mail de redefinição de senha:** sem provedor externo é preciso um servidor SMTP próprio; sem e-mail, a recuperação de senha não funciona (alternativa: redefinição pela equipe) `M`

## Etapa 1 — Front: revisão e fechamento das telas

**Trilha F.** **Entrega:** front completo, aprovado pelo time, com adaptador mock e contratos.

- [ ] Reenviar o `PRD-TELAS-IA.md` v2 à IA geradora e receber as 22 telas `M`
- [ ] Checar as 22 telas e as rotas contra o mapa da seção 7 `M`
- [ ] Checar paleta, tokens, formas curvas e ausência de avatar, mascote, badge, streak e ranking `P`
- [ ] Revisar o diagnóstico de fit: introdução com consentimento, 15 perguntas A/B/C sem texto livre, revisão antes do envio e resultado em 3 abas, tudo em porcentagem `M`
- [ ] Revisar o editor de case com IA e a fila de correção `M`
- [ ] Conferir o selo “IA” em todas as telas previstas e os estados de falha `M`
- [ ] Testar o fluxo de ponta a ponta no mock (cadastro → diagnóstico → case → entrega → correção → resultado) `M`
- [ ] Revisar acessibilidade (contraste, foco, teclado, leitor de tela) `M`
- [ ] Testar em celular real e em 360px, 768px e 1280px `M`
- [ ] Validar o protótipo com 3 a 5 pessoas do público `M`
- [ ] Revisar os textos de Termos e Privacidade com o jurídico `M`
- [ ] Conferir se o arquivo de contratos (tipos e funções) está completo e coerente com o mock `M`
- [ ] Verificar que não há segredos, chaves ou URLs reais no código gerado `P`

## Etapa 2 — Backend: base, autenticação e dados

**Trilha B.** **Entrega:** banco, autenticação própria funcionando e papéis, com autorização em toda rota. Pode andar em paralelo com a Etapa 1.

- [x] Schema inicial para contas/sessões, diagnósticos, cases, checkpoints, tarefas, entregas e eventos de pontos em `backend/src/db/schema.ts` `G`
- [x] Migração inicial versionada em `backend/drizzle/` `M`
- [ ] **Autorização em toda rota da API** (dona só vê o que é dela; gabarito e `logs_ia` só para a equipe; admin só com papel `equipe`); RLS adicional se o banco for Postgres `G`
- [ ] Autenticação própria: cadastro, login, logout e sair de todos os aparelhos; senha com hash lento e sal (argon2id ou bcrypt); sessão em cookie `httpOnly`/`Secure`/`SameSite` com expiração; proteção contra CSRF `G`
- [ ] Recuperação e redefinição de senha com token aleatório, de uso único, validade curta e guardado só como hash `M`
- [ ] Papel (`participante`, `equipe`) definido só pelo servidor; nenhum campo do cliente muda o papel `M`
- [ ] Criar a conta da equipe (seed) `P`
- [ ] Seed das 13 áreas, perguntas e matriz do diagnóstico (versão 1.1), regras de pontos e níveis `M`
- [ ] **Testes automáticos de autorização** (uma participante não lê dados de outra; participante não lê gabarito; só a equipe acessa o admin; sessão expirada e revogada negam acesso) `G`
- [ ] Limite de tentativas de login e política de senha (mínimo de 8, bloqueio de senhas comuns) `P`

## Etapa 3 — Integração: autenticação e perfil

**Trilha F+B.** **Entrega:** cadastro, login, perfil e rotas protegidas reais.

- [x] Adaptador HTTP para cadastro/login/logout, selecionado com `VITE_API_URL`; mock continua padrão sem variável `M`
- [ ] Guarda de rota por login e por papel (403 para quem não é equipe) `M`
- [ ] Sessão expirada e sair de todos os aparelhos `P`
- [ ] Verificação de e-mail (se decidido) `P`
- [ ] Onboarding e perfil gravando no banco `M`
- [ ] Aceite de termos com registro de data e versão `P`
- [ ] Excluir conta e baixar meus dados (LGPD) `M`
- [ ] Mensagens genéricas em login e recuperação (sem revelar se o e-mail existe) `P`
- [ ] Testes ponta a ponta do fluxo de autenticação `M`

## Etapa 4 — Pontos e diagnóstico de fit

**Entrega:** a participante faz o diagnóstico de fit e recebe o Mapa de Carreira, com pontos.

Pontos **[B]**
- [ ] Motor de eventos de pontos no servidor (regras da tabela de pontos, sem duplicar concessões) `M`
- [ ] Saldo e nível derivados do extrato `P`
- [ ] Serviços `obterSaldoENivel`, `listarExtrato` e `listarRegrasDePontos` `P`

Diagnóstico **[B]** (sem IA; o motor de referência já existe em `front/src/services/fit/`)
- [x] Motor determinístico e versionado, com testes dos critérios de aceite do PRD (seção 10) e auditoria de sensibilidade
- [ ] Mover o motor para uma biblioteca compartilhada entre o front e o backend, ou reimplementar no backend com os mesmos testes `M`
- [ ] Persistir `avaliacoes_diagnostico` e `resultados_diagnostico` com as versões do questionário, do scoring e da matriz; resultados antigos nunca são recalculados `M`
- [ ] Rotas: configuração (pública), responder, finalizar (exige as 15 respostas) e ler resultado (só da dona) `M`
- [ ] Conceder os pontos do diagnóstico uma única vez, mesmo se ela refizer `P`
- [ ] Guardar o mínimo de dados e permitir excluir o diagnóstico com a conta (LGPD) `P`
- [ ] Rodar `pnpm fit:gerar` quando o PRD do diagnóstico mudar, subir a versão e repetir os testes `P`
- [ ] Validar com participantes reais e com profissionais de cada área (PRD, seção 11: pesos, referências e explicações ainda sem validação empírica) `G`

Integração **[F+B]**
- [x] Adaptador HTTP de diagnóstico e resultado; cálculo usa motor determinístico versionado `M`
- [ ] Toast de pontos a partir dos eventos retornados `P`
- [ ] Testar com perfis de exemplo para checar se o resultado faz sentido para a equipe `M`

## Etapa 5 — Case semanal e admin com IA

**Entrega:** a equipe gera, revisa e publica o case, e a participante resolve e envia.

Admin e IA **[B]**
- [ ] Serviços `gerarRascunhoComIA` e `regenerarSecao` com saída estruturada e validada `G`
- [ ] **Conferência do gabarito por recálculo no servidor**, sinalizando divergência `G`
- [ ] Status do case: Rascunho (IA) → Revisado → Publicado → Arquivado (sem "agendado": os cases abrem toda semana, de segunda a sexta) `M`
- [ ] Aprovação exige a confirmação “Revisei o gabarito” `P`
- [x] ~~Agendamento de publicação~~ — substituído pela trilha: o case publicado fica na oferta e a abertura/fechamento semanal (segunda a sexta, Brasília) é regra da trilha `M`
- [ ] Registro de briefing, saída e versão do prompt em `logs_ia` `M`

Participante **[B]**
- [ ] `obterCaseDaSemana`, `obterTarefa` e `listarCheckpoints` **sem nunca devolver o gabarito** `M`
- [ ] `salvarRascunho` e `enviarEntrega` com bloqueio após o prazo `M`
- [ ] Pontos por checkpoint e por entrega `P`

Integração **[F+B]**
- [x] Rotas de início de case, tarefa, rascunho, checkpoint, entrega e resultado publicado `G`
- [ ] Upload de arquivos da entrega (storage com acesso restrito à dona) `M`
- [ ] Criar o **case real do teste** com a equipe (da geração à publicação) `G`

## Etapa 6 — Correção e resultado

**Entrega:** entregas corrigidas com apoio da IA, aprovadas pela equipe e publicadas.

**[B]**
- [ ] Correção determinística das respostas numéricas (gabarito + tolerância, vírgula e unidade) `G`
- [ ] IA para interpretar respostas fora do formato e escrever o feedback, com saída estruturada `G`
- [ ] Fallback: se a IA falhar, a entrega vai para a fila como “correção manual” `M`
- [ ] Fila de correção com a nota sugerida, a comparação lado a lado e o ajuste manual `G`
- [ ] **Nota e feedback só visíveis à participante após aprovar e publicar** `M`
- [ ] Publicação em lote dos resultados `M`
- [ ] Pedido de revisão (recurso) e fila de pedidos `M`
- [ ] Pontos de resultado por nota `P`
- [ ] Registro da correção: resposta, gabarito, saída da IA, versão do prompt, nota final e quem aprovou `M`

**[F+B]**
- [ ] Adaptadores reais de fila de correção, resultado e recurso `M`
- [ ] Medir a concordância entre IA e equipe em uma amostra `M`
- [ ] E-mail de resultado disponível `P`

## Etapa 7 — Conteúdos e certificado

**Entrega:** conteúdos de apoio no case e certificado verificável.

- [ ] **[B]** Tabela e serviços de conteúdos e de conclusão de conteúdo (+ pontos) `M`
- [ ] **[F+B]** Admin de conteúdos e exibição dentro do case `M`
- [ ] **[B]** Regra de elegibilidade do certificado `P`
- [ ] **[B]** Geração do PDF com código de verificação `M`
- [ ] **[B]** Emissão após conclusão e serviço público `validarCertificado` (retorna só nome, case e data) `M`
- [ ] **[F+B]** Meus certificados, download e validação pública `M`
- [ ] Produzir os conteúdos iniciais do case de teste `G`

## Etapa 8 — Qualidade, segurança e publicação

**Entrega:** plataforma pronta para o piloto.

Segurança
- [ ] Revisão de segurança completa (autorização por rota, autenticação própria, rotas de IA, upload, exposição de gabarito) `G`
- [ ] Verificar que nenhuma chave de IA ou de serviço chega ao navegador `P`
- [ ] Limites de requisição nas rotas sensíveis `M`
- [ ] Garantir que o log de IA não guarda dados pessoais além do necessário `M`
- [ ] Conformidade LGPD: política, consentimento, exportação e exclusão `M`

Qualidade
- [x] E2E API de cadastro → diagnóstico → checkpoints → envio → publicação direta no banco → leitura do resultado (`backend/e2e/piloto.mjs`) `G`
- [ ] Teste de carga para o pico de segunda (liberação) e sexta (prazo) `M`
- [ ] Revisão de acessibilidade WCAG AA e teste em celulares reais `M`

Publicação
- [ ] Hospedar o front (Vercel ou equivalente), com deploy automático e preview por pull request `M`
- [ ] Configurar domínio próprio e HTTPS `P`
- [ ] Ambientes separados: preview e produção, cada um com seu banco `M`
- [ ] Monitoramento de erros e alerta de custo da IA `M`
- [ ] Backups do banco e plano de recuperação `P`
- [ ] E-mails transacionais e lembretes (novo case, prazo, resultado) `M`

## Etapa 9 — Piloto

**Entrega:** primeiras participantes usando um case semanal.

- [ ] Escolher um grupo pequeno e conhecido, e avisar que é um teste `P`
- [ ] Liberar o case de teste na segunda e acompanhar até a sexta `M`
- [ ] Corrigir, aprovar e publicar os resultados no fim de semana `M`
- [ ] Coletar feedback das participantes e da equipe (incluindo sobre o agente e a IA) `M`
- [ ] Medir ativação, conclusão, NPS, custo de IA por participante e concordância IA × equipe `M`
- [ ] Priorizar os ajustes e a decisão de seguir para o lançamento `M`

## Etapa 10 — Pós-piloto

- [ ] Reavaliar o plano de hospedagem e os custos e limites de uso da API da OpenAI
- [ ] Ciclo semanal: gerar, revisar e publicar o próximo case
- [ ] Banco de 4 a 6 cases antes de abrir para um público maior
- [ ] Priorizar o backlog: correção qualitativa com IA, verificação de e-mail, login social, badges, streak, ranking, avatar ou mascote, novas áreas
