import { addDays, format, setHours, setMinutes, startOfDay, subDays } from 'date-fns'
import type { Cycle, JournalEntry, Sleep, Workout, WhoopDataset } from '../../types/whoop'
import { recoveryZoneFor } from '../metrics/recoveryZone'
import { chance, clamp, createRng, randInt, randRange } from './rng'

export interface DemoDataOptions {
  /** Number of days of history to generate, ending "today". */
  days?: number
  /** Fixed PRNG seed so the same options always produce the same dataset. */
  seed?: number
  /** Overrides "today" for reproducible tests; defaults to the real today. */
  endDate?: Date
}

const JOURNAL_QUESTIONS: { text: string; probability: number }[] = [
  { text: 'Consumed alcohol', probability: 0.22 },
  { text: 'Late meal (within 2 hours of bed)', probability: 0.3 },
  { text: 'Caffeine after 12pm', probability: 0.35 },
  { text: 'Read before bed', probability: 0.25 },
  { text: 'Viewed a screen device in bed', probability: 0.55 },
]

const SPORTS: {
  name: string
  weight: number
  durationRange: [number, number]
  hrRange: [number, number]
  cardio: boolean
}[] = [
  { name: 'Running', weight: 3, durationRange: [25, 60], hrRange: [140, 175], cardio: true },
  { name: 'Cycling', weight: 2, durationRange: [30, 90], hrRange: [125, 165], cardio: true },
  { name: 'Weightlifting', weight: 3, durationRange: [40, 75], hrRange: [110, 145], cardio: false },
  { name: 'Yoga', weight: 1, durationRange: [30, 60], hrRange: [85, 110], cardio: false },
  { name: 'Swimming', weight: 1, durationRange: [20, 45], hrRange: [130, 160], cardio: true },
  { name: 'Rowing', weight: 1, durationRange: [20, 40], hrRange: [140, 170], cardio: true },
  { name: 'Walking', weight: 2, durationRange: [20, 60], hrRange: [90, 115], cardio: true },
]

function weightedSport(rng: () => number) {
  const totalWeight = SPORTS.reduce((sum, s) => sum + s.weight, 0)
  let roll = rng() * totalWeight
  for (const sport of SPORTS) {
    roll -= sport.weight
    if (roll <= 0) return sport
  }
  return SPORTS[0]!
}

function splitHeartRateZones(
  rng: () => number,
  durationMinutes: number,
  intensity: number,
): Workout['zones'] {
  // `intensity` in [0, 1] shifts time toward higher zones for harder sports.
  const weights = [
    0.3 - intensity * 0.15,
    0.3 - intensity * 0.05,
    0.2 + intensity * 0.05,
    0.15 + intensity * 0.1,
    0.05 + intensity * 0.05,
  ].map((w) => Math.max(0.02, w + randRange(rng, -0.03, 0.03)))
  const total = weights.reduce((a, b) => a + b, 0)
  const minutes = weights.map((w) => Math.round((w / total) * durationMinutes))
  return {
    zone1Minutes: minutes[0] ?? 0,
    zone2Minutes: minutes[1] ?? 0,
    zone3Minutes: minutes[2] ?? 0,
    zone4Minutes: minutes[3] ?? 0,
    zone5Minutes: minutes[4] ?? 0,
  }
}

/**
 * Generates a realistic-looking, internally-consistent WHOOP dataset for
 * exercising the UI without real health data. Deterministic given the same
 * seed/days/endDate.
 */
export function generateDemoData(options: DemoDataOptions = {}): WhoopDataset {
  const days = options.days ?? 120
  const rng = createRng(options.seed ?? 42)
  const today = startOfDay(options.endDate ?? new Date())

  const cycles: Cycle[] = []
  const sleeps: Sleep[] = []
  const workouts: Workout[] = []
  const journalEntries: JournalEntry[] = []

  let previousRecovery = 60
  let previousStrain = 10
  let previousAlcohol = false

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(today, i)
    const dateKey = format(day, 'yyyy-MM-dd')

    const todaysAnswers = JOURNAL_QUESTIONS.map((q) => ({
      question: q.text,
      answer: chance(rng, q.probability),
    }))
    for (const { question, answer } of todaysAnswers) {
      journalEntries.push({
        id: `journal:${dateKey}:${question}`,
        date: dateKey,
        questionText: question,
        answer,
      })
    }
    const drankAlcohol = todaysAnswers.find((a) => a.question === JOURNAL_QUESTIONS[0]?.text)?.answer ?? false

    // Recovery mean-reverts toward a personal baseline, with day-to-day noise
    // and dips after yesterday's alcohol / high strain — without reversion a
    // pure random walk drifts to the clamp floor and gets stuck there.
    const personalBaseline = 62
    const reversion = (personalBaseline - previousRecovery) * 0.18
    const dailyNoise = randRange(rng, -6, 6)
    const alcoholPenalty = previousAlcohol ? randRange(rng, 5, 14) : 0
    const strainPenalty = previousStrain > 16 ? randRange(rng, 2, 7) : 0
    const recoveryScore = Math.round(
      clamp(previousRecovery + reversion + dailyNoise - alcoholPenalty - strainPenalty, 8, 97),
    )

    const hrvMs = Math.round(clamp(28 + recoveryScore * 0.55 + randRange(rng, -6, 6), 18, 120))
    const restingHeartRate = Math.round(clamp(68 - recoveryScore * 0.15 + randRange(rng, -3, 3), 38, 72))

    const cycleStart = setMinutes(setHours(day, 6), randInt(rng, 0, 59))
    const cycleEnd = addDays(cycleStart, 1)

    // Sleep for the night leading into this cycle.
    const sleepPerformance = Math.round(clamp(50 + recoveryScore * 0.45 + randRange(rng, -8, 8), 35, 99))
    const totalSleepMinutes = Math.round(clamp(330 + sleepPerformance * 1.6 + randRange(rng, -20, 20), 300, 540))
    const awakeMinutes = Math.round(totalSleepMinutes * randRange(rng, 0.03, 0.08))
    const remMinutes = Math.round(totalSleepMinutes * randRange(rng, 0.17, 0.24))
    const deepMinutes = Math.round(totalSleepMinutes * randRange(rng, 0.13, 0.19))
    const lightMinutes = Math.max(
      0,
      totalSleepMinutes - awakeMinutes - remMinutes - deepMinutes,
    )
    const bedHour = randInt(rng, 21, 24) % 24
    const sleepOnset = setMinutes(setHours(subDays(day, 1), bedHour), randInt(rng, 0, 59))
    const wakeOnset = new Date(sleepOnset.getTime() + totalSleepMinutes * 60_000)
    const sleepNeedMinutes = Math.round(clamp(460 + randRange(rng, -30, 30), 420, 520))

    sleeps.push({
      id: `sleep:${dateKey}`,
      date: dateKey,
      type: 'sleep',
      start: sleepOnset.toISOString(),
      end: wakeOnset.toISOString(),
      performancePercent: sleepPerformance,
      efficiencyPercent: Math.round(clamp(sleepPerformance + randRange(rng, -5, 8), 60, 100)),
      consistencyPercent: Math.round(clamp(70 + randRange(rng, -20, 20), 20, 99)),
      respiratoryRate: Number(clamp(15 + randRange(rng, -1.5, 1.5), 12, 20).toFixed(1)),
      stages: { awakeMinutes, lightMinutes, remMinutes, deepMinutes },
      timeInBedMinutes: totalSleepMinutes + awakeMinutes,
      sleepNeedMinutes,
      sleepDebtMinutes: Math.max(0, Math.round(sleepNeedMinutes - totalSleepMinutes)),
      disturbanceCount: randInt(rng, 0, 6),
    })

    // Strain: tends higher when recovery is good (user pushes harder).
    const strain = Number(
      clamp(6 + recoveryScore * 0.08 + randRange(rng, -3, 3), 2, 20.9).toFixed(1),
    )

    const hasWorkout = chance(rng, 0.55)
    let workoutStrainContribution = 0
    if (hasWorkout) {
      const sport = weightedSport(rng)
      const durationMinutes = randInt(rng, sport.durationRange[0], sport.durationRange[1])
      const avgHeartRate = randInt(rng, sport.hrRange[0], sport.hrRange[1])
      const maxHeartRate = Math.min(195, avgHeartRate + randInt(rng, 8, 25))
      const intensity = clamp((avgHeartRate - 90) / 100, 0, 1)
      const workoutStart = setMinutes(setHours(day, randInt(rng, 7, 19)), randInt(rng, 0, 59))
      const workoutEnd = new Date(workoutStart.getTime() + durationMinutes * 60_000)

      workoutStrainContribution = Number(clamp(intensity * 8 + randRange(rng, 1, 4), 1, 18).toFixed(1))

      workouts.push({
        id: `workout:${dateKey}`,
        date: dateKey,
        sport: sport.name,
        start: workoutStart.toISOString(),
        end: workoutEnd.toISOString(),
        durationMinutes,
        strain: workoutStrainContribution,
        averageHeartRate: avgHeartRate,
        maxHeartRate,
        energyExpended: Math.round(durationMinutes * randRange(rng, 6, 12)),
        distanceMeters: sport.cardio
          ? Math.round(durationMinutes * randRange(rng, 120, 220))
          : null,
        altitudeGainMeters: sport.cardio && chance(rng, 0.3) ? randInt(rng, 5, 150) : null,
        zones: splitHeartRateZones(rng, durationMinutes, intensity),
      })
    }

    const dayStrain = Number(clamp(strain, workoutStrainContribution, 20.9).toFixed(1))

    cycles.push({
      id: `cycle:${dateKey}`,
      date: dateKey,
      cycleStart: cycleStart.toISOString(),
      cycleEnd: cycleEnd.toISOString(),
      strain: dayStrain,
      recoveryScore,
      recoveryZone: recoveryZoneFor(recoveryScore),
      restingHeartRate,
      hrvMs,
      energyExpended: Math.round(1800 + dayStrain * 60 + randRange(rng, -100, 100)),
      skinTempCelsius: Number(clamp(33.5 + randRange(rng, -0.4, 0.4), 32, 35).toFixed(1)),
      respiratoryRate: Number(clamp(15 + randRange(rng, -1.5, 1.5), 12, 20).toFixed(1)),
      spo2Percent: Math.round(clamp(97 + randRange(rng, -2, 2), 90, 100)),
    })

    previousRecovery = recoveryScore
    previousStrain = dayStrain
    previousAlcohol = drankAlcohol
  }

  return { cycles, sleeps, workouts, journalEntries }
}
