import { format } from 'date-fns'
import type { MouseEvent } from 'react'
import { rollingAverage, sortByDate, type SeriesPoint } from '../../lib/metrics/series'
import { domain, linePath, nearestIndex } from '../../lib/charts/svgPath'
import { ChartTooltip } from './ChartTooltip'
import { useChartTooltip } from './useChartTooltip'

interface SparklineProps {
  series: SeriesPoint[]
  color: string
  width: number
  height: number
  label: string
  unit?: string
  digits?: number
  smoothingDays?: number
}

/** Small raw+smoothed line chart used in Overview's compare rows. For the bigger, corner-labeled Trends panels, see TrendPanel.tsx. */
export function Sparkline({ series, color, width, height, label, unit = '', digits = 1, smoothingDays = 7 }: SparklineProps) {
  const { state, show, hide } = useChartTooltip()
  const sorted = sortByDate(series)
  const raw = sorted.map((p) => p.value)
  const nonNull = raw.filter((v): v is number => v !== null)

  if (nonNull.length === 0) {
    return <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} aria-hidden />
  }

  const [lo, hi] = domain(nonNull)
  const avg = rollingAverage(sorted, smoothingDays).map((p) => p.value)
  const rawPath = linePath(raw, lo, hi, width, height)
  const avgPath = linePath(avg, lo, hi, width, height)

  let lastIdx = avg.length - 1
  while (lastIdx >= 0 && avg[lastIdx] === null) lastIdx -= 1
  const endY = lastIdx >= 0 ? height - ((avg[lastIdx]! - lo) / ((hi - lo) || 1)) * height : height

  function onMove(e: MouseEvent<SVGSVGElement>) {
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
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
        className="cursor-crosshair"
        onMouseMove={onMove}
        onMouseLeave={hide}
      >
        <path d={rawPath} fill="none" stroke="var(--chart-grid)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={avgPath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {lastIdx >= 0 && <circle cx={width - 2} cy={endY} r={2.6} fill={color} />}
      </svg>
      <ChartTooltip state={state} />
    </>
  )
}
