import assert from 'node:assert/strict'
import { test } from 'node:test'
import { juntarTexto } from './voz.ts'

test('o trecho ditado entra depois do que já estava escrito, sem espaços duplicados', () => {
  assert.equal(juntarTexto('', ' olá, tudo bem '), 'olá, tudo bem')
  assert.equal(juntarTexto('Primeira frase.  ', 'segunda frase.'), 'Primeira frase. segunda frase.')
  assert.equal(juntarTexto('Texto', '   '), 'Texto')
})
