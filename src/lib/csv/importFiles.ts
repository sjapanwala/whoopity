import { emptyDataset, type WhoopDataset } from '../../types/whoop'
import { importCsvFiles } from './importDataset'
import { importZipFile } from './importZip'
import type { ImportResult } from './importDataset'

function mergeInto(target: WhoopDataset, source: WhoopDataset): void {
  target.cycles.push(...source.cycles)
  target.sleeps.push(...source.sleeps)
  target.workouts.push(...source.workouts)
  target.journalEntries.push(...source.journalEntries)
}

/**
 * Entry point for the import UI: accepts any mix of a WHOOP export .zip
 * and/or loose CSV files (e.g. from drag-and-drop) and merges the result.
 */
export async function importFiles(files: File[]): Promise<ImportResult> {
  const zipFiles = files.filter((f) => f.name.toLowerCase().endsWith('.zip'))
  const csvFiles = files.filter((f) => f.name.toLowerCase().endsWith('.csv'))

  const dataset = emptyDataset()
  const warnings: string[] = []

  for (const zipFile of zipFiles) {
    const result = await importZipFile(zipFile)
    mergeInto(dataset, result.dataset)
    warnings.push(...result.warnings)
  }

  if (csvFiles.length > 0) {
    const result = await importCsvFiles(csvFiles)
    mergeInto(dataset, result.dataset)
    warnings.push(...result.warnings)
  }

  const unrecognized = files.filter(
    (f) => !f.name.toLowerCase().endsWith('.zip') && !f.name.toLowerCase().endsWith('.csv'),
  )
  for (const file of unrecognized) {
    warnings.push(`Skipped "${file.name}": not a .csv or .zip file.`)
  }

  return { dataset, warnings }
}
