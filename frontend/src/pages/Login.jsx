import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { APP_NAME } from '../lib/constants'
import { authApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.login(email, password)
      login(response.token, response.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Glow decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container opacity-10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-secondary-container opacity-8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-4">
            <span className="font-display font-bold text-on-primary text-2xl">G</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface">{APP_NAME}</h1>
          <p className="text-sm text-on-surface-variant mt-1">Intelligence Suite</p>
        </div>

        {/* Card */}
        <div className="bg-surface-low border border-outline-variant/15 rounded-2xl p-6 shadow-ambient">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-1">Bem-vinda de volta</h2>
          <p className="text-xs text-on-surface-variant mb-6">Acesse seu dashboard de inteligência</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-on-surface-variant mb-1.5 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary-container transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-on-surface-variant mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary-container transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-on-primary text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          Uso pessoal · {APP_NAME}
        </p>
      </div>
    </div>
  )
}
