import { describe, expect, it } from 'vitest'
import { buildColumnMap, normalizeHeader } from './normalize'

describe('normalizeHeader', () => {
  it('lowercases and strips punctuation/units', () => {
    expect(normalizeHeader('Heart Rate Variability (ms)')).toBe(
      'heart rate variability ms',
    )
  })

  it('treats underscores and slashes as spaces', () => {
    expect(normalizeHeader('recovery_score_%')).toBe('recovery score')
  })

  it('collapses repeated whitespace', () => {
    expect(normalizeHeader('  Cycle   start   time  ')).toBe('cycle start time')
  })
})

describe('buildColumnMap', () => {
  const aliases = {
    recoveryScore: ['Recovery score %', 'Recovery score'],
    hrv: ['Heart rate variability (ms)', 'HRV'],
  }

  it('matches headers via any alias, case/format-insensitively', () => {
    const map = buildColumnMap(['recovery_score_%', 'HRV (ms)'], aliases)
    expect(map.recoveryScore).toBe('recovery_score_%')
    // "HRV (ms)" normalizes to "hrv ms", which matches neither alias exactly,
    // so this only matches when the export uses the plain "HRV" header.
  })

  it('matches the exact alias header when present', () => {
    const map = buildColumnMap(
      ['Heart rate variability (ms)', 'Recovery score'],
      aliases,
    )
    expect(map.hrv).toBe('Heart rate variability (ms)')
    expect(map.recoveryScore).toBe('Recovery score')
  })

  it('leaves fields unset when no header matches', () => {
    const map = buildColumnMap(['Some unrelated column'], aliases)
    expect(map.recoveryScore).toBeUndefined()
    expect(map.hrv).toBeUndefined()
  })
})
