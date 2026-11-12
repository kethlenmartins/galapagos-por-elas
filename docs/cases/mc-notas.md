# Macro: notas da importação do protótipo

Fonte: `Elas na Ilha (Copy) (1).html` (JS). Case criado: `mc-simplificado` ("A decisão do Copom", migração 0017).

## O que NÃO foi levado para o case

- Interface: mapa da ilha, cabeçalho da turma ("18 mulheres de 9 estados"), contagem de "Faltam 26 dias", sequência (streak) e XP (20 no entenda, 5 por acerto no treino, 30 por capítulo, 60/100 na medalha), avatares e fotos da Marina, Eva e do comitê.
- Tela de conclusão do treino ("Você acertou tudo" / "Treino concluído") e o bloco "O que vem agora".
- Perguntas do treino filtradas pelo diagnóstico (o protótipo pulava as de Selic e câmbio para quem já dominava esses temas). No case, as seis perguntas aparecem sempre.
- Repetição do treino: quem errava revia o ponto depois, com uma pergunta alternativa. As alternativas estão no `answer_key` (`seErrar`), mas o fluxo de repetição não existe no formato de task.
- Perguntas do comitê geradas por IA e adaptadas à fala da participante: foram fixadas nas perguntas-base. O desfecho revelado ("Selic sobe 0,50 p.p., para 14,25%") está só no `answer_key` da task do comitê (`desfechoRevelado`), porque o formato não tem tela final sem campos.
- Reações da Marina após cada capítulo e dicas da Eva ("Travou? Peça uma dica"): guardadas no `answer_key` (`reacoesDaMarina`, `dicaEva`).
- Mentora Eva por chat livre (prompt de sistema, chips "O que é a Selic?", "Como entro no mercado sem conhecer ninguém?", "Acho que não sei o suficiente").
- Ditado por voz, contador de 600 caracteres e termos clicáveis dos cards (as definições viraram o conteúdo "Glossário de Macro").
- Tela de prova: medalha em SVG, código de verificação "ENI-MACRO-XXXX", botão "Adicionar ao LinkedIn", desbloqueio da ilha de Operações. Os critérios e a nota total estão na rubrica do `answer_key`.
- Bloqueio de ordem entre capítulos e tamanhos mínimos de texto (pelo menos 20 caracteres nos capítulos 2 e 4, 40 na apresentação, 15 em cada resposta ao comitê): só o limite máximo (600) virou `limiteCaracteres`.

## Perguntas de treino reaproveitáveis (formato pergunta, opções, certa, explicação)

Estão na task `mc-task-treino` e podem alimentar o treino de entrevista de Macro (`interview_questions`). Resumo dos temas: Selic e financiamento; inflação acima do teto; dólar e inflação; desemprego baixo e inflação; Focus e expectativas; juros e preço do título prefixado. Cada uma tem uma variação (`seErrar`) que pode servir de pergunta extra.

## Perguntas de entrevista

O protótipo não traz perguntas de entrevista propriamente ditas. As três perguntas do comitê (Ricardo, Paula, Helena) funcionam como perguntas abertas reaproveitáveis:

- Em uma frase: o que eu faço com a carteira amanhã?
- Qual dado, se saísse amanhã, derrubaria a sua tese?
- E se você estiver errada, quanto isso custa para os nossos clientes?
