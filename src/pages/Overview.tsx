import { useMemo } from 'react'
import { format } from 'date-fns'
import { CompareRow } from '../components/CompareRow'
import { EmptyState } from '../components/EmptyState'
import { RecoveryHeatmap } from '../components/RecoveryHeatmap'
import { baselineBefore, compareToBaseline, type Baseline, type BaselineComparison } from '../lib/metrics/baseline'
import { addDaysToKey } from '../lib/metrics/dateKey'
import { recoveryZoneFor } from '../lib/metrics/recoveryZone'
import { toSeries, type SeriesPoint } from '../lib/metrics/series'
import { currentStreak } from '../lib/metrics/streaks'
import type { Cycle } from '../types/whoop'
import { useData } from '../state/data'

const HEATMAP_DAYS = 90

function latestCycle(cycles: Cycle[]): Cycle | null {
  if (cycles.length === 0) return null
  return [...cycles].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
}

/** 30-day average ending at `anchorDate` vs. the 30 days before that, reusing baselineBefore's windowing twice. */
function compareRecentToPrior(
  series: SeriesPoint[],
  anchorDate: string,
  windowDays = 30,
): { recent: Baseline | null; prior: Baseline | null; comparison: BaselineComparison | null } {
  const recent = baselineBefore(series, addDaysToKey(anchorDate, 1), windowDays)
  const prior = baselineBefore(series, addDaysToKey(anchorDate, 1 - windowDays), windowDays)
  return { recent, prior, comparison: compareToBaseline(recent?.mean ?? null, prior) }
}

interface MetricSpec {
  label: string
  series: SeriesPoint[]
  higherIsBetter: boolean
  neutral?: boolean
  unit?: string
  digits?: number
}

type Magnitude = 'bigUp' | 'up' | 'flat' | 'down' | 'bigDown'

function magnitudeOf(diff: number | null): Magnitude {
  if (diff === null) return 'flat'
  if (diff > 6) return 'bigUp'
  if (diff > 1) return 'up'
  if (diff < -6) return 'bigDown'
  if (diff < -1) return 'down'
  return 'flat'
}

const VERDICT_HEADS: Record<Magnitude, string> = {
  bigUp: 'You are recovering significantly better than a month ago.',
  up: 'You are recovering better than a month ago.',
  flat: 'You are holding steady.',
  down: 'Your recovery has dipped from a month ago.',
  bigDown: 'Your recovery has dropped sharply from a month ago.',
}

/**
 * Composes the Overview headline + body from real numbers already on the
 * page — magnitude of the 30d-vs-prior-30d recovery move, which metric (if
 * any) is plausibly driving an improvement, and how long the current green
 * streak is — instead of a fixed two-state message.
 */
function describeVerdict({
  recoveryDiff,
  recent,
  prior,
  greenStreak,
  driver,
}: {
  recoveryDiff: number | null
  recent: Baseline | null
  prior: Baseline | null
  greenStreak: number
  driver: string | null
}): { head: string; body: string } {
  if (!recent) {
    return { head: 'Not enough data yet.', body: 'Keep logging to see a recovery trend build up.' }
  }
  if (!prior) {
    return {
      head: 'Your recovery baseline is still forming.',
      body: `Your average so far is ${Math.round(recent.mean)}, from ${recent.count} ${recent.count === 1 ? 'day' : 'days'} of data. Check back after 30 days for a month-over-month comparison.`,
    }
  }

  const bucket = magnitudeOf(recoveryDiff)
  const trendWord = bucket === 'bigUp' || bucket === 'up' ? 'up' : bucket === 'bigDown' || bucket === 'down' ? 'down' : 'level'
  const driverClause = driver && (bucket === 'up' || bucket === 'bigUp') ? `, driven mostly by ${driver}` : ''
  const streakClause =
    greenStreak >= 3
      ? ` You're on a ${greenStreak}-day green streak${greenStreak >= 7 ? ' — your best stretch in a while' : ''}.`
      : ''

  return {
    head: VERDICT_HEADS[bucket],
    body: `Your 30-day recovery average is ${Math.round(recent.mean)}${driverClause}, ${trendWord} from ${Math.round(prior.mean)} in the previous 30 days.${streakClause}`,
  }
}

export function Overview() {
  const { dataset } = useData()

  const view = useMemo(() => {
    const cycle = latestCycle(dataset.cycles)
    if (!cycle) return null

    const nights = dataset.sleeps.filter((s) => s.type === 'sleep')
    const latestSleep = [...nights].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
    const sleepAnchor = latestSleep?.date ?? cycle.date

    const metrics: MetricSpec[] = [
      { label: 'Day strain', series: toSeries(dataset.cycles, (c) => c.strain), higherIsBetter: false, neutral: true, digits: 1 },
      {
        label: 'Sleep performance',
        series: toSeries(nights, (s) => s.performancePercent),
        higherIsBetter: true,
        unit: '%',
        digits: 0,
      },
      { label: 'HRV', series: toSeries(dataset.cycles, (c) => c.hrvMs), higherIsBetter: true, unit: ' ms', digits: 0 },
      {
        label: 'Resting heart rate',
        series: toSeries(dataset.cycles, (c) => c.restingHeartRate),
        higherIsBetter: false,
        unit: ' bpm',
        digits: 1,
      },
      {
        label: 'Respiratory rate',
        series: toSeries(dataset.cycles, (c) => c.respiratoryRate),
        higherIsBetter: false,
        neutral: true,
        unit: ' rpm',
        digits: 1,
      },
      { label: 'SpO2', series: toSeries(dataset.cycles, (c) => c.spo2Percent), higherIsBetter: true, unit: '%', digits: 0 },
      {
        label: 'Skin temperature',
        series: toSeries(dataset.cycles, (c) => c.skinTempCelsius),
        higherIsBetter: false,
        neutral: true,
        unit: '°C',
        digits: 1,
      },
    ]

    const compareRows = metrics.map((m) => ({
      ...m,
      ...compareRecentToPrior(m.series, m.label === 'Sleep performance' ? sleepAnchor : cycle.date),
    }))

    const recoverySeries = toSeries(dataset.cycles, (c) => c.recoveryScore)
    const recovery = compareRecentToPrior(recoverySeries, cycle.date)
    const recoveryDiff = recovery.recent && recovery.prior ? recovery.recent.mean - recovery.prior.mean : null

    const heatmapStart = addDaysToKey(cycle.date, -(HEATMAP_DAYS + 1))
    const heatmapCells = dataset.cycles.filter((c) => c.date >= heatmapStart && c.date <= cycle.date)
    const bandCounts = { green: 0, yellow: 0, red: 0 }
    for (const c of heatmapCells) {
      const zone = recoveryZoneFor(c.recoveryScore)
      if (zone) bandCounts[zone] += 1
    }
    const daysWithData = bandCounts.green + bandCounts.yellow + bandCounts.red

    const greenStreak = currentStreak(dataset.cycles, (c) => c.recoveryZone === 'green')
    const hrvRow = compareRows.find((r) => r.label === 'HRV')
    const rhrRow = compareRows.find((r) => r.label === 'Resting heart rate')
    const driver =
      hrvRow?.comparison?.direction === 'up'
        ? 'a stronger HRV'
        : rhrRow?.comparison?.direction === 'down'
          ? 'a lower resting heart rate'
          : null

    return { cycle, recovery, recoveryDiff, compareRows, heatmapStart, bandCounts, daysWithData, recoverySeries, greenStreak, driver }
  }, [dataset])

  if (!view) {
    return <EmptyState />
  }

  const { cycle, recovery, recoveryDiff, compareRows, heatmapStart, bandCounts, daysWithData, recoverySeries, greenStreak, driver } = view

  const verdict = describeVerdict({ recoveryDiff, recent: recovery.recent, prior: recovery.prior, greenStreak, driver })

  return (
    <div className="flex flex-col gap-6">
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        Last {HEATMAP_DAYS} days · through {format(new Date(`${cycle.date}T00:00:00`), 'MMM d, yyyy')}
      </div>
      <h1 className="max-w-[22ch] text-[clamp(28px,4vw,42px)] font-semibold leading-[1.15] tracking-tight text-balance">
        {verdict.head}
      </h1>
      <p className="max-w-[62ch] text-[16.5px] leading-[1.55] text-ink-muted text-pretty">{verdict.body}</p>

      <div className="mt-4 grid grid-cols-1 gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(190px,1fr)] lg:gap-[clamp(22px,4vw,48px)]">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">
              Recovery, day by day
            </div>
            <div className="font-mono text-[11px] text-ink-muted">
              {daysWithData > 0 ? `${bandCounts.green} of ${daysWithData} days in the green zone` : 'No recovery data yet'}
            </div>
          </div>
          <div className="mt-4">
            <RecoveryHeatmap series={recoverySeries} start={heatmapStart} end={cycle.date} />
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">
            Days in each band
          </div>
          <div className="mt-3.5 border-t border-line">
            {(
              [
                ['green', 'Green zone'],
                ['yellow', 'Yellow zone'],
                ['red', 'Red zone'],
              ] as const
            ).map(([zone, label]) => (
              <div key={zone} className="flex items-center gap-3 border-b border-line py-3">
                <svg viewBox="0 0 15 15" className="block h-[15px] w-[15px] shrink-0">
                  <rect width="15" height="15" rx="2.5" fill={`var(--status-${zone === 'green' ? 'good' : zone === 'yellow' ? 'warning' : 'critical'})`} />
                </svg>
                <span className="text-[13.5px] text-ink">{label}</span>
                <span className="ml-auto font-mono text-xs text-ink-muted">{bandCounts[zone]} d</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-line">
        {compareRows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            series={row.series}
            recent={row.recent}
            comparison={row.comparison}
            higherIsBetter={row.higherIsBetter}
            neutral={row.neutral}
            unit={row.unit}
            digits={row.digits}
          />
        ))}
      </div>
    </div>
  )
}
