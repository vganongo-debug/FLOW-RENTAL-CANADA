import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Hotel, Car, CreditCard, Award, Globe2,
  BarChart3, Settings, Users, Map, Package, Building2,
  ChevronLeft, ChevronRight, BellPlus, Headphones, ChevronDown,
  MapPin, Boxes, AlertCircle, Handshake, FileText, ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { FlowWordmark } from './FlowWordmark'
import type { Role } from '../../lib/types'

type Item = { to: string; key: string; icon: React.ComponentType<{ className?: string }> }
type Section = { titleKey: string; roles: Role[]; items: Item[] }

const NAV: Section[] = [
  {
    roles: ['superadmin'],
    titleKey: 'global',
    items: [
      { to: '/admin/portfolio', key: 'portfolio', icon: Globe2 },
      { to: '/admin/properties', key: 'properties', icon: Building2 },
      { to: '/admin/users', key: 'users', icon: Users },
      { to: '/admin/channels', key: 'channels', icon: BellPlus },
      { to: '/admin/procurement', key: 'procurement', icon: Package },
      { to: '/admin/security', key: 'security', icon: ShieldCheck },
      { to: '/admin/settings', key: 'settings', icon: Settings },
    ],
  },
  {
    roles: ['country_manager'],
    titleKey: 'country',
    items: [
      { to: '/country/locations', key: 'locations', icon: MapPin },
    ],
  },
  {
    roles: ['superadmin', 'country_manager', 'hotel_manager'],
    titleKey: 'hotels',
    items: [
      { to: '/hotels/dashboard', key: 'dashboard', icon: LayoutDashboard },
      { to: '/hotels/reservations', key: 'reservations', icon: Hotel },
      { to: '/hotels/rooms', key: 'rooms', icon: Hotel },
      { to: '/hotels/housekeeping', key: 'housekeeping', icon: Hotel },
      { to: '/hotels/front-desk', key: 'frontDesk', icon: Headphones },
      { to: '/hotels/guests', key: 'guests', icon: Users },
      { to: '/hotels/fnb', key: 'fnb', icon: Hotel },
      { to: '/hotels/inventory', key: 'inventory', icon: Boxes },
      { to: '/hotels/reports', key: 'reports', icon: BarChart3 },
    ],
  },
  {
    roles: ['superadmin', 'country_manager', 'car_agent'],
    titleKey: 'fleet',
    items: [
      { to: '/fleet/dashboard', key: 'dashboard', icon: LayoutDashboard },
      { to: '/fleet/vehicles', key: 'vehicles', icon: Car },
      { to: '/fleet/bookings', key: 'rentals', icon: Car },
      { to: '/fleet/kiosk', key: 'kiosk', icon: Headphones },
      { to: '/fleet/drivers', key: 'drivers', icon: Users },
      { to: '/fleet/gps', key: 'gps', icon: Map },
      { to: '/fleet/reports', key: 'reports', icon: BarChart3 },
    ],
  },
  {
    roles: ['fleet_partner'],
    titleKey: 'partner',
    items: [
      { to: '/fleet/partner-portal', key: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    roles: ['superadmin', 'country_manager'],
    titleKey: 'finance',
    items: [
      { to: '/payments/dashboard', key: 'pay', icon: CreditCard },
      { to: '/payments/invoices', key: 'invoices', icon: CreditCard },
      { to: '/payments/payouts', key: 'payouts', icon: CreditCard },
      { to: '/payments/accounting', key: 'accounting', icon: BarChart3 },
    ],
  },
  {
    roles: ['superadmin', 'reward_manager'],
    titleKey: 'rewards',
    items: [
      { to: '/rewards/members',      key: 'rewardsMembers',     icon: Users },
      { to: '/rewards/disputes',     key: 'rewardsDisputes',    icon: AlertCircle },
      { to: '/rewards/partnerships', key: 'rewardsPartnerships',icon: Handshake },
      { to: '/rewards/audit',        key: 'rewardsAudit',       icon: FileText },
      { to: '/rewards/tiers',        key: 'rewardsTiers',       icon: Award },
    ],
  },
  {
    roles: ['superadmin', 'country_manager', 'hotel_manager', 'car_agent', 'fleet_partner', 'reward_manager'],
    titleKey: 'comms',
    items: [
      { to: '/messages', key: 'messages', icon: MessageSquare },
    ],
  },
  {
    roles: ['superadmin', 'country_manager', 'hotel_manager', 'car_agent'],
    titleKey: 'insights',
    items: [{ to: '/reports', key: 'reports', icon: BarChart3 }],
  },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function FlowSidebar({ collapsed, onToggle }: Props) {
  const { user } = useAuth()
  const { t } = useTranslation()
  if (!user) return null
  const sections = NAV.filter((s) => s.roles.includes(user.role))

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-coal text-ivory border-r border-g20/30 flex flex-col transition-[width] duration-200 z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex items-center h-14 px-4 border-b border-g20/30', collapsed && 'justify-center px-0')}>
        {collapsed ? (
          <span className="font-display font-semibold text-xl text-copper">F</span>
        ) : (
          <FlowWordmark size="md" variant="dark" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto flow-scroll py-3">
        {sections.map((section, idx) => (
          <SidebarSection key={idx} section={section} collapsed={collapsed} />
        ))}
      </nav>

      <div className={cn('border-t border-g20/30 p-3', collapsed && 'px-2')}>
        {!collapsed && (
          <div className="mb-3 px-2">
            <div className="text-sm font-medium text-ivory truncate">{user.name}</div>
            <div className="text-xs text-g60 truncate">{t(`roles.${user.role}`)}</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-input px-2 py-1.5 text-xs text-g80 hover:bg-panel-mid transition'
          )}
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (<><ChevronLeft className="h-4 w-4" /> {t('common.collapse')}</>)}
        </button>
      </div>
    </aside>
  )
}

function SidebarSection({ section, collapsed }: { section: Section; collapsed: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  return (
    <div className="px-2 py-2">
      {!collapsed && section.titleKey && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-2 mb-1 label-caps text-g60 hover:text-ivory"
        >
          {t(`nav.sections.${section.titleKey}`)}
          <ChevronDown className={cn('h-3 w-3 transition-transform', !open && '-rotate-90')} />
        </button>
      )}
      {open && (
        <ul className="space-y-0.5">
          {section.items.map((item, idx) => (
            <li key={`${item.to}-${idx}`}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-input px-2 py-1.5 text-sm font-medium transition-colors',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-teal text-white'
                      : 'text-g80 hover:bg-panel-mid hover:text-ivory'
                  )
                }
                title={collapsed ? t(`nav.items.${item.key}`) : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{t(`nav.items.${item.key}`)}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
