import { describe, expect, it } from 'vitest'
import { rollingAverage, sortByDate, toSeries } from './series'

describe('toSeries', () => {
  it('projects records into date/value pairs', () => {
    const records = [
      { date: '2024-01-01', recoveryScore: 70 },
      { date: '2024-01-02', recoveryScore: null },
    ]
    expect(toSeries(records, (r) => r.recoveryScore)).toEqual([
      { date: '2024-01-01', value: 70 },
      { date: '2024-01-02', value: null },
    ])
  })
})

describe('sortByDate', () => {
  it('sorts ascending regardless of input order', () => {
    const series = [
      { date: '2024-01-03', value: 1 },
      { date: '2024-01-01', value: 2 },
      { date: '2024-01-02', value: 3 },
    ]
    expect(sortByDate(series).map((p) => p.date)).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ])
  })
})

describe('rollingAverage', () => {
  it('averages the trailing window', () => {
    const series = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
      { date: '2024-01-03', value: 30 },
    ]
    const result = rollingAverage(series, 2)
    expect(result[0]?.value).toBe(10) // window of 1 (no prior day)
    expect(result[1]?.value).toBe(15) // avg(10, 20)
    expect(result[2]?.value).toBe(25) // avg(20, 30)
  })

  it('skips nulls within the window instead of propagating them', () => {
    const series = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: null },
      { date: '2024-01-03', value: 30 },
    ]
    const result = rollingAverage(series, 3)
    expect(result[2]?.value).toBe(20) // avg(10, 30), null skipped
  })

  it('returns null when every value in the window is null', () => {
    const series = [{ date: '2024-01-01', value: null }]
    expect(rollingAverage(series, 3)[0]?.value).toBeNull()
  })
})
