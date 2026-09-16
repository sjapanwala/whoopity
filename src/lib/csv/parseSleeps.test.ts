import { describe, expect, it } from 'vitest'
import { parseSleepRows } from './parseSleeps'

const headers = [
  'Sleep id',
  'Sleep onset',
  'Wake onset',
  'Nap',
  'Sleep performance %',
  'Sleep efficiency %',
  'Light sleep duration (min)',
  'Deep (SWS) duration (min)',
  'REM duration (min)',
  'Awake duration (min)',
  'Sleep need (min)',
  'Sleep debt (min)',
]

describe('parseSleepRows', () => {
  it('maps a well-formed row into a Sleep', () => {
    const rows = [
      {
        'Sleep id': 's1',
        'Sleep onset': '2024-05-01T23:15:00.000Z',
        'Wake onset': '2024-05-02T07:00:00.000Z',
        Nap: 'false',
        'Sleep performance %': '88',
        'Sleep efficiency %': '95',
        'Light sleep duration (min)': '210',
        'Deep (SWS) duration (min)': '90',
        'REM duration (min)': '105',
        'Awake duration (min)': '10',
        'Sleep need (min)': '480',
        'Sleep debt (min)': '15',
      },
    ]

    const [sleep] = parseSleepRows(rows, headers)
    expect(sleep).toMatchObject({
      id: 's1',
      type: 'sleep',
      performancePercent: 88,
      efficiencyPercent: 95,
      sleepNeedMinutes: 480,
      sleepDebtMinutes: 15,
    })
    expect(sleep?.stages).toMatchObject({
      lightMinutes: 210,
      deepMinutes: 90,
      remMinutes: 105,
      awakeMinutes: 10,
    })
  })

  it('flags naps distinctly from full sleeps', () => {
    const rows = [
      {
        'Sleep onset': '2024-05-01T14:00:00.000Z',
        'Wake onset': '2024-05-01T14:30:00.000Z',
        Nap: 'true',
      },
    ]
    const [sleep] = parseSleepRows(rows, headers)
    expect(sleep?.type).toBe('nap')
  })

  it('skips rows missing onset or wake time', () => {
    const rows = [{ 'Sleep onset': '2024-05-01T14:00:00.000Z' }]
    expect(parseSleepRows(rows, headers)).toHaveLength(0)
  })
})
