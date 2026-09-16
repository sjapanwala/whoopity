import type { Cycle, JournalEntry } from '../../types/whoop'
import { addDaysToKey } from './dateKey'

export interface JournalSplitResult {
  questionText: string
  yesAvgRecovery: number | null
  yesSampleSize: number
  noAvgRecovery: number | null
  noSampleSize: number
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : null
}

/**
 * For each yes/no journal question, compares the average recovery score on
 * the morning after a "yes" vs. the morning after a "no" — a journal entry
 * logged on day D reflects behavior during cycle D, whose physiological
 * effect shows up in cycle D+1's recovery (computed from that night's sleep).
 */
export function splitRecoveryByJournalAnswer(
  journalEntries: JournalEntry[],
  cycles: Cycle[],
): JournalSplitResult[] {
  const recoveryByDate = new Map(
    cycles.filter((c) => c.recoveryScore !== null).map((c) => [c.date, c.recoveryScore as number]),
  )

  const byQuestion = new Map<string, { yes: number[]; no: number[] }>()
  for (const entry of journalEntries) {
    if (typeof entry.answer !== 'boolean') continue
    const recovery = recoveryByDate.get(addDaysToKey(entry.date, 1))
    if (recovery === undefined) continue

    const bucket = byQuestion.get(entry.questionText) ?? { yes: [], no: [] }
    if (entry.answer) bucket.yes.push(recovery)
    else bucket.no.push(recovery)
    byQuestion.set(entry.questionText, bucket)
  }

  return Array.from(byQuestion.entries()).map(([questionText, { yes, no }]) => ({
    questionText,
    yesAvgRecovery: average(yes),
    yesSampleSize: yes.length,
    noAvgRecovery: average(no),
    noSampleSize: no.length,
  }))
}
