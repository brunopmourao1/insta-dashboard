import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-high border border-outline-variant/20 rounded-xl px-3 py-2 text-xs shadow-ambient">
      <p className="text-on-surface-variant mb-1">Dia {label}</p>
      <p className="text-primary font-semibold">
        {payload[0]?.value?.toLocaleString('pt-BR')} seguidores
      </p>
    </div>
  )
}

export default function FollowerGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFollowers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffafd2" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffafd2" stopOpacity={0} />
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
          dataKey="followers"
          stroke="#ffafd2"
          strokeWidth={2}
          fill="url(#gradFollowers)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
