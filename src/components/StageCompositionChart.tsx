import { format } from 'date-fns'
import type { Sleep } from '../types/whoop'
import { SLEEP_STAGE_COLORS } from '../lib/theme/chartColors'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const WIDTH = 720
const HEIGHT = 150

const STAGE_ORDER = [
  { key: 'awakeMinutes', label: 'Awake', color: SLEEP_STAGE_COLORS.awake } as const,
  { key: 'remMinutes', label: 'REM', color: SLEEP_STAGE_COLORS.rem } as const,
  { key: 'lightMinutes', label: 'Light', color: SLEEP_STAGE_COLORS.light } as const,
  { key: 'deepMinutes', label: 'Deep', color: SLEEP_STAGE_COLORS.deep } as const,
]

export function StageCompositionChart({ sleeps }: { sleeps: Sleep[] }) {
  const { state, show, hide } = useChartTooltip()
  const nights = sleeps
    .filter((s) => s.type === 'sleep')
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const total = STAGE_ORDER.reduce((sum, stage) => sum + (s.stages[stage.key] ?? 0), 0)
      return { date: s.date, total, stages: s.stages }
    })
    .filter((n) => n.total > 0)

  if (nights.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Stage composition</h2>
        <p className="py-10 text-center font-mono text-xs text-ink-muted">No data in this range</p>
      </div>
    )
  }

  const bw = WIDTH / nights.length

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Stage composition</h2>
        <div className="flex flex-wrap gap-4 font-mono text-[11.5px] text-ink-muted">
          {STAGE_ORDER.map((stage) => (
            <span key={stage.label} className="flex items-center gap-1.5">
              <svg viewBox="0 0 10 10" className="block h-[9px] w-[9px]">
                <rect width="10" height="10" rx="2" fill={stage.color} />
              </svg>
              {stage.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" style={{ width: '100%', height: HEIGHT }} className="mt-4 block">
        {nights.map((night, i) => {
          let y = 0
          return STAGE_ORDER.map((stage) => {
            const minutes = night.stages[stage.key] ?? 0
            const h = (minutes / night.total) * HEIGHT
            const rect = (
              <rect
                key={`${night.date}-${stage.key}`}
                x={i * bw + bw * 0.14}
                y={y}
                width={bw * 0.72}
                height={h}
                fill={stage.color}
                onMouseMove={(e) =>
                  show(e.clientX, e.clientY, [
                    format(new Date(`${night.date}T00:00:00`), 'MMM d, yyyy'),
                    `${stage.label}: ${Math.round((minutes / night.total) * 100)}%`,
                  ])
                }
                onMouseLeave={hide}
              />
            )
            y += h
            return rect
          })
        })}
      </svg>
      <div className="mt-2.5 font-mono text-[11px] text-ink-muted">
        Each night normalised to 100%, so the mix is comparable across short and long nights.
      </div>
      <ChartTooltip state={state} />
    </div>
  )
}
