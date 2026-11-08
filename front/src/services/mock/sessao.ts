import type { DadosCadastro, Sessao, SessaoService } from '../contratos.ts'
import { CONFIG } from './dados/config.ts'
import { MINUTO } from './datas.ts'
import { definirDebug, executar, executarLogada, falha, novoId, obterDebug, ok } from './store.ts'
import type { EstadoMock, Usuario } from './tipos.ts'

export const sessaoDe = (u: Usuario): Sessao => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  papel: u.papel,
  perfilCompleto: u.perfilCompleto,
})

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const normalizarEmail = (email: string) => email.trim().toLowerCase()

export function validarSenha(senha: string): string | null {
  if (senha.length < CONFIG.senha.minimo) return `Use pelo menos ${CONFIG.senha.minimo} caracteres.`
  if ((CONFIG.senha.comuns as readonly string[]).includes(senha.toLowerCase())) return 'Essa senha é muito comum. Escolha outra.'
  return null
}

/** Remove todos os dados de uma usuária (exclusão de conta, LGPD). */
function apagarDadosDe(estado: EstadoMock, usuarioId: string) {
  estado.usuarios = estado.usuarios.filter(u => u.id !== usuarioId)
  estado.eventos = estado.eventos.filter(e => e.usuarioId !== usuarioId)
  estado.entregas = estado.entregas.filter(e => e.usuarioId !== usuarioId)
  estado.pedidosRevisao = estado.pedidosRevisao.filter(p => p.usuarioId !== usuarioId)
  estado.certificados = estado.certificados.filter(c => c.usuarioId !== usuarioId)
  estado.tokensRedefinicao = estado.tokensRedefinicao.filter(t => t.usuarioId !== usuarioId)
  delete estado.diagnosticos[usuarioId]
  delete estado.checkpointsConcluidos[usuarioId]
  delete estado.conteudosConcluidos[usuarioId]
  for (const chave of Object.keys(estado.rascunhos)) if (chave.startsWith(`${usuarioId}:`)) delete estado.rascunhos[chave]
}

export const sessaoService: SessaoService = {
  cadastrar: (dados: DadosCadastro) =>
    executar({}, ({ estado, agora }) => {
      const campos: Record<string, string> = {}
      const email = normalizarEmail(dados.email)
      if (dados.nome.trim().length < 2) campos.nome = 'Informe seu nome.'
      if (!emailValido(email)) campos.email = 'Informe um e-mail válido.'
      const erroSenha = validarSenha(dados.senha)
      if (erroSenha) campos.senha = erroSenha
      if (!dados.aceitouTermos) campos.termos = 'É preciso aceitar os termos e a política de privacidade.'
      if (!campos.email && estado.usuarios.some(u => u.email === email)) campos.email = 'Este e-mail já está cadastrado.'
      if (Object.keys(campos).length) return falha('VALIDACAO', 'Confira os campos destacados.', campos)

      const usuario: Usuario = {
        id: novoId('usr'),
        email,
        senha: dados.senha,
        papel: 'participante',
        nome: dados.nome.trim(),
        nomeSocial: null,
        dataNascimento: null,
        cidade: null,
        uf: null,
        escolaridade: null,
        objetivo: null,
        perfilCompleto: false,
        termosAceitosEm: agora.toISOString(),
        termosVersao: CONFIG.versaoTermos,
        criadoEm: agora.toISOString(),
      }
      estado.usuarios.push(usuario)
      estado.sessaoUsuarioId = usuario.id
      definirDebug({ sessaoExpirada: false })
      return ok(sessaoDe(usuario))
    }),

  entrar: (email, senha) =>
    executar({}, ({ estado, agora }) => {
      const chave = normalizarEmail(email)
      const tentativa = estado.tentativasLogin[chave] ?? { falhas: 0, bloqueadoAte: null }
      if (tentativa.bloqueadoAte && tentativa.bloqueadoAte > agora.getTime()) {
        return falha('LIMITE_EXCEDIDO', 'Muitas tentativas. Aguarde alguns minutos e tente de novo.')
      }
      const usuario = estado.usuarios.find(u => u.email === chave)
      if (!usuario || usuario.senha !== senha) {
        const falhas = (tentativa.bloqueadoAte ? 0 : tentativa.falhas) + 1
        estado.tentativasLogin[chave] = {
          falhas,
          bloqueadoAte: falhas >= CONFIG.login.maxFalhas ? agora.getTime() + CONFIG.login.bloqueioMs : null,
        }
        // Mensagem genérica: não revela se o e-mail existe.
        return falha('VALIDACAO', 'E-mail ou senha incorretos.')
      }
      delete estado.tentativasLogin[chave]
      estado.sessaoUsuarioId = usuario.id
      definirDebug({ sessaoExpirada: false })
      return ok(sessaoDe(usuario))
    }),

  sair: () =>
    executar({}, ({ estado }) => {
      estado.sessaoUsuarioId = null
      return ok(true as const)
    }),

  // No mock há uma única sessão; no backend real, revoga todos os tokens.
  sairDeTodosOsAparelhos: () =>
    executarLogada(({ estado }) => {
      estado.sessaoUsuarioId = null
      return ok(true as const)
    }),

  alterarSenha: (senhaAtual, novaSenha) =>
    executarLogada(({ usuario }) => {
      if (usuario.senha !== senhaAtual) return falha('VALIDACAO', 'Senha atual incorreta.', { senhaAtual: 'Senha atual incorreta.' })
      const erro = validarSenha(novaSenha)
      if (erro) return falha('VALIDACAO', erro, { novaSenha: erro })
      if (novaSenha === senhaAtual) return falha('VALIDACAO', 'A nova senha precisa ser diferente da atual.', { novaSenha: 'Escolha uma senha diferente da atual.' })
      usuario.senha = novaSenha
      return ok(true as const)
    }),

  recuperarSenha: email =>
    executar({}, ({ estado, agora }) => {
      const usuario = estado.usuarios.find(u => u.email === normalizarEmail(email))
      // Sempre a mesma resposta, exista ou não a conta.
      if (usuario) {
        estado.tokensRedefinicao.push({
          token: `tok-${novoId('rd')}-${Math.floor(agora.getTime() / MINUTO).toString(36)}`,
          usuarioId: usuario.id,
          expiraEm: new Date(agora.getTime() + CONFIG.redefinicaoValidadeMs).toISOString(),
        })
      }
      return ok(true as const)
    }),

  redefinirSenha: (token, novaSenha) =>
    executar({}, ({ estado, agora }) => {
      const registro = estado.tokensRedefinicao.find(t => t.token === token)
      if (!registro || new Date(registro.expiraEm).getTime() < agora.getTime()) {
        return falha('VALIDACAO', 'Este link é inválido ou expirou. Peça um novo link.')
      }
      const erroSenha = validarSenha(novaSenha)
      if (erroSenha) return falha('VALIDACAO', erroSenha, { senha: erroSenha })
      const usuario = estado.usuarios.find(u => u.id === registro.usuarioId)
      if (!usuario) return falha('VALIDACAO', 'Este link é inválido ou expirou. Peça um novo link.')
      usuario.senha = novaSenha
      estado.tokensRedefinicao = estado.tokensRedefinicao.filter(t => t.usuarioId !== usuario.id)
      if (estado.sessaoUsuarioId === usuario.id) estado.sessaoUsuarioId = null
      return ok(true as const)
    }),

  obterSessao: () =>
    executar({}, ({ estado, usuario }) => {
      if (obterDebug().sessaoExpirada && estado.sessaoUsuarioId) {
        return falha('SEM_LOGIN', 'Sua sessão expirou. Entre de novo para continuar.')
      }
      return ok(usuario ? sessaoDe(usuario) : null)
    }),

  excluirConta: senha =>
    executarLogada(({ estado, usuario }) => {
      if (usuario.senha !== senha) return falha('VALIDACAO', 'Senha incorreta.', { senha: 'Senha incorreta.' })
      apagarDadosDe(estado, usuario.id)
      estado.sessaoUsuarioId = null
      return ok(true as const)
    }),
}
