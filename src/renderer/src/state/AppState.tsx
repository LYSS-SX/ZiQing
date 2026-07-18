import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { createDefaultAppData } from '../../../shared/defaults'
import type { AppData, NavId } from '../../../shared/types'
import bank from '../content/questions.json'
import type { Question } from '../../../shared/types'

interface AppStateValue {
  ready: boolean
  data: AppData
  questions: Question[]
  nav: NavId
  setNav: (n: NavId) => void
  save: (data: AppData) => Promise<void>
  reload: () => Promise<void>
  isPopup: boolean
}

const Ctx = createContext<AppStateValue | null>(null)

export function AppStateProvider({
  children,
  isPopup = false
}: {
  children: ReactNode
  isPopup?: boolean
}): JSX.Element {
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<AppData>(createDefaultAppData())
  const [nav, setNav] = useState<NavId>('map')
  const questions = (bank as { questions: Question[] }).questions

  const reload = useCallback(async () => {
    if (window.ziqing?.getData) {
      const d = await window.ziqing.getData()
      setData(d)
    } else {
      // browser fallback for vite-only preview
      const raw = localStorage.getItem('ziqing-data')
      setData(raw ? (JSON.parse(raw) as AppData) : createDefaultAppData())
    }
    setReady(true)
  }, [])

  const save = useCallback(async (next: AppData) => {
    setData(next)
    if (window.ziqing?.setData) {
      await window.ziqing.setData(next)
    } else {
      localStorage.setItem('ziqing-data', JSON.stringify(next))
    }
  }, [])

  useEffect(() => {
    void reload()
    const off = window.ziqing?.onDataChanged?.(() => {
      void reload()
    })
    return () => off?.()
  }, [reload])

  useEffect(() => {
    document.documentElement.dataset.theme = data.profile.settings.theme
  }, [data.profile.settings.theme])

  const value = useMemo(
    () => ({ ready, data, questions, nav, setNav, save, reload, isPopup }),
    [ready, data, questions, nav, save, reload, isPopup]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppStateValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
