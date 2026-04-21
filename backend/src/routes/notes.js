import { Router } from 'express'
import sql from '../db.js'

const router = Router()

// GET /api/notes?account_id=X&from=2026-01-01&to=2026-01-31
router.get('/', async (req, res) => {
  const { account_id, from, to } = req.query
  try {
    let rows
    if (account_id && from && to) {
      rows = await sql`
        SELECT * FROM context_notes
        WHERE account_id = ${account_id}
          AND date BETWEEN ${from} AND ${to}
        ORDER BY date DESC
      `
    } else if (account_id) {
      rows = await sql`
        SELECT * FROM context_notes
        WHERE account_id = ${account_id}
        ORDER BY date DESC
        LIMIT 50
      `
    } else {
      rows = await sql`SELECT * FROM context_notes ORDER BY date DESC LIMIT 50`
    }
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/notes — cria anotação de contexto
router.post('/', async (req, res) => {
  const { account_id, date, note, category } = req.body
  if (!date || !note) {
    return res.status(400).json({ error: 'date e note são obrigatórios' })
  }

  try {
    const [row] = await sql`
      INSERT INTO context_notes (account_id, date, note, category)
      VALUES (${account_id || null}, ${date}, ${note}, ${category || 'geral'})
      RETURNING *
    `
    res.status(201).json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/notes/:id
router.patch('/:id', async (req, res) => {
  const { note, category } = req.body
  try {
    const [row] = await sql`
      UPDATE context_notes SET
        note     = COALESCE(${note ?? null}, note),
        category = COALESCE(${category ?? null}, category)
      WHERE id = ${req.params.id}
      RETURNING *
    `
    if (!row) return res.status(404).json({ error: 'Nota não encontrada' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const [row] = await sql`DELETE FROM context_notes WHERE id = ${req.params.id} RETURNING id`
    if (!row) return res.status(404).json({ error: 'Nota não encontrada' })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
