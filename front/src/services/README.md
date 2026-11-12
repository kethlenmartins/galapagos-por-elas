# Camada de serviços

As telas só falam com esta camada. Ela é a fronteira com o backend.

```
services/
  contratos.ts   só tipos: entidades e interfaces. É a especificação do backend.
  index.ts       ponto de entrada das telas; troca o adaptador aqui.
  mock/          adaptador de demonstração (estado em memória + localStorage)
```

## Diagnóstico de fit (`fit/`)

O motor (`fit/motor.ts`) é puro e não depende do mock, para poder ser compartilhado com o backend. As tabelas `fit/perguntas.ts`, `fit/dimensoes.ts` e `fit/matriz.ts` são **geradas** a partir de `docs/PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md`:

```
pnpm fit:gerar            # regenera as tabelas a partir do PRD (e valida 12 dimensões, 15 perguntas, 13 áreas)
pnpm fit:sensibilidade    # quanto o Top 3 muda ao trocar uma resposta (auditoria do PRD, seção 10)
pnpm test                 # inclui os critérios de aceite do PRD
```

Ao mudar o PRD: rode `fit:gerar`, suba as versões em `fit/versoes.ts` e rode os testes. Textos de pergunta e de área ainda aguardam revisão editorial.

## Como usar nas telas

```ts
import { sessaoService, caseService, mockDebug } from './services'

const r = await caseService.obterTrilha()
if (r.erro) { /* r.erro.codigo e r.erro.mensagem */ } else { r.dados }
```

Toda função devolve `Resultado<T>`: `{ dados, erro: null }` ou `{ dados: null, erro }`. Códigos de erro:
`SEM_LOGIN`, `SEM_PERMISSAO`, `NAO_ENCONTRADO`, `VALIDACAO` (com `campos` por campo), `LIMITE_EXCEDIDO`, `IA_INDISPONIVEL`, `REDE`.
Mostre `erro.mensagem`: ela já vem em português e pronta para a usuária.

## Contas de demonstração (senha `Senha123`)

| E-mail | Papel | Situação |
|---|---|---|
| `marina@email.com` | participante | diagnóstico feito (Top 3: Quant, Equity Research e Macroeconomia), 3 de 4 checkpoints do case 1 (em andamento), 210 pontos |
| `equipe@galapagos.com.br` | equipe | admin |
| `luiza@`, `beatriz@`, `camila@email.com` | participante | já entregaram o case (estão na fila de correção) |

## Trilha de cases (`mock/trilha.ts` e `mock/caso.ts`)

Implementa o modelo de `docs/PRD_Cases_Trilha.md`:

- **Desbloqueio:** sem diagnóstico, nada abre. Os cases são ilhas em ordem: cada uma abre quando a anterior termina com certificado. Quem já começou um case mantém o acesso, mesmo arquivado.
- **Quem começa termina:** só um case em andamento por vez (`escolherCase`); enviado e em avaliação conta como não terminado. Não há case por semana nem prazo: o progresso fica salvo até ela concluir.
- **Checkpoints** abrem em ordem, pagam pontos uma vez (20 no “entenda a área”, 30 nos demais) e travam as respostas ao concluir. Enviar não paga: os checkpoints já pagaram.
- **Aprovada** = nota publicada ≥ mínimo (6,0, suposição). Só então saem o bônus de nota (até 150, uma vez por case), o certificado (100) e os próximos cases. Sem aprovação, ela refaz em uma nova tentativa: a situação e a defesa recomeçam, e o que já foi pago não se repete.
- **Certificado:** PDF gerado sem dependências (`mock/pdf.ts`, A4 paisagem, texto selecionável), com o nome do case, o nome dela, a área, a data e o código; e o link de “adicionar ao LinkedIn” com o endereço de validação. No backend real, o PDF é gerado no servidor e o código é imprevisível.

## Controles de desenvolvimento

Pela URL: `/?mock=rede,ia,expirada,rapido#/rota` e `/?agora=2026-11-02T07:00:00-03:00#/rota`.

| Marca | Efeito |
|---|---|
| `rede` | toda chamada falha com `REDE` |
| `ia` | a IA fica indisponível (ativa os fallbacks da geração de cases e da correção). O diagnóstico não usa IA |
| `expirada` | as chamadas que exigem login falham com `SEM_LOGIN` |
| `rapido` | sem latência simulada |
| `agora=` | relógio simulado (para simular datas) |

No console do navegador: `__galapagosMock.definir({ iaIndisponivel: true })`,
`__galapagosMock.definirAgora('...')`, `__galapagosMock.resetar()` (volta aos dados de demonstração) e
`__galapagosMock.ultimoTokenDeRedefinicao()` (para testar a redefinição de senha sem e-mail).

## Regras que o mock já cumpre (e o backend precisa cumprir)

- Pontos só são concedidos pelo servidor, uma vez por ação, e o saldo é sempre a soma do extrato.
- O gabarito não sai do servidor, a não ser para a equipe.
- O diagnóstico de fit é determinístico e versionado: nunca usa IA, e cada resultado guarda as versões do questionário, do scoring e da matriz.
- Nota e feedback só chegam à participante depois de aprovados e publicados pela equipe.
- A parte numérica da correção é conferida por código; a IA interpreta e explica.
- O gabarito de um case é recalculado a partir da tabela de dados; divergência bloqueia a aprovação.
- Login e recuperação de senha nunca revelam se o e-mail existe; 5 falhas bloqueiam por 5 minutos.
- O papel (`participante` ou `equipe`) nunca vem do cliente.

## Pendências conhecidas do mock

- A "IA" da geração de cases e da correção é simulada (textos-modelo e uma heurística de nota). Não há prompt, modelo nem `logs_ia`. A IA real será a API da OpenAI, chamada só pelo servidor. O diagnóstico não usa IA.
- Senhas ficam em texto puro e o estado em `localStorage`: só para demonstração.
- A idade mínima ainda não é validada (decisão em aberto no PRD).
- `alterarSenha(senhaAtual, novaSenha)` e `preferenciasEmail` (no perfil) existem no contrato e no mock; o backend real precisa implementá-los. As preferências só guardam a escolha: nenhum e-mail é enviado.
- Verificação de e-mail, login social e upload real de arquivo não existem. Decisão do time: a autenticação será própria, sem provedores externos (e sem login social).
- O estado salvo é descartado quando `VERSAO_ESTADO` (em `mock/dados/estado-inicial.ts`) muda.

## Testes

`pnpm test` (Node 22.18 ou mais novo). Os testes de `mock/mock.test.ts` descrevem o comportamento esperado do backend.
