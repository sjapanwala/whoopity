import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { importFiles } from '../lib/csv/importFiles'
import { generateDemoData } from '../lib/demo/generateDemoData'
import {
  clearAllData,
  exportDatasetAsJson,
  loadDataset,
  saveDataset,
} from '../db/repository'
import { emptyDataset, type WhoopDataset } from '../types/whoop'

type Status = 'loading' | 'ready' | 'error'

interface DataContextValue {
  dataset: WhoopDataset
  status: Status
  error: string | null
  isDemo: boolean
  importFromFiles: (files: File[]) => Promise<string[]>
  loadDemoData: () => Promise<void>
  downloadJsonExport: () => Promise<void>
  deleteAllData: () => Promise<void>
}

const DEMO_FLAG_KEY = 'whoopity:isDemo'

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<WhoopDataset>(emptyDataset)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_FLAG_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    let cancelled = false
    loadDataset()
      .then((loaded) => {
        if (cancelled) return
        setDataset(loaded)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load data.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const markDemo = useCallback((value: boolean) => {
    setIsDemo(value)
    try {
      if (value) sessionStorage.setItem(DEMO_FLAG_KEY, 'true')
      else sessionStorage.removeItem(DEMO_FLAG_KEY)
    } catch {
      // ignore storage failures
    }
  }, [])

  const importFromFiles = useCallback(
    async (files: File[]) => {
      const { dataset: parsed, warnings } = await importFiles(files)
      await saveDataset(parsed)
      const reloaded = await loadDataset()
      setDataset(reloaded)
      markDemo(false)
      return warnings
    },
    [markDemo],
  )

  const loadDemoData = useCallback(async () => {
    await clearAllData()
    const demo = generateDemoData()
    await saveDataset(demo)
    setDataset(demo)
    markDemo(true)
  }, [markDemo])

  const downloadJsonExport = useCallback(async () => {
    const json = await exportDatasetAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `whoopity-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const deleteAllData = useCallback(async () => {
    await clearAllData()
    setDataset(emptyDataset())
    markDemo(false)
  }, [markDemo])

  return (
    <DataContext.Provider
      value={{
        dataset,
        status,
        error,
        isDemo,
        importFromFiles,
        loadDemoData,
        downloadJsonExport,
        deleteAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
