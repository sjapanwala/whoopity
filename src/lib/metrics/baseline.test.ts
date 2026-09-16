import { describe, expect, it } from 'vitest'
import { baselineBefore, compareToBaseline, computeBaseline } from './baseline'

describe('computeBaseline', () => {
  it('averages non-null values', () => {
    expect(computeBaseline([10, 20, 30])).toEqual({ mean: 20, count: 3 })
  })

  it('ignores nulls', () => {
    expect(computeBaseline([10, null, 30])).toEqual({ mean: 20, count: 2 })
  })

  it('returns null when every value is null', () => {
    expect(computeBaseline([null, null])).toBeNull()
  })
})

describe('baselineBefore', () => {
  const series = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-15', value: 20 },
    { date: '2024-01-31', value: 30 },
    { date: '2024-02-01', value: 999 }, // the reference date itself: excluded
  ]

  it('averages the window strictly before the reference date, excluding it', () => {
    // windowStart = 2024-02-01 - 30d = 2024-01-02, so 2024-01-01 falls just outside it.
    const baseline = baselineBefore(series, '2024-02-01', 30)
    expect(baseline).toEqual({ mean: 25, count: 2 }) // avg(20, 30)
  })

  it('returns null with no data in the window', () => {
    expect(baselineBefore(series, '2023-01-01', 30)).toBeNull()
  })
})

describe('compareToBaseline', () => {
  it('reports direction and percent change', () => {
    const result = compareToBaseline(80, { mean: 70, count: 10 })
    expect(result).toMatchObject({ delta: 10, direction: 'up' })
    expect(result?.percentChange).toBeCloseTo(10 / 70)
  })

  it('treats a small delta as flat', () => {
    const result = compareToBaseline(70.005, { mean: 70, count: 10 }, 0.01)
    expect(result?.direction).toBe('flat')
  })

  it('returns null when current or baseline is missing', () => {
    expect(compareToBaseline(null, { mean: 70, count: 10 })).toBeNull()
    expect(compareToBaseline(70, null)).toBeNull()
  })
})
