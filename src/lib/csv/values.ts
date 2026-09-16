/** Parses a numeric CSV cell, tolerant of stray units/percent signs/commas. */
export function parseNumberOrNull(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const cleaned = trimmed.replace(/,/g, '').replace(/[^0-9.-]/g, '')
  if (cleaned === '' || cleaned === '-') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1'])
const FALSE_VALUES = new Set(['false', 'no', 'n', '0'])

export function parseBooleanOrNull(raw: string | undefined): boolean | null {
  if (raw === undefined) return null
  const trimmed = raw.trim().toLowerCase()
  if (trimmed === '') return null
  if (TRUE_VALUES.has(trimmed)) return true
  if (FALSE_VALUES.has(trimmed)) return false
  return null
}

/** Parses a WHOOP timestamp cell into an ISO 8601 string, or null. */
export function parseTimestampOrNull(raw: string | undefined): string | null {
  if (raw === undefined) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/** Extracts the yyyy-MM-dd portion of an ISO timestamp in local time. */
export function toLocalDateKey(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function firstDefined(
  ...values: (string | undefined)[]
): string | undefined {
  return values.find((v) => v !== undefined && v.trim() !== '')
}
