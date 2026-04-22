import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

function fmt(value, suffix) {
  if (suffix === '%') return `${value}${suffix}`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toLocaleString('pt-BR')
}

export default function KpiCard({ label, value, change, suffix, icon: Icon, iconColor }) {
  const hasChange = change !== null && change !== undefined
  const positive = change >= 0

  return (
    <div className="bg-surface-low rounded-xl p-5 gradient-card border border-outline-variant/10 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', iconColor || 'bg-primary-container/20')}>
          {Icon && <Icon size={16} className="text-primary" />}
        </div>
        {hasChange && (
          <span
            className={clsx(
              'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
              positive
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-red-400 bg-red-400/10',
            )}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {positive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-on-surface tracking-tight">
        {fmt(value, suffix)}
      </p>
      <p className="text-xs text-on-surface-variant mt-1">{label}</p>
    </div>
  )
}
