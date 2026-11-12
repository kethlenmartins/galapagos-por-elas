/**
 * Gerador mínimo de PDF para o certificado. Sem dependências: monta um documento de uma página
 * (A4 paisagem) com fontes padrão do PDF (Helvetica), então o texto fica selecionável e
 * pesquisável. No backend real, o mesmo layout é gerado no servidor.
 *
 * Todas as strings internas só têm caracteres de 0 a 255 (um caractere = um byte), o que permite
 * calcular os deslocamentos da tabela de referências cruzadas pelo comprimento do texto.
 */
import { dataPorExtenso } from './datas.ts'

export type DadosCertificado = {
  nome: string
  tituloCase: string
  area: string
  emitidoEm: string
  codigo: string
  urlValidacao: string
}

const LARGURA = 842
const ALTURA = 595

/** Larguras (milésimos de em) da Helvetica para ASCII 32 a 126. Servem para centralizar o texto. */
const LARGURAS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667,
  611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833,
  556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

/** Pontuação tipográfica do Windows-1252 que o PDF (WinAnsiEncoding) entende e o Latin-1 não tem. */
const WIN_ANSI: Record<string, number> = { '–': 0x96, '—': 0x97, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '…': 0x85 }

function codigoDoCaractere(c: string): number {
  const n = c.charCodeAt(0)
  if (n < 256) return n
  return WIN_ANSI[c] ?? 63 // "?"
}

/** Texto como literal de string do PDF, com escapes e bytes altos em octal. */
function literal(texto: string): string {
  let saida = ''
  for (const c of texto) {
    const n = codigoDoCaractere(c)
    if (c === '\\' || c === '(' || c === ')') saida += '\\' + c
    else if (n < 32 || n > 126) saida += '\\' + n.toString(8).padStart(3, '0')
    else saida += c
  }
  return `(${saida})`
}

function larguraDoTexto(texto: string, tamanho: number, negrito: boolean): number {
  let total = 0
  for (const c of texto) {
    const n = codigoDoCaractere(c)
    // Letras acentuadas têm a largura da letra base; aproximamos pelo "a".
    total += n >= 32 && n <= 126 ? LARGURAS[n - 32] : 556
  }
  return (total / 1000) * tamanho * (negrito ? 1.06 : 1)
}

/** Quebra o texto em linhas que cabem na largura dada. */
function quebrar(texto: string, tamanho: number, negrito: boolean, larguraMaxima: number): string[] {
  const linhas: string[] = []
  let atual = ''
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (atual && larguraDoTexto(tentativa, tamanho, negrito) > larguraMaxima) {
      linhas.push(atual)
      atual = palavra
    } else atual = tentativa
  }
  if (atual) linhas.push(atual)
  return linhas
}

type Cor = [number, number, number]
const AZUL: Cor = [0.141, 0.341, 0.722]
const ROSA: Cor = [0.76, 0.2, 0.435]
const GRAFITE: Cor = [0.078, 0.129, 0.239]
const CINZA: Cor = [0.29, 0.345, 0.467]

const num = (n: number) => String(Math.round(n * 100) / 100)

function textoCentralizado(texto: string, y: number, tamanho: number, opcoes: { negrito?: boolean; cor?: Cor } = {}): string {
  const negrito = opcoes.negrito ?? false
  const [r, g, b] = opcoes.cor ?? GRAFITE
  const x = (LARGURA - larguraDoTexto(texto, tamanho, negrito)) / 2
  return `BT /${negrito ? 'F2' : 'F1'} ${tamanho} Tf ${num(r)} ${num(g)} ${num(b)} rg ${num(x)} ${num(y)} Td ${literal(texto)} Tj ET\n`
}

/** Monta o PDF como uma string binária (um caractere por byte). */
export function montarPdfCertificado(d: DadosCertificado): string {
  let c = ''
  // Moldura
  c += `q ${AZUL.join(' ')} RG 3 w 24 24 ${LARGURA - 48} ${ALTURA - 48} re S Q\n`
  c += `q ${ROSA.join(' ')} RG 1 w 32 32 ${LARGURA - 64} ${ALTURA - 64} re S Q\n`

  c += textoCentralizado('ALUMNA', 515, 14, { negrito: true, cor: ROSA })
  c += textoCentralizado('Certificado de conclusão', 462, 36, { negrito: true, cor: AZUL })
  c += `q ${ROSA.join(' ')} RG 3 w ${LARGURA / 2 - 40} 440 m ${LARGURA / 2 + 40} 440 l S Q\n`
  c += textoCentralizado('Certificamos que', 400, 15, { cor: CINZA })

  const linhasNome = quebrar(d.nome, 32, true, 680)
  let y = 355
  for (const linha of linhasNome) {
    c += textoCentralizado(linha, y, 32, { negrito: true })
    y -= 38
  }
  y -= 4
  c += textoCentralizado('concluiu o case', y, 15, { cor: CINZA })
  y -= 42
  for (const linha of quebrar(d.tituloCase, 24, true, 680)) {
    c += textoCentralizado(linha, y, 24, { negrito: true, cor: AZUL })
    y -= 30
  }
  y -= 8
  c += textoCentralizado(`Área: ${d.area}`, y, 14, { cor: GRAFITE })
  y -= 24
  c += textoCentralizado(`Emitido em ${dataPorExtenso(d.emitidoEm)}`, y, 13, { cor: GRAFITE })

  c += textoCentralizado(`Código de verificação: ${d.codigo}`, 118, 13, { negrito: true })
  c += textoCentralizado('Confira a autenticidade deste certificado em:', 92, 10, { cor: CINZA })
  c += textoCentralizado(d.urlValidacao, 76, 10, { cor: CINZA })

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LARGURA} ${ALTURA}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${c.length} >>\nstream\n${c}endstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const posicoes: number[] = []
  objetos.forEach((corpo, i) => {
    posicoes.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${corpo}\nendobj\n`
  })
  const inicioDaTabela = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const p of posicoes) pdf += `${String(p).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioDaTabela}\n%%EOF\n`
  return pdf
}

/** Endereço `data:` pronto para baixar ou abrir no navegador. */
export const pdfParaDataUrl = (binario: string): string => `data:application/pdf;base64,${btoa(binario)}`

/** Tira acentos e deixa só letras, números e hífen. */
export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
