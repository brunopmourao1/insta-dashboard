import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL)

// ── Helpers ──
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randFloat(min, max, dec = 2) { return +(Math.random() * (max - min) + min).toFixed(dec) }
function dateStr(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

async function seed() {
  console.log('🌱 Populando banco com dados demo...\n')

  // ── 1. Limpa dados anteriores ──
  await sql`DELETE FROM context_notes`
  await sql`DELETE FROM content_tags`
  await sql`DELETE FROM metrics_history`
  await sql`DELETE FROM accounts`
  console.log('  🗑️  Dados anteriores limpos')

  // ── 2. Contas ──
  const [conta1] = await sql`
    INSERT INTO accounts (ig_username, display_name, profile_pic, is_active)
    VALUES ('restaurante_jaque', 'Restaurante da Jaque', 'https://i.pravatar.cc/150?u=jaque', true)
    RETURNING id
  `
  const [conta2] = await sql`
    INSERT INTO accounts (ig_username, display_name, profile_pic, is_active)
    VALUES ('bruno_pessoal', 'Bruno Mourão', 'https://i.pravatar.cc/150?u=bruno', true)
    RETURNING id
  `
  console.log(`  ✅ 2 contas criadas`)

  // ── 3. Métricas (60 dias para cada conta) ──
  let metricsCount = 0
  for (const account of [
    { id: conta1.id, baseFollowers: 12400, dailyGrowth: [15, 45], baseReach: [800, 2500], baseImpressions: [1200, 4000], baseEngagement: [3.1, 6.8] },
    { id: conta2.id, baseFollowers: 3200, dailyGrowth: [3, 12], baseReach: [200, 800], baseImpressions: [400, 1200], baseEngagement: [4.0, 9.5] },
  ]) {
    let followers = account.baseFollowers
    for (let day = 59; day >= 0; day--) {
      const growth = rand(...account.dailyGrowth)
      followers += growth
      await sql`
        INSERT INTO metrics_history
          (account_id, date, followers, follows, reach, impressions,
           profile_views, website_clicks, engagement_rate,
           posts_count, stories_count, reels_count)
        VALUES (
          ${account.id}, ${dateStr(day)}, ${followers}, ${rand(200, 800)},
          ${rand(...account.baseReach)}, ${rand(...account.baseImpressions)},
          ${rand(20, 150)}, ${rand(5, 40)}, ${randFloat(...account.baseEngagement)},
          ${rand(0, 3)}, ${rand(0, 5)}, ${rand(0, 2)}
        )
      `
      metricsCount++
    }
  }
  console.log(`  ✅ ${metricsCount} registros de métricas (60 dias × 2 contas)`)

  // ── 4. Tags de conteúdo ──
  const tags = [
    { tag: 'Receita', count: 18 },
    { tag: 'Bastidores', count: 12 },
    { tag: 'Promoção', count: 8 },
    { tag: 'Dica', count: 15 },
    { tag: 'Evento', count: 6 },
    { tag: 'Depoimento', count: 9 },
    { tag: 'Reels', count: 14 },
    { tag: 'Cardápio', count: 7 },
  ]
  let tagCount = 0
  for (const t of tags) {
    for (let i = 0; i < t.count; i++) {
      await sql`
        INSERT INTO content_tags (post_id, account_id, tag)
        VALUES (${`post_${tagCount}_${Date.now()}`}, ${conta1.id}, ${t.tag})
      `
      tagCount++
    }
  }
  console.log(`  ✅ ${tagCount} tags de conteúdo`)

  // ── 5. Notas de contexto ──
  const notas = [
    { daysAgo: 3, note: 'Início da campanha de Dia das Mães', category: 'campanha' },
    { daysAgo: 7, note: 'Post viral — receita de bolo de cenoura', category: 'orgânico' },
    { daysAgo: 12, note: 'Feriado — Tiradentes', category: 'feriado' },
    { daysAgo: 18, note: 'Parceria com influenciador local @chefmaria', category: 'parceria' },
    { daysAgo: 25, note: 'Lançamento do novo cardápio de inverno', category: 'lançamento' },
    { daysAgo: 30, note: 'Black Friday — 30% off', category: 'promoção' },
    { daysAgo: 35, note: 'Evento presencial — Degustação VIP', category: 'evento' },
    { daysAgo: 45, note: 'Início dos anúncios pagos (R$500/mês)', category: 'tráfego' },
  ]
  for (const n of notas) {
    await sql`
      INSERT INTO context_notes (account_id, date, note, category)
      VALUES (${conta1.id}, ${dateStr(n.daysAgo)}, ${n.note}, ${n.category})
    `
  }
  console.log(`  ✅ ${notas.length} notas de contexto`)

  console.log('\n🎉 Seed concluído! Banco populado com dados demo.')
  console.log(`   Contas: restaurante_jaque, bruno_pessoal`)
  console.log(`   Período: últimos 60 dias`)
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err.message)
  process.exit(1)
})
