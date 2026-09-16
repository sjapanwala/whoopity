import { format, startOfISOWeek } from 'date-fns'
import type { Workout } from '../../types/whoop'

export interface SportTotals {
  sport: string
  count: number
  totalDurationMinutes: number
  totalStrain: number
  averageHeartRate: number | null
  totalEnergyExpended: number
}

export function totalsBySport(workouts: Workout[]): SportTotals[] {
  const bySport = new Map<string, Workout[]>()
  for (const workout of workouts) {
    const list = bySport.get(workout.sport) ?? []
    list.push(workout)
    bySport.set(workout.sport, list)
  }

  return Array.from(bySport.entries())
    .map(([sport, list]) => {
      const heartRates = list
        .map((w) => w.averageHeartRate)
        .filter((v): v is number => v !== null)
      return {
        sport,
        count: list.length,
        totalDurationMinutes: list.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0),
        totalStrain: list.reduce((sum, w) => sum + (w.strain ?? 0), 0),
        averageHeartRate:
          heartRates.length > 0
            ? heartRates.reduce((s, v) => s + v, 0) / heartRates.length
            : null,
        totalEnergyExpended: list.reduce((sum, w) => sum + (w.energyExpended ?? 0), 0),
      }
    })
    .sort((a, b) => b.totalStrain - a.totalStrain)
}

export interface WeeklyStrainVolume {
  /** ISO week start (Monday), yyyy-MM-dd. */
  weekStart: string
  totalStrain: number
  workoutCount: number
}

export function weeklyStrainVolume(workouts: Workout[]): WeeklyStrainVolume[] {
  const byWeek = new Map<string, { totalStrain: number; count: number }>()
  for (const workout of workouts) {
    const weekStart = format(
      startOfISOWeek(new Date(`${workout.date}T00:00:00`)),
      'yyyy-MM-dd',
    )
    const existing = byWeek.get(weekStart) ?? { totalStrain: 0, count: 0 }
    existing.totalStrain += workout.strain ?? 0
    existing.count += 1
    byWeek.set(weekStart, existing)
  }

  return Array.from(byWeek.entries())
    .map(([weekStart, { totalStrain, count }]) => ({
      weekStart,
      totalStrain,
      workoutCount: count,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}
