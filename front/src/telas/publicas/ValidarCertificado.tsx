import { useEffect, useState, type FormEvent } from 'react'
import { dataLonga } from '../../app/formatos'
import { parametroDoHash } from '../../app/rotas'
import { Button } from '../../componentes/Botao'
import { Field } from '../../componentes/Campos'
import { Icon } from '../../componentes/Icone'
import { PublicHeader } from '../../componentes/Layout'
import { certificadoService, type ValidacaoCertificado } from '../../services'

type Estado = { tipo: 'parado' } | { tipo: 'carregando' } | { tipo: 'valido'; dados: ValidacaoCertificado; codigo: string } | { tipo: 'invalido' } | { tipo: 'erro'; mensagem: string }

export function ValidateCertificate() {
  const [codigo, setCodigo] = useState(parametroDoHash('codigo') ?? '')
  const [estado, setEstado] = useState<Estado>({ tipo: 'parado' })

  const validar = async (valor: string) => {
    if (!valor.trim()) return setEstado({ tipo: 'invalido' })
    setEstado({ tipo: 'carregando' })
    const r = await certificadoService.validarCertificado(valor)
    if (r.erro) return setEstado({ tipo: 'erro', mensagem: r.erro.mensagem })
    setEstado(r.dados ? { tipo: 'valido', dados: r.dados, codigo: valor.trim().toUpperCase() } : { tipo: 'invalido' })
  }

  // Quem chega pelo link do certificado (`#/validate?codigo=…`) já vê o resultado.
  useEffect(() => {
    const inicial = parametroDoHash('codigo')
    if (inicial) validar(inicial)
  }, [])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    validar(codigo)
  }

  return <div className="public-simple"><PublicHeader/><main><div className="validate-card">
    <div className="round-icon"><Icon name="award" size={30}/></div>
    <h1>Validar certificado</h1>
    <p>Digite o código que aparece no certificado para confirmar sua autenticidade.</p>
    <form onSubmit={enviar}>
      <Field label="Código do certificado" placeholder="Ex.: ALU-2026-0001-AB12" value={codigo} onChange={setCodigo}/>
      <Button type="submit" disabled={estado.tipo === 'carregando'}>{estado.tipo === 'carregando' ? 'Validando…' : 'Validar'}</Button>
    </form>
    <div aria-live="polite">
      {estado.tipo === 'valido' && <div className="certificate-valid">
        <div><Icon name="check"/><strong>Certificado válido</strong></div>
        <dl><dt>Participante</dt><dd>{estado.dados.nome}</dd><dt>Case</dt><dd>{estado.dados.tituloCase}</dd><dt>Emissão</dt><dd>{dataLonga(estado.dados.emitidoEm)}</dd><dt>Código</dt><dd>{estado.codigo}</dd></dl>
      </div>}
      {estado.tipo === 'invalido' && <div className="alert alert-error"><p>Não encontramos um certificado com este código.</p></div>}
      {estado.tipo === 'erro' && <div className="alert alert-error"><p>{estado.mensagem}</p></div>}
    </div>
  </div></main></div>
}
