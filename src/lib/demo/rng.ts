/** Deterministic PRNG (mulberry32) so demo data is reproducible and testable. */
export function createRng(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1))
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[randInt(rng, 0, items.length - 1)]
  if (item === undefined) throw new Error('pick() called on an empty array')
  return item
}

export function chance(rng: () => number, probability: number): boolean {
  return rng() < probability
}

/** Clamps to a range, useful after adding gaussian-ish noise to a baseline. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
