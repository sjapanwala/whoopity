import { format } from 'date-fns'
import type { WeeklyStrainVolume } from '../lib/metrics/workoutTotals'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const WIDTH = 720
const HEIGHT = 140

export function WeeklyLoadChart({ weeks }: { weeks: WeeklyStrainVolume[] }) {
  const { state, show, hide } = useChartTooltip()

  if (weeks.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Weekly load</h2>
        <p className="py-10 text-center font-mono text-xs text-ink-muted">No workouts in this range</p>
      </div>
    )
  }

  const maxStrain = Math.max(...weeks.map((w) => w.totalStrain))
  const avgStrain = weeks.reduce((s, w) => s + w.totalStrain, 0) / weeks.length
  const bw = WIDTH / weeks.length
  const avgY = HEIGHT - (avgStrain / maxStrain) * HEIGHT

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Weekly load</h2>
        <div className="font-mono text-xs text-ink-muted">dashed line = average</div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" style={{ width: '100%', height: HEIGHT }} className="mt-4 block">
        <line x1={0} y1={avgY} x2={WIDTH} y2={avgY} stroke="var(--chart-ink-muted)" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        {weeks.map((w, i) => {
          const h = maxStrain > 0 ? (w.totalStrain / maxStrain) * HEIGHT : 0
          return (
            <rect
              key={w.weekStart}
              x={i * bw + bw * 0.24}
              y={HEIGHT - h}
              width={bw * 0.52}
              height={h}
              rx={2}
              fill={w.totalStrain > avgStrain * 1.15 ? 'var(--status-warning)' : 'var(--cat-7)'}
              opacity={0.85}
              onMouseMove={(e) =>
                show(e.clientX, e.clientY, [
                  `Week of ${format(new Date(`${w.weekStart}T00:00:00`), 'MMM d')}`,
                  `${w.totalStrain.toFixed(1)} strain · ${w.workoutCount} ${w.workoutCount === 1 ? 'workout' : 'workouts'}`,
                ])
              }
              onMouseLeave={hide}
            />
          )
        })}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-muted">
        <span>{format(new Date(`${weeks[0]!.weekStart}T00:00:00`), 'MMM d')}</span>
        <span>{format(new Date(`${weeks[weeks.length - 1]!.weekStart}T00:00:00`), 'MMM d')}</span>
      </div>
      <ChartTooltip state={state} />
    </div>
  )
}
