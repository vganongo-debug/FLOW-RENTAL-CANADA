import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, SlidersHorizontal, Camera } from 'lucide-react'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowBookingModal, type FlowBooking } from '../../components/flow/FlowBookingModal'
import { FlowRef } from '../../components/flow/FlowRef'
import { RENTAL_BOOKINGS } from '../../lib/sampleData'
import type { RentalBooking } from '../../lib/types'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

const STATUS_TONE = {
  checked_in: 'active',
  confirmed: 'info',
  pending: 'pending',
  cancelled: 'cancelled',
  checked_out: 'completed',
  no_show: 'cancelled',
} as const

const STATUS_LABEL: Record<RentalBooking['status'], string> = {
  checked_in: 'On rental',
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  checked_out: 'Returned',
  no_show: 'No show',
}

const columns = (open: (b: RentalBooking) => void): Column<RentalBooking>[] => [
  { key: 'id', header: 'Booking', render: (r) => (
    <span onClick={(e) => e.stopPropagation()} className="inline-block">
      <FlowRef id={r.id} variant="pill" noIcon label={r.id} />
    </span>
  ) },
  { key: 'clientName', header: 'Client' },
  { key: 'vehicleLabel', header: 'Vehicle', render: (r) => (
    <div>
      <div className="font-medium">{r.vehicleLabel}</div>
      <div className="text-xs text-g40">{r.vehiclePlate} · {r.tier}</div>
    </div>
  ) },
  { key: 'pickupLocation', header: 'Pick-up' },
  { key: 'startDate', header: 'Start', render: (r) => formatDate(r.startDate) },
  { key: 'endDate', header: 'End', render: (r) => formatDate(r.endDate) },
  { key: 'days', header: 'Days', align: 'right' },
  { key: 'ratePerDayCad', header: 'Rate', align: 'right', render: (r) => formatCurrency(r.ratePerDayCad) },
  { key: 'totalCad', header: 'Total', align: 'right',
    render: (r) => <span className="text-copper font-display font-bold">{formatCurrency(r.totalCad)}</span> },
  { key: 'owner', header: 'Owner', render: (r) => (
    <FlowStatusBadge tone={r.owner === 'flow' ? 'info' : 'warning'} dot>
      {r.owner === 'flow' ? 'Flow' : `Partner · ${r.partnerName?.split(' ')[0]}`}
    </FlowStatusBadge>
  ) },
  { key: 'status', header: 'Status', render: (r) => (
    <FlowStatusBadge tone={STATUS_TONE[r.status]} dot>{STATUS_LABEL[r.status]}</FlowStatusBadge>
  ) },
  { key: 'totalCad', header: 'Actions', sortable: false, render: (r) => (
    <button
      onClick={(e) => { e.stopPropagation(); open(r) }}
      className="text-xs text-teal hover:text-teal-dark font-medium"
    >
      View
    </button>
  ) },
]

export default function Rentals() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'all' | RentalBooking['status']>('all')
  const [owner, setOwner] = useState<'all' | 'flow' | 'partner'>('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<FlowBooking | null>(null)

  const data = useMemo(() => RENTAL_BOOKINGS.filter((r) => {
    if (status !== 'all' && r.status !== status) return false
    if (owner !== 'all' && r.owner !== owner) return false
    if (q.trim()) {
      const needle = q.toLowerCase()
      if (!r.clientName.toLowerCase().includes(needle) &&
          !r.id.toLowerCase().includes(needle) &&
          !r.vehiclePlate.toLowerCase().includes(needle)) return false
    }
    return true
  }), [status, owner, q])

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Fleet · Rentals</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Rental Bookings</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">All car rentals across markets · click any row for full detail.</p>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <Plus className="h-4 w-4" /> New rental
        </button>
      </header>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="label-caps text-g40 block mb-1">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Client, booking ID, or plate"
            className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          />
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | RentalBooking['status'])}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABEL) as RentalBooking['status'][]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Owner</label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value as 'all' | 'flow' | 'partner')}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All owners</option>
            <option value="flow">Flow-owned</option>
            <option value="partner">Partner fleet</option>
          </select>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal">
          <SlidersHorizontal className="h-4 w-4" /> More filters
        </button>
      </div>

      <FlowDataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={columns((r) => setSelected({ ...r, kind: 'rental' })) as unknown as Column<Record<string, unknown>>[]}
        rowKey={(r) => String(r.id)}
        onRowClick={(r) => navigate(`/fleet/bookings/${(r as unknown as RentalBooking).id}`)}
        pageSize={10}
        exportFilename="rental-bookings.csv"
      />

      <ConditionInspection />

      <FlowBookingModal
        open={!!selected}
        booking={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function ConditionInspection() {
  const angles = ['Front', 'Rear', 'Driver side', 'Passenger side', 'Interior', 'Odometer']
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display text-xl text-ink dark:text-ivory">Pre-rental condition · UAJ 042X · Toyota Land Cruiser V8</h2>
          <p className="text-xs text-g40 dark:text-g60">Captured at hand-over · 6 photos required for digital agreement</p>
        </div>
        <div className="flex gap-2 text-xs">
          <FlowStatusBadge tone="active" dot>6 of 6 captured</FlowStatusBadge>
          <FlowStatusBadge tone="info">No damages logged</FlowStatusBadge>
        </div>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {angles.map((angle) => (
          <figure key={angle} className="rounded-input overflow-hidden border border-g20/60">
            <div className="aspect-[4/3] bg-gradient-to-br from-coal to-ink relative flex items-center justify-center">
              <Camera className="h-8 w-8 text-copper opacity-70" />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-badge text-[10px] label-caps bg-white/85 text-ink">
                {angle}
              </span>
            </div>
          </figure>
        ))}
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        <Stat label="Fuel level on pick-up" value="100%" />
        <Stat label="Odometer at pick-up" value="28,430 km" />
        <Stat label="Existing damage" value="None recorded" />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn('rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3')}>
      <div className="label-caps text-g40">{label}</div>
      <div className="font-display font-bold text-ink dark:text-ivory mt-0.5">{value}</div>
    </div>
  )
}
