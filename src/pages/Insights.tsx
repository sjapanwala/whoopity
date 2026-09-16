import { useMemo } from 'react'
import { Finding } from '../components/Finding'
import { JournalBars } from '../components/JournalBars'
import { PersonalRecordsCard } from '../components/PersonalRecordsCard'
import { describeCorrelationStrength, joinSeriesByDateOffset, pearsonCorrelation, type CorrelationResult, type CorrelationStrength } from '../lib/metrics/correlation'
import { splitRecoveryByJournalAnswer } from '../lib/metrics/journalSplit'
import { computePersonalRecords } from '../lib/metrics/personalRecords'
import { actualSleepMinutes } from '../lib/metrics/sleepStats'
import { bedtimeMinutesFromNoon } from '../lib/metrics/sleepSchedule'
import { toSeries } from '../lib/metrics/series'
import { useData } from '../state/data'

function strengthTag(strength: CorrelationStrength): string {
  return strength === 'insufficient-data' ? 'not enough data yet' : strength
}

function findingColor(result: CorrelationResult | null, strength: CorrelationStrength): string {
  if (!result || strength === 'insufficient-data' || strength === 'negligible') return 'var(--chart-ink-muted)'
  return result.r >= 0 ? 'var(--status-good)' : 'var(--status-critical)'
}

function strainRecoveryCopy(result: CorrelationResult | null, strength: CorrelationStrength) {
  if (!result || strength === 'insufficient-data' || strength === 'negligible') {
    return "Day strain doesn't clearly predict next-day recovery yet."
  }
  return result.slope < 0
    ? `Each extra point of day strain costs about ${Math.abs(result.slope).toFixed(1)} recovery points the next morning.`
    : 'Harder days are followed by slightly higher recovery, not lower — an unusual pattern worth a second look.'
}

function sleepHrvCopy(result: CorrelationResult | null, strength: CorrelationStrength) {
  if (!result || strength === 'insufficient-data' || strength === 'negligible') {
    return "Sleep length doesn't clearly move your next-morning HRV."
  }
  return result.slope >= 0
    ? `An extra hour of sleep tracks with about ${result.slope.toFixed(1)} ms higher HRV the next morning.`
    : 'Longer nights track with slightly lower HRV the next morning — sleep timing may matter more than duration for you.'
}

function bedtimeRecoveryCopy(result: CorrelationResult | null, strength: CorrelationStrength) {
  if (!result || strength === 'insufficient-data' || strength === 'negligible') {
    return "Bedtime doesn't show a clear effect on next-day recovery yet."
  }
  const perHour = result.slope * 60
  return perHour < 0
    ? `Going to bed an hour later tracks with about ${Math.abs(perHour).toFixed(0)} lower recovery points the next day.`
    : 'Later bedtimes track with slightly higher recovery — worth checking whether something else is driving it.'
}

export function Insights() {
  const { dataset } = useData()

  const analysis = useMemo(() => {
    const nights = dataset.sleeps.filter((s) => s.type === 'sleep')

    const strainSeries = toSeries(dataset.cycles, (c) => c.strain)
    const recoverySeries = toSeries(dataset.cycles, (c) => c.recoveryScore)
    const sleepDurationSeries = toSeries(nights, actualSleepMinutes)
    const hrvSeries = toSeries(dataset.cycles, (c) => c.hrvMs)
    const bedtimeSeries = toSeries(nights, (s) => bedtimeMinutesFromNoon(s.start))

    const strainVsRecoveryPairs = joinSeriesByDateOffset(strainSeries, recoverySeries, 1)
    const sleepVsHrvPairs = joinSeriesByDateOffset(sleepDurationSeries, hrvSeries, 1).map(
      ([minutes, hrv]) => [minutes / 60, hrv] as [number, number],
    )
    const bedtimeVsRecoveryPairs = joinSeriesByDateOffset(bedtimeSeries, recoverySeries, 1)

    return {
      strainVsRecovery: { pairs: strainVsRecoveryPairs, result: pearsonCorrelation(strainVsRecoveryPairs) },
      sleepVsHrv: { pairs: sleepVsHrvPairs, result: pearsonCorrelation(sleepVsHrvPairs) },
      bedtimeVsRecovery: { pairs: bedtimeVsRecoveryPairs, result: pearsonCorrelation(bedtimeVsRecoveryPairs) },
      journalSplits: splitRecoveryByJournalAnswer(dataset.journalEntries, dataset.cycles),
      personalRecords: computePersonalRecords(dataset.cycles),
    }
  }, [dataset])

  if (dataset.cycles.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Insights</h1>
        <p className="mt-2 text-sm text-ink-muted">Import or load demo data to see insights.</p>
      </div>
    )
  }

  const strainStrength = describeCorrelationStrength(analysis.strainVsRecovery.result)
  const sleepStrength = describeCorrelationStrength(analysis.sleepVsHrv.result)
  const bedtimeStrength = describeCorrelationStrength(analysis.bedtimeVsRecovery.result)

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Insights</h1>
        <p className="mt-2.5 max-w-[64ch] text-[15px] leading-[1.5] text-ink-muted text-pretty">
          Each finding is stated as a sentence first. The chart is there to check the claim, not to make it.
        </p>
      </div>

      <PersonalRecordsCard records={analysis.personalRecords} />

      <div className="border-t border-line">
        <Finding
          tag={`${strengthTag(strainStrength)} · strain → recovery`}
          headline={strainRecoveryCopy(analysis.strainVsRecovery.result, strainStrength)}
          body="Each day's strain against the following morning's recovery score, across your full history."
          stat={analysis.strainVsRecovery.result ? `r = ${analysis.strainVsRecovery.result.r.toFixed(2)}   n = ${analysis.strainVsRecovery.result.n}` : 'Not enough data yet'}
          pairs={analysis.strainVsRecovery.pairs}
          color={findingColor(analysis.strainVsRecovery.result, strainStrength)}
          xLabel="strain"
          yLabel="recovery next day"
        />
        <Finding
          tag={`${strengthTag(sleepStrength)} · sleep → HRV`}
          headline={sleepHrvCopy(analysis.sleepVsHrv.result, sleepStrength)}
          body="Hours actually asleep each night against the next morning's HRV, across your full history."
          stat={analysis.sleepVsHrv.result ? `r = ${analysis.sleepVsHrv.result.r.toFixed(2)}   n = ${analysis.sleepVsHrv.result.n}` : 'Not enough data yet'}
          pairs={analysis.sleepVsHrv.pairs}
          color={findingColor(analysis.sleepVsHrv.result, sleepStrength)}
          xLabel="h asleep"
          yLabel="ms HRV next day"
        />
        <Finding
          tag={`${strengthTag(bedtimeStrength)} · bedtime → recovery`}
          headline={bedtimeRecoveryCopy(analysis.bedtimeVsRecovery.result, bedtimeStrength)}
          body="How far your bedtime fell from noon each night against the next morning's recovery, across your full history."
          stat={analysis.bedtimeVsRecovery.result ? `r = ${analysis.bedtimeVsRecovery.result.r.toFixed(2)}   n = ${analysis.bedtimeVsRecovery.result.n}` : 'Not enough data yet'}
          pairs={analysis.bedtimeVsRecovery.pairs}
          color={findingColor(analysis.bedtimeVsRecovery.result, bedtimeStrength)}
          xLabel="min past noon"
          yLabel="recovery next day"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Journal, ranked by effect</h2>
        <p className="mt-2 font-mono text-xs text-ink-muted">Change in next-day recovery when you logged yes</p>
        <div className="mt-5">
          {dataset.journalEntries.length > 0 ? (
            <JournalBars results={analysis.journalSplits} />
          ) : (
            <p className="py-6 text-center font-mono text-xs text-ink-muted">No journal entries in your data.</p>
          )}
        </div>
      </div>
    </div>
  )
}
