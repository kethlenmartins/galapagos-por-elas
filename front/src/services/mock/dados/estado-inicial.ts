/**
 * Estado inicial de demonstração. Todos os usuários usam a senha "Senha123".
 *
 *   marina@email.com           participante, no meio do case da semana
 *   equipe@galapagos.com.br    equipe
 *   luiza@, beatriz@, camila@  participantes que já entregaram o case (na fila de correção)
 */
import type { BriefingCase, CaseAdmin, EventoPontos, RespostasDaTarefa } from '../../contratos.ts'
import { gerarResultado, type Respostas } from '../../fit/motor.ts'
import { corrigirEntrega } from '../correcao.ts'
import { DIA, HORA, MINUTO, antesDe, depoisDe } from '../datas.ts'
import { gerarCase } from '../gerador.ts'
import type { EntregaRegistro, EstadoMock, EventoRegistrado, Usuario } from '../tipos.ts'
import { criarCaseAtual } from './case-semana.ts'
import { CONFIG, REGRAS_DE_PONTOS, type IdRegra } from './config.ts'
import { CONTEUDOS_INICIAIS } from './conteudos.ts'

/** Muda sempre que o formato do estado muda: descarta o que estava salvo no navegador. */
export const VERSAO_ESTADO = 4

const SENHA_DEMO = 'Senha123'

function usuario(
  id: string,
  nome: string,
  email: string,
  papel: Usuario['papel'],
  agora: Date,
  perfilCompleto = true,
): Usuario {
  return {
    id,
    email,
    senha: SENHA_DEMO,
    papel,
    nome,
    nomeSocial: null,
    dataNascimento: perfilCompleto ? '2002-05-14T12:00:00.000Z' : null,
    cidade: perfilCompleto ? 'São Paulo' : null,
    uf: perfilCompleto ? 'SP' : null,
    escolaridade: perfilCompleto ? 'Superior em andamento' : null,
    objetivo: perfilCompleto ? 'Descobrir qual área do mercado financeiro combina comigo' : null,
    perfilCompleto,
    termosAceitosEm: antesDe(agora, 20 * DIA),
    termosVersao: CONFIG.versaoTermos,
    criadoEm: antesDe(agora, 20 * DIA),
  }
}

let sequenciaDeEventos = 0
function evento(usuarioId: string, regra: IdRegra, origem: string, data: string, chave: string, pontos?: number): EventoRegistrado {
  sequenciaDeEventos += 1
  const r = REGRAS_DE_PONTOS[regra]
  return { id: `ev-seed-${sequenciaDeEventos}`, usuarioId, acao: r.acao, origem, data, pontos: pontos ?? r.pontos, chave } satisfies EventoPontos & {
    usuarioId: string
    chave: string
  }
}

const BRIEFING_BASE: Omit<BriefingCase, 'areaId' | 'tema'> = {
  dificuldade: 'intermediario',
  numCheckpoints: 4,
  numTarefas: 3,
  tipoDados: 'demonstracoes_financeiras',
  observacoes: '',
}

const ANALISE_LUIZA =
  'A Aurora Moda cresceu 27% em 2025 e melhorou a margem líquida para 12,4%, o que mostra que o crescimento está gerando lucro. A dívida líquida subiu, mas ainda equivale a cerca de 2,1 vezes o EBITDA, um nível administrável. Eu recomendaria o investimento com ressalvas: o principal risco é o aumento do endividamento para financiar novas lojas. Eu acompanharia a evolução da dívida e do consumo nos próximos trimestres.'
const ANALISE_BEATRIZ = 'A empresa está crescendo bastante e tem lucro, então acho que vale a pena investir.'
const ANALISE_CAMILA =
  'A receita cresceu 27% e a margem melhorou. A dívida aumentou, então a empresa depende de crédito para crescer. Recomendo investir com cuidado e acompanhar o endividamento.'

function entregaDeDemonstracao(
  id: string,
  usuarioId: string,
  caso: CaseAdmin,
  enviadaEm: string,
  respostas: Record<string, RespostasDaTarefa>,
): EntregaRegistro {
  return {
    id,
    usuarioId,
    caseId: caso.id,
    enviadaEm,
    tentativa: 1,
    status: 'pendente',
    respostas,
    sugestao: corrigirEntrega(caso, respostas, true),
    notaFinal: null,
    feedbackFinal: null,
    aprovadaPor: null,
    aprovadaEm: null,
    publicadaEm: null,
    pontosGanhos: 0,
    certificadoId: null,
  }
}

export function criarEstadoInicial(agora: Date): EstadoMock {
  sequenciaDeEventos = 0
  const caseAtual = criarCaseAtual(agora)

  // Segundo case, de outra área: já publicado, abre para quem destravou.
  const segundoCase: CaseAdmin = {
    ...gerarCase({ ...BRIEFING_BASE, areaId: 'credito-risco', tema: 'Construindo uma análise de crédito' }, { id: 'case-2', agora, status: 'rascunho', ordem: 2 }),
    status: 'publicado',
    conteudoIds: ['cont-4'],
    gabaritoConfirmado: true,
    revisadoEm: antesDe(agora, 1 * DIA),
  }

  // Rascunho gerado pela IA com um erro de conta no gabarito: a conferência acusa divergência.
  const rascunhoComErro = gerarCase({ ...BRIEFING_BASE, areaId: 'credito-risco', tema: 'Gestão de risco em uma carteira' }, { id: 'case-3', agora })
  const linhaLucro = rascunhoComErro.dadosApoio?.linhas.find(l => l.rotulo === 'Lucro líquido')
  if (linhaLucro) linhaLucro.celulas[1] = { texto: 'R$ 13,3 mi', valor: 13.3 }
  rascunhoComErro.gabarito[0].passoAPasso = 'Lucro líquido de 2025 (13,3) ÷ receita de 2025 (104) × 100 = 12,4%.'

  const usuarios = [
    usuario('usr-marina', 'Marina Costa', 'marina@email.com', 'participante', agora),
    usuario('usr-ana', 'Ana Souza', 'equipe@galapagos.com.br', 'equipe', agora),
    usuario('usr-luiza', 'Luiza Santos', 'luiza@email.com', 'participante', agora),
    usuario('usr-beatriz', 'Beatriz Lima', 'beatriz@email.com', 'participante', agora),
    usuario('usr-camila', 'Camila Rocha', 'camila@email.com', 'participante', agora),
  ]

  // Marina: diagnóstico feito, 3 de 4 checkpoints concluídos.
  // Perfil analítico, de longo prazo e com autonomia: o resultado é calculado pelo motor, não escrito à mão.
  const respostasMarina: Respostas = {
    Q01: 'A', Q02: 'A', Q03: 'A', Q04: 'A', Q05: 'A', Q06: 'A', Q07: 'B', Q08: 'A',
    Q09: 'C', Q10: 'A', Q11: 'A', Q12: 'B', Q13: 'B', Q14: 'A', Q15: 'A',
  }
  const tituloCase = caseAtual.titulo

  return {
    versao: VERSAO_ESTADO,
    contador: 100,
    usuarios,
    sessaoUsuarioId: null,
    tentativasLogin: {},
    tokensRedefinicao: [],
    eventos: [
      evento('usr-marina', 'perfil_completo', 'Onboarding', antesDe(agora, 4 * DIA + 3 * HORA), 'perfil_completo'),
      evento('usr-marina', 'diagnostico', 'Diagnóstico de perfil', antesDe(agora, 4 * DIA + 2 * HORA), 'diagnostico'),
      evento('usr-marina', 'checkpoint', tituloCase, antesDe(agora, 2 * DIA), `checkpoint:${caseAtual.id}-cp-1`, 20),
      evento('usr-marina', 'conteudo', 'O que é valuation?', antesDe(agora, 1 * DIA + 12 * HORA), 'conteudo:cont-1'),
      evento('usr-marina', 'conteudo', 'Lendo um balanço', antesDe(agora, 1 * DIA + 10 * HORA), 'conteudo:cont-2'),
      evento('usr-marina', 'conteudo', CONTEUDOS_INICIAIS[2].titulo, antesDe(agora, 1 * DIA + 8 * HORA), 'conteudo:cont-3'),
      evento('usr-marina', 'checkpoint', tituloCase, antesDe(agora, 1 * DIA + 7 * HORA), `checkpoint:${caseAtual.id}-cp-2`, 10),
      evento('usr-marina', 'checkpoint', tituloCase, antesDe(agora, 1 * DIA + 6 * HORA), `checkpoint:${caseAtual.id}-cp-3`),
      evento('usr-marina', 'checkpoint', tituloCase, antesDe(agora, 30 * MINUTO), `checkpoint:${caseAtual.id}-cp-4`),
    ],
    diagnosticos: {
      'usr-marina': {
        status: 'concluido',
        respostas: respostasMarina,
        iniciadoEm: antesDe(agora, 4 * DIA + 3 * HORA),
        concluidoEm: antesDe(agora, 4 * DIA + 2 * HORA),
        resultados: [gerarResultado(respostasMarina, { id: 'diag-seed-1', agora: antesDe(agora, 4 * DIA + 2 * HORA) })],
      },
    },
    cases: [caseAtual, segundoCase, rascunhoComErro],
    rascunhos: {
      [`usr-marina:${caseAtual.id}-t-1`]: { respostas: { margem: '12,4' }, salvoEm: antesDe(agora, 1 * DIA + 6 * HORA) },
      [`usr-marina:${caseAtual.id}-t-2`]: { respostas: { alavancagem: '2,1' }, salvoEm: antesDe(agora, 30 * MINUTO) },
    },
    checkpointsConcluidos: { 'usr-marina': [1, 2, 3, 4].map(n => `${caseAtual.id}-cp-${n}`) },
    conteudos: CONTEUDOS_INICIAIS,
    conteudosConcluidos: { 'usr-marina': ['cont-1', 'cont-2', 'cont-3'] },
    progressos: [
      // Marina escolheu o case há 2 dias e tem 2 dias e 14 horas até o prazo (demonstração; o prazo real é sempre uma sexta, 23h59).
      { usuarioId: 'usr-marina', caseId: caseAtual.id, escolhidoEm: antesDe(agora, 2 * DIA), prazoEm: depoisDe(agora, 2 * DIA + 14 * HORA), tentativa: 1, enviadaEm: null },
      { usuarioId: 'usr-luiza', caseId: caseAtual.id, escolhidoEm: antesDe(agora, 4 * DIA), prazoEm: depoisDe(agora, 1 * DIA), tentativa: 1, enviadaEm: antesDe(agora, 3 * HORA) },
      { usuarioId: 'usr-beatriz', caseId: caseAtual.id, escolhidoEm: antesDe(agora, 4 * DIA), prazoEm: depoisDe(agora, 1 * DIA), tentativa: 1, enviadaEm: antesDe(agora, 5 * HORA) },
      { usuarioId: 'usr-camila', caseId: caseAtual.id, escolhidoEm: antesDe(agora, 4 * DIA), prazoEm: depoisDe(agora, 1 * DIA), tentativa: 1, enviadaEm: antesDe(agora, 20 * HORA) },
    ],
    entregas: [
      entregaDeDemonstracao('entrega-seed-1', 'usr-luiza', caseAtual, antesDe(agora, 3 * HORA), {
        [`${caseAtual.id}-t-1`]: { margem: '12,4%' },
        [`${caseAtual.id}-t-2`]: { alavancagem: '2,1x' },
        [`${caseAtual.id}-t-3`]: { recomendacao: 'Investir com ressalvas', valorJusto: 24.5, analise: ANALISE_LUIZA },
      }),
      entregaDeDemonstracao('entrega-seed-2', 'usr-beatriz', caseAtual, antesDe(agora, 5 * HORA), {
        [`${caseAtual.id}-t-1`]: { margem: '12.4 %' },
        [`${caseAtual.id}-t-2`]: { alavancagem: '2,5' },
        [`${caseAtual.id}-t-3`]: { recomendacao: 'Investir', analise: ANALISE_BEATRIZ },
      }),
      entregaDeDemonstracao('entrega-seed-3', 'usr-camila', caseAtual, antesDe(agora, 20 * HORA), {
        [`${caseAtual.id}-t-1`]: { margem: '12,35%' },
        [`${caseAtual.id}-t-2`]: { alavancagem: '2,1' },
        [`${caseAtual.id}-t-3`]: { recomendacao: 'Investir com ressalvas', analise: ANALISE_CAMILA },
      }),
    ],
    pedidosRevisao: [
      {
        id: 'pedido-seed-1',
        entregaId: null,
        tarefaId: null,
        usuarioId: null,
        participanteNome: 'Júlia Lima',
        caseTitulo: 'Introdução ao mercado de capitais',
        motivo: 'Acredito que meu cálculo usou a mesma tolerância do enunciado.',
        status: 'aberto',
        criadoEm: antesDe(agora, 6 * DIA),
        resposta: null,
      },
      {
        id: 'pedido-seed-2',
        entregaId: null,
        tarefaId: null,
        usuarioId: null,
        participanteNome: 'Larissa Moura',
        caseTitulo: 'Introdução ao mercado de capitais',
        motivo: 'Marquei a alternativa correta, mas a nota considerou outra resposta.',
        status: 'aberto',
        criadoEm: antesDe(agora, 6 * DIA),
        resposta: null,
      },
    ],
    certificados: [],
  }
}
