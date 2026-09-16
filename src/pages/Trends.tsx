import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { RangePicker } from '../components/RangePicker'
import { TrendPanel } from '../components/TrendPanel'
import { filterByDateRange, resolveRange, type DateRange, type RangeKey } from '../lib/metrics/dateRange'
import { toSeries } from '../lib/metrics/series'
import { useData } from '../state/data'

function xAxisLabels(start: string, end: string, count = 5): string[] {
  const startMs = new Date(`${start}T00:00:00`).getTime()
  const endMs = new Date(`${end}T00:00:00`).getTime()
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1)
    return format(new Date(startMs + (endMs - startMs) * t), 'MMM d')
  })
}

export function Trends() {
  const { dataset } = useData()
  const [range, setRange] = useState<RangeKey>('90d')
  const [customRange, setCustomRange] = useState<DateRange>({
    start: '2024-01-01',
    end: new Date().toISOString().slice(0, 10),
  })

  const resolved = useMemo(() => resolveRange(range, new Date(), customRange), [range, customRange])

  const cycles = useMemo(() => filterByDateRange(dataset.cycles, resolved), [dataset.cycles, resolved])
  const sleeps = useMemo(() => filterByDateRange(dataset.sleeps, resolved), [dataset.sleeps, resolved])

  const recoverySeries = toSeries(cycles, (c) => c.recoveryScore)
  const hrvSeries = toSeries(cycles, (c) => c.hrvMs)
  const rhrSeries = toSeries(cycles, (c) => c.restingHeartRate)
  const strainSeries = toSeries(cycles, (c) => c.strain)
  const sleepSeries = toSeries(
    sleeps.filter((s) => s.type === 'sleep'),
    (s) => s.performancePercent,
  )

  const axisRange = resolved ?? {
    start: dataset.cycles.reduce((min, c) => (c.date < min ? c.date : min), '9999-12-31'),
    end: dataset.cycles.reduce((max, c) => (c.date > max ? c.date : max), '0000-01-01'),
  }

  if (dataset.cycles.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Trends</h1>
        <p className="mt-2 text-sm text-ink-muted">Import or load demo data to see trends.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Trends</h1>
          <p className="mt-2.5 max-w-[56ch] text-[15px] leading-[1.5] text-ink-muted text-pretty">
            One shared timeline. Read down a date to see how strain, sleep and recovery moved together.
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      {range === 'custom' && (
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-1.5 text-ink-secondary">
            From
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
              className="rounded-md border border-line bg-transparent px-2 py-1 text-ink-secondary"
            />
          </label>
          <label className="flex items-center gap-1.5 text-ink-secondary">
            To
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
              className="rounded-md border border-line bg-transparent px-2 py-1 text-ink-secondary"
            />
          </label>
        </div>
      )}

      <div className="font-mono text-[11.5px] text-ink-muted">grey = daily reading &nbsp;·&nbsp; color = smoothed average</div>

      <div className="border-t border-line">
        <TrendPanel label="Recovery" series={recoverySeries} color="var(--status-good)" digits={0} />
        <TrendPanel label="HRV" series={hrvSeries} color="var(--cat-1)" unit=" ms" digits={0} />
        <TrendPanel label="Resting heart rate" series={rhrSeries} color="var(--cat-2)" unit=" bpm" digits={1} />
        <TrendPanel label="Strain" series={strainSeries} color="var(--cat-7)" digits={1} />
        <TrendPanel label="Sleep performance" series={sleepSeries} color="var(--cat-3)" unit="%" digits={0} />
        <div className="grid grid-cols-1 gap-3 pt-2.5 sm:grid-cols-[minmax(120px,1fr)_minmax(0,3.6fr)] sm:gap-[clamp(14px,3vw,30px)]">
          <div />
          <div className="flex justify-between font-mono text-[11px] text-ink-muted">
            {xAxisLabels(axisRange.start, axisRange.end).map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
