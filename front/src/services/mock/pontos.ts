import type { EventoPontos, PontosService, SaldoENivel } from '../contratos.ts'
import { NIVEIS, REGRAS_DE_PONTOS, type IdRegra } from './dados/config.ts'
import { DIA } from './datas.ts'
import { executar, executarLogada, novoId, ok } from './store.ts'
import type { EstadoMock, EventoRegistrado } from './tipos.ts'


/**
 * Concede pontos. É a ÚNICA porta de entrada de pontos: só o servidor chama.
 * Devolve `null` quando a mesma chave já concedeu pontos (idempotência).
 */
export function conceder(
  estado: EstadoMock,
  usuarioId: string,
  regra: IdRegra,
  origem: string,
  agora: Date,
  opcoes: { chave?: string; pontos?: number; acao?: string } = {},
): EventoPontos | null {
  const chave = opcoes.chave ?? regra
  if (estado.eventos.some(e => e.usuarioId === usuarioId && e.chave === chave)) return null
  const registro: EventoRegistrado = {
    id: novoId('ev'),
    usuarioId,
    chave,
    acao: opcoes.acao ?? REGRAS_DE_PONTOS[regra].acao,
    origem,
    data: agora.toISOString(),
    pontos: opcoes.pontos ?? REGRAS_DE_PONTOS[regra].pontos,
  }
  estado.eventos.push(registro)
  return publico(registro)
}

const publico = ({ id, acao, origem, data, pontos }: EventoRegistrado): EventoPontos => ({ id, acao, origem, data, pontos })

export function calcularSaldo(estado: EstadoMock, usuarioId: string): SaldoENivel {
  const saldo = estado.eventos.filter(e => e.usuarioId === usuarioId).reduce((s, e) => s + e.pontos, 0)
  const atual = [...NIVEIS].reverse().find(n => saldo >= n.pontosNecessarios) ?? NIVEIS[0]
  const proximo = NIVEIS.find(n => n.numero === atual.numero + 1) ?? null
  const faixa = proximo ? proximo.pontosNecessarios - atual.pontosNecessarios : 0
  return {
    saldo,
    nivel: atual,
    proximoNivel: proximo,
    faltam: proximo ? proximo.pontosNecessarios - saldo : 0,
    progresso: proximo ? Math.min(1, (saldo - atual.pontosNecessarios) / faixa) : 1,
  }
}

export const pontosService: PontosService = {
  obterSaldoENivel: () => executarLogada(({ estado, usuario }) => ok(calcularSaldo(estado, usuario.id))),

  listarExtrato: filtro =>
    executarLogada(({ estado, usuario, agora }) => {
      const limite = filtro?.dias ? agora.getTime() - filtro.dias * DIA : null
      const eventos = estado.eventos
        .filter(e => e.usuarioId === usuario.id && (limite === null || new Date(e.data).getTime() >= limite))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .map(publico)
      return ok(eventos)
    }),

  listarRegrasDePontos: () => executar({}, () => ok(Object.values(REGRAS_DE_PONTOS))),
}
