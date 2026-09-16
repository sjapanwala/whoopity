import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns'
import type { SeriesPoint } from './series'

export interface HeatmapCell {
  date: string
  value: number | null
}

/**
 * Lays a series out as GitHub-contribution-style weeks: Sunday-start weeks,
 * padded with null cells so every week is a full 7 days, spanning [start, end].
 */
export function buildHeatmapWeeks(
  series: SeriesPoint[],
  start: string,
  end: string,
): HeatmapCell[][] {
  const valueByDate = new Map(series.map((p) => [p.date, p.value]))
  const gridStart = startOfWeek(new Date(`${start}T00:00:00`))
  const gridEnd = endOfWeek(new Date(`${end}T00:00:00`))

  const cells: HeatmapCell[] = eachDayOfInterval({ start: gridStart, end: gridEnd }).map(
    (day) => {
      const date = format(day, 'yyyy-MM-dd')
      return { date, value: valueByDate.get(date) ?? null }
    },
  )

  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}
