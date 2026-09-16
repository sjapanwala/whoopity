import type { Cycle } from '../../types/whoop'
import { currentStreak, longestStreak } from './streaks'

export interface RecordHolder {
  value: number
  date: string
}

export interface PersonalRecords {
  bestHrv: RecordHolder | null
  lowestRestingHeartRate: RecordHolder | null
  bestRecoveryScore: RecordHolder | null
  longestGreenStreak: number
  currentGreenStreak: number
}

function extremeBy<T>(
  records: T[],
  accessor: (r: T) => number | null,
  dateOf: (r: T) => string,
  better: (candidate: number, current: number) => boolean,
): RecordHolder | null {
  let best: RecordHolder | null = null
  for (const record of records) {
    const value = accessor(record)
    if (value === null) continue
    if (best === null || better(value, best.value)) {
      best = { value, date: dateOf(record) }
    }
  }
  return best
}

export function computePersonalRecords(cycles: Cycle[]): PersonalRecords {
  const isGreen = (c: Cycle) => c.recoveryZone === 'green'
  return {
    bestHrv: extremeBy(
      cycles,
      (c) => c.hrvMs,
      (c) => c.date,
      (a, b) => a > b,
    ),
    lowestRestingHeartRate: extremeBy(
      cycles,
      (c) => c.restingHeartRate,
      (c) => c.date,
      (a, b) => a < b,
    ),
    bestRecoveryScore: extremeBy(
      cycles,
      (c) => c.recoveryScore,
      (c) => c.date,
      (a, b) => a > b,
    ),
    longestGreenStreak: longestStreak(cycles, isGreen),
    currentGreenStreak: currentStreak(cycles, isGreen),
  }
}
