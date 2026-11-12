/**
 * Cria uma conta da equipe (ou promove uma conta que já existe).
 *
 * Uso (na pasta backend, com DATABASE_URL apontando para o banco):
 *   pnpm equipe:criar "Nome Sobrenome" email@exemplo.com
 *
 * A senha é pedida no terminal (não aparece na tela nem fica no histórico).
 * Para automatizar, defina EQUIPE_SENHA. Se o e-mail já existe, a conta só é promovida a equipe
 * e a senha dela não muda (a não ser que EQUIPE_SENHA esteja definida).
 * Para voltar uma conta a participante: UPDATE users SET role = 'participante' WHERE email = '...';
 */
import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { createInterface } from 'node:readline'
import { db } from '../src/db/client.js'
import { users } from '../src/db/schema.js'

function pedirSenha(pergunta: string): Promise<string> {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const saida = rl as unknown as { _writeToOutput: (s: string) => void }
    let digitando = false
    const original = saida._writeToOutput.bind(rl)
    saida._writeToOutput = (s: string) => original(digitando ? '' : s)
    rl.question(pergunta, resposta => {
      rl.close()
      process.stdout.write('\n')
      resolve(resposta)
    })
    digitando = true
  })
}

async function main() {
  const [nome, emailBruto] = process.argv.slice(2)
  if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (a conexão do banco).')
  if (!emailBruto || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBruto)) throw new Error('Uso: pnpm equipe:criar "Nome Sobrenome" email@exemplo.com')
  const email = emailBruto.toLowerCase().trim()

  const [existente] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const senhaDoAmbiente = process.env.EQUIPE_SENHA

  if (existente) {
    const set: Partial<typeof users.$inferInsert> = { role: 'equipe' }
    if (senhaDoAmbiente) {
      if (senhaDoAmbiente.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.')
      set.passwordHash = await argon2.hash(senhaDoAmbiente)
    }
    await db.update(users).set(set).where(eq(users.id, existente.id))
    console.log(`Conta ${email} promovida a equipe${senhaDoAmbiente ? ' (senha atualizada)' : ' (senha mantida)'}.`)
    return
  }

  if (!nome || nome.trim().length < 2) throw new Error('Informe o nome: pnpm equipe:criar "Nome Sobrenome" email@exemplo.com')
  let senha = senhaDoAmbiente
  if (!senha) {
    if (!process.stdin.isTTY) throw new Error('Sem terminal para pedir a senha. Defina EQUIPE_SENHA.')
    senha = await pedirSenha('Senha (mínimo 8 caracteres): ')
    const confirmacao = await pedirSenha('Repita a senha: ')
    if (senha !== confirmacao) throw new Error('As senhas não conferem.')
  }
  if (senha.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.')

  await db.insert(users).values({
    name: nome.trim(), email, passwordHash: await argon2.hash(senha), role: 'equipe',
    acceptedTermsAt: new Date(), termsVersion: process.env.TERMS_VERSION ?? '1',
  })
  console.log(`Conta da equipe criada: ${email}. Entre na plataforma com esse e-mail e a senha que você definiu.`)
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
