import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATRASO_MENSAGEM_MS, atrasoParaMostrar, ehFala } from './revelacao.ts'

test('só linhas no formato Nome: “fala” viram balão', () => {
  assert.equal(ehFala('Marina: “Bom dia, vamos começar.”'), true)
  assert.equal(ehFala('Você: "Posso fazer uma pergunta?"'), true)
  assert.equal(ehFala('A empresa tem 240 cafeterias no Norte e no Nordeste.'), false)
  assert.equal(ehFala('Observação: veja a tabela abaixo.'), false)
})

test('cada fala espera 3 segundos, a narração aparece na hora e a primeira da tarefa abre sem espera', () => {
  const fala = 'Luísa: “Preciso decidir se compro mais.”'
  assert.equal(ATRASO_MENSAGEM_MS, 3000)
  assert.equal(atrasoParaMostrar(fala, 0, true), 0)
  assert.equal(atrasoParaMostrar(fala, 1, true), 3000)
  assert.equal(atrasoParaMostrar(fala, 0, false), 3000, 'depois de “Continuar” a primeira fala também aguarda')
  assert.equal(atrasoParaMostrar('Você é estagiária na equipe de research.', 2, false), 0)
})
