import { describe, expect, it } from 'vitest'
import {
  describeCorrelationStrength,
  joinSeriesByDateOffset,
  pearsonCorrelation,
} from './correlation'

describe('joinSeriesByDateOffset', () => {
  it('pairs a with b on a[date] + offsetDays', () => {
    const a = [
      { date: '2024-01-01', value: 1 },
      { date: '2024-01-02', value: 2 },
    ]
    const b = [
      { date: '2024-01-02', value: 10 },
      { date: '2024-01-03', value: 20 },
    ]
    expect(joinSeriesByDateOffset(a, b, 1)).toEqual([
      [1, 10],
      [2, 20],
    ])
  })

  it('skips pairs with no match or null values', () => {
    const a = [
      { date: '2024-01-01', value: null },
      { date: '2024-01-02', value: 2 },
    ]
    const b = [{ date: '2024-01-05', value: 99 }]
    expect(joinSeriesByDateOffset(a, b, 1)).toEqual([])
  })
})

describe('pearsonCorrelation', () => {
  it('returns null below the minimum sample size', () => {
    expect(pearsonCorrelation([[1, 1], [2, 2]])).toBeNull()
  })

  it('finds a perfect positive correlation', () => {
    const pairs: [number, number][] = [
      [1, 2], [2, 4], [3, 6], [4, 8], [5, 10],
    ]
    const result = pearsonCorrelation(pairs)
    expect(result?.r).toBeCloseTo(1)
    expect(result?.n).toBe(5)
  })

  it('finds a perfect negative correlation', () => {
    const pairs: [number, number][] = [
      [1, 10], [2, 8], [3, 6], [4, 4], [5, 2],
    ]
    expect(pearsonCorrelation(pairs)?.r).toBeCloseTo(-1)
  })

  it('returns 0 when one variable has no variance', () => {
    const pairs: [number, number][] = [
      [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
    ]
    expect(pearsonCorrelation(pairs)?.r).toBe(0)
  })
})

describe('describeCorrelationStrength', () => {
  it('flags small samples as insufficient regardless of r', () => {
    expect(describeCorrelationStrength({ r: 0.95, n: 5, slope: 0 })).toBe('insufficient-data')
    expect(describeCorrelationStrength(null)).toBe('insufficient-data')
  })

  it('buckets by |r| once the sample is large enough', () => {
    expect(describeCorrelationStrength({ r: 0.05, n: 30, slope: 0 })).toBe('negligible')
    expect(describeCorrelationStrength({ r: 0.3, n: 30, slope: 0 })).toBe('weak')
    expect(describeCorrelationStrength({ r: -0.5, n: 30, slope: 0 })).toBe('moderate')
    expect(describeCorrelationStrength({ r: 0.8, n: 30, slope: 0 })).toBe('strong')
  })
})
