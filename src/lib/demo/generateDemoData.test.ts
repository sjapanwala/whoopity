import { describe, expect, it } from 'vitest'
import { generateDemoData } from './generateDemoData'

const FIXED_END = new Date('2024-06-30T00:00:00.000Z')

describe('generateDemoData', () => {
  it('produces one cycle and one sleep per day, deterministically for a given seed', () => {
    const days = 30
    const a = generateDemoData({ days, seed: 1, endDate: FIXED_END })
    const b = generateDemoData({ days, seed: 1, endDate: FIXED_END })

    expect(a.cycles).toHaveLength(days)
    expect(a.sleeps).toHaveLength(days)
    expect(a).toEqual(b)
  })

  it('produces different data for a different seed', () => {
    const a = generateDemoData({ days: 30, seed: 1, endDate: FIXED_END })
    const b = generateDemoData({ days: 30, seed: 2, endDate: FIXED_END })
    expect(a.cycles.map((c) => c.recoveryScore)).not.toEqual(
      b.cycles.map((c) => c.recoveryScore),
    )
  })

  it('keeps every metric within its plausible real-world range', () => {
    const { cycles, sleeps, workouts } = generateDemoData({
      days: 200,
      seed: 123,
      endDate: FIXED_END,
    })

    for (const cycle of cycles) {
      expect(cycle.recoveryScore).toBeGreaterThanOrEqual(0)
      expect(cycle.recoveryScore).toBeLessThanOrEqual(100)
      expect(cycle.strain).toBeGreaterThanOrEqual(0)
      expect(cycle.strain).toBeLessThanOrEqual(21)
      expect(cycle.restingHeartRate).toBeGreaterThan(30)
      expect(cycle.restingHeartRate).toBeLessThan(90)
      expect(cycle.hrvMs).toBeGreaterThan(0)
    }

    for (const sleep of sleeps) {
      expect(sleep.performancePercent).toBeGreaterThanOrEqual(0)
      expect(sleep.performancePercent).toBeLessThanOrEqual(100)
      const { awakeMinutes, lightMinutes, remMinutes, deepMinutes } = sleep.stages
      expect(awakeMinutes).not.toBeNull()
      expect(lightMinutes).not.toBeNull()
      expect(remMinutes).not.toBeNull()
      expect(deepMinutes).not.toBeNull()
    }

    expect(workouts.length).toBeGreaterThan(0)
    for (const workout of workouts) {
      expect(workout.durationMinutes).toBeGreaterThan(0)
      expect(workout.averageHeartRate).toBeGreaterThan(0)
    }
  })

  it('generates one journal entry per question per day', () => {
    const days = 10
    const { journalEntries } = generateDemoData({ days, seed: 4, endDate: FIXED_END })
    const uniqueQuestions = new Set(journalEntries.map((j) => j.questionText))
    expect(journalEntries).toHaveLength(days * uniqueQuestions.size)
  })

  it('assigns ids that are unique across all records', () => {
    const { cycles, sleeps, workouts, journalEntries } = generateDemoData({
      days: 60,
      seed: 8,
      endDate: FIXED_END,
    })
    const allIds = [
      ...cycles.map((c) => c.id),
      ...sleeps.map((s) => s.id),
      ...workouts.map((w) => w.id),
      ...journalEntries.map((j) => j.id),
    ]
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})
