export interface SeriesPoint {
  date: string
  value: number | null
}

/** Projects an array of dated records into a {date, value} series for charting/analysis. */
export function toSeries<T extends { date: string }>(
  records: T[],
  accessor: (record: T) => number | null,
): SeriesPoint[] {
  return records.map((record) => ({ date: record.date, value: accessor(record) }))
}

/** Sorts a series by date ascending (WHOOP CSV rows aren't guaranteed ordered). */
export function sortByDate(series: SeriesPoint[]): SeriesPoint[] {
  return [...series].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Centered-trailing simple moving average: each point averages itself and up
 * to `windowSize - 1` preceding points, skipping nulls. Returns null for a
 * point only when there's no non-null data in its window.
 */
export function rollingAverage(series: SeriesPoint[], windowSize: number): SeriesPoint[] {
  const sorted = sortByDate(series)
  return sorted.map((point, index) => {
    const windowStart = Math.max(0, index - windowSize + 1)
    const windowValues = sorted
      .slice(windowStart, index + 1)
      .map((p) => p.value)
      .filter((v): v is number => v !== null)
    if (windowValues.length === 0) return { date: point.date, value: null }
    const avg = windowValues.reduce((sum, v) => sum + v, 0) / windowValues.length
    return { date: point.date, value: avg }
  })
}
