import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { auth, type Session } from '../lib/api'
import type { User, Role } from '../lib/types'

interface AuthCtx {
  user: User | null
  session: Session | null
  loading: boolean
  loginAs: (role: Role) => Promise<void>
  login: (input: { email: string; password: string; remember?: boolean }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    auth.currentSession().then((s) => { if (alive) { setSession(s); setLoading(false) } })
    return () => { alive = false }
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      loginAs: async (role) => {
        const next = await auth.loginAs(role)
        setSession(next)
      },
      login: async (input) => {
        const next = await auth.login(input)
        setSession(next)
      },
      logout: async () => {
        await auth.logout()
        setSession(null)
      },
    }),
    [session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
