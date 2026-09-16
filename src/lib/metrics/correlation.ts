import { addDaysToKey } from './dateKey'
import type { SeriesPoint } from './series'

/**
 * Pairs `a[i].value` with `b`'s value on date `a[i].date + offsetDays`,
 * e.g. offsetDays=1 pairs today's strain with tomorrow's recovery.
 */
export function joinSeriesByDateOffset(
  a: SeriesPoint[],
  b: SeriesPoint[],
  offsetDays: number,
): [number, number][] {
  const bByDate = new Map(
    b.filter((p): p is { date: string; value: number } => p.value !== null).map((p) => [p.date, p.value]),
  )
  const pairs: [number, number][] = []
  for (const pointA of a) {
    if (pointA.value === null) continue
    const targetDate = addDaysToKey(pointA.date, offsetDays)
    const bValue = bByDate.get(targetDate)
    if (bValue !== undefined) pairs.push([pointA.value, bValue])
  }
  return pairs
}

export interface CorrelationResult {
  /** Pearson correlation coefficient, in [-1, 1]. */
  r: number
  n: number
  /** Least-squares slope (Δy per unit x) — the real per-unit effect size, for findings copy. */
  slope: number
}

const MIN_SAMPLE_SIZE = 5

export function pearsonCorrelation(pairs: [number, number][]): CorrelationResult | null {
  if (pairs.length < MIN_SAMPLE_SIZE) return null

  const n = pairs.length
  const xs = pairs.map((p) => p[0])
  const ys = pairs.map((p) => p[1])
  const meanX = xs.reduce((s, v) => s + v, 0) / n
  const meanY = ys.reduce((s, v) => s + v, 0) / n

  let cov = 0
  let varX = 0
  let varY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX
    const dy = ys[i]! - meanY
    cov += dx * dy
    varX += dx * dx
    varY += dy * dy
  }

  if (varX === 0 || varY === 0) return { r: 0, n, slope: 0 }
  return { r: cov / Math.sqrt(varX * varY), n, slope: cov / varX }
}

export type CorrelationStrength =
  | 'insufficient-data'
  | 'negligible'
  | 'weak'
  | 'moderate'
  | 'strong'

/**
 * Labels a correlation conservatively — small WHOOP-history sample sizes
 * mean it's easy to overstate a coefficient that's mostly noise.
 */
export function describeCorrelationStrength(
  result: CorrelationResult | null,
): CorrelationStrength {
  if (result === null || result.n < 14) return 'insufficient-data'
  const absR = Math.abs(result.r)
  if (absR < 0.2) return 'negligible'
  if (absR < 0.4) return 'weak'
  if (absR < 0.6) return 'moderate'
  return 'strong'
}
