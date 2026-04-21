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

export default router
