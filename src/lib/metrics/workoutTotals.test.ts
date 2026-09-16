import { describe, expect, it } from 'vitest'
import type { Workout } from '../../types/whoop'
import { totalsBySport, weeklyStrainVolume } from './workoutTotals'

function makeWorkout(overrides: Partial<Workout>): Workout {
  return {
    id: `${overrides.sport ?? 'x'}:${overrides.date ?? '2024-01-01'}`,
    date: '2024-01-01',
    sport: 'Running',
    start: '2024-01-01T08:00:00.000Z',
    end: '2024-01-01T09:00:00.000Z',
    durationMinutes: 60,
    strain: 10,
    averageHeartRate: 140,
    maxHeartRate: 160,
    energyExpended: 500,
    distanceMeters: null,
    altitudeGainMeters: null,
    zones: {
      zone1Minutes: null,
      zone2Minutes: null,
      zone3Minutes: null,
      zone4Minutes: null,
      zone5Minutes: null,
    },
    ...overrides,
  }
}

describe('totalsBySport', () => {
  it('aggregates count, duration, and strain per sport, sorted by strain desc', () => {
    const workouts = [
      makeWorkout({ sport: 'Running', durationMinutes: 30, strain: 8 }),
      makeWorkout({ sport: 'Running', durationMinutes: 45, strain: 10 }),
      makeWorkout({ sport: 'Yoga', durationMinutes: 60, strain: 3, averageHeartRate: 90 }),
    ]
    const totals = totalsBySport(workouts)
    expect(totals[0]).toMatchObject({ sport: 'Running', count: 2, totalStrain: 18 })
    expect(totals[1]).toMatchObject({ sport: 'Yoga', count: 1, totalStrain: 3 })
  })
})

describe('weeklyStrainVolume', () => {
  it('buckets workouts into ISO weeks starting Monday', () => {
    const workouts = [
      makeWorkout({ date: '2024-01-01', strain: 5 }), // Monday
      makeWorkout({ date: '2024-01-03', strain: 5 }), // same week
      makeWorkout({ date: '2024-01-08', strain: 7 }), // next Monday
    ]
    const weeks = weeklyStrainVolume(workouts)
    expect(weeks).toEqual([
      { weekStart: '2024-01-01', totalStrain: 10, workoutCount: 2 },
      { weekStart: '2024-01-08', totalStrain: 7, workoutCount: 1 },
    ])
  })
})
