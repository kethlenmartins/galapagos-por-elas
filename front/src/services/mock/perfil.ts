import type { Perfil, PerfilService } from '../contratos.ts'
import { conceder, calcularSaldo } from './pontos.ts'
import { executarLogada, falha, ok } from './store.ts'
import type { Usuario } from './tipos.ts'

const PREFERENCIAS_PADRAO = { novosCases: true, lembretesPrazo: true, novosConteudos: false }

export const perfilDe = (u: Usuario): Perfil => ({
  id: u.id,
  nome: u.nome,
  nomeSocial: u.nomeSocial,
  email: u.email,
  papel: u.papel,
  dataNascimento: u.dataNascimento,
  cidade: u.cidade,
  uf: u.uf,
  escolaridade: u.escolaridade,
  objetivo: u.objetivo,
  perfilCompleto: u.perfilCompleto,
  termosAceitosEm: u.termosAceitosEm,
  termosVersao: u.termosVersao,
  preferenciasEmail: u.preferenciasEmail ?? PREFERENCIAS_PADRAO,
})

const preenchido = (valor: string | null) => typeof valor === 'string' && valor.trim() !== ''

const camposObrigatorios = (u: Usuario) =>
  [u.dataNascimento, u.cidade, u.uf, u.escolaridade, u.objetivo].every(preenchido)

export const perfilService: PerfilService = {
  obterPerfil: () => executarLogada(({ usuario }) => ok(perfilDe(usuario))),

  atualizarPerfil: dados =>
    executarLogada(({ estado, usuario, agora }) => {
      const campos: Record<string, string> = {}
      if (dados.nome !== undefined && dados.nome.trim().length < 2) campos.nome = 'Informe seu nome.'
      if (dados.uf !== undefined && dados.uf !== null && !/^[A-Za-z]{2}$/.test(dados.uf)) campos.uf = 'Use a sigla do estado, com 2 letras.'
      if (dados.dataNascimento) {
        const data = new Date(dados.dataNascimento)
        if (Number.isNaN(data.getTime()) || data.getTime() > agora.getTime()) campos.dataNascimento = 'Informe uma data de nascimento válida.'
      }
      // [EM ABERTO] A idade mínima ainda não foi definida; quando for, validar aqui.
      if (Object.keys(campos).length) return falha('VALIDACAO', 'Confira os campos destacados.', campos)

      const jaEstavaCompleto = usuario.perfilCompleto
      if (dados.nome !== undefined) usuario.nome = dados.nome.trim()
      if (dados.nomeSocial !== undefined) usuario.nomeSocial = dados.nomeSocial?.trim() || null
      if (dados.dataNascimento !== undefined) usuario.dataNascimento = dados.dataNascimento
      if (dados.cidade !== undefined) usuario.cidade = dados.cidade?.trim() || null
      if (dados.uf !== undefined) usuario.uf = dados.uf ? dados.uf.toUpperCase() : null
      if (dados.escolaridade !== undefined) usuario.escolaridade = dados.escolaridade?.trim() || null
      if (dados.preferenciasEmail !== undefined) usuario.preferenciasEmail = { ...(usuario.preferenciasEmail ?? PREFERENCIAS_PADRAO), ...dados.preferenciasEmail }
      if (dados.objetivo !== undefined) usuario.objetivo = dados.objetivo?.trim() || null
      usuario.perfilCompleto = camposObrigatorios(usuario)

      const eventos = []
      if (usuario.perfilCompleto && !jaEstavaCompleto) {
        const evento = conceder(estado, usuario.id, 'perfil_completo', 'Onboarding', agora)
        if (evento) eventos.push(evento)
      }
      return ok({ perfil: perfilDe(usuario), eventos })
    }),

  registrarAceiteTermos: versao =>
    executarLogada(({ usuario, agora }) => {
      usuario.termosAceitosEm = agora.toISOString()
      usuario.termosVersao = versao
      return ok(perfilDe(usuario))
    }),

  exportarMeusDados: () =>
    executarLogada(({ estado, usuario, agora }) => {
      const { senha: _senha, ...semSenha } = usuario
      return ok({
        exportadoEm: agora.toISOString(),
        perfil: semSenha,
        pontos: { ...calcularSaldo(estado, usuario.id), eventos: estado.eventos.filter(e => e.usuarioId === usuario.id) },
        diagnostico: estado.diagnosticos[usuario.id] ?? null,
        rascunhos: Object.entries(estado.rascunhos).filter(([chave]) => chave.startsWith(`${usuario.id}:`)),
        entregas: estado.entregas.filter(e => e.usuarioId === usuario.id),
        certificados: estado.certificados.filter(c => c.usuarioId === usuario.id),
      })
    }),
}
