import { describe, expect, it } from 'vitest'
import { currentStreak, longestStreak } from './streaks'

const records = [
  { date: '2024-01-01', ok: true },
  { date: '2024-01-02', ok: true },
  { date: '2024-01-03', ok: false },
  { date: '2024-01-04', ok: true },
  { date: '2024-01-05', ok: true },
  { date: '2024-01-06', ok: true },
]

describe('longestStreak', () => {
  it('finds the longest run of consecutive matching days', () => {
    expect(longestStreak(records, (r) => r.ok)).toBe(3)
  })

  it('breaks a streak across a date gap even if the predicate holds either side', () => {
    const withGap = [
      { date: '2024-01-01', ok: true },
      { date: '2024-01-05', ok: true },
    ]
    expect(longestStreak(withGap, (r) => r.ok)).toBe(1)
  })

  it('returns 0 when nothing matches', () => {
    expect(longestStreak(records, () => false)).toBe(0)
  })
})

describe('currentStreak', () => {
  it('counts the trailing streak ending at the most recent date', () => {
    expect(currentStreak(records, (r) => r.ok)).toBe(3)
  })

  it('returns 0 when the most recent record fails the predicate', () => {
    const trailingBreak = [...records, { date: '2024-01-07', ok: false }]
    expect(currentStreak(trailingBreak, (r) => r.ok)).toBe(0)
  })
})
