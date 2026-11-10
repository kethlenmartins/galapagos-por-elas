import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined })
export const db = drizzle(pool, { schema })
