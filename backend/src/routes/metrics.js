import { Router } from 'express'
import sql from '../db.js'

const router = Router()

// GET /api/metrics?account_id=X&from=2026-01-01&to=2026-01-31
router.get('/', async (req, res) => {
  const { account_id, from, to } = req.query

  if (!account_id) return res.status(400).json({ error: 'account_id obrigatório' })

  try {
    let rows
    if (from && to) {
      rows = await sql`
        SELECT * FROM metrics_history
        WHERE account_id = ${account_id}
          AND date BETWEEN ${from} AND ${to}
        ORDER BY date DESC
      `
    } else {
      rows = await sql`
        SELECT * FROM metrics_history
        WHERE account_id = ${account_id}
        ORDER BY date DESC
        LIMIT 30
      `
    }
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metrics/summary?account_id=X&from=DATE&to=DATE&prev_from=DATE&prev_to=DATE
// Retorna período atual + período anterior para calcular variação %
router.get('/summary', async (req, res) => {
  const { account_id, from, to, prev_from, prev_to } = req.query

  if (!account_id) return res.status(400).json({ error: 'account_id obrigatório' })
  if (!from || !to)  return res.status(400).json({ error: 'from e to são obrigatórios' })

  try {
    const [summary] = await sql`
      SELECT
        COUNT(CASE WHEN date BETWEEN ${from} AND ${to} THEN 1 END)::int AS total_days,
        COALESCE(SUM(CASE WHEN date BETWEEN ${from} AND ${to} THEN reach       END), 0)::int AS total_reach,
        COALESCE(SUM(CASE WHEN date BETWEEN ${from} AND ${to} THEN impressions END), 0)::int AS total_impressions,
        COALESCE(AVG(CASE WHEN date BETWEEN ${from} AND ${to} THEN NULLIF(engagement_rate, 0) END), 0) AS avg_engagement,
        COALESCE(MAX(CASE WHEN date BETWEEN ${from} AND ${to} THEN followers   END), 0)::int AS current_followers,
        COALESCE(MIN(CASE WHEN date BETWEEN ${from} AND ${to} THEN NULLIF(followers, 0) END), 0)::int AS start_followers,
        COALESCE(SUM(CASE WHEN date BETWEEN ${from} AND ${to} THEN posts_count   END), 0)::int AS total_posts,
        COALESCE(SUM(CASE WHEN date BETWEEN ${from} AND ${to} THEN stories_count END), 0)::int AS total_stories,
        COALESCE(SUM(CASE WHEN date BETWEEN ${from} AND ${to} THEN reels_count   END), 0)::int AS total_reels,
        -- Período anterior (para calcular variação %)
        COALESCE(SUM(CASE WHEN date BETWEEN ${prev_from} AND ${prev_to} THEN reach       END), 0)::int AS prev_reach,
        COALESCE(SUM(CASE WHEN date BETWEEN ${prev_from} AND ${prev_to} THEN impressions END), 0)::int AS prev_impressions,
        COALESCE(AVG(CASE WHEN date BETWEEN ${prev_from} AND ${prev_to} THEN NULLIF(engagement_rate, 0) END), 0) AS prev_engagement,
        COALESCE(MAX(CASE WHEN date BETWEEN ${prev_from} AND ${prev_to} THEN followers END), 0)::int AS prev_followers
      FROM metrics_history
      WHERE account_id = ${account_id}
        AND date >= ${prev_from}
        AND date <= ${to}
    `
    res.json(summary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/metrics — insere métricas de um dia
router.post('/', async (req, res) => {
  const {
    account_id, date, followers, follows, reach, impressions,
    profile_views, website_clicks, engagement_rate,
    posts_count, stories_count, reels_count
  } = req.body

  try {
    const [row] = await sql`
      INSERT INTO metrics_history
        (account_id, date, followers, follows, reach, impressions,
         profile_views, website_clicks, engagement_rate,
         posts_count, stories_count, reels_count)
      VALUES
        (${account_id}, ${date}, ${followers || 0}, ${follows || 0},
         ${reach || 0}, ${impressions || 0}, ${profile_views || 0},
         ${website_clicks || 0}, ${engagement_rate || 0},
         ${posts_count || 0}, ${stories_count || 0}, ${reels_count || 0})
      ON CONFLICT (account_id, date)
      DO UPDATE SET
        followers = EXCLUDED.followers,
        follows = EXCLUDED.follows,
        reach = EXCLUDED.reach,
        impressions = EXCLUDED.impressions,
        profile_views = EXCLUDED.profile_views,
        website_clicks = EXCLUDED.website_clicks,
        engagement_rate = EXCLUDED.engagement_rate,
        posts_count = EXCLUDED.posts_count,
        stories_count = EXCLUDED.stories_count,
        reels_count = EXCLUDED.reels_count
      RETURNING *
    `
    res.status(201).json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
