import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const COPY: Record<string, string> = {
  '/hotels/rooms': 'Room Management — split view with room list and detail tabs (history, maintenance, photos).',
  '/hotels/housekeeping': 'Housekeeping Kanban — drag rooms across To Clean → In Progress → Inspecting → Ready.',
  '/hotels/front-desk': 'Front Desk wizard — 6-step check-in: search, ID verify, room assign, payment, contract, key card.',
  '/hotels/guests': 'Guest Profiles — search, profile, stay history, preferences, documents, notes.',
  '/hotels/fnb': 'F&B Management — table grid, active orders, menu CRUD, daily revenue summary.',
  '/hotels/reports': 'Hotel Reports — occupancy, revenue, channel mix, guest nationality, AR aging.',
  '/fleet/vehicles': 'Vehicle Inventory — grid + list, tier filter, owner badge, detail tabs.',
  '/fleet/bookings': 'Rental Bookings — full table with pre/post-rental condition photos and digital agreement.',
  '/fleet/kiosk': 'Airport Kiosk — tablet-optimised arrivals + returns side-by-side with walk-in flow.',
  '/fleet/drivers': 'Driver Management — list, profile, mission log, performance rating.',
  '/fleet/gps': 'Live GPS Tracking — full-screen fleet map with alerts panel.',
  '/fleet/reports': 'Fleet Reports — utilisation, revenue by tier, partner payout summary.',
  '/payments/dashboard': 'Flow Pay — multi-currency dashboard, payment intake, finance KPIs.',
  '/payments/invoices': 'Invoicing — generator, status tracking, bulk export.',
  '/payments/payouts': 'Partner Payouts — weekly queue, approve, history ledger.',
  '/payments/accounting': 'Accounting & Tax — country tax rules, monthly summaries, URA/DGI/MoR/KRA/SARS exports.',
  '/rewards': 'Flow Rewards admin — members, tier progress, redemption log.',
  '/admin/properties': 'Property Management — list, add property wizard.',
  '/admin/users': 'Users & Roles — permission matrix, invite flow.',
  '/admin/channels': 'Channel Manager — Booking.com / Expedia / Airbnb / Direct, parity alerts.',
  '/admin/procurement': 'Procurement — VBMS Tunisia supply chain, purchase orders.',
  '/admin/settings': 'System Settings — currencies, tax, templates, API keys, backups.',
  '/reports': 'Custom report builder — drag-and-drop metrics with multi-format export.',
  '/booking/checkout': '4-step booking checkout: dates/options → guest → add-ons → payment.',
  '/booking/confirmation': 'Confirmation — booking ref, QR, calendar download.',
  '/booking/account': 'Guest account — upcoming/past bookings, Flow Rewards, profile.',
}

export default function Placeholder() {
  const { pathname } = useLocation()
  const note = COPY[pathname] ?? 'This screen is queued for the next build phase.'

  return (
    <div className="rounded-card border border-dashed border-g20 bg-white dark:bg-panel-mid p-10 text-center">
      <Construction className="h-10 w-10 text-copper mx-auto mb-3" />
      <h1 className="font-display text-2xl text-ink dark:text-ivory">Phase 2 build</h1>
      <p className="text-sm text-g40 dark:text-g60 max-w-xl mx-auto mt-2">{note}</p>
      <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-badge bg-teal-light text-teal-dark text-xs label-caps">
        Route active · {pathname}
      </div>
    </div>
  )
}
