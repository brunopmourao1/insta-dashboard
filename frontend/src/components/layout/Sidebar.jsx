import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Grid2x2, Users, Settings, X, LogOut
} from 'lucide-react'
import { APP_NAME } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import clsx from 'clsx'

const icons = { LayoutDashboard, TrendingUp, Grid2x2, Users, Settings }

const navItems = [
  { label: 'Visão de Águia', icon: 'LayoutDashboard', path: '/' },
  { label: 'Performance', icon: 'TrendingUp', path: '/performance' },
  { label: 'Conteúdo', icon: 'Grid2x2', path: '/conteudo' },
  { label: 'Audiência', icon: 'Users', path: '/audiencia' },
  { label: 'Configurações', icon: 'Settings', path: '/configuracoes' },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen w-56 bg-surface-low flex flex-col z-40',
        'border-r border-outline-variant/20 transition-transform duration-300',
        // Mobile: oculta por padrão, slide-in quando open
        open ? 'translate-x-0' : '-translate-x-full',
        // Desktop: sempre visível
        'md:translate-x-0',
      )}
    >
      {/* Logo + fechar (mobile) */}
      <div className="px-5 py-6 border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <span className="text-on-primary text-xs font-display font-bold">G</span>
          </div>
          <div>
            <p className="font-display font-semibold text-on-surface text-sm leading-tight">
              {APP_NAME}
            </p>
            <p className="text-on-surface-variant text-[10px]">Intelligence Suite</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-highest transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, icon, path }) => {
          const Icon = icons[icon]
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-primary-container/20 text-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-highest',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-primary' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-outline-variant/20 flex items-center justify-between">
        <p className="text-on-surface-variant text-[10px]">Gestão da Jaque v1.0</p>
        <button
          onClick={logout}
          className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Sair"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
