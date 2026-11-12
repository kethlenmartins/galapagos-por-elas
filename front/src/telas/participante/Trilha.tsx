import { useCallback, useEffect, useState } from 'react'
import './trilha.css'
import { definirIlhaAtual, go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Progress, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { CaminhoDeBolinhas, type NoDoCaminho } from '../../componentes/CaminhoDeBolinhas'
import { AppShell } from '../../componentes/Layout'
import { caseService, catalogoService, type Area, type ItemTrilha, type TrilhaDaUsuaria } from '../../services'

type IlhaDaArea = { area: Area; cases: ItemTrilha[]; posicao: number | null }

/** As áreas que têm case publicado, da que mais combina com ela para a que menos combina. */
function agruparIlhas(areas: Area[], trilha: TrilhaDaUsuaria): IlhaDaArea[] {
  return areas
    .map(area => {
      const cases = trilha.cases.filter(c => c.areaId === area.id).sort((a, b) => a.ordem - b.ordem)
      return { area, cases, posicao: cases[0]?.posicaoNoFit ?? null }
    })
    .filter(i => i.cases.length > 0)
    .sort((a, b) => (a.posicao ?? 999) - (b.posicao ?? 999) || a.area.nome.localeCompare(b.area.nome))
}

/** O resumo da ilha para quem olha o mapa: o que ela já fez e o que vem a seguir. */
function situacao(cases: ItemTrilha[]): { estado: 'concluido' | 'em_andamento' | 'disponivel'; rotulo: string; tom: 'green' | 'pink' | 'blue' } {
  if (cases.every(c => c.estado === 'concluido')) return { estado: 'concluido', rotulo: 'CONCLUÍDA', tom: 'green' }
  if (cases.some(c => c.estado === 'em_andamento' || c.estado === 'em_avaliacao')) return { estado: 'em_andamento', rotulo: 'EM ANDAMENTO', tom: 'pink' }
  return { estado: 'disponivel', rotulo: 'PARA EXPLORAR', tom: 'blue' }
}

export function Trilha() {
  const [trilha, setTrilha] = useState<TrilhaDaUsuaria | null>(null)
  const [ilhas, setIlhas] = useState<IlhaDaArea[]>([])
  const [fase, setFase] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [escolhida, setEscolhida] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const [t, a] = await Promise.all([caseService.obterTrilha(), catalogoService.listarAreas()])
    const falha = t.erro ?? a.erro
    if (falha || !t.dados || !a.dados) {
      if (falha && sessaoExpirou(falha)) return
      setMensagem(falha?.mensagem ?? 'Não foi possível carregar as ilhas.')
      return setFase('erro')
    }
    setTrilha(t.dados)
    setIlhas(agruparIlhas(a.dados, t.dados))
    setFase('ok')
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const entrar = (areaId: string) => {
    definirIlhaAtual(areaId)
    go('island')
  }

  // Cada ilha é uma bolinha: preenchida quando todos os cases estão concluídos, destacada quando em andamento.
  const estadoDaIlha = (i: IlhaDaArea): NoDoCaminho['estado'] => {
    if (!trilha?.diagnosticoConcluido) return 'bloqueado'
    const s = situacao(i.cases).estado
    return s === 'concluido' ? 'feito' : s === 'em_andamento' || i.cases.some(c => c.sugerido) ? 'atual' : 'aberto'
  }
  const nos: NoDoCaminho[] = ilhas.map(i => ({
    id: i.area.id,
    rotulo: i.area.nome,
    detalhe: `${i.cases.filter(c => c.estado === 'concluido').length} de ${i.cases.length} ${i.cases.length === 1 ? 'case' : 'cases'}`,
    estado: estadoDaIlha(i),
    emblema: <svg viewBox="0 0 120 90" width="40" height="30" aria-hidden="true"><path className="ilha-terra" d="M14 58C10 40 26 22 46 24c8-14 30-14 38 2 18-2 30 14 22 32-10 8-28 10-46 10S22 66 14 58z"/><path className="ilha-copa" d="M52 40c-2-10 8-18 16-12 8-6 18 4 12 12-4 6-24 8-28 0z"/></svg>,
    progresso: (i.cases.filter(c => c.estado === 'concluido').length / i.cases.length) * 100,
  }))
  const escolhidaEfetiva = escolhida ?? nos.find(n => n.estado === 'atual')?.id ?? nos.find(n => n.estado !== 'bloqueado')?.id ?? null
  const detalheDaIlha = (no: NoDoCaminho) => {
    const i = ilhas.find(x => x.area.id === no.id)
    if (!i) return null
    const s = situacao(i.cases)
    return <article className={`trilha-card trilha-${s.estado}`}>
      <div className="trilha-etiquetas">
        {i.posicao !== null && i.posicao <= 3 && <Tag tone="blue">{i.posicao === 1 ? 'MAIOR AFINIDADE' : `${i.posicao}ª AFINIDADE`}</Tag>}
        {i.cases.some(c => c.sugerido) && <Tag tone="pink">COMECE POR AQUI</Tag>}
        <span className="trilha-estado"><Tag tone={s.tom}>{s.rotulo}</Tag></span>
      </div>
      <h2>{i.area.nome}</h2>
      <p className="trilha-resumo">{i.area.oQueFaz}</p>
      {no.estado === 'bloqueado' && <p className="trilha-aviso"><Icon name="lock" size={16} /> Faça o diagnóstico para abrir as ilhas.</p>}
      <div className="trilha-acoes">
        <Button onClick={() => entrar(i.area.id)} icon="arrow" disabled={no.estado === 'bloqueado'}>{s.estado === 'em_andamento' ? 'Continuar na ilha' : 'Entrar na ilha'}</Button>
      </div>
    </article>
  }

  const concluidas = ilhas.filter(i => i.cases.every(c => c.estado === 'concluido')).length

  return <AppShell route="trail"><div className="trilha-page">
    <PageTitle eyebrow="SEU ARQUIPÉLAGO" title="Ilhas" subtitle="Cada área é uma ilha, com a apresentação da área, um case básico, cases avançados e treino de entrevista. Entre pela que mais combina com você." />

    {fase === 'carregando' && <p role="status" className="diagnostico-estado">Carregando as ilhas…</p>}
    {fase === 'erro' && <div className="alert alert-error" role="alert"><p>{mensagem}</p></div>}

    {fase === 'ok' && trilha && <>
      {!trilha.diagnosticoConcluido && (
        <div className="alert alert-warning" role="note">
          <p>{trilha.motivoNaoPodeEscolher} <button className="text-link" onClick={() => go('diagnostic')}>Fazer o diagnóstico</button></p>
        </div>
      )}

      {ilhas.length > 0 && (
        <section className="trilha-resumo-topo" aria-label="Seu avanço no arquipélago">
          <strong>{concluidas} de {ilhas.length} ilhas concluídas</strong>
          <Progress value={(concluidas / ilhas.length) * 100} pink />
          <p>Em cada ilha, comece pelo case básico: ele abre os cases avançados e o treino de entrevista.</p>
        </section>
      )}

      {ilhas.length === 0
        ? <div className="empty-state"><span><Icon name="case" size={34} /></span><h2>Ainda não há ilhas publicadas</h2><p>Assim que a equipe publicar o primeiro case, a ilha da área aparece aqui.</p></div>
        : <CaminhoDeBolinhas rotuloDaLista="Ilhas, uma por área" nos={nos} escolhido={escolhidaEfetiva} aoEscolher={setEscolhida} detalhe={detalheDaIlha}/>}
    </>}
  </div></AppShell>
}
