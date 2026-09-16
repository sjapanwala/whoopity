import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { emptyDataset, type Cycle } from '../types/whoop'
import { db } from './schema'
import {
  clearAllData,
  exportDatasetAsJson,
  hasAnyData,
  loadDataset,
  saveDataset,
} from './repository'

function makeCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id: 'c1',
    date: '2024-05-01',
    cycleStart: '2024-05-01T07:00:00.000Z',
    cycleEnd: '2024-05-02T07:00:00.000Z',
    strain: 10,
    recoveryScore: 70,
    recoveryZone: 'green',
    restingHeartRate: 55,
    hrvMs: 60,
    energyExpended: 2000,
    skinTempCelsius: null,
    respiratoryRate: null,
    spo2Percent: null,
    ...overrides,
  }
}

beforeEach(async () => {
  await db.cycles.clear()
  await db.sleeps.clear()
  await db.workouts.clear()
  await db.journalEntries.clear()
})

describe('saveDataset / loadDataset', () => {
  it('round-trips a dataset through IndexedDB', async () => {
    const dataset = emptyDataset()
    dataset.cycles.push(makeCycle())

    await saveDataset(dataset)
    const loaded = await loadDataset()

    expect(loaded.cycles).toHaveLength(1)
    expect(loaded.cycles[0]).toMatchObject({ id: 'c1', recoveryScore: 70 })
  })

  it('upserts records sharing an id instead of duplicating them', async () => {
    await saveDataset({ ...emptyDataset(), cycles: [makeCycle({ recoveryScore: 50 })] })
    await saveDataset({ ...emptyDataset(), cycles: [makeCycle({ recoveryScore: 90 })] })

    const loaded = await loadDataset()
    expect(loaded.cycles).toHaveLength(1)
    expect(loaded.cycles[0]?.recoveryScore).toBe(90)
  })

  it('keeps distinct ids as separate records', async () => {
    await saveDataset({
      ...emptyDataset(),
      cycles: [makeCycle({ id: 'c1' }), makeCycle({ id: 'c2', date: '2024-05-02' })],
    })

    const loaded = await loadDataset()
    expect(loaded.cycles).toHaveLength(2)
  })
})

describe('hasAnyData', () => {
  it('is false for an empty store and true once something is saved', async () => {
    expect(await hasAnyData()).toBe(false)
    await saveDataset({ ...emptyDataset(), cycles: [makeCycle()] })
    expect(await hasAnyData()).toBe(true)
  })
})

describe('clearAllData', () => {
  it('empties every table', async () => {
    await saveDataset({ ...emptyDataset(), cycles: [makeCycle()] })
    await clearAllData()
    expect(await hasAnyData()).toBe(false)
  })
})

describe('exportDatasetAsJson', () => {
  it('serializes the full dataset as JSON', async () => {
    await saveDataset({ ...emptyDataset(), cycles: [makeCycle()] })
    const json = await exportDatasetAsJson()
    const parsed = JSON.parse(json)
    expect(parsed.cycles).toHaveLength(1)
    expect(parsed.cycles[0].id).toBe('c1')
  })
})
