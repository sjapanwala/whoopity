import type { MetricKey, Sex } from '../../types/profile'

export interface MetricInfo {
  label: string
  unit: string
  digits: number
  higherIsBetter: boolean
}

export interface Benchmark extends MetricInfo {
  mean: number
  sd: number
}

/**
 * Population reference values the Athletic Level page benchmarks against.
 *
 * IMPORTANT: resting heart rate and HRV have real, commonly-published
 * general-population reference ranges; WHOOP's recovery score, sleep
 * performance, and strain are proprietary/app-specific scores with no
 * independent published population norms. All five are modeled the same
 * way here (mean/SD + linear age & sex adjustments) for a consistent,
 * transparent formula — but this whole page is an APPROXIMATE, ILLUSTRATIVE
 * benchmark, not a clinical or scientifically validated one. Say so in the UI.
 */
export const METRIC_INFO: Record<MetricKey, MetricInfo> = {
  hrv: { label: 'HRV', unit: ' ms', digits: 0, higherIsBetter: true },
  restingHeartRate: { label: 'Resting heart rate', unit: ' bpm', digits: 0, higherIsBetter: false },
  recoveryConsistency: { label: 'Recovery consistency', unit: '%', digits: 0, higherIsBetter: true },
  sleepPerformance: { label: 'Sleep performance', unit: '%', digits: 0, higherIsBetter: true },
  trainingLoad: { label: 'Training load', unit: ' strain/wk', digits: 0, higherIsBetter: true },
}

/** Fixed iteration order for the breakdown UI. */
export const METRIC_KEYS = Object.keys(METRIC_INFO) as MetricKey[]

/** Reference mean/SD at age 30, sex-neutral. */
const BASE: Record<MetricKey, { mean: number; sd: number }> = {
  hrv: { mean: 60, sd: 22 },
  restingHeartRate: { mean: 68, sd: 9 },
  recoveryConsistency: { mean: 33, sd: 15 },
  sleepPerformance: { mean: 78, sd: 11 },
  trainingLoad: { mean: 50, sd: 22 },
}

/** Linear drift in the mean per decade of age away from 30 (e.g. HRV declines with age). */
const AGE_DRIFT_PER_DECADE: Record<MetricKey, number> = {
  hrv: -6,
  restingHeartRate: 0.5,
  recoveryConsistency: -2,
  sleepPerformance: -1.5,
  trainingLoad: -4,
}

/** Flat offset to the mean by sex; 'other' uses the unadjusted (average) baseline. */
const SEX_OFFSET: Record<MetricKey, Record<Sex, number>> = {
  hrv: { male: 3, female: -3, other: 0 },
  restingHeartRate: { male: -2, female: 2, other: 0 },
  recoveryConsistency: { male: 0, female: 0, other: 0 },
  sleepPerformance: { male: -1, female: 1, other: 0 },
  trainingLoad: { male: 4, female: -4, other: 0 },
}

const REFERENCE_AGE = 30

export function benchmarkFor(metric: MetricKey, age: number, sex: Sex): Benchmark {
  const base = BASE[metric]
  const decadesFromReference = (age - REFERENCE_AGE) / 10
  const mean = base.mean + AGE_DRIFT_PER_DECADE[metric] * decadesFromReference + SEX_OFFSET[metric][sex]
  return { ...METRIC_INFO[metric], mean, sd: base.sd }
}
