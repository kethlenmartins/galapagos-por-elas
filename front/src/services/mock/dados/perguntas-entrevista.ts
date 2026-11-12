/** Gerado por backend/scripts/gerar-perguntas-entrevista.mjs a partir de docs/cases/*-perguntas.md. Não edite à mão. */
import type { NivelPergunta } from '../../contratos.ts'

export type PerguntaEntrevista = {
  id: string
  areaId: string
  nivel: NivelPergunta
  /** Subtema da área (ex.: M&A, DCM, ECM no IB); null quando a área não se divide. */
  tema: string | null
  enunciado: string
  opcoes: { letra: string; texto: string }[]
  resposta: string
  feedback: string
}

export const PERGUNTAS_ENTREVISTA: PerguntaEntrevista[] = [
  {
    "id": "vc-facil-01",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é o objetivo principal de um fundo de Venture Capital?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Financiar apenas empresas que já distribuem dividendos."
      },
      {
        "letra": "B",
        "texto": "Conceder empréstimos com retorno fixo garantido."
      },
      {
        "letra": "C",
        "texto": "Investir em empresas com alto potencial de crescimento e buscar retorno com sua valorização."
      },
      {
        "letra": "D",
        "texto": "Comprar obrigatoriamente o controle de empresas maduras."
      }
    ],
    "resposta": "C",
    "feedback": "O VC investe em negócios que podem crescer muito, mesmo com bastante incerteza. O retorno costuma depender da valorização e da venda futura da participação."
  },
  {
    "id": "vc-facil-02",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual característica é mais associada a uma startup escalável?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Conseguir aumentar a receita sem elevar os custos na mesma proporção."
      },
      {
        "letra": "B",
        "texto": "Precisar dobrar a equipe sempre que dobrar a receita."
      },
      {
        "letra": "C",
        "texto": "Operar sem qualquer custo variável."
      },
      {
        "letra": "D",
        "texto": "Crescer sem precisar conquistar novos clientes."
      }
    ],
    "resposta": "A",
    "feedback": "Pense em um produto que consegue atender muito mais clientes usando boa parte da mesma estrutura. Escalar significa crescer com eficiência, não operar sem custos."
  },
  {
    "id": "vc-facil-03",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que significa uma rodada de investimento?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma reunião mensal dos fundadores."
      },
      {
        "letra": "B",
        "texto": "Um empréstimo pessoal feito por um executivo."
      },
      {
        "letra": "C",
        "texto": "Uma distribuição de dividendos."
      },
      {
        "letra": "D",
        "texto": "Um processo de captação de recursos com investidores."
      }
    ],
    "resposta": "D",
    "feedback": "Na rodada, a startup busca capital para financiar sua trajetória. Em troca, o investidor recebe participação ou direitos que podem se converter em participação, conforme o instrumento."
  },
  {
    "id": "vc-facil-04",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Em uma rodada primária de equity, para onde vão os recursos investidos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Exclusivamente para os fundadores."
      },
      {
        "letra": "B",
        "texto": "Para o caixa da startup."
      },
      {
        "letra": "C",
        "texto": "Para os clientes da startup."
      },
      {
        "letra": "D",
        "texto": "Para os acionistas que não participaram."
      }
    ],
    "resposta": "B",
    "feedback": "O dinheiro da rodada primária entra na empresa para financiar sua operação e seus planos. Quando um acionista vende ações existentes, trata-se de uma transação secundária."
  },
  {
    "id": "vc-facil-05",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é um MVP — Minimum Viable Product?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um produto completo, sem necessidade de melhorias."
      },
      {
        "letra": "B",
        "texto": "Uma apresentação que substitui qualquer teste com clientes."
      },
      {
        "letra": "C",
        "texto": "Uma versão mínima que permite testar hipóteses relevantes com usuários."
      },
      {
        "letra": "D",
        "texto": "Um produto que precisa ser gratuito para sempre."
      }
    ],
    "resposta": "C",
    "feedback": "O MVP ajuda a aprender antes de investir demais na solução. A ideia é testar hipóteses importantes com uma versão suficiente para gerar evidências."
  },
  {
    "id": "vc-facil-06",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que significa product-market fit?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Evidências de que o produto atende a uma necessidade relevante de um mercado."
      },
      {
        "letra": "B",
        "texto": "Ter uma marca registrada."
      },
      {
        "letra": "C",
        "texto": "Receber investimento de um fundo conhecido."
      },
      {
        "letra": "D",
        "texto": "Lançar o produto antes dos concorrentes."
      }
    ],
    "resposta": "A",
    "feedback": "Product-market fit aparece quando o mercado demonstra que quer o produto. Uso recorrente, retenção e disposição para pagar podem trazer evidências — investimento recebido, sozinho, não comprova isso."
  },
  {
    "id": "vc-facil-07",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que o TAM procura estimar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O caixa disponível para os próximos meses."
      },
      {
        "letra": "B",
        "texto": "A participação atual da startup."
      },
      {
        "letra": "C",
        "texto": "O valor contábil dos seus ativos."
      },
      {
        "letra": "D",
        "texto": "O tamanho total do mercado endereçável."
      }
    ],
    "resposta": "D",
    "feedback": "O TAM ajuda a entender o tamanho da oportunidade. Ele não representa a receita que a startup certamente terá, mas o mercado total que sua solução poderia atender."
  },
  {
    "id": "vc-facil-08",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é um pitch deck?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um contrato definitivo de investimento."
      },
      {
        "letra": "B",
        "texto": "Uma apresentação do negócio, da oportunidade e da proposta aos investidores."
      },
      {
        "letra": "C",
        "texto": "Uma garantia de retorno."
      },
      {
        "letra": "D",
        "texto": "Um relatório obrigatório de auditoria."
      }
    ],
    "resposta": "B",
    "feedback": "O pitch deck apresenta a história do negócio: problema, solução, mercado, equipe, resultados e planos. Ele abre a conversa, mas não substitui uma análise aprofundada."
  },
  {
    "id": "vc-facil-09",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é a principal função de um term sheet?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Transferir automaticamente todas as ações aos investidores."
      },
      {
        "letra": "B",
        "texto": "Garantir que a rodada será concluída."
      },
      {
        "letra": "C",
        "texto": "Registrar os principais termos propostos para o investimento."
      },
      {
        "letra": "D",
        "texto": "Substituir toda a documentação definitiva."
      }
    ],
    "resposta": "C",
    "feedback": "O term sheet organiza os termos econômicos e de governança antes dos contratos finais. Muitas disposições podem ser não vinculantes, enquanto outras, como confidencialidade, podem ser vinculantes."
  },
  {
    "id": "vc-facil-10",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é diluição?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Redução da participação percentual de um acionista após a emissão de novas participações."
      },
      {
        "letra": "B",
        "texto": "Redução obrigatória do número de ações que ele possui."
      },
      {
        "letra": "C",
        "texto": "Cancelamento das ações dos fundadores."
      },
      {
        "letra": "D",
        "texto": "Queda automática do valor econômico do investimento."
      }
    ],
    "resposta": "A",
    "feedback": "Você pode continuar com a mesma quantidade de ações e passar a ter uma fatia menor do total. Isso não significa necessariamente perder dinheiro, porque a empresa também pode valer mais."
  },
  {
    "id": "vc-facil-11",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que representa o burn rate líquido de caixa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O total de vendas realizadas."
      },
      {
        "letra": "B",
        "texto": "O valor da empresa na última rodada."
      },
      {
        "letra": "C",
        "texto": "O lucro acumulado desde a fundação."
      },
      {
        "letra": "D",
        "texto": "A velocidade com que a empresa consome caixa, considerando entradas e saídas."
      }
    ],
    "resposta": "D",
    "feedback": "O burn líquido mostra quanto o caixa diminui ao longo do tempo por causa das atividades consideradas. É uma medida importante para entender quanto tempo a empresa consegue continuar operando."
  },
  {
    "id": "vc-facil-12",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é runway?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O prazo até a empresa abrir capital obrigatoriamente."
      },
      {
        "letra": "B",
        "texto": "O tempo estimado até o caixa acabar, dadas as premissas de consumo de caixa."
      },
      {
        "letra": "C",
        "texto": "O tempo necessário para desenvolver qualquer produto."
      },
      {
        "letra": "D",
        "texto": "O prazo de permanência dos fundadores no conselho."
      }
    ],
    "resposta": "B",
    "feedback": "Runway é o “fôlego” financeiro da startup. Ele depende do caixa disponível e de quanto a empresa deve consumir por mês."
  },
  {
    "id": "vc-facil-13",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que significa CAC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Caixa acumulado por cliente."
      },
      {
        "letra": "B",
        "texto": "Capital autorizado da companhia."
      },
      {
        "letra": "C",
        "texto": "Custo de aquisição de clientes."
      },
      {
        "letra": "D",
        "texto": "Crescimento anual contratado."
      }
    ],
    "resposta": "C",
    "feedback": "O CAC mede quanto a empresa gasta, em média, para conquistar um cliente. Ajuda a avaliar se a aquisição de clientes pode ser economicamente sustentável."
  },
  {
    "id": "vc-facil-14",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que o LTV procura estimar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A contribuição econômica que um cliente gera ao longo do relacionamento, conforme a metodologia adotada."
      },
      {
        "letra": "B",
        "texto": "Apenas o valor da primeira compra."
      },
      {
        "letra": "C",
        "texto": "O valuation da próxima rodada."
      },
      {
        "letra": "D",
        "texto": "O total de investimentos já recebidos."
      }
    ],
    "resposta": "A",
    "feedback": "O LTV olha para o relacionamento inteiro, não apenas para a primeira venda. Para comparar com CAC, é importante considerar margens e usar premissas realistas de permanência."
  },
  {
    "id": "vc-facil-15",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Em um negócio por assinatura, o que é churn de clientes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Crescimento da receita dos clientes existentes."
      },
      {
        "letra": "B",
        "texto": "Número de novos clientes conquistados."
      },
      {
        "letra": "C",
        "texto": "Aumento do preço da assinatura."
      },
      {
        "letra": "D",
        "texto": "Proporção de clientes perdidos em determinado período."
      }
    ],
    "resposta": "D",
    "feedback": "Churn de clientes mede cancelamentos em relação à base inicial do período. Ele ajuda a entender se a empresa consegue manter quem já conquistou."
  },
  {
    "id": "vc-facil-16",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é um possível caminho de saída para um fundo de VC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Receber automaticamente o investimento de volta na próxima rodada."
      },
      {
        "letra": "B",
        "texto": "Vender sua participação em uma aquisição da startup."
      },
      {
        "letra": "C",
        "texto": "Transformar qualquer prejuízo em dividendos."
      },
      {
        "letra": "D",
        "texto": "Exigir que todos os clientes comprem suas ações."
      }
    ],
    "resposta": "B",
    "feedback": "Uma aquisição pode permitir que o fundo venda sua participação e realize o retorno. Uma nova rodada, por si só, não garante liquidez para os investidores antigos."
  },
  {
    "id": "vc-facil-17",
    "areaId": "venture-capital",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Por que a equipe fundadora importa tanto na análise de uma startup inicial?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque uma equipe experiente elimina o risco de mercado."
      },
      {
        "letra": "B",
        "texto": "Porque o currículo garante a aceitação do produto."
      },
      {
        "letra": "C",
        "texto": "Porque a capacidade de executar, aprender e se adaptar influencia fortemente a trajetória do negócio."
      },
      {
        "letra": "D",
        "texto": "Porque bons fundadores dispensam governança."
      }
    ],
    "resposta": "C",
    "feedback": "No início, muitas hipóteses ainda vão mudar. A capacidade de aprender com clientes, executar e ajustar o caminho é essencial — mas não elimina a necessidade de analisar o negócio."
  },
  {
    "id": "vc-medio-18",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma startup recebe R$ 5 milhões com valuation pre-money de R$ 20 milhões. Sem outros ajustes, qual é o post-money?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 25 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 15 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 20 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 100 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "O post-money soma o valor antes da rodada ao dinheiro novo: 20 + 5 = R$ 25 milhões. Esse é um dos cálculos-base de uma rodada!"
  },
  {
    "id": "vc-medio-19",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Na mesma rodada, o investidor aporta R$ 5 milhões e o post-money é R$ 25 milhões. Qual participação ele recebe, sem outros ajustes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "25%."
      },
      {
        "letra": "B",
        "texto": "5%."
      },
      {
        "letra": "C",
        "texto": "16,7%."
      },
      {
        "letra": "D",
        "texto": "20%."
      }
    ],
    "resposta": "D",
    "feedback": "A participação é calculada sobre o valor depois do aporte: 5 ÷ 25 = 20%. Um cuidado importante: usar o pre-money no denominador daria uma resposta diferente e incorreta."
  },
  {
    "id": "vc-medio-20",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma startup tem R$ 3 milhões em caixa e burn líquido constante de R$ 250 mil por mês. Sem novos recursos, qual é o runway?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "8 meses."
      },
      {
        "letra": "B",
        "texto": "12 meses."
      },
      {
        "letra": "C",
        "texto": "15 meses."
      },
      {
        "letra": "D",
        "texto": "24 meses."
      }
    ],
    "resposta": "B",
    "feedback": "Dividimos o caixa pelo consumo mensal: 3.000.000 ÷ 250.000 = 12 meses. Na prática, vale atualizar a conta conforme receitas e despesas mudam."
  },
  {
    "id": "vc-medio-21",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma startup gastou R$ 120 mil em aquisição e conquistou 60 novos clientes atribuíveis a esse gasto. Qual é o CAC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 500."
      },
      {
        "letra": "B",
        "texto": "R$ 7.200."
      },
      {
        "letra": "C",
        "texto": "R$ 2.000."
      },
      {
        "letra": "D",
        "texto": "R$ 120."
      }
    ],
    "resposta": "C",
    "feedback": "O custo médio é gasto de aquisição ÷ clientes conquistados. Assim, 120.000 ÷ 60 = R$ 2.000 por cliente."
  },
  {
    "id": "vc-medio-22",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Para este exercício, LTV é a contribuição mensal por cliente multiplicada pelo tempo médio de permanência. Com contribuição de R$ 100 por mês e permanência de 24 meses, qual é o LTV?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 2.400."
      },
      {
        "letra": "B",
        "texto": "R$ 100."
      },
      {
        "letra": "C",
        "texto": "R$ 24.000."
      },
      {
        "letra": "D",
        "texto": "R$ 4,17."
      }
    ],
    "resposta": "A",
    "feedback": "Pela definição apresentada, LTV = 100 × 24 = R$ 2.400. A conta usa contribuição, e não apenas receita, para refletir os custos associados ao atendimento."
  },
  {
    "id": "vc-medio-23",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Um cliente custa R$ 600 para ser adquirido e gera R$ 100 mensais de contribuição. Sem outros efeitos, qual é o payback do CAC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "3 meses."
      },
      {
        "letra": "B",
        "texto": "12 meses."
      },
      {
        "letra": "C",
        "texto": "10 meses."
      },
      {
        "letra": "D",
        "texto": "6 meses."
      }
    ],
    "resposta": "D",
    "feedback": "Queremos saber quanto tempo a contribuição leva para recuperar o custo de aquisição: 600 ÷ 100 = 6 meses."
  },
  {
    "id": "vc-medio-24",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma empresa começou o mês com 200 clientes e perdeu 10 deles. Qual é o churn mensal de clientes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "10%."
      },
      {
        "letra": "B",
        "texto": "5%."
      },
      {
        "letra": "C",
        "texto": "2%."
      },
      {
        "letra": "D",
        "texto": "20%."
      }
    ],
    "resposta": "B",
    "feedback": "O churn usa a base do início do período: 10 ÷ 200 = 5%. Novos clientes adquiridos no mês não entram no denominador dessa conta."
  },
  {
    "id": "vc-medio-25",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma empresa de assinaturas tem 100 clientes pagando R$ 200 mensais cada. Qual é o MRR, sem outras receitas ou descontos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 200 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 240 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 20 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 2 mil."
      }
    ],
    "resposta": "C",
    "feedback": "MRR é a receita recorrente mensal: 100 × R$ 200 = R$ 20 mil. Ele ajuda a acompanhar a base recorrente do negócio."
  },
  {
    "id": "vc-medio-26",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma empresa tem MRR de R$ 50 mil. Usando ARR = MRR × 12, qual é o ARR?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 600 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 50 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 4,17 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 5 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "Anualizamos a receita recorrente mensal: 50 mil × 12 = R$ 600 mil. É uma medida anualizada da base atual, não necessariamente a receita já realizada no ano."
  },
  {
    "id": "vc-medio-27",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Um marketplace intermediou R$ 1 milhão em vendas e cobrou comissão de 10%. Sem outras receitas, qual é sua receita de comissão?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 1 milhão."
      },
      {
        "letra": "B",
        "texto": "R$ 900 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 1,1 milhão."
      },
      {
        "letra": "D",
        "texto": "R$ 100 mil."
      }
    ],
    "resposta": "D",
    "feedback": "O valor transacionado não é automaticamente receita do marketplace. A comissão é R$ 1 milhão × 10% = R$ 100 mil."
  },
  {
    "id": "vc-medio-28",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Qual é a principal utilidade de analisar retenção por coortes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Misturar clientes antigos e novos em um único número."
      },
      {
        "letra": "B",
        "texto": "Comparar a permanência de grupos de clientes adquiridos em períodos semelhantes."
      },
      {
        "letra": "C",
        "texto": "Calcular apenas o total de downloads."
      },
      {
        "letra": "D",
        "texto": "Garantir que o churn cairá."
      }
    ],
    "resposta": "B",
    "feedback": "Coortes ajudam a enxergar como cada grupo se comporta ao longo do tempo. Assim, o crescimento de novos clientes não esconde a perda dos antigos."
  },
  {
    "id": "vc-medio-29",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma startup tem muitos downloads, mas quase ninguém volta a usar o produto. Qual é a melhor interpretação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Os downloads comprovam product-market fit."
      },
      {
        "letra": "B",
        "texto": "A retenção deixou de importar."
      },
      {
        "letra": "C",
        "texto": "Existe interesse inicial, mas o uso recorrente e a proposta de valor precisam ser investigados."
      },
      {
        "letra": "D",
        "texto": "O negócio deve necessariamente ser encerrado."
      }
    ],
    "resposta": "C",
    "feedback": "Downloads mostram que pessoas experimentaram o produto. Para entender se ele resolve um problema de forma sustentável, precisamos observar se elas voltam e continuam usando."
  },
  {
    "id": "vc-medio-30",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma startup afirma que seu mercado é “todo o setor de saúde”. Qual abordagem melhora a estimativa da oportunidade inicial?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Definir clientes-alvo, quantidade de compradores e gasto possível com a solução."
      },
      {
        "letra": "B",
        "texto": "Usar o PIB do país como receita potencial."
      },
      {
        "letra": "C",
        "texto": "Assumir que todos comprarão o produto."
      },
      {
        "letra": "D",
        "texto": "Multiplicar o mercado global por uma participação arbitrária."
      }
    ],
    "resposta": "A",
    "feedback": "Um mercado enorme pode parecer atraente, mas precisa fazer sentido para o produto. Estimar de baixo para cima ajuda a conectar a oportunidade a clientes e preços reais."
  },
  {
    "id": "vc-medio-31",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma fundadora possui 40% da startup antes de uma rodada. Novas ações dão 20% do post-money ao investidor. Sem outras mudanças, qual será a participação da fundadora?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "20%."
      },
      {
        "letra": "B",
        "texto": "40%."
      },
      {
        "letra": "C",
        "texto": "50%."
      },
      {
        "letra": "D",
        "texto": "32%."
      }
    ],
    "resposta": "D",
    "feedback": "Os acionistas antigos passam a dividir 80% da empresa. A fundadora mantém 40% dessa fatia: 40% × 80% = 32%."
  },
  {
    "id": "vc-medio-32",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "O que é uma down round?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma rodada com menos investidores, independentemente do preço."
      },
      {
        "letra": "B",
        "texto": "Uma rodada com preço por ação inferior ao da rodada anterior, em bases comparáveis."
      },
      {
        "letra": "C",
        "texto": "Uma rodada feita antes do lançamento do produto."
      },
      {
        "letra": "D",
        "texto": "Uma venda de ações feita apenas pelos fundadores."
      }
    ],
    "resposta": "B",
    "feedback": "O ponto central é o preço por ação cair em relação à rodada anterior. Isso pode aumentar a diluição e acionar proteções contratuais, dependendo dos termos existentes."
  },
  {
    "id": "vc-medio-33",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Qual é uma finalidade típica do vesting dos fundadores?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir retorno ao investidor."
      },
      {
        "letra": "B",
        "texto": "Impedir qualquer contratação."
      },
      {
        "letra": "C",
        "texto": "Vincular a consolidação de direitos sobre a participação à permanência ou a condições acordadas."
      },
      {
        "letra": "D",
        "texto": "Eliminar a possibilidade de saída da empresa."
      }
    ],
    "resposta": "C",
    "feedback": "O vesting ajuda a alinhar o compromisso de longo prazo dos fundadores. Se alguém sai cedo, parte da participação pode estar sujeita às regras de recompra ou perda acordadas."
  },
  {
    "id": "vc-medio-34",
    "areaId": "venture-capital",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Qual é a utilidade de acompanhar a cap table?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Entender quem possui a empresa e como emissões e conversões afetam as participações."
      },
      {
        "letra": "B",
        "texto": "Acompanhar somente o saldo bancário."
      },
      {
        "letra": "C",
        "texto": "Substituir as demonstrações financeiras."
      },
      {
        "letra": "D",
        "texto": "Calcular exclusivamente a folha salarial."
      }
    ],
    "resposta": "A",
    "feedback": "A cap table organiza participações e instrumentos relevantes. Ela ajuda a enxergar a distribuição econômica da empresa e a simular a diluição de futuras rodadas."
  },
  {
    "id": "vc-dificil-35",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma startup tem 1 milhão de ações e valuation pre-money de R$ 12 milhões. Um investidor aporta R$ 3 milhões pelo mesmo preço por ação. Sem opções ou outros instrumentos, quantas novas ações serão emitidas?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "200 mil."
      },
      {
        "letra": "B",
        "texto": "300 mil."
      },
      {
        "letra": "C",
        "texto": "250 mil."
      },
      {
        "letra": "D",
        "texto": "400 mil."
      }
    ],
    "resposta": "C",
    "feedback": "Primeiro, o preço por ação é 12 milhões ÷ 1 milhão = R$ 12. Depois, 3 milhões ÷ 12 = 250 mil novas ações."
  },
  {
    "id": "vc-dificil-36",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma fundadora possui 60% da startup. Na primeira rodada, novos investidores recebem 20% do post-money; na segunda, recebem 25%. Sem outras mudanças, quanto resta para a fundadora?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "15%."
      },
      {
        "letra": "B",
        "texto": "36%."
      },
      {
        "letra": "C",
        "texto": "45%."
      },
      {
        "letra": "D",
        "texto": "40%."
      }
    ],
    "resposta": "B",
    "feedback": "As diluições acontecem em sequência: 60% × 80% × 75% = 36%. Não basta subtrair os percentuais das rodadas da participação inicial."
  },
  {
    "id": "vc-dificil-37",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma startup tem R$ 2,4 milhões em caixa. Consumirá R$ 200 mil mensais nos primeiros seis meses e, depois, R$ 300 mil mensais. Sem novos recursos, qual é o runway total?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "8 meses."
      },
      {
        "letra": "B",
        "texto": "12 meses."
      },
      {
        "letra": "C",
        "texto": "9 meses."
      },
      {
        "letra": "D",
        "texto": "10 meses."
      }
    ],
    "resposta": "D",
    "feedback": "Em seis meses, ela consome 6 × 200 mil = R$ 1,2 milhão. O restante dura 1,2 milhão ÷ 300 mil = 4 meses. Total: 10 meses."
  },
  {
    "id": "vc-dificil-38",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma coorte começa com R$ 100 mil de MRR. No período, perde R$ 10 mil por cancelamentos e R$ 5 mil por reduções de planos, mas ganha R$ 25 mil por expansão. Qual é a NRR, sem novos clientes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "110%."
      },
      {
        "letra": "B",
        "texto": "125%."
      },
      {
        "letra": "C",
        "texto": "85%."
      },
      {
        "letra": "D",
        "texto": "100%."
      }
    ],
    "resposta": "A",
    "feedback": "A NRR acompanha a receita da mesma base: (100 − 10 − 5 + 25) ÷ 100 = 110%. A expansão mais que compensou as perdas."
  },
  {
    "id": "vc-dificil-39",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma startup apresenta NRR de 120%. O que isso permite concluir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Nenhum cliente cancelou."
      },
      {
        "letra": "B",
        "texto": "O número de clientes cresceu 20%."
      },
      {
        "letra": "C",
        "texto": "A receita da base existente cresceu 20% líquida de perdas, podendo ainda haver cancelamentos."
      },
      {
        "letra": "D",
        "texto": "A receita total da empresa cresceu exatamente 20%."
      }
    ],
    "resposta": "C",
    "feedback": "A NRR mede receita, não quantidade de clientes. Alguns podem ter saído, enquanto outros ampliaram o gasto o suficiente para compensar essas perdas."
  },
  {
    "id": "vc-dificil-40",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "A startup divulga LTV/CAC muito alto, mas tem poucos meses de histórico e quase nenhum cancelamento observado. Qual é a principal cautela?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O histórico curto garante que o churn será baixo."
      },
      {
        "letra": "B",
        "texto": "O LTV pode estar inflado por uma estimativa pouco confiável de permanência."
      },
      {
        "letra": "C",
        "texto": "O CAC deixa de importar."
      },
      {
        "letra": "D",
        "texto": "Todo cliente deve ser tratado como permanente."
      }
    ],
    "resposta": "B",
    "feedback": "Poucos cancelamentos no começo não significam que os clientes ficarão por muitos anos. Como o LTV depende da permanência, uma base curta pode produzir uma estimativa otimista demais."
  },
  {
    "id": "vc-dificil-41",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma startup melhora o LTV/CAC, mas o payback do CAC passa a ser muito longo. Qual preocupação permanece?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O negócio necessariamente deixou de criar valor."
      },
      {
        "letra": "B",
        "texto": "O LTV/CAC é sempre inútil."
      },
      {
        "letra": "C",
        "texto": "A empresa não precisará de capital adicional."
      },
      {
        "letra": "D",
        "texto": "Pode faltar caixa para financiar a aquisição até recuperar o investimento."
      }
    ],
    "resposta": "D",
    "feedback": "Um cliente pode ser rentável ao longo da vida e demorar para devolver o dinheiro gasto para conquistá-lo. Esse intervalo exige financiamento e precisa caber no caixa da empresa."
  },
  {
    "id": "vc-dificil-42",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um investidor aplicou R$ 5 milhões e possui 20% da startup, com preferência de liquidação de 1 vez, não participante. A empresa é vendida, e há R$ 15 milhões disponíveis aos acionistas. Sem outros direitos, quanto o investidor recebe?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 5 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 3 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 8 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 15 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "Ele escolhe entre a preferência de R$ 5 milhões e sua participação convertida de 20% × 15 = R$ 3 milhões. Como a preferência é não participante, não soma os dois."
  },
  {
    "id": "vc-dificil-43",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "O mesmo investidor possui 20% e preferência de 1 vez não participante sobre R$ 5 milhões. Se houver R$ 50 milhões disponíveis aos acionistas na venda, quanto ele recebe?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 5 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 15 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 10 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 25 milhões."
      }
    ],
    "resposta": "C",
    "feedback": "Agora, converter é melhor: 20% × 50 = R$ 10 milhões, acima da preferência de R$ 5 milhões. Ele recebe R$ 10 milhões, sem somar a preferência."
  },
  {
    "id": "vc-dificil-44",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um investidor aportou R$ 5 milhões e possui 20%, com preferência de 1 vez participante, sem limite de participação. Há R$ 15 milhões disponíveis na venda. Sem outros direitos, quanto ele recebe?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 5 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 7 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 3 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 8 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "Ele recebe primeiro R$ 5 milhões. Depois, participa de 20% dos R$ 10 milhões restantes: mais R$ 2 milhões. Total: R$ 7 milhões. Essa é a diferença da preferência participante."
  },
  {
    "id": "vc-dificil-45",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma rodada tem valuation elevado, mas exige preferências econômicas muito favoráveis ao novo investidor. Como comparar essa proposta com outra de valuation menor e termos mais simples?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Escolher sempre o maior valuation."
      },
      {
        "letra": "B",
        "texto": "Ignorar os termos porque só importam na assinatura."
      },
      {
        "letra": "C",
        "texto": "Comparar apenas o percentual nominal dos fundadores."
      },
      {
        "letra": "D",
        "texto": "Simular a distribuição dos recursos em diferentes saídas e avaliar os direitos envolvidos."
      }
    ],
    "resposta": "D",
    "feedback": "O valuation não conta a história inteira. Preferências podem mudar quanto cada acionista recebe na venda. Simular cenários ajuda a comparar o resultado econômico real das propostas."
  },
  {
    "id": "vc-dificil-46",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo possui 10% de uma startup que captará R$ 20 milhões. Sem outros ajustes, quanto ele precisa investir na rodada, ao mesmo preço dos demais, para manter os 10%?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 2 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 20 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 200 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 10 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "Para acompanhar proporcionalmente, o fundo investe sua fatia da rodada: 10% × R$ 20 milhões = R$ 2 milhões. Isso pressupõe que ele possa exercer esse direito."
  },
  {
    "id": "vc-dificil-47",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo investe R$ 4 milhões por 20% de uma startup. Depois, é diluído para 10% e vende toda a participação por R$ 40 milhões. Sem outros aportes ou distribuições, qual é o MOIC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "5 vezes."
      },
      {
        "letra": "B",
        "texto": "20 vezes."
      },
      {
        "letra": "C",
        "texto": "10 vezes."
      },
      {
        "letra": "D",
        "texto": "2,5 vezes."
      }
    ],
    "resposta": "C",
    "feedback": "O retorno usa os fluxos do fundo: MOIC = 40 ÷ 4 = 10 vezes. A diluição importa para determinar a fatia vendida, mas o valor recebido já foi informado."
  },
  {
    "id": "vc-dificil-48",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo de R$ 100 milhões investiu R$ 5 milhões em uma startup e terminou com 10% dela. Sem preferências, dívida, taxas ou outros efeitos, qual valor de venda da startup permitiria a essa participação devolver R$ 100 milhões ao fundo?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 500 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 1 bilhão."
      },
      {
        "letra": "C",
        "texto": "R$ 100 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 2 bilhões."
      }
    ],
    "resposta": "B",
    "feedback": "Queremos que 10% da venda sejam R$ 100 milhões: valor de venda = 100 milhões ÷ 10% = R$ 1 bilhão. Isso mostra por que o tamanho potencial da saída importa tanto em VC."
  },
  {
    "id": "vc-dificil-49",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Por que fundos de VC costumam buscar investimentos capazes de gerar retornos muito elevados?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque todas as startups necessariamente terão grandes saídas."
      },
      {
        "letra": "B",
        "texto": "Porque diversificação elimina perdas."
      },
      {
        "letra": "C",
        "texto": "Porque o fundo recebe retorno fixo mesmo quando a startup falha."
      },
      {
        "letra": "D",
        "texto": "Porque poucos grandes sucessos podem compensar vários investimentos com baixo retorno ou perda total."
      }
    ],
    "resposta": "D",
    "feedback": "Os resultados em VC podem ser muito concentrados. Uma pequena parte do portfólio pode responder por grande parte do retorno, então o potencial de ganho precisa ser relevante para o fundo."
  },
  {
    "id": "vc-dificil-50",
    "areaId": "venture-capital",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma startup cresce rapidamente, mas perde dinheiro em cada venda mesmo antes das despesas fixas. A tese afirma que “a escala resolverá tudo”. Qual é a melhor análise?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Investigar como preço, custos e comportamento dos clientes poderiam tornar a contribuição positiva."
      },
      {
        "letra": "B",
        "texto": "Aprovar, pois crescimento sempre corrige margens negativas."
      },
      {
        "letra": "C",
        "texto": "Considerar apenas o tamanho do mercado."
      },
      {
        "letra": "D",
        "texto": "Aumentar o investimento em marketing sem rever a operação."
      }
    ],
    "resposta": "A",
    "feedback": "Crescer com contribuição negativa pode ampliar o consumo de caixa. A escala só ajuda se houver um caminho plausível para melhorar a economia de cada venda. Vale testar esse caminho com dados."
  },
  {
    "id": "pe-facil-01",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é o objetivo central de um fundo tradicional de PE?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Emprestar dinheiro a pessoas físicas."
      },
      {
        "letra": "B",
        "texto": "Comprar participações, criar valor e realizar o investimento com retorno."
      },
      {
        "letra": "C",
        "texto": "Garantir dividendos fixos anuais."
      },
      {
        "letra": "D",
        "texto": "Negociar ações diariamente."
      }
    ],
    "resposta": "B",
    "feedback": "O fundo investe com uma tese de valorização e trabalha para concretizá-la. O retorno pode vir de distribuições e da venda futura da participação."
  },
  {
    "id": "pe-facil-02",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Quem são os Limited Partners — LPs?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Executivos das investidas."
      },
      {
        "letra": "B",
        "texto": "Bancos financiadores."
      },
      {
        "letra": "C",
        "texto": "Assessores de venda."
      },
      {
        "letra": "D",
        "texto": "Investidores que comprometem capital com o fundo."
      }
    ],
    "resposta": "D",
    "feedback": "Os LPs fornecem o capital que será investido pelo fundo. A gestão seleciona e acompanha os investimentos conforme o mandato combinado."
  },
  {
    "id": "pe-facil-03",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é o papel do General Partner — GP?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Gerir o fundo e tomar decisões de investimento."
      },
      {
        "letra": "B",
        "texto": "Garantir todas as dívidas das investidas."
      },
      {
        "letra": "C",
        "texto": "Auditar obrigatoriamente as empresas."
      },
      {
        "letra": "D",
        "texto": "Definir a política monetária."
      }
    ],
    "resposta": "A",
    "feedback": "Pense no GP como quem conduz a estratégia do fundo: analisa oportunidades, decide investimentos e acompanha as empresas, respeitando o mandato e a governança."
  },
  {
    "id": "pe-facil-04",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que caracteriza um leveraged buyout — LBO?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Compra financiada apenas pelos fundadores."
      },
      {
        "letra": "B",
        "texto": "Compra obrigatória de empresa em recuperação."
      },
      {
        "letra": "C",
        "texto": "Aquisição com capital próprio e dívida relevante."
      },
      {
        "letra": "D",
        "texto": "Investimento sem previsão de saída."
      }
    ],
    "resposta": "C",
    "feedback": "No LBO, a dívida financia parte importante da compra. A geração de caixa da empresa precisa sustentar juros e amortizações."
  },
  {
    "id": "pe-facil-05",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é uma diferença típica entre buyout e venture capital?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Buyout só ocorre em empresas listadas."
      },
      {
        "letra": "B",
        "texto": "Buyout costuma envolver empresas maduras; VC, negócios mais jovens e incertos."
      },
      {
        "letra": "C",
        "texto": "VC exige caixa positivo desde o início."
      },
      {
        "letra": "D",
        "texto": "Buyout impede mudanças na gestão."
      }
    ],
    "resposta": "B",
    "feedback": "Buyouts geralmente partem de operações mais estabelecidas. Venture capital costuma assumir mais incerteza sobre o modelo de negócio em busca de crescimento elevado."
  },
  {
    "id": "pe-facil-06",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual empresa tende a ser mais adequada a um LBO?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Pré-operacional e sem receita."
      },
      {
        "letra": "B",
        "texto": "Com demanda imprevisível e aportes constantes."
      },
      {
        "letra": "C",
        "texto": "Com produto prestes a perder autorização de venda."
      },
      {
        "letra": "D",
        "texto": "Com receita previsível, caixa consistente e reinvestimento moderado."
      }
    ],
    "resposta": "D",
    "feedback": "A dívida exige pagamentos mesmo quando o negócio enfrenta dificuldades. Receitas previsíveis e caixa disponível tornam a empresa mais preparada para assumir esses compromissos."
  },
  {
    "id": "pe-facil-07",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é uma tese de investimento?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Explicação da atratividade, criação de valor e riscos do investimento."
      },
      {
        "letra": "B",
        "texto": "Garantia de retorno."
      },
      {
        "letra": "C",
        "texto": "Lista de empresas rejeitadas."
      },
      {
        "letra": "D",
        "texto": "Substituto da due diligence."
      }
    ],
    "resposta": "A",
    "feedback": "A tese responde: por que investir, como criar valor e o que pode dar errado? Ela orienta a análise, mas precisa ser testada com evidências."
  },
  {
    "id": "pe-facil-08",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que significa exit?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Substituição do diretor financeiro."
      },
      {
        "letra": "B",
        "texto": "Pagamento de uma dívida."
      },
      {
        "letra": "C",
        "texto": "Realização total ou parcial do investimento."
      },
      {
        "letra": "D",
        "texto": "Encerramento da empresa."
      }
    ],
    "resposta": "C",
    "feedback": "O exit é a saída do investimento, por exemplo, pela venda da participação. Uma abertura de capital pode facilitar esse caminho, mas o fundo realiza caixa quando vende suas ações."
  },
  {
    "id": "pe-facil-09",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é um exemplo de criação de valor operacional?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aumentar o múltiplo na apresentação."
      },
      {
        "letra": "B",
        "texto": "Melhorar produtividade e reduzir desperdícios."
      },
      {
        "letra": "C",
        "texto": "Refinanciar sem mudar custo ou prazo."
      },
      {
        "letra": "D",
        "texto": "Adiar contabilmente despesas."
      }
    ],
    "resposta": "B",
    "feedback": "Melhorar a operação significa produzir resultados econômicos melhores de verdade. Menos desperdício pode elevar margem e caixa sem depender de mudanças na avaliação do mercado."
  },
  {
    "id": "pe-facil-10",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que é buy-and-build?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Construir sedes para as investidas."
      },
      {
        "letra": "B",
        "texto": "Investir apenas em negócios pré-operacionais."
      },
      {
        "letra": "C",
        "texto": "Comprar empresas sem buscar integração."
      },
      {
        "letra": "D",
        "texto": "Comprar uma plataforma e fazer aquisições complementares."
      }
    ],
    "resposta": "D",
    "feedback": "A plataforma funciona como base para incorporar outros negócios. O objetivo pode ser ganhar escala, entrar em regiões ou ampliar produtos e capacidades."
  },
  {
    "id": "pe-facil-11",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Para que serve a due diligence?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Validar informações, identificar riscos e testar premissas."
      },
      {
        "letra": "B",
        "texto": "Garantir ausência de problemas futuros."
      },
      {
        "letra": "C",
        "texto": "Substituir os contratos definitivos."
      },
      {
        "letra": "D",
        "texto": "Confirmar obrigatoriamente o preço do vendedor."
      }
    ],
    "resposta": "A",
    "feedback": "A diligência ajuda a descobrir se o investimento é o que parece. Seus achados podem mudar preço, condições ou até a decisão de investir."
  },
  {
    "id": "pe-facil-12",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Por que EBITDA não é igual a caixa disponível?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Já desconta todo investimento em ativos."
      },
      {
        "letra": "B",
        "texto": "Inclui apenas receitas recebidas à vista."
      },
      {
        "letra": "C",
        "texto": "Não contempla integralmente capex, capital de giro, juros e impostos."
      },
      {
        "letra": "D",
        "texto": "Todas as suas despesas são não monetárias."
      }
    ],
    "resposta": "C",
    "feedback": "Depois do EBITDA, ainda existem necessidades de caixa. Uma empresa pode ter bom resultado operacional e precisar gastar bastante para manter ativos, financiar clientes e pagar dívidas."
  },
  {
    "id": "pe-facil-13",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Como calcular o MOIC de um investimento totalmente realizado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Lucro líquido ÷ EBITDA."
      },
      {
        "letra": "B",
        "texto": "Total recebido ÷ capital investido."
      },
      {
        "letra": "C",
        "texto": "Dívida ÷ patrimônio contábil."
      },
      {
        "letra": "D",
        "texto": "Retorno anual ÷ prazo."
      }
    ],
    "resposta": "B",
    "feedback": "O MOIC mostra quantas vezes o dinheiro investido voltou: recebimentos totais ÷ aportes totais. Receber R$ 200 para cada R$ 100 investidos significa MOIC de 2 vezes."
  },
  {
    "id": "pe-facil-14",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é a diferença entre MOIC e TIR?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Só o MOIC considera o tempo."
      },
      {
        "letra": "B",
        "texto": "A TIR mede lucro contábil."
      },
      {
        "letra": "C",
        "texto": "MOIC exige dívida."
      },
      {
        "letra": "D",
        "texto": "A TIR considera o tempo dos fluxos; o MOIC mede o múltiplo do capital."
      }
    ],
    "resposta": "D",
    "feedback": "Dobrar o dinheiro em três ou dez anos gera o mesmo MOIC. Mas receber antes significa maior retorno anual, capturado pela TIR."
  },
  {
    "id": "pe-facil-15",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "O que significa ter controle de uma empresa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Poder dirigir decisões relevantes conforme os direitos societários."
      },
      {
        "letra": "B",
        "texto": "Ter retorno mínimo garantido."
      },
      {
        "letra": "C",
        "texto": "Ser o único credor."
      },
      {
        "letra": "D",
        "texto": "Ter necessariamente 100% das ações."
      }
    ],
    "resposta": "A",
    "feedback": "Controle está ligado ao poder de decisão, não à necessidade de ser dona de todas as ações. A estrutura societária e os direitos existentes importam."
  },
  {
    "id": "pe-facil-16",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Por que oferecer participação societária aos executivos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Para deixar de acompanhar a gestão."
      },
      {
        "letra": "B",
        "texto": "Para impedir qualquer saída de executivos."
      },
      {
        "letra": "C",
        "texto": "Para alinhar remuneração à criação de valor."
      },
      {
        "letra": "D",
        "texto": "Para transferir todas as obrigações do fundo."
      }
    ],
    "resposta": "C",
    "feedback": "Quando os executivos participam da valorização, parte de seu ganho acompanha o dos acionistas. Metas e condições bem desenhadas ajudam esse alinhamento."
  },
  {
    "id": "pe-facil-17",
    "areaId": "private-equity",
    "nivel": "facil",
    "tema": null,
    "enunciado": "Qual é a função do comitê de investimentos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Fazer as vendas comerciais da investida."
      },
      {
        "letra": "B",
        "texto": "Avaliar e deliberar sobre investimentos."
      },
      {
        "letra": "C",
        "texto": "Garantir aprovação regulatória."
      },
      {
        "letra": "D",
        "texto": "Fixar o preço de mercado das investidas."
      }
    ],
    "resposta": "B",
    "feedback": "O comitê examina retorno, riscos e aderência ao mandato antes de decidir. É uma etapa de disciplina e governança, não uma garantia de sucesso."
  },
  {
    "id": "pe-medio-18",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Um fundo investe R$ 100 milhões e recebe R$ 250 milhões na saída, sem outros fluxos. Qual é o MOIC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "1,5 vez."
      },
      {
        "letra": "B",
        "texto": "0,4 vez."
      },
      {
        "letra": "C",
        "texto": "3,5 vezes."
      },
      {
        "letra": "D",
        "texto": "2,5 vezes."
      }
    ],
    "resposta": "D",
    "feedback": "Usamos o total recebido, incluindo a recuperação do capital: MOIC = 250 ÷ 100 = 2,5 vezes. O lucro de R$ 150 milhões é uma medida diferente."
  },
  {
    "id": "pe-medio-19",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Um fundo investe R$ 100 milhões e recebe R$ 121 milhões dois anos depois. Sem outros fluxos, qual é a TIR anual?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "10%."
      },
      {
        "letra": "B",
        "texto": "21%."
      },
      {
        "letra": "C",
        "texto": "10,5%."
      },
      {
        "letra": "D",
        "texto": "12,1%."
      }
    ],
    "resposta": "A",
    "feedback": "O retorno é composto: 100 × (1 + TIR)² = 121. Como 1,10² = 1,21, a TIR é 10% ao ano."
  },
  {
    "id": "pe-medio-20",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma aquisição de EV de R$ 600 milhões é financiada com R$ 350 milhões de dívida. Sem caixa, taxas ou outros usos, quanto equity é necessário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 350 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 950 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 250 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 600 milhões."
      }
    ],
    "resposta": "C",
    "feedback": "As fontes precisam cobrir a aquisição. Como a dívida financia R$ 350 milhões, o restante é 600 − 350 = R$ 250 milhões de equity."
  },
  {
    "id": "pe-medio-21",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Na saída, o EV é R$ 800 milhões, a dívida é R$ 220 milhões e o caixa é R$ 40 milhões. Sem outros ajustes, qual é o Equity Value?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 540 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 620 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 980 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 1,06 bilhão."
      }
    ],
    "resposta": "B",
    "feedback": "Descontamos a dívida e adicionamos o caixa: Equity Value = 800 − 220 + 40 = R$ 620 milhões."
  },
  {
    "id": "pe-medio-22",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Uma empresa com EBITDA de R$ 50 milhões é comprada a 8 vezes EV/EBITDA. Qual é o EV?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 6,25 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 58 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 450 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 400 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "O múltiplo indica quantas vezes o EBITDA corresponde ao valor das operações: EV = 8 × 50 = R$ 400 milhões."
  },
  {
    "id": "pe-medio-23",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Mantido o EV, o que acontece com o Equity Value quando a dívida líquida diminui?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aumenta pelo mesmo valor, sem outros ajustes."
      },
      {
        "letra": "B",
        "texto": "Diminui pelo mesmo valor."
      },
      {
        "letra": "C",
        "texto": "Fica necessariamente igual."
      },
      {
        "letra": "D",
        "texto": "Torna-se igual ao EBITDA."
      }
    ],
    "resposta": "A",
    "feedback": "Pela fórmula Equity Value = EV − dívida líquida, menos dívida líquida significa mais valor para os acionistas. Esse é um dos mecanismos de retorno de um LBO."
  },
  {
    "id": "pe-medio-24",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Duas empresas têm EBITDA igual, mas uma precisa de muito menos capex. Mantido o restante, qual tende a amortizar mais dívida?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A de maior capex."
      },
      {
        "letra": "B",
        "texto": "Ambas, pois EBITDA é caixa."
      },
      {
        "letra": "C",
        "texto": "A de menor capex."
      },
      {
        "letra": "D",
        "texto": "A de maior capex, pois não paga juros."
      }
    ],
    "resposta": "C",
    "feedback": "O que paga dívida é o caixa que sobra. Se menos dinheiro precisa ser reinvestido nos ativos, mais pode ficar disponível para amortização."
  },
  {
    "id": "pe-medio-25",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "O EBITDA inclui um ganho pontual com a venda de um imóvel. Como tratar esse ganho no EBITDA recorrente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Adicionar novamente."
      },
      {
        "letra": "B",
        "texto": "Excluir."
      },
      {
        "letra": "C",
        "texto": "Manter porque houve caixa."
      },
      {
        "letra": "D",
        "texto": "Projetar o mesmo ganho anualmente."
      }
    ],
    "resposta": "B",
    "feedback": "Queremos entender o resultado que o negócio consegue repetir. A venda isolada do imóvel gerou um ganho, mas não representa necessariamente a operação dos próximos anos."
  },
  {
    "id": "pe-medio-26",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "O crescimento exige mais estoques e vendas a prazo. O que pode acontecer com o caixa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sempre aumenta imediatamente."
      },
      {
        "letra": "B",
        "texto": "Nada, pois capital de giro só afeta lucro."
      },
      {
        "letra": "C",
        "texto": "A dívida cai automaticamente."
      },
      {
        "letra": "D",
        "texto": "Parte do caixa é consumida pelo capital de giro."
      }
    ],
    "resposta": "D",
    "feedback": "A empresa pode precisar pagar fornecedores antes de receber dos clientes. Assim, crescer pode exigir dinheiro adicional, mesmo quando as vendas são lucrativas."
  },
  {
    "id": "pe-medio-27",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Qual é a pergunta central de uma análise de quality of earnings?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Quanto do resultado é sustentável e recorrente?"
      },
      {
        "letra": "B",
        "texto": "Qual identidade visual usar?"
      },
      {
        "letra": "C",
        "texto": "Qual banco oferece mais capital social?"
      },
      {
        "letra": "D",
        "texto": "Como elevar EBITDA sem mudar premissas?"
      }
    ],
    "resposta": "A",
    "feedback": "A análise investiga a qualidade por trás do número: recorrência, ajustes contábeis e conversão em caixa. Isso ajuda a não pagar por resultados que não se sustentam."
  },
  {
    "id": "pe-medio-28",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Um cliente representa 60% da receita. Qual é o principal risco?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Diluição automática."
      },
      {
        "letra": "B",
        "texto": "Proibição de financiar capital de giro."
      },
      {
        "letra": "C",
        "texto": "Perda significativa de receita e caixa se ele sair."
      },
      {
        "letra": "D",
        "texto": "Obrigação de vender a empresa ao cliente."
      }
    ],
    "resposta": "C",
    "feedback": "Quanto maior a concentração, maior o impacto de perder um único relacionamento. É importante avaliar contratos, dependência comercial e possibilidade de diversificação."
  },
  {
    "id": "pe-medio-29",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "O fundador concentra os clientes e quer sair logo após a venda. Como reduzir o risco?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Pagar mais para acelerar sua saída."
      },
      {
        "letra": "B",
        "texto": "Planejar transição e institucionalizar os relacionamentos."
      },
      {
        "letra": "C",
        "texto": "Ignorar se a receita cresceu."
      },
      {
        "letra": "D",
        "texto": "Trocar diligência comercial por contábil."
      }
    ],
    "resposta": "B",
    "feedback": "O objetivo é fazer os relacionamentos pertencerem à empresa, sem depender de uma única pessoa. Transição, equipe e processos ajudam a preservar esse valor."
  },
  {
    "id": "pe-medio-30",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Para que serve um cenário de downside?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Provar retorno positivo em qualquer situação."
      },
      {
        "letra": "B",
        "texto": "Encontrar o maior preço possível."
      },
      {
        "letra": "C",
        "texto": "Criar premissas arbitrariamente pessimistas."
      },
      {
        "letra": "D",
        "texto": "Testar caixa, dívida e retorno em condições adversas plausíveis."
      }
    ],
    "resposta": "D",
    "feedback": "O downside pergunta: “E se as coisas forem piores que o esperado?”. Ele ajuda a entender se o investimento resiste sem faltar caixa ou descumprir obrigações."
  },
  {
    "id": "pe-medio-31",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Como se chama uma aquisição complementar feita pela empresa-plataforma?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Add-on ou bolt-on."
      },
      {
        "letra": "B",
        "texto": "Capital call."
      },
      {
        "letra": "C",
        "texto": "Lock-up."
      },
      {
        "letra": "D",
        "texto": "Write-off."
      }
    ],
    "resposta": "A",
    "feedback": "Um add-on complementa a plataforma existente. Pode trazer novos produtos, regiões, clientes ou escala para o grupo."
  },
  {
    "id": "pe-medio-32",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Qual direito é relevante para um fundo minoritário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantia de nunca aportar novamente."
      },
      {
        "letra": "B",
        "texto": "Poder automático sobre toda decisão operacional."
      },
      {
        "letra": "C",
        "texto": "Informação e aprovação de determinadas decisões relevantes."
      },
      {
        "letra": "D",
        "texto": "Recebimento de todo o caixa da empresa."
      }
    ],
    "resposta": "C",
    "feedback": "Mesmo sem controle, o fundo precisa acompanhar e proteger seu investimento. Direitos de informação e aprovação de matérias específicas ajudam nessa proteção."
  },
  {
    "id": "pe-medio-33",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Por que o preço de entrada importa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma boa empresa nunca pode custar caro demais."
      },
      {
        "letra": "B",
        "texto": "Preço maior exige mais criação de valor para atingir o mesmo retorno."
      },
      {
        "letra": "C",
        "texto": "Ele determina sozinho o EBITDA futuro."
      },
      {
        "letra": "D",
        "texto": "Ele não importa quando há dívida."
      }
    ],
    "resposta": "B",
    "feedback": "Uma boa empresa não é automaticamente um bom investimento a qualquer preço. Se os recebimentos futuros forem iguais, pagar mais reduz o retorno."
  },
  {
    "id": "pe-medio-34",
    "areaId": "private-equity",
    "nivel": "medio",
    "tema": null,
    "enunciado": "Quando uma dividend recap aumenta o risco da investida?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Quando reduz dívida e amplia caixa operacional."
      },
      {
        "letra": "B",
        "texto": "Quando converte dívida em ações."
      },
      {
        "letra": "C",
        "texto": "Quando elimina todos os vencimentos."
      },
      {
        "letra": "D",
        "texto": "Quando adiciona dívida sem aumentar a geração operacional de caixa."
      }
    ],
    "resposta": "D",
    "feedback": "A empresa assume dívida para distribuir dinheiro aos acionistas. Eles recebem antes, mas a operação fica com mais obrigações para pagar usando o mesmo negócio."
  },
  {
    "id": "pe-dificil-35",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo compra uma empresa por EV de R$ 500 milhões, usando R$ 300 milhões de dívida e R$ 200 milhões de equity. Na saída, o EV segue em R$ 500 milhões e a dívida líquida é R$ 100 milhões. Sem outros fluxos, qual é o MOIC?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "2,0 vezes."
      },
      {
        "letra": "B",
        "texto": "1,0 vez."
      },
      {
        "letra": "C",
        "texto": "2,5 vezes."
      },
      {
        "letra": "D",
        "texto": "1,5 vez."
      }
    ],
    "resposta": "A",
    "feedback": "O equity de saída é 500 − 100 = 400. Dividindo pelo aporte: 400 ÷ 200 = 2 vezes. Mesmo com EV constante, a redução da dívida aumentou o valor para o acionista."
  },
  {
    "id": "pe-dificil-36",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um aporte de R$ 100 milhões retorna R$ 200 milhões. Como comparar saída em três anos com saída em cinco, sem outros fluxos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Cinco anos têm maior MOIC."
      },
      {
        "letra": "B",
        "texto": "As TIRs são iguais."
      },
      {
        "letra": "C",
        "texto": "O MOIC é igual, mas a TIR é maior em três anos."
      },
      {
        "letra": "D",
        "texto": "Três anos têm menor MOIC."
      }
    ],
    "resposta": "C",
    "feedback": "As duas saídas devolvem 200 ÷ 100 = 2 vezes o capital. A diferença é o tempo: receber antes gera maior retorno anual."
  },
  {
    "id": "pe-dificil-37",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma empresa é comprada com EBITDA de R$ 50 milhões a 10 vezes. Na saída, o EBITDA é R$ 70 milhões e o múltiplo é 8 vezes. Qual é o EV de saída e sua variação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 700 milhões; aumento de R$ 200 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 560 milhões; aumento de R$ 60 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 400 milhões; queda de R$ 100 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 560 milhões; queda de R$ 140 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "Na entrada: 50 × 10 = 500. Na saída: 70 × 8 = 560. O crescimento operacional compensou a queda do múltiplo, aumentando o EV em R$ 60 milhões."
  },
  {
    "id": "pe-dificil-38",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo investe R$ 200 milhões e busca MOIC de 3 vezes, sem distribuições. A dívida líquida na saída será R$ 150 milhões. Qual EV de saída é necessário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 450 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 600 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 650 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 750 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "O fundo precisa receber 200 × 3 = 600 de equity. Como EV = equity + dívida líquida, o EV necessário é 600 + 150 = R$ 750 milhões."
  },
  {
    "id": "pe-dificil-39",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Mantido o preço de compra, qual é o efeito de usar mais dívida em um LBO?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Reduz o equity inicial e pode elevar seu retorno, mas aumenta o risco financeiro."
      },
      {
        "letra": "B",
        "texto": "Reduz o risco e o preço da empresa."
      },
      {
        "letra": "C",
        "texto": "Garante retorno maior em qualquer cenário."
      },
      {
        "letra": "D",
        "texto": "Aumenta automaticamente o valor operacional."
      }
    ],
    "resposta": "A",
    "feedback": "Mais dívida significa menos aporte inicial, o que pode ampliar o retorno sobre o equity. Mas também significa mais compromissos financeiros e maior sensibilidade a resultados ruins."
  },
  {
    "id": "pe-dificil-40",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo recebe dividendos financiados por nova dívida da investida. Qual afirmação é correta?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Isso comprova melhora operacional."
      },
      {
        "letra": "B",
        "texto": "MOIC e TIR sobem no mesmo percentual."
      },
      {
        "letra": "C",
        "texto": "Antecipar caixa pode favorecer a TIR, mas é preciso considerar a dívida e os fluxos futuros."
      },
      {
        "letra": "D",
        "texto": "A operação cria valor a qualquer custo."
      }
    ],
    "resposta": "C",
    "feedback": "Receber antes pode ajudar a TIR, mas a dívida traz juros e pode reduzir o valor na saída. Precisamos olhar todos os fluxos, não apenas o dividendo."
  },
  {
    "id": "pe-dificil-41",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma aquisição exige R$ 600 milhões aos vendedores, R$ 200 milhões para refinanciar dívida e R$ 20 milhões de taxas. Há R$ 450 milhões de nova dívida. Quanto equity é necessário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 150 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 370 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 350 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 820 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "Some os usos: 600 + 200 + 20 = 820. Depois, desconte a fonte de dívida: 820 − 450 = R$ 370 milhões de equity."
  },
  {
    "id": "pe-dificil-42",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "O caixa para amortizar principal é definido como EBITDA de R$ 100 milhões menos impostos de R$ 15 milhões, capex de R$ 20 milhões, aumento de capital de giro de R$ 10 milhões e juros de R$ 25 milhões. Quanto sobra?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 55 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 45 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 70 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 30 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "Vamos acompanhar o caixa: 100 − 15 − 20 − 10 − 25 = R$ 30 milhões. É esse saldo, nas premissas dadas, que pode amortizar o principal."
  },
  {
    "id": "pe-dificil-43",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma dívida flutuante de R$ 400 milhões sofre aumento de 3 pontos percentuais na taxa anual. Sem hedge e com saldo constante, qual é o efeito direto antes de impostos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Mais R$ 12 milhões de juros anuais."
      },
      {
        "letra": "B",
        "texto": "Mais R$ 3 milhões de juros anuais."
      },
      {
        "letra": "C",
        "texto": "Menos R$ 12 milhões de EBITDA."
      },
      {
        "letra": "D",
        "texto": "Menos R$ 12 milhões de principal."
      }
    ],
    "resposta": "A",
    "feedback": "O acréscimo é 400 × 3% = R$ 12 milhões por ano. Isso reduz o caixa, mas não o EBITDA, que é calculado antes dos juros."
  },
  {
    "id": "pe-dificil-44",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Uma tese depende de comprar negócios a 6 vezes EBITDA e vender o grupo a 10 vezes. O que mais fortalece essa tese?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma promessa do vendedor."
      },
      {
        "letra": "B",
        "texto": "Usar o múltiplo maior em todos os cenários."
      },
      {
        "letra": "C",
        "texto": "Evidências de melhorias de escala, gestão, crescimento e qualidade do negócio."
      },
      {
        "letra": "D",
        "texto": "Ter mais empresas, mesmo sem integração."
      }
    ],
    "resposta": "C",
    "feedback": "Um múltiplo maior precisa de sustentação. Se a integração construir um negócio melhor e mais atrativo, há uma justificativa econômica mais forte para a valorização."
  },
  {
    "id": "pe-dificil-45",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "O vendedor quer excluir do EBITDA despesas “não recorrentes” que apareceram em quatro dos últimos cinco anos. Como agir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aceitar a classificação do vendedor."
      },
      {
        "letra": "B",
        "texto": "Investigar e rejeitar o ajuste se os gastos forem recorrentes ou necessários."
      },
      {
        "letra": "C",
        "texto": "Dobrar o ajuste."
      },
      {
        "letra": "D",
        "texto": "Excluir todas as despesas semelhantes."
      }
    ],
    "resposta": "B",
    "feedback": "O nome do ajuste não basta. Se o gasto volta frequentemente ou é necessário para operar, removê-lo pode fazer o negócio parecer mais rentável do que realmente é."
  },
  {
    "id": "pe-dificil-46",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "A empresa reconhece receita antes de cumprir as condições contratuais de entrega. Qual é a principal preocupação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Isso melhora necessariamente a qualidade do resultado."
      },
      {
        "letra": "B",
        "texto": "Só o balanço é afetado."
      },
      {
        "letra": "C",
        "texto": "Isso justifica mais dívida."
      },
      {
        "letra": "D",
        "texto": "O EBITDA pode estar superestimado, exigindo revisão dos números e do valuation."
      }
    ],
    "resposta": "D",
    "feedback": "Antecipar receita indevidamente pode inflar o resultado. Antes de investir, precisamos corrigir os números e verificar se o preço e a dívida continuam fazendo sentido."
  },
  {
    "id": "pe-dificil-47",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "Um fundo investe R$ 100 milhões, recebe R$ 20 milhões em distribuições e vende a participação por R$ 180 milhões. Qual é o MOIC bruto?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "2,0 vezes."
      },
      {
        "letra": "B",
        "texto": "1,8 vez."
      },
      {
        "letra": "C",
        "texto": "2,2 vezes."
      },
      {
        "letra": "D",
        "texto": "1,6 vez."
      }
    ],
    "resposta": "A",
    "feedback": "Lembre de incluir as distribuições: total recebido = 20 + 180 = 200. Então, MOIC = 200 ÷ 100 = 2 vezes."
  },
  {
    "id": "pe-dificil-48",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "A empresa pode investir R$ 50 milhões em projeto de VPL positivo ou amortizar dívida. Como decidir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Amortizar sempre."
      },
      {
        "letra": "B",
        "texto": "Investir sempre, ignorando a dívida."
      },
      {
        "letra": "C",
        "texto": "Comparar criação de valor, redução de risco, liquidez e restrições financeiras."
      },
      {
        "letra": "D",
        "texto": "Escolher apenas pelo EBITDA do próximo trimestre."
      }
    ],
    "resposta": "C",
    "feedback": "Um projeto pode criar valor e ainda exigir caixa que a empresa não pode comprometer naquele momento. A decisão precisa equilibrar oportunidade, segurança financeira e obrigações."
  },
  {
    "id": "pe-dificil-49",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "A tese só atinge o retorno mínimo se o múltiplo de saída subir de 8 para 12 vezes. Qual é sua principal fragilidade?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Dependência de redução de custos já contratada."
      },
      {
        "letra": "B",
        "texto": "Dependência elevada de reprecificação futura."
      },
      {
        "letra": "C",
        "texto": "Irrelevância do preço de entrada."
      },
      {
        "letra": "D",
        "texto": "Proteção automática contra juros."
      }
    ],
    "resposta": "B",
    "feedback": "O retorno depende muito de quanto alguém aceitará pagar no futuro. Como isso envolve mercado e percepção dos compradores, é importante testar a tese sem expansão de múltiplo."
  },
  {
    "id": "pe-dificil-50",
    "areaId": "private-equity",
    "nivel": "dificil",
    "tema": null,
    "enunciado": "O cenário-base é atrativo, mas uma queda moderada do EBITDA provoca falta de caixa e violação de covenants. O que fazer?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aprovar pelo retorno do cenário-base."
      },
      {
        "letra": "B",
        "texto": "Retirar o downside da análise."
      },
      {
        "letra": "C",
        "texto": "Aumentar a dívida."
      },
      {
        "letra": "D",
        "texto": "Reavaliar preço, alavancagem e estrutura, podendo rejeitar o investimento."
      }
    ],
    "resposta": "D",
    "feedback": "Uma boa tese também precisa resistir a dificuldades plausíveis. Ajustar preço e dívida pode melhorar sua segurança; se não for suficiente, deixar de investir também é uma decisão bem fundamentada."
  },
  {
    "id": "ib-facil-01",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Uma empresa familiar pretende vender o controle. Qual é a principal função do banco de investimento contratado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir a venda pelo preço pedido."
      },
      {
        "letra": "B",
        "texto": "Estruturar o processo, avaliar a empresa e apoiar a negociação."
      },
      {
        "letra": "C",
        "texto": "Substituir os administradores da empresa."
      },
      {
        "letra": "D",
        "texto": "Aprovar a operação em nome dos reguladores."
      }
    ],
    "resposta": "B",
    "feedback": "O banco acompanha o cliente desde a avaliação até a negociação com compradores. Ele ajuda a organizar e executar a venda, mas não consegue garantir seu resultado."
  },
  {
    "id": "ib-facil-02",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Por que uma empresa pode adquirir um concorrente em vez de crescer organicamente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Para eliminar todos os riscos do negócio."
      },
      {
        "letra": "B",
        "texto": "Para garantir aumento do lucro por ação."
      },
      {
        "letra": "C",
        "texto": "Para evitar qualquer integração operacional."
      },
      {
        "letra": "D",
        "texto": "Para acessar clientes e mercados mais rapidamente."
      }
    ],
    "resposta": "D",
    "feedback": "Pense no tempo necessário para construir uma operação do zero. Uma aquisição pode trazer clientes, equipe e presença comercial que já existem, acelerando a expansão."
  },
  {
    "id": "ib-facil-03",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Sem outros ajustes, qual relação entre Enterprise Value e Equity Value está correta?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "EV = Equity Value + dívida − caixa."
      },
      {
        "letra": "B",
        "texto": "EV = Equity Value − dívida + caixa."
      },
      {
        "letra": "C",
        "texto": "EV = Equity Value + dívida + caixa."
      },
      {
        "letra": "D",
        "texto": "EV = Equity Value − dívida − caixa."
      }
    ],
    "resposta": "A",
    "feedback": "Uma forma de lembrar: o valor das operações considera credores e acionistas. Por isso, somamos a dívida ao valor dos acionistas e descontamos o caixa."
  },
  {
    "id": "ib-facil-04",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Qual método avalia uma empresa trazendo seus fluxos de caixa futuros a valor presente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Trading comparables."
      },
      {
        "letra": "B",
        "texto": "Precedent transactions."
      },
      {
        "letra": "C",
        "texto": "Fluxo de caixa descontado — DCF."
      },
      {
        "letra": "D",
        "texto": "Patrimônio líquido contábil."
      }
    ],
    "resposta": "C",
    "feedback": "O DCF parte de uma ideia intuitiva: o negócio vale pelo caixa que poderá gerar, considerando o tempo e o risco desses recebimentos."
  },
  {
    "id": "ib-facil-05",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Qual é a principal finalidade de um NDA?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Definir o preço definitivo da aquisição."
      },
      {
        "letra": "B",
        "texto": "Estabelecer obrigações de confidencialidade."
      },
      {
        "letra": "C",
        "texto": "Obrigar o interessado a comprar a empresa."
      },
      {
        "letra": "D",
        "texto": "Transferir o controle ao comprador."
      }
    ],
    "resposta": "B",
    "feedback": "O NDA permite compartilhar informações com proteção de confidencialidade. Ele não significa que o interessado já decidiu comprar nem que o preço foi acertado."
  },
  {
    "id": "ib-facil-06",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "M&A",
    "enunciado": "Qual alternativa representa uma sinergia de custos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Vender produtos da compradora aos clientes da adquirida."
      },
      {
        "letra": "B",
        "texto": "Entrar em uma nova região."
      },
      {
        "letra": "C",
        "texto": "Aumentar vendas com serviços complementares."
      },
      {
        "letra": "D",
        "texto": "Unificar áreas administrativas e eliminar despesas duplicadas."
      }
    ],
    "resposta": "D",
    "feedback": "Aqui, procure uma economia de despesas. Unificar estruturas pode reduzir custos; vender mais produtos ou entrar em regiões são exemplos ligados à receita."
  },
  {
    "id": "ib-medio-07",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "Uma empresa tem EV de R$ 500 milhões, dívida de R$ 180 milhões e caixa de R$ 40 milhões. Sem outros ajustes, qual é seu Equity Value?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 280 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 360 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 640 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 720 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "Vamos por partes: Equity Value = EV − dívida + caixa. Então, 500 − 180 + 40 = R$ 360 milhões. Essa ponte aparece bastante em valuation!"
  },
  {
    "id": "ib-medio-08",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "Em um DCF com fluxo de caixa livre para a firma — FCFF —, qual combinação é adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Custo da dívida para obter Equity Value."
      },
      {
        "letra": "B",
        "texto": "Custo do capital próprio para obter EV."
      },
      {
        "letra": "C",
        "texto": "WACC para obter o valor das operações."
      },
      {
        "letra": "D",
        "texto": "Taxa de crescimento para obter Equity Value."
      }
    ],
    "resposta": "C",
    "feedback": "O FCFF está disponível para credores e acionistas. A taxa deve refletir os dois grupos: o WACC combina seus custos de capital."
  },
  {
    "id": "ib-medio-09",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "Por que EV/EBITDA é um múltiplo consistente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Numerador e denominador se referem ao negócio antes da separação entre credores e acionistas."
      },
      {
        "letra": "B",
        "texto": "Ambos pertencem exclusivamente aos acionistas."
      },
      {
        "letra": "C",
        "texto": "O EBITDA já desconta os juros."
      },
      {
        "letra": "D",
        "texto": "O EV exclui o financiamento por dívida."
      }
    ],
    "resposta": "A",
    "feedback": "O segredo é combinar medidas compatíveis. O EV considera credores e acionistas; o EBITDA vem antes dos juros, sem separar o resultado entre eles."
  },
  {
    "id": "ib-medio-10",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "Por que múltiplos de transações precedentes podem superar os de empresas em bolsa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Empresas adquiridas sempre crescem mais."
      },
      {
        "letra": "B",
        "texto": "Empresas em bolsa estão sempre subavaliadas."
      },
      {
        "letra": "C",
        "texto": "Aquisições desconsideram a dívida da empresa."
      },
      {
        "letra": "D",
        "texto": "O preço pode incorporar prêmio de controle e sinergias."
      }
    ],
    "resposta": "D",
    "feedback": "Um comprador pode pagar por benefícios que uma pequena participação em bolsa não oferece, como controle e sinergias. Isso pode elevar o preço, mas não acontece em toda transação."
  },
  {
    "id": "ib-medio-11",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "A due diligence identifica risco de perda de um cliente responsável por 40% da receita. O que fazer?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Reduzir o valuation exatamente em 40%."
      },
      {
        "letra": "B",
        "texto": "Ignorar enquanto o contrato estiver vigente."
      },
      {
        "letra": "C",
        "texto": "Estimar o impacto no caixa e avaliar ajustes de preço ou proteções."
      },
      {
        "letra": "D",
        "texto": "Manter as projeções e adicionar mais comparáveis."
      }
    ],
    "resposta": "C",
    "feedback": "Antes de ajustar o preço, precisamos entender o impacto real: margens, custos que podem ser reduzidos e chance de substituir o cliente. Receita e valor não caem necessariamente na mesma proporção."
  },
  {
    "id": "ib-medio-12",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "M&A",
    "enunciado": "O que caracteriza uma oferta indicativa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma proposta preliminar, geralmente sujeita a diligência e negociação."
      },
      {
        "letra": "B",
        "texto": "Um contrato que transfere imediatamente as ações."
      },
      {
        "letra": "C",
        "texto": "Uma garantia de pagamento do preço apresentado."
      },
      {
        "letra": "D",
        "texto": "Uma autorização regulatória para concluir a compra."
      }
    ],
    "resposta": "A",
    "feedback": "A oferta indicativa é um primeiro posicionamento do comprador. Ainda há informações para confirmar e condições para negociar antes de concluir a operação."
  },
  {
    "id": "ib-dificil-13",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "Uma compradora negociada a 20 vezes lucro adquire outra por 10 vezes lucro, pagando com novas ações. Sem sinergias, custos ou ajustes, o lucro por ação da compradora tende a:",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Cair, pois toda emissão reduz o lucro por ação."
      },
      {
        "letra": "B",
        "texto": "Ficar igual, pois o pagamento é em ações."
      },
      {
        "letra": "C",
        "texto": "Ser indeterminável nas premissas dadas."
      },
      {
        "letra": "D",
        "texto": "Aumentar, pois o lucro adquirido compensa proporcionalmente mais que as ações emitidas."
      }
    ],
    "resposta": "D",
    "feedback": "A compradora usa ações avaliadas a um múltiplo maior para adquirir lucros a um múltiplo menor. Nessas condições, o lucro cresce proporcionalmente mais que a quantidade de ações."
  },
  {
    "id": "ib-dificil-14",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "Uma aquisição gera R$ 20 milhões anuais de sinergias antes de impostos, em perpetuidade, começando em um ano. Imposto: 30%; desconto: 10%; integração imediata: R$ 30 milhões. Qual é o VPL das sinergias?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 110 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 140 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 170 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 200 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "Primeiro, a sinergia líquida é 20 × 70% = 14. Depois, aplicamos a perpetuidade e descontamos a integração: 14 ÷ 10% − 30 = R$ 110 milhões."
  },
  {
    "id": "ib-dificil-15",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "Uma empresa vale R$ 700 milhões standalone, mas o vendedor pede R$ 850 milhões. O que poderia justificar o preço para um comprador?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aumento da receita consolidada, mesmo com destruição de valor."
      },
      {
        "letra": "B",
        "texto": "A reputação do assessor do vendedor."
      },
      {
        "letra": "C",
        "texto": "Sinergias líquidas de custos e riscos superiores a R$ 150 milhões."
      },
      {
        "letra": "D",
        "texto": "O preço ser maior que o patrimônio contábil."
      }
    ],
    "resposta": "C",
    "feedback": "O adicional pedido é 850 − 700 = R$ 150 milhões. O comprador precisa de benefícios econômicos que compensem esse adicional. Sinergias líquidas superiores a ele podem justificar a compra."
  },
  {
    "id": "ib-dificil-16",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "Qual é a principal lógica de um earn-out?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Financiar toda a compra com dívida."
      },
      {
        "letra": "B",
        "texto": "Condicionar parte do preço ao desempenho futuro."
      },
      {
        "letra": "C",
        "texto": "Eliminar a necessidade de indicadores."
      },
      {
        "letra": "D",
        "texto": "Garantir o pagamento do preço máximo."
      }
    ],
    "resposta": "B",
    "feedback": "Quando comprador e vendedor discordam sobre o futuro, parte do pagamento pode depender de metas. Se o desempenho se confirmar, o vendedor recebe mais."
  },
  {
    "id": "ib-dificil-17",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "Uma empresa compra 100% de outra por R$ 500 milhões. Os ativos líquidos identificáveis a valor justo somam R$ 350 milhões. Sem outros ajustes, qual é o goodwill?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 850 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 500 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 350 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 150 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "Nas premissas dadas, goodwill = preço pago − ativos líquidos identificáveis = 500 − 350 = R$ 150 milhões. É o valor pago além desses ativos líquidos."
  },
  {
    "id": "ib-dificil-18",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "M&A",
    "enunciado": "O vendedor recebe duas ofertas: R$ 600 milhões no fechamento ou R$ 480 milhões agora mais até R$ 200 milhões condicionados a metas futuras. Como compará-las?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Avaliar valor presente, probabilidade das metas e segurança de recebimento."
      },
      {
        "letra": "B",
        "texto": "Escolher a segunda porque o máximo é maior."
      },
      {
        "letra": "C",
        "texto": "Escolher a primeira porque pagamentos condicionais não têm valor."
      },
      {
        "letra": "D",
        "texto": "Comparar somente o pagamento inicial."
      }
    ],
    "resposta": "A",
    "feedback": "Dinheiro futuro e condicionado não equivale a dinheiro certo hoje. Precisamos considerar quando o pagamento ocorrerá, sua probabilidade e a segurança contratual."
  },
  {
    "id": "ib-facil-19",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Qual operação está diretamente associada a DCM?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Venda do controle de uma empresa."
      },
      {
        "letra": "B",
        "texto": "Oferta inicial de ações."
      },
      {
        "letra": "C",
        "texto": "Emissão de títulos de dívida."
      },
      {
        "letra": "D",
        "texto": "Aquisição por um fundo de PE."
      }
    ],
    "resposta": "C",
    "feedback": "DCM significa Debt Capital Markets: mercado de capitais de dívida. A área ajuda empresas a captar por títulos, definindo condições como prazo, volume e remuneração."
  },
  {
    "id": "ib-facil-20",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Qual é uma diferença fundamental entre dívida e ações ordinárias?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Dívida sempre custa menos."
      },
      {
        "letra": "B",
        "texto": "Dívida estabelece pagamentos contratuais; ações representam participação societária."
      },
      {
        "letra": "C",
        "texto": "Ações exigem amortização no vencimento."
      },
      {
        "letra": "D",
        "texto": "Dívida necessariamente dá direito a voto."
      }
    ],
    "resposta": "B",
    "feedback": "O credor tem direitos de pagamento definidos no contrato. Já o acionista participa do negócio e de seus resultados, sem uma promessa equivalente de devolução do capital."
  },
  {
    "id": "ib-facil-21",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Quem compra uma debênture não conversível se torna, em regra:",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Acionista controlador."
      },
      {
        "letra": "B",
        "texto": "Proprietário dos ativos operacionais."
      },
      {
        "letra": "C",
        "texto": "Sócio com dividendos obrigatórios."
      },
      {
        "letra": "D",
        "texto": "Credor da empresa."
      }
    ],
    "resposta": "D",
    "feedback": "A debênture é um título de dívida: o investidor empresta recursos e recebe os direitos previstos na emissão. Como ela não é conversível, não há conversão em ações."
  },
  {
    "id": "ib-facil-22",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Qual remuneração está vinculada à inflação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "IPCA + 6% ao ano."
      },
      {
        "letra": "B",
        "texto": "13% ao ano, prefixados."
      },
      {
        "letra": "C",
        "texto": "CDI + 2% ao ano."
      },
      {
        "letra": "D",
        "texto": "110% do CDI."
      }
    ],
    "resposta": "A",
    "feedback": "O IPCA é um índice de inflação. Uma dívida atrelada a ele combina atualização inflacionária com a taxa adicional contratada. O CDI é uma referência de juros."
  },
  {
    "id": "ib-facil-23",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Mantidas as demais condições, uma piora no crédito da emissora tende a provocar:",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Redução do spread."
      },
      {
        "letra": "B",
        "texto": "Aumento do spread."
      },
      {
        "letra": "C",
        "texto": "Eliminação de garantias."
      },
      {
        "letra": "D",
        "texto": "Conversão automática em ações."
      }
    ],
    "resposta": "B",
    "feedback": "Se o risco de não receber aumenta, o investidor tende a pedir remuneração maior. Essa compensação adicional aparece no spread de crédito."
  },
  {
    "id": "ib-facil-24",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "DCM",
    "enunciado": "Qual é um exemplo de covenant financeiro?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Alterar a identidade visual da empresa."
      },
      {
        "letra": "B",
        "texto": "Fazer reuniões comerciais mensais."
      },
      {
        "letra": "C",
        "texto": "Respeitar um limite de dívida líquida/EBITDA."
      },
      {
        "letra": "D",
        "texto": "Garantir valorização do título."
      }
    ],
    "resposta": "C",
    "feedback": "Covenants são condições contratuais que ajudam a proteger os credores. Um teto para dívida líquida/EBITDA limita a alavancagem em relação ao resultado operacional."
  },
  {
    "id": "ib-medio-25",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "DCM",
    "enunciado": "Se as taxas exigidas pelo mercado sobem, o preço de um título prefixado já emitido tende a:",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Cair."
      },
      {
        "letra": "B",
        "texto": "Subir na mesma proporção."
      },
      {
        "letra": "C",
        "texto": "Permanecer constante."
      },
      {
        "letra": "D",
        "texto": "Subir se houver cupons."
      }
    ],
    "resposta": "A",
    "feedback": "Os pagamentos do título continuam iguais, mas passam a ser descontados a uma taxa maior. Seu valor presente cai. Guarde essa relação: taxa sobe, preço cai, mantidas as demais condições."
  },
  {
    "id": "ib-medio-26",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "DCM",
    "enunciado": "Uma dívida de R$ 100 milhões paga CDI + 2% ao ano. Com CDI de 12%, soma simples das taxas e principal constante, qual é a despesa anual de juros?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 2 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 12 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 12,24 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 14 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "Pela simplificação do exercício, a taxa é 12% + 2% = 14%. Então, 100 × 14% = R$ 14 milhões de juros anuais."
  },
  {
    "id": "ib-medio-27",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "DCM",
    "enunciado": "Dívida bruta de R$ 600 milhões, caixa de R$ 100 milhões e EBITDA de R$ 125 milhões. Qual é a dívida líquida/EBITDA?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "4,8 vezes."
      },
      {
        "letra": "B",
        "texto": "5,6 vezes."
      },
      {
        "letra": "C",
        "texto": "4,0 vezes."
      },
      {
        "letra": "D",
        "texto": "0,25 vez."
      }
    ],
    "resposta": "C",
    "feedback": "Primeiro, calcule a dívida líquida: 600 − 100 = 500. Depois, divida pelo EBITDA: 500 ÷ 125 = 4,0 vezes."
  },
  {
    "id": "ib-medio-28",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "DCM",
    "enunciado": "O que distingue uma dívida bullet?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Não ter vencimento."
      },
      {
        "letra": "B",
        "texto": "Concentrar o pagamento do principal no vencimento."
      },
      {
        "letra": "C",
        "texto": "Não pagar juros."
      },
      {
        "letra": "D",
        "texto": "Ser obrigatoriamente conversível em ações."
      }
    ],
    "resposta": "B",
    "feedback": "Na dívida bullet, o principal fica para o vencimento. Os juros podem ser pagos antes. Isso concentra a necessidade de caixa ou refinanciamento no final do prazo."
  },
  {
    "id": "ib-medio-29",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "DCM",
    "enunciado": "Duas dívidas comparáveis são do mesmo emissor. Uma é sênior com garantia; a outra, subordinada sem garantia. Qual tende a exigir mais remuneração?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A subordinada sem garantia."
      },
      {
        "letra": "B",
        "texto": "A sênior com garantia."
      },
      {
        "letra": "C",
        "texto": "Ambas necessariamente pagam o mesmo."
      },
      {
        "letra": "D",
        "texto": "A sênior, porque a garantia impede sua negociação."
      }
    ],
    "resposta": "A",
    "feedback": "Menor prioridade de recebimento e ausência de garantia significam menor proteção em caso de problemas. O investidor tende a cobrar mais por assumir esse risco."
  },
  {
    "id": "ib-dificil-30",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "DCM",
    "enunciado": "Dois títulos têm o mesmo emissor, vencimento, yield e frequência de pagamentos, mas cupons diferentes. Qual tende a ser mais sensível a uma pequena mudança no yield?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O de cupons maiores, por pagar mais cedo."
      },
      {
        "letra": "B",
        "texto": "Ambos, pois apenas o vencimento importa."
      },
      {
        "letra": "C",
        "texto": "O de cupons maiores, por ter necessariamente mais risco de crédito."
      },
      {
        "letra": "D",
        "texto": "O de cupons menores, por concentrar mais valor em pagamentos distantes."
      }
    ],
    "resposta": "D",
    "feedback": "Cupons menores deixam mais do valor ligado a pagamentos distantes. Isso aumenta a duration e a sensibilidade percentual do preço à taxa, nas condições dadas."
  },
  {
    "id": "ib-dificil-31",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "DCM",
    "enunciado": "Uma empresa tem dívida líquida de R$ 450 milhões e limite de dívida líquida/EBITDA de 3,5 vezes. Qual é o EBITDA mínimo aproximado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 150 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 128,6 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 157,5 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 112,5 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "No limite, 450 ÷ EBITDA = 3,5. Logo, EBITDA = 450 ÷ 3,5 ≈ R$ 128,6 milhões. Abaixo disso, a relação ultrapassa o teto."
  },
  {
    "id": "ib-dificil-32",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "DCM",
    "enunciado": "Uma empresa com receitas em reais considera dívida em dólares com juros menores. O que deve analisar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Apenas as taxas nominais."
      },
      {
        "letra": "B",
        "texto": "Apenas se a taxa americana é menor."
      },
      {
        "letra": "C",
        "texto": "Custo total, hedge e descasamento cambial."
      },
      {
        "letra": "D",
        "texto": "Apenas o efeito contábil do câmbio."
      }
    ],
    "resposta": "C",
    "feedback": "A parcela em dólares pode ficar mais cara em reais se o real se desvalorizar. Por isso, precisamos comparar o custo com proteção cambial e a capacidade de suportar essa exposição."
  },
  {
    "id": "ib-dificil-33",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "DCM",
    "enunciado": "Uma empresa lucrativa tem muita dívida vencendo em breve. Por que pode enfrentar dificuldades?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Pode não gerar caixa a tempo nem conseguir refinanciar."
      },
      {
        "letra": "B",
        "texto": "Empresas lucrativas não podem refinanciar."
      },
      {
        "letra": "C",
        "texto": "Amortizações reduzem o EBITDA."
      },
      {
        "letra": "D",
        "texto": "Lucro elimina risco de crédito."
      }
    ],
    "resposta": "A",
    "feedback": "Lucro e caixa não são a mesma coisa. Mesmo lucrativa, a empresa precisa de dinheiro disponível nas datas de pagamento ou de acesso a refinanciamento."
  },
  {
    "id": "ib-dificil-34",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "DCM",
    "enunciado": "Como comparar dívida prefixada a 14% ao ano com CDI + 2%, ambas por cinco anos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Escolher sempre a prefixada."
      },
      {
        "letra": "B",
        "texto": "Escolher a pós-fixada porque o CDI sempre cai."
      },
      {
        "letra": "C",
        "texto": "Usar apenas a taxa de hoje."
      },
      {
        "letra": "D",
        "texto": "Simular juros e avaliar custo, previsibilidade e exposição do negócio."
      }
    ],
    "resposta": "D",
    "feedback": "A melhor escolha depende do que pode acontecer com os juros e de como a empresa gera caixa. Previsibilidade e resistência a cenários adversos também têm valor."
  },
  {
    "id": "ib-facil-35",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "Qual operação está diretamente associada a ECM?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Emissão de debêntures."
      },
      {
        "letra": "B",
        "texto": "Renegociação de empréstimos."
      },
      {
        "letra": "C",
        "texto": "Venda de subsidiária a um concorrente."
      },
      {
        "letra": "D",
        "texto": "Oferta de ações."
      }
    ],
    "resposta": "D",
    "feedback": "ECM significa Equity Capital Markets: mercado de capitais acionário. A área assessora ofertas de ações, como IPOs e follow-ons."
  },
  {
    "id": "ib-facil-36",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "Qual é a diferença entre IPO e follow-on?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "IPO é sempre secundário; follow-on, primário."
      },
      {
        "letra": "B",
        "texto": "IPO é a oferta pública inicial; follow-on é uma oferta subsequente."
      },
      {
        "letra": "C",
        "texto": "IPO é dívida; follow-on é ação."
      },
      {
        "letra": "D",
        "texto": "IPO só ocorre no exterior."
      }
    ],
    "resposta": "B",
    "feedback": "A diferença está no momento: o IPO é a estreia em ofertas públicas de ações; o follow-on vem depois. Ambos podem combinar ações novas e existentes."
  },
  {
    "id": "ib-facil-37",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "Quando os recursos entram no caixa da companhia?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Na venda secundária de ações do fundador."
      },
      {
        "letra": "B",
        "texto": "Na negociação entre investidores em bolsa."
      },
      {
        "letra": "C",
        "texto": "Na emissão primária de novas ações."
      },
      {
        "letra": "D",
        "texto": "Na venda de participação entre fundos."
      }
    ],
    "resposta": "C",
    "feedback": "Na emissão primária, a empresa cria ações e recebe o dinheiro. Na secundária, quem recebe é o acionista que está vendendo suas ações."
  },
  {
    "id": "ib-facil-38",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "O que significa diluição após uma emissão?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A participação percentual pode cair, sem necessariamente haver perda econômica."
      },
      {
        "letra": "B",
        "texto": "As ações antigas são canceladas."
      },
      {
        "letra": "C",
        "texto": "A participação percentual aumenta."
      },
      {
        "letra": "D",
        "texto": "A acionista assume pessoalmente as dívidas."
      }
    ],
    "resposta": "A",
    "feedback": "Se surgem novas ações e você mantém sua quantidade, sua fatia percentual diminui. Mas o dinheiro captado pode aumentar o valor do negócio: diluição percentual não prova perda de valor."
  },
  {
    "id": "ib-facil-39",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "Para que serve o bookbuilding?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir valorização após a oferta."
      },
      {
        "letra": "B",
        "texto": "Registrar despesas da emissão."
      },
      {
        "letra": "C",
        "texto": "Definir o patrimônio contábil."
      },
      {
        "letra": "D",
        "texto": "Coletar demanda para apoiar preço e alocação."
      }
    ],
    "resposta": "D",
    "feedback": "O bookbuilding ajuda a entender quanto os investidores querem comprar e a quais preços. Essas informações orientam a oferta, sem garantir seu desempenho posterior."
  },
  {
    "id": "ib-facil-40",
    "areaId": "investment-banking",
    "nivel": "facil",
    "tema": "ECM",
    "enunciado": "O que é free float?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Caixa disponível para dividendos."
      },
      {
        "letra": "B",
        "texto": "Parcela das ações considerada em circulação."
      },
      {
        "letra": "C",
        "texto": "Limite de futuras emissões."
      },
      {
        "letra": "D",
        "texto": "Participação de investidores estrangeiros."
      }
    ],
    "resposta": "B",
    "feedback": "O free float indica a parcela das ações em circulação, segundo as regras aplicáveis. Ele ajuda a entender a disponibilidade de ações para negociação."
  },
  {
    "id": "ib-medio-41",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "ECM",
    "enunciado": "Uma acionista tem 10 milhões das 100 milhões de ações existentes. A empresa emite mais 25 milhões, e ela não participa. Qual é sua nova participação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "12,5%."
      },
      {
        "letra": "B",
        "texto": "10%."
      },
      {
        "letra": "C",
        "texto": "8%."
      },
      {
        "letra": "D",
        "texto": "7,5%."
      }
    ],
    "resposta": "C",
    "feedback": "A quantidade dela continua em 10 milhões, mas o total passa a 125 milhões. Assim, 10 ÷ 125 = 8%."
  },
  {
    "id": "ib-medio-42",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "ECM",
    "enunciado": "Quantas ações uma empresa precisa emitir a R$ 15 para captar R$ 300 milhões, sem custos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "20 milhões."
      },
      {
        "letra": "B",
        "texto": "15 milhões."
      },
      {
        "letra": "C",
        "texto": "25 milhões."
      },
      {
        "letra": "D",
        "texto": "30 milhões."
      }
    ],
    "resposta": "A",
    "feedback": "Basta dividir o valor desejado pelo preço de cada ação: 300 milhões ÷ 15 = 20 milhões de ações."
  },
  {
    "id": "ib-medio-43",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "ECM",
    "enunciado": "O que caracteriza um bom equity story?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Mostrar apenas oportunidades."
      },
      {
        "letra": "B",
        "texto": "Prometer retorno mínimo."
      },
      {
        "letra": "C",
        "texto": "Apresentar somente o passado."
      },
      {
        "letra": "D",
        "texto": "Conectar negócio, crescimento, diferenciais, resultados e riscos."
      }
    ],
    "resposta": "D",
    "feedback": "O equity story conta por que a empresa pode ser um bom investimento. Para ser convincente, precisa ligar estratégia e números, incluindo os riscos dessa trajetória."
  },
  {
    "id": "ib-medio-44",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "ECM",
    "enunciado": "Por que um follow-on pode ter desconto sobre a cotação em bolsa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A cotação deixa de importar."
      },
      {
        "letra": "B",
        "texto": "Para atrair demanda suficiente para o volume ofertado."
      },
      {
        "letra": "C",
        "texto": "Toda nova ação tem menos direitos."
      },
      {
        "letra": "D",
        "texto": "O desconto elimina a diluição."
      }
    ],
    "resposta": "B",
    "feedback": "Vender um volume grande de ações de uma vez exige compradores suficientes. O desconto pode incentivar essa demanda e compensar riscos da colocação."
  },
  {
    "id": "ib-medio-45",
    "areaId": "investment-banking",
    "nivel": "medio",
    "tema": "ECM",
    "enunciado": "Qual é a finalidade típica do lock-up?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir preço mínimo da ação."
      },
      {
        "letra": "B",
        "texto": "Impedir divulgação de resultados."
      },
      {
        "letra": "C",
        "texto": "Restringir temporariamente vendas por certos acionistas."
      },
      {
        "letra": "D",
        "texto": "Impedir compras no mercado secundário."
      }
    ],
    "resposta": "C",
    "feedback": "O lock-up limita temporariamente a venda por determinados acionistas. Isso reduz a possibilidade de essas ações chegarem ao mercado logo após a oferta."
  },
  {
    "id": "ib-dificil-46",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "ECM",
    "enunciado": "Uma empresa tem 100 milhões de ações a R$ 20 e emite 25 milhões a R$ 16. Sem custos ou mudança na percepção do negócio, qual é o preço teórico após a emissão?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 19,20."
      },
      {
        "letra": "B",
        "texto": "R$ 18,00."
      },
      {
        "letra": "C",
        "texto": "R$ 20,00."
      },
      {
        "letra": "D",
        "texto": "R$ 16,00."
      }
    ],
    "resposta": "A",
    "feedback": "Somamos o valor anterior ao dinheiro novo e dividimos pelo total de ações: (100 × 20 + 25 × 16) ÷ 125 = R$ 19,20."
  },
  {
    "id": "ib-dificil-47",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "ECM",
    "enunciado": "A demanda de uma oferta é cinco vezes seu volume. O que concluir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O preço deve subir até eliminar toda demanda excedente."
      },
      {
        "letra": "B",
        "texto": "A ação certamente vai subir."
      },
      {
        "letra": "C",
        "texto": "A qualidade dos investidores não importa."
      },
      {
        "letra": "D",
        "texto": "É preciso avaliar também sensibilidade ao preço e composição da demanda."
      }
    ],
    "resposta": "D",
    "feedback": "Muita demanda é positiva, mas algumas ordens podem desaparecer se o preço subir. Também importa quem compra e como a base de investidores será formada."
  },
  {
    "id": "ib-dificil-48",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "ECM",
    "enunciado": "A empresa quer recursos para expansão, e os fundadores querem vender parte de suas ações. Qual estrutura atende aos dois objetivos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Oferta somente secundária."
      },
      {
        "letra": "B",
        "texto": "Oferta mista: primária e secundária."
      },
      {
        "letra": "C",
        "texto": "Oferta somente primária."
      },
      {
        "letra": "D",
        "texto": "Oferta secundária seguida de cancelamento."
      }
    ],
    "resposta": "B",
    "feedback": "A parte primária financia a empresa; a secundária dá liquidez aos fundadores. Uma oferta mista combina esses dois destinos para os recursos."
  },
  {
    "id": "ib-dificil-49",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "ECM",
    "enunciado": "Uma emissão reduz inicialmente o lucro por ação, mas financia um projeto com retorno esperado superior ao custo de capital. Qual afirmação é adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A queda inicial prova destruição de valor."
      },
      {
        "letra": "B",
        "texto": "Qualquer aumento do lucro total cria valor."
      },
      {
        "letra": "C",
        "texto": "A emissão pode criar valor apesar da queda inicial do lucro por ação."
      },
      {
        "letra": "D",
        "texto": "Só há criação de valor se o número de ações não mudar."
      }
    ],
    "resposta": "C",
    "feedback": "As novas ações aparecem antes de todo o lucro do projeto. Por isso, o lucro por ação pode cair no início, mesmo com criação de valor ao longo do tempo."
  },
  {
    "id": "ib-dificil-50",
    "areaId": "investment-banking",
    "nivel": "dificil",
    "tema": "ECM",
    "enunciado": "A bolsa cai fortemente pouco antes de um IPO. Qual é a melhor orientação inicial?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Reavaliar demanda, valuation, necessidade de recursos e alternativas."
      },
      {
        "letra": "B",
        "texto": "Cancelar definitivamente em qualquer caso."
      },
      {
        "letra": "C",
        "texto": "Manter preço e volume sem revisão."
      },
      {
        "letra": "D",
        "texto": "Aumentar o volume automaticamente."
      }
    ],
    "resposta": "A",
    "feedback": "A mudança de mercado pede uma nova avaliação. A empresa pode seguir, ajustar ou adiar, conforme demanda, preço e necessidade de capital."
  },
  {
    "id": "er-facil-01",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Qual é a principal função de uma analista de equity research?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir que as ações recomendadas vão subir."
      },
      {
        "letra": "B",
        "texto": "Analisar empresas e publicar recomendações e preços-alvo para investidores."
      },
      {
        "letra": "C",
        "texto": "Administrar o caixa das empresas analisadas."
      },
      {
        "letra": "D",
        "texto": "Aprovar a emissão de ações na bolsa."
      }
    ],
    "resposta": "B",
    "feedback": "A analista estuda o negócio, projeta resultados e estima quanto a ação vale. Sua recomendação orienta investidores, mas nunca garante o resultado."
  },
  {
    "id": "er-facil-02",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "O que a Demonstração do Resultado (DRE) mostra?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O saldo de caixa em uma data."
      },
      {
        "letra": "B",
        "texto": "Os bens e as dívidas da empresa."
      },
      {
        "letra": "C",
        "texto": "A lista de acionistas."
      },
      {
        "letra": "D",
        "texto": "Como receitas, custos e despesas se transformam em lucro em um período."
      }
    ],
    "resposta": "D",
    "feedback": "A DRE conta a história de um período, como um trimestre ou um ano. O balanço, por outro lado, é uma foto em uma data."
  },
  {
    "id": "er-facil-03",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa teve receita de R$ 1.000 milhões e custo das mercadorias vendidas de R$ 600 milhões. Qual é a margem bruta?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "60%."
      },
      {
        "letra": "B",
        "texto": "1,67 vez."
      },
      {
        "letra": "C",
        "texto": "40%."
      },
      {
        "letra": "D",
        "texto": "400%."
      }
    ],
    "resposta": "C",
    "feedback": "O lucro bruto é 1.000 − 600 = 400. A margem bruta é 400 ÷ 1.000 = 40%."
  },
  {
    "id": "er-facil-04",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa lucrou R$ 500 milhões e tem 250 milhões de ações. Qual é o lucro por ação (LPA)?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 2,00."
      },
      {
        "letra": "B",
        "texto": "R$ 0,50."
      },
      {
        "letra": "C",
        "texto": "R$ 5,00."
      },
      {
        "letra": "D",
        "texto": "R$ 250,00."
      }
    ],
    "resposta": "A",
    "feedback": "Basta dividir o lucro pelo número de ações: 500 ÷ 250 = R$ 2,00."
  },
  {
    "id": "er-facil-05",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Por que lucro e caixa podem ser diferentes?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque o lucro é sempre maior que o caixa."
      },
      {
        "letra": "B",
        "texto": "Porque o lucro registra receitas e despesas quando ocorrem, e o caixa mostra quando o dinheiro entra e sai."
      },
      {
        "letra": "C",
        "texto": "Porque o caixa inclui apenas impostos."
      },
      {
        "letra": "D",
        "texto": "Porque o lucro não considera custos."
      }
    ],
    "resposta": "B",
    "feedback": "Uma venda a prazo entra no lucro na hora, mas o dinheiro só chega depois. Investimentos em lojas saem do caixa de uma vez e entram no resultado aos poucos, pela depreciação."
  },
  {
    "id": "er-facil-06",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "O que o EBITDA representa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O lucro líquido após todos os impostos."
      },
      {
        "letra": "B",
        "texto": "O caixa disponível para dividendos."
      },
      {
        "letra": "C",
        "texto": "A receita menos os impostos sobre vendas."
      },
      {
        "letra": "D",
        "texto": "O resultado operacional antes de juros, impostos, depreciação e amortização."
      }
    ],
    "resposta": "D",
    "feedback": "O EBITDA é uma medida aproximada da geração operacional. Ele não é caixa: ignora investimentos, capital de giro e impostos."
  },
  {
    "id": "er-medio-07",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Receita de R$ 2.000 milhões, EBITDA de R$ 400 milhões e depreciação de R$ 100 milhões. Qual é a margem EBIT?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "15%."
      },
      {
        "letra": "B",
        "texto": "20%."
      },
      {
        "letra": "C",
        "texto": "25%."
      },
      {
        "letra": "D",
        "texto": "5%."
      }
    ],
    "resposta": "A",
    "feedback": "O EBIT é 400 − 100 = 300. A margem EBIT é 300 ÷ 2.000 = 15%."
  },
  {
    "id": "er-medio-08",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa tem dívida bruta de R$ 800 milhões e caixa de R$ 1.000 milhões. Como interpretar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Ela tem dívida líquida de R$ 1.800 milhões."
      },
      {
        "letra": "B",
        "texto": "Ela está em dificuldade financeira."
      },
      {
        "letra": "C",
        "texto": "Ela tem caixa líquido de R$ 200 milhões."
      },
      {
        "letra": "D",
        "texto": "A dívida não precisa ser paga."
      }
    ],
    "resposta": "C",
    "feedback": "Caixa maior que dívida significa caixa líquido de 1.000 − 800 = R$ 200 milhões. Isso dá fôlego financeiro, mas a dívida continua tendo vencimentos."
  },
  {
    "id": "er-medio-09",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Por que analistas de varejo acompanham as vendas nas mesmas lojas?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque elas incluem o efeito das novas lojas."
      },
      {
        "letra": "B",
        "texto": "Para separar o desempenho das lojas existentes do efeito das aberturas."
      },
      {
        "letra": "C",
        "texto": "Porque substituem o lucro líquido."
      },
      {
        "letra": "D",
        "texto": "Porque são exigidas no cálculo do imposto."
      }
    ],
    "resposta": "B",
    "feedback": "Uma rede pode crescer só porque abriu lojas. As vendas nas mesmas lojas mostram se as lojas existentes estão vendendo mais ou menos."
  },
  {
    "id": "er-medio-10",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa lucrou R$ 300 milhões e tem patrimônio líquido de R$ 1.500 milhões. Qual é o ROE?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "5%."
      },
      {
        "letra": "B",
        "texto": "50%."
      },
      {
        "letra": "C",
        "texto": "15%."
      },
      {
        "letra": "D",
        "texto": "20%."
      }
    ],
    "resposta": "D",
    "feedback": "O ROE mede o retorno sobre o capital dos acionistas: 300 ÷ 1.500 = 20%."
  },
  {
    "id": "er-medio-11",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "O lucro de uma empresa subiu porque ela vendeu um imóvel. Como tratar esse ganho na análise?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Como não recorrente, separado do resultado operacional que tende a se repetir."
      },
      {
        "letra": "B",
        "texto": "Como crescimento permanente do lucro."
      },
      {
        "letra": "C",
        "texto": "Como receita de vendas."
      },
      {
        "letra": "D",
        "texto": "Como redução de custos."
      }
    ],
    "resposta": "A",
    "feedback": "Ganhos pontuais não se repetem todo ano. Para projetar e comparar empresas, a analista costuma olhar o lucro sem esses efeitos."
  },
  {
    "id": "er-medio-12",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "As contas a receber cresceram 30%, e as vendas, 5%. O que isso pode indicar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Que a empresa está gerando mais caixa."
      },
      {
        "letra": "B",
        "texto": "Que os estoques caíram."
      },
      {
        "letra": "C",
        "texto": "Que a empresa pode estar vendendo a prazos maiores ou com mais dificuldade de cobrança."
      },
      {
        "letra": "D",
        "texto": "Nada relevante para a análise."
      }
    ],
    "resposta": "C",
    "feedback": "Recebíveis crescendo muito mais que as vendas prendem caixa e podem sinalizar risco de crédito. Vale entender a causa."
  },
  {
    "id": "er-dificil-13",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Lucro operacional após impostos de R$ 500 milhões, depreciação de R$ 100 milhões, CAPEX de R$ 250 milhões e aumento do capital de giro de R$ 50 milhões. Qual é o fluxo de caixa livre da firma?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 400 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 300 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 600 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 200 milhões."
      }
    ],
    "resposta": "B",
    "feedback": "Somamos a depreciação, que não é saída de caixa, e subtraímos investimentos e capital de giro: 500 + 100 − 250 − 50 = R$ 300 milhões."
  },
  {
    "id": "er-dificil-14",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa tem ROIC de 15% e custo de capital de 18%. O que concluir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Ela cria valor, pois tem lucro."
      },
      {
        "letra": "B",
        "texto": "O ROIC não tem relação com criação de valor."
      },
      {
        "letra": "C",
        "texto": "Ela deveria investir mais para crescer."
      },
      {
        "letra": "D",
        "texto": "Mesmo lucrativa, ela tende a destruir valor nos investimentos, pois o retorno fica abaixo do custo do capital."
      }
    ],
    "resposta": "D",
    "feedback": "Lucro não basta: o retorno precisa superar o que os investidores exigem. Crescer com ROIC abaixo do custo de capital pode reduzir valor."
  },
  {
    "id": "er-dificil-15",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "O estoque médio é de R$ 300 milhões, e o custo das mercadorias vendidas no ano é de R$ 1.825 milhões. Quantos dias de estoque a empresa tem?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "60 dias."
      },
      {
        "letra": "B",
        "texto": "165 dias."
      },
      {
        "letra": "C",
        "texto": "6 dias."
      },
      {
        "letra": "D",
        "texto": "30 dias."
      }
    ],
    "resposta": "A",
    "feedback": "O custo diário é 1.825 ÷ 365 = 5. O estoque cobre 300 ÷ 5 = 60 dias de vendas a custo."
  },
  {
    "id": "er-dificil-16",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "A margem bruta de uma varejista bateu recorde, mas o lucro líquido caiu. Qual explicação é possível?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A margem bruta recorde garante lucro maior."
      },
      {
        "letra": "B",
        "texto": "O lucro líquido não depende da margem bruta."
      },
      {
        "letra": "C",
        "texto": "Despesas operacionais, perdas com crédito ou queda de vendas podem ter consumido o ganho de margem."
      },
      {
        "letra": "D",
        "texto": "A empresa deve ter errado a contabilidade."
      }
    ],
    "resposta": "C",
    "feedback": "A margem bruta é só a primeira linha. Despesas de vendas, perdas com crédito e uma receita menor podem reduzir o lucro final. Analise a DRE linha a linha."
  },
  {
    "id": "er-dificil-17",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Contabilidade e análise financeira",
    "enunciado": "Uma empresa lucra R$ 1.000 milhões e tem 500 milhões de ações. Ela recompra 50 milhões de ações e mantém o lucro. Qual é o novo LPA?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 2,00."
      },
      {
        "letra": "B",
        "texto": "Cerca de R$ 2,22."
      },
      {
        "letra": "C",
        "texto": "R$ 1,80."
      },
      {
        "letra": "D",
        "texto": "R$ 2,50."
      }
    ],
    "resposta": "B",
    "feedback": "O lucro fica igual, mas é dividido por menos ações: 1.000 ÷ 450 ≈ R$ 2,22. A recompra aumenta o LPA, mas consome caixa."
  },
  {
    "id": "er-facil-18",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "Uma ação custa R$ 30, e o LPA é R$ 3. Qual é o P/L?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "3 vezes."
      },
      {
        "letra": "B",
        "texto": "90 vezes."
      },
      {
        "letra": "C",
        "texto": "10 vezes."
      },
      {
        "letra": "D",
        "texto": "0,1 vez."
      }
    ],
    "resposta": "C",
    "feedback": "O P/L mostra quantos anos de lucro o preço representa: 30 ÷ 3 = 10 vezes."
  },
  {
    "id": "er-facil-19",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "Uma empresa tem 200 milhões de ações negociadas a R$ 15. Qual é o valor de mercado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 3 bilhões."
      },
      {
        "letra": "B",
        "texto": "R$ 215 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 13,3 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 30 bilhões."
      }
    ],
    "resposta": "A",
    "feedback": "200 milhões × R$ 15 = R$ 3 bilhões. É quanto o mercado paga hoje por todas as ações."
  },
  {
    "id": "er-facil-20",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "Qual é a ideia central do fluxo de caixa descontado (DCF)?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A ação vale o preço de ontem."
      },
      {
        "letra": "B",
        "texto": "A empresa vale seu patrimônio contábil."
      },
      {
        "letra": "C",
        "texto": "A empresa vale a média dos concorrentes."
      },
      {
        "letra": "D",
        "texto": "A empresa vale o caixa que poderá gerar no futuro, trazido a valor presente."
      }
    ],
    "resposta": "D",
    "feedback": "O DCF projeta fluxos de caixa e os desconta por uma taxa que reflete o risco e o custo de oportunidade."
  },
  {
    "id": "er-facil-21",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "Uma ação paga R$ 1,00 de dividendos por ano e custa R$ 20. Qual é o dividend yield?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "20%."
      },
      {
        "letra": "B",
        "texto": "5%."
      },
      {
        "letra": "C",
        "texto": "2%."
      },
      {
        "letra": "D",
        "texto": "0,05%."
      }
    ],
    "resposta": "B",
    "feedback": "1 ÷ 20 = 5% ao ano em dividendos, sem considerar a variação do preço."
  },
  {
    "id": "er-facil-22",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "Por que comparar múltiplos de empresas do mesmo setor?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque todas as empresas do setor valem o mesmo."
      },
      {
        "letra": "B",
        "texto": "Para eliminar a necessidade do DCF."
      },
      {
        "letra": "C",
        "texto": "Para ter uma referência de como o mercado avalia negócios semelhantes."
      },
      {
        "letra": "D",
        "texto": "Porque a regulação exige."
      }
    ],
    "resposta": "C",
    "feedback": "Empresas parecidas tendem a ter riscos e perspectivas parecidas. Diferenças de crescimento, margem e risco ainda justificam múltiplos diferentes."
  },
  {
    "id": "er-facil-23",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Valuation",
    "enunciado": "O que o valor terminal representa em um DCF?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O valor dos fluxos de caixa após o período de projeção explícita."
      },
      {
        "letra": "B",
        "texto": "O valor de liquidação dos ativos."
      },
      {
        "letra": "C",
        "texto": "O preço da ação no último dia de negociação."
      },
      {
        "letra": "D",
        "texto": "O caixa no fim do primeiro ano."
      }
    ],
    "resposta": "A",
    "feedback": "Como não dá para projetar ano a ano para sempre, o valor terminal resume os fluxos depois do último ano projetado."
  },
  {
    "id": "er-medio-24",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "Valor de mercado de R$ 5.000 milhões, dívida de R$ 1.500 milhões e caixa de R$ 500 milhões. Qual é o valor da firma (EV)?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 7.000 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 4.000 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 3.000 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 6.000 milhões."
      }
    ],
    "resposta": "D",
    "feedback": "EV = valor de mercado + dívida − caixa = 5.000 + 1.500 − 500 = R$ 6.000 milhões."
  },
  {
    "id": "er-medio-25",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "EV de R$ 6.000 milhões e EBITDA de R$ 1.000 milhões. Qual é o EV/EBITDA?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "0,17 vez."
      },
      {
        "letra": "B",
        "texto": "6 vezes."
      },
      {
        "letra": "C",
        "texto": "5 vezes."
      },
      {
        "letra": "D",
        "texto": "7 vezes."
      }
    ],
    "resposta": "B",
    "feedback": "6.000 ÷ 1.000 = 6 vezes. O EV é combinado com o EBITDA porque ambos se referem à empresa toda, antes da divisão entre credores e acionistas."
  },
  {
    "id": "er-medio-26",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "O fluxo de caixa do próximo ano é R$ 100 milhões e cresce 5% ao ano para sempre. Com taxa de desconto de 15%, qual é o valor presente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 667 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 2.000 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 1.000 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 500 milhões."
      }
    ],
    "resposta": "C",
    "feedback": "Pela perpetuidade com crescimento: 100 ÷ (15% − 5%) = R$ 1.000 milhões."
  },
  {
    "id": "er-medio-27",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "Qual é o valor presente de R$ 1.180 recebidos em um ano, com taxa de desconto de 18%?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 1.000."
      },
      {
        "letra": "B",
        "texto": "R$ 968."
      },
      {
        "letra": "C",
        "texto": "R$ 1.180."
      },
      {
        "letra": "D",
        "texto": "R$ 1.392."
      }
    ],
    "resposta": "A",
    "feedback": "1.180 ÷ 1,18 = R$ 1.000. Dinheiro no futuro vale menos que dinheiro hoje."
  },
  {
    "id": "er-medio-28",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "Mantidas as demais premissas, o que acontece com o valor de um DCF se a taxa de desconto aumentar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Aumenta."
      },
      {
        "letra": "B",
        "texto": "Fica igual."
      },
      {
        "letra": "C",
        "texto": "Depende apenas do valor terminal."
      },
      {
        "letra": "D",
        "texto": "Diminui."
      }
    ],
    "resposta": "D",
    "feedback": "Uma taxa maior reduz o valor presente de todos os fluxos, principalmente dos mais distantes."
  },
  {
    "id": "er-medio-29",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Valuation",
    "enunciado": "Taxa livre de risco de 12%, beta de 1,2 e prêmio de risco de mercado de 5%. Pelo CAPM, qual é o custo do capital próprio?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "17%."
      },
      {
        "letra": "B",
        "texto": "18%."
      },
      {
        "letra": "C",
        "texto": "6%."
      },
      {
        "letra": "D",
        "texto": "13,2%."
      }
    ],
    "resposta": "B",
    "feedback": "12% + 1,2 × 5% = 18%. O beta indica quanto a ação tende a oscilar em relação ao mercado."
  },
  {
    "id": "er-dificil-30",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Valuation",
    "enunciado": "Em um DCF, o valor terminal representa 60% do valor da firma. O que fazer?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Eliminar o valor terminal."
      },
      {
        "letra": "B",
        "texto": "Ignorar, pois é comum."
      },
      {
        "letra": "C",
        "texto": "Testar a sensibilidade ao crescimento na perpetuidade e à taxa de desconto, pois premissas de longo prazo pesam muito."
      },
      {
        "letra": "D",
        "texto": "Aumentar o período de projeção para 50 anos."
      }
    ],
    "resposta": "C",
    "feedback": "É comum o valor terminal pesar bastante, por isso as premissas de longo prazo merecem testes de sensibilidade e justificativa."
  },
  {
    "id": "er-dificil-31",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Valuation",
    "enunciado": "Uma analista usou crescimento na perpetuidade de 6% e taxa de desconto de 6,5%. Qual é o problema?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Com crescimento tão próximo da taxa, o valor fica extremamente sensível e tende a ficar irrealista."
      },
      {
        "letra": "B",
        "texto": "Nenhum, desde que o crescimento seja menor que a taxa."
      },
      {
        "letra": "C",
        "texto": "O crescimento deveria ser maior que a taxa."
      },
      {
        "letra": "D",
        "texto": "A taxa deveria ser igual ao crescimento."
      }
    ],
    "resposta": "A",
    "feedback": "O denominador da perpetuidade fica em 0,5 ponto percentual. Pequenas mudanças alteram muito o valor. Além disso, crescimento perpétuo precisa ser sustentável no longo prazo."
  },
  {
    "id": "er-dificil-32",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Valuation",
    "enunciado": "Uma analista projeta fluxos nominais, com inflação, e desconta a uma taxa real. O que acontece?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O resultado fica correto."
      },
      {
        "letra": "B",
        "texto": "O valor tende a ficar subestimado."
      },
      {
        "letra": "C",
        "texto": "Não faz diferença no longo prazo."
      },
      {
        "letra": "D",
        "texto": "Há inconsistência: fluxos e taxa precisam ser ambos nominais ou ambos reais."
      }
    ],
    "resposta": "D",
    "feedback": "Descontar fluxos com inflação por uma taxa sem inflação superestima o valor. Mantenha a mesma base nos dois lados."
  },
  {
    "id": "er-dificil-33",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Valuation",
    "enunciado": "Com suas premissas, o preço atual da ação equivale a uma taxa de desconto implícita de 20,5%, mas você usa 18%. Como interpretar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O mercado está errado e a ação certamente vai subir."
      },
      {
        "letra": "B",
        "texto": "O mercado exige retorno maior ou espera resultados piores que os seus; a ação parece barata segundo suas premissas."
      },
      {
        "letra": "C",
        "texto": "Você deve usar 20,5% para igualar o preço."
      },
      {
        "letra": "D",
        "texto": "A taxa implícita não tem significado."
      }
    ],
    "resposta": "B",
    "feedback": "A taxa implícita traduz o preço em expectativas. A diferença mostra onde sua visão diverge do mercado, e isso precisa ser justificado."
  },
  {
    "id": "er-dificil-34",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Valuation",
    "enunciado": "Três cenários têm valores de R$ 8, R$ 12 e R$ 15, com pesos de 25%, 50% e 25%. A ação custa R$ 10. Qual é o potencial do preço-alvo ponderado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "20%."
      },
      {
        "letra": "B",
        "texto": "11,7%."
      },
      {
        "letra": "C",
        "texto": "17,5%."
      },
      {
        "letra": "D",
        "texto": "50%."
      }
    ],
    "resposta": "C",
    "feedback": "Preço-alvo ponderado: 0,25 × 8 + 0,5 × 12 + 0,25 × 15 = R$ 11,75. Potencial: 11,75 ÷ 10 − 1 = 17,5%."
  },
  {
    "id": "er-facil-35",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O que costuma significar uma recomendação de “manter” (neutra)?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Que a ação vai cair."
      },
      {
        "letra": "B",
        "texto": "Que o retorno esperado está próximo da referência, sem motivo forte para comprar ou vender."
      },
      {
        "letra": "C",
        "texto": "Que a empresa está em dificuldade."
      },
      {
        "letra": "D",
        "texto": "Que a analista não analisou a empresa."
      }
    ],
    "resposta": "B",
    "feedback": "Cada casa define seus critérios, mas “manter” geralmente indica potencial moderado, entre os limites de compra e venda."
  },
  {
    "id": "er-facil-36",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Uma ação custa R$ 40, e o preço-alvo é R$ 50. Qual é o potencial de valorização?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "20%."
      },
      {
        "letra": "B",
        "texto": "10%."
      },
      {
        "letra": "C",
        "texto": "80%."
      },
      {
        "letra": "D",
        "texto": "25%."
      }
    ],
    "resposta": "D",
    "feedback": "50 ÷ 40 − 1 = 25%. Cuidado: calcular 10 ÷ 50 daria 20%, mas o potencial é medido sobre o preço atual."
  },
  {
    "id": "er-facil-37",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O que é um catalisador?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um tipo de ação preferencial."
      },
      {
        "letra": "B",
        "texto": "A taxa de desconto do DCF."
      },
      {
        "letra": "C",
        "texto": "Um evento que pode fazer o mercado reavaliar a ação, como um resultado ou uma mudança regulatória."
      },
      {
        "letra": "D",
        "texto": "Um múltiplo de valuation."
      }
    ],
    "resposta": "C",
    "feedback": "Uma ação pode ficar “barata” por muito tempo. Catalisadores são eventos que podem destravar a diferença entre preço e valor."
  },
  {
    "id": "er-facil-38",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O que é o consenso de mercado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A média das estimativas dos analistas para indicadores como receita e lucro."
      },
      {
        "letra": "B",
        "texto": "A opinião da empresa sobre si mesma."
      },
      {
        "letra": "C",
        "texto": "A cotação média do último mês."
      },
      {
        "letra": "D",
        "texto": "A decisão da CVM sobre a empresa."
      }
    ],
    "resposta": "A",
    "feedback": "O consenso resume o que o mercado espera. Resultados são comparados a ele, e surpresas costumam mover o preço."
  },
  {
    "id": "er-facil-39",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Por que a analista lê o release de resultados e acompanha a teleconferência?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Porque substituem o DCF."
      },
      {
        "letra": "B",
        "texto": "Para atualizar números, entender as explicações da administração e fazer perguntas sobre as tendências."
      },
      {
        "letra": "C",
        "texto": "Porque são a única fonte de cotações."
      },
      {
        "letra": "D",
        "texto": "Para saber o preço-alvo da empresa."
      }
    ],
    "resposta": "B",
    "feedback": "O release traz os números; a teleconferência traz contexto, como explicações sobre vendas, margens e perspectivas."
  },
  {
    "id": "er-facil-40",
    "areaId": "equity-research",
    "nivel": "facil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Qual é a diferença entre sell-side e buy-side?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sell-side só vende ações; buy-side só compra."
      },
      {
        "letra": "B",
        "texto": "Não há diferença."
      },
      {
        "letra": "C",
        "texto": "Buy-side publica relatórios abertos ao público."
      },
      {
        "letra": "D",
        "texto": "Sell-side publica análises para clientes de bancos e corretoras; buy-side analisa para decidir os investimentos de gestoras e fundos."
      }
    ],
    "resposta": "D",
    "feedback": "A analista sell-side atende investidores com relatórios e recomendações. A analista buy-side trabalha dentro da gestora e apoia as decisões da própria carteira."
  },
  {
    "id": "er-medio-41",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O lucro de uma empresa veio acima do consenso, mas a ação caiu. O que pode explicar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O mercado sempre erra."
      },
      {
        "letra": "B",
        "texto": "Lucro acima do esperado sempre faz a ação subir."
      },
      {
        "letra": "C",
        "texto": "Perspectivas mais fracas, qualidade do resultado ou expectativas que já estavam no preço."
      },
      {
        "letra": "D",
        "texto": "A empresa deve ter fraudado o resultado."
      }
    ],
    "resposta": "C",
    "feedback": "O mercado olha para frente. Um lucro bom com projeções piores ou ganhos pontuais pode decepcionar."
  },
  {
    "id": "er-medio-42",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "A regra da casa é: compra acima de +15%; venda abaixo de −10%; manter entre os dois. Preço de R$ 10 e preço-alvo de R$ 10,80. Qual é a recomendação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Manter, com potencial de 8%."
      },
      {
        "letra": "B",
        "texto": "Compra, pois o potencial é positivo."
      },
      {
        "letra": "C",
        "texto": "Venda, pois o potencial é menor que 15%."
      },
      {
        "letra": "D",
        "texto": "Compra, com potencial de 18%."
      }
    ],
    "resposta": "A",
    "feedback": "10,80 ÷ 10 − 1 = 8%, entre −10% e +15%."
  },
  {
    "id": "er-medio-43",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O banco em que a analista trabalha coordenou uma oferta de ações da empresa analisada. Qual é a postura adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Esconder a informação para não influenciar investidores."
      },
      {
        "letra": "B",
        "texto": "Divulgar o conflito de interesse e manter a independência da análise."
      },
      {
        "letra": "C",
        "texto": "Recomendar compra para apoiar a oferta."
      },
      {
        "letra": "D",
        "texto": "Deixar de cobrir qualquer empresa do setor."
      }
    ],
    "resposta": "B",
    "feedback": "Conflitos precisam ser informados no relatório, e a análise deve ser independente. No Brasil, as regras para analistas estão na Resolução CVM 20."
  },
  {
    "id": "er-medio-44",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Como comparar vendas de uma varejista de moda, que vende mais no fim do ano?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Comparar o 4º trimestre com o 3º trimestre do mesmo ano."
      },
      {
        "letra": "B",
        "texto": "Usar apenas o último mês."
      },
      {
        "letra": "C",
        "texto": "Ignorar a sazonalidade."
      },
      {
        "letra": "D",
        "texto": "Comparar cada trimestre com o mesmo trimestre do ano anterior."
      }
    ],
    "resposta": "D",
    "feedback": "Comparar o 4º trimestre com o 3º mostraria crescimento apenas por causa da época de compras. A comparação anual elimina esse efeito."
  },
  {
    "id": "er-medio-45",
    "areaId": "equity-research",
    "nivel": "medio",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Como juros altos costumam afetar varejistas?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Reduzem o consumo a crédito, aumentam a inadimplência e elevam a taxa de desconto do valuation."
      },
      {
        "letra": "B",
        "texto": "Aumentam as vendas, pois as pessoas poupam menos."
      },
      {
        "letra": "C",
        "texto": "Não têm efeito sobre empresas sem dívida."
      },
      {
        "letra": "D",
        "texto": "Afetam apenas bancos."
      }
    ],
    "resposta": "A",
    "feedback": "Mesmo uma varejista com caixa líquido sente os juros: clientes compram menos parcelado, perdas com crédito sobem e o valor presente dos lucros futuros cai."
  },
  {
    "id": "er-dificil-46",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Uma empresa retira suas projeções de crescimento citando incerteza. Qual é a melhor reação da analista?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Recomendar venda imediatamente."
      },
      {
        "letra": "B",
        "texto": "Manter as projeções antigas da empresa."
      },
      {
        "letra": "C",
        "texto": "Revisar premissas e riscos com base nos fatos, sem concluir automaticamente pela venda."
      },
      {
        "letra": "D",
        "texto": "Parar de cobrir a empresa."
      }
    ],
    "resposta": "C",
    "feedback": "A retirada aumenta a incerteza, mas o preço pode já refletir parte disso. A analista precisa rever suas próprias premissas e verificar o potencial."
  },
  {
    "id": "er-dificil-47",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "A financeira de uma varejista registra aumento das perdas com crédito. Qual efeito a analista deve considerar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Nenhum, pois a financeira é separada do varejo."
      },
      {
        "letra": "B",
        "texto": "O lucro consolidado pode cair mesmo com vendas estáveis; é preciso acompanhar inadimplência e provisões."
      },
      {
        "letra": "C",
        "texto": "As vendas vão necessariamente aumentar."
      },
      {
        "letra": "D",
        "texto": "A margem bruta do varejo vai cair na mesma proporção."
      }
    ],
    "resposta": "B",
    "feedback": "O cartão próprio gera receita financeira, mas também risco de crédito. Perdas maiores reduzem o resultado consolidado."
  },
  {
    "id": "er-dificil-48",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "O governo pode mudar a tributação de compras em plataformas internacionais, afetando a concorrência de uma varejista. Como tratar isso no modelo?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Assumir que a mudança vai acontecer."
      },
      {
        "letra": "B",
        "texto": "Ignorar, pois é incerto."
      },
      {
        "letra": "C",
        "texto": "Reduzir o preço-alvo pela metade."
      },
      {
        "letra": "D",
        "texto": "Construir cenários com e sem a mudança e avaliar a sensibilidade do valor."
      }
    ],
    "resposta": "D",
    "feedback": "Quando um evento incerto pode mudar muito o resultado, cenários ajudam a mostrar o que está em jogo sem apostar tudo em uma hipótese."
  },
  {
    "id": "er-dificil-49",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Uma ação negocia a um P/L de 6,6 vezes, abaixo de sua média histórica. O que concluir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Pode ser uma oportunidade ou refletir a expectativa de lucros menores; é preciso entender o motivo."
      },
      {
        "letra": "B",
        "texto": "A ação está certamente barata."
      },
      {
        "letra": "C",
        "texto": "A ação está certamente cara."
      },
      {
        "letra": "D",
        "texto": "O P/L histórico é irrelevante."
      }
    ],
    "resposta": "A",
    "feedback": "Um múltiplo baixo pode indicar desconto ou um lucro que deve cair. Quando a ação parece barata mas os lucros pioram, fala-se em “value trap”."
  },
  {
    "id": "er-dificil-50",
    "areaId": "equity-research",
    "nivel": "dificil",
    "tema": "Mercado, setor e recomendação",
    "enunciado": "Você recomendava compra; a ação caiu 15% após um resultado fraco. Qual é a melhor postura?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Manter a recomendação para não admitir erro."
      },
      {
        "letra": "B",
        "texto": "Mudar para venda porque a ação caiu."
      },
      {
        "letra": "C",
        "texto": "Atualizar premissas e preço-alvo com os novos fatos e recalcular o potencial sobre o novo preço."
      },
      {
        "letra": "D",
        "texto": "Esperar o próximo resultado sem revisar nada."
      }
    ],
    "resposta": "C",
    "feedback": "A recomendação depende de valor e preço. Ambos mudaram, então a análise precisa ser refeita sem se ancorar na posição anterior."
  },
  {
    "id": "wm-facil-01",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Qual é a principal função de uma profissional de Wealth Management?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Garantir que a carteira da cliente nunca perca valor."
      },
      {
        "letra": "B",
        "texto": "Entender os objetivos da cliente e montar e acompanhar uma estratégia patrimonial."
      },
      {
        "letra": "C",
        "texto": "Escolher sempre os investimentos de maior retorno."
      },
      {
        "letra": "D",
        "texto": "Substituir a cliente nas decisões sobre sua vida financeira."
      }
    ],
    "resposta": "B",
    "feedback": "Wealth Management vai além de escolher produtos: começa por entender objetivos, prazos e riscos e acompanha a estratégia ao longo do tempo. Nenhuma profissional consegue garantir resultados."
  },
  {
    "id": "wm-facil-02",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "O que a reserva de emergência deve priorizar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Retorno elevado, mesmo com oscilação."
      },
      {
        "letra": "B",
        "texto": "Isenção de imposto acima de tudo."
      },
      {
        "letra": "C",
        "texto": "Investimentos de longo prazo com carência."
      },
      {
        "letra": "D",
        "texto": "Liquidez e baixo risco."
      }
    ],
    "resposta": "D",
    "feedback": "A reserva existe para imprevistos. Ela precisa estar disponível rapidamente e sem risco relevante de perda no momento do resgate."
  },
  {
    "id": "wm-facil-03",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Qual é o objetivo do processo de suitability?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Verificar se os produtos recomendados são adequados ao perfil, aos objetivos e à situação financeira da cliente."
      },
      {
        "letra": "B",
        "texto": "Garantir o retorno mínimo dos investimentos."
      },
      {
        "letra": "C",
        "texto": "Definir a alíquota de imposto da cliente."
      },
      {
        "letra": "D",
        "texto": "Aprovar o crédito da cliente no banco."
      }
    ],
    "resposta": "A",
    "feedback": "Suitability significa adequação. Antes de recomendar, a instituição precisa conhecer a cliente e verificar se o produto combina com ela."
  },
  {
    "id": "wm-facil-04",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "R$ 10 mil são aplicados a 10% ao ano por dois anos, sem aportes nem resgates. Qual é o valor final?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 11.000."
      },
      {
        "letra": "B",
        "texto": "R$ 12.000."
      },
      {
        "letra": "C",
        "texto": "R$ 12.100."
      },
      {
        "letra": "D",
        "texto": "R$ 12.500."
      }
    ],
    "resposta": "C",
    "feedback": "Juros compostos rendem sobre o saldo acumulado: 10.000 × 1,10 × 1,10 = R$ 12.100. Os R$ 100 extras são os juros sobre os juros do primeiro ano."
  },
  {
    "id": "wm-facil-05",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "O que é o horizonte de investimento de um objetivo?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O retorno esperado do investimento."
      },
      {
        "letra": "B",
        "texto": "O prazo até a cliente precisar do dinheiro."
      },
      {
        "letra": "C",
        "texto": "O número de produtos na carteira."
      },
      {
        "letra": "D",
        "texto": "A taxa cobrada pela instituição."
      }
    ],
    "resposta": "B",
    "feedback": "O horizonte indica quando o dinheiro será usado. Quanto mais curto ele for, menos espaço há para se recuperar de oscilações."
  },
  {
    "id": "wm-facil-06",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "O que a diversificação faz?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Elimina todos os riscos da carteira."
      },
      {
        "letra": "B",
        "texto": "Garante retorno acima da inflação."
      },
      {
        "letra": "C",
        "texto": "Concentra o patrimônio no melhor ativo."
      },
      {
        "letra": "D",
        "texto": "Reduz o risco específico de cada ativo, sem eliminar todo o risco."
      }
    ],
    "resposta": "D",
    "feedback": "Distribuir recursos entre ativos diferentes diminui o impacto de um problema isolado. Riscos que afetam todo o mercado continuam existindo."
  },
  {
    "id": "wm-medio-07",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Um investimento rendeu 12% no ano, e a inflação foi de 5%. Qual foi o retorno real aproximado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "6,7%."
      },
      {
        "letra": "B",
        "texto": "7,0%."
      },
      {
        "letra": "C",
        "texto": "17,0%."
      },
      {
        "letra": "D",
        "texto": "5,0%."
      }
    ],
    "resposta": "A",
    "feedback": "O retorno real mostra o ganho de poder de compra: 1,12 ÷ 1,05 − 1 ≈ 6,7%. A subtração simples (12% − 5% = 7%) é só uma aproximação."
  },
  {
    "id": "wm-medio-08",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente quer retirar R$ 120 mil por ano, em termos reais, para sempre. Com retorno real de 4% ao ano, qual patrimônio seria necessário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 1,2 milhão."
      },
      {
        "letra": "B",
        "texto": "R$ 4,8 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 3,0 milhões."
      },
      {
        "letra": "D",
        "texto": "R$ 2,4 milhões."
      }
    ],
    "resposta": "C",
    "feedback": "Para retirar só o rendimento real, o patrimônio precisa render R$ 120 mil por ano: 120 ÷ 4% = R$ 3 milhões."
  },
  {
    "id": "wm-medio-09",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente se declara arrojada, mas resgatou tudo na última queda forte do mercado. O que fazer?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Manter o perfil arrojado, pois foi o que ela declarou."
      },
      {
        "letra": "B",
        "texto": "Classificá-la automaticamente como conservadora para sempre."
      },
      {
        "letra": "C",
        "texto": "Ignorar o histórico, pois o passado não se repete."
      },
      {
        "letra": "D",
        "texto": "Investigar a contradição e revisar o perfil com ela."
      }
    ],
    "resposta": "D",
    "feedback": "O comportamento em momentos difíceis revela muito sobre a tolerância real a risco. Vale conversar, entender o que aconteceu e ajustar o perfil."
  },
  {
    "id": "wm-medio-10",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente gasta R$ 8 mil por mês e quer reserva de seis meses. Qual deve ser o valor da reserva?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 8 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 48 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 96 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 24 mil."
      }
    ],
    "resposta": "B",
    "feedback": "Basta multiplicar o gasto mensal pelo número de meses: 8 × 6 = R$ 48 mil."
  },
  {
    "id": "wm-medio-11",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma assessora recebe remuneração maior ao distribuir um produto específico. Qual é a postura adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Ser transparente sobre sua remuneração e recomendar com base nas necessidades da cliente."
      },
      {
        "letra": "B",
        "texto": "Recomendar o produto, pois a remuneração não afeta a cliente."
      },
      {
        "letra": "C",
        "texto": "Não contar nada, para não confundir a cliente."
      },
      {
        "letra": "D",
        "texto": "Recusar-se a oferecer qualquer produto remunerado."
      }
    ],
    "resposta": "A",
    "feedback": "Conflitos de interesse existem em vários modelos de remuneração. O essencial é ser transparente e colocar o interesse da cliente em primeiro lugar."
  },
  {
    "id": "wm-medio-12",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente tem três objetivos com prazos de 1, 8 e 25 anos. Qual abordagem é adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma única carteira arrojada para todos."
      },
      {
        "letra": "B",
        "texto": "Uma única carteira conservadora para todos."
      },
      {
        "letra": "C",
        "texto": "Separar recursos por objetivo, com riscos compatíveis com cada prazo."
      },
      {
        "letra": "D",
        "texto": "Priorizar só o objetivo mais distante."
      }
    ],
    "resposta": "C",
    "feedback": "Cada objetivo tem horizonte e tolerância próprios. Separar os recursos ajuda a proteger o curto prazo e a buscar crescimento no longo."
  },
  {
    "id": "wm-dificil-13",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente tem R$ 6 milhões, espera retorno real de 4% ao ano e quer retirar R$ 300 mil reais por ano. O que tende a acontecer?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O patrimônio cresce, pois o retorno é positivo."
      },
      {
        "letra": "B",
        "texto": "Os saques superam o rendimento real de R$ 240 mil, e o patrimônio tende a diminuir ao longo do tempo."
      },
      {
        "letra": "C",
        "texto": "O patrimônio fica constante."
      },
      {
        "letra": "D",
        "texto": "É impossível dizer qualquer coisa com esses dados."
      }
    ],
    "resposta": "B",
    "feedback": "O rendimento real é 6 milhões × 4% = R$ 240 mil, menor que os R$ 300 mil retirados. A diferença sai do principal todos os anos."
  },
  {
    "id": "wm-dificil-14",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Duas clientes têm o mesmo retorno médio em dez anos, mas uma faz saques anuais. Para ela, por que importa se as perdas vêm no início?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Não importa: só a média conta."
      },
      {
        "letra": "B",
        "texto": "Perdas no início sempre se recuperam rapidamente."
      },
      {
        "letra": "C",
        "texto": "Saques eliminam o risco de mercado."
      },
      {
        "letra": "D",
        "texto": "Saques após perdas vendem ativos desvalorizados e reduzem a base que se recuperaria depois."
      }
    ],
    "resposta": "D",
    "feedback": "Esse é o risco de sequência de retornos. Quem saca durante uma queda transforma perdas temporárias em permanentes para a parte resgatada."
  },
  {
    "id": "wm-dificil-15",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Com inflação de 5% ao ano, quanto R$ 100 mil de hoje valerão em poder de compra daqui a dois anos?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Cerca de R$ 90,7 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 90 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 95 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 110,25 mil."
      }
    ],
    "resposta": "A",
    "feedback": "Dividimos pela inflação acumulada: 100 ÷ 1,05² ≈ R$ 90,7 mil. O valor nominal é o mesmo, mas compra menos."
  },
  {
    "id": "wm-dificil-16",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma família tem 80% do patrimônio em sua empresa. Qual orientação inicial é adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Vender a empresa imediatamente."
      },
      {
        "letra": "B",
        "texto": "Ignorar a concentração, pois a família conhece o negócio."
      },
      {
        "letra": "C",
        "texto": "Avaliar concentração, liquidez e um plano de diversificação gradual, considerando tributação e governança."
      },
      {
        "letra": "D",
        "texto": "Investir o restante também no mesmo setor."
      }
    ],
    "resposta": "C",
    "feedback": "Concentração aumenta o risco, mas a solução depende de liquidez, impostos, controle e desejos da família. Um plano gradual costuma ser mais realista."
  },
  {
    "id": "wm-dificil-17",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Planejamento e perfil da cliente",
    "enunciado": "Uma cliente tem R$ 800 mil e quer chegar a R$ 1 milhão, em termos reais, sem aportes. Com retorno real de 5% ao ano, em quanto tempo aproximadamente?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Cerca de 3 anos."
      },
      {
        "letra": "B",
        "texto": "Cerca de 10 anos."
      },
      {
        "letra": "C",
        "texto": "Cerca de 4 anos."
      },
      {
        "letra": "D",
        "texto": "Cerca de 5 anos."
      }
    ],
    "resposta": "D",
    "feedback": "Teste ano a ano: 800 × 1,05⁴ ≈ 972 e 800 × 1,05⁵ ≈ 1.021. A meta é alcançada no quinto ano."
  },
  {
    "id": "wm-facil-18",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é o Tesouro Selic?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um título público pós-fixado atrelado à Selic, com baixa oscilação."
      },
      {
        "letra": "B",
        "texto": "Uma ação de empresa estatal."
      },
      {
        "letra": "C",
        "texto": "Um título prefixado de longo prazo."
      },
      {
        "letra": "D",
        "texto": "Um fundo imobiliário do governo."
      }
    ],
    "resposta": "A",
    "feedback": "O Tesouro Selic acompanha a taxa básica de juros e costuma oscilar pouco. Por isso é muito usado para reserva e liquidez."
  },
  {
    "id": "wm-facil-19",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é um CDB?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Uma participação no capital do banco."
      },
      {
        "letra": "B",
        "texto": "Um título público emitido pelo Tesouro."
      },
      {
        "letra": "C",
        "texto": "Um fundo de ações."
      },
      {
        "letra": "D",
        "texto": "Um título emitido por banco, com cobertura do FGC dentro dos limites."
      }
    ],
    "resposta": "D",
    "feedback": "Ao comprar um CDB, você empresta dinheiro ao banco. O FGC cobre esse tipo de aplicação dentro dos limites por pessoa e por instituição."
  },
  {
    "id": "wm-facil-20",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "Qual é uma diferença entre ações e renda fixa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Ações têm rentabilidade definida no contrato."
      },
      {
        "letra": "B",
        "texto": "Renda fixa nunca oscila."
      },
      {
        "letra": "C",
        "texto": "Ações representam participação na empresa, sem retorno pré-definido."
      },
      {
        "letra": "D",
        "texto": "Renda fixa dá direito a voto na empresa."
      }
    ],
    "resposta": "C",
    "feedback": "O acionista participa dos resultados e dos riscos do negócio. Na renda fixa, as condições de remuneração são combinadas na emissão."
  },
  {
    "id": "wm-facil-21",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é um ETF?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um título de dívida bancária."
      },
      {
        "letra": "B",
        "texto": "Um fundo negociado em bolsa que normalmente replica um índice."
      },
      {
        "letra": "C",
        "texto": "Um seguro de vida."
      },
      {
        "letra": "D",
        "texto": "Uma conta poupança em dólar."
      }
    ],
    "resposta": "B",
    "feedback": "O ETF permite comprar uma cesta de ativos com uma única cota negociada em bolsa, geralmente com custo baixo."
  },
  {
    "id": "wm-facil-22",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é liquidez?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A facilidade de transformar um investimento em dinheiro sem perda relevante de valor."
      },
      {
        "letra": "B",
        "texto": "O retorno de um investimento."
      },
      {
        "letra": "C",
        "texto": "A garantia contra perdas."
      },
      {
        "letra": "D",
        "texto": "O imposto pago no resgate."
      }
    ],
    "resposta": "A",
    "feedback": "Um ativo líquido pode ser vendido rapidamente por um preço justo. Liquidez é essencial para objetivos de curto prazo."
  },
  {
    "id": "wm-facil-23",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é um fundo imobiliário (FII)?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um financiamento para comprar imóveis."
      },
      {
        "letra": "B",
        "texto": "Um título público."
      },
      {
        "letra": "C",
        "texto": "Uma poupança vinculada a imóveis."
      },
      {
        "letra": "D",
        "texto": "Um fundo que investe em ativos imobiliários, com cotas negociadas em bolsa."
      }
    ],
    "resposta": "D",
    "feedback": "Os FIIs reúnem recursos de vários investidores para investir em imóveis ou títulos ligados a eles. As cotas podem oscilar na bolsa."
  },
  {
    "id": "wm-medio-24",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "As taxas de juros sobem. O que tende a acontecer com o preço de um título prefixado já emitido?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sobe."
      },
      {
        "letra": "B",
        "texto": "Cai, o que afeta quem vender antes do vencimento."
      },
      {
        "letra": "C",
        "texto": "Fica igual até o vencimento."
      },
      {
        "letra": "D",
        "texto": "É convertido em pós-fixado."
      }
    ],
    "resposta": "B",
    "feedback": "Os pagamentos do título são fixos e passam a ser descontados a uma taxa maior. O preço cai. Quem leva até o vencimento recebe o combinado."
  },
  {
    "id": "wm-medio-25",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "Uma carteira tem 60% em um ativo com retorno esperado de 10% e 40% em outro com 5%. Qual é o retorno esperado da carteira?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "7,5%."
      },
      {
        "letra": "B",
        "texto": "15,0%."
      },
      {
        "letra": "C",
        "texto": "8,0%."
      },
      {
        "letra": "D",
        "texto": "6,0%."
      }
    ],
    "resposta": "C",
    "feedback": "É a média ponderada pelos pesos: 60% × 10% + 40% × 5% = 6% + 2% = 8%."
  },
  {
    "id": "wm-medio-26",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "Em uma carteira de R$ 1 milhão, qual é a diferença anual entre pagar 2% e 0,5% de taxa?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 15 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 20 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 5 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 1,5 mil."
      }
    ],
    "resposta": "A",
    "feedback": "1.000.000 × (2% − 0,5%) = R$ 15 mil por ano. Ao longo de muitos anos, essa diferença também deixa de render juros."
  },
  {
    "id": "wm-medio-27",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "Para uma pessoa física, com prazo acima de 720 dias, o que rende mais: CDB a 100% do CDI ou LCI isenta a 90% do CDI?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "O CDB, porque 100% é maior que 90%."
      },
      {
        "letra": "B",
        "texto": "São equivalentes."
      },
      {
        "letra": "C",
        "texto": "Depende apenas do banco emissor."
      },
      {
        "letra": "D",
        "texto": "A LCI, pois o CDB líquido de IR de 15% equivale a 85% do CDI."
      }
    ],
    "resposta": "D",
    "feedback": "Compare sempre o retorno líquido: 100% × (1 − 15%) = 85% do CDI, abaixo dos 90% da LCI. Prazo e liquidez também precisam ser comparados."
  },
  {
    "id": "wm-medio-28",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "Por que combinar ativos com baixa correlação?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Para garantir que todos subam juntos."
      },
      {
        "letra": "B",
        "texto": "Para reduzir a oscilação total da carteira."
      },
      {
        "letra": "C",
        "texto": "Para eliminar a necessidade de rebalancear."
      },
      {
        "letra": "D",
        "texto": "Para aumentar o imposto pago."
      }
    ],
    "resposta": "B",
    "feedback": "Se os ativos não caem ao mesmo tempo, as perdas de um podem ser compensadas por outros. A carteira oscila menos que seus componentes isolados."
  },
  {
    "id": "wm-medio-29",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Investimentos e alocação",
    "enunciado": "O que é rebalancear uma carteira?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Trocar todos os ativos todo mês."
      },
      {
        "letra": "B",
        "texto": "Concentrar recursos no ativo que mais subiu."
      },
      {
        "letra": "C",
        "texto": "Ajustar os pesos de volta à alocação-alvo, reduzindo o que subiu demais e reforçando o que ficou abaixo."
      },
      {
        "letra": "D",
        "texto": "Resgatar tudo após uma queda."
      }
    ],
    "resposta": "C",
    "feedback": "Com o tempo, os pesos se afastam do planejado. Rebalancear mantém o risco escolhido e impõe disciplina de compra e venda."
  },
  {
    "id": "wm-dificil-30",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Investimentos e alocação",
    "enunciado": "Uma cliente tem R$ 250 mil em CDB do banco A e R$ 150 mil em CDB do banco B, do mesmo conglomerado. Quanto o FGC cobriria em caso de liquidação do grupo?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 250 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 400 mil."
      },
      {
        "letra": "C",
        "texto": "R$ 150 mil."
      },
      {
        "letra": "D",
        "texto": "R$ 500 mil."
      }
    ],
    "resposta": "A",
    "feedback": "O limite de R$ 250 mil vale por CPF e por conglomerado financeiro. Bancos do mesmo grupo compartilham esse limite, e há ainda um teto de R$ 1 milhão a cada quatro anos."
  },
  {
    "id": "wm-dificil-31",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Investimentos e alocação",
    "enunciado": "Um título de crédito privado oferece taxa muito acima de títulos semelhantes. O que concluir?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "É uma oportunidade sem risco."
      },
      {
        "letra": "B",
        "texto": "O mercado está errado."
      },
      {
        "letra": "C",
        "texto": "A taxa elevada garante pagamento."
      },
      {
        "letra": "D",
        "texto": "A taxa maior provavelmente reflete risco maior; é preciso analisar emissor, garantias e liquidez."
      }
    ],
    "resposta": "D",
    "feedback": "Remuneração alta costuma compensar risco alto. Antes de investir, vale entender por que o emissor precisa pagar tanto."
  },
  {
    "id": "wm-dificil-32",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Investimentos e alocação",
    "enunciado": "A carteira X rendeu 8% com volatilidade de 10%; a Y rendeu 9% com volatilidade de 15%. A taxa livre de risco é 4%. Qual teve melhor retorno ajustado ao risco?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Y, porque rendeu mais."
      },
      {
        "letra": "B",
        "texto": "X, com índice de Sharpe de 0,40 contra 0,33 de Y."
      },
      {
        "letra": "C",
        "texto": "Empate."
      },
      {
        "letra": "D",
        "texto": "Y, porque a volatilidade não importa."
      }
    ],
    "resposta": "B",
    "feedback": "O índice de Sharpe divide o retorno acima da taxa livre de risco pela volatilidade: X = (8 − 4) ÷ 10 = 0,40 e Y = (9 − 4) ÷ 15 ≈ 0,33."
  },
  {
    "id": "wm-dificil-33",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Investimentos e alocação",
    "enunciado": "Uma cliente pretende morar em Portugal e terá despesas em euro. Como ver a exposição a moeda estrangeira?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sempre um risco a evitar."
      },
      {
        "letra": "B",
        "texto": "Irrelevante para o planejamento."
      },
      {
        "letra": "C",
        "texto": "Pode funcionar como proteção, pois as despesas futuras estarão em euro."
      },
      {
        "letra": "D",
        "texto": "Proibida para pessoas físicas."
      }
    ],
    "resposta": "C",
    "feedback": "O risco depende da moeda dos compromissos. Se os gastos serão em euro, ter ativos nessa moeda reduz o descasamento."
  },
  {
    "id": "wm-dificil-34",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Investimentos e alocação",
    "enunciado": "Um COE promete capital protegido no vencimento. O que é correto afirmar?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A proteção vale no vencimento, depende da capacidade do emissor de pagar, não tem cobertura do FGC e o retorno pode ser zero."
      },
      {
        "letra": "B",
        "texto": "O capital está protegido em qualquer data de resgate."
      },
      {
        "letra": "C",
        "texto": "O FGC garante o COE."
      },
      {
        "letra": "D",
        "texto": "O retorno mínimo é sempre igual ao CDI."
      }
    ],
    "resposta": "A",
    "feedback": "“Capital protegido” não é o mesmo que risco zero. Há risco de crédito do emissor, baixa liquidez antes do vencimento e possibilidade de não ganhar nada."
  },
  {
    "id": "wm-facil-35",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Na tabela regressiva de IR da renda fixa, qual é a menor alíquota?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "22,5%, até 180 dias."
      },
      {
        "letra": "B",
        "texto": "15%, acima de 720 dias."
      },
      {
        "letra": "C",
        "texto": "10%, acima de cinco anos."
      },
      {
        "letra": "D",
        "texto": "0%, acima de dez anos."
      }
    ],
    "resposta": "B",
    "feedback": "A alíquota cai com o prazo: 22,5%, 20%, 17,5% e, acima de 720 dias, 15%."
  },
  {
    "id": "wm-facil-36",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Qual investimento é isento de IR sobre os rendimentos para pessoa física?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "CDB."
      },
      {
        "letra": "B",
        "texto": "Tesouro IPCA+."
      },
      {
        "letra": "C",
        "texto": "Debênture comum."
      },
      {
        "letra": "D",
        "texto": "LCA."
      }
    ],
    "resposta": "D",
    "feedback": "LCI e LCA mantêm isenção para pessoa física. CDB, títulos públicos e debêntures comuns seguem a tabela regressiva."
  },
  {
    "id": "wm-facil-37",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "O que é o come-cotas?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A antecipação semestral do IR em fundos abertos, feita pela redução da quantidade de cotas."
      },
      {
        "letra": "B",
        "texto": "Uma taxa de administração extra."
      },
      {
        "letra": "C",
        "texto": "Uma multa por resgate antecipado."
      },
      {
        "letra": "D",
        "texto": "Um imposto sobre ações."
      }
    ],
    "resposta": "A",
    "feedback": "Em maio e novembro, parte do IR devido em muitos fundos é recolhida antecipadamente. A cliente vê menos cotas, não um boleto."
  },
  {
    "id": "wm-facil-38",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Para quem o PGBL costuma ser mais indicado?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Para quem é isento de IR."
      },
      {
        "letra": "B",
        "texto": "Para quem faz a declaração simplificada."
      },
      {
        "letra": "C",
        "texto": "Para quem faz a declaração completa e quer deduzir contribuições até 12% da renda tributável."
      },
      {
        "letra": "D",
        "texto": "Para quem quer resgatar em seis meses."
      }
    ],
    "resposta": "C",
    "feedback": "O benefício do PGBL é a dedução na declaração completa. Em troca, o IR no resgate incide sobre o valor total, não só sobre os rendimentos."
  },
  {
    "id": "wm-facil-39",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "O que é o inventário?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Um seguro de vida."
      },
      {
        "letra": "B",
        "texto": "O processo de levantamento e partilha dos bens após o falecimento."
      },
      {
        "letra": "C",
        "texto": "Um contrato de doação."
      },
      {
        "letra": "D",
        "texto": "Uma declaração anual de bens."
      }
    ],
    "resposta": "B",
    "feedback": "O inventário identifica bens e dívidas e organiza a partilha entre herdeiros. Pode levar tempo e gerar custos."
  },
  {
    "id": "wm-facil-40",
    "areaId": "wealth-management",
    "nivel": "facil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Para que serve um testamento?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Para evitar qualquer imposto na herança."
      },
      {
        "letra": "B",
        "texto": "Para deserdar livremente qualquer herdeiro."
      },
      {
        "letra": "C",
        "texto": "Para substituir o inventário em todos os casos."
      },
      {
        "letra": "D",
        "texto": "Para dispor sobre a parte disponível dos bens, respeitando a parte reservada aos herdeiros necessários."
      }
    ],
    "resposta": "D",
    "feedback": "Havendo herdeiros necessários, metade do patrimônio é reservada a eles. O testamento organiza a outra metade e outras vontades."
  },
  {
    "id": "wm-medio-41",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Um CDB foi resgatado após 400 dias com rendimento bruto de R$ 10 mil. Qual é o rendimento líquido?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 8.500."
      },
      {
        "letra": "B",
        "texto": "R$ 7.750."
      },
      {
        "letra": "C",
        "texto": "R$ 8.250."
      },
      {
        "letra": "D",
        "texto": "R$ 8.000."
      }
    ],
    "resposta": "C",
    "feedback": "Entre 361 e 720 dias, a alíquota é 17,5%: 10.000 × (1 − 17,5%) = R$ 8.250."
  },
  {
    "id": "wm-medio-42",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Em 2026, uma empresa paga R$ 80 mil de dividendos a uma mesma sócia pessoa física em um único mês. Qual é a retenção na fonte?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 8 mil."
      },
      {
        "letra": "B",
        "texto": "R$ 3 mil."
      },
      {
        "letra": "C",
        "texto": "Zero."
      },
      {
        "letra": "D",
        "texto": "R$ 12 mil."
      }
    ],
    "resposta": "A",
    "feedback": "Acima de R$ 50 mil no mês, pagos pela mesma empresa à mesma pessoa, há retenção de 10% sobre o total: 80 × 10% = R$ 8 mil."
  },
  {
    "id": "wm-medio-43",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma investidora vendeu R$ 15 mil em ações no mês, em operações comuns, com lucro de R$ 3 mil. Ela paga IR?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sim, 15% sobre R$ 15 mil."
      },
      {
        "letra": "B",
        "texto": "Não, pois as vendas no mês ficaram abaixo de R$ 20 mil."
      },
      {
        "letra": "C",
        "texto": "Sim, 15% sobre R$ 3 mil."
      },
      {
        "letra": "D",
        "texto": "Sim, 20% sobre o lucro."
      }
    ],
    "resposta": "B",
    "feedback": "Em operações comuns com ações, vendas totais de até R$ 20 mil no mês são isentas. Day trade não tem essa isenção."
  },
  {
    "id": "wm-medio-44",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Qual é a diferença de tributação no resgate entre VGBL e PGBL?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Ambos são tributados apenas nos rendimentos."
      },
      {
        "letra": "B",
        "texto": "O VGBL é sempre isento."
      },
      {
        "letra": "C",
        "texto": "O PGBL é tributado só nos rendimentos."
      },
      {
        "letra": "D",
        "texto": "No VGBL, o IR incide sobre os rendimentos; no PGBL, sobre o valor total resgatado."
      }
    ],
    "resposta": "D",
    "feedback": "Como as contribuições do PGBL foram deduzidas antes, o IR incide sobre tudo no resgate. No VGBL, só o ganho é tributado."
  },
  {
    "id": "wm-medio-45",
    "areaId": "wealth-management",
    "nivel": "medio",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma cliente pergunta se deve criar uma holding patrimonial. Qual resposta é adequada?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Sempre, pois holding elimina impostos."
      },
      {
        "letra": "B",
        "texto": "Nunca, pois é ilegal."
      },
      {
        "letra": "C",
        "texto": "Pode ajudar na gestão e na sucessão, mas tem custos e efeitos tributários que precisam ser avaliados caso a caso."
      },
      {
        "letra": "D",
        "texto": "Só se ela tiver mais de dez imóveis."
      }
    ],
    "resposta": "C",
    "feedback": "Holdings podem organizar a sucessão e a governança, mas não são automaticamente vantajosas. Contabilidade, impostos e manutenção precisam entrar na conta."
  },
  {
    "id": "wm-dificil-46",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma cliente tem R$ 10 milhões e herdeiros necessários. Qual é o valor máximo que ela pode destinar por testamento a quem quiser?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "R$ 5 milhões."
      },
      {
        "letra": "B",
        "texto": "R$ 10 milhões."
      },
      {
        "letra": "C",
        "texto": "R$ 2,5 milhões."
      },
      {
        "letra": "D",
        "texto": "Nenhum valor."
      }
    ],
    "resposta": "A",
    "feedback": "Metade do patrimônio é a legítima, reservada aos herdeiros necessários. A outra metade, R$ 5 milhões, é a parte disponível."
  },
  {
    "id": "wm-dificil-47",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma cliente de renda alta vai contribuir para previdência e resgatar daqui a 15 anos. Qual regime de tributação tende a ser mais vantajoso?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Progressivo, porque permite compensações."
      },
      {
        "letra": "B",
        "texto": "Regressivo, cuja alíquota cai até 10% após dez anos."
      },
      {
        "letra": "C",
        "texto": "Tanto faz, as alíquotas são iguais."
      },
      {
        "letra": "D",
        "texto": "Progressivo, porque a alíquota máxima é 10%."
      }
    ],
    "resposta": "B",
    "feedback": "No regime regressivo, a alíquota cai com o tempo de cada contribuição, chegando a 10% após dez anos. Para prazos longos e renda alta, tende a ser melhor."
  },
  {
    "id": "wm-dificil-48",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma cliente recebe R$ 900 mil por ano em dividendos, pagos em parcelas mensais acima de R$ 50 mil. Pelas regras de 2026, o que é correto?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Os dividendos continuam integralmente isentos."
      },
      {
        "letra": "B",
        "texto": "A retenção mensal de 10% é sempre o imposto definitivo."
      },
      {
        "letra": "C",
        "texto": "Só há imposto se ela vender as ações."
      },
      {
        "letra": "D",
        "texto": "Ela pode estar sujeita à tributação mínima anual, e as retenções mensais contam como antecipação."
      }
    ],
    "resposta": "D",
    "feedback": "Desde 2026, rendas anuais acima de R$ 600 mil podem ficar sujeitas a uma tributação mínima. A retenção de 10% é antecipada e acertada na declaração."
  },
  {
    "id": "wm-dificil-49",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "O que caracteriza uma doação de imóvel com reserva de usufruto?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "A doadora perde imediatamente o direito de morar no imóvel."
      },
      {
        "letra": "B",
        "texto": "Não há incidência de imposto em nenhuma hipótese."
      },
      {
        "letra": "C",
        "texto": "Os herdeiros recebem a nua-propriedade, e a doadora mantém o direito de usar o imóvel ou receber sua renda."
      },
      {
        "letra": "D",
        "texto": "A doação pode ser desfeita livremente pela doadora."
      }
    ],
    "resposta": "C",
    "feedback": "O usufruto separa propriedade e uso. Os herdeiros já são donos, mas a doadora continua morando ou recebendo aluguéis enquanto o usufruto durar."
  },
  {
    "id": "wm-dificil-50",
    "areaId": "wealth-management",
    "nivel": "dificil",
    "tema": "Tributação, previdência e sucessão",
    "enunciado": "Uma cliente quer mover R$ 3 milhões para LCAs de um único banco para não pagar IR. Qual é a melhor orientação inicial?",
    "opcoes": [
      {
        "letra": "A",
        "texto": "Comparar retorno líquido, risco do emissor, limite do FGC, prazo e liquidez antes de decidir."
      },
      {
        "letra": "B",
        "texto": "Seguir, pois isenção sempre compensa."
      },
      {
        "letra": "C",
        "texto": "Proibir, pois LCAs são arriscadas."
      },
      {
        "letra": "D",
        "texto": "Dividir igualmente entre LCA e poupança."
      }
    ],
    "resposta": "A",
    "feedback": "A isenção é só uma parte da decisão. R$ 3 milhões em um banco ultrapassam muito o limite do FGC, e prazos de carência podem conflitar com a liquidez necessária."
  }
]
