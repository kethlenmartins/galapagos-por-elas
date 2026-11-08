import { useEffect, useState } from 'react'
import { dataLonga } from '../../app/formatos'
import { go } from '../../app/rotas'
import { sessaoExpirou } from '../../app/sessao'
import { PageTitle, Tag } from '../../componentes/Basicos'
import { Button } from '../../componentes/Botao'
import { Icon } from '../../componentes/Icone'
import { AppShell } from '../../componentes/Layout'
import { certificadoService, type Certificado } from '../../services'

const iniciais = (nome: string) => nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()

export function Certificates() {
  const [lista, setLista] = useState<Certificado[] | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    certificadoService.listarMeusCertificados().then(r => {
      if (!ativo) return
      if (r.erro) {
        if (!sessaoExpirou(r.erro)) setErro(r.erro.mensagem)
        return
      }
      setLista(r.dados)
    })
    return () => {
      ativo = false
    }
  }, [])

  const baixar = async (c: Certificado) => {
    setOcupado(`pdf-${c.id}`)
    setAviso('')
    const r = await certificadoService.baixarCertificado(c.id)
    setOcupado(null)
    if (r.erro) return sessaoExpirou(r.erro) ? undefined : setErro(r.erro.mensagem)
    const link = document.createElement('a')
    link.href = r.dados.url
    link.download = r.dados.nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    setAviso(`O arquivo ${r.dados.nomeArquivo} foi baixado.`)
  }

  const linkedin = async (c: Certificado) => {
    setOcupado(`in-${c.id}`)
    setAviso('')
    const r = await certificadoService.obterLinkLinkedIn(c.id)
    setOcupado(null)
    if (r.erro) return sessaoExpirou(r.erro) ? undefined : setErro(r.erro.mensagem)
    window.open(r.dados.url, '_blank', 'noopener,noreferrer')
  }

  const copiar = async (c: Certificado) => {
    setAviso('')
    try {
      await navigator.clipboard.writeText(c.urlValidacao)
      setAviso('Link de validação copiado.')
    } catch {
      setAviso(`Copie o link: ${c.urlValidacao}`)
    }
  }

  return <AppShell route="certificates">
    <PageTitle eyebrow="SUAS CONQUISTAS" title="Meus certificados" subtitle="Aqui ficam os cases que você concluiu e foi aprovada." />
    {erro && <div className="alert alert-error" role="alert"><p>{erro}</p></div>}
    {aviso && <div className="alert alert-success" role="status"><p>{aviso}</p></div>}
    {lista === null && !erro && <p role="status" className="diagnostico-estado">Carregando os seus certificados…</p>}

    {lista && lista.length === 0 && <div className="empty-state">
      <span><Icon name="award" size={34}/></span>
      <h2>Seu primeiro certificado está a caminho</h2>
      <p>Conclua um case e seja aprovada na avaliação para receber o seu certificado.</p>
      <Button onClick={() => go('trail')}>Ver minha trilha</Button>
    </div>}

    {lista && lista.length > 0 && <div className="certificate-list">
      {lista.map(c => <article className="certificate-item" key={c.id}>
        <div className="certificate-thumb" aria-hidden="true"><span className="logo-mark"><span/></span><small>CERTIFICADO</small><strong>Galapagos<br/>por Elas</strong><i>{iniciais(c.nomeParticipante)}</i></div>
        <div className="certificate-info">
          <Tag>{c.area.toUpperCase()}</Tag>
          <h2>{c.tituloCase}</h2>
          <p><Icon name="calendar" size={16}/> Emitido em {dataLonga(c.emitidoEm)}</p>
          <small>Código: {c.codigo}</small>
        </div>
        <div className="certificate-actions">
          <Button icon="download" onClick={() => baixar(c)} disabled={ocupado === `pdf-${c.id}`}>{ocupado === `pdf-${c.id}` ? 'Gerando…' : 'Baixar PDF'}</Button>
          <Button variant="secondary" onClick={() => linkedin(c)} disabled={ocupado === `in-${c.id}`}>Adicionar ao LinkedIn</Button>
          <Button variant="ghost" icon="copy" onClick={() => copiar(c)}>Copiar link de validação</Button>
        </div>
      </article>)}
    </div>}
  </AppShell>
}
