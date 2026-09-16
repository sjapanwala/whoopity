import { describe, expect, it } from 'vitest'
import {
  parseBooleanOrNull,
  parseNumberOrNull,
  parseTimestampOrNull,
  toLocalDateKey,
} from './values'

describe('parseNumberOrNull', () => {
  it('parses plain numbers', () => {
    expect(parseNumberOrNull('72')).toBe(72)
    expect(parseNumberOrNull('98.6')).toBe(98.6)
  })

  it('strips units, percent signs, and thousand separators', () => {
    expect(parseNumberOrNull('72 bpm')).toBe(72)
    expect(parseNumberOrNull('85%')).toBe(85)
    expect(parseNumberOrNull('1,234')).toBe(1234)
  })

  it('handles negative numbers', () => {
    expect(parseNumberOrNull('-3.2')).toBe(-3.2)
  })

  it('returns null for empty, undefined, or non-numeric input', () => {
    expect(parseNumberOrNull('')).toBeNull()
    expect(parseNumberOrNull(undefined)).toBeNull()
    expect(parseNumberOrNull('n/a')).toBeNull()
  })
})

describe('parseBooleanOrNull', () => {
  it('recognizes common truthy/falsy spellings', () => {
    expect(parseBooleanOrNull('true')).toBe(true)
    expect(parseBooleanOrNull('Yes')).toBe(true)
    expect(parseBooleanOrNull('1')).toBe(true)
    expect(parseBooleanOrNull('false')).toBe(false)
    expect(parseBooleanOrNull('No')).toBe(false)
    expect(parseBooleanOrNull('0')).toBe(false)
  })

  it('returns null for empty, undefined, or unrecognized input', () => {
    expect(parseBooleanOrNull('')).toBeNull()
    expect(parseBooleanOrNull(undefined)).toBeNull()
    expect(parseBooleanOrNull('maybe')).toBeNull()
  })
})

describe('parseTimestampOrNull', () => {
  it('parses ISO 8601 timestamps', () => {
    expect(parseTimestampOrNull('2024-05-01T23:15:00.000Z')).toBe(
      '2024-05-01T23:15:00.000Z',
    )
  })

  it('returns null for empty, undefined, or unparseable input', () => {
    expect(parseTimestampOrNull('')).toBeNull()
    expect(parseTimestampOrNull(undefined)).toBeNull()
    expect(parseTimestampOrNull('not a date')).toBeNull()
  })
})

describe('toLocalDateKey', () => {
  it('extracts the yyyy-MM-dd portion in local time', () => {
    const key = toLocalDateKey('2024-05-01T12:00:00.000Z')
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
