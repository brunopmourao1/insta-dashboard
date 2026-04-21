import clsx from 'clsx'

const levelConfig = {
  0: { bg: 'bg-surface-highest', label: 'Nenhum' },
  1: { bg: 'bg-primary-container/20', label: 'Baixo' },
  2: { bg: 'bg-primary-container/50', label: 'Médio' },
  3: { bg: 'bg-primary-container/80', label: 'Alto' },
  4: { bg: 'bg-primary-container', label: 'Pico' },
}

function getLevel(value, max) {
  if (value === 0) return 0
  const pct = value / max
  if (pct < 0.25) return 1
  if (pct < 0.5) return 2
  if (pct < 0.75) return 3
  return 4
}

export default function HeatmapGrid({ data }) {
  const { days, hours, values } = data
  const max = Math.max(...values.flat())

  return (
    <div className="space-y-3">
      {/* Legenda */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-on-surface-variant mr-1">Engajamento:</span>
        {Object.entries(levelConfig).slice(1).map(([lvl, { bg, label }]) => (
          <div key={lvl} className="flex items-center gap-1">
            <div className={clsx('w-3 h-3 rounded-sm', bg)} />
            <span className="text-[10px] text-on-surface-variant">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-on-surface-variant text-left font-normal w-24 pb-1" />
              {days.map((d) => (
                <th key={d} className="text-on-surface-variant font-normal text-center pb-1">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, hi) => (
              <tr key={hour}>
                <td className="text-on-surface-variant pr-2 whitespace-pre-line leading-tight py-0.5">
                  {hour}
                </td>
                {days.map((_, di) => {
                  const val = values[hi][di]
                  const level = getLevel(val, max)
                  const { bg } = levelConfig[level]
                  return (
                    <td key={di} title={`Engajamento: ${val}`}>
                      <div className={clsx('h-8 rounded-lg transition-all hover:opacity-80 cursor-default', bg)} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
