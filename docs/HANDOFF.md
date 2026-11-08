# Handoff — Backend e publicação (Galapagos por Elas)

> Para o agente que assume o desenvolvimento. Escopo desta etapa: **construir o backend e publicar a plataforma (front + backend) para um público de teste (piloto)**.
> Estado em 2026-11-08. O `.gitignore` e o primeiro commit já existem.

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
