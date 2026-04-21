import { Bell, RefreshCw, Search, User, Menu } from 'lucide-react'

export default function Topbar({ onMenuClick }) {
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
        <span className="text-primary font-medium cursor-pointer">Overview</span>
        <span className="text-on-surface-variant hover:text-on-surface cursor-pointer">Demographics</span>
        <span className="text-on-surface-variant hover:text-on-surface cursor-pointer">Global Trends</span>
      </nav>

      {/* Ações */}
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <button className="hidden sm:flex items-center gap-1.5 text-primary text-xs font-medium hover:opacity-80 transition-opacity">
          <RefreshCw size={13} />
          Atualizar
        </button>
        <button className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-container" />
        </button>
        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
          <User size={13} className="text-on-primary" />
        </div>
      </div>
    </header>
  )
}
