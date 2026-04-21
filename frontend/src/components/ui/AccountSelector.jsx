import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useAccounts } from '../../hooks/useApi'
import clsx from 'clsx'

export default function AccountSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const { data: accounts = [], isLoading } = useAccounts()

  const selected = accounts.find((a) => a.id === value) || accounts[0]

  // Quando as contas carregam pela primeira vez, seleciona a primeira
  if (!value && accounts.length > 0 && onChange) {
    setTimeout(() => onChange(accounts[0].id), 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-2 text-sm">
        <div className="w-6 h-6 rounded-full bg-surface-highest animate-pulse" />
        <span className="text-on-surface-variant">Carregando...</span>
      </div>
    )
  }

  if (!selected) return null

  const initial = (selected.ig_username || selected.display_name || '?')[0].toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-2 text-sm hover:bg-surface-highest transition-colors"
      >
        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
          <span className="text-on-primary text-[10px] font-bold">{initial}</span>
        </div>
        <span className="text-on-surface font-medium">@{selected.ig_username}</span>
        <ChevronDown size={14} className={clsx('text-on-surface-variant transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 min-w-48 bg-surface-high border border-outline-variant/20 rounded-xl shadow-ambient z-50 py-1">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => { onChange?.(account.id); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-highest transition-colors"
            >
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <span className="text-on-primary text-[10px] font-bold">
                  {(account.ig_username || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-on-surface font-medium">@{account.ig_username}</p>
                <p className="text-on-surface-variant text-xs">{account.display_name}</p>
              </div>
              {selected.id === account.id && (
                <Check size={13} className="text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
