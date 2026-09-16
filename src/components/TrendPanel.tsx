import { format } from 'date-fns'
import type { MouseEvent } from 'react'
import { rollingAverage, sortByDate, type SeriesPoint } from '../lib/metrics/series'
import { domain, linePath, nearestIndex } from '../lib/charts/svgPath'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const WIDTH = 720
const HEIGHT = 104

interface TrendPanelProps {
  label: string
  series: SeriesPoint[]
  color: string
  unit?: string
  digits?: number
  smoothingDays?: number
}

export function TrendPanel({ label, series, color, unit = '', digits = 0, smoothingDays = 7 }: TrendPanelProps) {
  const { state, show, hide } = useChartTooltip()
  const sorted = sortByDate(series)
  const raw = sorted.map((p) => p.value)
  const nonNull = raw.filter((v): v is number => v !== null)

  const hasData = nonNull.length > 0
  const [lo, hi] = hasData ? domain(nonNull) : [0, 1]
  const rawMin = hasData ? Math.min(...nonNull) : null
  const rawMax = hasData ? Math.max(...nonNull) : null
  const mean = hasData ? nonNull.reduce((s, v) => s + v, 0) / nonNull.length : null
  const avg = rollingAverage(sorted, smoothingDays).map((p) => p.value)

  function onMove(e: MouseEvent<SVGSVGElement>) {
    if (!hasData) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    const idx = nearestIndex(frac, sorted.length)
    const v = raw[idx]
    if (v === null || v === undefined) {
      hide()
      return
    }
    show(e.clientX, e.clientY, [format(new Date(`${sorted[idx]!.date}T00:00:00`), 'MMM d, yyyy'), `${label}: ${v.toFixed(digits)}${unit}`])
  }

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-line py-4.5 sm:grid-cols-[minmax(120px,1fr)_minmax(0,3.6fr)] sm:gap-[clamp(14px,3vw,30px)]">
      <div>
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">{label}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {mean !== null ? `${mean.toFixed(digits)}${unit}` : '–'}
        </div>
        <div className="mt-1.5 font-mono text-[11.5px] text-ink-muted">
          {rawMin !== null && rawMax !== null ? `range ${rawMin.toFixed(digits)}–${rawMax.toFixed(digits)}` : 'No data in this range'}
        </div>
      </div>
      <div className="relative">
        {hasData ? (
          <>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: HEIGHT }}
              className="block cursor-crosshair"
              onMouseMove={onMove}
              onMouseLeave={hide}
            >
              <line x1={0} y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="var(--chart-grid)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <path d={linePath(raw, lo, hi, WIDTH, HEIGHT)} fill="none" stroke="var(--chart-grid)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <path
                d={linePath(avg, lo, hi, WIDTH, HEIGHT)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="absolute -top-0.5 right-0 font-mono text-[10.5px] text-ink-muted">{hi.toFixed(digits)}</div>
            <div className="absolute -bottom-0.5 right-0 font-mono text-[10.5px] text-ink-muted">{lo.toFixed(digits)}</div>
          </>
        ) : (
          <p className="py-10 text-center font-mono text-xs text-ink-muted">No data in this range</p>
        )}
      </div>
      <ChartTooltip state={state} />
    </div>
  )
}
