import Papa from 'papaparse'
import { emptyDataset, type WhoopDataset } from '../../types/whoop'
import { detectFileType } from './detectFileType'
import { parseCycleRows } from './parseCycles'
import { parseJournalRows } from './parseJournal'
import { parseSleepRows } from './parseSleeps'
import { parseWorkoutRows } from './parseWorkouts'

export interface ImportResult {
  dataset: WhoopDataset
  /** Human-readable problems worth surfacing (unrecognized file, empty file). */
  warnings: string[]
}

function mergeInto(target: WhoopDataset, source: Partial<WhoopDataset>): void {
  if (source.cycles) target.cycles.push(...source.cycles)
  if (source.sleeps) target.sleeps.push(...source.sleeps)
  if (source.workouts) target.workouts.push(...source.workouts)
  if (source.journalEntries) target.journalEntries.push(...source.journalEntries)
}

/** Parses one CSV file's text content given its filename (used to route by type). */
export function parseCsvText(
  fileName: string,
  text: string,
): { data: Partial<WhoopDataset>; warning: string | null } {
  const type = detectFileType(fileName)
  if (type === null) {
    return { data: {}, warning: `Skipped "${fileName}": couldn't tell which WHOOP export file this is.` }
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })
  const headers = parsed.meta.fields ?? []
  if (headers.length === 0 || parsed.data.length === 0) {
    return { data: {}, warning: `"${fileName}" had no rows to import.` }
  }

  switch (type) {
    case 'cycles':
      return { data: { cycles: parseCycleRows(parsed.data, headers) }, warning: null }
    case 'sleeps':
      return { data: { sleeps: parseSleepRows(parsed.data, headers) }, warning: null }
    case 'workouts':
      return { data: { workouts: parseWorkoutRows(parsed.data, headers) }, warning: null }
    case 'journal':
      return {
        data: { journalEntries: parseJournalRows(parsed.data, headers) },
        warning: null,
      }
  }
}

/** Parses a set of already-extracted CSV files (drag-and-drop of loose CSVs). */
export async function importCsvFiles(files: File[]): Promise<ImportResult> {
  const dataset = emptyDataset()
  const warnings: string[] = []

  for (const file of files) {
    const text = await file.text()
    const { data, warning } = parseCsvText(file.name, text)
    if (warning) warnings.push(warning)
    mergeInto(dataset, data)
  }

  return { dataset, warnings }
}
