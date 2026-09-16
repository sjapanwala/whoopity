import { addDaysToKey } from './dateKey'

function isNextCalendarDay(prevDateKey: string, dateKey: string): boolean {
  return addDaysToKey(prevDateKey, 1) === dateKey
}

/** Longest run of consecutive calendar days (no gaps) where `predicate` holds. */
export function longestStreak<T extends { date: string }>(
  records: T[],
  predicate: (record: T) => boolean,
): number {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  let longest = 0
  let current = 0
  let prevDate: string | null = null

  for (const record of sorted) {
    if (!predicate(record)) {
      current = 0
      prevDate = null
      continue
    }
    current = prevDate !== null && isNextCalendarDay(prevDate, record.date) ? current + 1 : 1
    longest = Math.max(longest, current)
    prevDate = record.date
  }

  return longest
}

/** Trailing streak ending at the most recent record's date. */
export function currentStreak<T extends { date: string }>(
  records: T[],
  predicate: (record: T) => boolean,
): number {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  let count = 0
  let prevDate: string | null = null

  for (let i = sorted.length - 1; i >= 0; i--) {
    const record = sorted[i]!
    if (!predicate(record)) break
    if (prevDate !== null && !isNextCalendarDay(record.date, prevDate)) break
    count += 1
    prevDate = record.date
  }

  return count
}
