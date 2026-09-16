import { inverseNormalCdf, normalCdf } from './normal'
import type { Benchmark } from './benchmarks'

const MIN_PERCENTILE = 0.1
const MAX_PERCENTILE = 99.9

/** Where `value` falls against a normal(mean, sd) population, as a 0-100 percentile. Direction-aware: for a lower-is-better metric, a lower value scores a higher percentile. */
export function percentileFor(value: number, benchmark: Benchmark): number {
  const z = benchmark.higherIsBetter ? (value - benchmark.mean) / benchmark.sd : (benchmark.mean - value) / benchmark.sd
  const percentile = normalCdf(z) * 100
  return Math.min(MAX_PERCENTILE, Math.max(MIN_PERCENTILE, percentile))
}

/** The metric value that would land exactly at `targetPercentile` (0-100) against this benchmark. */
export function targetValueFor(targetPercentile: number, benchmark: Benchmark): number {
  const z = inverseNormalCdf(Math.min(99.9, Math.max(0.1, targetPercentile)) / 100)
  return benchmark.higherIsBetter ? benchmark.mean + z * benchmark.sd : benchmark.mean - z * benchmark.sd
}
