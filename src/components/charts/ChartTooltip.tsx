import type { TooltipState } from './useChartTooltip'

export function ChartTooltip({ state }: { state: TooltipState | null }) {
  if (!state) return null
  const [primary, ...rest] = state.lines
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-56 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] leading-snug text-ink shadow-lg"
      style={{ left: state.x + 14, top: state.y + 14 }}
    >
      <div>{primary}</div>
      {rest.map((line) => (
        <div key={line} className="text-ink-muted">
          {line}
        </div>
      ))}
    </div>
  )
}
