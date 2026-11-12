import { go } from '../../app/rotas'
import { Tag } from '../../componentes/Basicos'
import { Icon } from '../../componentes/Icone'
import { PublicHeader } from '../../componentes/Layout'
import { Logo } from '../../componentes/Logo'

export const legalSections = {
  terms: [
    ['1. Sobre a plataforma', 'A Alumna oferece conteúdos educacionais, diagnósticos de afinidade e desafios práticos relacionados ao mercado financeiro. O uso da plataforma não representa recomendação de investimento ou promessa de emprego.'],
    ['2. Cadastro e acesso', 'Você é responsável por manter seus dados corretos e sua senha protegida. Contas de equipe são concedidas somente pela organização e possuem permissões administrativas específicas.'],
    ['3. Conteúdos e certificados', 'Os certificados registram a conclusão dos cases e podem ser validados publicamente pelo código. Os materiais são destinados ao aprendizado pessoal.'],
    ['4. Uso de inteligência artificial', 'Usamos inteligência artificial para apoiar conversas do diagnóstico, sugerir rascunhos de cases e apoiar correções. Decisões relevantes são revisadas pela equipe.'],
    ['5. Encerramento da conta', 'Você pode solicitar a exclusão da conta nas configurações. Algumas informações podem ser mantidas pelo período necessário para cumprir obrigações legais.'],
  ],
  privacy: [
    ['1. Dados que coletamos', 'Coletamos dados de cadastro, perfil, respostas ao diagnóstico, progresso nos cases, entregas e eventos de pontos necessários para oferecer a experiência da plataforma.'],
    ['2. Como usamos seus dados', 'Usamos os dados para personalizar sua jornada, salvar seu progresso, emitir certificados, proteger a plataforma e melhorar nossos conteúdos.'],
    ['3. Inteligência artificial', 'Não enviamos dados pessoais diretamente aos modelos de IA. As interações usam identificadores técnicos e os resultados passam por validações e revisão humana quando necessário.'],
    ['4. Seus direitos', 'Você pode solicitar acesso, correção, portabilidade ou exclusão de seus dados. Também pode retirar consentimentos opcionais a qualquer momento.'],
    ['5. Segurança e retenção', 'Aplicamos controles de acesso e mantemos cada informação somente pelo período necessário para as finalidades descritas e obrigações aplicáveis.'],
    ['6. Contato', 'Dúvidas e solicitações sobre privacidade podem ser enviadas pelo canal de atendimento indicado pela organização.'],
  ],
}

export function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const title = type === 'terms' ? 'Termos de uso' : 'Política de privacidade'
  const sections = legalSections[type]
  return <div className="legal-page"><PublicHeader/><main><div className="legal-heading"><Tag tone="yellow">TEXTO A SER REVISADO PELO JURÍDICO</Tag><h1>{title}</h1><p>Última atualização: 18 de março de 2026</p></div><div className="legal-layout"><aside><strong>Nesta página</strong>{sections.map(([heading],i) => <a key={heading} href={`#legal-${i}`}>{heading}</a>)}</aside><article>{sections.map(([heading,text],i) => <section id={`legal-${i}`} key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<div className="legal-contact"><Icon name="mail"/><div><strong>Precisa falar com a gente?</strong><p>Entre em contato para exercer seus direitos ou esclarecer dúvidas.</p></div></div></article></div></main><footer className="legal-footer"><Logo light/><button onClick={() => go(type === 'terms' ? 'privacy' : 'terms')}>{type === 'terms' ? 'Política de privacidade' : 'Termos de uso'}</button></footer></div>
}
