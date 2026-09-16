import { useCallback, useState } from 'react'

export interface TooltipState {
  x: number
  y: number
  lines: string[]
}

/**
 * Shared hover-tooltip state for the hand-rolled SVG charts. A chart calls
 * `show(clientX, clientY, lines)` on mousemove and `hide()` on mouseleave;
 * render the result with `<ChartTooltip state={...} />` once per chart.
 */
export function useChartTooltip() {
  const [state, setState] = useState<TooltipState | null>(null)
  const show = useCallback((x: number, y: number, lines: string[]) => setState({ x, y, lines }), [])
  const hide = useCallback(() => setState(null), [])
  return { state, show, hide }
}
