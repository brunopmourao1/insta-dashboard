import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p style={{ color: payload[0].payload.color }} className="font-semibold">{payload[0].name}</p>
      <p className="text-on-surface">{payload[0].value}%</p>
    </div>
  )
}

export default function TagsPieChart({ data }) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            nameKey="tag"
          >
            {data.map((entry) => (
              <Cell key={entry.tag} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {data.map((entry) => (
          <div key={entry.tag} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-xs text-on-surface flex-1">{entry.tag}</span>
            <span className="text-xs font-semibold text-on-surface font-display">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
