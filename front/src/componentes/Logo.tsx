import { go } from '../app/rotas'

export function Logo({ light = false }: { light?: boolean }) {
  return <button className={`logo ${light ? 'logo-light' : ''}`} onClick={() => go('landing')} aria-label="Galapagos por Elas, página inicial">
    <span className="logo-mark"><span /></span>
    <span>Galapagos<br/><strong>por Elas</strong></span>
  </button>
}
