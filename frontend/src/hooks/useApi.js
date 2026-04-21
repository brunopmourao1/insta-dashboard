import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

// ── Accounts ──
export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: api.getAccounts, staleTime: 60_000 })
}

// ── Metrics ──
export function useMetrics(accountId, from, to) {
  return useQuery({
    queryKey: ['metrics', accountId, from, to],
    queryFn: () => api.getMetrics(accountId, from, to),
    enabled: !!accountId,
    staleTime: 30_000,
  })
}

export function useMetricsSummary(accountId, days = 30) {
  return useQuery({
    queryKey: ['metrics-summary', accountId, days],
    queryFn: () => api.getMetricsSummary(accountId, days),
    enabled: !!accountId,
    staleTime: 30_000,
  })
}

// ── Tags ──
export function useTagsSummary(accountId) {
  return useQuery({
    queryKey: ['tags-summary', accountId],
    queryFn: () => api.getTagsSummary(accountId),
    enabled: !!accountId,
    staleTime: 60_000,
  })
}

// ── Notes ──
export function useNotes(accountId, from, to) {
  return useQuery({
    queryKey: ['notes', accountId, from, to],
    queryFn: () => api.getNotes(accountId, from, to),
    enabled: !!accountId,
    staleTime: 30_000,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}

// ── Export helpers ──
export function useExportData(accountId) {
  const metrics = useMetrics(accountId)
  const tags = useQuery({
    queryKey: ['tags', accountId],
    queryFn: () => api.getTags(accountId),
    enabled: !!accountId,
  })
  const notes = useNotes(accountId)

  const exportJSON = () => {
    const data = { metrics: metrics.data, tags: tags.data, notes: notes.data }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `gestao-jaque-${accountId}.json`)
  }

  const exportCSV = () => {
    if (!metrics.data?.length) return
    const headers = Object.keys(metrics.data[0])
    const rows = metrics.data.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, `gestao-jaque-metricas-${accountId}.csv`)
  }

  return { exportJSON, exportCSV, isLoading: metrics.isLoading || tags.isLoading }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
