import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowBookingModal, type FlowBooking } from '../../components/flow/FlowBookingModal'
import { FlowRef } from '../../components/flow/FlowRef'
import { SAMPLE_RESERVATIONS } from '../../lib/sampleData'
import type { Reservation } from '../../lib/types'
import { formatCurrency, formatDate } from '../../lib/utils'

const STATUS_TONE: Record<Reservation['status'], 'active' | 'pending' | 'cancelled' | 'completed' | 'info'> = {
  checked_in: 'active',
  confirmed: 'info',
  pending: 'pending',
  cancelled: 'cancelled',
  checked_out: 'completed',
  no_show: 'cancelled',
}

const STATUS_LABEL: Record<Reservation['status'], string> = {
  checked_in: 'Checked-in',
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  checked_out: 'Checked-out',
  no_show: 'No show',
}

const columns = (open: (r: Reservation) => void): Column<Reservation>[] => [
  { key: 'id', header: 'Booking ID', width: '160px', render: (r) => (
    <span onClick={(e) => e.stopPropagation()} className="inline-block">
      <FlowRef id={r.id} variant="pill" noIcon label={r.id} />
    </span>
  ) },
  { key: 'guestName', header: 'Guest', render: (r) => (
    <div>
      <div className="font-medium">{r.guestName}</div>
      <div className="text-xs text-g40">{r.nationality}</div>
    </div>
  )},
  { key: 'checkIn', header: 'Check-in', render: (r) => formatDate(r.checkIn) },
  { key: 'checkOut', header: 'Check-out', render: (r) => formatDate(r.checkOut) },
  { key: 'roomNumber', header: 'Room', render: (r) => `${r.roomNumber} · ${r.roomType}` },
  { key: 'nights', header: 'Nts', align: 'right' },
  { key: 'rateUsd', header: 'Rate', align: 'right', render: (r) => formatCurrency(r.rateUsd) },
  {
    key: 'totalUsd', header: 'Total', align: 'right',
    render: (r) => <span className="text-copper font-display font-bold">{formatCurrency(r.totalUsd)}</span>,
  },
  { key: 'channel', header: 'Channel' },
  {
    key: 'status', header: 'Status',
    render: (r) => <FlowStatusBadge tone={STATUS_TONE[r.status]} dot>{STATUS_LABEL[r.status]}</FlowStatusBadge>,
  },
  {
    key: 'paymentStatus', header: 'Actions', sortable: false,
    render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); open(r) }}
        className="text-xs text-teal hover:text-teal-dark font-medium"
      >
        View
      </button>
    ),
  },
]

export default function Reservations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'all' | Reservation['status']>('all')
  const [channel, setChannel] = useState<'all' | string>('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<FlowBooking | null>(null)

  const data = useMemo(() => {
    return SAMPLE_RESERVATIONS.filter((r) => {
      if (status !== 'all' && r.status !== status) return false
      if (channel !== 'all' && r.channel !== channel) return false
      if (q.trim() && !r.guestName.toLowerCase().includes(q.toLowerCase()) && !r.id.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [status, channel, q])

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">{t('nav.sections.hotels')} · {t('nav.items.reservations')}</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">{t('page.reservations.title')}</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{t('page.reservations.subtitle')}</p>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <Plus className="h-4 w-4" /> {t('common.add')} {t('nav.items.reservations').slice(0,-1)}
        </button>
      </header>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label-caps text-g40 block mb-1">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Guest name or booking ID"
            className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-ink dark:text-ivory"
          />
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | Reservation['status'])}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All channels</option>
            <option>Direct</option>
            <option>Booking.com</option>
            <option>Expedia</option>
            <option>Flow App</option>
            <option>Walk-in</option>
          </select>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal">
          <SlidersHorizontal className="h-4 w-4" /> More filters
        </button>
      </div>

      <FlowDataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={columns((r) => setSelected({ ...r, kind: 'hotel' })) as unknown as Column<Record<string, unknown>>[]}
        rowKey={(r) => String(r.id)}
        onRowClick={(r) => navigate(`/hotels/reservations/${(r as unknown as Reservation).id}`)}
        pageSize={12}
        exportFilename="reservations.csv"
      />

      <FlowBookingModal
        open={!!selected}
        booking={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
