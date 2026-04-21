import { useState } from 'react'
import { PERIOD_FILTERS } from '../../lib/constants'
import clsx from 'clsx'

export default function PeriodFilter({ defaultValue = '7d', onCompare }) {
  const [active, setActive] = useState(defaultValue)
  const [compare, setCompare] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Filtros com scroll horizontal no mobile */}
      <div className="overflow-x-auto pb-1 -mb-1 scrollbar-none">
        <div className="flex items-center gap-1 bg-surface-low rounded-xl p-1 w-max">
          {PERIOD_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                active === value
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
          onClick={() => { setCompare(!compare); onCompare?.(!compare) }}
          className={clsx(
            'relative w-8 h-4 rounded-full transition-colors',
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
  )
}
