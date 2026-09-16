import { describe, expect, it } from 'vitest'
import { filterByDateRange, resolveRange } from './dateRange'

// Constructed from local y/m/d components (not a UTC ISO string) so this
// test doesn't depend on the machine's timezone offset.
const reference = new Date(2024, 5, 15)

describe('resolveRange', () => {
  it('resolves 7d/30d/90d/1y to the expected start dates', () => {
    expect(resolveRange('7d', reference)).toEqual({ start: '2024-06-09', end: '2024-06-15' })
    expect(resolveRange('30d', reference)).toEqual({ start: '2024-05-17', end: '2024-06-15' })
    expect(resolveRange('1y', reference)).toEqual({ start: '2023-06-15', end: '2024-06-15' })
  })

  it('returns null for "all"', () => {
    expect(resolveRange('all', reference)).toBeNull()
  })

  it('passes through a custom range', () => {
    const custom = { start: '2024-01-01', end: '2024-01-10' }
    expect(resolveRange('custom', reference, custom)).toEqual(custom)
  })
})

describe('filterByDateRange', () => {
  const records = [{ date: '2024-01-01' }, { date: '2024-06-10' }, { date: '2024-12-31' }]

  it('keeps only records inside the range, inclusive', () => {
    const filtered = filterByDateRange(records, { start: '2024-06-01', end: '2024-06-30' })
    expect(filtered).toEqual([{ date: '2024-06-10' }])
  })

  it('returns everything when range is null', () => {
    expect(filterByDateRange(records, null)).toEqual(records)
  })
})
