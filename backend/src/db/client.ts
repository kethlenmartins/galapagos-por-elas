import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

// Render's fromDatabase connectionString is the private/internal URL. Internal
// connections are on the private network and use no TLS by default; Render's
// internal TLS certs are self-signed and cannot pass rejectUnauthorized=true.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 })
export const db = drizzle(pool, { schema })
