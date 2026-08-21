/**
 * Detail page for a single property (hotel, car-rental location, or both).
 *
 * Route: /admin/properties/:id
 *
 * Includes: address + GPS, KPIs (revenue, ebitda, status), partner pill, and
 * a "Related" panel surfacing vehicles, recent reservations, and threads.
 */
import { Navigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Building2, Calendar, Car, FileText, Mail, MapPin, Phone } from 'lucide-react'
import { FlowDetailHeader } from '../../components/flow/FlowDetailHeader'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowRef } from '../../components/flow/FlowRef'
import { PROPERTIES, VEHICLES } from '../../lib/sampleData'
import type { Property } from '../../lib/types'
import { backlinksFor } from '../../lib/refs'
import { formatCurrency, formatDate } from '../../lib/utils'

const TYPE_LABEL: Record<Property['type'], string> = {
  hotel: 'Hotel',
  car_rental: 'Car-rental location',
  both: 'Hotel & car rental',
}

const STATUS_TONE = { live: 'active', opening: 'pending', pilot: 'info' } as const

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const [p, setP] = useState<Property | null>(null)

  useEffect(() => {
    if (!id) return
    try {
      const raw = window.localStorage.getItem('flow-os.properties')
      const list: Property[] = raw ? JSON.parse(raw) : PROPERTIES
      setP(list.find((x) => x.id === id) ?? null)
    } catch {
      setP(PROPERTIES.find((x) => x.id === id) ?? null)
    }
  }, [id])

  const links = useMemo(() => (id ? backlinksFor(id) : null), [id])
  // Vehicles physically located here (best-effort match on city)
  const propertyVehicles = useMemo(() => {
    if (!p) return []
    return VEHICLES.filter((v) =>
      v.countryCode === p.countryCode &&
      (v.location.toLowerCase().includes(p.city.toLowerCase()) || v.gps.lat === p.gps?.lat)
    )
  }, [p])

  if (!id) return <Navigate to="/admin/properties" replace />
  if (!p) {
    return (
      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-8 text-center">
        <FileText className="h-10 w-10 mx-auto text-g40 mb-3" />
        <h2 className="font-display text-xl text-ink dark:text-ivory">Property not found</h2>
        <p className="text-sm text-g40 mt-1">No property matches <span className="font-mono">{id}</span>.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FlowDetailHeader
        backTo="/admin/properties"
        backLabel="All properties"
        eyebrow={<span>Property · {TYPE_LABEL[p.type]}</span>}
        title={p.name}
        subtitle={`${p.city} · ${p.country}`}
        status={<FlowStatusBadge tone={STATUS_TONE[p.status]} dot>{p.status}</FlowStatusBadge>}
        actions={
          <>
            <button className="text-xs px-3 py-1.5 rounded-input border border-g20 hover:border-teal text-ink dark:text-ivory">
              Edit
            </button>
            <button className="text-xs px-3 py-1.5 rounded-input bg-teal text-white hover:bg-teal-dark">
              View on map
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Monthly revenue" value={formatCurrency(p.monthlyRevenueUsd)} hint={`${p.ebitdaPct}% EBITDA`} accent="copper" />
        <FlowKPICard label="Rooms" value={p.rooms ?? '—'} hint={p.type === 'car_rental' ? 'N/A · car rental' : 'Listed inventory'} accent="teal" />
        <FlowKPICard label="Vehicles" value={p.vehicles ?? '—'} hint={p.type === 'hotel' ? 'N/A · hotel' : 'On-site fleet'} />
        <FlowKPICard
          label="Go-live"
          value={p.goLiveDate ? formatDate(p.goLiveDate) : '—'}
          hint={p.partnerId ? 'Partner-operated' : 'Flow-operated'}
          accent="ink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5">
          <h3 className="label-caps text-g40 mb-4">Property details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail icon={<Building2 className="h-4 w-4" />} label="Type" value={TYPE_LABEL[p.type]} />
            <Detail icon={<MapPin className="h-4 w-4" />} label="City" value={`${p.city}, ${p.country}`} />
            <Detail label="Address" value={p.address ?? '—'} />
            <Detail label="GPS" value={p.gps ? `${p.gps.lat.toFixed(4)}, ${p.gps.lng.toFixed(4)}` : '—'} />
            <Detail icon={<Mail className="h-4 w-4" />} label="Contact email" value={p.contactEmail ?? '—'} />
            <Detail icon={<Phone className="h-4 w-4" />} label="Contact phone" value={p.contactPhone ?? '—'} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Go-live" value={p.goLiveDate ? formatDate(p.goLiveDate) : '—'} />
            <Detail label="Partner"
              value={p.partnerId
                ? <FlowRef id={p.partnerId} variant="inline" />
                : <span className="text-g40">Flow-operated</span>
              } />
          </dl>
        </section>

        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 space-y-4">
          <h3 className="label-caps text-g40">Related</h3>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2 flex items-center gap-1">
              <Car className="h-3 w-3" /> Vehicles ({propertyVehicles.length})
            </div>
            {propertyVehicles.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {propertyVehicles.slice(0, 8).map((v) => <li key={v.id}><FlowRef id={v.id} /></li>)}
              </ul>
            ) : <p className="text-xs text-g40 italic">No vehicles linked</p>}
          </div>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Conversations</div>
            {links && links.conversations.length > 0 ? (
              <ul className="space-y-1.5">
                {links.conversations.map((c) => <li key={c.id}><FlowRef id={c.id} /></li>)}
              </ul>
            ) : <p className="text-xs text-g40 italic">No threads yet</p>}
          </div>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Recent reservations</div>
            {links && links.reservations.length > 0 ? (
              <ul className="space-y-1.5">
                {links.reservations.slice(0, 6).map((r) => (
                  <li key={r.id}><FlowRef id={r.id} /></li>
                ))}
              </ul>
            ) : <p className="text-xs text-g40 italic">No bookings recorded</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="label-caps text-g40 flex items-center gap-1 mb-0.5">{icon}{label}</dt>
      <dd className="text-ink dark:text-ivory">{value}</dd>
    </div>
  )
}
