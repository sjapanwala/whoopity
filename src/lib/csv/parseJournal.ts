import type { JournalEntry } from '../../types/whoop'
import { JOURNAL_ALIASES } from './aliases'
import { buildColumnMap } from './normalize'
import { parseBooleanOrNull, parseTimestampOrNull, toLocalDateKey } from './values'

function normalizeAnswer(raw: string | undefined): boolean | string | number | null {
  if (raw === undefined) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const bool = parseBooleanOrNull(trimmed)
  if (bool !== null) return bool
  const num = Number(trimmed)
  if (Number.isFinite(num) && trimmed !== '') return num
  return trimmed
}

/** Parses PapaParse row objects from journal_entries.csv into JournalEntries. */
export function parseJournalRows(
  rows: Record<string, string>[],
  headers: string[],
): JournalEntry[] {
  const cols = buildColumnMap(headers, JOURNAL_ALIASES)
  const entries: JournalEntry[] = []

  rows.forEach((row, index) => {
    const cycleStart = cols.cycleStart
      ? parseTimestampOrNull(row[cols.cycleStart])
      : null
    if (cycleStart === null) return

    const rawQuestionText = cols.questionText ? row[cols.questionText] : undefined
    const questionText = rawQuestionText ? rawQuestionText : null
    if (questionText === null) return

    const rawId = cols.id ? row[cols.id] : undefined
    const id = rawId ? rawId : `journal:${cycleStart}:${questionText}:${index}`

    entries.push({
      id,
      date: toLocalDateKey(cycleStart),
      questionText,
      answer: cols.answeredYes ? normalizeAnswer(row[cols.answeredYes]) : null,
    })
  })

  return entries
}
