# Handoff — Backend e publicação (Galapagos por Elas)

> Para o agente que assume o desenvolvimento. Escopo desta etapa: **construir o backend e publicar a plataforma (front + backend) para um público de teste (piloto)**.
> Escrito em 2026-11-08 e atualizado em 2026-11-12 (veja a seção 0). O `.gitignore` e o primeiro commit já existem.

> **Atualização de 12/11/2026:** a seção 0 abaixo descreve o estado real e **prevalece** sobre as seções 1 a 11, escritas em 08/11 (onde falam de case semanal, prazo por semana ou "só mock", elas estão desatualizadas).

## 0. Estado em 12/11/2026 (leia primeiro)

### Produto hoje

- **Cada área é uma ilha.** O mapa de ilhas mostra as 13 áreas; as que não têm case aparecem como "em breve". A ordem dos cases vale **dentro da área** (o primeiro por `island_order` é o case **básico**; os demais, **avançados**, abrem com o certificado dos anteriores da mesma área). As áreas são independentes: a participante entra em qualquer uma depois do diagnóstico. **Não existe mais case por semana nem prazo**; a regra é "quem começa um case termina antes de começar outro da mesma ilha".
- **Dentro da ilha** (caminho de bolinhas: feito, atual, disponível, bloqueado): Conteúdos (carrossel com pop-up), Case básico, Cases avançados, Treino de entrevista, Simulação de entrevista com IA (texto e voz) e Vagas. Treino e simulação abrem com o certificado do case básico da área.
- **Case:** etapas entenda, conteúdos (obrigatório: concluir todos os conteúdos do case), treino, situação e defesa. As conversas aparecem fala por fala (3 s entre elas, com "digitando…") e as alternativas só depois; campos condicionais por `visivelSe`. Ao **concluir cada etapa com atividade**, a IA (mentora Eva) dá uma visão geral automática (rumo, o que viu de bom e de ruim, dica) e há o botão "Avançar". Quem não é aprovada (< 6) vê a devolutiva, pode **refazer e reenviar** (a nova tentativa mantém o que vem antes da situação e traz as respostas anteriores como rascunho).
- **Cases publicados no banco (15 + piloto de dev):** IB simplificado e complexo, VC, PE, ER (2), WM (2), Corporate Finance (2), Sales & Trading (2), Operações (2) e Macro ("A decisão do Copom", só o básico). O `piloto-corporate-finance` (`backend/seed/piloto.sql`) existe só em dev e CI.
- **Treino de entrevista (múltipla escolha):** 250 perguntas (IB, VC, PE, ER, WM) por nível e tema, modo cronometrado, feedback imediato e desempenho guardado.
- **Simulação de entrevista com IA:** vaga em texto livre, rigor, dificuldade, 3 a 8 perguntas, cronômetro opcional, **voz no navegador** (Web Speech API: ditado e leitura; áudio não passa pelo nosso servidor), histórico das últimas simulações, limite de 5 por 24 h. Em Corporate Finance, Sales & Trading e Operações as perguntas vêm de um **banco de 75 perguntas reais** e a IA avalia contra "o que uma boa resposta mostra" (critério que nunca vai ao navegador); nas demais áreas a IA conduz a conversa.
- **Vagas:** aba para participantes (só vagas **publicadas**, links `https`, data da última conferência). As 13 vagas dos PDFs entraram como **rascunho**; a equipe confere e publica uma a uma em Admin > Vagas.
- **Equipe (admin) usando a API real:** Correção (fila, respostas com gabarito, nota, aprovar, publicar em lote com certificado e pontos, pedidos de revisão), Vagas, Cases (listar, arquivar, republicar) e Conteúdos (CRUD). **Não existe** editor de cases na API: cases novos entram por migração SQL, e "Novo case" e abrir um case mostram uma mensagem clara.

### Onde está o código

- `backend/drizzle/0004` a `0022`: migrações. Cases (0005-0007, 0011-0015, 0017), perguntas do treino (0008, 0009, 0018), perguntas abertas (0020), simulação (0010), vagas (0019), avaliação (0021), revisão da IA (0022), histórico (0016).
- `backend/src/server.ts` (rotas), `entrevista-ia.ts` (simulação) e `revisao-ia.ts` (revisão por etapa). Variável `RATE_LIMIT_MAX` só sobe o limite nos testes (padrão 100/min).
- Geradores (rode quando mudar a fonte em `docs/cases/`): `backend/scripts/gerar-perguntas-entrevista.mjs` (para áreas novas use `--migracao 00NN_nome.sql --siglas xx`; **não rode sem argumentos**, ele reescreve a 0009 já aplicada), `gerar-perguntas-abertas.mjs`, `gerar-vagas.mjs` e `aplicar-textos-das-areas.mjs` (textos das páginas das ilhas, em `front/src/services/mock/dados/areas.ts`, lidos também pelo backend).
- `front/src/componentes/`: `CaminhoDeBolinhas`, `Popup`. `front/src/app/`: `revelacao.ts` (3 s), `voz.ts`.
- **Contratos:** `front/src/services/contratos.ts` continua a fonte da verdade (mock e HTTP implementam). O adaptador HTTP é `front/src/services/http.ts`; produção usa HTTP quando há `VITE_API_URL`.

### Como operar

- **Produção:** Render (plano free, região Oregon): API `galapagos-piloto-api`, site estático `galapagos-piloto-front` e banco Postgres (ver `render.yaml`). A API roda `pnpm db:migrate` ao iniciar, então migração nova vai no deploy.
- **Conta da equipe:** `cd backend && DATABASE_URL=... pnpm equipe:criar "Nome" email` cria ou promove (senha pedida no terminal, ou `EQUIPE_SENHA`). O banco do Render só aceita conexão externa de IPs liberados em Networking. Existe uma conta de teste `equipe.teste@example.com` criada em 12/11: **apague-a** quando não precisar (`DELETE FROM users WHERE email='equipe.teste@example.com'`).
- **Diagnóstico da IA (equipe logada):** `GET /api/admin/ia/status` faz uma chamada mínima e mostra status, o erro do provedor e os modelos que a chave pode usar; `?modelo=...` testa outro modelo sem trocar a variável. Os erros do provedor também vão para o log da API (`[ia] falha HTTP ...`).
- **IA em produção:** a API só tem IA se `GROQ_API_KEY` e `GROQ_MODEL` estiverem definidos no Render (declaradas em `render.yaml` com `sync: false`). Hoje **não estão**: `GET /api/interview/:area` responde `disponivel: false`, e simulação, revisão por etapa e sugestão de correção ficam indisponíveis (as telas seguem funcionando sem elas).
- **Verificações locais:** `cd front && node_modules/.bin/tsc --noEmit`, `vite build` e `../backend/node_modules/.bin/tsx --test src/services/mock/*.test.ts src/services/fit/*.test.ts src/app/*.test.ts ../backend/src/*.test.ts` (57 testes). E2E do backend (`backend/e2e/piloto.mjs`): suba um Postgres temporário, `drizzle-kit migrate`, `psql -f seed/piloto.sql`, inicie a API com `RATE_LIMIT_MAX=5000` e `GROQ_API_URL` apontando para a IA falsa que o próprio e2e levanta (porta 4010), e rode o script. O CI faz isso (`.github/workflows/ci.yml`; **ainda não foi observado rodando no GitHub**).
- **Git:** o push usa a conta `kethlenmartins` (`gh auth switch -u kethlenmartins`; o token precisa do escopo `workflow` para mexer em `.github/workflows`). No macOS use `sed -i ''`. Se `pnpm approve-builds` travar, use `node_modules/.bin/...` direto.

### Em aberto (por prioridade)

1. **Configurar `GROQ_API_KEY` e `GROQ_MODEL` no Render** (a chave do Render só enxerga `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b` e `allam-2-7b`; `llama-3.3-70b-versatile` dá 404 nessa conta; **`openai/gpt-oss-120b` foi testado e funciona**). Destrava simulação, revisão por etapa e a sugestão de correção.
2. **Limpeza de acesso:** remover o IP liberado no banco do Render, apagar a conta de teste da equipe e trocar a senha do banco (ela passou por conversa e captura de tela).
3. **Fórum:** especificação em `docs/PRD_Forum.md` aguarda as 8 decisões da seção 13 (identidade, votos, moderação e prazo, IA na moderação, menores, categorias, desabafos, abertura). Nada foi construído. Não abrir ao público sem moderação.
4. **Revisão editorial do conteúdo importado:** distratores de Operações e perguntas de defesa dos cases complexos de ER, WM e S&T foram escritos pelos agentes (o PDF só trazia a resposta certa); rubricas sem os níveis 1 a 4 descritos; cards "Como se entra" com formações e calendário genéricos em ER, WM, CF e S&T; fórmula de capital de giro de CF inferida; o hedge proporcional de S&T é discutível pelas contas (nuance registrada no gabarito); o case de ER usa a Lojas Renner (empresa real); textos das páginas das áreas estão marcados `[A REVISAR]`.
5. **Vagas:** conferir e publicar as 13 no admin (os documentos pedem reconferir antes de publicar). ER e WM não têm vagas listadas nos PDFs.
6. **Diagnóstico:** definir o perfil de Corporate Finance, Sales & Trading e Operações nos 12 eixos (e de Macro, se ainda faltar); Quant, Crédito e Risco, Asset Management e Fintechs seguem sem case.
7. **Editor de cases na API** (criar e editar cases pela plataforma, geração de rascunho com IA, conferência de gabarito): hoje só por SQL. As telas de Cases/Conteúdos da equipe cobrem listar, arquivar e republicar.
8. **Perguntas abertas** com "o que uma boa resposta mostra" para IB, VC, PE, ER e WM (hoje só CF, S&T e Operações têm banco para a simulação).
9. **Macro:** o desfecho (Selic sobe 0,50 p.p., para 14,25%) está só no gabarito; falta uma tela final sem campos para mostrá-lo.
10. **Qualidade:** testar em celular real e acessibilidade (as capturas foram em Chrome headless com o mock); teste de carga; sugestão de nota pela IA na correção (hoje a correção é manual, com o gabarito ao lado); pontos para treino e simulação (hoje não dão pontos).
11. **Itens antigos ainda abertos** (ver `TODO.md`): verificação de e-mail, recuperação de senha (sem SMTP), excluir conta e baixar meus dados (LGPD), termos e privacidade revisados pelo jurídico, monitoramento, backup e domínio.

### Riscos conhecidos

- A IA recebe o gabarito e a rubrica como régua privada (revisão por etapa e simulação com banco). Há instruções para não revelar, mas um modelo de linguagem pode vazar. Alternativa: mandar só a rubrica qualitativa.
- O mock guarda histórico de treino, simulações e vagas só em memória (some ao recarregar).
- O repositório agora contém PDFs e protótipos de origem (`docs/cases/*.pdf`, `Elas na Ilha*`): confirmar que o repositório é privado.

## 1. O que é o produto

Plataforma web (desktop e mobile) para mulheres que querem entrar no mercado financeiro. Fluxo: cadastro/login → onboarding → **Diagnóstico de Fit** (15 perguntas, Top 3 áreas) → **trilha de cases** (um por semana, com certificado) → conteúdos de apoio → pontos e nível.

Leia, nesta ordem:

1. `README.md` (visão geral; o diagnóstico não usa IA)
2. `docs/PRD.md` e `docs/PRD_Cases_Trilha.md` (regras da trilha, certificado)
3. `docs/PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md`
4. `docs/IA.md` (onde a IA entra) e `docs/PRD-TELAS-IA.md` (telas)
5. `docs/TODO.md` (etapas 2 a 9 são o seu backlog; marque `[x]` ao concluir)
6. `front/src/services/README.md` e **`front/src/services/contratos.ts`** (812 linhas: a especificação do backend)

## 2. Estado atual

**Front-end: pronto e funcionando sobre um mock.** React 19 + Vite 8 + TypeScript 5.9 + pnpm, rotas por hash (`#/rota?param=`), porta de dev 8443. Todas as telas existentes já leem da camada de serviços: Home, diagnóstico e resultado, trilha e case por etapas, entrega, resultado, certificados (PDF/LinkedIn/validação pública), conteúdos, perfil, onboarding, extrato de pontos, e o admin (cases com IA, fila de correção, conteúdos).

**Camada de serviços = a fronteira com o backend.**
- `front/src/services/contratos.ts`: só tipos e interfaces (`SessaoService`, `PerfilService`, `CatalogoService`, `PontosService`, `DiagnosticoService`, `CaseService`, `ConteudoService`, `CertificadoService`, `AdminCasesService`, `AdminCorrecaoService`, `AdminConteudosService`).
- Toda função devolve `Resultado<T>` = `{ dados, erro }`. Códigos de erro: `SEM_LOGIN`, `SEM_PERMISSAO`, `NAO_ENCONTRADO`, `VALIDACAO` (com `campos`), `LIMITE_EXCEDIDO`, `IA_INDISPONIVEL`, `REDE`. As mensagens já são em português e vão direto à usuária.
- `front/src/services/mock/`: adaptador com estado em memória + localStorage. **É a implementação de referência do comportamento.** Onde o contrato for ambíguo, leia o mock e os testes (`mock.test.ts` 49 testes, `trilha.test.ts`).
- `front/src/services/index.ts`: ponto onde se troca o adaptador (mock → HTTP).

**Motor do diagnóstico:** `front/src/services/fit/` (puro, determinístico, versionado, sem dependência do mock). Tabelas geradas do PRD por `pnpm fit:gerar`. Deve ser **compartilhado** com o backend (pacote/workspace) ou reimplementado com os mesmos testes.

**Verificações atuais (devem continuar verdes):** `cd front && npx tsc -b`, `pnpm test` (49 passam), `pnpm build`.

## 3. Decisões de produto já tomadas (não reabrir)

- **Gamificação = só pontos + nível.** O certificado é o "troféu". Sem badges, streak, ranking, avatar ou mascote.
- **Autenticação própria, local, sem provedores externos** (nada de Google/Auth0/Firebase/Supabase Auth).
- **IA = API da OpenAI, somente no servidor** (a chave nunca chega ao navegador). Usos: (a) geração de rascunho de case no admin e regeneração de seção; (b) avaliação qualitativa na correção (sempre revisada pela equipe); (c) perguntas do comitê (futuro); (d) mentora "Eva" só sobre mercado financeiro (futuro). **O diagnóstico NÃO usa IA.**
- **Diagnóstico v1.1:** 15 perguntas A/B/C, 12 dimensões, 13 áreas. Resultado em porcentagem. Cada resultado guarda as versões de questionário, scoring e matriz; **nunca é recalculado**.
- **Trilha:** o primeiro case é de uma das áreas do Top 3 (se o Top 3 não tem case publicado, o ranking segue). Os demais abrem após um case **aprovado com certificado**. Um case escolhido por semana, só um em andamento. Cases abrem na segunda e fecham na sexta 23:59 (Brasília). Progresso sempre preservado.
- **Ciclo de vida do case (admin):** `rascunho_ia → rascunho → revisado → publicado → arquivado`. Não existe "agendado".
- **Aprovada = nota publicada ≥ 6,0** (suposição). Só então saem bônus de nota (até 150, uma vez por case), certificado (100 pts) e desbloqueio.
- **Nota e feedback só chegam à participante após aprovação e publicação pela equipe.** O gabarito nunca sai do servidor, exceto para a equipe.
- **Correção:** a parte numérica é conferida por código (gabarito + tolerância, vírgula/unidade); a IA interpreta respostas fora do formato e escreve o feedback; se a IA falhar, a entrega vai para a fila como "correção manual".
- **Pontos:** só o servidor concede, uma vez por ação (chave de idempotência), e o saldo é sempre a soma do extrato. Regras e valores estão em `mock/pontos.ts`.
- **Identidade visual:** azul/rosa/branco já aplicados. Não alterar.

## 4. Pontos em aberto (perguntar à Kethlen antes de depender deles)

| Tema | Situação |
|---|---|
| Stack de backend, banco e hospedagem | **Não decidido.** Proposta abaixo; registrar como ADR após confirmar. |
| Recuperação de senha por e-mail | Sem provedor externo exige SMTP próprio; alternativa: redefinição pela equipe. Perguntar. |
| Corte do prazo | Regra "seg–ter → sexta da mesma semana; qua–dom → sexta da semana seguinte" é `[INTERPRETAÇÃO]` a confirmar. Já implementada no mock (`trilha.ts`); deixar a regra em um único módulo configurável. |
| Quando sai o resultado | Em aberto (fim de semana, publicação em lote pela equipe). |
| Nota mínima de aprovação (6,0) | Suposição. |
| Certificado (critério, emissor, texto) | Em aberto. |
| Idade mínima / menores | Em aberto. |
| Verificação de e-mail no MVP | Em aberto. |
| Modelo da OpenAI e teto de gasto | Escolher modelo, configurar limite na conta e revisar retenção de dados (LGPD). |
| Mentora Eva: limites e moderação | Futuro, fora do piloto. |

## 5. O que NÃO está construído (nem no front nem no backend)

Treino; defesa com comitê de IA; rubrica de 5 critérios e avaliação cega; chat da Eva; botão de "pedir revisão" na tela de resultado da participante (o serviço `pedirRevisao` e a fila admin existem); upload real de arquivos (hoje só o nome do arquivo é guardado); edição da tabela de apoio e dos tipos de campo de resposta no editor de cases; mudança de e-mail; e-mails transacionais. **Não faz parte do piloto, exceto o que o TODO (etapas 2 a 9) listar.**

## 6. Limitações conhecidas do front

- `dataDoEvento`/`prazoRestante` (`front/src/app/formatos.ts`) usam o relógio real, não o `?agora=` do mock.
- O rascunho de IA do mock é um template fixo ("Aurora Moda").
- A Landing mantém números ilustrativos fixos (marcada como exemplo).
- O mock guarda senha em texto puro **só como demonstração**: nunca replicar.

## 7. Plano sugerido

Siga as etapas 2 → 9 de `docs/TODO.md`. Ordem recomendada, cada passo com entrega verificável:

1. **ADR + fundação:** stack, banco, hospedagem, segredos, CI, ambientes dev/prod separados.
2. **Base e autenticação (etapas 2 e 3):** schema a partir dos contratos, migrações, argon2id/bcrypt, sessão em cookie `httpOnly`/`Secure`/`SameSite`, CSRF, limite de tentativas, política de senha, redefinição de senha (token aleatório, uso único, validade curta, só hash no banco), papéis só no servidor, seed da conta da equipe, **testes de autorização**.
3. **Pontos e diagnóstico (etapa 4).**
4. **Case, entrega e admin com IA (etapa 5).**
5. **Correção e resultado (etapa 6).**
6. **Conteúdos e certificado (etapa 7):** PDF no servidor, código de verificação **imprevisível** (o do mock é previsível), `validarCertificado` público devolvendo só nome, case e data.
7. **Adaptador HTTP no front:** implementar cada interface de `contratos.ts` sobre `fetch`, selecionado por variável de ambiente (`VITE_API_URL`/flag), mantendo o mock disponível para desenvolvimento e testes.
8. **Segurança, qualidade e publicação (etapa 8) e piloto (etapa 9).**

### Stack sugerida (confirmar com a Kethlen e registrar em ADR)

O front e o motor do diagnóstico são TypeScript; usar **TypeScript no backend** permite compartilhar os tipos de `contratos.ts` e o motor `fit/` sem reescrever. Proposta: Node + Fastify (ou Hono), PostgreSQL, Drizzle ou Prisma para migrações, Zod para validar entradas e a saída estruturada da IA, front na Vercel (ou equivalente) e backend + Postgres gerenciado em um provedor simples (Render/Railway/Fly). Alternativas são válidas se justificadas no ADR.

## 8. Requisitos não negociáveis

- **Autorização em toda rota**, no servidor: participante só lê o que é dela; gabarito e `logs_ia` só para `equipe`; admin só com papel `equipe`. Nenhum campo do cliente altera papel, pontos, nota ou status.
- **Nunca devolver o gabarito** em `obterCaseDaSemana`, `obterTarefa`, `listarCheckpoints` ou qualquer resposta de participante.
- Pontos idempotentes por ação; saldo derivado do extrato.
- Conferir o gabarito **recalculando no servidor** e sinalizando divergência antes da aprovação do case.
- Chave da OpenAI e segredos só em variáveis de ambiente; nada no repositório nem no bundle do front. Saída da IA sempre estruturada e validada; registrar briefing, saída e versão do prompt em `logs_ia` sem dados pessoais desnecessários.
- Mensagens genéricas em login e recuperação (não revelar se o e-mail existe).
- LGPD: aceite de termos com data e versão, exportar meus dados, excluir conta (e diagnóstico junto).
- Limite de requisições nas rotas sensíveis (login, IA, envio).
- Texto de conteúdo renderizado como texto puro (já é assim no front; não introduzir HTML vindo do servidor).
- Fuso: regras de semana e prazo em `America/Sao_Paulo`.
- Para IA indisponível, os contratos já definem `IA_INDISPONIVEL` e os fallbacks (rascunho manual, correção manual).

## 9. Como rodar e verificar

```bash
cd front
pnpm install
pnpm dev                 # http://localhost:8443
npx tsc -b
pnpm test                # node --test, roda .ts nativamente (Node 26)
pnpm build
pnpm fit:gerar           # só se o PRD do diagnóstico mudar (depois subir versões em fit/versoes.ts)
```

Contas de demonstração (senha `Senha123`): `marina@email.com` (participante, diagnóstico feito, case 1 em andamento, 210 pts), `equipe@galapagos.com.br` (aba "Equipe" no login), `luiza@`, `beatriz@`, `camila@email.com` (entregas na fila de correção).
Controles do mock: `?mock=rede,ia,expirada,rapido`, `?agora=2026-11-02T07:00:00-03:00`, e no console `__galapagosMock.definir(...)`, `.resetar()`.

## 10. Critérios de pronto para o piloto

- [ ] Fluxo completo no ambiente publicado, sem mock: cadastro → onboarding → diagnóstico → escolher case → checkpoints → entrega → correção e aprovação pela equipe → publicação do resultado → certificado → validação pública.
- [ ] Um case real publicado (gerado com IA e revisado pela equipe) e conteúdos iniciais.
- [ ] Testes automáticos de autorização e do motor do diagnóstico passando em CI.
- [ ] Revisão de segurança feita (use a skill `security-review`) e nenhum segredo no bundle do front.
- [ ] HTTPS, domínio, ambientes separados, backup do banco, monitoramento de erros e alerta de custo da IA.
- [ ] README de deploy e runbook curto (como publicar, reverter, rotacionar segredos, criar a conta da equipe).
- [ ] `docs/TODO.md` atualizado.

## 11. Regras de trabalho

- Mantenha `contratos.ts` como fonte da verdade. Se precisar mudar um contrato, mude o tipo, o mock, os testes e o front **juntos**, e registre em `front/src/services/README.md`.
- Não reabra decisões da seção 3. Para os itens da seção 4, pergunte à Kethlen, proponha um padrão e registre a decisão como ADR em `docs/adr/`.
- Pequenos commits, mensagens claras. Não suba `node_modules`, `dist`, `.env` ou segredos (o `.gitignore` já cobre isso).
- Antes de ações irreversíveis ou externas (criar infraestrutura paga, publicar domínio, configurar chaves reais, enviar e-mails), confirme com a Kethlen.
