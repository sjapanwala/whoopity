/**
 * The five metrics the Athletic Level page benchmarks against population
 * norms. See src/lib/athleticLevel/benchmarks.ts for the reference values.
 */
export type MetricKey = 'hrv' | 'restingHeartRate' | 'recoveryConsistency' | 'sleepPerformance' | 'trainingLoad'

export type Sex = 'male' | 'female' | 'other'

/**
 * User-entered profile + preferences for the Athletic Level page. Stored
 * separately from imported WHOOP data (src/db/profileRepository.ts) — it's
 * not cleared by "Delete all data".
 */
export interface AthleteProfile {
  id: 'default'
  age: number | null
  sex: Sex | null
  /** Raw slider values (0-100), not required to sum to 100 — normalized at compute time. */
  weights: Record<MetricKey, number>
  targetPercentile: number
}

export function defaultProfile(): AthleteProfile {
  return {
    id: 'default',
    age: null,
    sex: null,
    weights: { hrv: 20, restingHeartRate: 20, recoveryConsistency: 20, sleepPerformance: 20, trainingLoad: 20 },
    targetPercentile: 75,
  }
}
