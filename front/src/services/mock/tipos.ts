/** Tipos internos do adaptador mock (o "banco" em memória). Não fazem parte dos contratos. */
import type {
  CaseAdmin,
  Certificado,
  ConteudoAdmin,
  DataISO,
  EventoPontos,
  PedidoRevisaoAdmin,
  Papel,
  RespostaOpcao,
  ResultadoDiagnostico,
  RespostasDaTarefa,
  StatusEntrega,
  SugestaoCorrecao,
  PreferenciasEmail,
} from '../contratos.ts'

export type Usuario = {
  id: string
  email: string
  /** Senha em texto puro: existe só neste mock de demonstração. */
  senha: string
  papel: Papel
  nome: string
  nomeSocial: string | null
  dataNascimento: DataISO | null
  cidade: string | null
  uf: string | null
  escolaridade: string | null
  objetivo: string | null
  perfilCompleto: boolean
  termosAceitosEm: DataISO | null
  termosVersao: string | null
  /** Ausente nos dados antigos: vale o padrão. */
  preferenciasEmail?: PreferenciasEmail
  criadoEm: DataISO
}

export type EventoRegistrado = EventoPontos & {
  usuarioId: string
  /** Garante que a mesma ação não conceda pontos duas vezes. */
  chave: string
}

export type DiagnosticoRegistro = {
  status: 'em_andamento' | 'concluido'
  respostas: Record<string, RespostaOpcao>
  iniciadoEm: DataISO
  concluidoEm: DataISO | null
  /** Histórico de resultados, do mais antigo ao mais recente. Cada um guarda as suas versões. */
  resultados: ResultadoDiagnostico[]
}

export type RascunhoRegistro = { respostas: RespostasDaTarefa; salvoEm: DataISO }

export type EntregaRegistro = {
  id: string
  usuarioId: string
  caseId: string
  enviadaEm: DataISO
  /** 1 na primeira tentativa. */
  tentativa: number
  status: StatusEntrega
  respostas: Record<string, RespostasDaTarefa>
  sugestao: SugestaoCorrecao
  notaFinal: number | null
  feedbackFinal: string | null
  aprovadaPor: string | null
  aprovadaEm: DataISO | null
  publicadaEm: DataISO | null
  pontosGanhos: number
  certificadoId: string | null
}

/** O percurso de uma usuária em um case. Um registro por case; a tentativa sobe a cada nova tentativa. */
export type ProgressoRegistro = {
  usuarioId: string
  caseId: string
  /** Quando ela escolheu (ou reescolheu) o case. */
  escolhidoEm: DataISO
  tentativa: number
  /** Preenchido quando a tentativa atual foi enviada. */
  enviadaEm: DataISO | null
}

export type PedidoRegistro = PedidoRevisaoAdmin & {
  usuarioId: string | null
  resposta: string | null
}

export type CertificadoRegistro = Certificado & { usuarioId: string }

export type TokenRedefinicao = { token: string; usuarioId: string; expiraEm: DataISO }

export type TentativaLogin = { falhas: number; bloqueadoAte: number | null }

export type EstadoMock = {
  versao: number
  contador: number
  usuarios: Usuario[]
  sessaoUsuarioId: string | null
  tentativasLogin: Record<string, TentativaLogin>
  tokensRedefinicao: TokenRedefinicao[]
  eventos: EventoRegistrado[]
  diagnosticos: Record<string, DiagnosticoRegistro>
  cases: CaseAdmin[]
  rascunhos: Record<string, RascunhoRegistro>
  checkpointsConcluidos: Record<string, string[]>
  conteudos: ConteudoAdmin[]
  conteudosConcluidos: Record<string, string[]>
  entregas: EntregaRegistro[]
  progressos: ProgressoRegistro[]
  pedidosRevisao: PedidoRegistro[]
  certificados: CertificadoRegistro[]
}

export type DebugMock = {
  /** Todas as chamadas falham com REDE. */
  rede: boolean
  /** A IA falha: ativa os fallbacks do diagnóstico, da geração e da correção. */
  iaIndisponivel: boolean
  /** Chamadas que exigem login falham com SEM_LOGIN. */
  sessaoExpirada: boolean
  /** Latência simulada em ms. */
  latenciaMs: number
  /** Relógio simulado (ISO). `null` usa a hora real. */
  agora: DataISO | null
}
