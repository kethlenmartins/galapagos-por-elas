# Instrução para o agente (cole como primeira mensagem)

Você assume o desenvolvimento da plataforma **Galapagos por Elas** (mulheres entrando no mercado financeiro). O front-end está pronto e roda sobre um adaptador mock. Sua missão: **construir o backend real, integrá-lo ao front e publicar tudo (front + backend) em um ambiente de teste para um público piloto.**

## Antes de qualquer código

1. Leia `docs/HANDOFF.md` inteiro. Ele traz o estado atual, as decisões já tomadas (não reabra), os pontos em aberto, os requisitos de segurança e os critérios de pronto.
2. Leia `docs/TODO.md` (etapas 2 a 9 são o seu backlog), `docs/PRD_Cases_Trilha.md`, `docs/PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md` e `docs/IA.md`.
3. Estude `front/src/services/contratos.ts` (a especificação do backend) e `front/src/services/mock/` (comportamento de referência e testes). O mock é o que o backend precisa reproduzir.
4. Rode `cd front && pnpm install && npx tsc -b && pnpm test && pnpm build` para confirmar a linha de base (49 testes passando).

## O que fazer

- Siga as etapas 2 → 9 do `docs/TODO.md`, na ordem sugerida na seção 7 do handoff, entregando em passos verificáveis.
- **Primeiro passo:** me proponha a stack (o handoff sugere TypeScript + Fastify/Hono + PostgreSQL + Zod, compartilhando tipos e o motor `front/src/services/fit/`), banco e hospedagem, e espere minha confirmação. Depois registre como ADR em `docs/adr/`.
- Implemente os serviços de `contratos.ts` como API HTTP, um adaptador HTTP no front selecionado por variável de ambiente, e **mantenha o mock** para desenvolvimento e testes.
- Autenticação própria (sem provedores externos), IA somente no servidor via API da OpenAI, diagnóstico sem IA, nota só visível após aprovação e publicação pela equipe, gabarito nunca exposto à participante, pontos idempotentes. Detalhes em `docs/HANDOFF.md` seções 3 e 8.
- Escreva testes automáticos, em especial de **autorização** e do motor do diagnóstico, e deixe-os rodando em CI.
- Ao final, faça a revisão de segurança (skill `security-review`), configure ambientes dev/prod separados, HTTPS, backups, monitoramento e alerta de custo da IA, e publique o piloto.

## Como trabalhar comigo

- Pergunte antes de decidir os itens da seção 4 do handoff (SMTP e recuperação de senha, corte do prazo, nota mínima, certificado, idade mínima, modelo e teto de gasto da OpenAI). Proponha um padrão e registre a decisão.
- **Peça confirmação antes de qualquer ação externa ou irreversível:** criar infraestrutura paga, apontar domínio, inserir chaves reais, enviar e-mails, fazer push em remoto.
- Nunca coloque segredos no repositório nem no bundle do front. Eu forneço as chaves por variáveis de ambiente quando for o momento.
- Se precisar mudar um contrato, altere tipo, mock, testes e front juntos e documente em `front/src/services/README.md`.
- Mantenha `docs/TODO.md` atualizado (marque `[x]`) e termine cada etapa com um resumo curto do que foi feito, do que foi verificado e do que ficou pendente.
- Reporte falhas de teste e passos pulados com franqueza, com a saída do erro.

## Fora do escopo desta fase

Treino, defesa com comitê de IA, rubrica de 5 critérios, chat da Eva, mudança de e-mail e login social. Só entram se eu pedir.
