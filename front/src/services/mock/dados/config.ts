import type { Nivel, RegraDePontos } from '../../contratos.ts'

export const CONFIG = {
  versaoTermos: '2026-11-01',
  senha: {
    minimo: 8,
    /** Senhas comuns recusadas na criação e na redefinição. */
    comuns: ['12345678', '123456789', '1234567890', 'password', 'senha1234', 'qwerty123', '11111111', 'abcd1234'],
  },
  login: { maxFalhas: 5, bloqueioMs: 5 * 60_000 },
  redefinicaoValidadeMs: 60 * 60_000,
  /** [SUPOSIÇÃO] nota mínima para o certificado; o critério oficial ainda está em aberto (PRD, seção 12). */
  certificado: { notaMinima: 6 },
  /** Valores de exemplo, iguais ao PRD das telas (seção 5). */
  bonusResultadoMaximo: 150,
  versaoPromptCorrecao: 'correcao-mock-v1',
  versaoPromptCase: 'case-mock-v1',
} as const

export type IdRegra = 'perfil_completo' | 'diagnostico' | 'conteudo' | 'checkpoint' | 'resultado' | 'certificado'

export const REGRAS_DE_PONTOS: Record<IdRegra, RegraDePontos> = {
  perfil_completo: { id: 'perfil_completo', acao: 'Perfil completo', pontos: 20, descricao: 'Preencha seus dados no primeiro acesso.' },
  diagnostico: { id: 'diagnostico', acao: 'Diagnóstico concluído', pontos: 100, descricao: 'Converse com a Galá e descubra suas áreas.' },
  conteudo: { id: 'conteudo', acao: 'Conteúdo concluído', pontos: 10, descricao: 'Cada conteúdo de apoio que você conclui.' },
  checkpoint: { id: 'checkpoint', acao: 'Checkpoint concluído', pontos: 30, descricao: 'Cada checkpoint do case (20 pontos no “entenda a área”).' },
  resultado: { id: 'resultado', acao: 'Bônus de resultado', pontos: 150, descricao: 'Até 150 pontos, conforme a nota do case.' },
  certificado: { id: 'certificado', acao: 'Certificado conquistado', pontos: 100, descricao: 'Ao concluir o case e receber o certificado.' },
}

export const NIVEIS: Nivel[] = [
  { numero: 1, nome: 'Exploradora', pontosNecessarios: 0 },
  { numero: 2, nome: 'Aprendiz', pontosNecessarios: 150 },
  { numero: 3, nome: 'Analista', pontosNecessarios: 400 },
  { numero: 4, nome: 'Estrategista', pontosNecessarios: 800 },
  { numero: 5, nome: 'Especialista', pontosNecessarios: 1400 },
]
