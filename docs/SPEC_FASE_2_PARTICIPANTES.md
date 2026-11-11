# Fase 2 — participantes sem mock

## Objetivo

No ambiente em que `VITE_API_URL` estiver definido, toda ação disponível para a participante deve ler ou gravar na API e no PostgreSQL. Os serviços de equipe (`adminCases`, `adminCorrecao` e `adminConteudos`) continuam no adaptador mock nesta fase. O diagnóstico continua determinístico e não usa IA.

## Fora de escopo

- Tela e operações administrativas reais.
- E-mail, recuperação de senha, sair de todos os aparelhos e alteração/exclusão de conta.
- Upload de arquivo, mentora e perguntas do comitê.
- Publicação automática de notas ou certificados pela IA.

## Serviços de participante

| Serviço | Entrega |
| --- | --- |
| Sessão | cadastro, login, sessão e logout já reais; preservar contratos atuais. |
| Perfil | onboarding, leitura, atualização, termos e exportação LGPD reais. Perfil completo concede 20 pontos uma única vez. |
| Catálogo | áreas públicas servidas pela API, sem depender de `localStorage`. |
| Pontos | saldo derivado de `point_events`, extrato e regras públicas. Nenhuma tela calcula saldo. |
| Diagnóstico | manter implementação e resultado real existentes. |
| Trilha/case | oferta, escolha, tarefas, rascunho, checkpoint, envio e resultado reais; aplicar pontos por checkpoint uma única vez. |
| Conteúdos | lista, detalhe e conclusão reais; conclusão concede 10 pontos uma única vez. |
| Certificados | emissão após nota publicada >= 6, listagem da dona, PDF, link LinkedIn e validação pública por código imprevisível. |
| Revisão | participante abre pedido apenas de tarefa/entrega publicada dela; pedido é persistido para operação manual da equipe. |

## Dados e autorização

- Dados de perfil pertencem exclusivamente à sessão autenticada.
- Conteúdo é público para participante autenticada; conclusões pertencem à participante.
- Certificado e PDF só são acessíveis pela dona. Validação pública devolve apenas nome, case e data.
- Pedido de revisão só pode referenciar uma entrega publicada da dona.
- Gabarito, respostas de outras usuárias, chaves de IA e logs internos nunca entram em respostas de participante.
- Todo ponto é inserido com `action_key` idempotente; saldo é `SUM(points)`.

## Operação de resultado enquanto o admin é mock

A equipe continua corrigindo e publicando fora da UI. A publicação precisa usar o procedimento interno da API/banco que, atomicamente, publica a entrega, cria bônus de nota, emite o certificado quando aplicável e concede os pontos correspondentes. Uma sugestão de IA nunca altera a nota publicada.

## Groq

- Provedor: Groq, via `GROQ_API_KEY` somente no backend.
- Modelo configurável em `GROQ_MODEL`; o padrão é definido em ambiente, não no navegador.
- A IA recebe somente respostas e contexto fictício necessários, sem nome, e-mail ou outros identificadores.
- No envio da entrega, ela pode produzir uma sugestão estruturada de feedback qualitativo para a equipe. Falha, ausência de chave, saída inválida ou limite excedido resulta em correção manual; a participante não fica bloqueada.
- Registrar apenas metadados necessários: entrega, modelo, versão de prompt, latência, status e custo quando fornecido. Não persistir a chave.

## Rotas previstas

`/api/profile`, `/api/catalog/areas`, `/api/points/*`, `/api/content/*`, `/api/certificates/*` e `/api/reviews` complementam as rotas já existentes de sessão, diagnóstico e case. Rotas internas de publicação exigem papel `equipe` e não são usadas pela UI nesta fase.

## Critérios de aceite

1. Com `VITE_API_URL`, nenhum serviço de participante é herdado de `servicosMock`.
2. Duas participantes não conseguem ler, editar, concluir, baixar ou pedir revisão sobre dados uma da outra.
3. O fluxo publicado funciona: cadastro → onboarding → diagnóstico → case → checkpoints → entrega → publicação operacional → resultado → certificado → validação pública.
4. Pontos de perfil, diagnóstico, checkpoint, conteúdo, nota e certificado não duplicam.
5. Falha da Groq não impede envio da entrega nem expõe dados pessoais ou gabarito.
6. Testes de tipos, testes unitários e E2E do fluxo passam contra PostgreSQL.
