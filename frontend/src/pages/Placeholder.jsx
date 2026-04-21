export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-3">
      <div className="w-12 h-12 rounded-2xl gradient-primary opacity-40" />
      <p className="font-display font-semibold text-on-surface">{title}</p>
      <p className="text-sm text-on-surface-variant">Em desenvolvimento</p>
    </div>
  )
}
