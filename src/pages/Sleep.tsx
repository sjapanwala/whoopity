import { useMemo, useState } from 'react'
import { RangePicker } from '../components/RangePicker'
import { SleepWindowChart } from '../components/SleepWindowChart'
import { StageCompositionChart } from '../components/StageCompositionChart'
import { filterByDateRange, resolveRange, type RangeKey } from '../lib/metrics/dateRange'
import { bedtimeMinutesFromNoon, bedtimeSpreadMinutes } from '../lib/metrics/sleepSchedule'
import { summarizeSleeps } from '../lib/metrics/sleepStats'
import { useData } from '../state/data'

function formatMinutesAsHours(minutes: number | null): string {
  if (minutes === null) return '–'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}m`
}

function formatPercent(value: number | null): string {
  return value === null ? '–' : `${Math.round(value)}%`
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : null
}

export function Sleep() {
  const { dataset } = useData()
  const [range, setRange] = useState<RangeKey>('30d')

  const resolved = useMemo(() => resolveRange(range, new Date()), [range])
  const nights = useMemo(
    () => filterByDateRange(dataset.sleeps, resolved).filter((s) => s.type === 'sleep'),
    [dataset.sleeps, resolved],
  )
  const summary = useMemo(() => summarizeSleeps(nights), [nights])
  const spread = useMemo(() => bedtimeSpreadMinutes(nights), [nights])

  const bedtimeShift = useMemo(() => {
    const allNights = [...dataset.sleeps].filter((s) => s.type === 'sleep').sort((a, b) => a.date.localeCompare(b.date))
    if (allNights.length <= nights.length || allNights.length < 10 || nights.length < 5) return null
    const earliest = allNights.slice(0, 30)
    const earliestAvg = average(earliest.map((s) => bedtimeMinutesFromNoon(s.start)))
    const recentAvg = average(nights.map((s) => bedtimeMinutesFromNoon(s.start)))
    if (earliestAvg === null || recentAvg === null) return null
    return { minutes: Math.round(Math.abs(earliestAvg - recentAvg)), direction: recentAvg < earliestAvg ? 'earlier' : 'later' }
  }, [dataset.sleeps, nights])

  if (dataset.sleeps.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Sleep</h1>
        <p className="mt-2 text-sm text-ink-muted">Import or load demo data to see sleep detail.</p>
      </div>
    )
  }

  const lede =
    summary.averagePerformance !== null
      ? `You average ${Math.round(summary.averagePerformance)}% performance over the last ${nights.length} nights.${
          bedtimeShift ? ` Bedtime has moved about ${bedtimeShift.minutes} minutes ${bedtimeShift.direction} since your earliest data.` : ''
        }`
      : 'Not enough sleep data yet in this range.'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Sleep</h1>
          <p className="mt-2.5 max-w-[58ch] text-[15px] leading-[1.5] text-ink-muted text-pretty">{lede}</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
        {[
          { label: 'Avg performance', value: formatPercent(summary.averagePerformance) },
          { label: 'Avg efficiency', value: formatPercent(summary.averageEfficiency) },
          { label: 'Avg consistency', value: formatPercent(summary.averageConsistency) },
          { label: 'Avg time asleep', value: formatMinutesAsHours(summary.averageActualMinutes) },
          { label: 'Avg sleep need', value: formatMinutesAsHours(summary.averageNeedMinutes) },
          { label: 'Avg debt', value: formatMinutesAsHours(summary.averageDebtMinutes) },
          { label: 'Bedtime spread', value: spread !== null ? `±${Math.round(spread)} min` : '–' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface p-4">
            <div className="font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-ink-muted">{stat.label}</div>
            <div className="mt-2.5 text-[25px] font-semibold tracking-tight text-ink">{stat.value}</div>
          </div>
        ))}
      </div>

      <SleepWindowChart sleeps={nights} />
      <StageCompositionChart sleeps={nights} />
    </div>
  )
}
