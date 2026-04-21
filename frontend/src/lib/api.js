const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // Se o backend retornar 401, o token está expirado/inválido. Limpamos e recarregamos.
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Erro na requisição')
  }
  return res.json()
}

// ── Auth ──
export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
}

// ── Accounts ──
export const api = {
  // Contas
  getAccounts: () => request('/accounts'),
  getAccount: (id) => request(`/accounts/${id}`),
  createAccount: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),

  // Métricas
  getMetrics: (accountId, from, to) => {
    const params = new URLSearchParams({ account_id: accountId })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return request(`/metrics?${params}`)
  },
  getMetricsSummary: (accountId, days = 30) =>
    request(`/metrics/summary?account_id=${accountId}&days=${days}`),
  createMetric: (data) => request('/metrics', { method: 'POST', body: JSON.stringify(data) }),

  // Tags
  getTags: (accountId) =>
    request(`/tags${accountId ? `?account_id=${accountId}` : ''}`),
  getTagsSummary: (accountId) =>
    request(`/tags/summary?account_id=${accountId}`),
  createTag: (data) => request('/tags', { method: 'POST', body: JSON.stringify(data) }),
  deleteTag: (id) => request(`/tags/${id}`, { method: 'DELETE' }),

  // Notas de contexto
  getNotes: (accountId, from, to) => {
    const params = new URLSearchParams()
    if (accountId) params.set('account_id', accountId)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return request(`/notes?${params}`)
  },
  createNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // Health
  health: () => request('/health'),

  // Instagram
  getInstagramAuthUrl: () => request('/instagram/auth-url'),
  syncAccount: (accountId, days = 30) =>
    request(`/instagram/sync/${accountId}`, { method: 'POST', body: JSON.stringify({ days }) }),
  syncAllAccounts: (days = 30) =>
    request('/instagram/sync', { method: 'POST', body: JSON.stringify({ days }) }),
  refreshInstagramToken: (accountId) =>
    request(`/instagram/refresh-token/${accountId}`, { method: 'POST' }),
}
