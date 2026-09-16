import { describe, expect, it } from 'vitest'
import { parseWorkoutRows } from './parseWorkouts'

const headers = [
  'Workout id',
  'Sport name',
  'Workout start time',
  'Workout end time',
  'Duration (min)',
  'Activity Strain',
  'Average HR (bpm)',
  'Max HR (bpm)',
  'Energy burned (cal)',
  'Distance (meters)',
]

describe('parseWorkoutRows', () => {
  it('maps a well-formed row into a Workout', () => {
    const rows = [
      {
        'Workout id': 'w1',
        'Sport name': 'Running',
        'Workout start time': '2024-05-01T14:00:00.000Z',
        'Workout end time': '2024-05-01T15:00:00.000Z',
        'Duration (min)': '60',
        'Activity Strain': '12.5',
        'Average HR (bpm)': '145',
        'Max HR (bpm)': '172',
        'Energy burned (cal)': '620',
        'Distance (meters)': '9800',
      },
    ]

    const [workout] = parseWorkoutRows(rows, headers)
    expect(workout).toMatchObject({
      id: 'w1',
      sport: 'Running',
      durationMinutes: 60,
      strain: 12.5,
      averageHeartRate: 145,
      maxHeartRate: 172,
      distanceMeters: 9800,
    })
  })

  it('falls back to "Unknown" sport when the column is missing', () => {
    const rows = [
      {
        'Workout start time': '2024-05-01T14:00:00.000Z',
        'Workout end time': '2024-05-01T15:00:00.000Z',
      },
    ]
    const [workout] = parseWorkoutRows(rows, headers)
    expect(workout?.sport).toBe('Unknown')
  })

  it('skips rows missing start or end time', () => {
    const rows = [{ 'Sport name': 'Running' }]
    expect(parseWorkoutRows(rows, headers)).toHaveLength(0)
  })
})
