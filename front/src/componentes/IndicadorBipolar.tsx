/**
 * Indicador bipolar: os dois polos nas pontas e um marcador na posição de 0 a 100.
 * O marcador à esquerda é o polo da esquerda; ao centro é equilíbrio, não desinteresse.
 * Não mostra número: a posição basta. Leitores de tela recebem o lado em texto.
 */
export function IndicadorBipolar({ polo0, polo100, valor }: { polo0: string; polo100: string; valor: number }) {
  const v = Math.round(Math.min(100, Math.max(0, valor)))
  const lado = v <= 35 ? `mais próxima de ${polo0.toLowerCase()}` : v >= 65 ? `mais próxima de ${polo100.toLowerCase()}` : 'em equilíbrio entre os dois lados'
  return (
    <div className="indicador" role="img" aria-label={`Entre ${polo0} e ${polo100}: ${lado}.`}>
      <div className="indicador-polos" aria-hidden="true">
        <span>{polo0}</span>
        <span>{polo100}</span>
      </div>
      <div className="indicador-area" aria-hidden="true">
        <div className="indicador-trilha">
          <span className="indicador-preenchimento" style={{ width: `${v}%` }} />
          <span className="indicador-marcador" style={{ left: `${v}%` }} />
        </div>
      </div>
    </div>
  )
}
