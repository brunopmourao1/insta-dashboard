import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não definida no .env')
  process.exit(1)
}

/** Pool de conexão Neon Serverless (HTTP) */
const sql = neon(process.env.DATABASE_URL)

export default sql
