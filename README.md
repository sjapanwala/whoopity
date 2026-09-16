# whoopity

A personal WHOOP dashboard that runs entirely as static files. Import a WHOOP
data export and get trends, breakdowns, and insights beyond what the WHOOP app
shows — recovery, strain, sleep, workouts, HRV, and correlations between them.

Everything happens in your browser. Your data is parsed client-side and stored
in IndexedDB; nothing is uploaded anywhere, there's no analytics, and no
third-party network calls.

## Local development

Requires Node 20.19+ or 22.12+ (the toolchain — Vite 6, ESLint 9 — warns on
older Node 20.x patch versions, though it still runs).

```bash
npm install
npm run dev       # start the dev server
npm test          # run the Vitest suite
npm run lint      # ESLint
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

On first load, click **Load demo data** on the empty state (or the Data page)
to explore the app with realistic generated data before importing anything
real.

## Getting your WHOOP data

1. In the WHOOP app: **profile icon → Account → Privacy → Download My Data**.
2. WHOOP emails you a link to a `.zip` file, usually within a day. It contains
   `physiological_cycles.csv`, `sleeps.csv`, `workouts.csv`, and
   `journal_entries.csv`.
3. Drop that `.zip` (or the individual CSVs) onto the **Data** page in the
   app. Everything is parsed and stored locally — nothing leaves your browser.

Re-importing a newer export merges and de-duplicates against what's already
stored, so you can periodically re-export and drop the new zip in without
losing history.

### About the CSV column mapping

WHOOP doesn't publish the exact column names in these exports, and they've
changed across app versions. The importer (`src/lib/csv`) maps a list of
known/likely header spellings into the app's internal data model, matching
case-, punctuation-, and unit-insensitively (`"Recovery score %"` and
`"recovery_score"` both match). If a field in the app shows up empty after
importing a real export, check `src/lib/csv/aliases.ts` — the header it's
looking for is probably just spelled differently than assumed there, and you
can add the real spelling to the alias list.

## Deploying

The app builds to a static `dist/` folder — any static host works.

### GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and deploys automatically
on every push to `main`. To enable it:

1. In your GitHub repo, go to **Settings → Pages** and set **Source** to
   "GitHub Actions".
2. Push to `main`. The workflow builds with `GITHUB_PAGES=true` (which points
   the app's base path at `/<repo-name>/`, since project Pages sites are
   served from a subpath) and deploys the result.

To deploy manually instead:

```bash
GITHUB_PAGES=true npm run build
```

then publish the contents of `dist/` however you like (e.g. `gh-pages`
branch).

### Cloudflare Pages / Netlify

Both serve from the domain root, so no base-path override is needed:

- **Build command:** `npm run build`
- **Output directory:** `dist`

On Cloudflare Pages or Netlify's dashboards, point a new project at this repo
with those settings and it'll build and deploy on every push.

## Live WHOOP API sync

Not implemented. This build is CSV-import-only by design — if you want live
OAuth sync from the WHOOP API added later, note that WHOOP's OAuth flow
requires a `client_secret` (no PKCE-only public-client flow is documented) and
doesn't document CORS support for browser calls, so that would need a small
server-side proxy (e.g. a Cloudflare Worker) for the token exchange and API
calls — the app's data model and storage layer are already structured to
accept that as an additional data source alongside CSV import.

## Tech stack

- Vite + React + TypeScript (strict) + Tailwind CSS v4
- Charts are hand-rolled inline SVG (`src/components/charts`, `src/lib/charts`) — no charting library dependency
- [Dexie](https://dexie.org) (IndexedDB) for storage, PapaParse for CSV,
  JSZip for reading the export zip, date-fns for date math
- Hash-based routing (`react-router-dom`'s `HashRouter`), so it works from any
  static host/subpath without server-side routing config
- Vitest for unit tests — parsing and metrics logic (`src/lib`) is pure
  functions, tested independently of the UI

## Project structure

```
src/
  types/       Typed data model (Cycle, Sleep, Workout, JournalEntry)
  lib/
    csv/       CSV/zip parsing, header mapping, import orchestration
    metrics/   Pure functions: baselines, rolling averages, correlations,
               streaks, sport totals, heatmap grid, etc. (all unit-tested)
    demo/      Deterministic demo-data generator
    theme/     Chart color tokens
  db/          Dexie schema + save/load/export/clear
  state/       React context: theme, imported dataset
  components/  Shared UI (charts, ring, tiles, layout)
  pages/       Overview, Trends, Sleep, Workouts, Insights, Data
```
