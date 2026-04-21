import { Router } from 'express'
import sql from '../db.js'

const router = Router()

// GET /api/accounts — lista todas as contas
router.get('/', async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, ig_username, display_name, profile_pic, is_active,
             token_expiry, created_at, updated_at
      FROM accounts
      ORDER BY created_at DESC
    `
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/accounts/:id — detalhes de uma conta
router.get('/:id', async (req, res) => {
  try {
    const [row] = await sql`
      SELECT id, ig_user_id, ig_username, display_name, profile_pic,
             is_active, token_expiry, created_at, updated_at
      FROM accounts WHERE id = ${req.params.id}
    `
    if (!row) return res.status(404).json({ error: 'Conta não encontrada' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/accounts — cria uma conta
router.post('/', async (req, res) => {
  const { ig_user_id, ig_username, display_name, profile_pic, access_token, token_expiry } = req.body
  try {
    const [row] = await sql`
      INSERT INTO accounts (ig_user_id, ig_username, display_name, profile_pic, access_token, token_expiry)
      VALUES (${ig_user_id}, ${ig_username}, ${display_name || null}, ${profile_pic || null},
              ${access_token || null}, ${token_expiry || null})
      RETURNING id, ig_username, display_name, is_active, created_at
    `
    res.status(201).json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/accounts/:id — atualiza uma conta
router.patch('/:id', async (req, res) => {
  const { display_name, access_token, token_expiry, is_active } = req.body
  try {
    const [row] = await sql`
      UPDATE accounts SET
        display_name = COALESCE(${display_name ?? null}, display_name),
        access_token = COALESCE(${access_token ?? null}, access_token),
        token_expiry = COALESCE(${token_expiry ?? null}, token_expiry),
        is_active    = COALESCE(${is_active ?? null}, is_active),
        updated_at   = NOW()
      WHERE id = ${req.params.id}
      RETURNING id, ig_username, display_name, is_active, updated_at
    `
    if (!row) return res.status(404).json({ error: 'Conta não encontrada' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/accounts/:id — remove uma conta
router.delete('/:id', async (req, res) => {
  try {
    const [row] = await sql`
      DELETE FROM accounts WHERE id = ${req.params.id} RETURNING id
    `
    if (!row) return res.status(404).json({ error: 'Conta não encontrada' })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
