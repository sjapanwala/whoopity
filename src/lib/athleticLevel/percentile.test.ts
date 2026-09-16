import { describe, expect, it } from 'vitest'
import { percentileFor, targetValueFor } from './percentile'
import type { Benchmark } from './benchmarks'

const higherIsBetter: Benchmark = { label: 'Test', unit: '', digits: 0, higherIsBetter: true, mean: 50, sd: 10 }
const lowerIsBetter: Benchmark = { label: 'Test', unit: '', digits: 0, higherIsBetter: false, mean: 50, sd: 10 }

describe('percentileFor', () => {
  it('is 50 at the mean regardless of direction', () => {
    expect(percentileFor(50, higherIsBetter)).toBeCloseTo(50, 3)
    expect(percentileFor(50, lowerIsBetter)).toBeCloseTo(50, 3)
  })

  it('scores above the mean higher when higher is better', () => {
    expect(percentileFor(60, higherIsBetter)).toBeGreaterThan(50)
    expect(percentileFor(40, higherIsBetter)).toBeLessThan(50)
  })

  it('scores below the mean higher when lower is better', () => {
    expect(percentileFor(40, lowerIsBetter)).toBeGreaterThan(50)
    expect(percentileFor(60, lowerIsBetter)).toBeLessThan(50)
  })

  it('clamps to the [0.1, 99.9] band for extreme values', () => {
    expect(percentileFor(1000, higherIsBetter)).toBeCloseTo(99.9, 3)
    expect(percentileFor(-1000, higherIsBetter)).toBeCloseTo(0.1, 3)
  })
})

describe('targetValueFor', () => {
  it('returns the mean at the 50th percentile', () => {
    expect(targetValueFor(50, higherIsBetter)).toBeCloseTo(50, 3)
  })

  it('requires a higher value for a higher percentile when higher is better', () => {
    expect(targetValueFor(90, higherIsBetter)).toBeGreaterThan(targetValueFor(50, higherIsBetter))
  })

  it('requires a lower value for a higher percentile when lower is better', () => {
    expect(targetValueFor(90, lowerIsBetter)).toBeLessThan(targetValueFor(50, lowerIsBetter))
  })

  it('round-trips with percentileFor', () => {
    const value = targetValueFor(80, higherIsBetter)
    expect(percentileFor(value, higherIsBetter)).toBeCloseTo(80, 3)
  })
})
