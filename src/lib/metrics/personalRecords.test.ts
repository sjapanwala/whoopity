import { describe, expect, it } from 'vitest'
import type { Cycle } from '../../types/whoop'
import { computePersonalRecords } from './personalRecords'

function makeCycle(overrides: Partial<Cycle>): Cycle {
  return {
    id: overrides.date ?? 'c',
    date: '2024-01-01',
    cycleStart: '2024-01-01T06:00:00.000Z',
    cycleEnd: null,
    strain: null,
    recoveryScore: null,
    recoveryZone: null,
    restingHeartRate: null,
    hrvMs: null,
    energyExpended: null,
    skinTempCelsius: null,
    respiratoryRate: null,
    spo2Percent: null,
    ...overrides,
  }
}

describe('computePersonalRecords', () => {
  it('finds the best HRV, lowest RHR, and best recovery with their dates', () => {
    const cycles = [
      makeCycle({ date: '2024-01-01', hrvMs: 50, restingHeartRate: 55, recoveryScore: 60 }),
      makeCycle({ date: '2024-01-02', hrvMs: 90, restingHeartRate: 48, recoveryScore: 95 }),
      makeCycle({ date: '2024-01-03', hrvMs: 70, restingHeartRate: 52, recoveryScore: 80 }),
    ]
    const records = computePersonalRecords(cycles)
    expect(records.bestHrv).toEqual({ value: 90, date: '2024-01-02' })
    expect(records.lowestRestingHeartRate).toEqual({ value: 48, date: '2024-01-02' })
    expect(records.bestRecoveryScore).toEqual({ value: 95, date: '2024-01-02' })
  })

  it('computes the longest and current green-zone streaks', () => {
    const cycles = [
      makeCycle({ date: '2024-01-01', recoveryZone: 'green' }),
      makeCycle({ date: '2024-01-02', recoveryZone: 'yellow' }),
      makeCycle({ date: '2024-01-03', recoveryZone: 'green' }),
      makeCycle({ date: '2024-01-04', recoveryZone: 'green' }),
    ]
    const records = computePersonalRecords(cycles)
    expect(records.longestGreenStreak).toBe(2)
    expect(records.currentGreenStreak).toBe(2)
  })

  it('returns nulls when there is no data', () => {
    const records = computePersonalRecords([])
    expect(records.bestHrv).toBeNull()
    expect(records.longestGreenStreak).toBe(0)
  })
})
