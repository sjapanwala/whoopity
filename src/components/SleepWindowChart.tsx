import { format } from 'date-fns'
import type { Sleep } from '../types/whoop'
import { bedtimeMinutesFromNoon } from '../lib/metrics/sleepSchedule'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const WIDTH = 720
const HEIGHT = 210
// Fixed domain (minutes from the previous noon — see bedtimeMinutesFromNoon) covering a typical night: ~8pm to ~1pm.
const DOMAIN_START = 480 // 8 PM
const DOMAIN_END = 1500 // 1 PM
const GRID = [
  [540, '9 PM'],
  [780, '1 AM'],
  [1020, '5 AM'],
  [1260, '9 AM'],
] as const

function ty(minutesFromNoon: number): number {
  return ((minutesFromNoon - DOMAIN_START) / (DOMAIN_END - DOMAIN_START)) * HEIGHT
}

/** Formats "minutes after the previous noon" back into a wall-clock time label. */
function formatClockTime(minutesFromNoon: number): string {
  const minuteOfDay = (720 + minutesFromNoon) % 1440
  const hour24 = Math.floor(minuteOfDay / 60)
  const minute = Math.round(minuteOfDay % 60)
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

export function SleepWindowChart({ sleeps }: { sleeps: Sleep[] }) {
  const { state, show, hide } = useChartTooltip()
  const nights = sleeps.filter((s) => s.type === 'sleep').sort((a, b) => a.date.localeCompare(b.date))

  if (nights.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Sleep window</h2>
        <p className="py-10 text-center font-mono text-xs text-ink-muted">No data in this range</p>
      </div>
    )
  }

  const bw = WIDTH / nights.length
  const bars = nights.map((n) => {
    const bed = bedtimeMinutesFromNoon(n.start)
    const wake = bedtimeMinutesFromNoon(n.end)
    return { date: n.date, bed, wake, x: bw * 0.18, w: bw * 0.64, y: ty(bed), h: Math.max(3, ty(wake) - ty(bed)) }
  })

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Sleep window</h2>
        <div className="font-mono text-xs text-ink-muted">bedtime to wake, last {nights.length} nights</div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" style={{ width: '100%', height: HEIGHT }} className="mt-4 block">
        {GRID.map(([m]) => (
          <line key={m} x1={0} y1={ty(m)} x2={WIDTH} y2={ty(m)} stroke="var(--chart-grid)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {bars.map((bar, i) => (
          <rect
            key={bar.date}
            x={i * bw + bar.x}
            y={bar.y}
            width={bar.w}
            height={bar.h}
            rx={2}
            fill="var(--cat-7)"
            opacity={0.8}
            onMouseMove={(e) =>
              show(e.clientX, e.clientY, [
                format(new Date(`${bar.date}T00:00:00`), 'MMM d, yyyy'),
                `${formatClockTime(bar.bed)} → ${formatClockTime(bar.wake)}`,
              ])
            }
            onMouseLeave={hide}
          />
        ))}
      </svg>
      <div className="mt-2 flex gap-6 font-mono text-[11px] text-ink-muted">
        {GRID.map(([, label]) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <ChartTooltip state={state} />
    </div>
  )
}
