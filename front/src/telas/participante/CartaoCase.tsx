import { definirCaseAtual, go } from '../../app/rotas'
import { Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import type { EstadoCaseTrilha, ItemTrilha } from '../../services'

const ESTADOS: Record<EstadoCaseTrilha, { rotulo: string; tom: 'blue' | 'pink' | 'green' | 'yellow' | 'gray' }> = {
  bloqueado: { rotulo: 'Bloqueado', tom: 'gray' },
  disponivel: { rotulo: 'Disponível', tom: 'blue' },
  em_andamento: { rotulo: 'Em andamento', tom: 'pink' },
  em_avaliacao: { rotulo: 'Em avaliação', tom: 'yellow' },
  concluido: { rotulo: 'Concluído', tom: 'green' },
}

/** Um case da ilha: nível, estado, progresso e as ações. */
export function CartaoCase({
  item,
  confirmando,
  ocupado,
  aoPedirConfirmacao,
  aoConfirmar,
  aoCancelar,
}: {
  item: ItemTrilha
  confirmando: boolean
  ocupado: boolean
  aoPedirConfirmacao: () => void
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  const estado = ESTADOS[item.estado]
  const porcentagem = item.progresso.total ? (item.progresso.concluidos / item.progresso.total) * 100 : 0
  const comecou = item.progresso.concluidos > 0
  const bloqueado = item.estado === 'bloqueado'
  const abrir = () => {
    definirCaseAtual(item.caseId)
    go('case')
  }

  return (
    <article className={`trilha-card trilha-${item.estado} ${item.sugerido ? 'trilha-sugerido' : ''}`} aria-labelledby={`case-${item.caseId}`}>
      <div className="trilha-etiquetas">
        <Tag tone="blue">{item.nivel === 'basico' ? 'CASE BÁSICO' : 'CASE AVANÇADO'}</Tag>
        {item.sugerido && <Tag tone="pink">COMECE POR AQUI</Tag>}
        <span className="trilha-estado"><Tag tone={estado.tom}>{estado.rotulo.toUpperCase()}</Tag></span>
      </div>
      <h3 id={`case-${item.caseId}`}>{item.titulo}</h3>
      <p className="trilha-resumo">{item.resumo}</p>

      {bloqueado && <p className="trilha-aviso"><Icon name="lock" size={16} /> {item.motivoBloqueio}</p>}
      {item.estado === 'disponivel' && item.refazer && (
        <p className="trilha-aviso"><Icon name="spark" size={16} /> Você pode refazer este case. Seus pontos já ganhos ficam guardados.</p>
      )}

      {!bloqueado && (
        <div className="trilha-progresso">
          <Progress value={porcentagem} />
          <span>{item.progresso.concluidos} de {item.progresso.total} checkpoints</span>
        </div>
      )}

      {confirmando ? (
        <div className="trilha-confirmacao" role="alertdialog" aria-label="Confirmar o início do case">
          <p><strong>Começar este case?</strong> Quem começa termina: seu progresso fica salvo e não há prazo.</p>
          <div className="trilha-acoes">
            <Button onClick={aoConfirmar} disabled={ocupado}>{ocupado ? 'Começando…' : 'Começar'}</Button>
            <Button variant="ghost" onClick={aoCancelar} disabled={ocupado}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="trilha-acoes">
          {item.estado === 'disponivel' && <Button onClick={aoPedirConfirmacao}>{item.refazer ? 'Refazer este case' : comecou ? 'Retomar este case' : 'Começar este case'}</Button>}
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
