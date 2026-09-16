import { describe, expect, it } from 'vitest'
import { detectFileType } from './detectFileType'

describe('detectFileType', () => {
  it('recognizes the standard WHOOP export filenames', () => {
    expect(detectFileType('physiological_cycles.csv')).toBe('cycles')
    expect(detectFileType('sleeps.csv')).toBe('sleeps')
    expect(detectFileType('workouts.csv')).toBe('workouts')
    expect(detectFileType('journal_entries.csv')).toBe('journal')
  })

  it('is tolerant of casing and minor naming variations', () => {
    expect(detectFileType('Physiological-Cycles.CSV')).toBe('cycles')
    expect(detectFileType('sleep.csv')).toBe('sleeps')
    expect(detectFileType('Workout.csv')).toBe('workouts')
    expect(detectFileType('journal.csv')).toBe('journal')
  })

  it('returns null for unrecognized filenames', () => {
    expect(detectFileType('random_export.csv')).toBeNull()
  })
})
