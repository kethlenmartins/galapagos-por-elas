import { type ReactNode } from 'react'

export function Field({ label, placeholder, type = 'text', hint, error, defaultValue, value, onChange, autoComplete }: {
  label: string; placeholder?: string; type?: string; hint?: string; error?: string; defaultValue?: string
  /** Se `value` e `onChange` forem passados, o campo é controlado. */
  value?: string; onChange?: (valor: string) => void; autoComplete?: string
}) {
  const controle = value !== undefined && onChange ? { value, onChange: (e: { target: { value: string } }) => onChange(e.target.value) } : { defaultValue }
  return <label className={`field ${error ? 'field-error' : ''}`}><span>{label}</span><input type={type} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={error ? true : undefined} {...controle}/>{hint && <small>{hint}</small>}{error && <small className="error-text">{error}</small>}</label>
}

export function SelectField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span><select defaultValue=""><option value="" disabled>Selecione uma opção</option>{children}</select></label>
}
