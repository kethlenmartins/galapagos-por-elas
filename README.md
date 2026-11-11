# Galapagos por Elas

Plataforma web (desktop e mobile) para meninas e mulheres que querem entrar no mercado financeiro: autoconhecimento, conhecimento das áreas e prática com cases semanais.

## Como funciona

1. **Cadastro e login** com autenticação própria.
2. **Diagnóstico de Fit:** 15 perguntas A/B/C que apontam as 3 áreas de maior afinidade, em porcentagem. É determinístico e **não usa IA**.
3. **Trilha de cases:** um case por semana, à escolha dela. Abre na segunda e fecha na sexta (23h59, Brasília). Tem checkpoints e tarefas. A equipe corrige e publica o resultado depois do prazo. O primeiro case é de uma das áreas do Top 3; os demais abrem após um case aprovado.
4. **Conteúdos de apoio** ligados a cada case.
5. **Certificado** em PDF, com validação pública e link para o LinkedIn, para quem é aprovada.
6. **Gamificação simples:** pontos e nível.

## Inteligência artificial (API da Groq, só no servidor)

- Geração de rascunho de cases no admin, sempre revisado pela equipe.
- Correção qualitativa das entregas: a IA sugere, a equipe revisa e aprova. A parte numérica é conferida por código.
- Futuro: comitê de perguntas e mentora "Eva" (só mercado financeiro).

## Estado do projeto

- **Front-end** (`front/`): pronto, em React + Vite + TypeScript, rodando sobre um adaptador mock.
- **Camada de serviços** (`front/src/services/`): `contratos.ts` é a especificação do backend e `mock/` é a implementação de referência.
- **Backend:** API piloto em `backend/`, com PostgreSQL, autenticação e fluxo de diagnóstico/case; ver `backend/README.md`.

## Rodando o front

```bash
cd front
pnpm install
pnpm dev        # http://localhost:8443
pnpm test
pnpm build
```

Contas de demonstração (senha `Senha123`): `marina@email.com` (participante) e `equipe@galapagos.com.br` (aba "Equipe").

## Documentação (`docs/`)

| Arquivo | Conteúdo |
|---|---|
| `PRD.md` | Produto |
| `PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md` | Diagnóstico de Fit |
| `PRD_Cases_Trilha.md` | Trilha de cases e certificados |
| `PRD-TELAS-IA.md`, `TELAS.md` | Telas |
| `IA.md` | Onde a IA entra |
| `TODO.md` | Etapas e backlog |
| `HANDOFF.md`, `PROMPT-AGENTE-BACKEND.md` | Passagem para o desenvolvimento do backend |
# Deploy gratuito no Render

O Blueprint em [`render.yaml`](render.yaml) cria três recursos gratuitos no mesmo repo: Static Site para `front/` (`dist`), Web Service para `backend/` e PostgreSQL Free. Não execute deploy até conferir custos/limites no painel: o tier gratuito é para teste, a API pode dormir em inatividade, e o banco Free expira em 30 dias sem backup automático.

Passos no painel:

1. Em **New → Blueprint**, conecte o repositório privado e confirme o `render.yaml` na raiz.
2. Antes de confirmar, confira a lista: `galapagos-piloto-front` como Static Site (sem plano de computação), `galapagos-piloto-api` com plano `Free` e `galapagos-piloto-db` com plano `Free`. Não aceite alterações para planos pagos.
3. Aplique o Blueprint. As URLs públicas dos serviços são referenciadas automaticamente para `APP_ORIGIN` e `VITE_API_URL`; `SESSION_SECRET` é gerado e `DATABASE_URL` usa a conexão interna do banco.
4. Espere o deploy da API e do front. Registre a data de criação do Postgres e agende o dump até o dia 20.
5. No terminal, autentique o Render CLI (`render login`) e aplique o case uma vez: `render psql galapagos-piloto-db -- -f backend/seed/piloto.sql`.
6. Valide os endpoints e o fluxo descritos abaixo. O banco tem 1 GB, expira após 30 dias e não possui backup gerenciado.

O Blueprint resolve automaticamente as URLs públicas: injeta a URL da API no build do front como `VITE_API_URL=https://<api>.onrender.com/api` e define `APP_ORIGIN` com a URL pública do Static Site. Gera `SESSION_SECRET`, referencia `DATABASE_URL` e define `COOKIE_SECURE=true`. A API restringe CORS à origem declarada e usa cookies `Secure`, `HttpOnly`, `SameSite=None` para chamadas com credenciais entre os hostnames Render. Migrações rodam ao iniciar a API; carregue `backend/seed/piloto.sql` uma única vez após a primeira migração, por `render psql <nome-ou-id-do-banco> -- -f backend/seed/piloto.sql`.

Valide `/api/health`, cadastro/login, diagnóstico, case, envio e publicação de resultado. O roteiro detalhado, comando de seed e operação de backup/restauração antes do vencimento do banco estão em [`backend/README.md`](backend/README.md). Não adicione método de pagamento se quiser que exceder quotas gratuitas suspenda o serviço em vez de gerar cobrança; Static Sites e Web Services gratuitos também contam para quotas compartilhadas de uso/build.
