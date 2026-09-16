import type { MetricKey } from '../../types/profile'
import type { WhoopDataset } from '../../types/whoop'
import { addDaysToKey } from '../metrics/dateKey'
import { recoveryZoneFor } from '../metrics/recoveryZone'
import { summarizeSleeps } from '../metrics/sleepStats'
import { weeklyStrainVolume } from '../metrics/workoutTotals'

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null
}

function latestDate(dates: string[]): string | null {
  return dates.length > 0 ? dates.reduce((max, d) => (d > max ? d : max)) : null
}

/**
 * Reads each Athletic Level metric off the real dataset, anchored to the
 * latest cycle date (not "today" — imported/demo data may not reach it):
 * HRV/resting HR average over the last 90 days, recovery consistency as the
 * share of those days in the green zone, sleep performance over the last 30
 * nights, training load as the average weekly strain over the last ~13 weeks.
 */
export function computeCurrentValues(dataset: WhoopDataset): Record<MetricKey, number | null> {
  const anchor = latestDate(dataset.cycles.map((c) => c.date))
  if (!anchor) {
    return { hrv: null, restingHeartRate: null, recoveryConsistency: null, sleepPerformance: null, trainingLoad: null }
  }

  const windowStart90 = addDaysToKey(anchor, -89)
  const recentCycles = dataset.cycles.filter((c) => c.date >= windowStart90 && c.date <= anchor)

  const hrv = average(recentCycles.map((c) => c.hrvMs).filter((v): v is number => v !== null))
  const restingHeartRate = average(recentCycles.map((c) => c.restingHeartRate).filter((v): v is number => v !== null))

  const zones = recentCycles.map((c) => recoveryZoneFor(c.recoveryScore)).filter((z) => z !== null)
  const recoveryConsistency = zones.length > 0 ? (zones.filter((z) => z === 'green').length / zones.length) * 100 : null

  const windowStart30 = addDaysToKey(anchor, -29)
  const recentNights = dataset.sleeps.filter((s) => s.type === 'sleep' && s.date >= windowStart30 && s.date <= anchor)
  const sleepPerformance = summarizeSleeps(recentNights).averagePerformance

  const windowStart91 = addDaysToKey(anchor, -90)
  const recentWorkouts = dataset.workouts.filter((w) => w.date >= windowStart91 && w.date <= anchor)
  const trainingLoad = average(weeklyStrainVolume(recentWorkouts).map((w) => w.totalStrain))

  return { hrv, restingHeartRate, recoveryConsistency, sleepPerformance, trainingLoad }
}
