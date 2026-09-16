import type { RangeKey } from '../lib/metrics/dateRange'

const OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '1y', label: '1Y' },
  { key: 'all', label: 'All' },
  { key: 'custom', label: 'Custom' },
]

export function RangePicker({
  value,
  onChange,
}: {
  value: RangeKey
  onChange: (range: RangeKey) => void
}) {
  return (
    <div className="flex w-fit gap-0.5 rounded-[9px] border border-line p-[3px]">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={[
            'rounded-md px-3 py-1.5 font-mono text-xs transition-colors',
            value === option.key ? 'bg-ink font-medium text-page' : 'font-normal text-ink-muted hover:text-ink',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
