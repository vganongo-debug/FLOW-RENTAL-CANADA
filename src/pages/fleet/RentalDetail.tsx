/**
 * Detail page for a single car rental.
 *
 * Route: /fleet/bookings/:id
 *
 * Shows pickup/return, vehicle pill, owner (Flow vs partner), KPIs, and the
 * Rewards transactions / conversation threads attached to the booking.
 */
import { Navigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Calendar, Car, FileText, MapPin, MessageSquare, User } from 'lucide-react'
import { FlowDetailHeader } from '../../components/flow/FlowDetailHeader'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowRef, FlowLinkify } from '../../components/flow/FlowRef'
import { RENTAL_BOOKINGS, VEHICLES, FLEET_PARTNERS } from '../../lib/sampleData'
import type { RentalBooking } from '../../lib/types'
import { backlinksFor } from '../../lib/refs'
import { formatCurrency, formatDate } from '../../lib/utils'

const STATUS_TONE = {
  checked_in: 'active', confirmed: 'info', pending: 'pending',
  cancelled: 'cancelled', checked_out: 'completed', no_show: 'cancelled',
} as const

export default function RentalDetail() {
  const { id } = useParams<{ id: string }>()
  const [r, setR] = useState<RentalBooking | null>(null)

  useEffect(() => {
    if (!id) return
    try {
      const raw = window.localStorage.getItem('flow-os.rentals')
      const list: RentalBooking[] = raw ? JSON.parse(raw) : RENTAL_BOOKINGS
      setR(list.find((x) => x.id === id) ?? null)
    } catch {
      setR(RENTAL_BOOKINGS.find((x) => x.id === id) ?? null)
    }
  }, [id])

  const links = useMemo(() => (id ? backlinksFor(id) : null), [id])
  const vehicle = r ? VEHICLES.find((v) => v.plate === r.vehiclePlate) : null
  const partner = r?.partnerName
    ? FLEET_PARTNERS.find((p) => p.name === r.partnerName)
    : null

  if (!id) return <Navigate to="/fleet/bookings" replace />
  if (!r) {
    return (
      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-8 text-center">
        <FileText className="h-10 w-10 mx-auto text-g40 mb-3" />
        <h2 className="font-display text-xl text-ink dark:text-ivory">Rental not found</h2>
        <p className="text-sm text-g40 mt-1">No booking matches <span className="font-mono">{id}</span>.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FlowDetailHeader
        backTo="/fleet/bookings"
        backLabel="All rentals"
        eyebrow={<span>Rental · <span className="font-mono">{r.id}</span></span>}
        title={r.clientName}
        subtitle={`${r.vehicleLabel} · ${r.vehiclePlate}`}
        status={<FlowStatusBadge tone={STATUS_TONE[r.status]} dot>{r.status.replace(/_/g, ' ')}</FlowStatusBadge>}
        actions={
          <>
            <button className="text-xs px-3 py-1.5 rounded-input border border-g20 hover:border-teal text-ink dark:text-ivory">
              Edit
            </button>
            <button className="text-xs px-3 py-1.5 rounded-input bg-copper text-white hover:bg-copper-dark">
              Mark returned
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Days" value={r.days} hint={`${formatDate(r.startDate)} → ${formatDate(r.endDate)}`} accent="teal" />
        <FlowKPICard label="Daily rate" value={formatCurrency(r.ratePerDayUsd)} hint={r.tier} />
        <FlowKPICard label="Total" value={formatCurrency(r.totalUsd)} hint={`Owner: ${r.owner}`} />
        <FlowKPICard label="Pick-up" value={r.pickupLocation} hint={`Return: ${r.returnLocation}`} accent="ink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5">
          <h3 className="label-caps text-g40 mb-4">Rental details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail icon={<User className="h-4 w-4" />} label="Client" value={r.clientName} />
            <Detail icon={<Car className="h-4 w-4" />} label="Vehicle"
              value={vehicle
                ? <FlowRef id={vehicle.id} variant="inline" label={`${r.vehicleLabel} · ${r.vehiclePlate}`} />
                : `${r.vehicleLabel} · ${r.vehiclePlate}`
              }
            />
            <Detail label="Tier" value={r.tier} />
            <Detail label="Owner"
              value={r.owner === 'flow'
                ? <FlowStatusBadge tone="info" dot>Flow-owned</FlowStatusBadge>
                : partner
                  ? <FlowRef id={partner.id} variant="inline" label={`Partner · ${partner.name}`} />
                  : `Partner · ${r.partnerName}`
              }
            />
            <Detail icon={<MapPin className="h-4 w-4" />} label="Pick-up location" value={r.pickupLocation} />
            <Detail icon={<MapPin className="h-4 w-4" />} label="Return location" value={r.returnLocation} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Start" value={formatDate(r.startDate)} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="End" value={formatDate(r.endDate)} />
            <Detail label="Days" value={String(r.days)} />
            <Detail label="Total" value={<span className="text-copper font-bold">{formatCurrency(r.totalUsd)}</span>} />
          </dl>
        </section>

        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 space-y-4">
          <h3 className="label-caps text-g40">Related</h3>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Conversations
            </div>
            {links && links.conversations.length > 0 ? (
              <ul className="space-y-1.5">
                {links.conversations.map((c) => (
                  <li key={c.id}><FlowRef id={c.id} /></li>
                ))}
              </ul>
            ) : <p className="text-xs text-g40 italic">No threads yet</p>}
          </div>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Rewards activity</div>
            {links && links.rewardsTransactions.length > 0 ? (
              <ul className="space-y-1.5">
                {links.rewardsTransactions.map((t) => (
                  <li key={t.id} className="text-xs flex items-center gap-2 flex-wrap">
                    <FlowRef id={t.id} />
                    <FlowLinkify text={t.reason} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-g40 italic">No points earned/burned</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="label-caps text-g40 flex items-center gap-1 mb-0.5">
        {icon}{label}
      </dt>
      <dd className="text-ink dark:text-ivory">{value}</dd>
    </div>
  )
}
