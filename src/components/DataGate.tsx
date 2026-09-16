import type { ReactNode } from 'react'
import { useData } from '../state/data'

/** Blocks rendering the routed pages until IndexedDB has finished its initial load. */
export function DataGate({ children }: { children: ReactNode }) {
  const { status, error } = useData()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-muted">Loading your data…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--status-critical)]">
          Couldn't load your data: {error ?? 'unknown error'}
        </p>
      </div>
    )
  }

  return <>{children}</>
}
