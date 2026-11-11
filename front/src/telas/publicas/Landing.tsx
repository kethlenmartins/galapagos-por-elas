import { go } from '../../app/rotas'
import { useSessao } from '../../app/sessao'
import { Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { PublicHeader } from '../../componentes/Layout'
import { Logo } from '../../componentes/Logo'

export function Landing() {
  const { sessao } = useSessao()
  /** Quem já entrou não deve voltar ao cadastro: o próximo passo é o diagnóstico. */
  const iniciarJornada = () => go(sessao ? 'diagnostic' : 'signup')
  const steps = [
    ['01', 'Descubra seu caminho', 'Um diagnóstico rápido mostra as áreas que mais combinam com você.'],
    ['02', 'Resolva um case real', 'Toda semana, um novo desafio para aprender fazendo.'],
    ['03', 'Aprenda no seu ritmo', 'Conteúdos claros apoiam você em cada etapa.'],
    ['04', 'Mostre sua conquista', 'Conclua o case e receba um certificado oficial.'],
  ]
  return <div className="landing">
    <PublicHeader/>
    <main>
      <section className="hero">
        <div className="hero-blob blob-one" aria-hidden="true"/><div className="hero-blob blob-two" aria-hidden="true"/>
        <div className="hero-copy"><Tag tone="pink">CARREIRA NO MERCADO FINANCEIRO</Tag><h1>Seu lugar no mercado financeiro <em>começa aqui.</em></h1><p>Descubra seu potencial, pratique com cases reais e avance na carreira com confiança.</p><div className="hero-actions"><Button onClick={iniciarJornada} icon="arrow">{sessao ? 'Fazer o diagnóstico' : 'Quero participar'}</Button><button className="text-link" onClick={() => document.getElementById('como')?.scrollIntoView({ behavior: 'smooth' })}>Ver como funciona <Icon name="chevron" size={16}/></button></div><div className="hero-proof"><span className="people-dots"><i>MC</i><i>LS</i><i>+</i></span><span><strong>Feito para mulheres</strong><br/>que querem transformar o futuro</span></div></div>
        <div className="hero-visual" aria-label="Exemplo ilustrativo da plataforma">
          <div className="mock-card mock-result"><span className="mini-label">SEU MELHOR MATCH</span><span className="match-ring"><strong>87%</strong><small>match</small></span><h3>Investimentos</h3><p>Estratégia e visão de futuro são seu forte.</p></div>
          <div className="float-pill float-points"><Icon name="spark"/><span><strong>+100</strong><small>pontos</small></span></div>
          <div className="float-pill float-case"><Icon name="case"/><span><small>CASE DA SEMANA</small><strong>3 de 4 etapas</strong></span></div>
        </div>
      </section>
      <section className="trust-strip"><span>APRENDA NA PRÁTICA</span><span>•</span><span>DESCUBRA SEU POTENCIAL</span><span>•</span><span>CONSTRUA SEU FUTURO</span></section>
      <section className="section" id="como"><div className="section-heading"><span className="eyebrow">SUA JORNADA</span><h2>Um caminho claro para você avançar</h2><p>Da descoberta ao certificado, cada passo foi pensado para aproximar você do mercado.</p></div><div className="steps-grid">{steps.map(([n,t,d]) => <article className="step-card" key={n}><span className="step-number">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
      <section className="points-section"><div><span className="eyebrow eyebrow-light">SEU PROGRESSO CONTA</span><h2>Ganhe pontos a cada passo da sua jornada</h2><p>Aprender, praticar e concluir desafios faz você avançar de nível. Sem competição — aqui, seu progresso é com você mesma.</p><Button variant="secondary" onClick={iniciarJornada}>{sessao ? 'Fazer o diagnóstico' : 'Começar minha jornada'}</Button></div><div className="level-preview"><div className="level-preview-top"><span><small>NÍVEL ATUAL</small><strong>3 · Analista</strong></span><b>320 <small>pts</small></b></div><Progress value={53} pink/><p><span>Exploradora</span><span>Aprendiz</span><strong>Analista</strong><span>Estrategista</span></p></div></section>
      <section className="case-preview section"><div className="case-preview-copy"><span className="eyebrow">APRENDA FAZENDO</span><h2>Um desafio real.<br/>Toda semana.</h2><p>Cases inspirados no dia a dia do mercado para você desenvolver habilidades que fazem diferença.</p><ul><li><Icon name="check"/> Checkpoints que guiam seu raciocínio</li><li><Icon name="check"/> Conteúdos de apoio sem jargão</li><li><Icon name="check"/> Feedback para continuar evoluindo</li></ul></div><div className="case-big-card"><div className="case-card-head"><Tag>INVESTIMENTOS</Tag><span><Icon name="clock" size={17}/> 2d 14h restantes</span></div><h3>Avaliando uma empresa para investir</h3><p>Analise os dados e construa uma recomendação de investimento.</p><div className="case-stat"><span>Seu progresso</span><strong>3 de 4 etapas</strong></div><Progress value={75}/><Button onClick={iniciarJornada}>{sessao ? 'Fazer o diagnóstico' : 'Quero encarar este case'}</Button></div></section>
      <section className="faq section"><div className="section-heading"><span className="eyebrow">DÚVIDAS</span><h2>Perguntas frequentes</h2></div>{['Preciso entender de finanças para começar?', 'A participação é gratuita?', 'Quanto tempo tenho para concluir um case?', 'Como funciona o certificado?'].map((q,i) => <details key={q} open={i===0}><summary>{q}<Icon name="plus"/></summary><p>{i===0 ? 'Não. O diagnóstico entende seu momento e os conteúdos explicam cada conceito de forma simples. Você aprende no seu ritmo.' : 'Você encontra todas as informações e regras dentro da plataforma, de forma clara antes de começar.'}</p></details>)}</section>
      <section className="final-cta"><div className="cta-blob" aria-hidden="true"/><h2>O mercado financeiro também é seu lugar.</h2><p>Comece hoje a construir o caminho que combina com você.</p><Button variant="secondary" onClick={iniciarJornada} icon="arrow">{sessao ? 'Fazer o diagnóstico' : 'Quero participar'}</Button></section>
    </main>
    <footer><Logo light/><p>Uma iniciativa para aproximar mulheres do mercado financeiro.</p><nav><button onClick={() => go('validate')}>Validar certificado</button><button onClick={() => go('terms')}>Termos</button><button onClick={() => go('privacy')}>Privacidade</button></nav><small>© 2026 Galapagos por Elas</small></footer>
  </div>
}
