import { describe, expect, it } from 'vitest'
import type { Sleep } from '../../types/whoop'
import { bedtimeMinutesFromNoon, bedtimeSpreadMinutes, scheduleSeries, wakeMinutesFromMidnight } from './sleepSchedule'

function makeSleep(overrides: Partial<Sleep> & { start: string; end: string }): Sleep {
  return {
    id: overrides.start,
    date: overrides.start.slice(0, 10),
    type: 'sleep',
    performancePercent: null,
    efficiencyPercent: null,
    consistencyPercent: null,
    respiratoryRate: null,
    stages: { awakeMinutes: null, lightMinutes: null, remMinutes: null, deepMinutes: null },
    timeInBedMinutes: null,
    sleepNeedMinutes: null,
    sleepDebtMinutes: null,
    disturbanceCount: null,
    ...overrides,
  }
}

// Local (no "Z") timestamps so getHours()/getMinutes() below are
// deterministic regardless of the test runner's timezone.

describe('bedtimeMinutesFromNoon', () => {
  it('measures an evening bedtime as minutes after noon', () => {
    expect(bedtimeMinutesFromNoon('2024-01-01T21:30:00')).toBe(9 * 60 + 30)
  })

  it('measures a past-midnight bedtime as continuing past 24:00', () => {
    expect(bedtimeMinutesFromNoon('2024-01-02T01:15:00')).toBe(13 * 60 + 15)
  })
})

describe('wakeMinutesFromMidnight', () => {
  it('measures wake time as minutes since midnight', () => {
    expect(wakeMinutesFromMidnight('2024-01-02T06:45:00')).toBe(6 * 60 + 45)
  })
})

describe('scheduleSeries', () => {
  it('only includes full sleeps, not naps', () => {
    const sleeps: Sleep[] = [
      {
        id: 's1',
        date: '2024-01-01',
        type: 'sleep',
        start: '2024-01-01T22:00:00',
        end: '2024-01-02T06:00:00',
        performancePercent: null,
        efficiencyPercent: null,
        consistencyPercent: null,
        respiratoryRate: null,
        stages: { awakeMinutes: null, lightMinutes: null, remMinutes: null, deepMinutes: null },
        timeInBedMinutes: null,
        sleepNeedMinutes: null,
        sleepDebtMinutes: null,
        disturbanceCount: null,
      },
      {
        id: 'n1',
        date: '2024-01-01',
        type: 'nap',
        start: '2024-01-01T14:00:00',
        end: '2024-01-01T14:30:00',
        performancePercent: null,
        efficiencyPercent: null,
        consistencyPercent: null,
        respiratoryRate: null,
        stages: { awakeMinutes: null, lightMinutes: null, remMinutes: null, deepMinutes: null },
        timeInBedMinutes: null,
        sleepNeedMinutes: null,
        sleepDebtMinutes: null,
        disturbanceCount: null,
      },
    ]
    const series = scheduleSeries(sleeps)
    expect(series).toHaveLength(1)
    expect(series[0]?.date).toBe('2024-01-01')
  })
})

describe('bedtimeSpreadMinutes', () => {
  it('returns null with no nights', () => {
    expect(bedtimeSpreadMinutes([])).toBeNull()
  })

  it('returns 0 for an identical bedtime every night', () => {
    const sleeps = [
      makeSleep({ start: '2024-01-01T22:00:00', end: '2024-01-02T06:00:00' }),
      makeSleep({ start: '2024-01-02T22:00:00', end: '2024-01-03T06:00:00' }),
    ]
    expect(bedtimeSpreadMinutes(sleeps)).toBe(0)
  })

  it('computes the population standard deviation of bedtime', () => {
    const sleeps = [
      makeSleep({ start: '2024-01-01T21:00:00', end: '2024-01-02T05:00:00' }),
      makeSleep({ start: '2024-01-02T23:00:00', end: '2024-01-03T05:00:00' }),
    ]
    expect(bedtimeSpreadMinutes(sleeps)).toBeCloseTo(60)
  })

  it('ignores naps', () => {
    const sleeps = [
      makeSleep({ start: '2024-01-01T22:00:00', end: '2024-01-02T06:00:00' }),
      makeSleep({ start: '2024-01-01T14:00:00', end: '2024-01-01T14:30:00', type: 'nap' }),
    ]
    expect(bedtimeSpreadMinutes(sleeps)).toBe(0)
  })
})
