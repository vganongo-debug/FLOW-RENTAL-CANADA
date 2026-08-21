import { NavLink, Outlet } from 'react-router-dom'
import { Users, AlertCircle, Handshake, FileText, Award } from 'lucide-react'
import { cn } from '../../lib/utils'

const TABS = [
  { to: '/rewards/members',      label: 'Members',       icon: Users },
  { to: '/rewards/disputes',     label: 'Disputes',      icon: AlertCircle },
  { to: '/rewards/partnerships', label: 'Partnerships',  icon: Handshake },
  { to: '/rewards/audit',        label: 'Audit log',     icon: FileText },
  { to: '/rewards/tiers',        label: 'Tiers',         icon: Award },
]

export default function RewardsLayout() {
  return (
    <div className="space-y-5">
      <header>
        <div className="label-caps text-g40">Flow Rewards · Manager</div>
        <h1 className="font-display text-3xl text-ink dark:text-ivory">Loyalty Programme</h1>
        <p className="text-sm text-g40 dark:text-g60 mt-1">
          Members · disputes · partner reconciliation · audit log · tier configuration.
        </p>
      </header>

      <nav className="flex border-b border-g20/60 overflow-x-auto flow-scroll -mb-px">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition',
                isActive ? 'border-teal text-teal' : 'border-transparent text-g40 hover:text-ink dark:hover:text-ivory'
              )
            }
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
