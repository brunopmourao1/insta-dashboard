import { Router } from 'express'
import sql from '../db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  getAuthUrl,
  exchangeCodeForToken,
  getLongLivedToken,
  refreshLongLivedToken,
  getUserProfile,
  syncAccountMetrics,
  fetchMedia,
  fetchMediaInsights,
  fetchDemographics,
} from '../services/instagram.js'

const router = Router()
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── GET /api/instagram/auth-url ───────────────────────────────────────────
// Retorna a URL de autorização OAuth do Instagram (requer JWT)
router.get('/auth-url', authMiddleware, (req, res) => {
  try {
    const url = getAuthUrl()
    res.json({ url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/instagram/callback ───────────────────────────────────────────
// Callback público chamado pela Meta após autorização do usuário
router.get('/callback', async (req, res) => {
  const { code, error, error_reason } = req.query

  if (error) {
    const msg = error_reason || error
    return res.redirect(`${FRONTEND_URL}/configuracoes?ig_error=${encodeURIComponent(msg)}`)
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/configuracoes?ig_error=codigo_ausente`)
  }

  try {
    // 1. Troca código por token de curta duração
    const { access_token: shortToken, user_id: igUserId } = await exchangeCodeForToken(code)

    // 2. Troca por token de longa duração (60 dias)
    const { access_token: longToken, expires_in } = await getLongLivedToken(shortToken)
    const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString()

    // 3. Busca perfil para preencher dados da conta
    const profile = await getUserProfile(igUserId, longToken)

    // 4. Verifica se conta já existe
    const [existing] = await sql`
      SELECT id FROM accounts WHERE ig_user_id = ${igUserId.toString()}
    `

    if (existing) {
      await sql`
        UPDATE accounts SET
          access_token = ${longToken},
          token_expiry = ${tokenExpiry},
          ig_username  = ${profile.username},
          profile_pic  = ${profile.profile_picture_url || null},
          is_active    = true,
          updated_at   = NOW()
        WHERE ig_user_id = ${igUserId.toString()}
      `
      return res.redirect(`${FRONTEND_URL}/configuracoes?ig_connected=updated&username=${profile.username}`)
    }

    // 5. Cria nova conta
    await sql`
      INSERT INTO accounts (ig_user_id, ig_username, display_name, profile_pic, access_token, token_expiry)
      VALUES (
        ${igUserId.toString()},
        ${profile.username},
        ${profile.name || profile.username},
        ${profile.profile_picture_url || null},
        ${longToken},
        ${tokenExpiry}
      )
    `

    res.redirect(`${FRONTEND_URL}/configuracoes?ig_connected=new&username=${profile.username}`)
  } catch (err) {
    console.error('[Instagram callback]', err.message)
    res.redirect(`${FRONTEND_URL}/configuracoes?ig_error=${encodeURIComponent(err.message)}`)
  }
})

// ── POST /api/instagram/sync/:accountId ──────────────────────────────────
// Sincroniza métricas de uma conta específica
router.post('/sync/:accountId', authMiddleware, async (req, res) => {
  const { accountId } = req.params
  const days = parseInt(req.body?.days) || 30

  try {
    const [account] = await sql`
      SELECT id, ig_user_id, access_token FROM accounts
      WHERE id = ${accountId} AND is_active = true
    `
    if (!account) return res.status(404).json({ error: 'Conta não encontrada ou inativa' })
    if (!account.access_token) return res.status(400).json({ error: 'Conta sem token — conecte via OAuth primeiro' })

    const result = await syncAccountMetrics(accountId, account.ig_user_id, account.access_token, sql, days)
    res.json({ success: true, username: result.profile.username, daysStored: result.daysStored })
  } catch (err) {
    console.error('[sync account]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/instagram/sync ──────────────────────────────────────────────
// Sincroniza todas as contas ativas
router.post('/sync', authMiddleware, async (req, res) => {
  const days = parseInt(req.body?.days) || 30

  try {
    const accounts = await sql`
      SELECT id, ig_user_id, access_token FROM accounts
      WHERE is_active = true AND access_token IS NOT NULL
    `

    const results = []
    for (const account of accounts) {
      try {
        const result = await syncAccountMetrics(account.id, account.ig_user_id, account.access_token, sql, days)
        results.push({ accountId: account.id, success: true, daysStored: result.daysStored })
      } catch (err) {
        results.push({ accountId: account.id, success: false, error: err.message })
      }
    }

    res.json({ synced: accounts.length, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/instagram/refresh-token/:accountId ─────────────────────────
// Renova o token de longa duração de uma conta
router.post('/refresh-token/:accountId', authMiddleware, async (req, res) => {
  const { accountId } = req.params

  try {
    const [account] = await sql`
      SELECT id, access_token FROM accounts WHERE id = ${accountId}
    `
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' })
    if (!account.access_token) return res.status(400).json({ error: 'Conta sem token' })

    const { access_token: newToken, expires_in } = await refreshLongLivedToken(account.access_token)
    const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString()

    await sql`
      UPDATE accounts SET
        access_token = ${newToken},
        token_expiry = ${tokenExpiry},
        updated_at   = NOW()
      WHERE id = ${accountId}
    `

    res.json({ success: true, tokenExpiry })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/instagram/media/:accountId ──────────────────────────────────
router.get('/media/:accountId', authMiddleware, async (req, res) => {
  const { accountId } = req.params
  const limit = Math.min(parseInt(req.query.limit) || 12, 30)

  try {
    const [account] = await sql`SELECT access_token FROM accounts WHERE id = ${accountId} AND is_active = true`
    if (!account?.access_token) return res.status(404).json({ error: 'Conta sem token' })

    const mediaList = await fetchMedia(account.access_token, limit)

    const posts = await Promise.all(
      mediaList.map(async (media) => {
        const insights = await fetchMediaInsights(media.id, account.access_token)
        const likes = media.like_count || 0
        const comments = media.comments_count || 0
        const reach = insights.reach || 0
        const shares = insights.shares || 0
        const saves = insights.saved || 0
        const engagementRate = reach > 0
          ? (((likes + comments + shares + saves) / reach) * 100).toFixed(1)
          : '0.0'

        const type =
          media.media_type === 'VIDEO' ? 'Reels'
          : media.media_type === 'CAROUSEL_ALBUM' ? 'Carrossel'
          : 'Post'

        const caption = media.caption || ''
        const title = caption.split('\n')[0].slice(0, 60) ||
          `${type} · ${new Date(media.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`

        return {
          id: media.id,
          type,
          title,
          date: media.timestamp,
          likes,
          comments,
          reach,
          shares,
          saves,
          engagementRate: parseFloat(engagementRate),
          thumbnail: media.thumbnail_url || media.media_url || null,
        }
      })
    )

    posts.sort((a, b) => b.reach - a.reach)
    res.json(posts)
  } catch (err) {
    console.error('[media]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/instagram/demographics/:accountId ───────────────────────────
router.get('/demographics/:accountId', authMiddleware, async (req, res) => {
  const { accountId } = req.params

  try {
    const [account] = await sql`SELECT access_token FROM accounts WHERE id = ${accountId} AND is_active = true`
    if (!account?.access_token) return res.status(404).json({ error: 'Conta sem token' })

    const demographics = await fetchDemographics(account.access_token)
    res.json(demographics)
  } catch (err) {
    console.error('[demographics]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/instagram/heatmap/:accountId ────────────────────────────────
router.get('/heatmap/:accountId', authMiddleware, async (req, res) => {
  const { accountId } = req.params

  try {
    const [account] = await sql`SELECT access_token FROM accounts WHERE id = ${accountId} AND is_active = true`
    if (!account?.access_token) return res.status(404).json({ error: 'Conta sem token' })

    const mediaList = await fetchMedia(account.access_token, 50)

    const postsRaw = await Promise.allSettled(
      mediaList.map(async (media) => {
        const insights = await fetchMediaInsights(media.id, account.access_token)
        return { timestamp: new Date(media.timestamp), reach: insights.reach || 0, likes: media.like_count || 0 }
      })
    )
    const posts = postsRaw.filter((r) => r.status === 'fulfilled').map((r) => r.value)

    // Heatmap: 3 slots × 7 days (Mon→Sun)
    const gridData = Array.from({ length: 3 }, () => Array(7).fill(null).map(() => ({ count: 0, reach: 0 })))

    for (const post of posts) {
      const dow = (post.timestamp.getDay() + 6) % 7 // 0=Mon … 6=Sun
      const hour = post.timestamp.getHours()
      const slot = hour >= 18 ? 2 : hour >= 12 ? 1 : 0
      gridData[slot][dow].count++
      gridData[slot][dow].reach += post.reach
    }

    const maxAvg = Math.max(
      ...gridData.flatMap((row) => row.map((c) => (c.count > 0 ? c.reach / c.count : 0)))
    ) || 1

    const values = gridData.map((row) =>
      row.map((c) => (c.count > 0 ? Math.round((c.reach / c.count / maxAvg) * 10) : 0))
    )

    // Hourly efficiency from posting history
    const hourMap = {}
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    for (const post of posts) {
      const h = post.timestamp.getHours()
      const key = `${String(h).padStart(2, '0')}:00`
      if (!hourMap[key]) hourMap[key] = { reach: 0, count: 0, days: new Set() }
      hourMap[key].reach += post.reach
      hourMap[key].count++
      hourMap[key].days.add(dayNames[post.timestamp.getDay()])
    }

    const efficiency = Object.entries(hourMap)
      .map(([time, d]) => ({
        time: `${time} – ${String(parseInt(time) + 1).padStart(2, '0')}:00`,
        days: [...d.days].join(', '),
        avgReach: d.count > 0 ? d.reach / d.count : 0,
      }))
      .sort((a, b) => b.avgReach - a.avgReach)
      .slice(0, 4)
      .map((item, i) => ({ ...item, level: i === 0 ? 'high' : i < 3 ? 'medium' : 'low' }))

    res.json({
      heatmap: {
        days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        hours: ['Manhã\n06–12h', 'Tarde\n12–18h', 'Noite\n18–24h'],
        values,
      },
      efficiency,
      postsAnalyzed: posts.length,
    })
  } catch (err) {
    console.error('[heatmap]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
