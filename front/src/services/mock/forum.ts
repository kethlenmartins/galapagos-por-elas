import type { CategoriaForum, DetalhePostForum, ForumService, PostForum, RespostaForum } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { executarLogada, falha, novoId, ok } from './store.ts'

const categorias: CategoriaForum[] = [
  ['tema-da-semana', 'Tema da semana', 'Um tema proposto pela equipe para a comunidade conversar durante a semana'],
  ['boas-vindas', 'Primeiros passos', 'Escolha de área, estudos e preparação inicial'],
  ['entrevistas', 'Processos seletivos', 'Currículo, entrevistas, dinâmicas e cases'],
  ['mercado', 'Dúvidas técnicas', 'Finanças, valuation, Excel e conceitos do mercado'],
  ['bastidores', 'Experiências e conselhos', 'Relatos, dificuldades, conquistas e conselhos'],
  ['vagas', 'Conexões e estudos', 'Grupos de estudo e prática entre participantes'],
].map(([id, nome, descricao], ordem) => ({ id, nome, descricao, ordem }))

let perfis = new Map<string, { apelido: string; mostrarArea: boolean; mostrarMedalhas: boolean; alteradoEm: string | null }>()
let posts: PostForum[] = []
let respostas: RespostaForum[] = []
let seguindo = new Set<string>()

const autor = (id: string, apelido: string) => ({ apelido, areaId: perfis.get(id)?.mostrarArea ? AREAS[0].id : null })
const perfil = (id: string) => perfis.get(id) ?? null
const validarTexto = (texto: string, maximo: number, campo: string) => !texto.trim() ? { [campo]: 'Este campo é obrigatório.' } : texto.trim().length > maximo ? { [campo]: `Use no máximo ${maximo} caracteres.` } : {}

export const forumService: ForumService = {
  listarCategorias: () => executarLogada(() => ok(categorias)),
  obterMeuPerfil: () => executarLogada(({ usuario }) => ok(perfil(usuario.id))),
  salvarMeuPerfil: dados => executarLogada(({ usuario, agora }) => {
    const apelido = dados.apelido.trim()
    if (apelido.length < 3 || apelido.length > 30) return falha('VALIDACAO', 'Confira o apelido.', { apelido: 'Use de 3 a 30 caracteres.' })
    if ([...perfis.entries()].some(([id, p]) => id !== usuario.id && p.apelido.toLowerCase() === apelido.toLowerCase())) return falha('VALIDACAO', 'Esse apelido já está em uso.', { apelido: 'Escolha outro apelido.' })
    const existente = perfil(usuario.id)
    if (existente?.alteradoEm && agora.getTime() - new Date(existente.alteradoEm).getTime() < 30 * 86400000) return falha('LIMITE_EXCEDIDO', 'O apelido só pode ser alterado uma vez por mês.')
    const novo = { ...dados, apelido, alteradoEm: existente?.apelido === apelido ? existente.alteradoEm : agora.toISOString() }
    perfis.set(usuario.id, novo); return ok(novo)
  }),
  listarPosts: filtro => executarLogada(({ usuario }) => {
    let lista = posts.filter(p => (!filtro?.categoriaId || p.categoria.id === filtro.categoriaId) && (!filtro?.areaId || p.areaId === filtro.areaId) && (!filtro?.busca || p.titulo.toLocaleLowerCase().includes(filtro.busca.toLocaleLowerCase())))
    if (filtro?.ordem === 'uteis') lista = lista.sort((a, b) => b.uteis - a.uteis || b.criadoEm.localeCompare(a.criadoEm))
    else if (filtro?.ordem === 'sem_resposta') lista = lista.sort((a, b) => a.respostas - b.respostas || b.criadoEm.localeCompare(a.criadoEm))
    else lista = lista.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    return ok(lista.map(p => ({ ...p, meuVoto: p.meuVoto && p.autora.apelido === autor(usuario.id, perfil(usuario.id)?.apelido ?? '').apelido })))
  }),
  obterPost: id => executarLogada(({ usuario }) => {
    const post = posts.find(p => p.id === id); if (!post) return falha('NAO_ENCONTRADO', 'Publicação não encontrada.')
    return ok({ ...post, respostasArvore: respostas.filter(r => r.postId === id), seguindo: seguindo.has(`${usuario.id}:${id}`) } as DetalhePostForum)
  }),
  criarPost: dados => executarLogada(({ usuario, agora }) => {
    // O tema da semana é da equipe: só ela publica, sem precisar de apelido, e as participantes comentam.
    const oficial = dados.categoriaId === 'tema-da-semana'
    if (oficial && usuario.papel !== 'equipe') return falha('SEM_PERMISSAO', 'Só a equipe publica o tema da semana. Você pode comentar nele.')
    const p = perfil(usuario.id); if (!p && !oficial) return falha('VALIDACAO', 'Defina seu nome de usuário no Perfil antes de publicar.', { apelido: 'Defina seu nome de usuário.' })
    const campos = { ...validarTexto(dados.titulo, 140, 'titulo'), ...validarTexto(dados.texto, 5000, 'texto') }; const categoria = categorias.find(c => c.id === dados.categoriaId)
    if (!categoria) campos.categoriaId = 'Escolha uma categoria.'; if (dados.areaId && !AREAS.some(a => a.id === dados.areaId)) campos.areaId = 'Escolha uma área válida.'
    if (Object.keys(campos).length) return falha('VALIDACAO', 'Confira os campos.', campos)
    const anonima = dados.anonima ?? false
    const post: PostForum = { id: novoId('post'), titulo: dados.titulo.trim(), texto: dados.texto.trim(), categoria: categoria!, areaId: dados.areaId ?? null, autora: oficial ? { apelido: 'Equipe Alumna', areaId: null } : anonima ? { apelido: 'Participante anônima', areaId: null } : autor(usuario.id, p!.apelido), anonima: oficial ? false : anonima, oficial, criadoEm: agora.toISOString(), editadoEm: null, respostas: 0, uteis: 0, meuVoto: false, removido: false }; posts.push(post); return ok(post)
  }),
  criarResposta: (postId, dados) => executarLogada(({ usuario, agora }) => {
    const p = perfil(usuario.id); if (!p) return falha('VALIDACAO', 'Defina seu nome de usuário no Perfil antes de responder.', { apelido: 'Defina seu nome de usuário.' })
    const post = posts.find(x => x.id === postId); if (!post) return falha('NAO_ENCONTRADO', 'Publicação não encontrada.')
    const campos = validarTexto(dados.texto, 2000, 'texto'); if (dados.paiId && !respostas.some(r => r.id === dados.paiId && r.postId === postId)) campos.paiId = 'Resposta pai inválida.'
    if (Object.keys(campos).length) return falha('VALIDACAO', 'Confira sua resposta.', campos)
    const resposta: RespostaForum = { id: novoId('resposta'), postId, paiId: dados.paiId ?? null, texto: dados.texto.trim(), autora: autor(usuario.id, p.apelido), criadoEm: agora.toISOString(), uteis: 0, meuVoto: false, ajudou: false, removida: false }; respostas.push(resposta); post.respostas++; return ok(resposta)
  }),
  votar: (alvo, id) => executarLogada(() => { const item = alvo === 'post' ? posts.find(p => p.id === id) : respostas.find(r => r.id === id); if (!item) return falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.'); item.meuVoto = !item.meuVoto; item.uteis += item.meuVoto ? 1 : -1; return ok({ uteis: item.uteis, meuVoto: item.meuVoto }) }),
  denunciar: (alvo, id) => executarLogada(() => (alvo === 'post' ? posts : respostas).some(x => x.id === id) ? ok(true) : falha('NAO_ENCONTRADO', 'Conteúdo não encontrado.')),
  encerrarTema: id => executarLogada(() => { if (!posts.some(p => p.id === id && p.oficial)) return falha('NAO_ENCONTRADO', 'Tema não encontrado.'); posts = posts.filter(p => p.id !== id); return ok(true) }, 'equipe'),
  seguir: postId => executarLogada(({ usuario }) => { if (!posts.some(p => p.id === postId)) return falha('NAO_ENCONTRADO', 'Publicação não encontrada.'); const chave = `${usuario.id}:${postId}`; const ativo = !seguindo.has(chave); ativo ? seguindo.add(chave) : seguindo.delete(chave); return ok(ativo) }),
}
