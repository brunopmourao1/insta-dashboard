import { PERIOD_FILTERS } from '../../lib/constants'
import { useFilter } from '../../contexts/FilterContext'
import clsx from 'clsx'

export default function PeriodFilter() {
  const { period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, compare, setCompare } = useFilter()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filtros com scroll horizontal no mobile */}
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

        {/* Toggle comparação */}
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

      {/* Inputs de data para período customizado */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-on-surface-variant">De</span>
          <input
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary-container transition-colors"
          />
          <span className="text-xs text-on-surface-variant">até</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(e) => setCustomTo(e.target.value)}
            className="bg-surface-low border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary-container transition-colors"
          />
          {customFrom && customTo && (
            <span className="text-xs text-primary font-medium">
              {Math.round((new Date(customTo) - new Date(customFrom)) / 86_400_000) + 1} dias
            </span>
          )}
        </div>
      )}
    </div>
  )
}
