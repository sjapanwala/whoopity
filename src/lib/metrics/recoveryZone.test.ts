import { describe, expect, it } from 'vitest'
import { recoveryZoneFor } from './recoveryZone'

describe('recoveryZoneFor', () => {
  it('buckets scores into green/yellow/red at the WHOOP thresholds', () => {
    expect(recoveryZoneFor(97)).toBe('green')
    expect(recoveryZoneFor(67)).toBe('green')
    expect(recoveryZoneFor(66)).toBe('yellow')
    expect(recoveryZoneFor(34)).toBe('yellow')
    expect(recoveryZoneFor(33)).toBe('red')
    expect(recoveryZoneFor(0)).toBe('red')
  })

  it('returns null for null input', () => {
    expect(recoveryZoneFor(null)).toBeNull()
  })
})
