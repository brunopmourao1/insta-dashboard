import { createContext, useContext, useState } from 'react'

const FilterContext = createContext(null)

function toISO(date) {
  return date.toISOString().split('T')[0]
}

function computeRange(fromStr, toStr) {
  const from = new Date(fromStr)
  const to   = new Date(toStr)
  const days = Math.round((to - from) / 86_400_000) + 1

  const prevTo   = new Date(from)
  prevTo.setDate(prevTo.getDate() - 1)
  const prevFrom = new Date(prevTo)
  prevFrom.setDate(prevFrom.getDate() - days + 1)

  return { from: fromStr, to: toStr, prevFrom: toISO(prevFrom), prevTo: toISO(prevTo), days }
}

export function FilterProvider({ children }) {
  const [period, setPeriod]       = useState('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]   = useState('')
  const [compare, setCompare]     = useState(false)

  function getDateRange() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const toStr = toISO(today)

    if (period === 'custom') {
      if (customFrom && customTo) return computeRange(customFrom, customTo)
      // fallback enquanto datas não foram selecionadas
      const f = new Date(today)
      f.setDate(f.getDate() - 30)
      return computeRange(toISO(f), toStr)
    }

    const offsets = { '24h': 1, '7d': 7, '15d': 15, '30d': 30 }
    if (period in offsets) {
      const f = new Date(today)
      f.setDate(f.getDate() - offsets[period])
      return computeRange(toISO(f), toStr)
    }

    if (period === 'month') {
      const f = new Date(today.getFullYear(), today.getMonth(), 1)
      return computeRange(toISO(f), toStr)
    }

    const f = new Date(today)
    f.setDate(f.getDate() - 30)
    return computeRange(toISO(f), toStr)
  }

  return (
    <FilterContext.Provider value={{
      period, setPeriod,
      customFrom, setCustomFrom,
      customTo, setCustomTo,
      compare, setCompare,
      getDateRange,
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  return useContext(FilterContext)
}
