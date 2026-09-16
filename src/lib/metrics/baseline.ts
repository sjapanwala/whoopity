import { format, subDays } from 'date-fns'
import type { SeriesPoint } from './series'

export interface Baseline {
  mean: number
  count: number
}

export function computeBaseline(values: (number | null)[]): Baseline | null {
  const nonNull = values.filter((v): v is number => v !== null)
  if (nonNull.length === 0) return null
  return {
    mean: nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length,
    count: nonNull.length,
  }
}

/**
 * Baseline over the `windowDays` immediately before (not including)
 * `referenceDate`, per the Overview page's "vs. your 30-day baseline" spec.
 */
export function baselineBefore(
  series: SeriesPoint[],
  referenceDate: string,
  windowDays = 30,
): Baseline | null {
  const windowStartDate = subDays(new Date(`${referenceDate}T00:00:00`), windowDays)
  const windowStart = format(windowStartDate, 'yyyy-MM-dd')
  const values = series
    .filter((p) => p.date >= windowStart && p.date < referenceDate)
    .map((p) => p.value)
  return computeBaseline(values)
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface BaselineComparison {
  current: number
  baselineMean: number
  delta: number
  /** delta as a fraction of the baseline mean, e.g. 0.1 = +10%. Null if baseline is ~0. */
  percentChange: number | null
  direction: TrendDirection
}

/** Compares a current value to a baseline, with a flat deadband to avoid noisy +0.1 arrows. */
export function compareToBaseline(
  current: number | null,
  baseline: Baseline | null,
  flatThreshold = 0.01,
): BaselineComparison | null {
  if (current === null || baseline === null) return null
  const delta = current - baseline.mean
  const direction: TrendDirection =
    Math.abs(delta) < flatThreshold ? 'flat' : delta > 0 ? 'up' : 'down'
  return {
    current,
    baselineMean: baseline.mean,
    delta,
    percentChange: Math.abs(baseline.mean) > 1e-9 ? delta / baseline.mean : null,
    direction,
  }
}
