import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Wallet, Car, CalendarRange, ShieldCheck } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowCalendar } from '../../components/flow/FlowCalendar'
import { FlowWordmark } from '../../components/flow/FlowWordmark'
import { FlowNotification } from '../../components/flow/FlowNotification'
import { FLEET_PARTNERS, RENTAL_BOOKINGS, VEHICLES } from '../../lib/sampleData'
import { formatCurrency, formatDate } from '../../lib/utils'

const partner = FLEET_PARTNERS[0] // Nord-Côtier (Natashquan)
const partnerVehicles = VEHICLES.filter((v) => v.partnerName === partner.name)
const partnerBookings = RENTAL_BOOKINGS.filter((b) => b.partnerName === partner.name)

const PAYOUT_HISTORY = [
  { week: 'W14', amount: 7_240 },
  { week: 'W15', amount: 8_120 },
  { week: 'W16', amount: 7_960 },
  { week: 'W17', amount: 8_540 },
  { week: 'W18', amount: 8_420 },
]

const vehicleColumns: Column<typeof partnerVehicles[number]>[] = [
  { key: 'plate', header: 'Plate' },
  { key: 'make', header: 'Vehicle', render: (v) => `${v.make} ${v.model}` },
  { key: 'tier', header: 'Tier' },
  { key: 'km', header: 'Mileage', align: 'right', render: (v) => `${v.km.toLocaleString()} km` },
  { key: 'status', header: 'Status', render: (v) => (
    <FlowStatusBadge tone={v.status === 'on_rent' ? 'info' : v.status === 'available' ? 'active' : v.status === 'maintenance' ? 'pending' : 'cancelled'} dot>
      {v.status.replace('_', ' ')}
    </FlowStatusBadge>
  )},
  { key: 'dailyRateCad', header: 'Rate / day', align: 'right',
    render: (v) => <span className="text-copper font-display font-bold">{formatCurrency(v.dailyRateCad)}</span> },
  { key: 'lastServiceDate', header: 'Last service', render: (v) => formatDate(v.lastServiceDate) },
]

const bookingColumns: Column<typeof partnerBookings[number]>[] = [
  { key: 'id', header: 'Booking', render: (b) => <span className="font-mono text-xs">{b.id}</span> },
  { key: 'clientName', header: 'Client' },
  { key: 'vehicleLabel', header: 'Vehicle' },
  { key: 'startDate', header: 'Start', render: (b) => formatDate(b.startDate) },
  { key: 'days', header: 'Days', align: 'right' },
  { key: 'totalCad', header: 'Gross', align: 'right',
    render: (b) => <span className="text-copper font-display font-bold">{formatCurrency(b.totalCad)}</span> },
  { key: 'totalCad', header: 'Your share', align: 'right',
    render: (b) => formatCurrency(b.totalCad * (1 - partner.commissionPct / 100)) },
]

export default function PartnerPortal() {
  return (
    <div className="space-y-6">
      <div className="rounded-card overflow-hidden bg-coal text-ivory">
        <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="label-caps text-copper-light">Fleet Partner Portal</div>
            <h1 className="font-display text-3xl mt-1">{partner.name}</h1>
            <p className="text-sm text-g60 mt-1">{partner.city} · {partner.country} · Commission {partner.commissionPct}%</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-g60">Powered by</span>
            <FlowWordmark size="md" variant="dark" />
          </div>
        </div>
      </div>

      <FlowNotification
        tone="info"
        title="Booking confirmed on J18 QRW"
        body="Toyota Corolla · 4 days · pickup tomorrow 09:00 · client: Hugo Cormier"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard
          label="My vehicles on Flow"
          value={`${partner.vehiclesActiveOnFlow}`}
          hint={`of ${partner.vehiclesCount} total`}
          icon={<Car className="h-4 w-4" />}
          accent="teal"
        />
        <FlowKPICard
          label="Bookings this week"
          value={`${partnerBookings.length}`}
          delta={{ pct: 14.3, direction: 'up' }}
          icon={<CalendarRange className="h-4 w-4" />}
          accent="teal"
        />
        <FlowKPICard
          label="Pending payout"
          value={formatCurrency(partner.pendingPayoutCad)}
          hint="Releases Friday"
          icon={<Wallet className="h-4 w-4" />}
        />
        <FlowKPICard
          label="Your share rate"
          value={`${100 - partner.commissionPct}%`}
          hint={`Flow keeps ${partner.commissionPct}%`}
          accent="copper"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Payout history" subtitle="Last 5 weeks · USD" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PAYOUT_HISTORY}>
              <CartesianGrid stroke="#E6EFF9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#4A5C74' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5C74' }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#B30307" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="This week" subtitle="Net of commission">
          <div className="text-center py-2">
            <div className="font-display font-bold text-4xl text-copper">{formatCurrency(partner.weeklyPayoutCad)}</div>
            <div className="text-xs text-g40 mt-1">expected payout · Friday transfer</div>
          </div>
          <div className="mt-4 space-y-1.5 text-sm">
            <Row label="Gross revenue" value={formatCurrency(partner.weeklyPayoutCad / (1 - partner.commissionPct / 100))} />
            <Row label="Flow commission" value={`–${formatCurrency(partner.weeklyPayoutCad / (1 - partner.commissionPct / 100) * partner.commissionPct / 100)}`} />
            <Row label="Bank account" value="Nordia Affaires ··· 8420" />
            <Row label="Method" value="Bank transfer" />
          </div>
        </Card>
      </div>

      <Card title="My fleet on Flow" subtitle="Toggle availability per vehicle">
        <FlowDataTable
          data={partnerVehicles as unknown as Record<string, unknown>[]}
          columns={vehicleColumns as unknown as Column<Record<string, unknown>>[]}
          rowKey={(r) => String(r.id)}
          exportFilename="my-fleet.csv"
        />
      </Card>

      <Card title="Bookings on my fleet" subtitle="Read-only · Flow handles client billing">
        <FlowDataTable
          data={partnerBookings as unknown as Record<string, unknown>[]}
          columns={bookingColumns as unknown as Column<Record<string, unknown>>[]}
          rowKey={(r) => String(r.id)}
          exportFilename="my-bookings.csv"
        />
      </Card>

      <Card title="Availability calendar" subtitle="Block dates when a vehicle is unavailable">
        <FlowCalendar
          rows={partnerVehicles.map((v) => ({ id: v.id, label: `${v.make} ${v.model}`, sub: v.plate }))}
          monthLabel="May 2026"
        />
      </Card>
    </div>
  )
}

function Card({
  title, subtitle, children, className,
}: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card ${className ?? ''}`}>
      <header className="mb-3">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
