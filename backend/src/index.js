import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import accountsRouter from './routes/accounts.js'
import metricsRouter from './routes/metrics.js'
import tagsRouter from './routes/tags.js'
import notesRouter from './routes/notes.js'
import authRouter from './routes/auth.js'
import instagramRouter from './routes/instagram.js'
import { authMiddleware } from './middlewares/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middlewares ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// ── Rotas Públicas ──
app.use('/api/auth', authRouter)

// ── Instagram (callback público + rotas protegidas por dentro do router) ──
app.use('/api/instagram', instagramRouter)

// ── Rotas Protegidas ──
app.use('/api/accounts', authMiddleware, accountsRouter)
app.use('/api/metrics', authMiddleware, metricsRouter)
app.use('/api/tags', authMiddleware, tagsRouter)
app.use('/api/notes', authMiddleware, notesRouter)

// ── Health check ──
app.get('/api/health', async (req, res) => {
  try {
    const sql = (await import('./db.js')).default
    await sql`SELECT 1`
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message })
  }
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  🚀 Gestão da Jaque — API                   ║
  ║  http://localhost:${PORT}/api                  ║
  ╚══════════════════════════════════════════════╝
  `)
})
