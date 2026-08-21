import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { FlowSidebar } from '../flow/FlowSidebar'
import { FlowTopNav } from '../flow/FlowTopNav'
import { FlowBreadcrumbs } from '../flow/FlowBreadcrumbs'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

export function AppLayout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-coal text-g40" role="status" aria-live="polite">
        <div className="animate-pulse text-sm label-caps">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex bg-ivory dark:bg-coal min-h-screen text-ink dark:text-ivory">
      {/* Skip to main content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-input focus:bg-teal focus:text-white focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <FlowSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 transition-opacity',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={cn(
          'absolute inset-y-0 left-0 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <FlowSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden flex items-center h-12 px-3 bg-white dark:bg-panel-mid border-b border-g20/60">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="p-2 rounded-input text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-panel"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="ml-2 font-display font-semibold text-lg tracking-tight">
            <span className="text-ink dark:text-ivory">Flow</span><span className="text-copper"> Rentals</span>
          </span>
        </div>
        <FlowTopNav />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <FlowBreadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
