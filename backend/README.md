# API do piloto

API Fastify + PostgreSQL para cadastro/login, Diagnóstico de Fit determinístico, início de case, checkpoints, envio e publicação de resultado. Não há geração por IA, painel administrativo nem e-mail neste piloto.

## Desenvolvimento local

Requer Node 22+ e PostgreSQL 16+. Configure `DATABASE_URL`, `SESSION_SECRET` (32 bytes aleatórios ou mais), `APP_ORIGIN`, `COOKIE_SECURE=false` apenas em HTTP local e `TERMS_VERSION`. Então rode `pnpm install`, `pnpm db:migrate` e `pnpm exec tsx src/server.ts`. O seed fictício é `psql "$DATABASE_URL" -f seed/piloto.sql`.

## E2E

Com API/banco prontos e o seed aplicado: `DATABASE_URL=postgres://... E2E_API_URL=http://127.0.0.1:3000/api node e2e/piloto.mjs`. O teste cria uma participante descartável, responde às 15 questões, inicia e termina o case, envia a entrega e publica uma correção por SQL; confirma que nota e feedback só aparecem após `published_at`.

## Correção direta no banco

Para uma entrega com status `pendente`, a equipe identifica `deliveries.id` e atualiza a nota/feedback. A publicação precisa ser atômica:

```sql
UPDATE deliveries
SET status = 'publicada', grade = 8, feedback = 'Feedback revisado pela equipe.', published_at = now()
WHERE id = '<entrega_id>' AND status = 'pendente';
```

O `entrega_id` é retornado pelo endpoint de envio. Acesso direto ao banco deve ser feito apenas pela equipe, com credencial individual e conexão TLS/rede privada.

## Render (pendente de autorização para provisionar)

Credenciais externas necessárias: conta Render e conexão deste repositório Git ao Render. O piloto terá um único Web Service e um PostgreSQL. O Blueprint gera `SESSION_SECRET` e conecta `DATABASE_URL`; após a primeira criação, preencha `APP_ORIGIN` com a URL HTTPS `onrender.com` atribuída ao serviço. `TERMS_VERSION`, `NODE_ENV` e `COOKIE_SECURE` já são configurados no Blueprint. OpenAI, SMTP e domínio próprio não são necessários para o piloto. Não salvar credenciais no Git.
