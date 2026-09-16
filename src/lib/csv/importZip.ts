import JSZip from 'jszip'
import { emptyDataset, type WhoopDataset } from '../../types/whoop'
import { parseCsvText, type ImportResult } from './importDataset'

function mergeInto(target: WhoopDataset, source: Partial<WhoopDataset>): void {
  if (source.cycles) target.cycles.push(...source.cycles)
  if (source.sleeps) target.sleeps.push(...source.sleeps)
  if (source.workouts) target.workouts.push(...source.workouts)
  if (source.journalEntries) target.journalEntries.push(...source.journalEntries)
}

/** Extracts and parses every CSV inside a WHOOP data export .zip. */
export async function importZipFile(zipFile: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(zipFile)
  const dataset = emptyDataset()
  const warnings: string[] = []

  const csvEntries = Object.values(zip.files).filter(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.csv'),
  )

  if (csvEntries.length === 0) {
    return { dataset, warnings: ['The zip had no CSV files inside it.'] }
  }

  for (const entry of csvEntries) {
    const text = await entry.async('text')
    const fileName = entry.name.split('/').pop() ?? entry.name
    const { data, warning } = parseCsvText(fileName, text)
    if (warning) warnings.push(warning)
    mergeInto(dataset, data)
  }

  return { dataset, warnings }
}
