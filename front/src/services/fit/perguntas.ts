// GERADO por scripts/gerar-fit-do-prd.mjs a partir de PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md.
// Não edite à mão: altere o PRD, suba a versão em versoes.ts e gere de novo.
import type { DimensaoId } from './tipos.ts'

export type DefinicaoPergunta = {
  id: string
  dimensaoId: DimensaoId
  texto: string
  opcoes: { A: string; B: string; C: string }
  /** Pontuação orientada (0–100) de cada resposta. A Q04 é invertida. */
  pontuacao: { A: number; B: number; C: number }
}

export const PERGUNTAS: DefinicaoPergunta[] = [
  {
    "id": "Q01",
    "dimensaoId": "D1",
    "texto": "Ao começar um projeto novo, o que mais te anima?",
    "opcoes": {
      "A": "Aprofundar um assunto específico até conhecê-lo muito bem.",
      "B": "Conhecer diferentes partes do projeto e conectá-las.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q02",
    "dimensaoId": "D12",
    "texto": "Você vai participar de um projeto importante. Qual etapa mais te interessa?",
    "opcoes": {
      "A": "Investigar o problema, definir a estratégia e planejar a solução.",
      "B": "Colocar a solução em prática, resolver obstáculos e acompanhar sua implementação.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q03",
    "dimensaoId": "D2",
    "texto": "As vendas de uma empresa caíram. Por onde você começaria?",
    "opcoes": {
      "A": "Analisar números e padrões para entender o que aconteceu.",
      "B": "Conversar com pessoas envolvidas para entender necessidades e comportamentos.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q04",
    "dimensaoId": "D3",
    "texto": "Qual tipo de desafio te atrai mais?",
    "opcoes": {
      "A": "Construir um modelo ou explicação conceitual para entender um fenômeno.",
      "B": "Resolver um problema concreto com uma solução diretamente aplicável.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 100,
      "B": 0,
      "C": 50
    }
  },
  {
    "id": "Q05",
    "dimensaoId": "D2",
    "texto": "Você precisa defender uma recomendação. O que mais te interessa?",
    "opcoes": {
      "A": "Construir a análise e as evidências que sustentam a conclusão.",
      "B": "Entender os interlocutores e adaptar a comunicação para convencê-los.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q06",
    "dimensaoId": "D4",
    "texto": "O que te dá mais satisfação em um projeto?",
    "opcoes": {
      "A": "Dominar um método ou ferramenta e entregar uma solução tecnicamente excelente.",
      "B": "Mobilizar pessoas e influenciar decisões que geram impacto.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q07",
    "dimensaoId": "D5",
    "texto": "Qual resultado profissional te motiva mais?",
    "opcoes": {
      "A": "Ver resultados concretos em um prazo curto.",
      "B": "Construir algo cujo impacto apareça e cresça ao longo do tempo.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q08",
    "dimensaoId": "D6",
    "texto": "Você recebe um desafio sem instruções claras. O que prefere?",
    "opcoes": {
      "A": "Organizar etapas e critérios antes de começar.",
      "B": "Experimentar caminhos diferentes até descobrir uma direção.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q09",
    "dimensaoId": "D6",
    "texto": "Surge uma oportunidade inesperada durante um projeto. O que mais te atrai?",
    "opcoes": {
      "A": "Avaliar o plano e preservar uma execução bem estruturada.",
      "B": "Explorar a nova possibilidade e adaptar o caminho.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q10",
    "dimensaoId": "D7",
    "texto": "Ao desenvolver uma solução, o que mais te atrai?",
    "opcoes": {
      "A": "Ter um espaço individual para aprofundar minhas ideias e construir minha contribuição.",
      "B": "Trocar ideias constantemente e desenvolver a solução junto com outras pessoas.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q11",
    "dimensaoId": "D11",
    "texto": "Em um projeto, qual responsabilidade você preferiria assumir?",
    "opcoes": {
      "A": "Preparar análises, materiais e recomendações nos bastidores.",
      "B": "Apresentar resultados, defender ideias e interagir com as pessoas envolvidas.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q12",
    "dimensaoId": "D8",
    "texto": "Ao começar uma tarefa nova, como você prefere trabalhar?",
    "opcoes": {
      "A": "Receber objetivos, orientações e etapas bem definidos.",
      "B": "Receber o objetivo e ter liberdade para decidir como chegar ao resultado.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q13",
    "dimensaoId": "D8",
    "texto": "Se aparece uma dificuldade no trabalho, como você prefere avançar?",
    "opcoes": {
      "A": "Contar com direcionamento e alinhamentos frequentes para ajustar a rota.",
      "B": "Investigar alternativas por conta própria e propor um caminho.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q14",
    "dimensaoId": "D9",
    "texto": "Qual ambiente profissional parece mais interessante para você?",
    "opcoes": {
      "A": "Uma rotina relativamente previsível, com prioridades e prazos organizados.",
      "B": "Um ambiente em que as prioridades mudam rapidamente e surgem desafios inesperados.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  },
  {
    "id": "Q15",
    "dimensaoId": "D10",
    "texto": "Quando precisa tomar uma decisão importante, o que mais te atrai?",
    "opcoes": {
      "A": "Ter tempo para aprofundar a análise e comparar diferentes possibilidades.",
      "B": "Precisar decidir rapidamente, usando as informações disponíveis naquele momento.",
      "C": "As duas me interessam igualmente."
    },
    "pontuacao": {
      "A": 0,
      "B": 100,
      "C": 50
    }
  }
]
