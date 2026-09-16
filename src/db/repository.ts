import { db } from './schema'
import type { WhoopDataset } from '../types/whoop'

/**
 * Upserts an imported dataset into IndexedDB. Records share a primary key
 * (`id`) with whatever's already stored — either a WHOOP-native id column
 * or one synthesized from the record's start timestamp (see src/lib/csv) —
 * so re-importing an overlapping export replaces matching rows in place
 * rather than duplicating them.
 */
export async function saveDataset(dataset: WhoopDataset): Promise<void> {
  await db.transaction(
    'rw',
    [db.cycles, db.sleeps, db.workouts, db.journalEntries],
    async () => {
      if (dataset.cycles.length > 0) await db.cycles.bulkPut(dataset.cycles)
      if (dataset.sleeps.length > 0) await db.sleeps.bulkPut(dataset.sleeps)
      if (dataset.workouts.length > 0) await db.workouts.bulkPut(dataset.workouts)
      if (dataset.journalEntries.length > 0) {
        await db.journalEntries.bulkPut(dataset.journalEntries)
      }
    },
  )
}

export async function loadDataset(): Promise<WhoopDataset> {
  const [cycles, sleeps, workouts, journalEntries] = await Promise.all([
    db.cycles.toArray(),
    db.sleeps.toArray(),
    db.workouts.toArray(),
    db.journalEntries.toArray(),
  ])
  return { cycles, sleeps, workouts, journalEntries }
}

export async function hasAnyData(): Promise<boolean> {
  const cycleCount = await db.cycles.limit(1).count()
  if (cycleCount > 0) return true
  const sleepCount = await db.sleeps.limit(1).count()
  if (sleepCount > 0) return true
  const workoutCount = await db.workouts.limit(1).count()
  if (workoutCount > 0) return true
  const journalCount = await db.journalEntries.limit(1).count()
  return journalCount > 0
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.cycles, db.sleeps, db.workouts, db.journalEntries],
    async () => {
      await Promise.all([
        db.cycles.clear(),
        db.sleeps.clear(),
        db.workouts.clear(),
        db.journalEntries.clear(),
      ])
    },
  )
}

export async function exportDatasetAsJson(): Promise<string> {
  const dataset = await loadDataset()
  return JSON.stringify(dataset, null, 2)
}
