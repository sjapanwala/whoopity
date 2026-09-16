import { useMemo, useState } from 'react'
import { RangePicker } from '../components/RangePicker'
import { SportBars } from '../components/SportBars'
import { WeeklyLoadChart } from '../components/WeeklyLoadChart'
import { WorkoutTable } from '../components/WorkoutTable'
import { filterByDateRange, resolveRange, type RangeKey } from '../lib/metrics/dateRange'
import { totalsBySport, weeklyStrainVolume } from '../lib/metrics/workoutTotals'
import { useData } from '../state/data'

export function Workouts() {
  const { dataset } = useData()
  const [range, setRange] = useState<RangeKey>('90d')
  const [sportFilter, setSportFilter] = useState<string>('all')

  const resolved = useMemo(() => resolveRange(range, new Date()), [range])
  const inRange = useMemo(() => filterByDateRange(dataset.workouts, resolved), [dataset.workouts, resolved])

  const sports = useMemo(() => Array.from(new Set(dataset.workouts.map((w) => w.sport))).sort(), [dataset.workouts])

  const filtered = useMemo(
    () => (sportFilter === 'all' ? inRange : inRange.filter((w) => w.sport === sportFilter)),
    [inRange, sportFilter],
  )

  const totals = useMemo(() => totalsBySport(inRange), [inRange])
  const weeks = useMemo(() => weeklyStrainVolume(inRange), [inRange])
  const totalStrain = useMemo(() => totals.reduce((s, t) => s + t.totalStrain, 0), [totals])

  if (dataset.workouts.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Workouts</h1>
        <p className="mt-2 text-sm text-ink-muted">Import or load demo data to see workouts.</p>
      </div>
    )
  }

  const lede =
    totals.length > 0
      ? `${totals.length} ${totals.length === 1 ? 'sport' : 'sports'}, ${inRange.length} ${inRange.length === 1 ? 'session' : 'sessions'}, ${totalStrain.toFixed(0)} total strain in this range. ${totals[0]!.sport} carries most of the load.`
      : 'No workouts in this range.'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Workouts</h1>
          <p className="mt-2.5 max-w-[58ch] text-[15px] leading-[1.5] text-ink-muted text-pretty">{lede}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="rounded-md border border-line bg-transparent px-2 py-1.5 text-sm text-ink-secondary"
          >
            <option value="all">All sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <RangePicker value={range} onChange={setRange} />
        </div>
      </div>

      <SportBars totals={totals} />
      <WeeklyLoadChart weeks={weeks} />

      <div>
        <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink">Recent sessions</h2>
        <WorkoutTable workouts={filtered} />
      </div>
    </div>
  )
}
