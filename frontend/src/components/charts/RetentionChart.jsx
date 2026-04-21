import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p className="text-on-surface-variant">Segundo {label}s</p>
      <p className="text-primary font-semibold">{payload[0]?.value}% retidos</p>
    </div>
  )
}

export default function RetentionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRetention" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c13584" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#c13584" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="second"
          tick={{ fill: '#a48a93', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}s`}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#a48a93', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={50} stroke="#564149" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="retention"
          stroke="#c13584"
          strokeWidth={2.5}
          fill="url(#gradRetention)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
