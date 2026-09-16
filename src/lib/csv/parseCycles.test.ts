import { describe, expect, it } from 'vitest'
import { parseCycleRows } from './parseCycles'

describe('parseCycleRows', () => {
  const headers = [
    'Cycle id',
    'Cycle start time',
    'Cycle end time',
    'Recovery score %',
    'Resting heart rate (bpm)',
    'Heart rate variability (ms)',
    'Day Strain',
    'Blood oxygen %',
  ]

  it('maps a well-formed row into a Cycle', () => {
    const rows = [
      {
        'Cycle id': 'c1',
        'Cycle start time': '2024-05-01T07:00:00.000Z',
        'Cycle end time': '2024-05-02T07:00:00.000Z',
        'Recovery score %': '72',
        'Resting heart rate (bpm)': '52',
        'Heart rate variability (ms)': '65',
        'Day Strain': '14.2',
        'Blood oxygen %': '97',
      },
    ]

    const [cycle] = parseCycleRows(rows, headers)
    expect(cycle).toMatchObject({
      id: 'c1',
      cycleStart: '2024-05-01T07:00:00.000Z',
      recoveryScore: 72,
      recoveryZone: 'green',
      restingHeartRate: 52,
      hrvMs: 65,
      strain: 14.2,
      spo2Percent: 97,
    })
  })

  it('buckets recovery score into the right zone', () => {
    const rowFor = (score: string) => ({
      'Cycle id': 'x',
      'Cycle start time': '2024-05-01T07:00:00.000Z',
      'Recovery score %': score,
    })

    expect(parseCycleRows([rowFor('80')], headers)[0]?.recoveryZone).toBe('green')
    expect(parseCycleRows([rowFor('50')], headers)[0]?.recoveryZone).toBe('yellow')
    expect(parseCycleRows([rowFor('20')], headers)[0]?.recoveryZone).toBe('red')
  })

  it('leaves missing fields null instead of throwing', () => {
    const sparseHeaders = ['Cycle start time']
    const rows = [{ 'Cycle start time': '2024-05-01T07:00:00.000Z' }]

    const [cycle] = parseCycleRows(rows, sparseHeaders)
    expect(cycle?.recoveryScore).toBeNull()
    expect(cycle?.hrvMs).toBeNull()
    expect(cycle?.strain).toBeNull()
  })

  it('skips rows with no parseable cycle start', () => {
    const rows = [{ 'Cycle start time': 'garbage' }]
    expect(parseCycleRows(rows, headers)).toHaveLength(0)
  })

  it('synthesizes a stable id when no id column is present', () => {
    const sparseHeaders = ['Cycle start time']
    const rows = [{ 'Cycle start time': '2024-05-01T07:00:00.000Z' }]
    const [cycle] = parseCycleRows(rows, sparseHeaders)
    expect(cycle?.id).toContain('2024-05-01')
  })
})
