export type WhoopFileType = 'cycles' | 'sleeps' | 'workouts' | 'journal'

const PATTERNS: [WhoopFileType, RegExp][] = [
  ['cycles', /physiological[_\s-]?cycles|^cycles?\b/i],
  ['sleeps', /sleeps?\b/i],
  ['workouts', /workouts?\b/i],
  ['journal', /journal[_\s-]?entries|journal\b/i],
]

/** Guesses which WHOOP export CSV a file is, from its filename alone. */
export function detectFileType(fileName: string): WhoopFileType | null {
  const base = fileName.toLowerCase().replace(/\.csv$/, '')
  for (const [type, pattern] of PATTERNS) {
    if (pattern.test(base)) return type
  }
  return null
}
