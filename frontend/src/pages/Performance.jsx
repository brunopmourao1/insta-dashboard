import { useState } from 'react'
import { Eye, Heart, MousePointerClick, Zap } from 'lucide-react'
import clsx from 'clsx'
import KpiCard from '../components/ui/KpiCard'
import PeriodFilter from '../components/ui/PeriodFilter'
import AccountSelector from '../components/ui/AccountSelector'
import RetentionChart from '../components/charts/RetentionChart'
import HeatmapGrid from '../components/charts/HeatmapGrid'
import { useAccounts, useMetricsSummary } from '../hooks/useApi'
import { reelsRetention, heatmapData, hourEfficiency } from '../data/mock'

const efficiencyConfig = {
  high: { label: 'Alto', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  medium: { label: 'Médio', color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  low: { label: 'Baixo', color: 'text-on-surface-variant', bg: 'bg-surface-highest', dot: 'bg-outline-variant' },
}

function EfficiencyRow({ item }) {
  const cfg = efficiencyConfig[item.level]
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
      <div className={clsx('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface font-medium">{item.time}</p>
        <p className="text-xs text-on-surface-variant">{item.days}</p>
      </div>
      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.color, cfg.bg)}>
        {cfg.label}
      </span>
    </div>
  )
}

export default function Performance() {
  const { data: accounts = [] } = useAccounts()
  const [accountId, setAccountId] = useState(null)
  const currentId = accountId || accounts[0]?.id

  const { data: summary, isLoading } = useMetricsSummary(currentId, 30)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Performance Individual</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Métricas detalhadas por conta — últimos 30 dias.
          </p>
        </div>
        <AccountSelector value={currentId} onChange={setAccountId} />
      </div>

      <PeriodFilter />

      {/* KPIs */}
      {isLoading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-low rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <KpiCard label="Total Reach" value={summary.total_reach} change={13.0} icon={Eye} />
          <KpiCard label="Engagement Rate" value={Number(summary.avg_engagement).toFixed(1)} change={-0.4} suffix="%" icon={Heart} />
          <KpiCard label="High-Intent Actions" value={summary.total_posts + summary.total_stories + summary.total_reels} change={33.6} icon={MousePointerClick} />
        </div>
      )}

      {/* Retenção + Eficiência */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-display font-semibold text-on-surface">Retenção de Reels</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Curva de drop-off da watch-time média
              </p>
            </div>
            <button className="text-xs text-primary hover:opacity-80 transition-opacity">
              Ver todos →
            </button>
          </div>
          <RetentionChart data={reelsRetention} />
        </div>

        <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-primary" />
            <h2 className="font-display font-semibold text-on-surface">Eficiência de Horário</h2>
          </div>
          <div>
            {hourEfficiency.map((item, i) => (
              <EfficiencyRow key={i} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
        <div className="mb-4">
          <h2 className="font-display font-semibold text-on-surface">Heatmap de Interação</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Audiência online vs presença com engajamento ativo
          </p>
        </div>
        <HeatmapGrid data={heatmapData} />
      </div>
    </div>
  )
}
