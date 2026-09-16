import { Link } from 'react-router-dom'
import { useData } from '../state/data'

export function EmptyState() {
  const { loadDemoData } = useData()

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold tracking-tight text-ink">No WHOOP data yet</h2>
      <p className="text-sm leading-relaxed text-ink-muted">
        In the WHOOP app: go to your profile → <strong className="text-ink-secondary">Account</strong> →{' '}
        <strong className="text-ink-secondary">Privacy</strong> → <strong className="text-ink-secondary">Download My Data</strong>. WHOOP
        emails you a link to a .zip of CSVs, usually within a day. Drop that zip (or the individual CSVs) on the{' '}
        <Link to="/data" className="underline underline-offset-2">
          Data page
        </Link>{' '}
        to import it — everything stays in this browser.
      </p>
      <div className="flex gap-3">
        <Link to="/data" className="rounded-[9px] bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Import my data
        </Link>
        <button
          type="button"
          onClick={() => void loadDemoData()}
          className="rounded-[9px] border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink-muted"
        >
          Load demo data
        </button>
      </div>
    </div>
  )
}
