/**
 * Reduces a CSV header to a comparable token: lowercase, units/punctuation
 * stripped, whitespace collapsed. "Heart Rate Variability (ms)" and
 * "heart_rate_variability_ms" both normalize to "heart rate variability ms".
 */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_/]/g, ' ')
    .replace(/[()%]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Builds a map from canonical field name to the source column key, by
 * matching each field's alias list against the (normalized) CSV headers.
 * The first alias that matches, in declared order, wins.
 */
export function buildColumnMap<Field extends string>(
  headers: string[],
  aliases: Record<Field, string[]>,
): Partial<Record<Field, string>> {
  const normalizedToOriginal = new Map<string, string>()
  for (const header of headers) {
    const normalized = normalizeHeader(header)
    if (!normalizedToOriginal.has(normalized)) {
      normalizedToOriginal.set(normalized, header)
    }
  }

  const result: Partial<Record<Field, string>> = {}
  for (const field of Object.keys(aliases) as Field[]) {
    for (const alias of aliases[field]) {
      const match = normalizedToOriginal.get(normalizeHeader(alias))
      if (match !== undefined) {
        result[field] = match
        break
      }
    }
  }
  return result
}
