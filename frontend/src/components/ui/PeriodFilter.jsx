import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { PERIOD_FILTERS } from '../../lib/constants'
import { useFilter } from '../../contexts/FilterContext'
import clsx from 'clsx'

export default function PeriodFilter() {
  const { period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, compare, setCompare } = useFilter()

  const [draftFrom, setDraftFrom] = useState(customFrom || '')
  const [draftTo, setDraftTo] = useState(customTo || '')

  // Reset drafts whenever user switches back to custom period
  useEffect(() => {
    if (period === 'custom') {
      setDraftFrom(customFrom || '')
      setDraftTo(customTo || '')
    }
  }, [period]) // eslint-disable-line react-hooks/exhaustive-deps

  const canApply = draftFrom && draftTo && (draftFrom !== customFrom || draftTo !== customTo)

  function handleApply() {
    if (!draftFrom || !draftTo) return
    setCustomFrom(draftFrom)
    setCustomTo(draftTo)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="overflow-x-auto pb-1 -mb-1 scrollbar-none">
          <div className="flex items-center gap-1 bg-surface-low rounded-xl p-1 w-max">
            {PERIOD_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  period === value
                    ? 'gradient-primary text-on-primary shadow-glow'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-highest',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <div
            onClick={() => setCompare(!compare)}
            className={clsx(
              'relative w-8 h-4 rounded-full transition-colors cursor-pointer',
              compare ? 'bg-primary-container' : 'bg-surface-highest',
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 w-3 h-3 rounded-full transition-transform',
                compare ? 'translate-x-4 bg-on-primary' : 'translate-x-0.5 bg-on-surface-variant',
              )}
            />
          </div>
          <span className="text-xs text-on-surface-variant">Comparar com período anterior</span>
        </label>
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-on-surface-variant">De</span>
          <input
            type="date"
            value={draftFrom}
            max={draftTo || undefined}
            onChange={(e) => setDraftFrom(e.target.value)}
            className="bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary-container transition-colors"
          />
          <span className="text-xs text-on-surface-variant">até</span>
          <input
            type="date"
            value={draftTo}
            min={draftFrom || undefined}
            onChange={(e) => setDraftTo(e.target.value)}
            className="bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary-container transition-colors"
          />
          {draftFrom && draftTo && (
            <span className="text-xs text-on-surface-variant">
              {Math.round((new Date(draftTo) - new Date(draftFrom)) / 86_400_000) + 1} dias
            </span>
          )}
          <button
            onClick={handleApply}
            disabled={!canApply}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              canApply
                ? 'gradient-primary text-on-primary hover:opacity-90'
                : 'bg-surface-highest text-on-surface-variant opacity-50 cursor-not-allowed',
            )}
          >
            <Check size={11} />
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
