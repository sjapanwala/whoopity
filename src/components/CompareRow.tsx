import type { Baseline, BaselineComparison } from '../lib/metrics/baseline'
import type { SeriesPoint } from '../lib/metrics/series'
import { Sparkline } from './charts/Sparkline'

interface CompareRowProps {
  label: string
  series: SeriesPoint[]
  recent: Baseline | null
  comparison: BaselineComparison | null
  /** Whether a higher value is the physiologically "good" direction (false for RHR, e.g.). */
  higherIsBetter: boolean
  /** Set for metrics with no clear "good" direction (e.g. strain) — the delta stays neutral. */
  neutral?: boolean
  unit?: string
  digits?: number
}

function formatDelta(delta: number, digits: number): string {
  const rounded = Number(delta.toFixed(digits))
  return `${rounded >= 0 ? '+' : ''}${rounded}`
}

export function CompareRow({ label, series, recent, comparison, higherIsBetter, neutral = false, unit = '', digits = 1 }: CompareRowProps) {
  const isGood =
    !neutral &&
    comparison &&
    ((comparison.direction === 'up' && higherIsBetter) || (comparison.direction === 'down' && !higherIsBetter))
  const isBad =
    !neutral &&
    comparison &&
    comparison.direction !== 'flat' &&
    ((comparison.direction === 'up' && !higherIsBetter) || (comparison.direction === 'down' && higherIsBetter))
  const color = isGood ? 'var(--status-good)' : isBad ? 'var(--status-critical)' : 'var(--chart-ink-muted)'

  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-line py-4 sm:grid-cols-[minmax(130px,1.1fr)_minmax(0,2.4fr)_minmax(96px,auto)] sm:gap-[clamp(14px,3vw,34px)]">
      <div>
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">{label}</div>
        <div className="mt-2 text-[27px] font-semibold tracking-tight text-ink">
          {recent ? `${recent.mean.toFixed(digits)}${unit}` : '–'}
        </div>
      </div>
      <div className="h-[58px]">
        {series.some((p) => p.value !== null) ? (
          <Sparkline series={series} color={color} width={560} height={58} label={label} unit={unit} digits={digits} />
        ) : (
          <div className="flex h-full items-center font-mono text-xs text-ink-muted">No data yet</div>
        )}
      </div>
      <div className="text-left sm:text-right">
        {comparison ? (
          <>
            <div className="font-mono text-sm font-medium" style={{ color }}>
              {comparison.direction === 'flat' ? '≈ flat' : formatDelta(comparison.delta, digits)}
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-ink-muted">
              {comparison.direction === 'flat' ? 'holding' : isGood ? 'improving' : isBad ? 'declining' : 'shifting'} vs. prior 30d
            </div>
          </>
        ) : (
          <div className="font-mono text-[11px] text-ink-muted">Not enough history yet</div>
        )}
      </div>
    </div>
  )
}
