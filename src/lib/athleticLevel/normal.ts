/**
 * Standard normal distribution CDF and its inverse (quantile function).
 * Used to turn a (value, mean, sd) triple into a percentile and back — see
 * percentile.ts. Both are closed-form rational/series approximations (no
 * external stats library needed); accurate to well within what an
 * illustrative benchmark needs.
 */

/** Abramowitz & Stegun 7.1.26 approximation of the error function, max error ~1.5e-7. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const t = 1 / (1 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return sign * y
}

/** P(Z <= z) for a standard normal Z. */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/**
 * Inverse standard normal CDF (quantile function) via Acklam's rational
 * approximation — relative error <= 1.15e-9 across (0, 1).
 */
export function inverseNormalCdf(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  // Coefficients for the rational approximations, split by region.
  const [a0, a1, a2, a3, a4, a5] = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1,
    2.506628277459239e0,
  ]
  const [b0, b1, b2, b3, b4] = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1,
  ]
  const [c0, c1, c2, c3, c4, c5] = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0,
    2.938163982698783e0,
  ]
  const [d0, d1, d2, d3] = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
  }
  if (p <= pHigh) {
    const q = p - 0.5
    const r = q * q
    return (
      ((((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q) /
      (((((b0 * r + b1) * r + b2) * r + b3) * r + b4) * r + 1)
    )
  }
  const q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
}
