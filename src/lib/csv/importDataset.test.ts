import { describe, expect, it } from 'vitest'
import { parseCsvText } from './importDataset'

describe('parseCsvText', () => {
  it('routes physiological_cycles.csv content to the cycle parser', () => {
    const text = [
      'Cycle id,Cycle start time,Recovery score %',
      'c1,2024-05-01T07:00:00.000Z,72',
    ].join('\n')

    const { data, warning } = parseCsvText('physiological_cycles.csv', text)
    expect(warning).toBeNull()
    expect(data.cycles).toHaveLength(1)
    expect(data.cycles?.[0]).toMatchObject({ id: 'c1', recoveryScore: 72 })
  })

  it('warns and returns empty data for an unrecognized filename', () => {
    const { data, warning } = parseCsvText('mystery.csv', 'a,b\n1,2')
    expect(data).toEqual({})
    expect(warning).toContain('mystery.csv')
  })

  it('warns when a recognized file has no rows', () => {
    const { data, warning } = parseCsvText('sleeps.csv', 'Sleep onset,Wake onset\n')
    expect(data).toEqual({})
    expect(warning).toContain('no rows')
  })
})
