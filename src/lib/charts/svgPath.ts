/**
 * Pure SVG-geometry helpers shared by the hand-rolled chart components.
 * Smoothing itself uses `rollingAverage` from `../metrics/series` — these
 * only turn already-computed values into path/domain math.
 */

/** [min, max] with `padFrac` of headroom on each side (falls back to a tiny band if all values are equal). */
export function domain(values: number[], padFrac = 0.12): [number, number] {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = (hi - lo) * padFrac
  return pad > 0 ? [lo - pad, hi + pad] : [lo - 1, hi + 1]
}

/** SVG path `d` for a polyline of `values` mapped into a `w`x`h` box over `[min, max]`. Nulls break the line (gap, not interpolated). */
export function linePath(values: (number | null)[], min: number, max: number, w: number, h: number): string {
  const n = values.length
  const span = max - min || 1
  let d = ''
  let penDown = false
  for (let i = 0; i < n; i++) {
    const v = values[i]
    if (v === null || v === undefined) {
      penDown = false
      continue
    }
    const x = n < 2 ? 0 : (i / (n - 1)) * w
    const y = Math.max(1, Math.min(h - 1, h - ((v - min) / span) * h))
    d += `${penDown ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `
    penDown = true
  }
  return d.trim()
}

/** x, y for a single value at index `i` of `n` within a `w`x`h` box over `[min, max]`. */
export function pointAt(
  i: number,
  n: number,
  value: number,
  min: number,
  max: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const span = max - min || 1
  return {
    x: n < 2 ? 0 : (i / (n - 1)) * w,
    y: Math.max(1, Math.min(h - 1, h - ((value - min) / span) * h)),
  }
}

/** Maps a horizontal fraction (0-1, e.g. mouse position within a chart's bounding box) to the nearest data index. */
export function nearestIndex(fraction: number, n: number): number {
  return Math.round(Math.max(0, Math.min(1, fraction)) * (n - 1))
}

export interface ScatterPoint {
  cx: number
  cy: number
  x: number
  y: number
}

/** Projects `(x, y)` pairs into a `w`x`h` box, plus the least-squares regression line through them. */
export function scatterLayout(pairs: [number, number][], w: number, h: number): { points: ScatterPoint[]; fit: string } {
  const xs = pairs.map((p) => p[0])
  const ys = pairs.map((p) => p[1])
  const [x0, x1] = domain(xs, 0.08)
  const [y0, y1] = domain(ys, 0.08)
  const px = (v: number) => ((v - x0) / (x1 - x0 || 1)) * w
  const py = (v: number) => h - ((v - y0) / (y1 - y0 || 1)) * h

  const n = xs.length
  const mx = xs.reduce((s, v) => s + v, 0) / n
  const my = ys.reduce((s, v) => s + v, 0) / n
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx
    sxy += dx * (ys[i]! - my)
    sxx += dx * dx
  }
  const slope = sxx === 0 ? 0 : sxy / sxx
  const fitY = (x: number) => my + slope * (x - mx)

  return {
    points: pairs.map(([x, y]) => ({ cx: px(x), cy: py(y), x, y })),
    fit: `M${px(x0).toFixed(1)} ${py(fitY(x0)).toFixed(1)} L${px(x1).toFixed(1)} ${py(fitY(x1)).toFixed(1)}`,
  }
}

/** Index of the point in `points` nearest to `(mx, my)`, or null if none is within `maxDistPx`. */
export function nearestPointIndex(points: ScatterPoint[], mx: number, my: number, maxDistPx = 20): number | null {
  let best: number | null = null
  let bestDist = maxDistPx * maxDistPx
  points.forEach((p, i) => {
    const d = (p.cx - mx) ** 2 + (p.cy - my) ** 2
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}
