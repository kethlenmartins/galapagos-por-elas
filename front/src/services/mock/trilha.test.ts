/**
 * Testes da trilha de cases: ilhas em ordem, começar e terminar, checkpoints, progresso, avaliação,
 * certificado em PDF e publicação no admin. O relógio é fixo, para os testes não dependerem do dia.
 */
import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import type { BriefingCase, CodigoErro, RespostaOpcao, Resultado } from '../contratos.ts'
import { PERGUNTAS } from '../fit/perguntas.ts'
import { mockDebug, servicosMock as s } from './index.ts'
import { definirDebug, resetarEstado } from './store.ts'

/** Quarta-feira, 11/11/2026, 10h em Brasília. */
const QUARTA = '2026-11-11T13:00:00.000Z'
const SEGUNDA_9 = '2026-11-09T13:00:00.000Z'

beforeEach(() => {
  definirDebug({ rede: false, iaIndisponivel: false, sessaoExpirada: false, latenciaMs: 0, agora: QUARTA })
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
const todas = (letra: RespostaOpcao) => Object.fromEntries(PERGUNTAS.map(p => [p.id, letra]))

/** Cria uma usuária e faz o diagnóstico com a mesma resposta em todas as perguntas. */
async function novaComDiagnostico(letra: RespostaOpcao, email = 'nova@email.com') {
  dados(await s.sessao.cadastrar({ nome: 'Paula Andrade', email, senha: 'Senha123', aceitouTermos: true }))
  dados(await s.diagnostico.iniciarDiagnostico())
  for (const [id, resposta] of Object.entries(todas(letra))) dados(await s.diagnostico.responderPergunta(id, resposta))
  dados(await s.diagnostico.finalizarDiagnostico())
}

const ANALISE =
  'A receita cresceu 27% e a margem líquida melhorou para 12,4%, o que mostra crescimento com lucro. A dívida subiu, mas está em cerca de 2,1 vezes o EBITDA. Recomendo investir com ressalvas, acompanhando o endividamento e o consumo nos próximos trimestres para reavaliar a decisão.'

const briefing = (areaId: string, tema: string): BriefingCase => ({
  areaId,
  dificuldade: 'intermediario',
  tema,
  numCheckpoints: 4,
  numTarefas: 3,
  tipoDados: 'demonstracoes_financeiras',
  observacoes: '',
})

/** A equipe gera, aprova e publica um case novo. Devolve o id. */
async function publicarCaseNovo(areaId: string, tema: string): Promise<string> {
  await entrar('equipe@galapagos.com.br')
  const caso = dados(await s.adminCases.gerarRascunhoComIA(briefing(areaId, tema)))
  dados(await s.adminCases.aprovarCase(caso.id, { gabaritoConfirmado: true }))
  dados(await s.adminCases.publicarCase(caso.id))
  return caso.id
}

/** Marca como concluídos todos os conteúdos do case-1. */
async function concluirConteudosDoCase1() {
  for (const id of ['cont-1', 'cont-2', 'cont-3']) dados(await s.conteudos.concluirConteudo(id))
}

/** Marina termina o último checkpoint do case-1 e envia. */
async function marinaEnvia() {
  await entrar('marina@email.com')
  dados(await s.caso.salvarRascunho('case-1-t-3', { recomendacao: 'Investir com ressalvas', valorJusto: 24.5, analise: ANALISE }))
  dados(await s.caso.concluirCheckpoint('case-1-cp-5'))
  return dados(await s.caso.enviarCase('case-1'))
}

/** A equipe aprova todas as entregas pendentes e publica os resultados. */
async function aprovarTudoEPublicar() {
  await entrar('equipe@galapagos.com.br')
  for (const e of dados(await s.adminCorrecao.listarEntregas())) dados(await s.adminCorrecao.aprovarNota(e.id))
  return dados(await s.adminCorrecao.publicarResultados())
}

/** Do envio da Marina até o certificado. */
async function marinaConclui() {
  await marinaEnvia()
  await aprovarTudoEPublicar()
  await entrar('marina@email.com')
  const [certificado] = dados(await s.certificados.listarMeusCertificados())
  return certificado
}

// --- escolher o case --------------------------------------------------------------

test('escolher o case: o conteúdo só aparece depois, e escolher de novo não muda nada', async () => {
  await novaComDiagnostico('A')
  const antes = dados(await s.caso.obterCase('case-1'))
  assert.equal(antes.estado, 'disponivel')
  assert.equal(antes.contexto, '')
  assert.equal(antes.entenda, null)
  assert.deepEqual(antes.checkpoints, [])
  assert.equal(codigo(await s.caso.obterTarefa('case-1-t-1')), 'VALIDACAO', 'escolha o case primeiro')

  const escolhido = dados(await s.caso.escolherCase('case-1'))
  assert.equal(escolhido.estado, 'em_andamento')
  assert.equal(escolhido.tentativa, 1)
  assert.ok(escolhido.contexto.length > 0)
  assert.equal(escolhido.entenda?.cards.length, 3)
  assert.equal(escolhido.personagem?.nome, 'Clara Menezes')
  assert.deepEqual(escolhido.checkpoints.map(c => c.etapa), ['entenda', 'conteudos', 'situacao', 'situacao', 'situacao'])
  assert.ok(escolhido.checkpoints.every(c => c.status === 'a_fazer'))
  assert.equal(escolhido.pontosPossiveis, 20 + 10 + 30 * 3 + 150 + 100)

  assert.equal(dados(await s.caso.escolherCase('case-1')).estado, 'em_andamento', 'idempotente')
  const trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.podeEscolher, false)
  assert.match(trilha.motivoNaoPodeEscolher ?? '', /em andamento/)
  assert.equal(codigo(await s.caso.escolherCase('case-2')), 'VALIDACAO', 'um case por vez')
})

test('quem começa termina: o case iniciado não expira, mesmo semanas depois', async () => {
  mockDebug.definirAgora(SEGUNDA_9)
  await novaComDiagnostico('A')
  dados(await s.caso.escolherCase('case-1'))
  dados(await s.caso.concluirCheckpoint('case-1-cp-1'))
  await concluirConteudosDoCase1()
  dados(await s.caso.concluirCheckpoint('case-1-cp-2'))
  dados(await s.caso.salvarRascunho('case-1-t-1', { margem: '12,4' }))
  dados(await s.caso.concluirCheckpoint('case-1-cp-3'))
  dados(await s.caso.salvarRascunho('case-1-t-2', { alavancagem: '2,1' }))

  mockDebug.definirAgora('2026-12-14T13:00:00.000Z') // cinco semanas depois
  const trilha = dados(await s.caso.obterTrilha())
  const c1 = trilha.cases.find(c => c.caseId === 'case-1')!
  assert.equal(c1.estado, 'em_andamento')
  assert.deepEqual(c1.progresso, { concluidos: 3, total: 5 })
  assert.equal(trilha.podeEscolher, false)
  assert.equal(codigo(await s.caso.escolherCase('case-2')), 'VALIDACAO', 'ainda não terminou o case 1')
  const retomado = dados(await s.caso.obterCase('case-1'))
  assert.equal(retomado.estado, 'em_andamento')
  assert.deepEqual(dados(await s.caso.obterTarefa('case-1-t-2')).rascunho, { alavancagem: '2,1' })
  dados(await s.caso.salvarRascunho('case-1-t-2', { alavancagem: '2,2' }))
  assert.equal(dados(await s.caso.concluirCheckpoint('case-1-cp-4')).eventos.length, 1)
})

test('checkpoints: abrem em ordem, pagam pontos uma vez e travam as respostas ao concluir', async () => {
  await novaComDiagnostico('A')
  dados(await s.caso.escolherCase('case-1'))
  const saldo = async () => dados(await s.pontos.obterSaldoENivel()).saldo
  assert.equal(await saldo(), 100)

  assert.equal(codigo(await s.caso.concluirCheckpoint('case-1-cp-3')), 'VALIDACAO', 'o anterior vem primeiro')
  assert.equal(codigo(await s.caso.salvarRascunho('case-1-t-1', { margem: '12,4' })), 'VALIDACAO')
  assert.equal(codigo(await s.caso.obterTarefa('case-1-t-1')), 'VALIDACAO')

  assert.deepEqual(dados(await s.caso.concluirCheckpoint('case-1-cp-1')).eventos.map(e => e.pontos), [20], '"entenda a área" paga 20')
  assert.equal(dados(await s.caso.concluirCheckpoint('case-1-cp-1')).eventos.length, 0, 'não paga duas vezes')

  // Os conteúdos são uma etapa obrigatória: só conclui com todos os conteúdos do case concluídos.
  assert.equal(codigo(await s.caso.concluirCheckpoint('case-1-cp-2')), 'VALIDACAO')
  dados(await s.conteudos.concluirConteudo('cont-1'))
  dados(await s.conteudos.concluirConteudo('cont-2'))
  const parcial = await s.caso.concluirCheckpoint('case-1-cp-2')
  assert.equal(codigo(parcial), 'VALIDACAO', 'falta um conteúdo')
  assert.match(parcial.erro!.mensagem, /todos os conteúdos/)
  assert.equal(codigo(await s.caso.obterTarefa('case-1-t-1')), 'VALIDACAO', 'as tarefas seguem fechadas')
  dados(await s.conteudos.concluirConteudo('cont-3'))
  assert.deepEqual(dados(await s.caso.concluirCheckpoint('case-1-cp-2')).eventos.map(e => e.pontos), [10])
  assert.equal(await saldo(), 100 + 20 + 30 + 10)

  const tarefa = dados(await s.caso.obterTarefa('case-1-t-1'))
  const exposto = JSON.stringify(tarefa)
  for (const proibido of ['valorEsperado', 'tolerancia', 'gabarito', 'passoAPasso', 'notaMaxima']) {
    assert.ok(!exposto.includes(proibido), `"${proibido}" não pode chegar à participante`)
  }
  const vazio = await s.caso.concluirCheckpoint('case-1-cp-3')
  assert.equal(codigo(vazio), 'VALIDACAO')
  assert.ok(vazio.erro!.campos!['case-1-t-1.margem'])
  assert.equal(codigo(await s.caso.salvarRascunho('case-1-t-1', { margem: 'x'.repeat(5), inventado: '1' })), 'VALIDACAO')

  dados(await s.caso.salvarRascunho('case-1-t-1', { margem: '12,4' }))
  assert.deepEqual(dados(await s.caso.concluirCheckpoint('case-1-cp-3')).eventos.map(e => e.pontos), [30])
  assert.equal(await saldo(), 190)
  assert.equal(codigo(await s.caso.salvarRascunho('case-1-t-1', { margem: '13' })), 'VALIDACAO', 'concluído, travado')
  assert.equal(dados(await s.caso.obterTarefa('case-1-t-1')).somenteLeitura, true)
  assert.equal(codigo(await s.caso.enviarCase('case-1')), 'VALIDACAO', 'faltam checkpoints')
})

test('progresso: o que já foi feito fica salvo e os pontos não se repetem', async () => {
  await novaComDiagnostico('A')
  dados(await s.caso.escolherCase('case-1'))
  dados(await s.caso.concluirCheckpoint('case-1-cp-1'))
  await concluirConteudosDoCase1()
  dados(await s.caso.concluirCheckpoint('case-1-cp-2'))
  dados(await s.caso.salvarRascunho('case-1-t-1', { margem: '12,4' }))
  dados(await s.caso.concluirCheckpoint('case-1-cp-3'))
  dados(await s.caso.salvarRascunho('case-1-t-2', { alavancagem: '2,1' })) // rascunho do próximo, sem concluir

  const retomado = dados(await s.caso.escolherCase('case-1'))
  assert.equal(retomado.estado, 'em_andamento')
  assert.deepEqual(retomado.checkpoints.map(c => c.status), ['concluido', 'concluido', 'concluido', 'em_andamento', 'a_fazer'])
  assert.deepEqual(dados(await s.caso.obterTarefa('case-1-t-2')).rascunho, { alavancagem: '2,1' }, 'o rascunho foi mantido')
  assert.equal(dados(await s.caso.concluirCheckpoint('case-1-cp-3')).eventos.length, 0)
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 190, 'nada pago de novo')
})

// --- avaliação, certificado e próximos cases -------------------------------------------

test('ciclo completo: envio, avaliação, aprovação e certificado abrem os próximos cases', async () => {
  const marinaAntes = await entrar('marina@email.com')
  assert.equal(marinaAntes.papel, 'participante')
  dados(await s.caso.salvarRascunho('case-1-t-3', { recomendacao: 'Investir com ressalvas', valorJusto: 24.5, analise: ANALISE }))
  assert.deepEqual(dados(await s.caso.concluirCheckpoint('case-1-cp-5')).eventos.map(e => e.pontos), [30])
  assert.deepEqual(dados(await s.caso.obterTrilha()).cases.find(c => c.caseId === 'case-1')!.progresso, { concluidos: 5, total: 5 })

  dados(await s.caso.enviarCase('case-1'))
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 270, 'enviar não paga: os checkpoints já pagaram')
  assert.equal(codigo(await s.caso.enviarCase('case-1')), 'VALIDACAO')
  assert.equal(dados(await s.caso.obterResultadoCase('case-1')).estado, 'em_avaliacao')
  assert.equal(dados(await s.caso.obterTrilha()).cases.find(c => c.caseId === 'case-1')!.estado, 'em_avaliacao')

  // Equipe
  await entrar('equipe@galapagos.com.br')
  const fila = dados(await s.adminCorrecao.listarEntregas())
  assert.equal(fila.length, 4)
  assert.equal(codigo(await s.adminCorrecao.publicarResultados()), 'VALIDACAO', 'há entregas pendentes')
  for (const e of fila) dados(await s.adminCorrecao.aprovarNota(e.id))
  assert.equal(dados(await s.adminCorrecao.publicarResultados()).publicados, 4)

  // Antes e depois de publicar: só então ela vê nota e certificado
  await entrar('marina@email.com')
  const resultado = dados(await s.caso.obterResultadoCase('case-1'))
  assert.equal(resultado.estado, 'publicado')
  if (resultado.estado !== 'publicado') return
  assert.ok(resultado.nota >= resultado.notaMinima)
  assert.equal(resultado.aprovada, true)
  assert.equal(resultado.tentativa, 1)
  assert.ok(resultado.certificadoId)
  assert.equal(resultado.pontosGanhos, Math.round((resultado.nota / 10) * 150) + 100)
  const saldo = dados(await s.pontos.obterSaldoENivel()).saldo
  assert.equal(saldo, 270 + resultado.pontosGanhos)
  assert.equal(saldo, dados(await s.pontos.listarExtrato()).reduce((soma, e) => soma + e.pontos, 0), 'o saldo é sempre a soma do extrato')

  const trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.primeiroCaseConcluido, true)
  const c1 = trilha.cases.find(c => c.caseId === 'case-1')!
  assert.equal(c1.estado, 'concluido')
  assert.equal(c1.certificadoId, resultado.certificadoId)
  assert.equal(trilha.cases.find(c => c.caseId === 'case-2')!.estado, 'disponivel', 'a ilha 2 abriu')
  assert.equal(trilha.proximoCaseId, 'case-2')
  assert.equal(trilha.cases.find(c => c.caseId === 'case-2')!.sugerido, true)
  assert.equal(trilha.podeEscolher, true, 'sem prazo nem semana: a ilha seguinte abre no mesmo dia')
  assert.equal(dados(await s.caso.escolherCase('case-2')).estado, 'em_andamento')
})

test('enviado e ainda em avaliação conta como não terminado: nada novo começa', async () => {
  await marinaEnvia()
  const trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.cases.find(c => c.caseId === 'case-1')!.estado, 'em_avaliacao')
  assert.equal(trilha.podeEscolher, false)
  assert.match(trilha.motivoNaoPodeEscolher ?? '', /Termine o case em andamento/)
  assert.equal(codigo(await s.caso.escolherCase('case-2')), 'VALIDACAO')
})

test('ilhas em ordem: um case novo entra no fim da trilha e espera as ilhas anteriores', async () => {
  const novoId = await publicarCaseNovo('operacoes', 'Conferindo as operações do dia')
  await marinaConclui()
  const trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.cases.at(-1)!.caseId, novoId, 'a última ilha')
  assert.equal(trilha.cases.at(-1)!.estado, 'bloqueado')
  assert.match(trilha.cases.at(-1)!.motivoBloqueio ?? '', /Conclua a ilha 2/)
  assert.equal(trilha.cases.at(-1)!.sugerido, false)
  assert.equal(trilha.proximoCaseId, 'case-2', 'a próxima é a primeira não concluída')
})

test('sem aprovação não há certificado nem bônus, e ela pode refazer em uma nova tentativa', async () => {
  await marinaConclui() // publica também a entrega da Beatriz, que fica abaixo da nota mínima
  await entrar('beatriz@email.com')
  const resultado = dados(await s.caso.obterResultadoCase('case-1'))
  assert.equal(resultado.estado, 'publicado')
  if (resultado.estado !== 'publicado') return
  assert.equal(resultado.aprovada, false)
  assert.equal(resultado.certificadoId, null)
  assert.equal(resultado.pontosGanhos, 0, 'sem bônus para quem não foi aprovada')
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 0)
  assert.equal(dados(await s.certificados.listarMeusCertificados()).length, 0)

  let trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.primeiroCaseConcluido, false)
  const caso = trilha.cases.find(c => c.caseId === 'case-1')!
  assert.equal(caso.estado, 'disponivel')
  assert.equal(caso.refazer, true)
  assert.equal(dados(await s.caso.obterCase('case-1')).tentativa, 2)

  const nova = dados(await s.caso.escolherCase('case-1'))
  assert.equal(nova.estado, 'em_andamento')
  assert.equal(nova.tentativa, 2)
  assert.ok(nova.checkpoints.every(c => c.status === 'a_fazer'), 'a nova tentativa recomeça a situação')
  assert.equal(codigo(await s.caso.enviarCase('case-1')), 'VALIDACAO')
  trilha = dados(await s.caso.obterTrilha())
  assert.equal(trilha.cases.find(c => c.caseId === 'case-1')!.estado, 'em_andamento')
})

test('pedido de revisão que aprova quem não tinha passado emite o certificado e paga o bônus', async () => {
  await marinaConclui()
  await entrar('beatriz@email.com')
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, 0)
  const pedido = dados(await s.caso.pedirRevisao('case-1-t-2', 'Usei o EBITDA ajustado que o enunciado informou.'))

  await entrar('equipe@galapagos.com.br')
  dados(await s.adminCorrecao.resolverPedidoRevisao(pedido.id, { resposta: 'Revisamos e ajustamos a nota.', novaNota: 8 }))

  await entrar('beatriz@email.com')
  const resultado = dados(await s.caso.obterResultadoCase('case-1'))
  assert.equal(resultado.estado === 'publicado' && resultado.nota, 8)
  assert.equal(resultado.estado === 'publicado' && resultado.aprovada, true)
  assert.equal(dados(await s.pontos.obterSaldoENivel()).saldo, Math.round(0.8 * 150) + 100)
  assert.equal(dados(await s.certificados.listarMeusCertificados()).length, 1)
  assert.equal(dados(await s.caso.obterTrilha()).primeiroCaseConcluido, true)
})

test('IA indisponível na correção: a entrega vira correção manual e exige a nota da equipe', async () => {
  mockDebug.definir({ iaIndisponivel: true })
  await marinaEnvia()
  await entrar('equipe@galapagos.com.br')
  const dela = dados(await s.adminCorrecao.listarEntregas()).find(e => e.participanteNome === 'Marina Costa')!
  assert.equal(dela.origem, 'manual')
  assert.equal(dela.notaSugerida, null)
  assert.equal(codigo(await s.adminCorrecao.aprovarNota(dela.id)), 'VALIDACAO')
  dados(await s.adminCorrecao.ajustarNotaEFeedback({ entregaId: dela.id, notaFinal: 7, feedback: 'Boa análise.' }))
  assert.equal(dados(await s.adminCorrecao.aprovarNota(dela.id)).status, 'revisada')
})

// --- certificado: PDF, LinkedIn e validação -----------------------------------------------

test('certificado em PDF: nome do case e da usuária, código e estrutura válida', async () => {
  const certificado = await marinaConclui()
  const arquivo = dados(await s.certificados.baixarCertificado(certificado.id))
  assert.equal(arquivo.nomeArquivo, 'certificado-avaliando-uma-empresa-para-investir-marina-costa.pdf')
  assert.equal(arquivo.mimeType, 'application/pdf')
  assert.ok(arquivo.url.startsWith('data:application/pdf;base64,'))

  const pdf = atob(arquivo.url.split(',')[1])
  assert.ok(pdf.startsWith('%PDF-1.4'))
  assert.ok(pdf.endsWith('%%EOF\n'))
  assert.ok(pdf.includes('(Marina Costa)'), 'o nome dela')
  assert.ok(pdf.includes('(Avaliando uma empresa para investir)'), 'o nome do case')
  assert.ok(pdf.includes('(Certificado de conclus\\343o)'), 'acentos em WinAnsi (octal)')
  assert.ok(pdf.includes(`(C\\363digo de verifica\\347\\343o: ${certificado.codigo})`))
  assert.ok(pdf.includes('(\\301rea: Equity Research)'))
  assert.ok(pdf.includes('(Emitido em 11 de novembro de 2026)'))

  // Estrutura: tamanho do conteúdo e tabela de referências cruzadas apontam para os lugares certos.
  const conteudo = pdf.match(/\/Length (\d+) >>\nstream\n([\s\S]*)endstream/)!
  assert.equal(Number(conteudo[1]), conteudo[2].length)
  const inicio = Number(pdf.match(/startxref\n(\d+)\n%%EOF/)![1])
  assert.ok(pdf.slice(inicio).startsWith('xref\n0 7\n'))
  const entradas = [...pdf.slice(inicio).matchAll(/^(\d{10}) 00000 n $/gm)]
  assert.equal(entradas.length, 6)
  entradas.forEach((m, i) => assert.ok(pdf.slice(Number(m[1])).startsWith(`${i + 1} 0 obj`), `objeto ${i + 1}`))
})

test('certificado: só a dona baixa, e o LinkedIn leva o código e o endereço de validação', async () => {
  const certificado = await marinaConclui()
  assert.match(certificado.codigo, /^GPE-\d{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
  assert.equal(certificado.area, 'Equity Research')
  assert.ok(certificado.urlValidacao.includes('#/validate?codigo='))

  const link = dados(await s.certificados.obterLinkLinkedIn(certificado.id)).url
  assert.ok(link.startsWith('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME'))
  assert.ok(link.includes(`name=${encodeURIComponent('Avaliando uma empresa para investir')}`))
  assert.ok(link.includes(`certId=${certificado.codigo}`))
  assert.ok(link.includes(`certUrl=${encodeURIComponent(certificado.urlValidacao)}`))
  assert.ok(link.includes('issueYear=2026') && link.includes('issueMonth=11'))

  // Validação pública, sem login, devolve só o mínimo.
  dados(await s.sessao.sair())
  const valido = dados(await s.certificados.validarCertificado(` ${certificado.codigo.toLowerCase()} `))
  assert.deepEqual(Object.keys(valido!).sort(), ['emitidoEm', 'nome', 'tituloCase'])
  assert.equal(valido!.nome, 'Marina Costa')
  assert.equal(dados(await s.certificados.validarCertificado('GPE-0000-0000-0000')), null)

  await entrar('beatriz@email.com')
  assert.equal(codigo(await s.certificados.baixarCertificado(certificado.id)), 'NAO_ENCONTRADO')
  assert.equal(codigo(await s.certificados.obterLinkLinkedIn(certificado.id)), 'NAO_ENCONTRADO')
})

// --- admin: publicar e arquivar -------------------------------------------------------------

test('admin: aprovar, publicar e arquivar; case publicado não se edita', async () => {
  await entrar('equipe@galapagos.com.br')
  const status = async () => Object.fromEntries(dados(await s.adminCases.listarCases()).map(c => [c.id, c.status]))
  assert.deepEqual(await status(), { 'case-1': 'publicado', 'case-2': 'publicado', 'case-3': 'rascunho_ia' })

  assert.equal(codigo(await s.adminCases.publicarCase('case-3')), 'VALIDACAO', 'precisa estar revisado')
  dados(await s.adminCases.regenerarSecao('case-3', 'gabarito'))
  dados(await s.adminCases.aprovarCase('case-3', { gabaritoConfirmado: true }))
  const caso = dados(await s.adminCases.obterCase('case-3'))
  assert.equal(dados(await s.adminCases.salvarCase({ ...caso, titulo: 'Gestão de risco numa carteira' })).status, 'rascunho', 'editar um revisado exige nova revisão')
  dados(await s.adminCases.aprovarCase('case-3', { gabaritoConfirmado: true }))

  assert.equal(dados(await s.adminCases.publicarCase('case-3')).status, 'publicado')
  const publicado = dados(await s.adminCases.obterCase('case-3'))
  assert.equal(codigo(await s.adminCases.salvarCase({ ...publicado, titulo: 'Outro' })), 'VALIDACAO')
  assert.equal(codigo(await s.adminCases.regenerarSecao('case-3', 'contexto')), 'VALIDACAO')
  dados(await s.adminCases.arquivarCase('case-2'))
  assert.equal(codigo(await s.adminCases.arquivarCase('case-2')), 'VALIDACAO', 'não arquiva duas vezes')
})

test('admin: case arquivado sai da oferta, mas quem já começou mantém o progresso', async () => {
  await entrar('equipe@galapagos.com.br')
  dados(await s.adminCases.arquivarCase('case-1'))

  await entrar('marina@email.com')
  const dela = dados(await s.caso.obterTrilha()).cases.find(c => c.caseId === 'case-1')
  assert.equal(dela?.estado, 'em_andamento', 'a Marina já tinha começado')
  dados(await s.caso.salvarRascunho('case-1-t-3', { recomendacao: 'Investir', analise: ANALISE }))
  dados(await s.caso.concluirCheckpoint('case-1-cp-5'))

  dados(await s.sessao.sair())
  await novaComDiagnostico('A')
  assert.deepEqual(dados(await s.caso.obterTrilha()).cases.map(c => c.caseId), ['case-2'], 'quem não começou não vê o arquivado')
  assert.equal(codigo(await s.caso.escolherCase('case-1')), 'NAO_ENCONTRADO')
})
