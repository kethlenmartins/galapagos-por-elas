/**
 * Contratos da plataforma Galapagos por Elas.
 *
 * Este arquivo só tem tipos. Ele é a especificação do backend: o adaptador mock
 * (./mock) e a futura implementação real (backend próprio, com autenticação própria e IA pela API da OpenAI) precisam
 * cumprir exatamente estas interfaces. As telas só conhecem este arquivo.
 *
 * Regras que valem para todas as funções:
 * - Toda função devolve `Resultado<T>`; nunca lança erro esperado.
 * - Datas são strings ISO 8601 (UTC). A formatação é responsabilidade da tela.
 * - Pontos são concedidos SOMENTE pelo servidor. As funções que concedem pontos
 *   devolvem os `EventoPontos` criados; a tela mostra o aviso a partir deles e
 *   nunca soma pontos por conta própria.
 * - O gabarito nunca é devolvido para a participante.
 * - Nota e feedback só chegam à participante depois de aprovados e publicados
 *   pela equipe.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export type DataISO = string

export type Papel = 'participante' | 'equipe'

export type CodigoErro =
  | 'SEM_LOGIN'
  | 'SEM_PERMISSAO'
  | 'NAO_ENCONTRADO'
  | 'VALIDACAO'
  | 'LIMITE_EXCEDIDO'
  | 'IA_INDISPONIVEL'
  | 'REDE'

export type ErroServico = {
  codigo: CodigoErro
  /** Texto pronto para mostrar à usuária, em português. */
  mensagem: string
  /** Erros por campo de formulário (nome do campo -> mensagem). */
  campos?: Record<string, string>
}

export type Resultado<T> = { dados: T; erro: null } | { dados: null; erro: ErroServico }

// ---------------------------------------------------------------------------
// Sessão e perfil
// ---------------------------------------------------------------------------

export type Sessao = {
  id: string
  nome: string
  email: string
  papel: Papel
  perfilCompleto: boolean
}

export type DadosCadastro = {
  nome: string
  email: string
  senha: string
  aceitouTermos: boolean
}

export type Perfil = {
  id: string
  nome: string
  nomeSocial: string | null
  email: string
  papel: Papel
  dataNascimento: DataISO | null
  cidade: string | null
  uf: string | null
  escolaridade: string | null
  objetivo: string | null
  perfilCompleto: boolean
  termosAceitosEm: DataISO | null
  termosVersao: string | null
  preferenciasEmail: PreferenciasEmail
}

export type PreferenciasEmail = { novosCases: boolean; lembretesPrazo: boolean; novosConteudos: boolean }

export type AtualizacaoPerfil = Partial<Pick<Perfil, 'nome' | 'nomeSocial' | 'dataNascimento' | 'cidade' | 'uf' | 'escolaridade' | 'objetivo'>> & {
  /** Só as preferências enviadas mudam. */
  preferenciasEmail?: Partial<PreferenciasEmail>
}

export interface SessaoService {
  /** Cria a conta e já inicia a sessão. Papel sempre `participante`. */
  cadastrar(dados: DadosCadastro): Promise<Resultado<Sessao>>
  /** Mensagem de erro genérica: nunca revela se o e-mail existe. */
  entrar(email: string, senha: string): Promise<Resultado<Sessao>>
  sair(): Promise<Resultado<true>>
  sairDeTodosOsAparelhos(): Promise<Resultado<true>>
  /** Exige a senha atual. A nova segue as mesmas regras do cadastro. */
  alterarSenha(senhaAtual: string, novaSenha: string): Promise<Resultado<true>>
  /** Sempre responde sucesso, exista ou não a conta. */
  recuperarSenha(email: string): Promise<Resultado<true>>
  /** `token` vem do link enviado por e-mail. */
  redefinirSenha(token: string, novaSenha: string): Promise<Resultado<true>>
  /** Sem sessão ativa devolve `dados: null` com sucesso. Sessão expirada devolve SEM_LOGIN. */
  obterSessao(): Promise<Resultado<Sessao | null>>
  /** Exige a senha. Apaga a conta e todos os dados da usuária. */
  excluirConta(senha: string): Promise<Resultado<true>>
}

export interface PerfilService {
  obterPerfil(): Promise<Resultado<Perfil>>
  /** Concede pontos de "perfil completo" na primeira vez que o perfil fica completo. */
  atualizarPerfil(dados: AtualizacaoPerfil): Promise<Resultado<{ perfil: Perfil; eventos: EventoPontos[] }>>
  registrarAceiteTermos(versao: string): Promise<Resultado<Perfil>>
  /** LGPD: todos os dados da usuária em um objeto serializável. */
  exportarMeusDados(): Promise<Resultado<Record<string, unknown>>>
}

// ---------------------------------------------------------------------------
// Áreas
// ---------------------------------------------------------------------------

export type Area = {
  id: string
  nome: string
  /** Uma frase sobre o que a área faz. */
  oQueFaz: string
  descricao: string
}

export interface CatalogoService {
  listarAreas(): Promise<Resultado<Area[]>>
  obterArea(areaId: string): Promise<Resultado<Area>>
}

// ---------------------------------------------------------------------------
// Pontos
// ---------------------------------------------------------------------------

export type EventoPontos = {
  id: string
  /** Texto curto da ação, ex.: "Diagnóstico concluído". */
  acao: string
  /** De onde veio, ex.: nome do case ou do conteúdo. */
  origem: string
  data: DataISO
  pontos: number
}

export type Nivel = { numero: number; nome: string; pontosNecessarios: number }

export type SaldoENivel = {
  saldo: number
  nivel: Nivel
  /** `null` no último nível. */
  proximoNivel: Nivel | null
  /** Pontos que faltam para o próximo nível. `0` no último nível. */
  faltam: number
  /** Progresso dentro do nível atual, de 0 a 1. */
  progresso: number
}

export type RegraDePontos = { id: string; acao: string; pontos: number; descricao: string }

export interface PontosService {
  /** Somente leitura: os pontos são concedidos pelo servidor. */
  obterSaldoENivel(): Promise<Resultado<SaldoENivel>>
  listarExtrato(filtro?: { dias?: number }): Promise<Resultado<EventoPontos[]>>
  /** Tabela "Como ganhar pontos". */
  listarRegrasDePontos(): Promise<Resultado<RegraDePontos[]>>
}

// ---------------------------------------------------------------------------
// Diagnóstico de fit (PRD "Diagnóstico de Fit" v1.1)
//
// 15 perguntas com A, B ou C (C = "as duas me interessam igualmente"), 12
// dimensões bipolares e 13 áreas. O cálculo é determinístico e versionado:
// nunca usa IA. O score é afinidade relativa, NÃO é probabilidade, aptidão nem
// previsão de desempenho. Detalhes do algoritmo em `services/fit/`.
// ---------------------------------------------------------------------------

export type RespostaOpcao = 'A' | 'B' | 'C'

export type DimensaoId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8' | 'D9' | 'D10' | 'D11' | 'D12'

/** Versões usadas para calcular um resultado. Resultados antigos preservam as suas. */
export type VersoesDiagnostico = { questionario: string; scoring: string; matriz: string }

export type Dimensao = {
  id: DimensaoId
  /** D1–D6 são `perfil` (quem você é); D7–D12 são `trabalho` (como prefere trabalhar). */
  camada: 'perfil' | 'trabalho'
  /** Polo do valor 0. */
  polo0: string
  /** Polo do valor 100. */
  polo100: string
  perguntaIds: string[]
}

export type PerguntaDiagnostico = {
  id: string
  dimensaoId: DimensaoId
  texto: string
  opcoes: Record<RespostaOpcao, string>
}

export type ConfigDiagnostico = {
  versoes: VersoesDiagnostico
  perguntas: PerguntaDiagnostico[]
  dimensoes: Dimensao[]
}

export type EstadoDiagnostico = {
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
  total: number
  /** Respostas dadas até agora, por id de pergunta. Podem ser alteradas até o envio. */
  respostas: Record<string, RespostaOpcao>
  versoes: VersoesDiagnostico
}

export type PontuacaoDimensao = {
  dimensaoId: DimensaoId
  camada: 'perfil' | 'trabalho'
  polo0: string
  polo100: string
  /** U[d]: 0 a 100. 50 significa interesse equivalente nos dois polos, não desinteresse. */
  valor: number
}

/** Característica em que a pessoa e a área se aproximam. */
export type CaracteristicaArea = {
  dimensaoId: DimensaoId
  /** Ex.: "Mais analítica". Descreve a tendência da área. */
  texto: string
  /** Similaridade S[j,d], 0 a 100. */
  similaridade: number
}

/** Ponto de exploração: onde a área tende a ser diferente do que a pessoa respondeu. */
export type DiferencaArea = {
  dimensaoId: DimensaoId
  naArea: string
  paraVoce: string
  /** |U − R|, 0 a 100. */
  distancia: number
}

export type AfinidadeArea = {
  areaId: string
  area: string
  /** Posição no ranking, a partir de 1. Desempate pelo id da área, nunca aleatório. */
  posicao: number
  /** Score F[j] sem arredondar. É o que define o ranking. */
  pontuacaoBruta: number
  /** Inteiro de 0 a 100, arredondado só para exibição. Mostrar sempre como porcentagem. */
  pontuacao: number
  /** Até 3 por camada. */
  afinidades: { perfil: CaracteristicaArea[]; trabalho: CaracteristicaArea[] }
  /** Até 3 por camada; pode ser vazio. */
  diferencas: { perfil: DiferencaArea[]; trabalho: DiferencaArea[] }
  /** Justificativa curta, escrita por regras (sem IA). */
  porQueCombina: string
}

export type ResultadoDiagnostico = {
  id: string
  versoes: VersoesDiagnostico
  geradoEm: DataISO
  /** 12 pontuações, de D1 a D12. */
  dimensoes: PontuacaoDimensao[]
  /** As 13 áreas, da maior para a menor afinidade. O Top 3 são as três primeiras. */
  areas: AfinidadeArea[]
  /** Quantas vezes a pessoa marcou "as duas me interessam igualmente". Muitas deixam o resultado menos distintivo. */
  respostasC: number
}

export interface DiagnosticoService {
  /** GET /assessment/config. Pública. */
  obterConfiguracao(): Promise<Resultado<ConfigDiagnostico>>
  /** Só leitura: não inicia nem altera nada. A tela usa para saber se retoma, mostra o resultado ou começa do zero. */
  obterEstadoDiagnostico(): Promise<Resultado<EstadoDiagnostico>>
  /** Inicia ou retoma. Se já concluído, começa uma nova tentativa e preserva os resultados anteriores. */
  iniciarDiagnostico(): Promise<Resultado<EstadoDiagnostico>>
  /** Grava ou altera a resposta de uma pergunta, em qualquer ordem, até o envio. */
  responderPergunta(perguntaId: string, resposta: RespostaOpcao): Promise<Resultado<EstadoDiagnostico>>
  /**
   * POST /assessment/score. Exige as 15 respostas. Calcula, guarda o resultado com as
   * versões usadas e concede os pontos uma única vez (as repetições não pagam de novo).
   */
  finalizarDiagnostico(): Promise<Resultado<{ resultadoId: string; eventos: EventoPontos[] }>>
  /** GET /assessment/:id. Sem `resultadoId`, devolve o mais recente da usuária logada. */
  obterResultadoDiagnostico(resultadoId?: string): Promise<Resultado<ResultadoDiagnostico>>
}

// ---------------------------------------------------------------------------
// Cases como trilha (visão da participante)
// Os cases são ilhas em ordem: cada uma abre quando a anterior termina com certificado. Quem começa
// um case precisa terminá-lo antes de começar outro; não há prazo nem limite por semana.
// ---------------------------------------------------------------------------

/** Etapas de um case, em ordem. Cada etapa tem um ou mais checkpoints. */
/** `conteudos`: os conteúdos do case são uma etapa obrigatória, entre entender a área e o treino. */
export type EtapaCase = 'entenda' | 'conteudos' | 'treino' | 'situacao' | 'defesa'

export type EstadoCaseTrilha =
  /** Ainda não pode: sem diagnóstico, ou fora das opções do primeiro case. */
  | 'bloqueado'
  /** Pode escolher. Também é o estado de quem foi reprovada e pode refazer. */
  | 'disponivel'
  /** Começado e ainda não enviado (não há prazo). */
  | 'em_andamento'
  /** Enviado, aguardando a avaliação e a publicação do resultado. */
  | 'em_avaliacao'
  /** Aprovada, com certificado. */
  | 'concluido'

export type StatusCheckpoint = 'a_fazer' | 'em_andamento' | 'concluido'

export type Checkpoint = {
  id: string
  ordem: number
  etapa: EtapaCase
  titulo: string
  descricao: string
  pontos: number
  status: StatusCheckpoint
  tarefaIds: string[]
}

export type ConteudoEntenda = {
  resumo: string
  links: { titulo: string; url: string; fonte: string }[]
  cards: { titulo: string; texto: string; naPratica: string }[]
  comoSeEntra: { ondeSeTrabalha: string; formacoes: string; vagas: string; oQueAjuda: string; quandoRecrutam: string }
}

export type PersonagemCase = { nome: string; papel: string }

/** O case aberto para a participante. Antes de ela escolher, só traz o resumo. */
export type CaseTrilha = {
  id: string
  titulo: string
  areaId: string
  area: string
  resumo: string
  missao: string
  personagem: PersonagemCase | null
  /** Vazio antes de ela escolher o case. */
  contexto: string
  /** A explicação da área. `null` antes de ela escolher o case. */
  entenda: ConteudoEntenda | null
  estado: EstadoCaseTrilha
  /** 1 na primeira vez; sobe a cada nova tentativa depois de uma avaliação sem aprovação. */
  tentativa: number
  /** Soma dos checkpoints, do bônus máximo de nota e do certificado. */
  pontosPossiveis: number
  checkpoints: Checkpoint[]
  conteudoIds: string[]
  /** Próxima tarefa ainda sem checkpoint concluído. `null` se não houver. */
  proximaTarefaId: string | null
}

export type ItemTrilha = {
  caseId: string
  titulo: string
  areaId: string
  area: string
  resumo: string
  /** Posição do case dentro da área (1, 2, 3…). Cada área é uma ilha: um case só abre quando os anteriores da mesma área estão concluídos. */
  ordem: number
  /** `basico` é o primeiro case da área (a porta de entrada); os demais são avançados e abrem depois dele. */
  nivel: 'basico' | 'avancado'
  estado: EstadoCaseTrilha
  /** Posição da área no diagnóstico mais recente. `null` sem diagnóstico. */
  posicaoNoFit: number | null
  noTop3: boolean
  /** O case “Comece por aqui”: o case aberto da área de melhor posição no diagnóstico. */
  sugerido: boolean
  /** Por que está bloqueado, em português. */
  motivoBloqueio: string | null
  progresso: { concluidos: number; total: number }
  certificadoId: string | null
  /** `true` quando a última tentativa não foi aprovada e ela pode refazer. */
  refazer: boolean
}

export type TrilhaDaUsuaria = {
  diagnosticoConcluido: boolean
  primeiroCaseConcluido: boolean
  /** `false` sem diagnóstico ou sem nenhum case aberto. Cada case ainda tem o seu próprio estado e bloqueio. */
  podeEscolher: boolean
  motivoNaoPodeEscolher: string | null
  /** O case sugerido agora (o que ela já começou ou o da área que mais combina), ou `null` quando não há nenhum aberto. */
  proximoCaseId: string | null
  /** Todos os cases publicados, de todas as áreas; a tela agrupa por `areaId` e ordena por `ordem`. */
  cases: ItemTrilha[]
}

export type CelulaDados = { texto: string; valor: number | null }

export type TabelaDados = {
  titulo: string
  colunas: string[]
  linhas: { rotulo: string; celulas: CelulaDados[] }[]
}

export type CampoResposta = {
  id: string
  tipo: 'texto' | 'numerico' | 'opcao' | 'arquivo'
  rotulo: string
  dica?: string
  obrigatorio: boolean
  /** Só `numerico`: unidade exibida junto ao campo, ex.: "%", "x", "R$ mi". */
  unidade?: string
  /** Só `opcao`. */
  opcoes?: string[]
  /** Só `texto`. */
  limiteCaracteres?: number
  /** O campo só aparece quando alguma das respostas dos `campos` começa com `comecaCom` (ex.: "A."). */
  visivelSe?: { campos: string[]; comecaCom: string }
}

/** Texto, número ou nome do arquivo anexado. */
export type RespostaCampo = string | number | null

export type RespostasDaTarefa = Record<string, RespostaCampo>

export type Tarefa = {
  id: string
  caseId: string
  checkpointId: string
  titulo: string
  enunciado: string
  dadosApoio: TabelaDados | null
  campos: CampoResposta[]
  /** Último rascunho salvo, se houver. */
  rascunho: RespostasDaTarefa | null
  rascunhoSalvoEm: DataISO | null
  /** `true` depois do envio ou de o checkpoint ser concluído. */
  somenteLeitura: boolean
}

export type ResultadoTarefa = {
  tarefaId: string
  titulo: string
  nota: number
  notaMaxima: number
  feedback: string
}

export type ResultadoCase =
  | { estado: 'sem_entrega' }
  | { estado: 'em_avaliacao'; entregueEm: DataISO }
  | {
      estado: 'publicado'
      entregueEm: DataISO
      publicadoEm: DataISO
      nota: number
      notaMaxima: number
      feedbackGeral: string
      pontosFortes: string[]
      pontosAMelhorar: string[]
      porTarefa: ResultadoTarefa[]
      /** Pontos do bônus de nota e do certificado, quando houver. */
      pontosGanhos: number
      certificadoId: string | null
      /** `true` quando a nota atingiu o mínimo. Só então há certificado e os próximos cases abrem. */
      aprovada: boolean
      notaMinima: number
      tentativa: number
    }

export type RevisaoIA = {
  /** Se as respostas apontam na direção certa, precisam de ajustes ou de uma nova olhada. */
  rumo: 'no_caminho' | 'quase' | 'rever'
  resumo: string
  pontosFortes: string[]
  pontosAMelhorar: string[]
  /** Uma pista para o próximo passo, sem a resposta. Pode vir vazia. */
  dica: string
}

export type PedidoRevisaoParticipante = {
  id: string
  tarefaId: string
  motivo: string
  status: 'aberto' | 'resolvido'
  criadoEm: DataISO
  resposta: string | null
}

export interface CaseService {
  /**
   * A trilha da usuária: todos os cases publicados com o estado de cada um, e se ela
   * ainda pode começar um case. Não altera nada.
   */
  obterTrilha(): Promise<Resultado<TrilhaDaUsuaria>>
  /**
   * Começa a ilha (ou retoma a que já começou). Só um case em andamento por vez, sem prazo: o progresso
   * fica salvo até ela terminar. Depois de uma tentativa sem aprovação, começa uma nova tentativa
   * (checkpoints da situação e da defesa voltam a fazer; os pontos já pagos não se repetem).
   */
  escolherCase(caseId: string): Promise<Resultado<CaseTrilha>>
  /** Só leitura. Antes de escolher, traz só o resumo. `VALIDACAO` se o case estiver bloqueado. */
  obterCase(caseId: string): Promise<Resultado<CaseTrilha>>
  /** Nunca inclui o gabarito. `VALIDACAO` se o checkpoint da tarefa ainda não abriu. */
  obterTarefa(tarefaId: string): Promise<Resultado<Tarefa>>
  /** Respeita `limiteCaracteres`. Não funciona depois do envio ou de concluir o checkpoint. */
  salvarRascunho(tarefaId: string, respostas: RespostasDaTarefa): Promise<Resultado<{ salvoEm: DataISO }>>
  /**
   * Conclui um checkpoint, em ordem: o anterior precisa estar concluído. Exige os campos obrigatórios
   * das tarefas do checkpoint (os de “entenda” e “treino” não têm tarefas). Concede os pontos do
   * checkpoint uma única vez. Depois de concluído, as respostas ficam travadas.
   */
  concluirCheckpoint(checkpointId: string): Promise<Resultado<{ eventos: EventoPontos[] }>>
  /** Antes do envio, reabre este checkpoint e os posteriores. As respostas salvas são mantidas para edição e pontos não se repetem. */
  reabrirCheckpoint(checkpointId: string): Promise<Resultado<true>>
  /** Exige todos os checkpoints concluídos. Dispara a correção. Não concede pontos: os checkpoints já pagaram. */
  enviarCase(caseId: string): Promise<Resultado<{ entregaId: string }>>
  obterResultadoCase(caseId: string): Promise<Resultado<ResultadoCase>>
  /** Só depois de o resultado ser publicado. Motivo entre 10 e 500 caracteres. */
  pedirRevisao(tarefaId: string, motivo: string): Promise<Resultado<PedidoRevisaoParticipante>>
  /**
   * Visão geral da IA (a mentora) sobre as respostas de uma etapa que ela acabou de concluir: se está no caminho
   * certo, o que viu de bom e de ruim e uma dica. Pedida automaticamente ao fechar a etapa, não pela participante.
   * Feedback formativo: não dá nota, não vale pontos e não entrega a resposta. `null` quando a etapa não tem
   * atividade para revisar. Erros: `IA_INDISPONIVEL` e `LIMITE_EXCEDIDO` (a tela segue sem a revisão).
   */
  revisarCheckpointComIA(checkpointId: string): Promise<Resultado<RevisaoIA | null>>
}

// ---------------------------------------------------------------------------
// Conteúdos
// ---------------------------------------------------------------------------

export type TipoConteudo = 'artigo' | 'video' | 'glossario' | 'link'

export type Conteudo = {
  id: string
  titulo: string
  tipo: TipoConteudo
  areaId: string
  resumo: string
  /** Texto em markdown simples, para `artigo` e `glossario`. */
  corpo: string | null
  /** Embed ou link externo, para `video` e `link`. */
  url: string | null
  minutos: number
  concluido: boolean
}

export interface ConteudoService {
  listarConteudos(filtro?: { areaId?: string; tipo?: TipoConteudo; caseId?: string }): Promise<Resultado<Conteudo[]>>
  obterConteudo(conteudoId: string): Promise<Resultado<Conteudo>>
  /** Concede pontos uma única vez por conteúdo. */
  concluirConteudo(conteudoId: string): Promise<Resultado<{ eventos: EventoPontos[] }>>
}

// ---------------------------------------------------------------------------
// Certificados
// ---------------------------------------------------------------------------

export type Certificado = {
  id: string
  codigo: string
  caseId: string
  tituloCase: string
  area: string
  nomeParticipante: string
  emitidoEm: DataISO
  /** Endereço público onde qualquer pessoa confere o certificado pelo código. */
  urlValidacao: string
}

/** Resposta pública: só o necessário para conferir a autenticidade. */
export type ValidacaoCertificado = { nome: string; tituloCase: string; emitidoEm: DataISO }

export interface CertificadoService {
  listarMeusCertificados(): Promise<Resultado<Certificado[]>>
  /** PDF com o nome do case e o nome da usuária, a área, a data e o código de verificação. */
  baixarCertificado(certificadoId: string): Promise<Resultado<{ nomeArquivo: string; mimeType: 'application/pdf'; url: string }>>
  /** Link de “adicionar certificação” do LinkedIn, já com o nome do case, a data, o código e o endereço de validação. */
  obterLinkLinkedIn(certificadoId: string): Promise<Resultado<{ url: string }>>
  /** Pública, sem login. `dados: null` quando o código não existe. */
  validarCertificado(codigo: string): Promise<Resultado<ValidacaoCertificado | null>>
}

// ---------------------------------------------------------------------------
// Admin: cases (com IA)
// ---------------------------------------------------------------------------

/** `publicado` fica disponível para quem destravou o case. `arquivado` sai da oferta. */
export type StatusCaseAdmin = 'rascunho_ia' | 'rascunho' | 'revisado' | 'publicado' | 'arquivado'

export type Dificuldade = 'iniciante' | 'intermediario' | 'avancado'

export type BriefingCase = {
  areaId: string
  dificuldade: Dificuldade
  tema: string
  numCheckpoints: number
  numTarefas: number
  tipoDados: 'demonstracoes_financeiras' | 'carteira_de_ativos' | 'credito' | 'outro'
  observacoes: string
}

export type SecaoCase = 'contexto' | 'checkpoints' | 'tarefas' | 'dados_apoio' | 'gabarito' | 'conteudos'

/** Referência a uma célula da tabela de dados de apoio. */
export type RefCelula = { linha: string; coluna: string }

/** O servidor recalcula o gabarito a partir da tabela de dados, sem confiar só na IA. */
export type FormulaGabarito = {
  tipo: 'razao'
  numerador: RefCelula
  denominador: RefCelula
  multiplicador: number
}

export type ItemGabarito = {
  id: string
  tarefaId: string
  campoId: string
  descricao: string
  valorEsperado: number
  /** Tolerância absoluta, na unidade do campo. */
  tolerancia: number
  unidade: string
  /** Pontos da nota máxima dados por esta resposta. */
  pontos: number
  formula: FormulaGabarito | null
  passoAPasso: string
}

export type TarefaAdmin = {
  id: string
  checkpointId: string
  titulo: string
  enunciado: string
  campos: CampoResposta[]
  /** `numerica`: corrigida por código com o gabarito. `qualitativa`: texto, correção assistida. */
  correcao: 'numerica' | 'qualitativa'
  notaMaxima: number
}

export type CheckpointAdmin = { id: string; ordem: number; etapa: EtapaCase; titulo: string; descricao: string; pontos: number }

export type CaseAdmin = {
  id: string
  titulo: string
  areaId: string
  status: StatusCaseAdmin
  geradoPorIA: boolean
  briefing: BriefingCase | null
  resumo: string
  missao: string
  personagem: PersonagemCase | null
  contexto: string
  entenda: ConteudoEntenda | null
  checkpoints: CheckpointAdmin[]
  tarefas: TarefaAdmin[]
  dadosApoio: TabelaDados | null
  gabarito: ItemGabarito[]
  conteudoIds: string[]
  /** Número da ilha na trilha. Menor vem primeiro. */
  ordem: number
  gabaritoConfirmado: boolean
  revisadoEm: DataISO | null
  atualizadoEm: DataISO
}

export type CaseResumoAdmin = {
  id: string
  titulo: string
  areaId: string
  area: string
  status: StatusCaseAdmin
  geradoPorIA: boolean
}

export type ConferenciaGabarito = {
  /** `true` quando todos os itens com fórmula batem com o valor do gabarito. */
  confere: boolean
  itens: {
    itemId: string
    descricao: string
    valorGabarito: number
    /** `null` quando o item não tem fórmula para recalcular. */
    valorCalculado: number | null
    confere: boolean
  }[]
}

export interface AdminCasesService {
  listarCases(filtro?: { status?: StatusCaseAdmin }): Promise<Resultado<CaseResumoAdmin[]>>
  obterCase(caseId: string): Promise<Resultado<CaseAdmin>>
  /** Cria um case com status `rascunho_ia`. `IA_INDISPONIVEL` se a geração falhar. */
  gerarRascunhoComIA(briefing: BriefingCase): Promise<Resultado<CaseAdmin>>
  /** Regenera só uma seção. Não mexe nas demais. */
  regenerarSecao(caseId: string, secao: SecaoCase): Promise<Resultado<CaseAdmin>>
  /** Não permite editar case publicado ou arquivado. Editar um case revisado volta o status para rascunho. */
  salvarCase(caso: CaseAdmin): Promise<Resultado<CaseAdmin>>
  conferirGabarito(caseId: string): Promise<Resultado<ConferenciaGabarito>>
  /** Exige `gabaritoConfirmado` e que o gabarito confira. Status vira `revisado`. */
  aprovarCase(caseId: string, opcoes: { gabaritoConfirmado: boolean }): Promise<Resultado<CaseAdmin>>
  /** Case `revisado` ou `arquivado` (republicar). O case entra na trilha para quem já o destravou. */
  publicarCase(caseId: string): Promise<Resultado<CaseAdmin>>
  /** Tira o case da oferta. Quem já começou mantém o progresso. */
  arquivarCase(caseId: string): Promise<Resultado<CaseAdmin>>
}

// ---------------------------------------------------------------------------
// Admin: correção
// ---------------------------------------------------------------------------

export type StatusEntrega = 'pendente' | 'revisada' | 'publicada'

export type ItemCorrecao = {
  tarefaId: string
  campoId: string
  rotulo: string
  /** Texto exatamente como a participante digitou. */
  resposta: string
  /** Número lido da resposta; `null` se não foi possível interpretar. */
  valorInterpretado: number | null
  valorEsperado: number
  tolerancia: number
  unidade: string
  resultado: 'correta' | 'parcial' | 'incorreta'
  pontos: number
  maxPontos: number
  /** Resposta aceita, mas fora do formato esperado (ex.: "12.4 %"). Destacar na fila. */
  formatoForaDoPadrao: boolean
}

export type SugestaoCorrecao = {
  itens: ItemCorrecao[]
  /** Parte conferida por código. */
  notaCodigo: number
  maxCodigo: number
  /** Parte interpretada pela IA. `null` se a IA estava indisponível. */
  notaIA: number | null
  maxIA: number
  /** Soma das duas partes. `null` se a IA falhou: a correção vira manual. */
  notaSugerida: number | null
  origem: 'ia' | 'manual'
  feedbackGeral: string
  feedbackPorTarefa: { tarefaId: string; feedback: string }[]
  pontosFortes: string[]
  pontosAMelhorar: string[]
  versaoPrompt: string
}

export type EntregaResumoAdmin = {
  id: string
  participanteNome: string
  caseId: string
  caseTitulo: string
  enviadaEm: DataISO
  status: StatusEntrega
  notaSugerida: number | null
  notaFinal: number | null
  origem: 'ia' | 'manual'
}

export type DetalheEntregaAdmin = EntregaResumoAdmin & {
  /** Respostas por tarefa, com o título para exibir. */
  respostas: {
    tarefaId: string
    titulo: string
    respostas: RespostasDaTarefa
    /** Texto de cada campo (id do campo -> rótulo), para exibir a resposta com a pergunta. */
    rotulos?: Record<string, string>
    /** Gabarito e rubrica escritos no case, em texto. Só a equipe vê. */
    referencia?: string | null
  }[]
  /** Só a equipe vê o gabarito. */
  gabarito: ItemGabarito[]
  sugestao: SugestaoCorrecao
  feedbackFinal: string | null
  aprovadaPor: string | null
  aprovadaEm: DataISO | null
}

export type PedidoRevisaoAdmin = {
  id: string
  /** `null` apenas em dados de demonstração de um case anterior. */
  entregaId: string | null
  tarefaId: string | null
  participanteNome: string
  caseTitulo: string
  motivo: string
  status: 'aberto' | 'resolvido'
  criadoEm: DataISO
}

export interface AdminCorrecaoService {
  listarEntregas(filtro?: { status?: StatusEntrega }): Promise<Resultado<EntregaResumoAdmin[]>>
  obterEntregaComSugestaoIA(entregaId: string): Promise<Resultado<DetalheEntregaAdmin>>
  /** Nota de 0 a 10. Não aprova: só guarda o ajuste. Não funciona em entrega publicada. */
  ajustarNotaEFeedback(ajuste: { entregaId: string; notaFinal: number; feedback: string }): Promise<Resultado<DetalheEntregaAdmin>>
  /** Exige nota final (do ajuste ou a sugerida). Status vira `revisada`. */
  aprovarNota(entregaId: string): Promise<Resultado<DetalheEntregaAdmin>>
  /**
   * Publica em lote as entregas revisadas e concede os pontos de resultado e o
   * certificado. Recusa se houver entregas pendentes (`VALIDACAO`, com a contagem).
   */
  publicarResultados(): Promise<Resultado<{ publicados: number }>>
  listarPedidosRevisao(): Promise<Resultado<PedidoRevisaoAdmin[]>>
  resolverPedidoRevisao(pedidoId: string, resolucao: { resposta: string; novaNota?: number }): Promise<Resultado<PedidoRevisaoAdmin>>
}

// ---------------------------------------------------------------------------
// Admin: conteúdos
// ---------------------------------------------------------------------------

export type ConteudoAdmin = Omit<Conteudo, 'concluido'> & { caseIds: string[] }

export interface AdminConteudosService {
  listarConteudosAdmin(): Promise<Resultado<ConteudoAdmin[]>>
  /** Sem `id` cria; com `id` atualiza. */
  salvarConteudo(conteudo: Omit<ConteudoAdmin, 'id'> & { id?: string }): Promise<Resultado<ConteudoAdmin>>
  removerConteudo(conteudoId: string): Promise<Resultado<true>>
}

// ---------------------------------------------------------------------------
// Conjunto
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Treino de entrevista
// ---------------------------------------------------------------------------

export type NivelPergunta = 'facil' | 'medio' | 'dificil'

export type ResumoTreino = {
  areaId: string
  /** O treino de uma ilha abre depois do certificado do case básico da área. */
  liberado: boolean
  motivoBloqueio: string | null
  /** Quantas perguntas existem por nível. Tudo zero: a área ainda não tem perguntas publicadas. */
  perguntasPorNivel: Record<NivelPergunta, number>
  /** Subtemas da área (ex.: M&A, DCM, ECM). Vazio quando a área não se divide. */
  temas: string[]
  /** O que ela já respondeu no treino desta área (todas as tentativas). */
  desempenho: { respondidas: number; acertos: number }
}

/** Uma pergunta de múltipla escolha, sem o gabarito (ele só vem em `RespostaTreino`). */
export type PerguntaTreino = {
  id: string
  areaId: string
  nivel: NivelPergunta
  tema: string | null
  enunciado: string
  opcoes: { letra: string; texto: string }[]
}

export type RespostaTreino = {
  correta: boolean
  letraCerta: string
  feedback: string
}

export interface TreinoService {
  obterResumoDoTreino(areaId: string): Promise<Resultado<ResumoTreino>>
  /** Sorteia perguntas da área. `misto` junta os três níveis. Erro `VALIDACAO` se o treino ainda não está liberado. */
  sortearPerguntas(filtro: { areaId: string; nivel: NivelPergunta | 'misto'; quantidade: number; tema?: string }): Promise<Resultado<PerguntaTreino[]>>
  /** `letra` nula: o tempo acabou sem resposta (conta como erro). */
  responderPergunta(perguntaId: string, letra: string | null): Promise<Resultado<RespostaTreino>>
}

// ---------------------------------------------------------------------------
// Simulação de entrevista com IA
// ---------------------------------------------------------------------------

export type RigorSimulacao = 'acolhedor' | 'equilibrado' | 'exigente'
export type DificuldadeSimulacao = 'iniciante' | 'intermediario' | 'avancado'

export type ConfigSimulacao = {
  areaId: string
  /** Texto livre sobre a vaga (cargo, empresa, requisitos). Opcional. */
  vaga?: string
  rigor: RigorSimulacao
  dificuldade: DificuldadeSimulacao
  /** Quantas perguntas a entrevistadora faz (3 a 8). */
  perguntas: number
}

export type ResumoSimulacao = {
  areaId: string
  /** Abre depois do certificado do case básico da área, como o treino. */
  liberado: boolean
  motivoBloqueio: string | null
  /** `false` quando a IA não está configurada no servidor. */
  disponivel: boolean
  /** `true` quando a área tem banco de perguntas reais de entrevista: a IA reage e avalia contra o que uma boa resposta mostra. */
  perguntasReais: boolean
  /** `true` no mock: perguntas e feedback roteirizados, sem IA. */
  demonstracao: boolean
  restantesHoje: number
  /** As últimas simulações concluídas nesta área, da mais recente para a mais antiga. */
  historico: ItemHistoricoSimulacao[]
}

export type ItemHistoricoSimulacao = {
  id: string
  concluidaEm: DataISO
  rigor: RigorSimulacao
  dificuldade: DificuldadeSimulacao
  perguntas: number
  /** Média das notas do feedback (0 a 10), ou `null` se não houver. */
  notaMedia: number | null
}

export type TurnoSimulacao = { sessaoId: string; numero: number; total: number; pergunta: string }

export type FeedbackSimulacao = {
  resumo: string
  criterios: { nome: string; nota: number; comentario: string }[]
  pontosFortes: string[]
  pontosAMelhorar: string[]
  proximosPassos: string[]
}

export type RespostaSimulacao = {
  /** Reação curta da entrevistadora à resposta. */
  reacao: string
  /** A pergunta seguinte, ou `null` quando a entrevista acabou. */
  proximo: { numero: number; pergunta: string } | null
  feedbackFinal: FeedbackSimulacao | null
}

export interface SimulacaoService {
  obterResumoDaSimulacao(areaId: string): Promise<Resultado<ResumoSimulacao>>
  /** Erros: `VALIDACAO` (ainda bloqueada), `LIMITE_EXCEDIDO` (limite do dia), `IA_INDISPONIVEL` se a IA não responde. */
  iniciarSimulacao(config: ConfigSimulacao): Promise<Resultado<TurnoSimulacao>>
  /** `resposta` nula: o tempo acabou sem resposta. */
  responderSimulacao(sessaoId: string, resposta: string | null): Promise<Resultado<RespostaSimulacao>>
}

// ---------------------------------------------------------------------------
// Vagas
// ---------------------------------------------------------------------------

export type TipoVaga = 'estagio' | 'junior' | 'outro'
export type StatusVaga = 'rascunho' | 'aberta' | 'encerrada'

/** Uma vaga publicada, como a participante vê. A candidatura acontece no site da empresa (`url`). */
export type Vaga = {
  id: string
  areaId: string
  empresa: string
  titulo: string
  local: string
  tipo: TipoVaga
  /** Sempre `https`. */
  url: string
  /** Quando a equipe conferiu pela última vez que estava aberta. */
  conferidaEm: DataISO | null
}

export type VagaAdmin = Vaga & { status: StatusVaga; observacao: string | null }

export interface VagaService {
  /** Só vagas abertas e conferidas, da mais recentemente conferida para a mais antiga. */
  listarVagas(filtro?: { areaId?: string }): Promise<Resultado<Vaga[]>>
}

export interface AdminVagasService {
  listarVagasAdmin(): Promise<Resultado<VagaAdmin[]>>
  /** Cria ou edita. Vaga nova começa como rascunho; editar o link volta a vaga para rascunho (precisa conferir de novo). */
  salvarVaga(vaga: Omit<VagaAdmin, 'id' | 'status' | 'conferidaEm'> & { id?: string }): Promise<Resultado<VagaAdmin>>
  /** A equipe conferiu que está aberta: publica e marca a conferência de hoje. */
  publicarVaga(id: string): Promise<Resultado<VagaAdmin>>
  encerrarVaga(id: string): Promise<Resultado<VagaAdmin>>
  removerVaga(id: string): Promise<Resultado<null>>
}

// ---------------------------------------------------------------------------
// Fórum
// ---------------------------------------------------------------------------

export type CategoriaForum = { id: string; nome: string; descricao: string; ordem: number }
export type OrdemForum = 'recentes' | 'uteis' | 'sem_resposta'
export type MotivoDenuncia = 'assedio' | 'spam_golpe' | 'dado_pessoal' | 'gabarito_case' | 'investimento' | 'outro'
export type PerfilForum = { apelido: string; mostrarArea: boolean; mostrarMedalhas: boolean; alteradoEm: DataISO | null }
export type AutorForum = { apelido: string; areaId: string | null }
export type PostForum = { id: string; titulo: string; texto: string; categoria: CategoriaForum; areaId: string | null; autora: AutorForum; anonima: boolean; /** Tema da semana: publicado pela equipe (aparece como "Equipe Alumna"). */ oficial: boolean; criadoEm: DataISO; editadoEm: DataISO | null; respostas: number; uteis: number; meuVoto: boolean; removido: boolean }
export type RespostaForum = { id: string; postId: string; paiId: string | null; texto: string; autora: AutorForum; criadoEm: DataISO; uteis: number; meuVoto: boolean; ajudou: boolean; removida: boolean }
export type DetalhePostForum = PostForum & { respostasArvore: RespostaForum[]; seguindo: boolean }

export interface ForumService {
  listarCategorias(): Promise<Resultado<CategoriaForum[]>>
  obterMeuPerfil(): Promise<Resultado<PerfilForum | null>>
  salvarMeuPerfil(dados: Omit<PerfilForum, 'alteradoEm'>): Promise<Resultado<PerfilForum>>
  listarPosts(filtro?: { categoriaId?: string; areaId?: string; busca?: string; ordem?: OrdemForum }): Promise<Resultado<PostForum[]>>
  obterPost(id: string): Promise<Resultado<DetalhePostForum>>
  criarPost(dados: { titulo: string; texto: string; categoriaId: string; areaId?: string | null; anonima?: boolean }): Promise<Resultado<PostForum>>
  criarResposta(postId: string, dados: { texto: string; paiId?: string | null }): Promise<Resultado<RespostaForum>>
  /** Na tela é o coração "Amei" (um toque liga e desliga). Os campos continuam `uteis` e `meuVoto`. */
  votar(alvo: 'post' | 'resposta', id: string): Promise<Resultado<{ uteis: number; meuVoto: boolean }>>
  denunciar(alvo: 'post' | 'resposta', id: string, motivo: MotivoDenuncia, detalhe?: string): Promise<Resultado<true>>
  seguir(postId: string): Promise<Resultado<boolean>>
  /** Só a equipe: tira o tema da semana do ar (os comentários ficam guardados). */
  encerrarTema(postId: string): Promise<Resultado<true>>
}

export type Servicos = {
  forum: ForumService
  vagas: VagaService
  adminVagas: AdminVagasService
  simulacao: SimulacaoService
  treino: TreinoService
  sessao: SessaoService
  perfil: PerfilService
  catalogo: CatalogoService
  pontos: PontosService
  diagnostico: DiagnosticoService
  caso: CaseService
  conteudos: ConteudoService
  certificados: CertificadoService
  adminCases: AdminCasesService
  adminCorrecao: AdminCorrecaoService
  adminConteudos: AdminConteudosService
}
