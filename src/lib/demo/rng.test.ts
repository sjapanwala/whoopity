import { describe, expect, it } from 'vitest'
import { chance, clamp, createRng, pick, randInt, randRange } from './rng'

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(1)
    const b = createRng(1)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 100; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('randRange / randInt', () => {
  it('stays within bounds', () => {
    const rng = createRng(3)
    for (let i = 0; i < 100; i++) {
      const r = randRange(rng, 10, 20)
      expect(r).toBeGreaterThanOrEqual(10)
      expect(r).toBeLessThan(20)
      const n = randInt(rng, 1, 3)
      expect([1, 2, 3]).toContain(n)
    }
  })
})

describe('pick', () => {
  it('only returns items from the input array', () => {
    const rng = createRng(9)
    const items = ['a', 'b', 'c']
    for (let i = 0; i < 20; i++) {
      expect(items).toContain(pick(rng, items))
    }
  })
})

describe('chance', () => {
  it('always returns false for probability 0 and true for probability 1', () => {
    const rng = createRng(5)
    for (let i = 0; i < 20; i++) {
      expect(chance(rng, 0)).toBe(false)
      expect(chance(rng, 1)).toBe(true)
    }
  })
})

describe('clamp', () => {
  it('constrains a value to the given range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
