/**
 * Detail page for a single hotel reservation.
 *
 * Route: /hotels/reservations/:id
 *
 * Shows everything we know about the booking + a "Related" section pulling in
 * Rewards transactions and conversation threads via `backlinksFor()`.
 */
import { Navigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Calendar, CreditCard, FileText, MapPin, MessageSquare, User } from 'lucide-react'
import { FlowDetailHeader } from '../../components/flow/FlowDetailHeader'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowRef, FlowLinkify } from '../../components/flow/FlowRef'
import { SAMPLE_RESERVATIONS } from '../../lib/sampleData'
import type { Reservation } from '../../lib/types'
import { backlinksFor } from '../../lib/refs'
import { formatCurrency, formatDate } from '../../lib/utils'

const STATUS_TONE = {
  checked_in: 'active', confirmed: 'info', pending: 'pending',
  cancelled: 'cancelled', checked_out: 'completed', no_show: 'cancelled',
} as const

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>()
  const [r, setR] = useState<Reservation | null>(null)

  useEffect(() => {
    if (!id) return
    // Prefer localStorage (mutations stick) and fall back to seed.
    try {
      const raw = window.localStorage.getItem('flow-os.reservations')
      const list: Reservation[] = raw ? JSON.parse(raw) : SAMPLE_RESERVATIONS
      setR(list.find((x) => x.id === id) ?? null)
    } catch {
      setR(SAMPLE_RESERVATIONS.find((x) => x.id === id) ?? null)
    }
  }, [id])

  const links = useMemo(() => (id ? backlinksFor(id) : null), [id])

  if (!id) return <Navigate to="/hotels/reservations" replace />
  if (r === null) {
    // Still loading vs not found — loading is so fast we treat null as "loading".
    const allList = (() => {
      try {
        const raw = window.localStorage.getItem('flow-os.reservations')
        return raw ? (JSON.parse(raw) as Reservation[]) : SAMPLE_RESERVATIONS
      } catch { return SAMPLE_RESERVATIONS }
    })()
    if (!allList.find((x) => x.id === id)) {
      return (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-g40 mb-3" />
          <h2 className="font-display text-xl text-ink dark:text-ivory">Reservation not found</h2>
          <p className="text-sm text-g40 mt-1">No booking matches <span className="font-mono">{id}</span> in the seed.</p>
        </div>
      )
    }
    return <div className="text-g40 text-sm">Loading…</div>
  }

  return (
    <div className="space-y-6">
      <FlowDetailHeader
        backTo="/hotels/reservations"
        backLabel="All reservations"
        eyebrow={<span>Reservation · <span className="font-mono">{r.id}</span></span>}
        title={r.guestName}
        subtitle={`${r.nationality} · ${r.channel}`}
        status={<FlowStatusBadge tone={STATUS_TONE[r.status]} dot>{r.status.replace(/_/g, ' ')}</FlowStatusBadge>}
        actions={
          <>
            <button className="text-xs px-3 py-1.5 rounded-input border border-g20 hover:border-teal text-ink dark:text-ivory">
              Edit
            </button>
            <button className="text-xs px-3 py-1.5 rounded-input bg-teal text-white hover:bg-teal-dark">
              Check in
            </button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Nights" value={r.nights} hint={`${formatDate(r.checkIn)} → ${formatDate(r.checkOut)}`} accent="teal" />
        <FlowKPICard label="Room rate" value={formatCurrency(r.rateCad)} hint={`Room ${r.roomNumber} · ${r.roomType}`} />
        <FlowKPICard label="Total" value={formatCurrency(r.totalCad)} hint={r.paymentStatus} />
        <FlowKPICard label="Channel" value={r.channel} hint={`${r.status.replace(/_/g, ' ')}`} accent="ink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest + booking facts */}
        <section className="lg:col-span-2 rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5">
          <h3 className="label-caps text-g40 mb-4">Booking details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail icon={<User className="h-4 w-4" />} label="Guest" value={r.guestName} />
            <Detail icon={<MapPin className="h-4 w-4" />} label="Nationality" value={r.nationality} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Check-in" value={formatDate(r.checkIn)} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Check-out" value={formatDate(r.checkOut)} />
            <Detail label="Room" value={`${r.roomNumber} · ${r.roomType}`} />
            <Detail label="Nights" value={String(r.nights)} />
            <Detail label="Rate / night" value={formatCurrency(r.rateCad)} />
            <Detail label="Total" value={<span className="text-copper font-bold">{formatCurrency(r.totalCad)}</span>} />
            <Detail icon={<CreditCard className="h-4 w-4" />} label="Payment status" value={r.paymentStatus} />
            <Detail label="Channel" value={r.channel} />
          </dl>
        </section>

        {/* Related entities */}
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
            ) : (
              <p className="text-xs text-g40 italic">No threads yet</p>
            )}
          </div>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Rewards activity</div>
            {links && links.rewardsTransactions.length > 0 ? (
              <ul className="space-y-1.5">
                {links.rewardsTransactions.map((t) => (
                  <li key={t.id} className="text-xs flex items-center gap-2">
                    <FlowRef id={t.id} variant="pill" />
                    <FlowLinkify text={t.reason} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-g40 italic">No points earned/burned</p>
            )}
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
