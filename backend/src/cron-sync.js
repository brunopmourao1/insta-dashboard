import 'dotenv/config'
import sql from './db.js'
import { syncAccountMetrics } from './services/instagram.js'

async function run() {
  console.log('[cron-sync] Iniciando sincronização diária —', new Date().toISOString())

  const accounts = await sql`
    SELECT id, ig_user_id, access_token FROM accounts
    WHERE is_active = true AND access_token IS NOT NULL
  `

  if (accounts.length === 0) {
    console.log('[cron-sync] Nenhuma conta ativa encontrada.')
    process.exit(0)
  }

  let success = 0
  let failed = 0

  for (const account of accounts) {
    try {
      const result = await syncAccountMetrics(account.id, account.ig_user_id, account.access_token, sql, 30)
      console.log(`[cron-sync] ✓ ${result.profile.username} — ${result.daysStored} dias, ${result.followers} seguidores`)
      success++
    } catch (err) {
      console.error(`[cron-sync] ✗ conta ${account.id}:`, err.message)
      failed++
    }
  }

  console.log(`[cron-sync] Concluído: ${success} ok, ${failed} falhas`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('[cron-sync] Erro fatal:', err)
  process.exit(1)
})
