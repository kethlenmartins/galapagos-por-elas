# Galapagos por Elas

Plataforma web (desktop e mobile) para meninas e mulheres que querem entrar no mercado financeiro: autoconhecimento, conhecimento das áreas e prática com cases semanais.

## Como funciona

1. **Cadastro e login** com autenticação própria.
2. **Diagnóstico de Fit:** 15 perguntas A/B/C que apontam as 3 áreas de maior afinidade, em porcentagem. É determinístico e **não usa IA**.
3. **Trilha de cases:** um case por semana, à escolha dela. Abre na segunda e fecha na sexta (23h59, Brasília). Tem checkpoints e tarefas. A equipe corrige e publica o resultado depois do prazo. O primeiro case é de uma das áreas do Top 3; os demais abrem após um case aprovado.
4. **Conteúdos de apoio** ligados a cada case.
5. **Certificado** em PDF, com validação pública e link para o LinkedIn, para quem é aprovada.
6. **Gamificação simples:** pontos e nível.

## Inteligência artificial (API da OpenAI, só no servidor)

- Geração de rascunho de cases no admin, sempre revisado pela equipe.
- Correção qualitativa das entregas: a IA sugere, a equipe revisa e aprova. A parte numérica é conferida por código.
- Futuro: comitê de perguntas e mentora "Eva" (só mercado financeiro).

## Estado do projeto

- **Front-end** (`front/`): pronto, em React + Vite + TypeScript, rodando sobre um adaptador mock.
- **Camada de serviços** (`front/src/services/`): `contratos.ts` é a especificação do backend e `mock/` é a implementação de referência.
- **Backend:** a construir. Ver `docs/HANDOFF.md`.

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
