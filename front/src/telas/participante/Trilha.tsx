import { useCallback, useEffect, useState } from 'react'
import './trilha.css'
import { faixaDaSemana, dataEHora } from '../../app/formatos'
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

function CartaoCase({
  item,
  podeEscolher,
  motivo,
  confirmando,
  ocupado,
  aoPedirConfirmacao,
  aoConfirmar,
  aoCancelar,
}: {
  item: ItemTrilha
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
  const abrir = () => {
    definirCaseAtual(item.caseId)
    go('case')
  }

  return (
    <article className={`trilha-card trilha-${item.estado} ${item.sugerido ? 'trilha-sugerido' : ''}`}>
      <div className="trilha-etiquetas">
        <Tag tone="blue">{item.area.toUpperCase()}</Tag>
        {item.sugerido && <Tag tone="pink">COMECE POR AQUI</Tag>}
        {item.noTop3 && item.posicaoNoFit && <Tag tone="gray">{item.posicaoNoFit}º NO SEU DIAGNÓSTICO</Tag>}
        <span className="trilha-estado"><Tag tone={estado.tom}>{estado.rotulo.toUpperCase()}</Tag></span>
      </div>
      <h2>{item.titulo}</h2>
      <p className="trilha-resumo">{item.resumo}</p>

      {item.estado === 'bloqueado' && (
        <p className="trilha-aviso"><Icon name="lock" size={16} /> {item.motivoBloqueio}</p>
      )}
      {item.estado === 'em_andamento' && item.prazoEm && (
        <p className="trilha-aviso trilha-prazo"><Icon name="clock" size={16} /> Prazo: {dataEHora(item.prazoEm)}</p>
      )}
      {item.estado === 'disponivel' && item.refazer && (
        <p className="trilha-aviso trilha-prazo"><Icon name="spark" size={16} /> Você pode refazer este case. Seus pontos já ganhos ficam guardados.</p>
      )}
      {item.estado === 'disponivel' && comecou && !item.refazer && (
        <p className="trilha-aviso"><Icon name="clock" size={16} /> O prazo anterior passou, mas seu progresso foi mantido.</p>
      )}

      {item.estado !== 'bloqueado' && (
        <div className="trilha-progresso">
          <Progress value={porcentagem} />
          <span>{item.progresso.concluidos} de {item.progresso.total} checkpoints</span>
        </div>
      )}

      {confirmando ? (
        <div className="trilha-confirmacao" role="alertdialog" aria-label="Confirmar a escolha do case">
          <p><strong>Escolher este case para a semana?</strong> Você só pode ter um case por semana, e o prazo começa a contar agora. O seu progresso fica salvo.</p>
          <div className="trilha-acoes">
            <Button onClick={aoConfirmar} disabled={ocupado}>{ocupado ? 'Escolhendo…' : 'Confirmar escolha'}</Button>
            <Button variant="ghost" onClick={aoCancelar} disabled={ocupado}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="trilha-acoes">
          {item.estado === 'disponivel' && (
            <>
              <Button onClick={aoPedirConfirmacao} disabled={!podeEscolher}>{item.refazer ? 'Refazer este case' : comecou ? 'Retomar este case' : 'Escolher este case'}</Button>
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

  return <AppShell route="trail"><div className="trilha-page">
    <PageTitle eyebrow="SUA TRILHA" title="Escolha o case da semana" subtitle="Cada case te leva a viver o trabalho de uma área e termina em um certificado. Você faz um por semana." />

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando a sua trilha…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && trilha && <>
      <section className="trilha-semana">
        <span className="round-icon"><Icon name="calendar" size={24} /></span>
        <div>
          <strong>Semana de {faixaDaSemana(trilha.semana.inicioEm, trilha.semana.fimEm)}</strong>
          <p>Os cases abrem na segunda-feira e fecham na sexta, às 23h59. Se você escolher de quarta a domingo, o prazo vai até a sexta da semana seguinte.</p>
        </div>
      </section>

      {!trilha.diagnosticoConcluido && (
        <div className="alert alert-warning" role="note">
          <p>{trilha.motivoNaoPodeEscolher} <button className="text-link" onClick={() => go('diagnostic')}>Fazer o diagnóstico</button></p>
        </div>
      )}
      {trilha.diagnosticoConcluido && !trilha.podeEscolher && trilha.motivoNaoPodeEscolher && (
        <div className="alert alert-warning" role="note"><p>{trilha.motivoNaoPodeEscolher}</p></div>
      )}
      {erroDaAcao && <div className="alert alert-error" role="alert"><p>{erroDaAcao}</p></div>}

      {trilha.diagnosticoConcluido && !trilha.primeiroCaseConcluido && !trilha.cases.some(c => c.progresso.concluidos > 0 || c.estado === 'em_andamento' || c.estado === 'em_avaliacao') && (
        <p className="trilha-dica">Para o seu primeiro case, mostramos as áreas do seu diagnóstico. Qualquer uma delas é um bom começo: depois do seu primeiro certificado, todas as áreas abrem.</p>
      )}

      {trilha.cases.length === 0
        ? <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Ainda não há cases publicados</h2><p>Assim que a equipe publicar o primeiro case, ele aparece aqui.</p></div>
        : <div className="trilha-lista">
            {trilha.cases.map(item => (
              <CartaoCase
                key={item.caseId}
                item={item}
                podeEscolher={trilha.podeEscolher}
                motivo={trilha.motivoNaoPodeEscolher}
                confirmando={confirmando === item.caseId}
                ocupado={ocupado}
                aoPedirConfirmacao={() => { setErroDaAcao(''); setConfirmando(item.caseId) }}
                aoConfirmar={() => escolher(item.caseId)}
                aoCancelar={() => setConfirmando(null)}
              />
            ))}
          </div>}
    </>}
  </div></AppShell>
}
