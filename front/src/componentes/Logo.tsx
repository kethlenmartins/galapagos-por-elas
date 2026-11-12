import { go } from '../app/rotas'

export function Logo({ light = false, publica = false }: { light?: boolean; publica?: boolean }) {
  return <button className={`logo ${light ? 'logo-light' : ''}`} onClick={() => go(publica ? 'landing' : 'home')} aria-label={`Alumna, ${publica ? 'página inicial' : 'início da plataforma'}`}>
    <span className="logo-mark"><span /></span>
    <span><strong>Alumna</strong></span>
  </button>
}
