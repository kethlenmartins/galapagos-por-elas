import type { VersoesDiagnostico } from '../contratos.ts'

/**
 * Versões congeladas do diagnóstico (PRD v1.1). Mudar texto de pergunta, regra de
 * pontuação ou matriz exige subir a versão correspondente: resultados antigos
 * guardam as versões com que foram calculados.
 */
export const VERSOES: VersoesDiagnostico = { questionario: '1.1', scoring: '1.1', matriz: '1.1' }
