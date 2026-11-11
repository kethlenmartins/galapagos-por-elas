# API do piloto

API Fastify + PostgreSQL para cadastro/login, Diagnóstico de Fit determinístico, início de case, checkpoints, envio e publicação de resultado. A sugestão qualitativa de correção pode usar Groq no servidor quando `GROQ_API_KEY` e `GROQ_MODEL` estiverem configurados; falhas preservam a correção manual. Não há painel administrativo nem e-mail neste piloto.

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

## Deploy gratuito no Render

O Blueprint raiz declara um Static Site Free (`front`, saída `dist`), um Web Service Free (`backend`) e um PostgreSQL Free (`plan: free`). O front e a API ficam em origens diferentes. `VITE_API_URL` deve ser a URL HTTPS pública da API terminada em `/api`; `APP_ORIGIN` deve ser a origem HTTPS do Static Site, sem caminho. O CORS permite apenas `APP_ORIGIN`, aceita credenciais e a sessão usa cookie `Secure; SameSite=None`. O navegador envia credenciais com `credentials: 'include'`.

O Blueprint referencia `RENDER_EXTERNAL_URL` dos serviços para definir `APP_ORIGIN` e compor `VITE_API_URL` no build do front automaticamente. Não há URLs públicas a copiar manualmente. O Blueprint gera `SESSION_SECRET`, conecta `DATABASE_URL` pela referência interna do banco e fixa `NODE_ENV=production`, `COOKIE_SECURE=true` e `TERMS_VERSION=1`. Não use `*` em CORS e não inclua `/api` em `APP_ORIGIN`.

O start do Web Service executa `pnpm db:migrate` antes de iniciar a API. Depois do primeiro deploy/migração, carregue o case de piloto uma vez com o Render CLI (conexão interna, sem abrir acesso público ao banco): `render psql <nome-ou-id-do-banco> -- -f backend/seed/piloto.sql`. Não rode o seed repetidamente como rotina; os inserts são idempotentes por ID.

Validação depois do deploy:

1. Abra `https://<static-site>.onrender.com` e recarregue diretamente uma rota/hash para confirmar o rewrite SPA.
2. Abra `https://<api>.onrender.com/api/health`; deve responder `{"ok":true}` somente quando o banco aceita `select 1`.
3. Faça cadastro/login e diagnóstico no front; confirme no DevTools que a API responde com CORS para a origem do Static Site, `Access-Control-Allow-Credentials: true` e que o cookie de sessão é `Secure`, `HttpOnly` e `SameSite=None`.
4. Inicie o case seed, complete checkpoints e envie uma entrega; publique uma correção pelo procedimento SQL acima e valide o resultado.

### Prazo e backup do PostgreSQL Free

Render Free Postgres tem limite de 1 GB, não tem backups automáticos e expira 30 dias após a criação. Após a expiração, fica inacessível; há 14 dias para upgrade antes de a Render excluir banco e dados. Não trate esse banco como armazenamento durável. Registre a data de criação e programe um dump até o dia 20 (e outro imediatamente antes do vencimento). Baixe os arquivos para armazenamento seguro fora do Render e confira tamanho/hash e restauração em banco PostgreSQL temporário antes de considerar o backup válido.

Exemplo de exportação manual (copie o External Database URL do painel; não o salve em arquivos versionados). Como o Blueprint deixa a allowlist externa vazia, adicione temporariamente o IP público da máquina de backup na allowlist do Postgres, rode o dump, e remova essa regra imediatamente depois:

```sh
pg_dump --format=custom --no-owner --no-acl "$RENDER_EXTERNAL_DATABASE_URL" --file galapagos-piloto-YYYY-MM-DD.dump
sha256sum galapagos-piloto-YYYY-MM-DD.dump
```

Mantenha o dump em armazenamento privado com acesso restrito. Para restaurar, crie outro PostgreSQL e use `pg_restore --no-owner --no-acl --dbname "$NEW_DATABASE_URL" galapagos-piloto-YYYY-MM-DD.dump`; depois atualize `DATABASE_URL` no Web Service e valide `/api/health` e o fluxo E2E. A Free Web Service também pode dormir após inatividade e levar cerca de um minuto para voltar; isso é esperado no piloto.
