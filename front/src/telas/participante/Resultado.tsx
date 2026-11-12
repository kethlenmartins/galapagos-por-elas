import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import './mapa.css'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { Progress } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { IndicadorBipolar } from '../../componentes/IndicadorBipolar'
import { AppShell } from '../../componentes/Layout'
import { diagnosticoService, type AfinidadeArea, type CaracteristicaArea, type DiferencaArea, type ResultadoDiagnostico } from '../../services'

type Aba = 'perfil' | 'trabalho' | 'areas'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'perfil', rotulo: '1. Perfil' },
  { id: 'trabalho', rotulo: '2. Trabalho' },
  { id: 'areas', rotulo: '3. Áreas' },
]

/** A partir de quantas respostas "as duas me interessam" o resultado fica menos distintivo. [SUPOSIÇÃO] */
const LIMITE_RESPOSTAS_C = 10
const TOP = 3

function ListaCaracteristicas({ itens }: { itens: CaracteristicaArea[] }) {
  if (itens.length === 0) return <p className="area-vazio">Nenhuma afinidade forte nesta camada.</p>
  return (
    <ul className="area-lista">
      {itens.map(c => (
        <li key={c.dimensaoId}>
          <span>{c.texto}</span>
          <small>{Math.round(c.similaridade)}%</small>
          <Progress value={c.similaridade} />
        </li>
      ))}
    </ul>
  )
}

function ListaDiferencas({ itens }: { itens: DiferencaArea[] }) {
  return (
    <ul className="area-diferencas">
      {itens.map(d => (
        <li key={d.dimensaoId}>
          <span><b>Na área:</b> {d.naArea}</span>
          <span><b>Para você:</b> {d.paraVoce}</span>
        </li>
      ))}
    </ul>
  )
}

function CartaoArea({ area, aberta, aoAlternar }: { area: AfinidadeArea; aberta: boolean; aoAlternar: () => void }) {
  const idDetalhe = `detalhe-${area.areaId}`
  const diferencas = [...area.diferencas.perfil, ...area.diferencas.trabalho]
  return (
    <article className={`area-card ${area.posicao <= TOP ? 'area-top' : ''}`}>
      <button className="area-cabecalho" aria-expanded={aberta} aria-controls={idDetalhe} onClick={aoAlternar}>
        <span className="area-posicao" aria-label={`Posição ${area.posicao}`}>{area.posicao}</span>
        <strong>{area.area}</strong>
        <span className="area-pontos">{area.pontuacao}%</span>
        <span className={`area-seta ${aberta ? 'aberta' : ''}`} aria-hidden="true"><Icon name="chevron" size={18} /></span>
      </button>
      <div className="area-barra"><Progress value={area.pontuacao} pink={area.posicao <= TOP} /></div>
      {aberta && (
        <div className="area-detalhe" id={idDetalhe}>
          <div className="area-colunas">
            <section className="area-coluna">
              <h4><Icon name="user" size={16} /> Perfil <small>(quem você é)</small></h4>
              <ListaCaracteristicas itens={area.afinidades.perfil} />
            </section>
            <section className="area-coluna">
              <h4><Icon name="settings" size={16} /> Trabalho <small>(como você prefere atuar)</small></h4>
              <ListaCaracteristicas itens={area.afinidades.trabalho} />
            </section>
          </div>
          <section className="area-porque">
            <h4><Icon name="spark" size={16} /> Por que combina?</h4>
            <p>{area.porQueCombina}</p>
          </section>
          <section className="area-porque area-explorar">
            <h4>Diferenças para explorar</h4>
            {diferencas.length > 0 ? <ListaDiferencas itens={diferencas} /> : <p>Sem diferenças relevantes nas dimensões mais importantes da área.</p>}
          </section>
        </div>
      )}
    </article>
  )
}

export function Resultado() {
  const [resultado, setResultado] = useState<ResultadoDiagnostico | null>(null)
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'vazio' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [aba, setAba] = useState<Aba>('perfil')
  const [aberta, setAberta] = useState<string | null>(null)
  const botoesDasAbas = useRef<Record<Aba, HTMLButtonElement | null>>({ perfil: null, trabalho: null, areas: null })

  useEffect(() => {
    let ativo = true
    diagnosticoService.obterResultadoDiagnostico().then(r => {
      if (!ativo) return
      if (r.erro) {
        if (r.erro.codigo === 'NAO_ENCONTRADO') return setEstado('vazio')
        if (sessaoExpirou(r.erro)) return
        setMensagem(r.erro.mensagem)
        return setEstado('erro')
      }
      setResultado(r.dados)
      setAberta(r.dados.areas[0]?.areaId ?? null)
      setEstado('ok')
    })
    return () => {
      ativo = false
    }
  }, [])

  const moverAba = (e: KeyboardEvent, atual: number) => {
    const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!passo) return
    e.preventDefault()
    const proxima = ABAS[(atual + passo + ABAS.length) % ABAS.length].id
    setAba(proxima)
    botoesDasAbas.current[proxima]?.focus()
  }

  return <AppShell route="match"><div className="mapa-page">
    {estado === 'carregando' && <p role="status" className="diagnostico-estado">Carregando o seu mapa…</p>}

    {estado === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {estado === 'vazio' && <section className="diagnostico-bloco">
      <span className="round-icon"><Icon name="chart" size={30} /></span>
      <h1>Seu Mapa de Carreira ainda não existe</h1>
      <p>Responda o diagnóstico para descobrir como você gosta de pensar e trabalhar e quais áreas explorar primeiro.</p>
      <div className="diagnostico-acoes diagnostico-acoes-centro"><Button onClick={() => go('diagnostic')}>Fazer o diagnóstico</Button></div>
    </section>}

    {estado === 'ok' && resultado && <>
      <header className="mapa-cabecalho">
        <span className="eyebrow eyebrow-light">DIAGNÓSTICO CONCLUÍDO</span>
        <h1>Seu Mapa de Carreira</h1>
        <p>Veja como você gosta de pensar e trabalhar e quais áreas explorar primeiro.</p>
      </header>

      <div className="mapa-abas" role="tablist" aria-label="Seções do seu mapa">
        {ABAS.map((a, i) => (
          <button
            key={a.id}
            id={`aba-${a.id}`}
            role="tab"
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            tabIndex={aba === a.id ? 0 : -1}
            ref={el => { botoesDasAbas.current[a.id] = el }}
            onClick={() => setAba(a.id)}
            onKeyDown={e => moverAba(e, i)}
          >{a.rotulo}</button>
        ))}
      </div>

      {(['perfil', 'trabalho'] as const).map(camada => aba === camada && (
        <section key={camada} className="mapa-painel" role="tabpanel" id={`painel-${camada}`} aria-labelledby={`aba-${camada}`}>
          <div>
            <h2>{camada === 'perfil' ? 'Quem é você?' : 'Como você prefere trabalhar?'}</h2>
            <p>{camada === 'perfil' ? 'Suas preferências de pensamento, interesses e motivações.' : 'Seu modo de trabalho ideal, considerando dinâmicas, autonomia, ritmo e exposição.'}</p>
          </div>
          {resultado.dimensoes.filter(d => d.camada === camada).map(d => (
            <IndicadorBipolar key={d.dimensaoId} polo0={d.polo0} polo100={d.polo100} valor={d.valor} />
          ))}
          <aside className="mapa-caixa">
            <h3><Icon name="spark" size={16} /> O que isso significa?</h3>
            <p>Esses indicadores mostram tendências relativas, não capacidades ou limitações. É possível ter interesse nos dois extremos de um mesmo eixo.</p>
          </aside>
          {camada === 'perfil'
            ? <div className="mapa-proximo"><Button variant="ghost" onClick={() => setAba('trabalho')}>Ver como você prefere trabalhar</Button></div>
            : <div className="mapa-proximo"><Button variant="ghost" onClick={() => setAba('areas')}>Ver as áreas</Button></div>}
        </section>
      ))}

      {aba === 'areas' && <section className="mapa-painel" role="tabpanel" id="painel-areas" aria-labelledby="aba-areas">
        <div>
          <h2>Onde você pode se encontrar?</h2>
          <p>Veja as áreas do mercado financeiro e a sua afinidade de 0% a 100%. Toque em uma área para entender por que ela combina com você.</p>
        </div>

        {resultado.respostasC >= LIMITE_RESPOSTAS_C && <div className="alert alert-warning" role="note">
          <p>Você marcou “as duas me interessam igualmente” em muitas perguntas. Isso é normal, mas deixa o resultado menos distintivo. <button className="text-link" onClick={() => go('diagnostic')}>Revisar minhas respostas</button></p>
        </div>}

        <h3 className="areas-titulo">Áreas para explorar primeiro</h3>
        {resultado.areas.slice(0, TOP).map(area => (
          <CartaoArea key={area.areaId} area={area} aberta={aberta === area.areaId} aoAlternar={() => setAberta(aberta === area.areaId ? null : area.areaId)} />
        ))}
        <p className="areas-nota">Pequenas mudanças nas respostas podem mudar a ordem das áreas.</p>

        <h3 className="areas-titulo">Outras áreas</h3>
        {resultado.areas.slice(TOP).map(area => (
          <CartaoArea key={area.areaId} area={area} aberta={aberta === area.areaId} aoAlternar={() => setAberta(aberta === area.areaId ? null : area.areaId)} />
        ))}
      </section>}

      <aside className="mapa-caixa mapa-importante">
        <h3><Icon name="lock" size={16} /> Importante</h3>
        <p>As pontuações indicam afinidade relativa, não uma recomendação única. Explore as áreas, converse com profissionais e experimente na prática para descobrir o que realmente faz sentido para você.</p>
        <small>Versões: questionário {resultado.versoes.questionario} · pontuação {resultado.versoes.scoring} · matriz {resultado.versoes.matriz}</small>
      </aside>

      <div className="diagnostico-acoes">
        <Button variant="ghost" onClick={() => go('diagnostic')}>Refazer diagnóstico</Button>
        <Button onClick={() => go('trail')}>Ver as ilhas</Button>
      </div>
    </>}
  </div></AppShell>
}
