import { format } from 'date-fns'
import type { PersonalRecords } from '../lib/metrics/personalRecords'

function formatRecord(record: { value: number; date: string } | null, unit: string, digits = 0) {
  if (!record) return '–'
  return `${record.value.toFixed(digits)}${unit} · ${format(new Date(`${record.date}T00:00:00`), 'MMM d, yyyy')}`
}

export function PersonalRecordsCard({ records }: { records: PersonalRecords }) {
  const stats = [
    { label: 'Best HRV', value: formatRecord(records.bestHrv, ' ms') },
    { label: 'Lowest resting heart rate', value: formatRecord(records.lowestRestingHeartRate, ' bpm') },
    { label: 'Best recovery', value: formatRecord(records.bestRecoveryScore, '') },
    { label: 'Longest green streak', value: `${records.longestGreenStreak} ${records.longestGreenStreak === 1 ? 'day' : 'days'}` },
    { label: 'Current green streak', value: `${records.currentGreenStreak} ${records.currentGreenStreak === 1 ? 'day' : 'days'}` },
  ]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface p-4">
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-ink-muted">{stat.label}</div>
          <div className="mt-2.5 text-sm font-semibold tracking-tight text-ink">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
