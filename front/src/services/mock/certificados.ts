import type { CaseAdmin, Certificado, CertificadoService } from '../contratos.ts'
import { AREAS } from './dados/areas.ts'
import { anoEMes } from './datas.ts'
import { montarPdfCertificado, pdfParaDataUrl, slug } from './pdf.ts'
import { executar, executarLogada, falha, novoId, ok } from './store.ts'
import type { CertificadoRegistro, EstadoMock, Usuario } from './tipos.ts'

const ORGANIZACAO = 'Alumna'

/**
 * Endereço da página pública de validação. No navegador usa o endereço do próprio app; fora dele
 * (testes), um endereço de exemplo. No backend real vem da configuração do ambiente.
 */
function baseDeValidacao(): string {
  if (typeof location !== 'undefined' && location.origin && location.origin !== 'null') return `${location.origin}${location.pathname}`
  return 'https://exemplo.alumna.org/'
}

export const urlDeValidacao = (codigo: string) => `${baseDeValidacao()}#/validate?codigo=${encodeURIComponent(codigo)}`

/** Código público do certificado. No mock é determinístico; no backend deve ser imprevisível. */
function gerarCodigo(sequencia: number, semente: string, ano: number): string {
  let hash = 5381
  for (const ch of semente) hash = ((hash << 5) + hash + ch.charCodeAt(0)) >>> 0
  const parte = (n: number) => n.toString(36).toUpperCase().padStart(4, '0').slice(-4)
  return `ALU-${ano}-${parte(sequencia)}-${parte(hash)}`
}

/** Emite o certificado de uma participante para um case. Idempotente por usuária e case. */
export function emitirCertificado(estado: EstadoMock, usuario: Usuario, caso: CaseAdmin, agora: Date): CertificadoRegistro {
  const existente = estado.certificados.find(c => c.usuarioId === usuario.id && c.caseId === caso.id)
  if (existente) return existente
  const id = novoId('cert')
  const sequencia = Number(id.split('-')[1])
  const codigo = gerarCodigo(sequencia, `${usuario.id}:${caso.id}`, agora.getUTCFullYear())
  const certificado: CertificadoRegistro = {
    id,
    usuarioId: usuario.id,
    codigo,
    caseId: caso.id,
    tituloCase: caso.titulo,
    area: AREAS.find(a => a.id === caso.areaId)?.nome ?? caso.areaId,
    nomeParticipante: usuario.nome,
    emitidoEm: agora.toISOString(),
    urlValidacao: urlDeValidacao(codigo),
  }
  estado.certificados.push(certificado)
  return certificado
}

const publico = ({ usuarioId: _usuarioId, ...c }: CertificadoRegistro): Certificado => c

export function linkDoLinkedIn(cert: Certificado): string {
  const { ano, mes } = anoEMes(cert.emitidoEm)
  const partes = [
    'startTask=CERTIFICATION_NAME',
    `name=${encodeURIComponent(cert.tituloCase)}`,
    `organizationName=${encodeURIComponent(ORGANIZACAO)}`,
    `issueYear=${ano}`,
    `issueMonth=${mes}`,
    `certUrl=${encodeURIComponent(cert.urlValidacao)}`,
    `certId=${encodeURIComponent(cert.codigo)}`,
  ]
  return `https://www.linkedin.com/profile/add?${partes.join('&')}`
}

export const certificadoService: CertificadoService = {
  listarMeusCertificados: () =>
    executarLogada(({ estado, usuario }) =>
      ok(
        estado.certificados
          .filter(c => c.usuarioId === usuario.id)
          .sort((a, b) => new Date(b.emitidoEm).getTime() - new Date(a.emitidoEm).getTime())
          .map(publico),
      ),
    ),

  baixarCertificado: certificadoId =>
    executarLogada(({ estado, usuario }) => {
      const cert = estado.certificados.find(c => c.id === certificadoId && c.usuarioId === usuario.id)
      if (!cert) return falha('NAO_ENCONTRADO', 'Certificado não encontrado.')
      const pdf = montarPdfCertificado({
        nome: cert.nomeParticipante,
        tituloCase: cert.tituloCase,
        area: cert.area,
        emitidoEm: cert.emitidoEm,
        codigo: cert.codigo,
        urlValidacao: cert.urlValidacao,
      })
      return ok({
        nomeArquivo: `certificado-${slug(cert.tituloCase)}-${slug(cert.nomeParticipante)}.pdf`,
        mimeType: 'application/pdf' as const,
        url: pdfParaDataUrl(pdf),
      })
    }),

  obterLinkLinkedIn: certificadoId =>
    executarLogada(({ estado, usuario }) => {
      const cert = estado.certificados.find(c => c.id === certificadoId && c.usuarioId === usuario.id)
      return cert ? ok({ url: linkDoLinkedIn(publico(cert)) }) : falha('NAO_ENCONTRADO', 'Certificado não encontrado.')
    }),

  validarCertificado: codigo =>
    executar({}, ({ estado }) => {
      const alvo = codigo.trim().toUpperCase()
      const cert = estado.certificados.find(c => c.codigo === alvo)
      // Resposta pública mínima: só o necessário para conferir a autenticidade.
      return ok(cert ? { nome: cert.nomeParticipante, tituloCase: cert.tituloCase, emitidoEm: cert.emitidoEm } : null)
    }),
}
