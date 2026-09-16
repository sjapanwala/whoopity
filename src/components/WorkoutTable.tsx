import { useState } from 'react'
import { format } from 'date-fns'
import type { Workout } from '../types/whoop'

type SortKey = 'date' | 'sport' | 'durationMinutes' | 'strain' | 'averageHeartRate' | 'maxHeartRate' | 'energyExpended'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'sport', label: 'Sport' },
  { key: 'durationMinutes', label: 'Duration' },
  { key: 'strain', label: 'Strain' },
  { key: 'averageHeartRate', label: 'Avg HR' },
  { key: 'maxHeartRate', label: 'Max HR' },
  { key: 'energyExpended', label: 'Calories' },
]

function compareValues(a: Workout, b: Workout, key: SortKey): number {
  const av = a[key]
  const bv = b[key]
  if (av === null && bv === null) return 0
  if (av === null) return 1
  if (bv === null) return -1
  if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv)
  if (typeof av === 'number' && typeof bv === 'number') return av - bv
  return 0
}

export function WorkoutTable({ workouts }: { workouts: Workout[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDesc, setSortDesc] = useState(true)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDesc((d) => !d)
    } else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  const sorted = [...workouts].sort((a, b) => {
    const cmp = compareValues(a, b, sortKey)
    return sortDesc ? -cmp : cmp
  })

  if (workouts.length === 0) {
    return <p className="py-10 text-center font-mono text-xs text-ink-muted">No workouts in this range</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[13.5px]">
        <thead>
          <tr className="border-b border-line text-left">
            {COLUMNS.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-0.5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-ink-muted">
                <button type="button" onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-ink">
                  {col.label}
                  {sortKey === col.key && <span>{sortDesc ? '↓' : '↑'}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((w) => (
            <tr key={w.id} className="border-b border-line last:border-0">
              <td className="whitespace-nowrap px-0.5 py-3 font-mono text-xs text-ink-muted">
                {format(new Date(`${w.date}T00:00:00`), 'MMM d, yyyy')}
              </td>
              <td className="whitespace-nowrap px-0.5 py-3 text-ink">{w.sport}</td>
              <td className="whitespace-nowrap px-0.5 py-3 text-right font-mono text-xs tabular-nums text-ink">
                {w.durationMinutes !== null ? `${Math.round(w.durationMinutes)} min` : '–'}
              </td>
              <td className="whitespace-nowrap px-0.5 py-3 text-right font-mono text-xs tabular-nums text-ink">
                {w.strain !== null ? w.strain.toFixed(1) : '–'}
              </td>
              <td className="whitespace-nowrap px-0.5 py-3 text-right font-mono text-xs tabular-nums text-ink-muted">
                {w.averageHeartRate !== null ? `${Math.round(w.averageHeartRate)} bpm` : '–'}
              </td>
              <td className="whitespace-nowrap px-0.5 py-3 text-right font-mono text-xs tabular-nums text-ink-muted">
                {w.maxHeartRate !== null ? `${Math.round(w.maxHeartRate)} bpm` : '–'}
              </td>
              <td className="whitespace-nowrap px-0.5 py-3 text-right font-mono text-xs tabular-nums text-ink-muted">
                {w.energyExpended !== null ? Math.round(w.energyExpended) : '–'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
