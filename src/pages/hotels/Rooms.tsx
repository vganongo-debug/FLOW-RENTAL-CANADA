import { useMemo, useState } from 'react'
import { Search, Plus, Wrench, Camera, Filter, Pencil, Users, Bed, Wifi, Wind, Coffee, Tv, ShieldCheck } from 'lucide-react'
import { SAMPLE_ROOMS } from '../../lib/sampleData'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowFileUpload } from '../../components/flow/FlowFileUpload'
import type { Room } from '../../lib/types'

type Tab = 'details' | 'history' | 'maintenance' | 'photos'

const STATUS_TONE: Record<Room['status'], 'active' | 'info' | 'pending' | 'cancelled' | 'neutral'> = {
  occupied: 'info',
  available: 'active',
  dirty: 'pending',
  maintenance: 'cancelled',
  out_of_service: 'neutral',
}

const STATUS_LABEL: Record<Room['status'], string> = {
  occupied: 'Occupied',
  available: 'Available',
  dirty: 'Needs cleaning',
  maintenance: 'Maintenance',
  out_of_service: 'Out of service',
}

const STATUS_DOT: Record<Room['status'], string> = {
  occupied: 'bg-teal',
  available: 'bg-teal-light border border-teal',
  dirty: 'bg-copper',
  maintenance: 'bg-red-500',
  out_of_service: 'bg-g40',
}

const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'ac', label: 'Air conditioning', icon: Wind },
  { id: 'tv', label: 'Smart TV', icon: Tv },
  { id: 'minibar', label: 'Mini-bar', icon: Coffee },
  { id: 'safe', label: 'In-room safe', icon: ShieldCheck },
  { id: 'kingbed', label: 'King bed', icon: Bed },
]

const MAINTENANCE_HISTORY = [
  { date: '2026-04-22', issue: 'A/C condensate leak', tech: 'Daniel Okello', status: 'Resolved' },
  { date: '2026-03-08', issue: 'Bathroom faucet drip', tech: 'Daniel Okello', status: 'Resolved' },
  { date: '2026-01-19', issue: 'TV remote replacement', tech: 'Aisha Nakato', status: 'Resolved' },
]

const STAY_HISTORY = [
  { guest: 'Sarah Bennett', from: '2026-04-22', to: '2026-04-25', revenue: 480 },
  { guest: 'Jean-Marc Loubaki', from: '2026-04-12', to: '2026-04-14', revenue: 320 },
  { guest: 'Priya Patel', from: '2026-03-29', to: '2026-04-02', revenue: 640 },
  { guest: 'Marcus O\'Brien', from: '2026-03-18', to: '2026-03-19', revenue: 160 },
  { guest: 'Léa Dubois', from: '2026-03-03', to: '2026-03-06', revenue: 480 },
]

export default function Rooms() {
  const [selectedId, setSelectedId] = useState(SAMPLE_ROOMS[0].number)
  const [tab, setTab] = useState<Tab>('details')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Room['status']>('all')

  const filtered = useMemo(() => SAMPLE_ROOMS.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (q.trim() && !r.number.includes(q) && !r.type.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [q, statusFilter])

  const selected = SAMPLE_ROOMS.find((r) => r.number === selectedId) ?? SAMPLE_ROOMS[0]

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · Rooms</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Room Management</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">All 30 rooms · Flow Hotels Kampala</p>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Left: room list */}
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-g20/60 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Room # or type"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Room['status'] | 'all')}
              className="w-full px-2 py-1.5 text-sm rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory"
            >
              <option value="all">All statuses</option>
              {(Object.keys(STATUS_LABEL) as Room['status'][]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <div className="text-[11px] text-g40">{filtered.length} of {SAMPLE_ROOMS.length} rooms</div>
          </div>
          <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40">
            {filtered.map((r) => (
              <li key={r.number}>
                <button
                  onClick={() => setSelectedId(r.number)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition',
                    selectedId === r.number ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', STATUS_DOT[r.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory">{r.number} · {r.type}</div>
                    <div className="text-xs text-g40">Floor {r.floor} · {formatCurrency(r.rateUsd)}/night</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right: detail panel */}
        <section className="space-y-4">
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="label-caps text-g40">Room</div>
                <h2 className="font-display text-3xl text-ink dark:text-ivory leading-tight">
                  {selected.number}
                  <span className="font-display text-lg text-g40 ml-2">{selected.type}</span>
                </h2>
                <div className="text-sm text-g40 mt-1">
                  Floor {selected.floor} · {formatCurrency(selected.rateUsd)}/night
                  {selected.guestName && <> · Current guest <span className="text-ink dark:text-ivory font-medium">{selected.guestName}</span></>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FlowStatusBadge tone={STATUS_TONE[selected.status]} dot>
                  {STATUS_LABEL[selected.status]}
                </FlowStatusBadge>
                <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-input border border-g20 text-sm hover:border-teal text-ink dark:text-ivory">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            </div>

            <nav className="mt-5 flex border-b border-g20/60 -mb-px">
              {(['details', 'history', 'maintenance', 'photos'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition',
                    tab === t
                      ? 'border-teal text-teal'
                      : 'border-transparent text-g40 hover:text-ink dark:hover:text-ivory'
                  )}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>

          {tab === 'details' && <DetailsTab room={selected} />}
          {tab === 'history' && <HistoryTab />}
          {tab === 'maintenance' && <MaintenanceTab />}
          {tab === 'photos' && <PhotosTab />}
        </section>
      </div>
    </div>
  )
}

function DetailsTab({ room }: { room: Room }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Amenities">
        <ul className="grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => (
            <li key={a.id}>
              <label className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
                <input type="checkbox" defaultChecked className="accent-teal" />
                <a.icon className="h-3.5 w-3.5 text-teal" />
                {a.label}
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Rate & override">
        <div className="space-y-3">
          <Field label="Base rate" value={formatCurrency(room.rateUsd) + ' / night'} />
          <Field label="Tier" value={room.type} />
          <div>
            <label className="label-caps text-g40 mb-1 block">Manual override (today)</label>
            <input
              type="number"
              placeholder={`Default ${room.rateUsd}`}
              className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
            />
            <p className="text-[11px] text-g40 mt-1">Overrides apply for tonight only and revert at 06:00.</p>
          </div>
        </div>
      </Card>
      <Card title="Bed configuration" className="md:col-span-2">
        <div className="flex flex-wrap gap-2">
          {['1 × King', '2 × Queen', 'Sofa bed'].map((b, i) => (
            <button
              key={b}
              className={cn(
                'px-3 py-1.5 rounded-input border text-sm',
                i === 0 ? 'border-teal bg-teal-light text-teal-dark' : 'border-g20/60 text-ink dark:text-ivory hover:border-teal'
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </Card>
      <Card title="Notes" className="md:col-span-2">
        <textarea
          className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory"
          placeholder="Internal notes about this room..."
          defaultValue="Corner room with double exposure. Repeat guests often request this room — Ms. Bennett (UK)."
        />
      </Card>
    </div>
  )
}

function HistoryTab() {
  return (
    <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
      <header className="px-5 py-3 border-b border-g20/60">
        <h3 className="font-display text-lg text-ink dark:text-ivory">Last 5 stays</h3>
        <p className="text-xs text-g40 dark:text-g60">Total revenue · {formatCurrency(STAY_HISTORY.reduce((s, x) => s + x.revenue, 0))} (last 60 days)</p>
      </header>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-teal text-white">
            <th className="label-caps text-left px-5 py-3">Guest</th>
            <th className="label-caps text-left px-5 py-3">From</th>
            <th className="label-caps text-left px-5 py-3">To</th>
            <th className="label-caps text-right px-5 py-3">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {STAY_HISTORY.map((s, i) => (
            <tr key={i} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
              <td className="px-5 py-3 text-ink dark:text-ivory font-medium">{s.guest}</td>
              <td className="px-5 py-3 text-ink dark:text-ivory">{formatDate(s.from)}</td>
              <td className="px-5 py-3 text-ink dark:text-ivory">{formatDate(s.to)}</td>
              <td className="px-5 py-3 text-right text-copper font-display font-bold">{formatCurrency(s.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MaintenanceTab() {
  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
      <Card title="Log new issue">
        <form className="space-y-3">
          <div>
            <label className="label-caps text-g40 mb-1 block">Category</label>
            <select className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>HVAC</option>
              <option>Furniture</option>
              <option>Cleaning request</option>
            </select>
          </div>
          <div>
            <label className="label-caps text-g40 mb-1 block">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Normal', 'High'].map((p, i) => (
                <label key={p} className="flex items-center gap-1 px-3 py-1.5 rounded-input border border-g20/60 text-sm text-ink dark:text-ivory">
                  <input type="radio" name="priority" defaultChecked={i === 1} className="accent-teal" />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label-caps text-g40 mb-1 block">Describe the issue</label>
            <textarea
              className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory"
              placeholder="What needs attention?"
            />
          </div>
          <button type="button" className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">
            <Wrench className="h-3.5 w-3.5" /> Log issue
          </button>
        </form>
      </Card>
      <Card title="Maintenance history">
        <ul className="divide-y divide-g20/40 -mt-1">
          {MAINTENANCE_HISTORY.map((m, i) => (
            <li key={i} className="py-3 flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-teal" />
              <div className="flex-1">
                <div className="font-medium text-ink dark:text-ivory text-sm">{m.issue}</div>
                <div className="text-xs text-g40">{formatDate(m.date)} · {m.tech}</div>
              </div>
              <FlowStatusBadge tone="completed">{m.status}</FlowStatusBadge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function PhotosTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {['Bed area', 'Bathroom', 'Window view', 'Desk', 'Entrance', 'Bath amenities'].map((label) => (
          <figure key={label} className="rounded-card overflow-hidden border border-g20/60 bg-white dark:bg-panel-mid">
            <div className="aspect-[4/3] bg-gradient-to-br from-teal-light to-teal/30 dark:from-panel dark:to-teal-dark/40 flex items-center justify-center">
              <Camera className="h-8 w-8 text-teal opacity-50" />
            </div>
            <figcaption className="px-3 py-2 text-xs text-g40 flex items-center justify-between">
              <span>{label}</span>
              <button className="text-teal hover:text-teal-dark text-[11px]">Replace</button>
            </figcaption>
          </figure>
        ))}
      </div>
      <FlowFileUpload label="Add new photos" accept="image/*" hint="JPG / PNG · up to 10 MB each" />
    </div>
  )
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card', className)}>
      <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
