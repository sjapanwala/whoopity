import type { RecoveryZone } from '../../types/whoop'

/** Fixed categorical order — never cycle or reassign by rank. See dataviz skill. */
export const CATEGORICAL_COLORS = [
  'var(--cat-1)',
  'var(--cat-2)',
  'var(--cat-3)',
  'var(--cat-4)',
  'var(--cat-5)',
  'var(--cat-6)',
  'var(--cat-7)',
  'var(--cat-8)',
] as const

/** Deterministic color per category label, stable across re-renders/filters. */
export function categoricalColorFor(labels: string[], label: string): string {
  const index = labels.indexOf(label)
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length] ?? CATEGORICAL_COLORS[0]
}

export const STATUS_COLORS: Record<RecoveryZone, string> = {
  green: 'var(--status-good)',
  yellow: 'var(--status-warning)',
  red: 'var(--status-critical)',
}

/** Fixed assignment (not derived from data) so stage colors never shift between charts. */
export const SLEEP_STAGE_COLORS = {
  deep: 'var(--cat-7)',
  rem: 'var(--cat-1)',
  light: 'var(--cat-3)',
  awake: 'var(--cat-8)',
} as const
