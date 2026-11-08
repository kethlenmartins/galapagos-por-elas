// GERADO por scripts/gerar-fit-do-prd.mjs a partir de PRD_Diagnostico_Fit_Galapagos_por_Elas_v1_1.md.
// Não edite à mão: altere o PRD, suba a versão em versoes.ts e gere de novo.
import type { DimensaoId } from './tipos.ts'

/** Referência (r, 0–100) e peso (w, 1–5) de cada dimensão, por área. */
export type CelulaMatriz = { r: number; w: number }

export const AREAS_FIT: { id: string; nome: string }[] = [
  {
    "id": "investment-banking",
    "nome": "Investment Banking"
  },
  {
    "id": "asset-management",
    "nome": "Asset Management"
  },
  {
    "id": "wealth-management",
    "nome": "Wealth Management"
  },
  {
    "id": "equity-research",
    "nome": "Equity Research"
  },
  {
    "id": "sales-trading",
    "nome": "Sales & Trading"
  },
  {
    "id": "quant",
    "nome": "Quant"
  },
  {
    "id": "credito-risco",
    "nome": "Crédito e Risco"
  },
  {
    "id": "fintechs",
    "nome": "Fintechs"
  },
  {
    "id": "venture-capital",
    "nome": "Venture Capital"
  },
  {
    "id": "private-equity",
    "nome": "Private Equity"
  },
  {
    "id": "corporate-finance",
    "nome": "Corporate Finance"
  },
  {
    "id": "macroeconomia",
    "nome": "Macroeconomia"
  },
  {
    "id": "operacoes",
    "nome": "Operações"
  }
]

export const MATRIZ: Record<string, Record<DimensaoId, CelulaMatriz>> = {
  "investment-banking": {
    "D1": {
      "r": 55,
      "w": 2
    },
    "D2": {
      "r": 45,
      "w": 3
    },
    "D3": {
      "r": 25,
      "w": 3
    },
    "D4": {
      "r": 70,
      "w": 4
    },
    "D5": {
      "r": 35,
      "w": 3
    },
    "D6": {
      "r": 20,
      "w": 4
    },
    "D7": {
      "r": 85,
      "w": 5
    },
    "D8": {
      "r": 60,
      "w": 3
    },
    "D9": {
      "r": 90,
      "w": 5
    },
    "D10": {
      "r": 55,
      "w": 3
    },
    "D11": {
      "r": 70,
      "w": 4
    },
    "D12": {
      "r": 85,
      "w": 5
    }
  },
  "asset-management": {
    "D1": {
      "r": 25,
      "w": 4
    },
    "D2": {
      "r": 15,
      "w": 5
    },
    "D3": {
      "r": 70,
      "w": 4
    },
    "D4": {
      "r": 40,
      "w": 3
    },
    "D5": {
      "r": 80,
      "w": 5
    },
    "D6": {
      "r": 40,
      "w": 4
    },
    "D7": {
      "r": 55,
      "w": 3
    },
    "D8": {
      "r": 80,
      "w": 4
    },
    "D9": {
      "r": 65,
      "w": 4
    },
    "D10": {
      "r": 50,
      "w": 4
    },
    "D11": {
      "r": 40,
      "w": 2
    },
    "D12": {
      "r": 45,
      "w": 3
    }
  },
  "wealth-management": {
    "D1": {
      "r": 65,
      "w": 2
    },
    "D2": {
      "r": 90,
      "w": 5
    },
    "D3": {
      "r": 20,
      "w": 3
    },
    "D4": {
      "r": 85,
      "w": 5
    },
    "D5": {
      "r": 85,
      "w": 4
    },
    "D6": {
      "r": 35,
      "w": 3
    },
    "D7": {
      "r": 80,
      "w": 4
    },
    "D8": {
      "r": 70,
      "w": 3
    },
    "D9": {
      "r": 60,
      "w": 3
    },
    "D10": {
      "r": 55,
      "w": 3
    },
    "D11": {
      "r": 95,
      "w": 5
    },
    "D12": {
      "r": 75,
      "w": 4
    }
  },
  "equity-research": {
    "D1": {
      "r": 15,
      "w": 5
    },
    "D2": {
      "r": 15,
      "w": 5
    },
    "D3": {
      "r": 70,
      "w": 4
    },
    "D4": {
      "r": 40,
      "w": 3
    },
    "D5": {
      "r": 75,
      "w": 4
    },
    "D6": {
      "r": 25,
      "w": 5
    },
    "D7": {
      "r": 50,
      "w": 3
    },
    "D8": {
      "r": 80,
      "w": 4
    },
    "D9": {
      "r": 55,
      "w": 3
    },
    "D10": {
      "r": 30,
      "w": 5
    },
    "D11": {
      "r": 55,
      "w": 3
    },
    "D12": {
      "r": 35,
      "w": 4
    }
  },
  "sales-trading": {
    "D1": {
      "r": 45,
      "w": 3
    },
    "D2": {
      "r": 65,
      "w": 4
    },
    "D3": {
      "r": 35,
      "w": 3
    },
    "D4": {
      "r": 75,
      "w": 4
    },
    "D5": {
      "r": 20,
      "w": 4
    },
    "D6": {
      "r": 65,
      "w": 4
    },
    "D7": {
      "r": 80,
      "w": 4
    },
    "D8": {
      "r": 80,
      "w": 4
    },
    "D9": {
      "r": 95,
      "w": 5
    },
    "D10": {
      "r": 95,
      "w": 5
    },
    "D11": {
      "r": 90,
      "w": 5
    },
    "D12": {
      "r": 95,
      "w": 5
    }
  },
  "quant": {
    "D1": {
      "r": 10,
      "w": 5
    },
    "D2": {
      "r": 5,
      "w": 5
    },
    "D3": {
      "r": 95,
      "w": 5
    },
    "D4": {
      "r": 20,
      "w": 4
    },
    "D5": {
      "r": 70,
      "w": 3
    },
    "D6": {
      "r": 40,
      "w": 4
    },
    "D7": {
      "r": 50,
      "w": 3
    },
    "D8": {
      "r": 85,
      "w": 4
    },
    "D9": {
      "r": 50,
      "w": 2
    },
    "D10": {
      "r": 35,
      "w": 4
    },
    "D11": {
      "r": 30,
      "w": 2
    },
    "D12": {
      "r": 55,
      "w": 3
    }
  },
  "credito-risco": {
    "D1": {
      "r": 35,
      "w": 3
    },
    "D2": {
      "r": 15,
      "w": 5
    },
    "D3": {
      "r": 55,
      "w": 4
    },
    "D4": {
      "r": 40,
      "w": 3
    },
    "D5": {
      "r": 75,
      "w": 4
    },
    "D6": {
      "r": 15,
      "w": 5
    },
    "D7": {
      "r": 60,
      "w": 3
    },
    "D8": {
      "r": 65,
      "w": 3
    },
    "D9": {
      "r": 45,
      "w": 3
    },
    "D10": {
      "r": 35,
      "w": 4
    },
    "D11": {
      "r": 45,
      "w": 3
    },
    "D12": {
      "r": 55,
      "w": 4
    }
  },
  "fintechs": {
    "D1": {
      "r": 75,
      "w": 4
    },
    "D2": {
      "r": 40,
      "w": 4
    },
    "D3": {
      "r": 20,
      "w": 4
    },
    "D4": {
      "r": 75,
      "w": 5
    },
    "D5": {
      "r": 45,
      "w": 3
    },
    "D6": {
      "r": 95,
      "w": 5
    },
    "D7": {
      "r": 85,
      "w": 5
    },
    "D8": {
      "r": 85,
      "w": 5
    },
    "D9": {
      "r": 90,
      "w": 5
    },
    "D10": {
      "r": 80,
      "w": 4
    },
    "D11": {
      "r": 65,
      "w": 3
    },
    "D12": {
      "r": 95,
      "w": 5
    }
  },
  "venture-capital": {
    "D1": {
      "r": 90,
      "w": 5
    },
    "D2": {
      "r": 75,
      "w": 4
    },
    "D3": {
      "r": 45,
      "w": 3
    },
    "D4": {
      "r": 90,
      "w": 5
    },
    "D5": {
      "r": 90,
      "w": 5
    },
    "D6": {
      "r": 90,
      "w": 5
    },
    "D7": {
      "r": 85,
      "w": 4
    },
    "D8": {
      "r": 85,
      "w": 4
    },
    "D9": {
      "r": 80,
      "w": 4
    },
    "D10": {
      "r": 65,
      "w": 3
    },
    "D11": {
      "r": 95,
      "w": 5
    },
    "D12": {
      "r": 60,
      "w": 3
    }
  },
  "private-equity": {
    "D1": {
      "r": 55,
      "w": 4
    },
    "D2": {
      "r": 40,
      "w": 5
    },
    "D3": {
      "r": 45,
      "w": 4
    },
    "D4": {
      "r": 80,
      "w": 5
    },
    "D5": {
      "r": 90,
      "w": 5
    },
    "D6": {
      "r": 35,
      "w": 4
    },
    "D7": {
      "r": 80,
      "w": 5
    },
    "D8": {
      "r": 80,
      "w": 4
    },
    "D9": {
      "r": 75,
      "w": 4
    },
    "D10": {
      "r": 55,
      "w": 4
    },
    "D11": {
      "r": 75,
      "w": 4
    },
    "D12": {
      "r": 80,
      "w": 4
    }
  },
  "corporate-finance": {
    "D1": {
      "r": 70,
      "w": 4
    },
    "D2": {
      "r": 40,
      "w": 4
    },
    "D3": {
      "r": 20,
      "w": 4
    },
    "D4": {
      "r": 65,
      "w": 4
    },
    "D5": {
      "r": 75,
      "w": 4
    },
    "D6": {
      "r": 15,
      "w": 5
    },
    "D7": {
      "r": 80,
      "w": 4
    },
    "D8": {
      "r": 65,
      "w": 3
    },
    "D9": {
      "r": 45,
      "w": 3
    },
    "D10": {
      "r": 35,
      "w": 4
    },
    "D11": {
      "r": 60,
      "w": 3
    },
    "D12": {
      "r": 80,
      "w": 5
    }
  },
  "macroeconomia": {
    "D1": {
      "r": 35,
      "w": 4
    },
    "D2": {
      "r": 15,
      "w": 5
    },
    "D3": {
      "r": 90,
      "w": 5
    },
    "D4": {
      "r": 40,
      "w": 3
    },
    "D5": {
      "r": 90,
      "w": 5
    },
    "D6": {
      "r": 55,
      "w": 3
    },
    "D7": {
      "r": 50,
      "w": 3
    },
    "D8": {
      "r": 85,
      "w": 4
    },
    "D9": {
      "r": 60,
      "w": 3
    },
    "D10": {
      "r": 30,
      "w": 5
    },
    "D11": {
      "r": 55,
      "w": 3
    },
    "D12": {
      "r": 25,
      "w": 4
    }
  },
  "operacoes": {
    "D1": {
      "r": 65,
      "w": 3
    },
    "D2": {
      "r": 40,
      "w": 3
    },
    "D3": {
      "r": 10,
      "w": 5
    },
    "D4": {
      "r": 65,
      "w": 4
    },
    "D5": {
      "r": 30,
      "w": 3
    },
    "D6": {
      "r": 10,
      "w": 5
    },
    "D7": {
      "r": 85,
      "w": 5
    },
    "D8": {
      "r": 55,
      "w": 3
    },
    "D9": {
      "r": 65,
      "w": 4
    },
    "D10": {
      "r": 65,
      "w": 4
    },
    "D11": {
      "r": 50,
      "w": 3
    },
    "D12": {
      "r": 95,
      "w": 5
    }
  }
}
