import { describe, expect, it } from 'vitest'
import type { Sleep } from '../../types/whoop'
import { actualSleepMinutes, summarizeSleeps } from './sleepStats'

function makeSleep(overrides: Partial<Sleep>): Sleep {
  return {
    id: 's1',
    date: '2024-01-01',
    type: 'sleep',
    start: '2024-01-01T22:00:00',
    end: '2024-01-02T06:00:00',
    performancePercent: 80,
    efficiencyPercent: 90,
    consistencyPercent: 70,
    respiratoryRate: null,
    stages: { awakeMinutes: 10, lightMinutes: 200, remMinutes: 100, deepMinutes: 90 },
    timeInBedMinutes: 400,
    sleepNeedMinutes: 460,
    sleepDebtMinutes: 60,
    disturbanceCount: null,
    ...overrides,
  }
}

describe('actualSleepMinutes', () => {
  it('sums light + rem + deep, excluding awake', () => {
    expect(actualSleepMinutes(makeSleep({}))).toBe(390)
  })

  it('returns null when all stage minutes are missing', () => {
    const sleep = makeSleep({
      stages: { awakeMinutes: null, lightMinutes: null, remMinutes: null, deepMinutes: null },
    })
    expect(actualSleepMinutes(sleep)).toBeNull()
  })

  it('treats a single missing stage as zero, not null', () => {
    const sleep = makeSleep({
      stages: { awakeMinutes: 10, lightMinutes: 200, remMinutes: null, deepMinutes: 90 },
    })
    expect(actualSleepMinutes(sleep)).toBe(290)
  })
})

describe('summarizeSleeps', () => {
  it('averages across full sleeps only, excluding naps', () => {
    const sleeps = [
      makeSleep({ performancePercent: 80 }),
      makeSleep({ performancePercent: 60 }),
      makeSleep({ type: 'nap', performancePercent: 999 }),
    ]
    expect(summarizeSleeps(sleeps).averagePerformance).toBe(70)
  })

  it('returns null averages for an empty list', () => {
    expect(summarizeSleeps([])).toEqual({
      averagePerformance: null,
      averageEfficiency: null,
      averageConsistency: null,
      averageDebtMinutes: null,
      averageNeedMinutes: null,
      averageActualMinutes: null,
    })
  })
})
