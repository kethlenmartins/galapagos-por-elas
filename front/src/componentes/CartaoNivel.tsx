import { useEffect, useState } from 'react'
import { go } from '../app/rotas'
import { sessaoExpirou } from '../app/sessao'
import { pontosService, type SaldoENivel } from '../services'
import { Progress } from './Basicos'
import { EVENTO_PONTOS } from './Pontos'

/** Nível e saldo da usuária. Tudo vem do serviço: a tela não calcula nível nem pontos. */
export function LevelCard() {
  const [saldo, setSaldo] = useState<SaldoENivel | null>(null)

  useEffect(() => {
    let ativo = true
    const carregar = () => {
      pontosService.obterSaldoENivel().then(r => {
        if (!ativo) return
        if (r.erro) {
          sessaoExpirou(r.erro)
          return
        }
        setSaldo(r.dados)
      })
    }
    carregar()
    window.addEventListener(EVENTO_PONTOS, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO_PONTOS, carregar)
    }
  }, [])

  if (!saldo) return <section className="level-card" aria-busy="true"><div className="level-top"><div><span>SEU NÍVEL</span><h3>…</h3></div></div></section>

  return <section className="level-card">
    <div className="level-top"><div><span>SEU NÍVEL</span><h3>{saldo.nivel.numero} · {saldo.nivel.nome}</h3></div><div className="level-points"><strong>{saldo.saldo}</strong><span> pontos</span></div></div>
    <Progress value={Math.round(saldo.progresso * 100)} pink/>
    <div className="level-foot">
      <span>{saldo.proximoNivel ? `Próximo: ${saldo.proximoNivel.nome}` : 'Nível máximo'}</span>
      {saldo.proximoNivel && <strong>Faltam {saldo.faltam} pontos</strong>}
      <button onClick={() => go('points')}>Ver extrato →</button>
    </div>
  </section>
}
