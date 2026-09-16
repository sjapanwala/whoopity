import { useState } from 'react'
import { DropZone } from '../components/DropZone'
import { useData } from '../state/data'

export function Data() {
  const { dataset, isDemo, importFromFiles, loadDemoData, downloadJsonExport, deleteAllData } = useData()
  const [busy, setBusy] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [justImported, setJustImported] = useState(false)

  const recordCount = dataset.cycles.length + dataset.sleeps.length + dataset.workouts.length + dataset.journalEntries.length

  async function handleFiles(files: File[]) {
    setBusy(true)
    setJustImported(false)
    try {
      const importWarnings = await importFromFiles(files)
      setWarnings(importWarnings)
      setJustImported(true)
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Delete all imported WHOOP data from this browser? This cannot be undone.')) {
      return
    }
    await deleteAllData()
    setWarnings([])
    setJustImported(false)
  }

  const counts = [
    { label: 'Cycles', value: dataset.cycles.length },
    { label: 'Sleeps', value: dataset.sleeps.length },
    { label: 'Workouts', value: dataset.workouts.length },
    { label: 'Journal entries', value: dataset.journalEntries.length },
  ]

  return (
    <div className="max-w-[620px]">
      <h1 className="text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.15] tracking-tight">Data</h1>
      <p className="mt-3 text-[15px] leading-[1.55] text-ink-muted text-pretty">
        Everything lives only in this browser's IndexedDB storage — nothing is uploaded anywhere.
      </p>

      <div className="mt-8">
        <DropZone onFiles={handleFiles} busy={busy} />
        {justImported && <p className="mt-3 font-mono text-xs" style={{ color: 'var(--status-good)' }}>Import finished.</p>}
        {warnings.length > 0 && (
          <ul className="mt-3 rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs text-ink-secondary">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-0 border-t border-line">
        {counts.map((c) => (
          <div key={c.label} className="flex items-baseline justify-between border-b border-line py-3.5">
            <span className="text-sm text-ink-muted">{c.label}</span>
            <span className="font-mono text-[15px] font-medium text-ink">{c.value}</span>
          </div>
        ))}
      </div>
      {isDemo && <p className="mt-3 font-mono text-xs text-ink-muted">Currently showing demo data.</p>}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => void loadDemoData()}
          className="rounded-[9px] border border-line bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink hover:border-ink-muted"
        >
          Load demo data
        </button>
        <button
          type="button"
          disabled={recordCount === 0}
          onClick={() => void downloadJsonExport()}
          className="rounded-[9px] border border-line bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export as JSON
        </button>
      </div>

      <div className="mt-9 border-t border-line pt-5">
        <button
          type="button"
          disabled={recordCount === 0}
          onClick={() => void handleDeleteAll()}
          className="font-mono text-[12.5px] text-ink-muted underline decoration-1 underline-offset-[3px] hover:text-[var(--status-critical)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink-muted"
        >
          Delete all data
        </button>
      </div>
    </div>
  )
}
