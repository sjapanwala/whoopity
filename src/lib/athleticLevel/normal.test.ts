import { describe, expect, it } from 'vitest'
import { inverseNormalCdf, normalCdf } from './normal'

describe('normalCdf', () => {
  it('is 0.5 at z=0', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6)
  })

  it('matches known quantiles', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3)
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3)
    expect(normalCdf(1.959964)).toBeCloseTo(0.975, 3)
    expect(normalCdf(-1.959964)).toBeCloseTo(0.025, 3)
  })
})

describe('inverseNormalCdf', () => {
  it('is 0 at p=0.5', () => {
    expect(inverseNormalCdf(0.5)).toBeCloseTo(0, 6)
  })

  it('matches known quantiles', () => {
    expect(inverseNormalCdf(0.8413)).toBeCloseTo(1, 2)
    expect(inverseNormalCdf(0.975)).toBeCloseTo(1.959964, 3)
    expect(inverseNormalCdf(0.025)).toBeCloseTo(-1.959964, 3)
  })

  it('returns +/-Infinity at the boundaries', () => {
    expect(inverseNormalCdf(0)).toBe(-Infinity)
    expect(inverseNormalCdf(1)).toBe(Infinity)
  })
})

describe('round-trip', () => {
  it('normalCdf(inverseNormalCdf(p)) recovers p across the range', () => {
    for (const p of [0.001, 0.01, 0.1, 0.3, 0.5, 0.7, 0.9, 0.99, 0.999]) {
      expect(normalCdf(inverseNormalCdf(p))).toBeCloseTo(p, 6)
    }
  })
})
