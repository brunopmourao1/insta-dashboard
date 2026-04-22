import { useState } from 'react'
import { Eye, Heart, Hash, Users, Zap, Film, LayoutGrid, Rows3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import clsx from 'clsx'
import KpiCard from '../components/ui/KpiCard'
import PeriodFilter from '../components/ui/PeriodFilter'
import AccountSelector from '../components/ui/AccountSelector'
import HeatmapGrid from '../components/charts/HeatmapGrid'
import { useAccounts, useMetricsSummary, useHeatmap, useTopPosts } from '../hooks/useApi'
import { useFilter } from '../contexts/FilterContext'

const TYPE_ICONS = { Reels: Film, Carrossel: LayoutGrid, Post: Rows3 }
const TYPE_COLORS = { Reels: '#ffafd2', Carrossel: '#e3b5ff', Post: '#cb80fe' }

function pctChange(current, prev) {
  if (!prev || prev === 0) return null
  return Number(((current - prev) / prev * 100).toFixed(1))
}

function ContentTypeTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p className="font-semibold text-on-surface">{payload[0].payload.type}</p>
      <p className="text-on-surface-variant">{payload[0].value}% eng. médio</p>
      <p className="text-on-surface-variant">{payload[0].payload.count} posts analisados</p>
    </div>
  )
}

function ContentTypeChart({ posts }) {
  const types = ['Reels', 'Carrossel', 'Post']
  const stats = types.map((type) => {
    const filtered = posts.filter((p) => p.type === type)
    const avgEng = filtered.length > 0
      ? Number((filtered.reduce((s, p) => s + p.engagementRate, 0) / filtered.length).toFixed(1))
      : 0
    const avgReach = filtered.length > 0
      ? Math.round(filtered.reduce((s, p) => s + (p.reach || 0), 0) / filtered.length)
      : 0
    return { type, count: filtered.length, avgEng, avgReach }
  }).filter((s) => s.count > 0)

  if (stats.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-on-surface-variant">
        Aguardando dados de posts...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={stats} barCategoryGap="30%">
          <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<ContentTypeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="avgEng" radius={[6, 6, 0, 0]}>
            {stats.map((s) => (
              <Cell key={s.type} fill={TYPE_COLORS[s.type] || '#ffafd2'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => {
          const Icon = TYPE_ICONS[s.type] || Rows3
          return (
            <div key={s.type} className="bg-surface-highest rounded-xl p-3 text-center">
              <Icon size={14} className="text-primary mx-auto mb-1" />
              <p className="text-xs text-on-surface-variant">{s.type}</p>
              <p className="font-display text-sm font-bold text-on-surface mt-0.5">{s.avgEng}%</p>
              <p className="text-[10px] text-on-surface-variant">
                {s.avgReach >= 1000 ? `${(s.avgReach / 1000).toFixed(1)}K` : s.avgReach} alcance médio
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const efficiencyConfig = {
  high:   { label: 'Alto',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  medium: { label: 'Médio', color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400' },
  low:    { label: 'Baixo', color: 'text-on-surface-variant', bg: 'bg-surface-highest', dot: 'bg-outline-variant' },
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

  const { getDateRange } = useFilter()
  const range = getDateRange()

  const { data: summary, isLoading } = useMetricsSummary(currentId, range)
  const { data: heatmapResult } = useHeatmap(currentId)
  const { data: topPosts = [] } = useTopPosts(currentId)

  const heatmapData    = heatmapResult?.heatmap
  const hourEfficiency = heatmapResult?.efficiency || []

  // Engagement rate calculado dos posts reais (fallback para banco)
  const avgEngagement = topPosts.length > 0
    ? Number((topPosts.reduce((s, p) => s + p.engagementRate, 0) / topPosts.length).toFixed(1))
    : Number(summary?.avg_engagement || 0).toFixed(1)

  const reachChange      = pctChange(summary?.total_reach, summary?.prev_reach)
  const engagementChange = pctChange(Number(avgEngagement), Number(summary?.prev_engagement))
  const followerGain   = (summary?.current_followers || 0) - (summary?.start_followers || 0)
  const followerChange = pctChange(summary?.current_followers, summary?.prev_followers)

  return (
    <div className="space-y-6">
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

      {isLoading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-low rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Total Reach"       value={summary.total_reach}                               change={reachChange}      icon={Eye} />
          <KpiCard label="Engagement Rate"   value={avgEngagement}                                     change={engagementChange} suffix="%" icon={Heart} />
          <KpiCard label="Seguidores Ganhos" value={followerGain >= 0 ? `+${followerGain}` : followerGain} change={followerChange}   icon={Users} />
          <KpiCard label="Impressões"        value={summary.total_impressions}                          change={pctChange(summary.total_impressions, summary.prev_impressions)} icon={Hash} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-on-surface">Performance por Tipo de Conteúdo</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Engagement rate médio por formato · {topPosts.length} posts analisados
              </p>
            </div>
          </div>
          <ContentTypeChart posts={topPosts} />
        </div>

        <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-primary" />
            <h2 className="font-display font-semibold text-on-surface">Eficiência de Horário</h2>
          </div>
          <div>
            {hourEfficiency.length > 0
              ? hourEfficiency.map((item, i) => <EfficiencyRow key={i} item={item} />)
              : <p className="text-xs text-on-surface-variant py-4 text-center">Aguardando dados...</p>
            }
          </div>
        </div>
      </div>

      <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
        <div className="mb-4">
          <h2 className="font-display font-semibold text-on-surface">Heatmap de Interação</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Alcance médio por dia e horário de postagem
          </p>
        </div>
        {heatmapData
          ? <HeatmapGrid data={heatmapData} />
          : <div className="h-32 flex items-center justify-center text-xs text-on-surface-variant animate-pulse">Calculando heatmap...</div>
        }
      </div>
    </div>
  )
}
