/**
 * <FlowBreadcrumbs> · derives a breadcrumb trail from the current route.
 *
 * Static segments are labelled from the BREADCRUMB_LABELS map. Dynamic entity
 * segments (e.g. `/hotels/reservations/RES-2026001`) are resolved through
 * `resolveRef` so the crumb shows the human-friendly label (guest name, etc.)
 * instead of the raw ID.
 *
 * The component is intentionally self-contained · it reads useLocation and
 * never receives props, so it can be dropped into any layout.
 */
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { resolveRef } from '../../lib/refs'
import { cn } from '../../lib/utils'

interface Crumb {
  label: string
  href: string
  isLast: boolean
}

/**
 * Static path → human label. Keys are the URL segment (single level).
 */
const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Admin',
  portfolio: 'Portfolio',
  properties: 'Properties',
  users: 'Users',
  channels: 'Channel Manager',
  procurement: 'Procurement',
  security: 'Security',
  settings: 'Settings',
  hotels: 'Hotels',
  dashboard: 'Dashboard',
  reservations: 'Reservations',
  rooms: 'Rooms',
  housekeeping: 'Housekeeping',
  'front-desk': 'Front Desk',
  guests: 'Guests',
  fnb: 'F&B',
  reports: 'Reports',
  inventory: 'Inventory',
  fleet: 'Fleet',
  vehicles: 'Vehicles',
  bookings: 'Rentals',
  kiosk: 'Airport Kiosk',
  drivers: 'Drivers',
  gps: 'GPS Tracking',
  'partner-portal': 'Partner Portal',
  payments: 'Payments',
  invoices: 'Invoices',
  payouts: 'Payouts',
  accounting: 'Accounting',
  rewards: 'Flow Rewards',
  members: 'Members',
  disputes: 'Disputes',
  partnerships: 'Partnerships',
  audit: 'Audit Log',
  tiers: 'Tiers',
  messages: 'Inbox',
}

function labelFor(segment: string, fullPath: string): string {
  // Try resolving as an entity ID first (e.g. RES-2026001 → "RES-2026001 · Sarah Bennett")
  const ref = resolveRef(segment)
  if (ref) return ref.label
  // Fall back to the static map
  if (BREADCRUMB_LABELS[segment]) return BREADCRUMB_LABELS[segment]
  // Last resort: title-case the segment
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FlowBreadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation()
  // Hide on auth and root routes
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/booking')) return null

  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null

  const crumbs: Crumb[] = parts.map((seg, i) => ({
    label: labelFor(seg, parts.slice(0, i + 1).join('/')),
    href: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1 text-xs text-g40 dark:text-g60 overflow-x-auto whitespace-nowrap pb-2',
        className
      )}
    >
      <Link
        to="/"
        aria-label="Home"
        className="inline-flex items-center hover:text-teal transition-colors"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      {crumbs.map((c) => (
        <span key={c.href} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          {c.isLast ? (
            <span className="text-ink dark:text-ivory font-medium truncate max-w-[28ch]">{c.label}</span>
          ) : (
            <Link
              to={c.href}
              className="hover:text-teal transition-colors truncate max-w-[20ch]"
            >
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
