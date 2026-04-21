import { Router } from 'express'
import sql from '../db.js'

const router = Router()

// GET /api/tags?account_id=X
router.get('/', async (req, res) => {
  const { account_id } = req.query
  try {
    const rows = account_id
      ? await sql`SELECT * FROM content_tags WHERE account_id = ${account_id} ORDER BY created_at DESC`
      : await sql`SELECT * FROM content_tags ORDER BY created_at DESC LIMIT 100`
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tags/summary?account_id=X — contagem por tag
router.get('/summary', async (req, res) => {
  const { account_id } = req.query
  if (!account_id) return res.status(400).json({ error: 'account_id obrigatório' })

  try {
    const rows = await sql`
      SELECT tag, COUNT(*)::int AS count
      FROM content_tags
      WHERE account_id = ${account_id}
      GROUP BY tag
      ORDER BY count DESC
    `
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tags — adiciona tag a um post
router.post('/', async (req, res) => {
  const { post_id, account_id, tag } = req.body
  if (!post_id || !account_id || !tag) {
    return res.status(400).json({ error: 'post_id, account_id e tag são obrigatórios' })
  }

  try {
    const [row] = await sql`
      INSERT INTO content_tags (post_id, account_id, tag)
      VALUES (${post_id}, ${account_id}, ${tag})
      ON CONFLICT (post_id, tag) DO NOTHING
      RETURNING *
    `
    res.status(201).json(row || { message: 'Tag já existe neste post' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const [row] = await sql`DELETE FROM content_tags WHERE id = ${req.params.id} RETURNING id`
    if (!row) return res.status(404).json({ error: 'Tag não encontrada' })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
