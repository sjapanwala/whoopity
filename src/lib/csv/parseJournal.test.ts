import { describe, expect, it } from 'vitest'
import { parseJournalRows } from './parseJournal'

const headers = ['Cycle start time', 'Question text', 'Answered yes']

describe('parseJournalRows', () => {
  it('maps a well-formed row into a JournalEntry with a boolean answer', () => {
    const rows = [
      {
        'Cycle start time': '2024-05-01T07:00:00.000Z',
        'Question text': 'Did you drink alcohol?',
        'Answered yes': 'false',
      },
    ]
    const [entry] = parseJournalRows(rows, headers)
    expect(entry).toMatchObject({
      questionText: 'Did you drink alcohol?',
      answer: false,
    })
  })

  it('skips rows without a question or a cycle date', () => {
    const rows = [{ 'Cycle start time': '2024-05-01T07:00:00.000Z' }]
    expect(parseJournalRows(rows, headers)).toHaveLength(0)
  })
})
