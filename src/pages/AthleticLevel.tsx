import { useMemo } from 'react'
import { benchmarkFor, METRIC_KEYS } from '../lib/athleticLevel/benchmarks'
import { computeCurrentValues } from '../lib/athleticLevel/metrics'
import { percentileFor, targetValueFor } from '../lib/athleticLevel/percentile'
import type { AthleteProfile, MetricKey, Sex } from '../types/profile'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'

const TARGET_PRESETS = [50, 75, 90, 95, 99]

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Prefer not to say' },
]

function ordinal(n: number): string {
  const rounded = Math.round(n)
  const mod100 = rounded % 100
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`
  switch (rounded % 10) {
    case 1:
      return `${rounded}st`
    case 2:
      return `${rounded}nd`
    case 3:
      return `${rounded}rd`
    default:
      return `${rounded}th`
  }
}

function formatValue(value: number | null, unit: string, digits: number): string {
  return value === null ? '–' : `${value.toFixed(digits)}${unit}`
}

interface MetricRowData {
  key: MetricKey
  label: string
  unit: string
  digits: number
  value: number | null
  percentile: number | null
  targetValue: number
  weight: number
}

function PercentileBar({ percentile, target, met }: { percentile: number; target: number; met: boolean }) {
  const width = 400
  const height = 10
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }} className="mt-3 block overflow-visible">
      <rect x={0} y={0} width={width} height={height} rx={2} fill="var(--chart-grid)" />
      <rect x={0} y={0} width={(percentile / 100) * width} height={height} rx={2} fill={met ? 'var(--status-good)' : 'var(--color-accent)'} opacity={0.85} />
      <line
        x1={(target / 100) * width}
        y1={-3}
        x2={(target / 100) * width}
        y2={height + 3}
        stroke="var(--chart-ink-primary)"
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
    </svg>
  )
}

function MetricRow({
  row,
  targetPercentile,
  onWeightChange,
}: {
  row: MetricRowData
  targetPercentile: number
  onWeightChange: (weight: number) => void
}) {
  const { key, label, unit, digits, value, percentile, targetValue, weight } = row
  const met = percentile !== null && percentile >= targetPercentile

  return (
    <div className="border-b border-line py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">{label}</div>
          <div className="mt-1.5 text-xl font-semibold tracking-tight text-ink">{formatValue(value, unit, digits)}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-medium text-ink">
            {percentile !== null ? `${ordinal(percentile)} percentile` : 'No data yet'}
          </div>
          <div className="mt-1 font-mono text-[11px] text-ink-muted">target: {formatValue(targetValue, unit, digits)}</div>
        </div>
      </div>
      {percentile !== null && <PercentileBar percentile={percentile} target={targetPercentile} met={met} />}
      <div className="mt-4 flex items-center gap-3">
        <span className="w-14 shrink-0 font-mono text-[11px] text-ink-muted">Weight</span>
        <input
          type="range"
          min={0}
          max={100}
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="h-1.5 flex-1 accent-[color:var(--color-accent)]"
          aria-label={`${label} weight`}
        />
        <span id={`weight-${key}`} className="w-10 shrink-0 text-right font-mono text-[11px] text-ink-muted">
          {weight}%
        </span>
      </div>
    </div>
  )
}

export function AthleticLevel() {
  const { dataset } = useData()
  const { profile, updateProfile } = useProfile()

  const currentValues = useMemo(() => computeCurrentValues(dataset), [dataset])
  const sex: Sex = profile.sex ?? 'other'

  const rows: MetricRowData[] | null = useMemo(() => {
    if (profile.age === null) return null
    return METRIC_KEYS.map((key) => {
      const benchmark = benchmarkFor(key, profile.age!, sex)
      const value = currentValues[key]
      return {
        key,
        label: benchmark.label,
        unit: benchmark.unit,
        digits: benchmark.digits,
        value,
        percentile: value !== null ? percentileFor(value, benchmark) : null,
        targetValue: targetValueFor(profile.targetPercentile, benchmark),
        weight: profile.weights[key],
      }
    })
  }, [profile.age, profile.targetPercentile, profile.weights, sex, currentValues])

  const composite = useMemo(() => {
    if (!rows) return null
    const scored = rows.filter((r) => r.percentile !== null && r.weight > 0)
    const totalWeight = scored.reduce((sum, r) => sum + r.weight, 0)
    if (totalWeight === 0) return null
    return scored.reduce((sum, r) => sum + r.percentile! * (r.weight / totalWeight), 0)
  }, [rows])

  const focus = useMemo(() => {
    if (!rows) return null
    const ranked = rows
      .filter((r) => r.percentile !== null && r.weight > 0)
      .map((r) => ({ ...r, gap: profile.targetPercentile - r.percentile! }))
      .sort((a, b) => b.gap * b.weight - a.gap * a.weight)
    return ranked
  }, [rows, profile.targetPercentile])

  function setWeight(key: MetricKey, weight: number) {
    void updateProfile({ weights: { ...profile.weights, [key]: weight } })
  }

  function setAge(raw: string) {
    const n = raw === '' ? null : Number(raw)
    void updateProfile({ age: n !== null && Number.isFinite(n) ? n : null })
  }

  function setSexValue(value: string) {
    void updateProfile({ sex: value as AthleteProfile['sex'] })
  }

  if (dataset.cycles.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Athletic Level</h1>
        <p className="mt-2 text-sm text-ink-muted">Import or load demo data to see your Athletic Level.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Athletic Level</h1>
        <p className="mt-2.5 max-w-[62ch] text-[15px] leading-[1.5] text-ink-muted text-pretty">
          Where your recovery, sleep, and training stack up against a general population benchmark — and which one to
          push on to reach a target percentile.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 border-t border-line pt-6">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">Age</span>
          <input
            type="number"
            min={5}
            max={100}
            value={profile.age ?? ''}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="w-24 rounded-md border border-line bg-transparent px-2.5 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">Sex</span>
          <select
            value={profile.sex ?? ''}
            onChange={(e) => setSexValue(e.target.value)}
            className="rounded-md border border-line bg-transparent px-2.5 py-1.5 text-sm text-ink"
          >
            <option value="" disabled>
              Select
            </option>
            {SEX_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {profile.age === null || !rows ? (
        <p className="text-sm text-ink-muted">Enter your age above to see your Athletic Level.</p>
      ) : (
        <>
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">Athletic level</div>
            <div className="mt-2 text-[clamp(40px,7vw,64px)] font-semibold leading-none tracking-tight text-ink">
              {composite !== null ? ordinal(composite) : '–'}
              {composite !== null && <span className="ml-2 text-[0.4em] font-normal text-ink-muted">percentile</span>}
            </div>
            <p className="mt-3 max-w-[56ch] font-mono text-[11.5px] text-ink-muted">
              An approximate, illustrative benchmark against a general adult population — not a clinical or
              scientifically validated score. Weighted by the sliders below.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">Target percentile</div>
            <div className="mt-3 flex w-fit gap-0.5 rounded-[9px] border border-line p-[3px]">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => void updateProfile({ targetPercentile: preset })}
                  className={[
                    'rounded-md px-3 py-1.5 font-mono text-xs transition-colors',
                    profile.targetPercentile === preset ? 'bg-ink font-medium text-page' : 'font-normal text-ink-muted hover:text-ink',
                  ].join(' ')}
                >
                  {preset}th
                </button>
              ))}
            </div>
          </div>

          {focus && focus.length > 0 && (
            <div className="rounded-[14px] border border-line bg-surface-2 p-5">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted">Focus on</div>
              {focus[0]!.gap > 0 ? (
                <p className="mt-2 text-[15px] leading-[1.5] text-ink text-pretty">
                  <strong className="font-semibold">{focus[0]!.label}</strong> is your biggest gap:{' '}
                  {formatValue(focus[0]!.value, focus[0]!.unit, focus[0]!.digits)} now, aim for about{' '}
                  {formatValue(focus[0]!.targetValue, focus[0]!.unit, focus[0]!.digits)} to reach the{' '}
                  {ordinal(profile.targetPercentile)} percentile.
                </p>
              ) : (
                <p className="mt-2 text-[15px] leading-[1.5] text-ink text-pretty">
                  You're already at or above the {ordinal(profile.targetPercentile)} percentile across everything you're
                  weighting. Try raising your target.
                </p>
              )}
            </div>
          )}

          <div className="border-t border-line">
            {rows.map((row) => (
              <MetricRow
                key={row.key}
                row={row}
                targetPercentile={profile.targetPercentile}
                onWeightChange={(w) => setWeight(row.key, w)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
