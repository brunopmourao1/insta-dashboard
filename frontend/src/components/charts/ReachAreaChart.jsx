import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p className="text-on-surface-variant mb-1">Dia {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value >= 1000 ? `${(p.value / 1000).toFixed(0)}K` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ReachAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradReach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c13584" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#c13584" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e3b5ff" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#e3b5ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#353436" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#a48a93', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#a48a93', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="impressions"
          name="Impressions"
          stroke="#e3b5ff"
          strokeWidth={1.5}
          fill="url(#gradImpressions)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="reach"
          name="Reach"
          stroke="#c13584"
          strokeWidth={2}
          fill="url(#gradReach)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
