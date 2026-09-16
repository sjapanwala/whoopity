import type { JournalSplitResult } from '../lib/metrics/journalSplit'

const MIN_SAMPLE = 5

export function JournalBars({ results }: { results: JournalSplitResult[] }) {
  const rows = results
    .filter((r) => r.yesSampleSize >= MIN_SAMPLE && r.noSampleSize >= MIN_SAMPLE && r.yesAvgRecovery !== null && r.noAvgRecovery !== null)
    .map((r) => ({ ...r, diff: r.yesAvgRecovery! - r.noAvgRecovery! }))
    .sort((a, b) => b.diff - a.diff)

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center font-mono text-xs text-ink-muted">
        Not enough journal data yet — each side needs at least {MIN_SAMPLE} nights.
      </p>
    )
  }

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.diff)))

  return (
    <div className="border-t border-line">
      {rows.map((r) => {
        const len = maxAbs > 0 ? (Math.abs(r.diff) / maxAbs) * 96 : 0
        const isGood = r.diff >= 0
        return (
          <div
            key={r.questionText}
            className="grid grid-cols-1 items-center gap-2 border-b border-line py-3.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(88px,auto)] sm:gap-[clamp(12px,3vw,28px)]"
          >
            <div className="text-sm text-ink text-pretty">{r.questionText}</div>
            <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ width: '100%', height: 12 }} className="block">
              <line x1={100} y1={0} x2={100} y2={12} stroke="var(--chart-grid)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <rect
                x={isGood ? 100 : 100 - len}
                y={1}
                width={Math.max(2, len)}
                height={10}
                rx={2}
                fill={isGood ? 'var(--status-good)' : 'var(--status-critical)'}
                opacity={0.85}
              />
            </svg>
            <div className="text-left font-mono text-[12.5px] font-medium sm:text-right" style={{ color: isGood ? 'var(--status-good)' : 'var(--status-critical)' }}>
              {isGood ? '+' : ''}
              {r.diff.toFixed(1)} pts
            </div>
          </div>
        )
      })}
    </div>
  )
}
