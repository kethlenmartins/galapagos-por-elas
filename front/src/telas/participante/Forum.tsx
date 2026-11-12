import { useCallback, useEffect, useRef, useState } from 'react'
import { go } from '../../app/rotas'
import { sessaoExpirou, useSessao } from '../../app/sessao'
import { AppShell } from '../../componentes/Layout'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { Tag } from '../../componentes/Basicos'
import { forumService, type CategoriaForum, type DetalhePostForum, type PostForum, type OrdemForum, type RespostaForum } from '../../services'

const regras = ['Respeite diferentes trajetórias e níveis de conhecimento.', 'Não compartilhe dados pessoais seus ou de outras pessoas.', 'Não publique gabaritos de cases, pedidos de dinheiro ou recomendações de investimento.']
const CATEGORIA_TEMA = 'tema-da-semana'
const tempo = (data: string) => `há ${Math.max(1, Math.floor((Date.now() - new Date(data).getTime()) / 3600000))} h`
const MSG_APELIDO = 'Antes de publicar, defina seu Nome de usuário no Perfil.'

/** O coração "Amei": um toque liga e desliga. */
function Amei({ ativo, total, aoClicar, rotulo = true }: { ativo: boolean; total: number; aoClicar: () => void; rotulo?: boolean }) {
  return <button type="button" className={`community-action community-amei ${ativo ? 'voted' : ''}`} onClick={aoClicar} aria-pressed={ativo} aria-label={`Amei, ${total} ${total === 1 ? 'pessoa amou' : 'pessoas amaram'}`}>
    <span className="community-coracao" aria-hidden="true">{ativo ? '♥' : '♡'}</span><strong>{total}</strong>{rotulo && <span>Amei</span>}
  </button>
}

export function Forum() {
  const { sessao } = useSessao()
  const equipe = sessao?.papel === 'equipe'
  const [categorias, setCategorias] = useState<CategoriaForum[]>([])
  const [posts, setPosts] = useState<PostForum[]>([])
  const [tema, setTema] = useState<PostForum | null>(null)
  const [categoria, setCategoria] = useState('')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<OrdemForum>('recentes')
  const [modo, setModo] = useState<null | 'conversa' | 'tema'>(null)
  const [conversa, setConversa] = useState<{ post: DetalhePostForum; focar: boolean } | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [encerrando, setEncerrando] = useState(false)

  const falhou = useCallback((mensagem: string) => setErro(mensagem), [])
  const carregar = async () => {
    const [c, p, t] = await Promise.all([
      forumService.listarCategorias(),
      forumService.listarPosts({ categoriaId: categoria || undefined, busca: busca || undefined, ordem }),
      forumService.listarPosts({ categoriaId: CATEGORIA_TEMA, ordem: 'recentes' }),
    ])
    if (c.dados) setCategorias(c.dados)
    setTema(t.dados?.[0] ?? null)
    if (p.dados) setPosts(p.dados)
    else if (p.erro && !sessaoExpirou(p.erro)) setErro(p.erro.mensagem ?? 'Não foi possível carregar a comunidade.')
  }
  useEffect(() => { carregar() }, [categoria, ordem]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Sem filtro de categoria, o tema da semana aparece só no destaque do topo (não repete no feed). */
  const feed = categoria === '' ? posts.filter(p => !p.oficial) : posts

  const abrir = async (id: string, focar = false) => {
    const r = await forumService.obterPost(id)
    if (r.dados) setConversa({ post: r.dados, focar })
    else falhou(r.erro?.mensagem ?? '')
  }
  const nova = async (tipo: 'conversa' | 'tema') => {
    if (tipo === 'conversa') {
      const p = await forumService.obterMeuPerfil()
      if (!p.dados) return falhou(MSG_APELIDO)
    }
    setModo(tipo)
  }

  /** Amei com resposta imediata: o coração muda na hora e volta atrás só se o servidor recusar. */
  const alternarAmei = async (alvo: 'post' | 'resposta', id: string) => {
    const virar = (p: PostForum): PostForum => (p.id === id ? { ...p, meuVoto: !p.meuVoto, uteis: p.uteis + (p.meuVoto ? -1 : 1) } : p)
    setPosts(l => l.map(virar))
    setTema(t => (t ? virar(t) : t))
    setConversa(c => (c ? { ...c, post: alvo === 'post' ? { ...c.post, ...virar(c.post) } : { ...c.post, respostasArvore: c.post.respostasArvore.map(r => (r.id === id ? { ...r, meuVoto: !r.meuVoto, uteis: r.uteis + (r.meuVoto ? -1 : 1) } : r)) } } : c))
    const r = await forumService.votar(alvo, id)
    if (r.erro) { if (!sessaoExpirou(r.erro)) falhou(r.erro.mensagem); await carregar() }
  }

  const encerrarTema = async () => {
    if (!tema) return
    const r = await forumService.encerrarTema(tema.id)
    setEncerrando(false)
    if (r.erro) return falhou(r.erro.mensagem)
    setAviso('Tema encerrado. Os comentários ficam guardados.')
    carregar()
  }

  return <AppShell route="forum"><div className="community-page">
    <header className="community-header"><span className="eyebrow">COMUNIDADE</span><h1>Comunidade</h1><p>Pergunte, compartilhe e encontre quem está construindo esse caminho com você.</p></header>
    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p>{erro.includes('Nome de usuário') && <button className="text-link" onClick={() => go('profile')}>Ir para o Perfil</button>}</div>}
    {aviso && <div className="alert alert-success" role="status"><p>{aviso}</p></div>}

    {tema
      ? <TemaDaSemana tema={tema} equipe={equipe} encerrando={encerrando}
          aoAmei={() => alternarAmei('post', tema.id)} aoAbrir={foco => abrir(tema.id, foco)}
          aoPublicarNovo={() => nova('tema')} aoPedirEncerrar={() => setEncerrando(true)} aoCancelarEncerrar={() => setEncerrando(false)} aoEncerrar={encerrarTema}
          aoComentado={mensagem => { setAviso(mensagem); carregar() }} aoFalhar={falhou}/>
      : equipe && <section className="community-tema community-tema-vazio" aria-label="Tema da semana">
          <span className="eyebrow">TEMA DA SEMANA</span>
          <h2>Nenhum tema publicado</h2>
          <p>Publique um tema para a comunidade conversar. Ele aparece em destaque no topo e as participantes comentam.</p>
          <Button onClick={() => nova('tema')} icon="plus">Publicar tema da semana</Button>
        </section>}

    <div className="community-layout"><main>
      <label className="community-search"><Icon name="search"/><input value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === 'Enter' && carregar()} placeholder="Buscar uma dúvida, assunto ou experiência" aria-label="Buscar na comunidade"/></label>
      <div className="community-chips"><button className={!categoria ? 'active' : ''} onClick={() => setCategoria('')}>Todos</button>{categorias.map(c => <button key={c.id} className={categoria === c.id ? 'active' : ''} onClick={() => setCategoria(c.id)}>{c.nome}</button>)}</div>
      <div className="community-tabs">{([['recentes', 'Recentes'], ['uteis', 'Em alta'], ['sem_resposta', 'Sem resposta']] as [OrdemForum, string][]).map(([id, texto]) => <button key={id} className={ordem === id ? 'active' : ''} onClick={() => setOrdem(id)}>{texto}</button>)}<span/><button>Minhas conversas</button><button>Salvas</button></div>

      {feed.map(post => <article className="community-post" key={post.id}>
        <div className={`community-avatar ${post.anonima ? 'anonymous' : ''} ${post.oficial ? 'oficial' : ''}`}>{post.anonima ? '?' : post.autora.apelido[0]?.toUpperCase()}</div>
        <div>
          <header><strong>{post.autora.apelido}</strong><small> · {tempo(post.criadoEm)}</small></header>
          <div className="community-tags"><Tag tone={post.oficial ? 'pink' : 'blue'}>{post.categoria.nome}</Tag>{post.areaId && <Tag tone="gray">{post.areaId}</Tag>}</div>
          <button className="community-title" onClick={() => abrir(post.id)}>{post.titulo}</button>
          <p>{post.texto}</p>
          <footer>
            <Amei ativo={post.meuVoto} total={post.uteis} aoClicar={() => alternarAmei('post', post.id)}/>
            <button className="community-action community-comentar" onClick={() => abrir(post.id, true)} aria-label={`Comentar, ${post.respostas} ${post.respostas === 1 ? 'comentário' : 'comentários'}`}><span aria-hidden="true">💬</span><strong>{post.respostas}</strong><span>Comentar</span></button>
          </footer>
        </div>
      </article>)}
      {!feed.length && <div className="empty-state"><span><Icon name="book" size={34}/></span><h2>Ainda não há conversas</h2><p>Sua dúvida pode ajudar outra participante também.</p></div>}
    </main>
      <aside className="community-aside">
        <section><h2>Você também faz parte dessa conversa</h2><p>Você não precisa saber tudo para participar. Sua dúvida pode ajudar outra menina, e sua experiência também tem valor.</p></section>
        <section><h2>Regras da comunidade</h2><ol>{regras.map(regra => <li key={regra}>{regra}</li>)}</ol></section>
        <section className="community-pinned"><small>FIXADO</small><h2>Comece por aqui: apresente-se e conte seu próximo objetivo</h2><p>Qual curso você faz? Que área desperta sua curiosidade? E qual próximo passo você quer dar?</p></section>
      </aside></div>

    <button className="btn btn-primary community-new" onClick={() => nova('conversa')}><Icon name="plus" size={18}/> Nova conversa</button>
    {modo && <NovaConversa modo={modo} categorias={categorias} fechar={() => setModo(null)} pronta={() => { const tipo = modo; setModo(null); if (tipo === 'tema') setAviso('Tema da semana publicado.'); carregar() }}/>}
    {conversa && <Conversa post={conversa.post} focarAoAbrir={conversa.focar} fechar={() => setConversa(null)} atualizar={id => abrir(id)} aoAmei={alternarAmei}/>}
  </div></AppShell>
}

/** O tema da semana em destaque: leitura rápida, Amei e um comentário direto, sem abrir a conversa. */
function TemaDaSemana({ tema, equipe, encerrando, aoAmei, aoAbrir, aoPublicarNovo, aoPedirEncerrar, aoCancelarEncerrar, aoEncerrar, aoComentado, aoFalhar }: {
  tema: PostForum; equipe: boolean; encerrando: boolean
  aoAmei: () => void; aoAbrir: (focar: boolean) => void; aoPublicarNovo: () => void
  aoPedirEncerrar: () => void; aoCancelarEncerrar: () => void; aoEncerrar: () => void
  aoComentado: (mensagem: string) => void; aoFalhar: (mensagem: string) => void
}) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const comentar = async () => {
    if (!texto.trim()) return
    setEnviando(true)
    const r = await forumService.criarResposta(tema.id, { texto })
    setEnviando(false)
    if (r.erro) { if (!sessaoExpirou(r.erro)) aoFalhar(r.erro.campos?.apelido ? MSG_APELIDO.replace('publicar', 'comentar') : Object.values(r.erro.campos ?? {})[0] ?? r.erro.mensagem); return }
    setTexto('')
    aoComentado('Comentário publicado. Obrigada por participar!')
  }
  return <section className="community-tema" aria-labelledby="tema-titulo">
    <div className="community-tema-topo"><Tag tone="pink">TEMA DA SEMANA</Tag><small>{tema.autora.apelido} · {tempo(tema.criadoEm)}</small></div>
    <h2 id="tema-titulo">{tema.titulo}</h2>
    <p className="community-tema-texto">{tema.texto}</p>
    <div className="community-tema-acoes">
      <Amei ativo={tema.meuVoto} total={tema.uteis} aoClicar={aoAmei}/>
      <button className="community-action community-comentar" onClick={() => aoAbrir(false)}><span aria-hidden="true">💬</span><strong>{tema.respostas}</strong><span>{tema.respostas === 1 ? 'comentário' : 'comentários'}</span></button>
      <button className="text-link" onClick={() => aoAbrir(false)}>Ler tudo e ver comentários</button>
    </div>
    <div className="community-tema-comentar">
      <label className="visualmente-oculto" htmlFor="comentario-tema">Comente sobre o tema</label>
      <textarea id="comentario-tema" rows={2} value={texto} onChange={e => setTexto(e.target.value)} placeholder="O que você pensa sobre esse tema? Escreva aqui."/>
      <Button onClick={comentar} disabled={enviando || !texto.trim()}>{enviando ? 'Enviando…' : 'Comentar'}</Button>
    </div>
    {equipe && <div className="community-tema-equipe" aria-label="Ações da equipe">
      {encerrando
        ? <span className="row-confirm">Encerrar este tema? <button className="text-link" onClick={aoEncerrar}>Encerrar</button> <button className="text-link" onClick={aoCancelarEncerrar}>Cancelar</button></span>
        : <><Button variant="ghost" onClick={aoPublicarNovo} icon="plus">Publicar novo tema</Button><button className="text-link" onClick={aoPedirEncerrar}>Encerrar este tema</button></>}
    </div>}
  </section>
}

function NovaConversa({ modo, categorias, fechar, pronta }: { modo: 'conversa' | 'tema'; categorias: CategoriaForum[]; fechar: () => void; pronta: () => void }) {
  const tema = modo === 'tema'
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [categoriaId, setCategoria] = useState('')
  const [anonima, setAnonima] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const publicar = async () => {
    setEnviando(true)
    const r = await forumService.criarPost({ titulo, texto, categoriaId: tema ? CATEGORIA_TEMA : categoriaId, anonima: tema ? false : anonima })
    setEnviando(false)
    if (r.erro) setErro(Object.values(r.erro.campos ?? {})[0] ?? r.erro.mensagem)
    else pronta()
  }
  return <div className="modal-backdrop"><div className="modal modal-wide" role="dialog" aria-modal="true" aria-label={tema ? 'Publicar tema da semana' : 'Nova conversa'}>
    <button className="modal-close" onClick={fechar} aria-label="Fechar"><Icon name="close"/></button>
    <h2>{tema ? 'Publicar tema da semana' : 'Nova conversa'}</h2>
    {tema && <p className="trilha-dica">Aparece em destaque para toda a comunidade, como “Equipe Alumna”. As participantes comentam e dão amei. Um novo tema substitui o anterior no destaque.</p>}
    <div className="form-stack">
      <label className="field"><span>{tema ? 'Qual é o tema?' : 'Qual é o assunto?'}</span><input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={tema ? 'Ex.: IA no mercado financeiro e dilemas éticos' : undefined}/></label>
      <label className="field"><span>{tema ? 'Contexto e perguntas para a conversa' : 'Conte sua dúvida ou experiência'}</span><textarea rows={tema ? 9 : 8} value={texto} onChange={e => setTexto(e.target.value)} placeholder={tema ? 'Apresente o tema e deixe 2 ou 3 perguntas que ajudem as participantes a comentar.' : 'Um pouco de contexto ajuda outras meninas a responder.'}/></label>
      {!tema && <label className="field"><span>Categoria</span><select value={categoriaId} onChange={e => setCategoria(e.target.value)}><option value="">Escolha uma categoria</option>{categorias.filter(c => c.id !== CATEGORIA_TEMA).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>}
      {!tema && <label className="checkbox"><input type="checkbox" checked={anonima} onChange={e => setAnonima(e.target.checked)}/><span>Publicar sem mostrar meu nome</span></label>}
      {erro && <div className="alert alert-error"><p>{erro}</p></div>}
      <div className="modal-actions"><Button variant="ghost" onClick={fechar}>Cancelar</Button><Button onClick={publicar} disabled={enviando}>{enviando ? 'Publicando…' : tema ? 'Publicar tema' : 'Publicar conversa'}</Button></div>
    </div>
  </div></div>
}

function Conversa({ post, focarAoAbrir, fechar, atualizar, aoAmei }: {
  post: DetalhePostForum; focarAoAbrir: boolean; fechar: () => void; atualizar: (id: string) => void
  aoAmei: (alvo: 'post' | 'resposta', id: string) => void
}) {
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [respondendoA, setRespondendoA] = useState<RespostaForum | null>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  // "Comentar" no feed abre a conversa já com o cursor na caixa de comentário.
  useEffect(() => { if (focarAoAbrir) campo.current?.focus() }, [focarAoAbrir])
  const responder = (r: RespostaForum) => { setRespondendoA(r); campo.current?.focus() }
  const comentar = async () => {
    if (!texto.trim()) return
    setEnviando(true)
    const r = await forumService.criarResposta(post.id, { texto, paiId: respondendoA?.id ?? null })
    setEnviando(false)
    if (r.erro) return setErro(r.erro.campos?.apelido ? MSG_APELIDO.replace('publicar', 'comentar') : Object.values(r.erro.campos ?? {})[0] ?? r.erro.mensagem)
    setTexto(''); setErro(''); setRespondendoA(null)
    atualizar(post.id)
  }
  return <div className="modal-backdrop"><section className="modal modal-wide community-thread" role="dialog" aria-modal="true" aria-label="Conversa">
    <button className="modal-close" onClick={fechar} aria-label="Fechar"><Icon name="close"/></button>
    <button className="back-link" onClick={fechar}>← Voltar para a comunidade</button>
    <Tag tone={post.oficial ? 'pink' : 'blue'}>{post.categoria.nome}</Tag>
    <h2>{post.titulo}</h2>
    <small>{post.autora.apelido} · {tempo(post.criadoEm)}</small>
    <p className="forum-texto">{post.texto}</p>
    <div className="community-thread-actions"><Amei ativo={post.meuVoto} total={post.uteis} aoClicar={() => aoAmei('post', post.id)}/></div>
    <h3>Comentários ({post.respostasArvore.length})</h3>
    {!post.respostasArvore.length && <p className="trilha-dica">Ainda não há comentários. Seja a primeira a comentar.</p>}
    {post.respostasArvore.map(r => <article className={`community-reply ${r.paiId ? 'indented' : ''}`} key={r.id}>
      <div className="community-avatar">{r.autora.apelido[0]?.toUpperCase()}</div>
      <div>
        <strong>{r.autora.apelido}</strong><small> · {tempo(r.criadoEm)}</small>
        <p>{r.texto}</p>
        <div className="community-reply-acoes">
          <Amei ativo={r.meuVoto} total={r.uteis} aoClicar={() => aoAmei('resposta', r.id)} rotulo={false}/>
          <button className="text-link" onClick={() => responder(r)}>Responder</button>
        </div>
      </div>
    </article>)}
    <div className="community-comment-box">
      {respondendoA && <div className="community-respondendo">Respondendo a <strong>{respondendoA.autora.apelido}</strong><button className="text-link" onClick={() => setRespondendoA(null)} aria-label="Cancelar resposta">✕</button></div>}
      {erro && <div className="alert alert-error"><p>{erro}</p></div>}
      <div className="community-comment-linha">
        <textarea ref={campo} value={texto} onChange={e => setTexto(e.target.value)} placeholder={respondendoA ? `Responder a ${respondendoA.autora.apelido}…` : 'Entre na conversa…'} rows={2} aria-label="Escreva um comentário"/>
        <Button onClick={comentar} disabled={enviando || !texto.trim()}>{enviando ? '…' : 'Comentar'}</Button>
      </div>
    </div>
  </section></div>
}
