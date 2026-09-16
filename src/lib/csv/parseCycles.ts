import type { Cycle } from '../../types/whoop'
import { recoveryZoneFor } from '../metrics/recoveryZone'
import { CYCLE_ALIASES } from './aliases'
import { buildColumnMap } from './normalize'
import {
  parseNumberOrNull,
  parseTimestampOrNull,
  toLocalDateKey,
} from './values'

/** Parses PapaParse row objects from physiological_cycles.csv into Cycles. */
export function parseCycleRows(
  rows: Record<string, string>[],
  headers: string[],
): Cycle[] {
  const cols = buildColumnMap(headers, CYCLE_ALIASES)
  const cycles: Cycle[] = []

  rows.forEach((row, index) => {
    const cycleStart = cols.cycleStart
      ? parseTimestampOrNull(row[cols.cycleStart])
      : null
    if (cycleStart === null) return

    const cycleEnd = cols.cycleEnd ? parseTimestampOrNull(row[cols.cycleEnd]) : null
    const recoveryScore = cols.recoveryScore
      ? parseNumberOrNull(row[cols.recoveryScore])
      : null

    const rawId = cols.id ? row[cols.id] : undefined
    const id = rawId ? rawId : `cycle:${cycleStart}:${index}`

    cycles.push({
      id,
      date: toLocalDateKey(cycleStart),
      cycleStart,
      cycleEnd,
      strain: cols.strain ? parseNumberOrNull(row[cols.strain]) : null,
      recoveryScore,
      recoveryZone: recoveryZoneFor(recoveryScore),
      restingHeartRate: cols.restingHeartRate
        ? parseNumberOrNull(row[cols.restingHeartRate])
        : null,
      hrvMs: cols.hrv ? parseNumberOrNull(row[cols.hrv]) : null,
      energyExpended: cols.energyExpended
        ? parseNumberOrNull(row[cols.energyExpended])
        : null,
      skinTempCelsius: cols.skinTemp ? parseNumberOrNull(row[cols.skinTemp]) : null,
      respiratoryRate: cols.respiratoryRate
        ? parseNumberOrNull(row[cols.respiratoryRate])
        : null,
      spo2Percent: cols.spo2 ? parseNumberOrNull(row[cols.spo2]) : null,
    })
  })

  return cycles
}
