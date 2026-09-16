/**
 * Internal data model. WHOOP's CSV export column names have shifted across
 * app versions, so the parsing layer (src/lib/csv) maps whatever headers it
 * finds into these shapes rather than mirroring the raw export.
 */

export type RecoveryZone = 'green' | 'yellow' | 'red'

/** One physiological cycle — WHOOP's "day", from one wake to the next. */
export interface Cycle {
  id: string
  /** ISO date (yyyy-MM-dd) this cycle is attributed to. */
  date: string
  cycleStart: string
  cycleEnd: string | null
  /** 0-21+ strain score. */
  strain: number | null
  /** 0-100 recovery score. */
  recoveryScore: number | null
  recoveryZone: RecoveryZone | null
  restingHeartRate: number | null
  hrvMs: number | null
  /** kilocalories. */
  energyExpended: number | null
  skinTempCelsius: number | null
  respiratoryRate: number | null
  spo2Percent: number | null
}

export type SleepType = 'sleep' | 'nap'

export interface SleepStageDurations {
  awakeMinutes: number | null
  lightMinutes: number | null
  remMinutes: number | null
  deepMinutes: number | null
}

export interface Sleep {
  id: string
  date: string
  type: SleepType
  start: string
  end: string
  /** 0-100 sleep performance score. */
  performancePercent: number | null
  efficiencyPercent: number | null
  consistencyPercent: number | null
  respiratoryRate: number | null
  stages: SleepStageDurations
  /** Minutes actually slept (sum of stage minutes, excluding awake). */
  timeInBedMinutes: number | null
  /** Minutes WHOOP calculated as needed for that night. */
  sleepNeedMinutes: number | null
  /** Minutes of accumulated debt at the time of this sleep. */
  sleepDebtMinutes: number | null
  disturbanceCount: number | null
}

export interface HeartRateZoneDurations {
  zone1Minutes: number | null
  zone2Minutes: number | null
  zone3Minutes: number | null
  zone4Minutes: number | null
  zone5Minutes: number | null
}

export interface Workout {
  id: string
  date: string
  sport: string
  start: string
  end: string
  durationMinutes: number | null
  strain: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
  /** kilocalories. */
  energyExpended: number | null
  distanceMeters: number | null
  altitudeGainMeters: number | null
  zones: HeartRateZoneDurations
}

/** A single free-text/multiple-choice question in the WHOOP daily journal. */
export interface JournalEntry {
  id: string
  date: string
  questionText: string
  /** Normalized to a boolean where the answer is yes/no; raw text otherwise. */
  answer: boolean | string | number | null
}

export interface WhoopDataset {
  cycles: Cycle[]
  sleeps: Sleep[]
  workouts: Workout[]
  journalEntries: JournalEntry[]
}

export function emptyDataset(): WhoopDataset {
  return { cycles: [], sleeps: [], workouts: [], journalEntries: [] }
}
