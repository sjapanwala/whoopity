import { describe, expect, it } from 'vitest'
import { buildHeatmapWeeks } from './heatmapGrid'

describe('buildHeatmapWeeks', () => {
  it('pads to full Sunday-start weeks and fills in known values', () => {
    // 2024-01-01 is a Monday, 2024-01-07 is a Sunday.
    const series = [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-07', value: 80 },
    ]
    const weeks = buildHeatmapWeeks(series, '2024-01-01', '2024-01-07')

    expect(weeks).toHaveLength(2) // week containing Jan 1, plus week starting Jan 7
    expect(weeks[0]).toHaveLength(7)
    expect(weeks[0]?.[1]).toEqual({ date: '2024-01-01', value: 50 }) // Monday = index 1
    expect(weeks[1]?.[0]).toEqual({ date: '2024-01-07', value: 80 }) // Sunday = index 0
  })

  it('fills unknown dates with null values', () => {
    const weeks = buildHeatmapWeeks([], '2024-01-01', '2024-01-01')
    const allCells = weeks.flat()
    expect(allCells.every((c) => c.value === null)).toBe(true)
  })
})
