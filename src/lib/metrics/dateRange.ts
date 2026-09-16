import { formatISO, subDays, subYears } from 'date-fns'

export type RangeKey = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

export interface DateRange {
  start: string
  end: string
}

/** Resolves a preset (or custom) range key into concrete yyyy-MM-dd bounds. */
export function resolveRange(
  range: RangeKey,
  referenceDate: Date,
  custom?: DateRange,
): DateRange | null {
  const end = formatISO(referenceDate, { representation: 'date' })
  switch (range) {
    case '7d':
      return { start: formatISO(subDays(referenceDate, 6), { representation: 'date' }), end }
    case '30d':
      return { start: formatISO(subDays(referenceDate, 29), { representation: 'date' }), end }
    case '90d':
      return { start: formatISO(subDays(referenceDate, 89), { representation: 'date' }), end }
    case '1y':
      return { start: formatISO(subYears(referenceDate, 1), { representation: 'date' }), end }
    case 'all':
      return null
    case 'custom':
      return custom ?? null
  }
}

export function filterByDateRange<T extends { date: string }>(
  records: T[],
  range: DateRange | null,
): T[] {
  if (range === null) return records
  return records.filter((r) => r.date >= range.start && r.date <= range.end)
}
