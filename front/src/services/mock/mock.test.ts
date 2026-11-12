/**
 * Testes do adaptador mock. Rodam com `pnpm test` (Node 22.18+; sem dependências extras).
 * Como o mock implementa os contratos, estes testes também descrevem o
 * comportamento que o backend real precisa ter.
 */
import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import type { BriefingCase, CodigoErro, RespostaOpcao, Resultado } from '../contratos.ts'
import { PERGUNTAS } from '../fit/perguntas.ts'
import { mockDebug, servicosMock as s } from './index.ts'
import { definirDebug, obterEstado, resetarEstado } from './store.ts'

beforeEach(() => {
  definirDebug({ rede: false, iaIndisponivel: false, sessaoExpirada: false, latenciaMs: 0, agora: null })
  resetarEstado()
})

// --- ajudantes -------------------------------------------------------------

function dados<T>(r: Resultado<T>): T {
  assert.equal(r.erro, null, `esperava sucesso, veio: ${JSON.stringify(r.erro)}`)
  return r.dados as T
}

function codigo<T>(r: Resultado<T>): CodigoErro {
  assert.notEqual(r.erro, null, 'esperava erro, mas veio sucesso')
  return r.erro!.codigo
}

const entrar = async (email: string, senha = 'Senha123') => dados(await s.sessao.entrar(email, senha))

async function novaUsuaria(email = 'teste@email.com') {
  return dados(await s.sessao.cadastrar({ nome: 'Teste Silva', email, senha: 'Senha123', aceitouTermos: true }))
}

/** Responde as 15 perguntas (C por padrão) e envia. */
async function responderTudo(respostas: Record<string, RespostaOpcao> = {}) {
  dados(await s.diagnostico.iniciarDiagnostico())
  for (const p of PERGUNTAS) dados(await s.diagnostico.responderPergunta(p.id, respostas[p.id] ?? 'C'))
  return dados(await s.diagnostico.finalizarDiagnostico())
}

const todas = (letra: RespostaOpcao) => Object.fromEntries(PERGUNTAS.map(p => [p.id, letra]))

const briefingValido: BriefingCase = {
  areaId: 'credito-risco',
  dificuldade: 'intermediario',
  tema: 'Risco de uma carteira de crédito',
  numCheckpoints: 4,
  numTarefas: 3,
  tipoDados: 'demonstracoes_financeiras',
  observacoes: '',
}

// --- sessão ----------------------------------------------------------------

test('login: erro genérico e bloqueio depois de 5 falhas, que expira com o tempo', async () => {
  const genericas = new Set<string>()
  for (let i = 0; i < 5; i++) {
    const r = await s.sessao.entrar('marina@email.com', `errada${i}`)
    assert.equal(codigo(r), 'VALIDACAO')
    genericas.add(r.erro!.mensagem)
  }
  const desconhecida = await s.sessao.entrar('naoexiste@email.com', 'qualquer')
  genericas.add(desconhecida.erro!.mensagem)
  assert.equal(genericas.size, 1, 'a mensagem não pode revelar se o e-mail existe')

  assert.equal(codigo(await s.sessao.entrar('marina@email.com', 'Senha123')), 'LIMITE_EXCEDIDO')

  mockDebug.definirAgora(new Date(Date.now() + 6 * 60_000))
  assert.equal((await entrar('marina@email.com')).papel, 'participante')
})

test('cadastro: valida campos, bloqueia e-mail repetido e nunca cria equipe', async () => {
  const fraca = await s.sessao.cadastrar({ nome: 'A', email: 'ruim', senha: '12345678', aceitouTermos: false })
  assert.equal(codigo(fraca), 'VALIDACAO')
  assert.deepEqual(Object.keys(fraca.erro!.campos!).sort(), ['email', 'nome', 'senha', 'termos'])

  const repetido = await s.sessao.cadastrar({ nome: 'Outra Marina', email: 'MARINA@email.com', senha: 'Senha123', aceitouTermos: true })
  assert.ok(repetido.erro!.campos!.email)

  const sessao = await novaUsuaria()
  assert.equal(sessao.papel, 'participante')
  assert.equal(sessao.perfilCompleto, false)
})

test('recuperação de senha: resposta igual para qualquer e-mail, token de uso único', async () => {
  assert.equal(dados(await s.sessao.recuperarSenha('naoexiste@email.com')), true)
  assert.equal(mockDebug.ultimoTokenDeRedefinicao(), null)

  dados(await s.sessao.recuperarSenha('marina@email.com'))
  const token = mockDebug.ultimoTokenDeRedefinicao()!
  assert.equal(codigo(await s.sessao.redefinirSenha('token-falso', 'NovaSenha9')), 'VALIDACAO')
  assert.equal(codigo(await s.sessao.redefinirSenha(token, 'curta')), 'VALIDACAO')

  dados(await s.sessao.redefinirSenha(token, 'NovaSenha9'))
  assert.equal(codigo(await s.sessao.redefinirSenha(token, 'OutraSenha9')), 'VALIDACAO')
  assert.equal(codigo(await s.sessao.entrar('marina@email.com', 'Senha123')), 'VALIDACAO')
  assert.equal((await entrar('marina@email.com', 'NovaSenha9')).nome, 'Marina Costa')
})

test('acesso: sem login, sem permissão e flags de debug', async () => {
  assert.equal(codigo(await s.pontos.obterSaldoENivel()), 'SEM_LOGIN')
  await entrar('marina@email.com')
  assert.equal(codigo(await s.adminCases.listarCases()), 'SEM_PERMISSAO')
  assert.equal(codigo(await s.adminCorrecao.listarEntregas()), 'SEM_PERMISSAO')

  mockDebug.definir({ sessaoExpirada: true })
  assert.equal(codigo(await s.sessao.obterSessao()), 'SEM_LOGIN')
  assert.equal(codigo(await s.pontos.obterSaldoENivel()), 'SEM_LOGIN')
  await entrar('marina@email.com')
  dados(await s.pontos.obterSaldoENivel())

  mockDebug.definir({ rede: true })
  assert.equal(codigo(await s.pontos.obterSaldoENivel()), 'REDE')
  assert.equal(codigo(await s.sessao.entrar('marina@email.com', 'Senha123')), 'REDE')
})

test('excluir conta apaga os dados da usuária e exportar dados não vaza a senha', async () => {
  await novaUsuaria('apagar@email.com')
  dados(await s.perfil.atualizarPerfil({ dataNascimento: '2003-01-01T12:00:00.000Z', cidade: 'Recife', uf: 'pe', escolaridade: 'Ensino médio', objetivo: 'Aprender' }))
  const exportado = JSON.stringify(dados(await s.perfil.exportarMeusDados()))
  assert.ok(!exportado.includes('Senha123'), 'a exportação não pode conter a senha')

  assert.equal(codigo(await s.sessao.excluirConta('errada')), 'VALIDACAO')
  dados(await s.sessao.excluirConta('Senha123'))
  assert.equal(dados(await s.sessao.obterSessao()), null)
  assert.equal(codigo(await s.sessao.entrar('apagar@email.com', 'Senha123')), 'VALIDACAO')
  assert.equal(obterEstado().eventos.filter(e => e.usuarioId.startsWith('usr-1')).length, 0)
})

// --- perfil e pontos ---------------------------------------------------------

test('alterar senha exige a atual, valida a nova e a senha antiga deixa de valer', async () => {
  await entrar('marina@email.com')
  assert.equal(codigo(await s.sessao.alterarSenha('errada', 'Outra-Senha-9')), 'VALIDACAO')
  assert.equal(codigo(await s.sessao.alterarSenha('Senha123', 'curta')), 'VALIDACAO')
  assert.equal(codigo(await s.sessao.alterarSenha('Senha123', 'Senha123')), 'VALIDACAO')
  dados(await s.sessao.alterarSenha('Senha123', 'Outra-Senha-9'))
  dados(await s.sessao.sair())
  assert.equal(codigo(await s.sessao.entrar('marina@email.com', 'Senha123')), 'VALIDACAO')
  await entrar('marina@email.com', 'Outra-Senha-9')
})

test('preferências de e-mail têm padrão e mudam uma a uma', async () => {
  await entrar('marina@email.com')
  assert.deepEqual(dados(await s.perfil.obterPerfil()).preferenciasEmail, { novosCases: true, lembretesPrazo: true, novosConteudos: false })
  const { perfil } = dados(await s.perfil.atualizarPerfil({ preferenciasEmail: { novosConteudos: true } }))
  assert.deepEqual(perfil.preferenciasEmail, { novosCases: true, lembretesPrazo: true, novosConteudos: true })
})

test('perfil completo concede 20 pontos uma única vez', async () => {
  await novaUsuaria()
  const incompleto = dados(await s.perfil.atualizarPerfil({ cidade: 'Recife' }))
  assert.equal(incompleto.eventos.length, 0)
  assert.equal(codigo(await s.perfil.atualizarPerfil({ uf: 'Pernambuco' })), 'VALIDACAO')

  const completo = dados(
    await s.perfil.atualizarPerfil({ dataNascimento: '2003-01-01T12:00:00.000Z', uf: 'pe', escolaridade: 'Ensino médio', objetivo: 'Aprender' }),
  )
  assert.equal(completo.perfil.perfilCompleto, true)
  assert.equal(completo.perfil.uf, 'PE')
  assert.deepEqual(completo.eventos.map(e => e.pontos), [20])

  const repetido = dados(await s.perfil.atualizarPerfil({ cidade: 'Olinda' }))
  assert.equal(repetido.eventos.length, 0)
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 20)
})

test('pontos: nível e progresso, e conteúdo concluído não paga duas vezes', async () => {
  await entrar('marina@email.com')
  const antes = dados(await s.pontos.obterSaldoENivel())
  assert.equal(antes.saldo, 240)
  assert.equal(antes.nivel.nome, 'Aprendiz')
  assert.equal(antes.proximoNivel?.nome, 'Analista')
  assert.equal(antes.faltam, 160)

  assert.deepEqual(dados(await s.conteudos.concluirConteudo('cont-4')).eventos.map(e => e.pontos), [10])
  assert.equal(dados(await s.conteudos.concluirConteudo('cont-4')).eventos.length, 0)
  assert.equal(dados(await s.conteudos.concluirConteudo('cont-1')).eventos.length, 0, 'já concluído no seed')
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 250)
  assert.equal(codigo(await s.conteudos.concluirConteudo('nao-existe')), 'NAO_ENCONTRADO')
})

// --- diagnóstico -------------------------------------------------------------

test('diagnóstico: configuração pública, 15 respostas obrigatórias, alteração livre e pontos uma vez', async () => {
  const config = dados(await s.diagnostico.obterConfiguracao())
  assert.equal(config.perguntas.length, 15)
  assert.equal(config.dimensoes.length, 12)
  assert.deepEqual(config.versoes, { questionario: '1.1', scoring: '1.1', matriz: '1.1' })
  assert.ok(!JSON.stringify(config).includes('pontuacao'))

  await novaUsuaria()
  const antes = dados(await s.diagnostico.obterEstadoDiagnostico())
  assert.equal(antes.status, 'nao_iniciado')
  assert.deepEqual(dados(await s.diagnostico.obterEstadoDiagnostico()), antes, 'ler o estado não inicia nada')
  assert.equal(codigo(await s.diagnostico.responderPergunta('Q01', 'A')), 'VALIDACAO', 'precisa iniciar antes')
  assert.equal(dados(await s.diagnostico.iniciarDiagnostico()).status, 'em_andamento')
  assert.equal(codigo(await s.diagnostico.responderPergunta('Q99', 'A')), 'NAO_ENCONTRADO')
  assert.equal(codigo(await s.diagnostico.responderPergunta('Q01', 'D' as RespostaOpcao)), 'VALIDACAO')
  assert.equal(codigo(await s.diagnostico.obterResultadoDiagnostico()), 'NAO_ENCONTRADO')

  for (const p of PERGUNTAS.slice(0, 14)) dados(await s.diagnostico.responderPergunta(p.id, 'A'))
  const incompleto = await s.diagnostico.finalizarDiagnostico()
  assert.equal(codigo(incompleto), 'VALIDACAO')
  assert.match(incompleto.erro!.mensagem, /14 de 15/)
  assert.deepEqual(Object.keys(incompleto.erro!.campos!), ['Q15'])

  dados(await s.diagnostico.responderPergunta('Q15', 'A'))
  assert.equal(dados(await s.diagnostico.responderPergunta('Q01', 'B')).respostas.Q01, 'B', 'dá para alterar antes do envio')

  const primeira = dados(await s.diagnostico.finalizarDiagnostico())
  assert.deepEqual(primeira.eventos.map(e => e.pontos), [100])
  assert.equal(codigo(await s.diagnostico.finalizarDiagnostico()), 'VALIDACAO', 'não envia duas vezes')
  assert.equal(codigo(await s.diagnostico.responderPergunta('Q01', 'A')), 'VALIDACAO', 'depois do envio não altera')

  // Refazer: nova tentativa, resultado anterior preservado, sem pontos de novo.
  assert.deepEqual(dados(await s.diagnostico.iniciarDiagnostico()).respostas, {})
  assert.equal(dados(await s.diagnostico.obterResultadoDiagnostico()).id, primeira.resultadoId)
  const segunda = await responderTudo(todas('B'))
  assert.equal(segunda.eventos.length, 0)
  assert.notEqual(segunda.resultadoId, primeira.resultadoId)
  assert.equal(dados(await s.diagnostico.obterResultadoDiagnostico()).id, segunda.resultadoId, 'sem id devolve o mais recente')
  assert.equal(dados(await s.diagnostico.obterResultadoDiagnostico(primeira.resultadoId)).id, primeira.resultadoId)
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 100)
})

test('diagnóstico: resultado com 12 dimensões, 13 áreas ordenadas e versões guardadas', async () => {
  await novaUsuaria()
  await responderTudo(todas('A'))
  const r = dados(await s.diagnostico.obterResultadoDiagnostico())
  assert.equal(r.dimensoes.length, 12)
  assert.equal(r.areas.length, 13)
  assert.deepEqual(r.areas.slice(0, 3).map(a => a.areaId), ['quant', 'equity-research', 'credito-risco'])
  assert.deepEqual(r.areas.map(a => a.posicao), Array.from({ length: 13 }, (_, i) => i + 1))
  assert.ok(r.areas.every((a, i) => i === 0 || r.areas[i - 1].pontuacaoBruta >= a.pontuacaoBruta))
  assert.equal(r.areas[0].pontuacao, Math.round(r.areas[0].pontuacaoBruta))
  assert.deepEqual(r.versoes, { questionario: '1.1', scoring: '1.1', matriz: '1.1' })
  assert.equal(r.respostasC, 0)
  assert.equal(r.dimensoes.find(d => d.dimensaoId === 'D3')!.valor, 100, 'Q04 invertida')
})

test('diagnóstico: não depende de IA (o resultado é igual com a IA indisponível)', async () => {
  const respostas: Record<string, RespostaOpcao> = { ...todas('A'), Q02: 'B', Q07: 'C', Q10: 'B' }
  await novaUsuaria('com-ia@email.com')
  await responderTudo(respostas)
  const comIA = dados(await s.diagnostico.obterResultadoDiagnostico())

  mockDebug.definir({ iaIndisponivel: true })
  await novaUsuaria('sem-ia@email.com')
  await responderTudo(respostas)
  const semIA = dados(await s.diagnostico.obterResultadoDiagnostico())

  assert.deepEqual(semIA.areas, comIA.areas)
  assert.deepEqual(semIA.dimensoes, comIA.dimensoes)
})

test('diagnóstico: o resultado da Marina é pré-calculado e cada uma só lê o seu', async () => {
  await entrar('marina@email.com')
  const dela = dados(await s.diagnostico.obterResultadoDiagnostico())
  assert.equal(dela.id, 'diag-seed-1')
  assert.equal(dela.areas.length, 13)
  assert.equal(dados(await s.diagnostico.iniciarDiagnostico()).status, 'em_andamento', 'refazer não apaga o anterior')
  assert.equal(dados(await s.diagnostico.obterResultadoDiagnostico()).id, 'diag-seed-1')

  await entrar('beatriz@email.com')
  assert.equal(codigo(await s.diagnostico.obterResultadoDiagnostico('diag-seed-1')), 'NAO_ENCONTRADO')
  assert.equal(codigo(await s.diagnostico.obterResultadoDiagnostico()), 'NAO_ENCONTRADO')
})

// --- admin: cases com IA ---------------------------------------------------------

test('admin: gerar rascunho com IA, regenerar seção, conferir gabarito e aprovar', async () => {
  await entrar('equipe@galapagos.com.br')

  const invalido = await s.adminCases.gerarRascunhoComIA({ ...briefingValido, numTarefas: 0, tema: 'x' })
  assert.equal(codigo(invalido), 'VALIDACAO')
  assert.deepEqual(Object.keys(invalido.erro!.campos!).sort(), ['numTarefas', 'tema'])

  mockDebug.definir({ iaIndisponivel: true })
  assert.equal(codigo(await s.adminCases.gerarRascunhoComIA(briefingValido)), 'IA_INDISPONIVEL')
  mockDebug.definir({ iaIndisponivel: false })

  const rascunho = dados(await s.adminCases.gerarRascunhoComIA(briefingValido))
  assert.equal(rascunho.status, 'rascunho_ia')
  assert.equal(rascunho.checkpoints.length, 4)
  assert.equal(rascunho.tarefas.length, 3)
  assert.equal(rascunho.tarefas.reduce((soma, t) => soma + t.notaMaxima, 0), 10)
  assert.equal(dados(await s.adminCases.conferirGabarito(rascunho.id)).confere, true)

  assert.equal(codigo(await s.adminCases.aprovarCase(rascunho.id, { gabaritoConfirmado: false })), 'VALIDACAO')
  assert.equal(dados(await s.adminCases.aprovarCase(rascunho.id, { gabaritoConfirmado: true })).status, 'revisado')

  const novoContexto = dados(await s.adminCases.regenerarSecao(rascunho.id, 'contexto'))
  assert.notEqual(novoContexto.contexto, rascunho.contexto)
  assert.equal(novoContexto.status, 'rascunho', 'mudou conteúdo: precisa de nova revisão')
  assert.equal(novoContexto.gabaritoConfirmado, false)
  assert.deepEqual(novoContexto.tarefas, rascunho.tarefas, 'regenerar uma seção não mexe nas outras')
})

test('admin: divergência de gabarito bloqueia a aprovação até ser corrigida', async () => {
  await entrar('equipe@galapagos.com.br')
  const conferencia = dados(await s.adminCases.conferirGabarito('case-3'))
  assert.equal(conferencia.confere, false)
  assert.equal(conferencia.itens[0].valorGabarito, 12.4)
  assert.equal(conferencia.itens[0].valorCalculado, 12.79)

  const bloqueio = await s.adminCases.aprovarCase('case-3', { gabaritoConfirmado: true })
  assert.equal(codigo(bloqueio), 'VALIDACAO')
  assert.match(bloqueio.erro!.mensagem, /não confere/)

  dados(await s.adminCases.regenerarSecao('case-3', 'gabarito'))
  const corrigido = dados(await s.adminCases.conferirGabarito('case-3'))
  assert.equal(corrigido.confere, true)
  assert.equal(corrigido.itens[0].valorGabarito, 12.8, 'o valor foi recalculado a partir da tabela')
  assert.equal(dados(await s.adminCases.aprovarCase('case-3', { gabaritoConfirmado: true })).status, 'revisado')
})

// --- admin: conteúdos -------------------------------------------------------------

test('admin: conteúdos validam por tipo e mantêm o vínculo com os cases', async () => {
  await entrar('equipe@galapagos.com.br')
  const base = { titulo: 'Entendendo fluxo de caixa', tipo: 'video' as const, areaId: 'corporate-finance', resumo: '', corpo: null, url: null, minutos: 7, caseIds: ['case-1'] }

  const semLink = await s.adminConteudos.salvarConteudo(base)
  assert.equal(codigo(semLink), 'VALIDACAO')
  assert.ok(semLink.erro!.campos!.url)

  const criado = dados(await s.adminConteudos.salvarConteudo({ ...base, url: 'https://example.com/v/fluxo' }))
  assert.equal(dados(await s.adminCases.obterCase('case-1')).conteudoIds.includes(criado.id), true)

  await entrar('marina@email.com')
  assert.ok(dados(await s.conteudos.listarConteudos({ caseId: 'case-1' })).some(c => c.id === criado.id))
  assert.equal(dados(await s.conteudos.listarConteudos({ tipo: 'link' })).length, 1)

  await entrar('equipe@galapagos.com.br')
  dados(await s.adminConteudos.removerConteudo(criado.id))
  assert.equal(dados(await s.adminCases.obterCase('case-1')).conteudoIds.includes(criado.id), false)
  assert.equal(codigo(await s.adminConteudos.removerConteudo(criado.id)), 'NAO_ENCONTRADO')
})

// --- catálogo e persistência ---------------------------------------------------------

test('catálogo: áreas são públicas', async () => {
  assert.equal(dados(await s.catalogo.listarAreas()).length, 13)
  assert.equal(dados(await s.catalogo.obterArea('credito-risco')).nome, 'Crédito e Risco')
  assert.equal(codigo(await s.catalogo.obterArea('x')), 'NAO_ENCONTRADO')
  assert.equal(dados(await s.pontos.listarRegrasDePontos()).length, 6)
})

test('o estado inteiro é serializável (persistência em localStorage) e resetar restaura a demonstração', async () => {
  await entrar('marina@email.com')
  dados(await s.conteudos.concluirConteudo('cont-4'))
  const estado = obterEstado()
  assert.deepEqual(JSON.parse(JSON.stringify(estado)), estado)

  resetarEstado()
  await entrar('marina@email.com')
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 240)
})
