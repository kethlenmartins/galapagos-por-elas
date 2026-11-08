// GERADO por scripts/gerar-fit-do-prd.mjs a partir de PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md.
// Não edite à mão: altere o PRD, suba a versão em versoes.ts e gere de novo.
import type { DimensaoId } from './tipos.ts'

export type DefinicaoDimensao = { id: DimensaoId; camada: 'perfil' | 'trabalho'; polo0: string; polo100: string; perguntaIds: string[] }

export const DIMENSOES: DefinicaoDimensao[] = [
  {
    "id": "D1",
    "polo0": "Especialista",
    "polo100": "Generalista",
    "camada": "perfil",
    "perguntaIds": [
      "Q01"
    ]
  },
  {
    "id": "D2",
    "polo0": "Analítica",
    "polo100": "Relacional/comercial",
    "camada": "perfil",
    "perguntaIds": [
      "Q03",
      "Q05"
    ]
  },
  {
    "id": "D3",
    "polo0": "Aplicada/concreta",
    "polo100": "Abstrata/conceitual",
    "camada": "perfil",
    "perguntaIds": [
      "Q04"
    ]
  },
  {
    "id": "D4",
    "polo0": "Domínio técnico",
    "polo100": "Impacto/influência",
    "camada": "perfil",
    "perguntaIds": [
      "Q06"
    ]
  },
  {
    "id": "D5",
    "polo0": "Resultados imediatos",
    "polo100": "Construção de longo prazo",
    "camada": "perfil",
    "perguntaIds": [
      "Q07"
    ]
  },
  {
    "id": "D6",
    "polo0": "Estruturada",
    "polo100": "Exploratória",
    "camada": "perfil",
    "perguntaIds": [
      "Q08",
      "Q09"
    ]
  },
  {
    "id": "D7",
    "polo0": "Individual",
    "polo100": "Em equipe",
    "camada": "trabalho",
    "perguntaIds": [
      "Q10"
    ]
  },
  {
    "id": "D8",
    "polo0": "Direcionamento claro",
    "polo100": "Autonomia",
    "camada": "trabalho",
    "perguntaIds": [
      "Q12",
      "Q13"
    ]
  },
  {
    "id": "D9",
    "polo0": "Previsível",
    "polo100": "Dinâmico",
    "camada": "trabalho",
    "perguntaIds": [
      "Q14"
    ]
  },
  {
    "id": "D10",
    "polo0": "Análise aprofundada",
    "polo100": "Decisão rápida",
    "camada": "trabalho",
    "perguntaIds": [
      "Q15"
    ]
  },
  {
    "id": "D11",
    "polo0": "Bastidores",
    "polo100": "Exposição/interação",
    "camada": "trabalho",
    "perguntaIds": [
      "Q11"
    ]
  },
  {
    "id": "D12",
    "polo0": "Pesquisa/planejamento",
    "polo100": "Execução/implementação",
    "camada": "trabalho",
    "perguntaIds": [
      "Q02"
    ]
  }
]
