import type { SportTotals } from '../lib/metrics/workoutTotals'

export function SportBars({ totals }: { totals: SportTotals[] }) {
  if (totals.length === 0) {
    return <p className="py-10 text-center font-mono text-xs text-ink-muted">No workouts in this range</p>
  }

  const maxStrain = Math.max(...totals.map((t) => t.totalStrain))

  return (
    <div className="border-t border-line">
      {totals.map((t) => (
        <div
          key={t.sport}
          className="grid grid-cols-1 items-center gap-2 border-b border-line py-3.5 sm:grid-cols-[minmax(110px,1.2fr)_minmax(0,3fr)_minmax(130px,auto)] sm:gap-[clamp(12px,2.6vw,26px)]"
        >
          <div className="text-[14.5px] font-medium text-ink">{t.sport}</div>
          <svg viewBox="0 0 560 14" preserveAspectRatio="none" style={{ width: '100%', height: 14 }} className="block">
            <rect width={maxStrain > 0 ? (t.totalStrain / maxStrain) * 560 : 0} height={14} rx={3} fill="var(--color-accent)" opacity={0.85} />
          </svg>
          <div className="text-left font-mono text-xs text-ink-muted sm:text-right">
            <span className="font-medium text-ink">{t.totalStrain.toFixed(1)}</span> strain · {t.count} {t.count === 1 ? 'session' : 'sessions'}
          </div>
        </div>
      ))}
    </div>
  )
}
