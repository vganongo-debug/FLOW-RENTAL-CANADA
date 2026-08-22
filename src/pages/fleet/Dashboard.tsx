import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Car, AlertTriangle, DollarSign, ArrowDownToLine, Plus } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowBookingModal, type FlowBooking } from '../../components/flow/FlowBookingModal'
import { RENTAL_BOOKINGS, VEHICLES } from '../../lib/sampleData'
import type { RentalBooking } from '../../lib/types'
import { formatCurrency, formatDate } from '../../lib/utils'

const STATUS_TONE = {
  checked_in: 'active',
  confirmed: 'info',
  pending: 'pending',
  cancelled: 'cancelled',
  checked_out: 'completed',
  no_show: 'cancelled',
} as const

const columns: Column<RentalBooking>[] = [
  { key: 'id', header: 'Booking ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
  { key: 'clientName', header: 'Client' },
  { key: 'vehicleLabel', header: 'Vehicle', render: (r) => (
    <div>
      <div className="font-medium">{r.vehicleLabel}</div>
      <div className="text-xs text-g40">{r.vehiclePlate} · {r.tier}</div>
    </div>
  )},
  { key: 'pickupLocation', header: 'Pick-up' },
  { key: 'startDate', header: 'Start', render: (r) => formatDate(r.startDate) },
  { key: 'days', header: 'Days', align: 'right' },
  { key: 'totalCad', header: 'Total', align: 'right',
    render: (r) => <span className="text-copper font-display font-bold">{formatCurrency(r.totalCad)}</span> },
  { key: 'owner', header: 'Owner', render: (r) => (
    <FlowStatusBadge tone={r.owner === 'flow' ? 'info' : 'warning'} dot>
      {r.owner === 'flow' ? 'Flow' : `Partner · ${r.partnerName?.split(' ')[0]}`}
    </FlowStatusBadge>
  )},
  { key: 'status', header: 'Status', render: (r) => (
    <FlowStatusBadge tone={STATUS_TONE[r.status]} dot>
      {r.status.replace('_', ' ')}
    </FlowStatusBadge>
  )},
]

export default function FleetDashboard() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<FlowBooking | null>(null)
  const onRent = VEHICLES.filter((v) => v.status === 'on_rent').length
  const overdue = VEHICLES.filter((v) => v.status === 'overdue').length
  const utilisation = ((onRent / VEHICLES.length) * 100).toFixed(0)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">{t('nav.sections.fleet')} · {t('nav.items.dashboard')}</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">{t('page.fleetDashboard.title')}</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{t('page.fleetDashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm hover:border-teal">
            <ArrowDownToLine className="h-4 w-4" aria-hidden="true" /> {t('cta.vehicleReturn')}
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('cta.walkInRental')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <FlowKPICard
          label={t('kpi.onRent')}
          value={`${onRent}`}
          delta={{ pct: 8.3, direction: 'up' }}
          hint={`${utilisation}% of fleet`}
          icon={<Car className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.utilisation')}
          value={`${utilisation}%`}
          delta={{ pct: 3.1, direction: 'up' }}
          accent="teal"
        />
        <FlowKPICard
          label={t('kpi.revenueToday')}
          value={formatCurrency(8_640)}
          delta={{ pct: 12.0, direction: 'up' }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.dueBackToday')}
          value="4"
          accent="teal"
          hint="2 from Nord-Côtier"
        />
        <FlowKPICard
          label={t('kpi.overdueReturns')}
          value={`${overdue}`}
          accent="copper"
          icon={<AlertTriangle className="h-4 w-4" />}
          hint={overdue ? 'Action required' : 'None'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title={t('card.liveFleetMap')} subtitle="Owned (teal) and partner (copper) vehicles">
            <FlowMapView vehicles={VEHICLES} height={380} />
          </Card>
        </div>
        <Card title={t('card.alerts')} subtitle="Across all locations">
          <ul className="space-y-2">
            <Alert tone="warning" title="Overdue return: K05 BDH" body="Blanc-Sablon · 2h past expected return time" />
            <Alert tone="warning" title="Low fuel: H24 JKL" body="F-150 XLT · 15% fuel · driver notified" />
            <Alert tone="info" title="Service due: J18 QRX" body="Pajero · 5,000km service window" />
            <Alert tone="warning" title="Geofence exit: L31 MNT" body="Highlander left the Saint-Augustin service zone" />
            <Alert tone="info" title="Speeding event resolved" body="J18 QRT · Sierra 1500 · driver coached" />
          </ul>
        </Card>
      </div>

      <Card title={t('card.activeRentals')} subtitle="Sortable, exportable">
        <FlowDataTable
          data={RENTAL_BOOKINGS as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          rowKey={(r) => String(r.id)}
          onRowClick={(r) => setSelected({ ...(r as unknown as RentalBooking), kind: 'rental' })}
          exportFilename="rentals.csv"
          pageSize={8}
        />
      </Card>

      <FlowBookingModal open={!!selected} booking={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
      <header className="mb-3">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function Alert({ tone, title, body }: { tone: 'warning' | 'info'; title: string; body: string }) {
  return (
    <li className="flex items-start gap-2 p-2 rounded-input bg-ivory dark:bg-panel">
      <span className={`mt-1.5 h-2 w-2 rounded-full ${tone === 'warning' ? 'bg-copper' : 'bg-teal'}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-ink dark:text-ivory">{title}</div>
        <div className="text-xs text-g40">{body}</div>
      </div>
    </li>
  )
}
