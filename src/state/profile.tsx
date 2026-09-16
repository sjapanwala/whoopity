import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadProfile, saveProfile } from '../db/profileRepository'
import { defaultProfile, type AthleteProfile } from '../types/profile'

interface ProfileContextValue {
  profile: AthleteProfile
  ready: boolean
  updateProfile: (patch: Partial<AthleteProfile>) => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AthleteProfile>(defaultProfile)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadProfile().then((loaded) => {
      if (cancelled) return
      setProfile(loaded)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<AthleteProfile>) => {
      const next = { ...profile, ...patch }
      setProfile(next)
      await saveProfile(next)
    },
    [profile],
  )

  return <ProfileContext.Provider value={{ profile, ready, updateProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
