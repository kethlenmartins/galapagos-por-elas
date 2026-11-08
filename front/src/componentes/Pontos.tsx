import { useEffect, useState } from 'react'
import { go } from '../app/rotas'
import { pontosService } from '../services'
import { Icon } from './Icone'

/** Evento disparado depois de uma ação que concede pontos, para o contador do topo atualizar. */
export const EVENTO_PONTOS = 'galapagos:pontos'
export const avisarPontos = () => window.dispatchEvent(new Event(EVENTO_PONTOS))

/** Contador de pontos do topo. Lê o saldo no serviço: a tela nunca soma pontos por conta própria. */
export function Pontos() {
  const [saldo, setSaldo] = useState<number | null>(null)

  useEffect(() => {
    let ativo = true
    const carregar = () => {
      pontosService.obterSaldoENivel().then(r => {
        if (ativo && r.dados) setSaldo(r.dados.saldo)
      })
    }
    carregar()
    window.addEventListener(EVENTO_PONTOS, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO_PONTOS, carregar)
    }
  }, [])

  return (
    <button className="points-pill" onClick={() => go('points')} aria-label={saldo === null ? 'Pontos' : `${saldo} pontos. Ver extrato`}>
      <Icon name="spark" size={17} />
      <strong>{saldo ?? '–'}</strong>
      <span>pts</span>
    </button>
  )
}
