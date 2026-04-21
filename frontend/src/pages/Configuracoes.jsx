import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  RefreshCw, Trash2, Plus, Download, FileJson, FileText,
  AlertTriangle, CheckCircle, Settings, Wifi, RefreshCcw,
  Link2,
} from 'lucide-react'
import clsx from 'clsx'
import { useAccounts, useExportData } from '../hooks/useApi'
import { api } from '../lib/api'

// ── Helpers ────────────────────────────────────────────────────────────────

function getTokenStatus(account) {
  if (!account.token_expiry) return 'no-token'
  const daysLeft = (new Date(account.token_expiry) - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysLeft < 0) return 'expired'
  if (daysLeft < 7) return 'expiring'
  return 'active'
}

const TOKEN_STATUS = {
  active:    { label: 'Ativo',      color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle },
  expiring:  { label: 'Expirando',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: AlertTriangle },
  expired:   { label: 'Expirado',   color: 'text-red-400',     bg: 'bg-red-400/10',     icon: AlertTriangle },
  'no-token':{ label: 'Sem token',  color: 'text-on-surface-variant', bg: 'bg-surface-highest', icon: AlertTriangle },
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface-low rounded-xl border border-outline-variant/10">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant/10">
        <Icon size={15} className="text-primary" />
        <h2 className="font-display font-semibold text-on-surface">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors',
        checked ? 'bg-primary-container' : 'bg-surface-highest',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
          checked ? 'translate-x-5 bg-on-primary' : 'translate-x-0.5 bg-on-surface-variant',
        )}
      />
    </button>
  )
}

function AccountCard({ account, onRemove, onSync, onRenew }) {
  const statusKey = getTokenStatus(account)
  const status = TOKEN_STATUS[statusKey]
  const StatusIcon = status.icon
  const [syncing, setSyncing] = useState(false)
  const [renewing, setRenewing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      await onSync(account.id)
    } finally {
      setSyncing(false)
    }
  }

  async function handleRenew() {
    setRenewing(true)
    try {
      await onRenew(account.id)
    } finally {
      setRenewing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 py-4 border-b border-outline-variant/10 last:border-0">
      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0 overflow-hidden">
        {account.profile_pic
          ? <img src={account.profile_pic} alt="" className="w-full h-full object-cover" />
          : <span className="text-on-primary text-sm font-bold">{(account.ig_username || '?')[0].toUpperCase()}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">@{account.ig_username}</p>
        <p className="text-xs text-on-surface-variant">{account.display_name}</p>
      </div>

      <div className={clsx('flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0', status.color, status.bg)}>
        <StatusIcon size={11} />
        {status.label}
      </div>

      {/* Botão Renovar token */}
      {(statusKey === 'expiring' || statusKey === 'expired') && (
        <button
          onClick={handleRenew}
          disabled={renewing}
          className="flex items-center gap-1.5 text-xs text-on-primary gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCcw size={11} className={renewing ? 'animate-spin' : ''} />
          Renovar
        </button>
      )}

      {/* Botão Sincronizar métricas */}
      {statusKey === 'active' && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          title="Sincronizar métricas"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      )}

      <button
        onClick={() => onRemove(account.id)}
        className="p-2 text-on-surface-variant hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
        title="Remover conta"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ExportSection({ accountId }) {
  const { exportCSV, exportJSON, isLoading } = useExportData(accountId)
  const [csvEnabled, setCsvEnabled] = useState(true)
  const [jsonEnabled, setJsonEnabled] = useState(true)

  return (
    <SectionCard title="Exportação de Dados" icon={Download}>
      <p className="text-xs text-on-surface-variant mb-4">
        Exporte os dados do período selecionado nos formatos abaixo.
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-surface-highest rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <FileText size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Formato CSV</p>
              <p className="text-xs text-on-surface-variant">Ideal para planilhas e análise básica</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={isLoading || !csvEnabled || !accountId}
              className="text-xs text-on-primary gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Exportar
            </button>
            <Toggle checked={csvEnabled} onChange={setCsvEnabled} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-highest rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FileJson size={15} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Formato JSON</p>
              <p className="text-xs text-on-surface-variant">Para integração estruturada e APIs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJSON}
              disabled={isLoading || !jsonEnabled || !accountId}
              className="text-xs text-on-primary gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Exportar
            </button>
            <Toggle checked={jsonEnabled} onChange={setJsonEnabled} />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { data: accounts = [], isLoading, refetch } = useAccounts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [toast, setToast] = useState(null)
  const [connectingAll, setConnectingAll] = useState(false)
  const primaryId = accounts[0]?.id

  // Lê parâmetros de retorno do OAuth
  useEffect(() => {
    const connected = searchParams.get('ig_connected')
    const igError = searchParams.get('ig_error')
    const username = searchParams.get('username')

    if (connected) {
      const msg = connected === 'new'
        ? `@${username} conectado com sucesso!`
        : `Token de @${username} atualizado.`
      showToast(msg, 'success')
      setSearchParams({})
      refetch()
    } else if (igError) {
      showToast(`Erro ao conectar: ${decodeURIComponent(igError)}`, 'error')
      setSearchParams({})
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleConnect() {
    try {
      const { url } = await api.getInstagramAuthUrl()
      window.location.href = url
    } catch (err) {
      showToast('Erro ao obter URL de autenticação', 'error')
    }
  }

  async function handleSync(accountId) {
    try {
      const result = await api.syncAccount(accountId)
      showToast(`${result.daysStored} dias sincronizados para @${result.username}`)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleSyncAll() {
    setConnectingAll(true)
    try {
      const result = await api.syncAllAccounts()
      const ok = result.results.filter(r => r.success).length
      showToast(`${ok}/${result.synced} contas sincronizadas`)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setConnectingAll(false)
    }
  }

  async function handleRenew(accountId) {
    try {
      await api.refreshInstagramToken(accountId)
      showToast('Token renovado com sucesso')
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleRemove(id) {
    if (!confirm('Tem certeza que deseja remover esta conta?')) return
    await api.deleteAccount(id)
    refetch()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Configurações do Sistema</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Gerencie contas, sincronização de dados e preferências de exportação.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={clsx(
          'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border',
          toast.type === 'success'
            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
            : 'bg-red-400/10 text-red-400 border-red-400/20',
        )}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {toast.message}
        </div>
      )}

      {/* Contas Conectadas */}
      <SectionCard title="Contas do Instagram" icon={Wifi}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-on-surface-variant">
            Perfis autorizados via Instagram Graph API.
          </p>
          <button
            onClick={handleSyncAll}
            disabled={connectingAll || accounts.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-on-primary gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw size={11} className={connectingAll ? 'animate-spin' : ''} />
            Sincronizar todas
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-surface-highest rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onRemove={handleRemove}
                onSync={handleSync}
                onRenew={handleRenew}
              />
            ))}
            {accounts.length === 0 && (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                Nenhuma conta conectada ainda.
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleConnect}
          className="mt-3 flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity font-medium"
        >
          <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
            <Plus size={12} />
          </div>
          Conectar conta do Instagram
        </button>
      </SectionCard>

      {/* API Info */}
      <SectionCard title="Configuração de API" icon={Settings}>
        <p className="text-xs text-on-surface-variant mb-4">
          Credenciais do aplicativo Meta configuradas no servidor.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-surface-highest rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">App ID</p>
                <p className="text-xs text-on-surface-variant font-mono">
                  {import.meta.env.VITE_META_APP_ID || '—'}
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle size={11} /> Configurado
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-highest rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">App Secret</p>
                <p className="text-xs text-on-surface-variant font-mono">••••••••••••••••</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle size={11} /> Configurado
            </span>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mt-3">
          Para alterar as credenciais, edite o arquivo <code className="font-mono bg-surface-highest px-1 rounded">backend/.env</code>.
        </p>
      </SectionCard>

      {/* Exportação */}
      <ExportSection accountId={primaryId} />
    </div>
  )
}
