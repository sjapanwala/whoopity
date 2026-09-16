import { addDays, format } from 'date-fns'

/**
 * Adds `days` to a yyyy-MM-dd key, returning another yyyy-MM-dd key.
 * Formats using local date components (not toISOString, which converts to
 * UTC and shifts the calendar date for timezones ahead of UTC).
 */
export function addDaysToKey(dateKey: string, days: number): string {
  const result = addDays(new Date(`${dateKey}T00:00:00`), days)
  return format(result, 'yyyy-MM-dd')
}
