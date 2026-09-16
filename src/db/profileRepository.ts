import { db } from './schema'
import { defaultProfile, type AthleteProfile } from '../types/profile'

/** Falls back to defaultProfile() when nothing has been saved yet. */
export async function loadProfile(): Promise<AthleteProfile> {
  const stored = await db.profile.get('default')
  return stored ?? defaultProfile()
}

export async function saveProfile(profile: AthleteProfile): Promise<void> {
  await db.profile.put(profile)
}
