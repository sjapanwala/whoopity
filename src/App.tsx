import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { DataGate } from './components/DataGate'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { DataProvider } from './state/data'
import { ProfileProvider } from './state/profile'

// Recharts pulls in a lot of code — code-split the chart-heavy pages so the
// Overview (the common landing view) stays fast on first load.
const Trends = lazy(() => import('./pages/Trends').then((m) => ({ default: m.Trends })))
const Sleep = lazy(() => import('./pages/Sleep').then((m) => ({ default: m.Sleep })))
const Workouts = lazy(() => import('./pages/Workouts').then((m) => ({ default: m.Workouts })))
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })))
const AthleticLevel = lazy(() => import('./pages/AthleticLevel').then((m) => ({ default: m.AthleticLevel })))
const Data = lazy(() => import('./pages/Data').then((m) => ({ default: m.Data })))

function RouteFallback() {
  return <p className="text-sm text-ink-muted">Loading…</p>
}

function App() {
  return (
    <DataProvider>
      <ProfileProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route
                index
                element={
                  <DataGate>
                    <Overview />
                  </DataGate>
                }
              />
              <Route
                path="trends"
                element={
                  <DataGate>
                    <Suspense fallback={<RouteFallback />}>
                      <Trends />
                    </Suspense>
                  </DataGate>
                }
              />
              <Route
                path="sleep"
                element={
                  <DataGate>
                    <Suspense fallback={<RouteFallback />}>
                      <Sleep />
                    </Suspense>
                  </DataGate>
                }
              />
              <Route
                path="workouts"
                element={
                  <DataGate>
                    <Suspense fallback={<RouteFallback />}>
                      <Workouts />
                    </Suspense>
                  </DataGate>
                }
              />
              <Route
                path="insights"
                element={
                  <DataGate>
                    <Suspense fallback={<RouteFallback />}>
                      <Insights />
                    </Suspense>
                  </DataGate>
                }
              />
              <Route
                path="athletic-level"
                element={
                  <DataGate>
                    <Suspense fallback={<RouteFallback />}>
                      <AthleticLevel />
                    </Suspense>
                  </DataGate>
                }
              />
              <Route
                path="data"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Data />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </HashRouter>
      </ProfileProvider>
    </DataProvider>
  )
}

export default App
