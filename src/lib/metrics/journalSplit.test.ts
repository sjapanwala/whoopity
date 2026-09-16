import { describe, expect, it } from 'vitest'
import type { Cycle, JournalEntry } from '../../types/whoop'
import { splitRecoveryByJournalAnswer } from './journalSplit'

function makeCycle(date: string, recoveryScore: number): Cycle {
  return {
    id: date,
    date,
    cycleStart: `${date}T06:00:00.000Z`,
    cycleEnd: null,
    strain: null,
    recoveryScore,
    recoveryZone: null,
    restingHeartRate: null,
    hrvMs: null,
    energyExpended: null,
    skinTempCelsius: null,
    respiratoryRate: null,
    spo2Percent: null,
  }
}

function makeEntry(date: string, answer: boolean): JournalEntry {
  return { id: `${date}:q`, date, questionText: 'Consumed alcohol', answer }
}

describe('splitRecoveryByJournalAnswer', () => {
  it('averages next-day recovery separately for yes vs no answers', () => {
    const journalEntries = [
      makeEntry('2024-01-01', true), // -> recovery on 01-02
      makeEntry('2024-01-02', false), // -> recovery on 01-03
      makeEntry('2024-01-03', true), // -> recovery on 01-04
    ]
    const cycles = [
      makeCycle('2024-01-02', 40),
      makeCycle('2024-01-03', 90),
      makeCycle('2024-01-04', 60),
    ]

    const [result] = splitRecoveryByJournalAnswer(journalEntries, cycles)
    expect(result?.questionText).toBe('Consumed alcohol')
    expect(result?.yesAvgRecovery).toBe(50) // avg(40, 60)
    expect(result?.yesSampleSize).toBe(2)
    expect(result?.noAvgRecovery).toBe(90)
    expect(result?.noSampleSize).toBe(1)
  })

  it('ignores entries with no matching next-day cycle', () => {
    const journalEntries = [makeEntry('2024-01-01', true)]
    const result = splitRecoveryByJournalAnswer(journalEntries, [])
    expect(result).toEqual([])
  })

  it('ignores non-boolean answers', () => {
    const entries: JournalEntry[] = [
      { id: '1', date: '2024-01-01', questionText: 'Mood', answer: 'good' },
    ]
    const cycles = [makeCycle('2024-01-02', 70)]
    expect(splitRecoveryByJournalAnswer(entries, cycles)).toEqual([])
  })
})
