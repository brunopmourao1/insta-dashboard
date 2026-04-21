import { Eye, Hash, Heart, ChevronRight, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import PeriodFilter from '../components/ui/PeriodFilter'
import KpiCard from '../components/ui/KpiCard'
import { useAccounts, useMetricsSummary } from '../hooks/useApi'
import clsx from 'clsx'

const alertConfig = {
  success: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: TrendingUp },
  warning: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
  info: { color: 'text-secondary', bg: 'bg-secondary/10', icon: FileText },
}

// Alertas são estáticos até ter lógica de anomalias
const alerts = [
  { id: '1', type: 'success', title: 'Pico de Alcance', description: 'O post de ontem está performando +40% acima da média móvel de 30 dias.', action: 'Ver análise detalhada' },
  { id: '2', type: 'warning', title: 'Queda de Engajamento', description: 'Engajamento caiu 12 pontos percentuais nesta semana.', action: 'Analisar últimos posts' },
  { id: '3', type: 'info', title: 'Relatório Mensal', description: 'O relatório consolidado deste mês está disponível para download.', action: 'Baixar PDF' },
]

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
  const reach = summary?.total_reach || 0
  const followers = summary?.current_followers || 0
  const engagement = summary?.avg_engagement || 0

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
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-on-surface-variant">Eng.</p>
        <p className="text-sm font-semibold text-on-surface font-display">{Number(engagement).toFixed(1)}%</p>
      </div>
      <ChevronRight size={14} className="text-on-surface-variant shrink-0" />
    </div>
  )
}

function AccountRowWithData({ account }) {
  const { data: summary } = useMetricsSummary(account.id, 30)
  return <AccountRow account={account} summary={summary} />
}

export default function VisaoAguia() {
  const { data: accounts = [], isLoading } = useAccounts()

  // Agregar KPIs de todas as contas — será preenchido quando as contas carregarem
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-on-surface">Visão de Águia</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Performance agregada de todas as contas gerenciadas.
        </p>
      </div>

      <PeriodFilter />

      {/* KPIs */}
      <AggregateKpis accounts={accounts} />

      {/* Comparativo + Alertas */}
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
                <AccountRowWithData key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-display font-semibold text-on-surface">Alertas</h2>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AggregateKpis({ accounts }) {
  // Busca summary para a primeira conta como referência principal
  const primaryId = accounts[0]?.id
  const { data: summary, isLoading } = useMetricsSummary(primaryId, 30)

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-low rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <KpiCard label="Total Reach" value={summary.total_reach} change={12.6} icon={Eye} />
      <KpiCard label="Total Impressions" value={summary.total_impressions} change={0.1} icon={Hash} />
      <KpiCard label="Engagement Rate" value={Number(summary.avg_engagement).toFixed(1)} change={-2.3} suffix="%" icon={Heart} />
    </div>
  )
}
