import { useMemo, useState } from 'react'
import { Plus, Search, Star, Phone, Mail, IdCard, MapPin, Car, Clock } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'

type DriverStatus = 'available' | 'on_mission' | 'off_duty'

interface Driver {
  id: string
  name: string
  initials: string
  licence: string
  licenceExpiry: string
  phone: string
  email: string
  city: string
  status: DriverStatus
  rating: number
  missionsLifetime: number
  missionsThisMonth: number
  earningsThisMonthUsd: number
  joined: string
}

const STATUS_TONE: Record<DriverStatus, 'active' | 'info' | 'completed'> = {
  available: 'active',
  on_mission: 'info',
  off_duty: 'completed',
}

const STATUS_LABEL: Record<DriverStatus, string> = {
  available: 'Available',
  on_mission: 'On mission',
  off_duty: 'Off duty',
}

const DRIVERS: Driver[] = [
  { id: 'd-1', name: 'Daniel Okello',     initials:'DO', licence:'UG-DL 5482-19', licenceExpiry:'2028-09-12', phone:'+256 712 444 982', email:'daniel.o@flowrentals.com',   city:'Kampala',     status:'on_mission', rating:4.9, missionsLifetime:218, missionsThisMonth:14, earningsThisMonthUsd:1_420, joined:'2024-02-14' },
  { id: 'd-2', name: 'Henry Mukasa',      initials:'HM', licence:'UG-DL 8821-22', licenceExpiry:'2027-11-30', phone:'+256 778 991 042', email:'henry.m@flowrentals.com',    city:'Entebbe',     status:'available',  rating:4.8, missionsLifetime:142, missionsThisMonth:11, earningsThisMonthUsd:1_120, joined:'2024-08-02' },
  { id: 'd-3', name: 'Jean-Marc Tati',    initials:'JT', licence:'CG-DL 320-104', licenceExpiry:'2029-04-22', phone:'+242 06 411 8820', email:'jm.tati@flowrentals.com',    city:'Brazzaville', status:'on_mission', rating:4.7, missionsLifetime:188, missionsThisMonth:13, earningsThisMonthUsd:1_360, joined:'2024-04-19' },
  { id: 'd-4', name: 'Tesfaye Bekele',    initials:'TB', licence:'ET-DL 901-2208', licenceExpiry:'2026-12-19', phone:'+251 911 442 008', email:'tesfaye.b@flowrentals.com',  city:'Addis Ababa', status:'available',  rating:4.8, missionsLifetime:166, missionsThisMonth:9,  earningsThisMonthUsd:980,   joined:'2024-05-30' },
  { id: 'd-5', name: 'Pierre Bayoko',     initials:'PB', licence:'CG-DL 119-088', licenceExpiry:'2028-02-11', phone:'+242 06 902 1144', email:'pierre.b@flowrentals.com',   city:'Brazzaville', status:'off_duty',   rating:4.5, missionsLifetime: 88, missionsThisMonth:4,  earningsThisMonthUsd:420,   joined:'2025-01-12' },
  { id: 'd-6', name: 'Aisha Nakato',      initials:'AN', licence:'UG-DL 6601-08', licenceExpiry:'2027-07-25', phone:'+256 703 880 882', email:'aisha.n@flowrentals.com',    city:'Kampala',     status:'available',  rating:4.9, missionsLifetime:104, missionsThisMonth:8,  earningsThisMonthUsd:840,   joined:'2024-10-05' },
]

const MISSIONS = [
  { date:'2026-05-09', client:'Sarah Bennett',     vehicle:'Toyota Prado',         startKm: 41_180, endKm: 41_322, duration:'6h 20m', earnings: 110 },
  { date:'2026-05-07', client:'Olusegun Adeyemi',  vehicle:'Toyota Land Cruiser',  startKm: 28_260, endKm: 28_430, duration:'1d 4h',  earnings: 290 },
  { date:'2026-05-05', client:'Émilie Tremblay',   vehicle:'Toyota Prado',         startKm: 40_900, endKm: 41_180, duration:'2d',     earnings: 220 },
  { date:'2026-05-02', client:'Henry Mukasa',      vehicle:'Toyota RAV4',          startKm: 19_640, endKm: 19_880, duration:'8h',     earnings: 95  },
]

export default function Drivers() {
  const [selectedId, setSelectedId] = useState(DRIVERS[0].id)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DriverStatus>('all')

  const filtered = useMemo(() => DRIVERS.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (q.trim() && !d.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [q, statusFilter])

  const selected = DRIVERS.find((d) => d.id === selectedId) ?? DRIVERS[0]
  const totalEarnings = DRIVERS.reduce((s, d) => s + d.earningsThisMonthUsd, 0)
  const onMission = DRIVERS.filter((d) => d.status === 'on_mission').length
  const available = DRIVERS.filter((d) => d.status === 'available').length

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Fleet · Drivers</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Driver Management</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{DRIVERS.length} drivers across markets · {available} available now</p>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <Plus className="h-4 w-4" /> Add driver
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="On mission" value={String(onMission)} accent="teal" icon={<Car className="h-4 w-4" />} hint="real-time" />
        <FlowKPICard label="Available" value={String(available)} accent="teal" hint="ready to dispatch" />
        <FlowKPICard label="Avg rating" value={(DRIVERS.reduce((s,d)=>s+d.rating,0)/DRIVERS.length).toFixed(1)} delta={{ pct: 1.2, direction: 'up' }} icon={<Star className="h-4 w-4" />} />
        <FlowKPICard label="Payouts · MTD" value={formatCurrency(totalEarnings)} delta={{ pct: 9.4, direction: 'up' }} />
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-g20/60 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Driver name"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | DriverStatus)}
              className="w-full px-2 py-1.5 text-sm rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory"
            >
              <option value="all">All statuses</option>
              {(Object.keys(STATUS_LABEL) as DriverStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <div className="text-[11px] text-g40">{filtered.length} of {DRIVERS.length}</div>
          </div>
          <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40">
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition',
                    selectedId === d.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <span className="h-9 w-9 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold shrink-0">{d.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory truncate">{d.name}</div>
                    <div className="text-xs text-g40 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {d.city}
                      <Star className="h-3 w-3 ml-2 text-copper" /> {d.rating.toFixed(1)}
                    </div>
                  </div>
                  <FlowStatusBadge tone={STATUS_TONE[d.status]} dot>{STATUS_LABEL[d.status]}</FlowStatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-4">
          {/* Profile header */}
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card flex items-start gap-4 flex-wrap">
            <span className="h-16 w-16 rounded-full bg-teal text-white flex items-center justify-center text-xl font-semibold shrink-0">{selected.initials}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl text-ink dark:text-ivory">{selected.name}</h2>
                <FlowStatusBadge tone={STATUS_TONE[selected.status]} dot>{STATUS_LABEL[selected.status]}</FlowStatusBadge>
              </div>
              <div className="text-sm text-g40 flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selected.phone}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selected.email}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.city}</span>
                <span className="flex items-center gap-1"><IdCard className="h-3 w-3" /> {selected.licence} · expires {formatDate(selected.licenceExpiry)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium">Assign mission</button>
              <button className="px-3 py-1.5 rounded-input border border-g20 text-sm text-ink dark:text-ivory">Message</button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid sm:grid-cols-4 gap-4">
            <FlowKPICard label="Rating" value={selected.rating.toFixed(1) + ' / 5'} accent="copper" icon={<Star className="h-4 w-4" />} />
            <FlowKPICard label="Missions · lifetime" value={String(selected.missionsLifetime)} accent="teal" />
            <FlowKPICard label="Missions · MTD" value={String(selected.missionsThisMonth)} accent="teal" />
            <FlowKPICard label="Earnings · MTD" value={formatCurrency(selected.earningsThisMonthUsd)} delta={{ pct: 12.4, direction: 'up' }} />
          </div>

          {/* Mission log */}
          <Card title="Recent mission log" subtitle="Last 4 completed missions">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal text-white">
                  {['Date','Client','Vehicle','Distance','Duration','Earned'].map((h, i) => (
                    <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 3 || i === 5 ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MISSIONS.map((m, i) => (
                  <tr key={i} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                    <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(m.date)}</td>
                    <td className="px-3 py-2 text-ink dark:text-ivory">{m.client}</td>
                    <td className="px-3 py-2 text-ink dark:text-ivory">{m.vehicle}</td>
                    <td className="px-3 py-2 text-right text-ink dark:text-ivory">{(m.endKm - m.startKm).toLocaleString()} km</td>
                    <td className="px-3 py-2 text-ink dark:text-ivory inline-flex items-center gap-1"><Clock className="h-3 w-3 text-g40" /> {m.duration}</td>
                    <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(m.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Compliance */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Licence & compliance">
              <dl className="space-y-1.5 text-sm">
                <Row term="Licence number" value={selected.licence} />
                <Row term="Class / Categories" value="B · CE · D1" />
                <Row term="Issued by" value="Uganda Driver Licensing Authority" />
                <Row term="Expires" value={formatDate(selected.licenceExpiry)} />
                <Row term="Last health certificate" value="2026-02-12" />
                <Row term="Police clearance" value="Valid · expires 2026-12-01" />
              </dl>
            </Card>
            <Card title="Performance signals">
              <dl className="space-y-1.5 text-sm">
                <Row term="On-time pickups" value="98%" />
                <Row term="Average client rating" value={`${selected.rating} / 5`} />
                <Row term="Reported incidents" value="0 last 12 months" />
                <Row term="Telematics score" value="A · gentle braking" />
                <Row term="Joined Flow" value={formatDate(selected.joined)} />
              </dl>
            </Card>
          </div>
        </section>
      </div>
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

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-g20/30 last:border-0">
      <dt className="text-g40">{term}</dt>
      <dd className="text-ink dark:text-ivory font-medium text-right">{value}</dd>
    </div>
  )
}
