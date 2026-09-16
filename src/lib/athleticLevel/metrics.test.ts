import { describe, expect, it } from 'vitest'
import { emptyDataset, type Cycle, type Sleep, type Workout } from '../../types/whoop'
import { computeCurrentValues } from './metrics'

function makeCycle(overrides: Partial<Cycle> & { date: string }): Cycle {
  return {
    id: overrides.date,
    cycleStart: `${overrides.date}T07:00:00`,
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

function makeSleep(overrides: Partial<Sleep> & { date: string }): Sleep {
  return {
    id: overrides.date,
    type: 'sleep',
    start: `${overrides.date}T22:00:00`,
    end: `${overrides.date}T06:00:00`,
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

function makeWorkout(overrides: Partial<Workout> & { date: string }): Workout {
  return {
    id: `${overrides.date}-${overrides.sport ?? 'w'}`,
    sport: 'Running',
    start: `${overrides.date}T07:00:00`,
    end: `${overrides.date}T08:00:00`,
    durationMinutes: 60,
    strain: null,
    averageHeartRate: null,
    maxHeartRate: null,
    energyExpended: null,
    distanceMeters: null,
    altitudeGainMeters: null,
    zones: { zone1Minutes: null, zone2Minutes: null, zone3Minutes: null, zone4Minutes: null, zone5Minutes: null },
    ...overrides,
  }
}

describe('computeCurrentValues', () => {
  it('returns all nulls with no cycles', () => {
    expect(computeCurrentValues(emptyDataset())).toEqual({
      hrv: null,
      restingHeartRate: null,
      recoveryConsistency: null,
      sleepPerformance: null,
      trainingLoad: null,
    })
  })

  it('averages HRV and resting heart rate over the last 90 days', () => {
    const dataset = {
      ...emptyDataset(),
      cycles: [
        makeCycle({ date: '2024-05-01', hrvMs: 50, restingHeartRate: 60 }),
        makeCycle({ date: '2024-05-02', hrvMs: 70, restingHeartRate: 50 }),
      ],
    }
    const result = computeCurrentValues(dataset)
    expect(result.hrv).toBeCloseTo(60)
    expect(result.restingHeartRate).toBeCloseTo(55)
  })

  it('computes recovery consistency as the share of green-zone days', () => {
    const dataset = {
      ...emptyDataset(),
      cycles: [
        makeCycle({ date: '2024-05-01', recoveryScore: 80, recoveryZone: 'green' }),
        makeCycle({ date: '2024-05-02', recoveryScore: 50, recoveryZone: 'yellow' }),
        makeCycle({ date: '2024-05-03', recoveryScore: 80, recoveryZone: 'green' }),
        makeCycle({ date: '2024-05-04', recoveryScore: 20, recoveryZone: 'red' }),
      ],
    }
    expect(computeCurrentValues(dataset).recoveryConsistency).toBeCloseTo(50)
  })

  it('averages sleep performance over the last 30 nights, anchored to the latest cycle', () => {
    const dataset = {
      ...emptyDataset(),
      cycles: [makeCycle({ date: '2024-05-01' })],
      sleeps: [
        makeSleep({ date: '2024-04-30', performancePercent: 90 }),
        makeSleep({ date: '2024-04-29', performancePercent: 70 }),
        // A nap on the same night shouldn't count.
        makeSleep({ date: '2024-04-29', type: 'nap', performancePercent: 10 }),
      ],
    }
    expect(computeCurrentValues(dataset).sleepPerformance).toBeCloseTo(80)
  })

  it('averages weekly strain volume for training load', () => {
    const dataset = {
      ...emptyDataset(),
      cycles: [makeCycle({ date: '2024-05-20' })],
      workouts: [
        makeWorkout({ date: '2024-05-06', strain: 10 }), // week of May 6
        makeWorkout({ date: '2024-05-13', strain: 20 }), // week of May 13
      ],
    }
    expect(computeCurrentValues(dataset).trainingLoad).toBeCloseTo(15)
  })
})
