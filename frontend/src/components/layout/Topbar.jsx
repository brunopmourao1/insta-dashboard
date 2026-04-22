import { useState } from 'react'
import { Bell, RefreshCw, Search, User, Menu, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'

const navLinks = [
  { label: 'Overview',     path: '/' },
  { label: 'Demographics', path: '/audiencia' },
  { label: 'Performance',  path: '/performance' },
]

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout, user } = useAuth()
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  async function handleSync() {
    setSyncing(true)
    setSyncDone(false)
    try {
      await api.syncAllAccounts()
      await queryClient.invalidateQueries()
      setSyncDone(true)
      setTimeout(() => setSyncDone(false), 3000)
    } catch (err) {
      console.error('[sync]', err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-outline-variant/20 bg-surface sticky top-0 z-20">
      {/* Hambúrguer (mobile) + busca */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <Search size={15} className="text-on-surface-variant shrink-0 hidden sm:block" />
        <input
          type="text"
          placeholder="Buscar métricas, posts..."
          className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant outline-none w-full hidden sm:block"
        />
      </div>

      {/* Nav (desktop) */}
      <nav className="hidden md:flex items-center gap-6 text-sm shrink-0">
        {navLinks.map(({ label, path }) => {
          const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={clsx(
                'transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {label}
            </button>
          )
        })}
      </nav>

      {/* Ações */}
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <button
          onClick={handleSync}
          disabled={syncing}
          className={clsx(
            'hidden sm:flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50',
            syncDone ? 'text-emerald-400' : 'text-primary',
          )}
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : syncDone ? 'Atualizado!' : 'Atualizar'}
        </button>

        <button className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-container" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            {user?.name
              ? <span className="text-on-primary text-xs font-bold">{user.name[0].toUpperCase()}</span>
              : <User size={13} className="text-on-primary" />
            }
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-9 z-40 bg-surface-high border border-outline-variant/20 rounded-xl shadow-ambient p-3 min-w-[180px]">
                {user && (
                  <div className="mb-2 pb-2 border-b border-outline-variant/10">
                    <p className="text-xs font-medium text-on-surface truncate">{user.name || user.email}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                  </div>
                )}
                <button
                  onClick={() => { logout(); setShowUserMenu(false) }}
                  className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-red-400 transition-colors w-full py-1"
                >
                  <LogOut size={12} />
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
