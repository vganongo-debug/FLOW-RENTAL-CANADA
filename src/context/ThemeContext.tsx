import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

type Mode = 'light' | 'dark'

interface ThemeCtx {
  mode: Mode
  toggle: () => void
  setMode: (m: Mode) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)
const STORAGE_KEY = 'flow-os.theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem(STORAGE_KEY) as Mode) || 'light'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
