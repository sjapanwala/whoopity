import type { Sleep } from '../../types/whoop'

/** Total time actually asleep (light + REM + deep), excluding awake time. */
export function actualSleepMinutes(sleep: Sleep): number | null {
  const { lightMinutes, remMinutes, deepMinutes } = sleep.stages
  if (lightMinutes === null && remMinutes === null && deepMinutes === null) return null
  return (lightMinutes ?? 0) + (remMinutes ?? 0) + (deepMinutes ?? 0)
}

export interface SleepAverages {
  averagePerformance: number | null
  averageEfficiency: number | null
  averageConsistency: number | null
  averageDebtMinutes: number | null
  averageNeedMinutes: number | null
  averageActualMinutes: number | null
}

function average(values: (number | null)[]): number | null {
  const nonNull = values.filter((v): v is number => v !== null)
  return nonNull.length > 0 ? nonNull.reduce((s, v) => s + v, 0) / nonNull.length : null
}

export function summarizeSleeps(sleeps: Sleep[]): SleepAverages {
  const nights = sleeps.filter((s) => s.type === 'sleep')
  return {
    averagePerformance: average(nights.map((s) => s.performancePercent)),
    averageEfficiency: average(nights.map((s) => s.efficiencyPercent)),
    averageConsistency: average(nights.map((s) => s.consistencyPercent)),
    averageDebtMinutes: average(nights.map((s) => s.sleepDebtMinutes)),
    averageNeedMinutes: average(nights.map((s) => s.sleepNeedMinutes)),
    averageActualMinutes: average(nights.map(actualSleepMinutes)),
  }
}
