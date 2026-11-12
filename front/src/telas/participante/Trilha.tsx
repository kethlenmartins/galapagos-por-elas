import { useCallback, useEffect, useState } from 'react'
import './trilha.css'
import { definirCaseAtual, go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { caseService, type EstadoCaseTrilha, type ItemTrilha, type TrilhaDaUsuaria } from '../../services'

const ESTADOS: Record<EstadoCaseTrilha, { rotulo: string; tom: 'blue' | 'pink' | 'green' | 'yellow' | 'gray' }> = {
  bloqueado: { rotulo: 'Bloqueado', tom: 'gray' },
  disponivel: { rotulo: 'Disponível', tom: 'blue' },
  em_andamento: { rotulo: 'Em andamento', tom: 'pink' },
  em_avaliacao: { rotulo: 'Em avaliação', tom: 'yellow' },
  concluido: { rotulo: 'Concluído', tom: 'green' },
}

/** Uma ilha da trilha: número, estado e as ações do case. */
function Ilha({
  item,
  total,
  proxima,
  podeEscolher,
  motivo,
  confirmando,
  ocupado,
  aoPedirConfirmacao,
  aoConfirmar,
  aoCancelar,
}: {
  item: ItemTrilha
  total: number
  proxima: boolean
  podeEscolher: boolean
  motivo: string | null
  confirmando: boolean
  ocupado: boolean
  aoPedirConfirmacao: () => void
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  const estado = ESTADOS[item.estado]
  const porcentagem = item.progresso.total ? (item.progresso.concluidos / item.progresso.total) * 100 : 0
  const comecou = item.progresso.concluidos > 0
  const bloqueada = item.estado === 'bloqueado'
  const abrir = () => {
    definirCaseAtual(item.caseId)
    go('case')
  }

  return (
    <li className={`ilha ${item.ordem % 2 === 0 ? 'ilha-direita' : 'ilha-esquerda'}`}>
    <article className={`trilha-card trilha-${item.estado} ${proxima ? 'trilha-sugerido' : ''}`} aria-labelledby={`ilha-${item.caseId}`} aria-disabled={bloqueada || undefined}>
      <span className="ilha-forma" aria-hidden="true">
        <svg viewBox="0 0 120 90" width="96" height="72"><path className="ilha-agua" d="M6 66c14 12 34 16 54 16s40-4 54-16c-12 18-32 6-54 6S18 84 6 66z"/><path className="ilha-terra" d="M14 58C10 40 26 22 46 24c8-14 30-14 38 2 18-2 30 14 22 32-10 8-28 10-46 10S22 66 14 58z"/><path className="ilha-copa" d="M52 40c-2-10 8-18 16-12 8-6 18 4 12 12-4 6-24 8-28 0z"/></svg>
        <b>{bloqueada ? <Icon name="lock" size={20} /> : item.estado === 'concluido' ? <Icon name="check" size={22} /> : item.ordem}</b>
      </span>
      <div className="trilha-etiquetas">
        <Tag tone="blue">{`ILHA ${item.ordem} DE ${total}`}</Tag>
        <Tag tone="gray">{item.area.toUpperCase()}</Tag>
        {proxima && item.estado === 'disponivel' && <Tag tone="pink">COMECE POR AQUI</Tag>}
        <span className="trilha-estado"><Tag tone={estado.tom}>{estado.rotulo.toUpperCase()}</Tag></span>
      </div>
      <h2 id={`ilha-${item.caseId}`}>{item.titulo}</h2>
      <p className="trilha-resumo">{item.resumo}</p>

      {item.estado === 'bloqueado' && (
        <p className="trilha-aviso"><Icon name="lock" size={16} /> {item.motivoBloqueio}</p>
      )}
      {item.estado === 'disponivel' && item.refazer && (
        <p className="trilha-aviso"><Icon name="spark" size={16} /> Você pode refazer este case. Seus pontos já ganhos ficam guardados.</p>
      )}

      {item.estado !== 'bloqueado' && (
        <div className="trilha-progresso">
          <Progress value={porcentagem} />
          <span>{item.progresso.concluidos} de {item.progresso.total} checkpoints</span>
        </div>
      )}

      {confirmando ? (
        <div className="trilha-confirmacao" role="alertdialog" aria-label="Confirmar o início da ilha">
          <p><strong>Começar esta ilha?</strong> Você precisa terminá-la antes de começar outra. Seu progresso fica salvo.</p>
          <div className="trilha-acoes">
            <Button onClick={aoConfirmar} disabled={ocupado}>{ocupado ? 'Começando…' : 'Começar'}</Button>
            <Button variant="ghost" onClick={aoCancelar} disabled={ocupado}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="trilha-acoes">
          {item.estado === 'disponivel' && (
            <>
              <Button onClick={aoPedirConfirmacao} disabled={!podeEscolher}>{item.refazer ? 'Refazer este case' : comecou ? 'Retomar este case' : 'Começar esta ilha'}</Button>
              {!podeEscolher && motivo && <small className="trilha-motivo">{motivo}</small>}
            </>
          )}
          {item.estado === 'em_andamento' && <Button onClick={abrir} icon="arrow">Continuar</Button>}
          {item.estado === 'em_avaliacao' && <Button variant="ghost" onClick={abrir}>Ver o andamento</Button>}
          {item.estado === 'concluido' && (
            <>
              <Button onClick={() => go('certificates')} icon="award">Ver certificado</Button>
              <Button variant="ghost" onClick={abrir}>Ver o resultado</Button>
            </>
          )}
        </div>
      )}
    </article>
    </li>
  )
}

export function Trilha() {
  const [trilha, setTrilha] = useState<TrilhaDaUsuaria | null>(null)
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState('')

  const carregar = useCallback(async () => {
    const r = await caseService.obterTrilha()
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      setMensagem(r.erro.mensagem)
      return setFase('erro')
    }
    setTrilha(r.dados)
    setFase('ok')
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const escolher = async (caseId: string) => {
    setOcupado(true)
    setErroDaAcao('')
    const r = await caseService.escolherCase(caseId)
    setOcupado(false)
    if (r.erro) {
      if (sessaoExpirou(r.erro)) return
      setErroDaAcao(r.erro.mensagem)
      setConfirmando(null)
      return carregar()
    }
    definirCaseAtual(caseId)
    go('case')
  }

  const concluidas = trilha?.cases.filter(c => c.estado === 'concluido').length ?? 0

  return <AppShell route="trail"><div className="trilha-page">
    <PageTitle eyebrow="SUA TRILHA" title="Seu arquipélago" subtitle="Cada ilha é um case: você vive o trabalho de uma área e sai com um certificado. Siga a ordem, uma ilha por vez." />

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando a sua trilha…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && trilha && <>
      {!trilha.diagnosticoConcluido && (
        <div className="alert alert-warning" role="note">
          <p>{trilha.motivoNaoPodeEscolher} <button className="text-link" onClick={() => go('diagnostic')}>Fazer o diagnóstico</button></p>
        </div>
      )}
      {trilha.diagnosticoConcluido && !trilha.podeEscolher && trilha.motivoNaoPodeEscolher && (
        <div className="alert alert-warning" role="note"><p>{trilha.motivoNaoPodeEscolher}</p></div>
      )}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      {trilha.cases.length > 0 && (
        <section className="trilha-resumo-topo" aria-label="Seu avanço no arquipélago">
          <strong>{concluidas} de {trilha.cases.length} ilhas concluídas</strong>
          <Progress value={(concluidas / trilha.cases.length) * 100} pink />
          <p>As ilhas seguem uma ordem: cada uma só abre quando você conclui a anterior.</p>
        </section>
      )}

      {trilha.cases.length === 0
        ? <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Ainda não há cases publicados</h2><p>Assim que a equipe publicar o primeiro case, ele aparece aqui.</p></div>
        : <ol className="trilha-lista ilhas" aria-label="Ilhas da trilha, em ordem">
            {trilha.cases.map(item => (
              <Ilha
                key={item.caseId}
                item={item}
                total={trilha.cases.length}
                proxima={item.caseId === trilha.proximoCaseId && item.estado !== 'concluido' && item.estado !== 'bloqueado'}
                podeEscolher={trilha.podeEscolher}
                motivo={trilha.motivoNaoPodeEscolher}
                confirmando={confirmando === item.caseId}
                ocupado={ocupado}
                aoPedirConfirmacao={() => { setErroDaAcao(''); setConfirmando(item.caseId) }}
                aoConfirmar={() => escolher(item.caseId)}
                aoCancelar={() => setConfirmando(null)}
              />
            ))}
          </ol>}
    </>}
  </div></AppShell>
}
