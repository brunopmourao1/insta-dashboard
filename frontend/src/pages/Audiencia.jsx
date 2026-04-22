import { useState } from 'react'
import { MapPin, Clock, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'
import PeriodFilter from '../components/ui/PeriodFilter'
import AccountSelector from '../components/ui/AccountSelector'
import FollowerGrowthChart from '../components/charts/FollowerGrowthChart'
import { useAccounts, useMetrics, useDemographics, useHeatmap, useMetricsSummary } from '../hooks/useApi'
import { useFilter } from '../contexts/FilterContext'

function GenderTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p style={{ color: payload[0].payload.color }} className="font-semibold">{payload[0].name}</p>
      <p className="text-on-surface">{payload[0].value}%</p>
    </div>
  )
}

function AgeBar({ range, value, maxValue }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant w-10 shrink-0">{range}</span>
      <div className="flex-1 bg-surface-highest rounded-full h-2 overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${(value / maxValue) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-on-surface w-8 text-right font-display">{value}%</span>
    </div>
  )
}

function ActivityBar({ hour, value }) {
  const peak = value >= 85
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-6 bg-surface-highest rounded-md overflow-hidden" style={{ height: 60 }}>
        <div
          className={clsx('w-full rounded-md transition-all duration-500', peak ? 'gradient-primary' : 'bg-primary-container/40')}
          style={{ height: `${value}%`, marginTop: `${100 - value}%` }}
        />
      </div>
      <span className="text-[9px] text-on-surface-variant">{hour}</span>
    </div>
  )
}

function bestTimeLabel(efficiency) {
  if (!efficiency || efficiency.length === 0) return null
  const top = efficiency[0]
  const hourLabel = top.time ? top.time.split(' –')[0].replace(':00', 'h') : ''
  const daysShort = top.days
    ? top.days.split(',').slice(0, 2).map(d => d.trim()).join(', ')
    : ''
  return daysShort ? `${daysShort}, ${hourLabel}` : hourLabel
}

export default function Audiencia() {
  const { data: accounts = [] } = useAccounts()
  const [accountId, setAccountId] = useState(null)
  const currentId = accountId || accounts[0]?.id

  const { getDateRange } = useFilter()
  const range = getDateRange()

  const { data: metrics = [] } = useMetrics(currentId, range.from, range.to)
  const { data: summary }      = useMetricsSummary(currentId, range)
  const { data: demo = {} }    = useDemographics(currentId)
  const { data: heatmapResult } = useHeatmap(currentId)

  const audienceGender  = demo.gender || []
  const audienceAge     = demo.age || []
  const topLocations    = demo.cities || []
  const maxAge = audienceAge.length > 0 ? Math.max(...audienceAge.map((a) => a.value)) : 1

  // Atividade por hora: derivada de posts reais (alcance médio por hora)
  const activityByHour = heatmapResult?.hourlyActivity || []
  const hourEfficiency = heatmapResult?.efficiency || []
  const bestTime       = bestTimeLabel(hourEfficiency)

  const followerGrowth = metrics
    .slice()
    .reverse()
    .map((m, i) => ({ day: i + 1, followers: m.followers || 0 }))

  // Ganho de seguidores do banco (mais preciso que min/max da série)
  const followerGain     = (summary?.current_followers || 0) - (summary?.start_followers || 0)
  const currentFollowers = summary?.current_followers || metrics[0]?.followers || 0
  const startFollowers   = summary?.start_followers   || metrics[metrics.length - 1]?.followers || 1
  const growthPct = startFollowers > 0
    ? (((currentFollowers - startFollowers) / startFollowers) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Audiência & Demographics</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Perfil demográfico, localização e padrões de atividade.
          </p>
        </div>
        <AccountSelector value={currentId} onChange={setAccountId} />
      </div>

      <PeriodFilter />

      {/* Crescimento + Gênero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-on-surface">Crescimento de Seguidores</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {metrics.length} dias · {currentFollowers >= 1000 ? `${(currentFollowers / 1000).toFixed(1)}K` : currentFollowers} seguidores atuais
              </p>
            </div>
            <div className="flex items-center gap-2">
              {followerGain !== 0 && (
                <span className={clsx(
                  'text-xs font-semibold px-2 py-0.5 rounded-full font-display',
                  followerGain >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                )}>
                  {followerGain >= 0 ? '+' : ''}{followerGain.toLocaleString('pt-BR')} seguidores
                </span>
              )}
              <span className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                growthPct >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
              )}>
                {growthPct > 0 ? '+' : ''}{growthPct}%
              </span>
            </div>
          </div>
          {followerGrowth.length > 0 ? (
            <FollowerGrowthChart data={followerGrowth} />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-on-surface-variant">
              Carregando dados...
            </div>
          )}
        </div>

        <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
          <h2 className="font-display font-semibold text-on-surface mb-4">Gênero</h2>
          {audienceGender.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={audienceGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {audienceGender.map((g) => <Cell key={g.name} fill={g.color} />)}
                  </Pie>
                  <Tooltip content={<GenderTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {audienceGender.map((g) => (
                  <div key={g.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
                    <span className="text-xs text-on-surface flex-1">{g.name}</span>
                    <span className="text-xs font-semibold font-display text-on-surface">{g.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-on-surface-variant">
              Dados indisponíveis
            </div>
          )}
        </div>
      </div>

      {/* Faixa Etária + Localização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
          <h2 className="font-display font-semibold text-on-surface mb-4">Faixa Etária</h2>
          {audienceAge.length > 0 ? (
            <div className="space-y-3">
              {audienceAge.map((a) => (
                <AgeBar key={a.range} range={a.range} value={a.value} maxValue={maxAge} />
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-on-surface-variant">
              Dados indisponíveis
            </div>
          )}
        </div>

        <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-primary" />
            <h2 className="font-display font-semibold text-on-surface">Top Localidades</h2>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-3">
              {topLocations.map((loc, i) => (
                <div key={loc.city} className="flex items-center gap-3">
                  <span className="font-display text-xs font-bold text-on-surface-variant w-4">{i + 1}</span>
                  <span className="text-sm text-on-surface flex-1">{loc.city}</span>
                  <span className="font-display text-sm font-bold text-primary">{loc.value}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-on-surface-variant">
              Dados indisponíveis
            </div>
          )}
        </div>
      </div>

      {/* Activity Patterns */}
      <div className="bg-surface-low rounded-xl p-5 border border-outline-variant/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <h2 className="font-display font-semibold text-on-surface">Padrões de Atividade</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Alcance médio dos seus posts por horário de publicação
            </p>
          </div>
          {bestTime && (
            <div className="flex items-center gap-2 bg-primary-container/15 border border-primary-container/30 rounded-xl px-4 py-2">
              <Zap size={14} className="text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-on-surface-variant leading-none">Melhor horário para postar</p>
                <p className="text-sm font-display font-bold text-primary mt-0.5">{bestTime}</p>
              </div>
            </div>
          )}
        </div>
        {activityByHour.length > 0 ? (
          <div className="flex items-end gap-1 sm:gap-2 mt-4 overflow-x-auto pb-1">
            {activityByHour.map((a) => (
              <ActivityBar key={a.hour} hour={a.hour} value={a.value} />
            ))}
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-xs text-on-surface-variant animate-pulse">
            Calculando padrões...
          </div>
        )}
      </div>
    </div>
  )
}
