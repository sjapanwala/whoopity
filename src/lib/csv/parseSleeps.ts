import type { Sleep } from '../../types/whoop'
import { SLEEP_ALIASES } from './aliases'
import { buildColumnMap } from './normalize'
import {
  parseBooleanOrNull,
  parseNumberOrNull,
  parseTimestampOrNull,
  toLocalDateKey,
} from './values'

/** Parses PapaParse row objects from sleeps.csv into Sleeps. */
export function parseSleepRows(
  rows: Record<string, string>[],
  headers: string[],
): Sleep[] {
  const cols = buildColumnMap(headers, SLEEP_ALIASES)
  const sleeps: Sleep[] = []

  rows.forEach((row, index) => {
    const start = cols.sleepOnset ? parseTimestampOrNull(row[cols.sleepOnset]) : null
    const end = cols.wakeOnset ? parseTimestampOrNull(row[cols.wakeOnset]) : null
    if (start === null || end === null) return

    const rawId = cols.id ? row[cols.id] : undefined
    const id = rawId ? rawId : `sleep:${start}:${index}`
    const isNap = cols.isNap ? (parseBooleanOrNull(row[cols.isNap]) ?? false) : false

    sleeps.push({
      id,
      date: toLocalDateKey(start),
      type: isNap ? 'nap' : 'sleep',
      start,
      end,
      performancePercent: cols.performance
        ? parseNumberOrNull(row[cols.performance])
        : null,
      efficiencyPercent: cols.efficiency
        ? parseNumberOrNull(row[cols.efficiency])
        : null,
      consistencyPercent: cols.consistency
        ? parseNumberOrNull(row[cols.consistency])
        : null,
      respiratoryRate: cols.respiratoryRate
        ? parseNumberOrNull(row[cols.respiratoryRate])
        : null,
      stages: {
        awakeMinutes: cols.awakeMinutes
          ? parseNumberOrNull(row[cols.awakeMinutes])
          : null,
        lightMinutes: cols.lightMinutes
          ? parseNumberOrNull(row[cols.lightMinutes])
          : null,
        remMinutes: cols.remMinutes ? parseNumberOrNull(row[cols.remMinutes]) : null,
        deepMinutes: cols.deepMinutes
          ? parseNumberOrNull(row[cols.deepMinutes])
          : null,
      },
      timeInBedMinutes: cols.inBedMinutes
        ? parseNumberOrNull(row[cols.inBedMinutes])
        : null,
      sleepNeedMinutes: cols.needMinutes
        ? parseNumberOrNull(row[cols.needMinutes])
        : null,
      sleepDebtMinutes: cols.debtMinutes
        ? parseNumberOrNull(row[cols.debtMinutes])
        : null,
      disturbanceCount: cols.disturbanceCount
        ? parseNumberOrNull(row[cols.disturbanceCount])
        : null,
    })
  })

  return sleeps
}
