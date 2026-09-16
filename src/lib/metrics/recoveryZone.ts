import type { RecoveryZone } from '../../types/whoop'

export function recoveryZoneFor(score: number | null): RecoveryZone | null {
  if (score === null) return null
  if (score >= 67) return 'green'
  if (score >= 34) return 'yellow'
  return 'red'
}
