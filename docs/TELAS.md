# Telas — Galapagos por Elas

> **Cases como trilha:** o mapa da trilha, o case por etapas (tarefa e resultado dentro dele), os certificados e a validação pública já seguem o modelo de `PRD_Cases_Trilha.md`. A Home e o admin de cases ainda são os desenhos antigos.

> Proposta v0.1 para decidirmos juntas. Prioridade: **P0** = necessária para a v1 · **P1** = desejável na v1 · **P2** = pós-v1.

## Mapa de navegação

```
Pública
  Landing ─┬─ Cadastro ─ Verificação de e-mail
           ├─ Login ─ Recuperar senha ─ Redefinir senha
           └─ Validação de certificado (pública)

Participante (logada)
  Onboarding/Perfil
  Diagnóstico de fit ─ Mapa de Carreira (Perfil · Trabalho · Áreas)
  Home (dashboard)
  Case da semana ─ Detalhe da tarefa ─ Entrega ─ Resultado do case
  Biblioteca de conteúdos ─ Conteúdo
  Áreas ─ Detalhe da área
  Meus cases (histórico)
  Conquistas (pontos, níveis, badges)
  Certificados
  Meu perfil / Configurações

Equipe (admin)
  Dashboard ─ Cases ─ Editor de case (com IA) ─ Fila de correção
  Conteúdos ─ Áreas ─ Diagnóstico (perguntas) ─ Participantes ─ Gamificação
```

## 1. Telas públicas

| # | Tela | Objetivo | Prioridade |
|---|---|---|---|
| 1 | **Landing** | Explicar a proposta, mostrar como funciona e levar ao cadastro | P0 |
| 2 | **Cadastro** | Criar conta (e-mail/senha), aceite de termos e LGPD | P0 |
| 3 | **Login** | Entrar na plataforma | P0 |
| 4 | **Recuperar / redefinir senha** | Fluxo de reset | P0 |
| 5 | **Verificação de e-mail** | Confirmar conta | P1 |
| 6 | **Validação de certificado** | Qualquer pessoa confere um certificado por código | P0 |
| 6b | **Termos de uso e Política de privacidade** | Textos legais (LGPD), mencionam o uso de IA | P0 |
| 6c | **Páginas de sistema** | 404, 403 (sem permissão), erro genérico, sessão expirada | P0 |

## 2. Telas da participante

| # | Tela | Conteúdo principal | Prioridade |
|---|---|---|---|
| 7 | **Onboarding / perfil inicial** | Nome, idade, cidade, escolaridade, objetivo. Boas-vindas gamificadas | P0 |
| 8 | **Diagnóstico de fit** | Introdução com consentimento, 15 perguntas A/B/C em moldura de conversa (Galá, sem IA), revisão antes do envio | P0 |
| 9 | **Resultado: Seu Mapa de Carreira** | 3 abas (Perfil, Trabalho, Áreas), 13 áreas com afinidade em porcentagem, Top 3 em destaque, cards com “Por que combina?” | P0 |
| 10 | **Home (dashboard)** | Case da semana com prazo, progresso, pontos, nível, sequência, atalhos | P0 |
| 11 | **Case da semana** | Contexto, checkpoints, lista de tarefas, status, prazo, conteúdos sugeridos | P0 |
| 12 | **Tarefa / entrega** | Enunciado, campos de resposta (texto e numéricos), anexos, salvar rascunho, enviar | P0 |
| 13 | **Resultado do case** | Nota, feedback por tarefa, pontos, badge, botão do certificado | P0 |
| 14 | **Biblioteca de conteúdos** | Lista filtrável por área e tipo | P1 |
| 15 | **Conteúdo** | Leitura/vídeo, marcar como concluído | P0 |
| 16 | **Áreas do mercado** | Cards com o que cada área faz | P1 |
| 17 | **Detalhe da área** | Descrição, rotina, habilidades, conteúdos e cases relacionados | P1 |
| 18 | **Meus cases (histórico)** | Cases feitos, notas e status | P1 |
| 19 | **Conquistas** | Badges e streak (fora da v1; pontos e nível entram no extrato) | P2 |
| 19b | **Extrato de pontos** | Nível, histórico de pontos e como ganhar | P0 |
| 20 | **Meus certificados** | Lista, download PDF, link de validação | P0 |
| 21 | **Perfil / configurações** | Editar dados, senha, notificações, excluir conta (LGPD) | P0 |

## 3. Telas da equipe (admin)

| # | Tela | Conteúdo principal | Prioridade |
|---|---|---|---|
| 22 | **Dashboard admin** | Participantes ativas, conclusão, entregas pendentes | P1 |
| 23 | **Lista de cases** | Status (rascunho, revisado, publicado, arquivado), busca e filtro, arquivar | P0 |
| 24 | **Editor de case com IA** | Briefing, gerar rascunho com IA, revisar e regenerar seções, conferir gabarito, aprovar e publicar | P0 |
| 25 | **Fila de correção** | Entregas com nota da IA, revisão e ajuste manual, publicar resultados | P0 |
| 26 | **Conteúdos** | CRUD de conteúdos e vínculo com cases/áreas | P0 |
| 27 | **Áreas** | CRUD de áreas | P1 |
| 28 | **Perguntas e matriz do diagnóstico** | Versionadas (PRD do diagnóstico): leitura no MVP; edição só com nova versão e revisão | P2 |
| 29 | **Participantes** | Lista, busca, detalhe | P1 |
| 30 | **Gamificação** | Regras de pontos, níveis e badges | P1 |
| 31 | **Certificados (admin)** | Modelo, emissão manual, revogação | P1 |

## 4. Recomendação de corte

**v1 (MVP), 22 telas P0** (lista executável com rotas em `PRD-TELAS-IA.md`; aqui a numeração é da proposta original, mais 6b, 6c e 19b): 1, 2, 3, 4, 6, 6b, 6c, 7, 8, 9, 10, 11, 12, 13, 15, 19b, 20, 21 e, no admin, 23, 24, 25, 26.

**Por quê:** cobre o ciclo completo do README (cadastro → diagnóstico → case → conteúdo → avaliação → certificado) com gamificação embutida na Home, no resultado e no case. Biblioteca, páginas de área, conquistas dedicadas e o admin avançado entram logo depois.

**Atalho possível:** no início, a equipe pode cadastrar áreas, perguntas e regras de gamificação direto no banco (seed) e só construir o admin de **cases, conteúdos e correção**, que é o que a operação semanal exige.

## 5. Decisões de design pendentes

- Identidade visual (cores, tom, logotipo). Existe um guia da Galapagos?
- Gamificação: **decidido** começar só com pontos (saldo, extrato e nível simples por barra). Avatar, mascote, badges, streak e ranking ficam para depois. Detalhes em `PRD-TELAS-IA.md`.
- Paleta: azul de mercado financeiro (médio), acentos em rosa, branco e formas curvas. Detalhes em `PRD-TELAS-IA.md`.
- Mobile-first: priorizar fluxo de entrega do case no celular.
- Lista final de áreas do mercado financeiro. Proposta inicial para validar: Investimentos/Gestão de ativos, Banco de investimento, Research/Análise, Mesa de operações (trading), Risco, Crédito, Private/Wealth, Finanças corporativas, Compliance, Controladoria.
