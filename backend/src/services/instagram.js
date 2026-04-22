import 'dotenv/config'

const APP_ID = process.env.META_APP_ID
const APP_SECRET = process.env.META_APP_SECRET
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/api/instagram/callback'

const AUTH_BASE = 'https://www.instagram.com'
const TOKEN_BASE = 'https://api.instagram.com'
const API_BASE = 'https://graph.instagram.com'

// ── OAuth ──────────────────────────────────────────────────────────────────

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'instagram_business_basic',
    response_type: 'code',
  })
  console.log('[Instagram] Auth URL gerada:', `${AUTH_BASE}/oauth/authorize?${params}`)
  return `${AUTH_BASE}/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(code) {
  console.log('[Instagram] Trocando código por token...')
  console.log('[Instagram] APP_ID:', APP_ID)
  console.log('[Instagram] REDIRECT_URI:', REDIRECT_URI)

  const body = new URLSearchParams({
    client_id: APP_ID,
    client_secret: APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
  })

  const res = await fetch(`${TOKEN_BASE}/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const text = await res.text()
  console.log('[Instagram] Resposta do token exchange:', text)

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Resposta inválida da API: ${text}`)
  }

  if (data.error) throw new Error(data.error_message || data.error?.message || JSON.stringify(data))

  // user_id do Instagram excede Number.MAX_SAFE_INTEGER — extrair como string
  const userIdMatch = text.match(/"user_id"\s*:\s*(\d+)/)
  const userId = userIdMatch ? userIdMatch[1] : String(data.user_id)
  console.log('[Instagram] user_id extraído como string:', userId)

  return { access_token: data.access_token, user_id: userId }
}

export async function getLongLivedToken(shortLivedToken) {
  console.log('[Instagram] Trocando por token de longa duração...')
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: APP_SECRET,
    access_token: shortLivedToken,
  })

  const res = await fetch(`${API_BASE}/access_token?${params}`)
  const text = await res.text()
  console.log('[Instagram] Resposta long-lived token:', text)

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Resposta inválida (long-lived): ${text}`)
  }
  if (data.error) throw new Error(data.error?.message || 'Erro ao obter token de longa duração')
  return data // { access_token, token_type, expires_in }
}

export async function refreshLongLivedToken(currentToken) {
  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: currentToken,
  })

  const res = await fetch(`${API_BASE}/refresh_access_token?${params}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error?.message || 'Erro ao renovar token')
  return data // { access_token, token_type, expires_in }
}

// ── Graph API ──────────────────────────────────────────────────────────────

export async function getUserProfile(igUserId, token) {
  // Usa /me em vez de /{id} para evitar problemas de precisão numérica
  const endpoint = `${API_BASE}/me`
  console.log('[Instagram] Buscando perfil via /me (igUserId para ref:', igUserId, ')')
  const params = new URLSearchParams({
    fields: 'user_id,username,name,profile_picture_url,followers_count,follows_count,media_count',
    access_token: token,
  })

  const res = await fetch(`${endpoint}?${params}`)
  const text = await res.text()
  console.log('[Instagram] Resposta perfil:', text)

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Resposta inválida (perfil): ${text}`)
  }
  if (data.error) throw new Error(data.error?.message || 'Erro ao buscar perfil')
  return data
}

async function getDailyInsights(igUserId, token, daysBack) {
  const until = Math.floor(Date.now() / 1000)
  const since = until - daysBack * 24 * 60 * 60

  // 'views' substitui 'impressions' na versão atual da API
  const params = new URLSearchParams({
    metric: 'reach,views,profile_views,website_clicks',
    period: 'day',
    since: since.toString(),
    until: until.toString(),
    access_token: token,
  })

  const res = await fetch(`${API_BASE}/${igUserId}/insights?${params}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error?.message || 'Erro ao buscar insights')
  return data
}

// Converte o array de insights em objeto indexado por data (YYYY-MM-DD)
function parseInsightsByDay(insightsData) {
  const byDay = {}
  for (const metric of insightsData.data || []) {
    for (const { value, end_time } of metric.values || []) {
      // end_time é o fim do período — subtraímos 1s para ficar dentro do dia correto
      const d = new Date(new Date(end_time).getTime() - 1000)
      const date = d.toISOString().split('T')[0]
      if (!byDay[date]) byDay[date] = {}
      byDay[date][metric.name] = value
    }
  }
  return byDay
}

// ── Sync ───────────────────────────────────────────────────────────────────

export async function syncAccountMetrics(accountId, igUserId, token, sql, daysBack = 30) {
  const profile = await getUserProfile(igUserId, token)

  // Atualiza dados do perfil na tabela accounts
  await sql`
    UPDATE accounts SET
      ig_username  = ${profile.username},
      profile_pic  = ${profile.profile_picture_url || null},
      updated_at   = NOW()
    WHERE id = ${accountId}
  `

  // Tenta buscar insights (requer instagram_business_manage_insights)
  let byDay = {}
  let insightsAvailable = false
  try {
    const insights = await getDailyInsights(igUserId, token, daysBack)
    byDay = parseInsightsByDay(insights)
    insightsAvailable = true
  } catch (err) {
    console.warn('[sync] Insights indisponíveis (permissão necessária):', err.message)
  }

  const stored = []

  if (insightsAvailable && Object.keys(byDay).length > 0) {
    // Salva com dados completos de insights
    for (const [date, metrics] of Object.entries(byDay)) {
      const [row] = await sql`
        INSERT INTO metrics_history
          (account_id, date, followers, reach, impressions, profile_views, website_clicks)
        VALUES
          (${accountId}, ${date}, ${profile.followers_count || 0},
           ${metrics.reach || 0}, ${metrics.views || 0},
           ${metrics.profile_views || 0}, ${metrics.website_clicks || 0})
        ON CONFLICT (account_id, date) DO UPDATE SET
          followers      = EXCLUDED.followers,
          reach          = EXCLUDED.reach,
          impressions    = EXCLUDED.impressions,
          profile_views  = EXCLUDED.profile_views,
          website_clicks = EXCLUDED.website_clicks
        RETURNING id, date
      `
      if (row) stored.push(row)
    }
  } else {
    // Fallback: salva apenas seguidores de hoje
    const today = new Date().toISOString().split('T')[0]
    const [row] = await sql`
      INSERT INTO metrics_history (account_id, date, followers)
      VALUES (${accountId}, ${today}, ${profile.followers_count || 0})
      ON CONFLICT (account_id, date) DO UPDATE SET
        followers = EXCLUDED.followers
      RETURNING id, date
    `
    if (row) stored.push(row)
  }

  return {
    profile,
    daysStored: stored.length,
    insightsAvailable,
    followers: profile.followers_count,
    mediaCount: profile.media_count,
  }
}
