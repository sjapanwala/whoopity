import { format } from 'date-fns'
import { buildHeatmapWeeks } from '../lib/metrics/heatmapGrid'
import { recoveryZoneFor } from '../lib/metrics/recoveryZone'
import type { SeriesPoint } from '../lib/metrics/series'
import { STATUS_COLORS } from '../lib/theme/chartColors'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const CELL = 15
const STEP = 19
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function cellColor(value: number | null): string {
  if (value === null) return 'var(--chart-grid)'
  const zone = recoveryZoneFor(value)
  if (!zone) return 'var(--chart-grid)'
  const opacity = Math.max(0.35, Math.min(1, value / 100))
  return `color-mix(in srgb, ${STATUS_COLORS[zone]} ${opacity * 100}%, var(--chart-surface))`
}

export function RecoveryHeatmap({ series, start, end }: { series: SeriesPoint[]; start: string; end: string }) {
  const { state, show, hide } = useChartTooltip()
  const weeks = buildHeatmapWeeks(series, start, end)
  const width = weeks.length * STEP - (STEP - CELL)
  const height = 7 * STEP - (STEP - CELL)

  const monthOf = (week: typeof weeks[number]) => format(new Date(`${week[0]!.date}T00:00:00`), 'MMM')
  const monthLabels = weeks.map((week, i) => (i === 0 || monthOf(week) !== monthOf(weeks[i - 1]!) ? monthOf(week) : ''))

  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
      <div />
      <div className="grid auto-cols-fr grid-flow-col font-mono text-[10px] text-ink-muted">
        {monthLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="grid grid-rows-7 font-mono text-[10px] text-ink-muted">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="flex items-center">
            {label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} className="block">
        {weeks.map((week, weekIndex) =>
          week.map((cell, dayIndex) => (
            <rect
              key={cell.date}
              x={weekIndex * STEP}
              y={dayIndex * STEP}
              width={CELL}
              height={CELL}
              rx={2.5}
              fill={cellColor(cell.value)}
              onMouseMove={(e) =>
                show(e.clientX, e.clientY, [
                  format(new Date(`${cell.date}T00:00:00`), 'MMM d, yyyy'),
                  cell.value !== null ? `Recovery ${Math.round(cell.value)}` : 'No data',
                ])
              }
              onMouseLeave={hide}
            />
          )),
        )}
      </svg>
      <ChartTooltip state={state} />
    </div>
  )
}
