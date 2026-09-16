import Dexie, { type EntityTable } from 'dexie'
import type { AthleteProfile } from '../types/profile'
import type { Cycle, JournalEntry, Sleep, Workout } from '../types/whoop'

export class WhoopDb extends Dexie {
  cycles!: EntityTable<Cycle, 'id'>
  sleeps!: EntityTable<Sleep, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  journalEntries!: EntityTable<JournalEntry, 'id'>
  /** Single row (id: 'default') — Athletic Level profile/preferences, not imported WHOOP data. */
  profile!: EntityTable<AthleteProfile, 'id'>

  constructor() {
    super('whoopity')
    this.version(1).stores({
      cycles: 'id, date',
      sleeps: 'id, date',
      workouts: 'id, date, sport',
      journalEntries: 'id, date, questionText',
    })
    this.version(2).stores({
      profile: 'id',
    })
  }
}

export const db = new WhoopDb()
