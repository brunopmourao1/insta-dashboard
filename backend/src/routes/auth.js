import { Router } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate Limiter: Max 5 tentativas por 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  if (!adminEmail || !adminPassword || !jwtSecret) {
    return res.status(500).json({ error: 'Credenciais de administrador não configuradas no servidor' })
  }

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return res.json({ token, user: { email: adminEmail, role: 'admin' } })
  }

  return res.status(401).json({ error: 'Credenciais inválidas' })
})

export default router
