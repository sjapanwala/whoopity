import type { MouseEvent } from 'react'
import { nearestPointIndex, scatterLayout } from '../lib/charts/svgPath'
import { ChartTooltip } from './charts/ChartTooltip'
import { useChartTooltip } from './charts/useChartTooltip'

const WIDTH = 240
const HEIGHT = 160

interface FindingProps {
  tag: string
  headline: string
  body: string
  stat: string
  pairs: [number, number][]
  color: string
  xLabel: string
  yLabel: string
}

export function Finding({ tag, headline, body, stat, pairs, color, xLabel, yLabel }: FindingProps) {
  const { state, show, hide } = useChartTooltip()

  if (pairs.length < 3) {
    return (
      <div className="grid grid-cols-1 items-center gap-5 border-b border-line py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)] lg:gap-[clamp(18px,4vw,44px)]">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">{tag}</div>
          <h3 className="mt-3 max-w-[34ch] text-[clamp(18px,2.2vw,23px)] font-semibold leading-[1.3] tracking-tight text-ink text-pretty">
            {headline}
          </h3>
          <p className="mt-2.5 max-w-[48ch] text-sm leading-[1.55] text-ink-muted text-pretty">{body}</p>
        </div>
        <p className="py-8 text-center font-mono text-xs text-ink-muted">Not enough paired data yet</p>
      </div>
    )
  }

  const { points, fit } = scatterLayout(pairs, WIDTH, HEIGHT)

  function onMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * WIDTH
    const my = ((e.clientY - rect.top) / rect.height) * HEIGHT
    const idx = nearestPointIndex(points, mx, my)
    if (idx === null) {
      hide()
      return
    }
    const p = points[idx]!
    show(e.clientX, e.clientY, [`${p.x.toFixed(1)} ${xLabel}`, `${p.y.toFixed(1)} ${yLabel}`])
  }

  return (
    <div className="grid grid-cols-1 items-center gap-5 border-b border-line py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)] lg:gap-[clamp(18px,4vw,44px)]">
      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color }}>
          {tag}
        </div>
        <h3 className="mt-3 max-w-[34ch] text-[clamp(18px,2.2vw,23px)] font-semibold leading-[1.3] tracking-tight text-ink text-pretty">
          {headline}
        </h3>
        <p className="mt-2.5 max-w-[48ch] text-sm leading-[1.55] text-ink-muted text-pretty">{body}</p>
        <div className="mt-3.5 font-mono text-[11.5px] text-ink-muted">{stat}</div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: 'auto' }} className="block cursor-crosshair" onMouseMove={onMove} onMouseLeave={hide}>
        <line x1={0} y1={HEIGHT - 1} x2={WIDTH} y2={HEIGHT - 1} stroke="var(--chart-grid)" strokeWidth={1} />
        <line x1={0.5} y1={0} x2={0.5} y2={HEIGHT} stroke="var(--chart-grid)" strokeWidth={1} />
        <path d={fit} stroke={color} strokeWidth={1.5} fill="none" strokeDasharray="5 4" />
        {points.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={2.6} fill={color} opacity={0.5} />
        ))}
      </svg>
      <ChartTooltip state={state} />
    </div>
  )
}
