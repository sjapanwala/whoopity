import { describe, expect, it } from 'vitest'
import { addDaysToKey } from './dateKey'

describe('addDaysToKey', () => {
  it('adds days within a month', () => {
    expect(addDaysToKey('2024-01-01', 1)).toBe('2024-01-02')
  })

  it('rolls over month and year boundaries', () => {
    expect(addDaysToKey('2024-01-31', 1)).toBe('2024-02-01')
    expect(addDaysToKey('2024-12-31', 1)).toBe('2025-01-01')
  })

  it('supports negative offsets', () => {
    expect(addDaysToKey('2024-03-01', -1)).toBe('2024-02-29') // 2024 is a leap year
  })
})
