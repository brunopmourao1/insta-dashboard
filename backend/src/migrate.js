import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function migrate() {
  const migrationPath = path.join(__dirname, 'migrations', '001_init.sql')
  const raw = fs.readFileSync(migrationPath, 'utf-8')

  // Remove comentários e divide por ";" em statements individuais
  const statements = raw
    .split(';')
    .map((s) => s.replace(/--.*$/gm, '').trim())
    .filter((s) => s.length > 0)

  console.log(`🔄 Executando migração no Neon (${statements.length} statements)...`)

  const sql = neon(process.env.DATABASE_URL)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ')
    try {
      await sql.query(stmt)
      console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`)
    } catch (err) {
      console.error(`  ❌ [${i + 1}/${statements.length}] ${preview}...`)
      console.error(`     Erro: ${err.message}`)
      process.exit(1)
    }
  }

  console.log('\n✅ Migração concluída com sucesso!')
  console.log('   Tabelas: accounts, metrics_history, content_tags, context_notes')
  console.log('   Índices: idx_metrics_account_date, idx_tags_account, idx_tags_tag, idx_notes_account_date')
}

migrate()
