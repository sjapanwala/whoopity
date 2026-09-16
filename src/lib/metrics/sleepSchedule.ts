import type { Sleep } from '../../types/whoop'

const MINUTES_PER_DAY = 24 * 60
const NOON = 12 * 60

/**
 * Bedtime expressed as minutes after the *previous* noon, so a typical
 * evening bedtime (9pm) and an after-midnight one (1am) both plot on a
 * single monotonic axis instead of wrapping around 24:00.
 */
export function bedtimeMinutesFromNoon(iso: string): number {
  const date = new Date(iso)
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes()
  return minutesSinceMidnight < NOON
    ? minutesSinceMidnight + MINUTES_PER_DAY - NOON
    : minutesSinceMidnight - NOON
}

export function wakeMinutesFromMidnight(iso: string): number {
  const date = new Date(iso)
  return date.getHours() * 60 + date.getMinutes()
}

export interface SchedulePoint {
  date: string
  bedtimeMinutesFromNoon: number
  wakeMinutesFromMidnight: number
}

export function scheduleSeries(sleeps: Sleep[]): SchedulePoint[] {
  return sleeps
    .filter((s) => s.type === 'sleep')
    .map((s) => ({
      date: s.date,
      bedtimeMinutesFromNoon: bedtimeMinutesFromNoon(s.start),
      wakeMinutesFromMidnight: wakeMinutesFromMidnight(s.end),
    }))
}

/** Population standard deviation of bedtime (minutes from the previous noon) across nights — how consistent a bedtime is, not just its average. */
export function bedtimeSpreadMinutes(sleeps: Sleep[]): number | null {
  const bedtimes = sleeps.filter((s) => s.type === 'sleep').map((s) => bedtimeMinutesFromNoon(s.start))
  if (bedtimes.length === 0) return null
  const mean = bedtimes.reduce((sum, v) => sum + v, 0) / bedtimes.length
  const variance = bedtimes.reduce((sum, v) => sum + (v - mean) ** 2, 0) / bedtimes.length
  return Math.sqrt(variance)
}
