import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, DoorOpen, Hotel, LogOut, Plus, Wrench, AlertCircle } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { ARRIVALS_TODAY, OCCUPANCY_TREND_7D, SAMPLE_ROOMS } from '../../lib/sampleData'
import { cn, formatCurrency } from '../../lib/utils'
import type { Room } from '../../lib/types'

const STATUS_COLORS: Record<Room['status'], string> = {
  occupied: 'bg-teal text-white',
  available: 'bg-teal-light text-teal-dark border border-teal/30',
  dirty: 'bg-copper text-white',
  maintenance: 'bg-red-500 text-white',
  out_of_service: 'bg-g40 text-white',
}

const STATUS_LABEL: Record<Room['status'], string> = {
  occupied: 'Occupied',
  available: 'Clean / Available',
  dirty: 'Needs cleaning',
  maintenance: 'Maintenance',
  out_of_service: 'Out of service',
}

export default function HotelDashboard() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Room | null>(null)
  const occupied = SAMPLE_ROOMS.filter((r) => r.status === 'occupied').length
  const total = SAMPLE_ROOMS.length
  const occPct = ((occupied / total) * 100).toFixed(0)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">{t('roles.hotel_manager')} · Flow Station Natashquan</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">{t('page.hotelDashboard.title')}</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Sunday · 10 May 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <AlertCircle className="h-4 w-4" aria-hidden="true" /> {t('cta.reportIssue')}
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('cta.walkInReservation')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard
          label={t('kpi.occupancy')}
          value={`${occPct}%`}
          delta={{ pct: 4.2, direction: 'up' }}
          hint={`${occupied} / ${total}`}
          icon={<Hotel className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.adr')}
          value={formatCurrency(132)}
          delta={{ pct: 2.8, direction: 'up' }}
          hint="Avg Daily Rate"
        />
        <FlowKPICard
          label={t('kpi.revpar')}
          value={formatCurrency(118)}
          delta={{ pct: 6.4, direction: 'up' }}
          hint="Revenue / Available Room"
        />
        <FlowKPICard
          label={t('kpi.arrivalsDepartures')}
          value="12 · 9"
          accent="teal"
          icon={<CalendarCheck className="h-4 w-4" />}
          hint="Next 24 hours"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title={t('card.occupancyTrend')} subtitle="With ADR overlay">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={OCCUPANCY_TREND_7D}>
                <CartesianGrid stroke="#E0F0E7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4F5C54' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4F5C54' }} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#4F5C54' }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#2E503E" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="adr" stroke="#AA5830" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title={t('card.arrivalsToday')} subtitle={`${ARRIVALS_TODAY.length} expected`}>
            <ul className="divide-y divide-g20/40">
              {ARRIVALS_TODAY.map((a, i) => (
                <li key={i} className="py-3 flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-teal-light text-teal-dark flex items-center justify-center text-xs font-semibold">
                    {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory truncate">{a.name}</div>
                    <div className="text-xs text-g40">{a.roomType} · ETA {a.eta}</div>
                  </div>
                  <FlowStatusBadge tone={a.status === 'pending' ? 'pending' : 'active'} dot>
                    {a.status}
                  </FlowStatusBadge>
                  <button className="px-2 py-1 text-xs rounded-input border border-g20 hover:border-teal text-ink dark:text-ivory">
                    Check-in
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('card.roomGrid')} subtitle="Click any room for details">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {SAMPLE_ROOMS.map((r) => (
                <button
                  key={r.number}
                  onClick={() => setSelected(r)}
                  className={cn(
                    'aspect-square rounded-input flex flex-col items-center justify-center text-[11px] font-medium transition hover:scale-105',
                    STATUS_COLORS[r.status]
                  )}
                  title={`${r.number} · ${STATUS_LABEL[r.status]}`}
                >
                  <span>{r.number}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {(Object.keys(STATUS_COLORS) as Room['status'][]).map((s) => (
                <span key={s} className="flex items-center gap-1 text-g40">
                  <span className={cn('h-2.5 w-2.5 rounded-sm', STATUS_COLORS[s])} />
                  {STATUS_LABEL[s]}
                </span>
              ))}
            </div>
          </Card>

          <Card title={t('card.quickActions')}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Action icon={<DoorOpen className="h-4 w-4" />} label="Check-in" />
              <Action icon={<LogOut className="h-4 w-4" />} label="Check-out" />
              <Action icon={<Wrench className="h-4 w-4" />} label="Log issue" />
              <Action icon={<Plus className="h-4 w-4" />} label="New booking" />
            </div>
          </Card>
        </div>
      </div>

      {selected && <RoomModal room={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory hover:border-teal hover:text-teal">
      {icon}{label}
    </button>
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

function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-panel-mid rounded-card shadow-panel max-w-sm w-full p-5 animate-flow-fade">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-caps text-g40">Room</div>
              <h3 className="font-display text-2xl text-ink dark:text-ivory">{room.number}</h3>
            </div>
            <FlowStatusBadge tone={room.status === 'available' ? 'active' : room.status === 'dirty' ? 'pending' : room.status === 'occupied' ? 'info' : 'cancelled'} dot>
              {STATUS_LABEL[room.status]}
            </FlowStatusBadge>
          </div>
          <div className="space-y-1.5 text-sm">
            <Row label="Type" value={room.type} />
            <Row label="Floor" value={String(room.floor)} />
            <Row label="Rate" value={formatCurrency(room.rateCad)} />
            {room.guestName && <Row label="Guest" value={room.guestName} />}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-3 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">View details</button>
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Close</button>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
