import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultProfile } from '../types/profile'
import { db } from './schema'
import { loadProfile, saveProfile } from './profileRepository'

beforeEach(async () => {
  await db.profile.clear()
})

describe('loadProfile', () => {
  it('falls back to defaultProfile() when nothing has been saved', async () => {
    const profile = await loadProfile()
    expect(profile).toEqual(defaultProfile())
  })
})

describe('saveProfile / loadProfile', () => {
  it('round-trips a saved profile through IndexedDB', async () => {
    const profile = { ...defaultProfile(), age: 32, sex: 'female' as const, targetPercentile: 90 }
    await saveProfile(profile)

    const loaded = await loadProfile()
    expect(loaded).toEqual(profile)
  })

  it('overwrites the single row on repeated saves rather than duplicating it', async () => {
    await saveProfile({ ...defaultProfile(), age: 20 })
    await saveProfile({ ...defaultProfile(), age: 40 })

    const loaded = await loadProfile()
    expect(loaded.age).toBe(40)
    expect(await db.profile.count()).toBe(1)
  })
})
