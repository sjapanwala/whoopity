import type { Workout } from '../../types/whoop'
import { WORKOUT_ALIASES } from './aliases'
import { buildColumnMap } from './normalize'
import {
  parseNumberOrNull,
  parseTimestampOrNull,
  toLocalDateKey,
} from './values'

/** Parses PapaParse row objects from workouts.csv into Workouts. */
export function parseWorkoutRows(
  rows: Record<string, string>[],
  headers: string[],
): Workout[] {
  const cols = buildColumnMap(headers, WORKOUT_ALIASES)
  const workouts: Workout[] = []

  rows.forEach((row, index) => {
    const start = cols.start ? parseTimestampOrNull(row[cols.start]) : null
    const end = cols.end ? parseTimestampOrNull(row[cols.end]) : null
    if (start === null || end === null) return

    const rawId = cols.id ? row[cols.id] : undefined
    const id = rawId ? rawId : `workout:${start}:${index}`
    const rawSport = cols.sport ? row[cols.sport] : undefined

    workouts.push({
      id,
      date: toLocalDateKey(start),
      sport: rawSport ? rawSport : 'Unknown',
      start,
      end,
      durationMinutes: cols.durationMinutes
        ? parseNumberOrNull(row[cols.durationMinutes])
        : null,
      strain: cols.strain ? parseNumberOrNull(row[cols.strain]) : null,
      averageHeartRate: cols.averageHeartRate
        ? parseNumberOrNull(row[cols.averageHeartRate])
        : null,
      maxHeartRate: cols.maxHeartRate
        ? parseNumberOrNull(row[cols.maxHeartRate])
        : null,
      energyExpended: cols.energyExpended
        ? parseNumberOrNull(row[cols.energyExpended])
        : null,
      distanceMeters: cols.distanceMeters
        ? parseNumberOrNull(row[cols.distanceMeters])
        : null,
      altitudeGainMeters: cols.altitudeGainMeters
        ? parseNumberOrNull(row[cols.altitudeGainMeters])
        : null,
      zones: {
        zone1Minutes: cols.zone1Minutes
          ? parseNumberOrNull(row[cols.zone1Minutes])
          : null,
        zone2Minutes: cols.zone2Minutes
          ? parseNumberOrNull(row[cols.zone2Minutes])
          : null,
        zone3Minutes: cols.zone3Minutes
          ? parseNumberOrNull(row[cols.zone3Minutes])
          : null,
        zone4Minutes: cols.zone4Minutes
          ? parseNumberOrNull(row[cols.zone4Minutes])
          : null,
        zone5Minutes: cols.zone5Minutes
          ? parseNumberOrNull(row[cols.zone5Minutes])
          : null,
      },
    })
  })

  return workouts
}
