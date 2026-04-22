import { Eye, Hash, Heart, Users, ChevronRight, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import PeriodFilter from '../components/ui/PeriodFilter'
import KpiCard from '../components/ui/KpiCard'
import { useAccounts, useMetricsSummary } from '../hooks/useApi'
import { useFilter } from '../contexts/FilterContext'
import clsx from 'clsx'

const alertConfig = {
  success: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: TrendingUp },
  warning: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
  info:    { color: 'text-secondary',  bg: 'bg-secondary/10',  icon: FileText },
}

function pctChange(current, prev) {
  if (!prev || prev === 0) return null
  return Number(((current - prev) / prev * 100).toFixed(1))
}

function buildAlerts(summary) {
  if (!summary) return []
  const alerts = []

  const reachChange = pctChange(summary.total_reach, summary.prev_reach)
  if (reachChange !== null && reachChange >= 20) {
    alerts.push({
      id: 'reach-up', type: 'success',
      title: 'Pico de Alcance',
      description: `Alcance subiu ${reachChange}% em relação ao período anterior.`,
      action: 'Ver análise detalhada',
    })
  } else if (reachChange !== null && reachChange <= -15) {
    alerts.push({
      id: 'reach-down', type: 'warning',
      title: 'Queda de Alcance',
      description: `Alcance caiu ${Math.abs(reachChange)}% em relação ao período anterior.`,
      action: 'Analisar últimos posts',
    })
  }

  const engChange = pctChange(Number(summary.avg_engagement), Number(summary.prev_engagement))
  if (engChange !== null && engChange <= -10) {
    alerts.push({
      id: 'eng-down', type: 'warning',
      title: 'Queda de Engajamento',
      description: `Taxa de engajamento caiu ${Math.abs(engChange)}% vs período anterior.`,
      action: 'Analisar conteúdo recente',
    })
  }

  const followerGain = (summary.current_followers || 0) - (summary.start_followers || 0)
  if (followerGain > 0) {
    alerts.push({
      id: 'followers', type: 'info',
      title: 'Crescimento de Seguidores',
      description: `+${followerGain.toLocaleString('pt-BR')} seguidores no período selecionado.`,
      action: 'Ver Audiência',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable', type: 'info',
      title: 'Performance Estável',
      description: 'Métricas dentro da faixa normal. Sincronize para obter os dados mais recentes.',
      action: 'Ir para Configurações',
    })
  }

  return alerts
}

function AlertCard({ alert }) {
  const { color, bg, icon: Icon } = alertConfig[alert.type]
  return (
    <div className="bg-surface-highest rounded-xl p-4 border border-outline-variant/10">
      <div className="flex items-start gap-3">
        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', bg)}>
          <Icon size={14} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface">{alert.title}</p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{alert.description}</p>
          <button className="text-xs text-primary mt-2 hover:opacity-80 transition-opacity">
            {alert.action} →
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountRow({ account, summary }) {
  const reach     = summary?.total_reach || 0
  const followers = summary?.current_followers || 0
  const engagement = summary?.avg_engagement || 0
  const gain      = (summary?.current_followers || 0) - (summary?.start_followers || 0)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-0 hover:bg-surface-highest/50 -mx-2 px-2 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
        <span className="text-on-primary text-xs font-bold">
          {(account.ig_username || '?')[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">@{account.ig_username}</p>
        <p className="text-xs text-on-surface-variant">{account.display_name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-on-surface-variant">Alcance</p>
        <p className="text-sm font-semibold text-primary font-display">
          {reach >= 1000 ? `${(reach / 1000).toFixed(0)}K` : reach}
        </p>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-on-surface-variant">Seguidores</p>
        <p className="text-sm font-semibold text-on-surface font-display">
          {followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers}
        </p>
      </div>
      <div className="text-right shrink-0 hidden md:block">
        <p className="text-xs text-on-surface-variant">Ganho</p>
        <p className={clsx('text-sm font-semibold font-display', gain >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          {gain >= 0 ? '+' : ''}{gain}
        </p>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-on-surface-variant">Eng.</p>
        <p className="text-sm font-semibold text-on-surface font-display">{Number(engagement).toFixed(1)}%</p>
      </div>
      <ChevronRight size={14} className="text-on-surface-variant shrink-0" />
    </div>
  )
}

function AccountRowWithData({ account, range }) {
  const { data: summary } = useMetricsSummary(account.id, range)
  return <AccountRow account={account} summary={summary} />
}

export default function VisaoAguia() {
  const { data: accounts = [], isLoading } = useAccounts()
  const { getDateRange } = useFilter()
  const range = getDateRange()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-on-surface">Visão de Águia</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Performance agregada de todas as contas gerenciadas.
        </p>
      </div>

      <PeriodFilter />

      <AggregateKpis accounts={accounts} range={range} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Comparativo de Perfis</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-surface-highest rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {accounts.map((account) => (
                <AccountRowWithData key={account.id} account={account} range={range} />
              ))}
            </div>
          )}
        </div>

        <DynamicAlerts accounts={accounts} range={range} />
      </div>
    </div>
  )
}

function AggregateKpis({ accounts, range }) {
  const primaryId = accounts[0]?.id
  const { data: summary, isLoading } = useMetricsSummary(primaryId, range)

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-surface-low rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const reachChange      = pctChange(summary.total_reach, summary.prev_reach)
  const impressionsChange = pctChange(summary.total_impressions, summary.prev_impressions)
  const engagementChange = pctChange(Number(summary.avg_engagement), Number(summary.prev_engagement))

  const hasFollowerHistory = (summary.start_followers || 0) > 0
  const followerGain   = hasFollowerHistory
    ? (summary.current_followers || 0) - (summary.start_followers || 0)
    : null
  const followerChange = hasFollowerHistory
    ? pctChange(summary.current_followers, summary.prev_followers)
    : null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      <KpiCard label="Total Reach"       value={summary.total_reach}                            change={reachChange}       icon={Eye} />
      <KpiCard label="Impressões"        value={summary.total_impressions}                      change={impressionsChange}  icon={Hash} />
      <KpiCard label="Engagement Rate"   value={Number(summary.avg_engagement).toFixed(1)}      change={engagementChange}  suffix="%" icon={Heart} />
      <KpiCard
        label={hasFollowerHistory ? 'Seguidores Ganhos' : 'Seguidores Hoje'}
        value={followerGain !== null ? (followerGain >= 0 ? `+${followerGain}` : followerGain) : summary.current_followers}
        change={followerChange}
        icon={Users}
      />
    </div>
  )
}

function DynamicAlerts({ accounts, range }) {
  const primaryId = accounts[0]?.id
  const { data: summary, isLoading } = useMetricsSummary(primaryId, range)
  const alerts = buildAlerts(summary)

  return (
    <div className="space-y-3">
      <h2 className="font-display font-semibold text-on-surface">Alertas</h2>
      {isLoading && primaryId ? (
        <div className="h-20 bg-surface-highest rounded-xl animate-pulse" />
      ) : alerts.length > 0 ? (
        alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
      ) : (
        <p className="text-xs text-on-surface-variant py-4 text-center">
          Conecte uma conta para ver alertas.
        </p>
      )}
    </div>
  )
}
