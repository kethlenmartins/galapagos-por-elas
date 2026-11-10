# ADR 0001 — Stack e escopo do piloto

- Status: aceita
- Data: 2026-11-10

## Contexto

O piloto precisa permitir que uma participante crie conta e entre, complete o Diagnóstico de Fit, escolha e inicie um case, envie checkpoints e conclua o case. O handoff define TypeScript, compartilhamento do motor `front/src/services/fit/`, autenticação própria e PostgreSQL como direção compatível. A equipe informou que cases e correções podem ser inseridos diretamente no banco durante o piloto.

## Decisão

- API em TypeScript com Node.js e Fastify.
- PostgreSQL como banco relacional, com Drizzle ORM e migrações versionadas.
- Zod para validar entrada e dados estruturados.
- O processo Fastify servirá a API e os arquivos compilados do front no mesmo host; o front chamará `/api`, simplificando cookies e CORS.
- Render será a hospedagem do piloto: Web Service para a aplicação e Render Postgres, ligados pela rede privada.
- O piloto terá um único ambiente Render e um único banco; haverá apenas dados reais do grupo piloto. Segredos ficarão no serviço. Não criar ambientes adicionais nesta fase.
- O mock permanece disponível para desenvolvimento e testes; o front selecionará o adaptador HTTP por configuração de ambiente.
- O motor determinístico de diagnóstico será compartilhado com o backend, sem IA.
- Escopo funcional do piloto: cadastro/login, diagnóstico, escolha/início de case, checkpoints e conclusão. A equipe manterá cases e correções diretamente no banco; painel administrativo e operações administrativas por API ficam fora do piloto.
- IA e geração automática de cases/correções ficam fora do fluxo do piloto. A nota e o feedback só se tornam visíveis à participante quando registrados e publicados pela equipe no banco. Gabaritos não serão enviados em respostas de participante.

## Segurança e operação

Autenticação própria com Argon2id, sessão revogável em cookie `httpOnly`, `Secure` e `SameSite`, proteção CSRF, rate limiting, autorização no servidor e testes de isolamento entre participantes. Banco sem acesso público, com backups habilitados. Segredos ficam exclusivamente em variáveis de ambiente do serviço.

## Consequências

A hospedagem conjunta reduz configuração de CORS e mantém sessão no mesmo domínio. O plano do Render e as políticas de backup serão confirmados antes da publicação, pois variam por plano. Um único ambiente reduz operação, mas não oferece isolamento de staging/produção; alterações diretas no banco exigem cautela e backup.

## Alternativas consideradas

- DigitalOcean App Platform + Managed PostgreSQL: viável, mas com mais componentes operacionais para este piloto.
- Vercel + API e banco gerenciados em separado: viável, porém acrescenta configuração entre serviços e domínios.
- Railway: não selecionado após o incidente de segurança divulgado em outubro de 2026.
