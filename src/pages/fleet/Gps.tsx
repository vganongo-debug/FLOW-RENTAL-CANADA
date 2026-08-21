import { useMemo, useState } from 'react'
import { Filter, Search, AlertTriangle, Fuel, Gauge, MapPin, Activity, Battery } from 'lucide-react'
import { cn } from '../../lib/utils'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { VEHICLES } from '../../lib/sampleData'
import type { Vehicle } from '../../lib/types'

type OwnerFilter = 'all' | 'flow' | 'partner'

const ALERTS = [
  { id:'al-1', kind:'overdue', title:'Overdue return',  body:'CG 421 BZV · 2h past due',           tone:'warning' as const },
  { id:'al-2', kind:'fuel',    title:'Low fuel',        body:'UAJ 042X · 15% remaining',           tone:'warning' as const },
  { id:'al-3', kind:'speed',   title:'Speeding event',  body:'UAJ 109Y · 122 km/h (limit 100)',    tone:'warning' as const },
  { id:'al-4', kind:'geo',     title:'Geofence exit',   body:'ET 3-A 119 · left Addis metro zone', tone:'warning' as const },
  { id:'al-5', kind:'service', title:'Service due',     body:'UBA 312L · within 1,500 km',         tone:'info'    as const },
]

export default function Gps() {
  const [owner, setOwner] = useState<OwnerFilter>('all')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState(VEHICLES[0].id)

  const filtered = useMemo(() => VEHICLES.filter((v) => {
    if (owner !== 'all' && v.owner !== owner) return false
    if (q.trim()) {
      const n = q.toLowerCase()
      if (!v.plate.toLowerCase().includes(n) && !(`${v.make} ${v.model}`).toLowerCase().includes(n)) return false
    }
    return true
  }), [owner, q])

  const selected = VEHICLES.find((v) => v.id === selectedId) ?? VEHICLES[0]

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Fleet · Telematics</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Live GPS Tracking</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{filtered.length} vehicles in view · refreshed every 30 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-white dark:bg-panel-mid border border-g20/60 rounded-input overflow-hidden text-xs">
            {(['all','flow','partner'] as OwnerFilter[]).map((o) => (
              <button
                key={o}
                onClick={() => setOwner(o)}
                className={cn(
                  'px-3 py-1.5 transition',
                  owner === o ? 'bg-teal text-white' : 'text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-panel'
                )}
              >
                {o === 'all' ? 'All' : o === 'flow' ? 'Flow only' : 'Partner only'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr_300px] gap-4">
        {/* Left: vehicle list */}
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[640px]">
          <div className="p-3 border-b border-g20/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Plate or model"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </div>
          </div>
          <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40">
            {filtered.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 flex items-center gap-2 transition',
                    selectedId === v.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <span className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    v.owner === 'flow' ? 'bg-teal' : 'bg-copper'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory text-sm truncate">{v.plate}</div>
                    <div className="text-[11px] text-g40 truncate">{v.make} {v.model}</div>
                  </div>
                  <FlowStatusBadge tone={v.status === 'on_rent' ? 'info' : v.status === 'available' ? 'active' : v.status === 'overdue' ? 'cancelled' : 'pending'}>
                    {v.status === 'on_rent' ? 'live' : v.status}
                  </FlowStatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center: map */}
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-1 shadow-card">
          <FlowMapView vehicles={filtered} height={640} />
        </section>

        {/* Right: alerts + selected vehicle */}
        <aside className="space-y-4">
          <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
            <header className="px-4 py-2.5 border-b border-g20/60 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-copper" />
              <h3 className="font-display text-base text-ink dark:text-ivory flex-1">Alerts</h3>
              <FlowStatusBadge tone="warning">{ALERTS.filter(a => a.tone === 'warning').length} active</FlowStatusBadge>
            </header>
            <ul className="divide-y divide-g20/40 max-h-[260px] overflow-y-auto flow-scroll">
              {ALERTS.map((a) => (
                <li key={a.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn('mt-1.5 h-2 w-2 rounded-full', a.tone === 'warning' ? 'bg-copper' : 'bg-teal')} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink dark:text-ivory">{a.title}</div>
                      <div className="text-xs text-g40">{a.body}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4">
            <h3 className="label-caps text-g40 mb-2">Selected vehicle</h3>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-display text-lg text-ink dark:text-ivory leading-tight">{selected.make} {selected.model}</div>
                <div className="text-xs text-g40 font-mono">{selected.plate}</div>
              </div>
              <FlowStatusBadge tone={selected.owner === 'flow' ? 'info' : 'warning'} dot>
                {selected.owner === 'flow' ? 'Flow' : 'Partner'}
              </FlowStatusBadge>
            </div>
            <ul className="space-y-2 text-sm">
              <Telem icon={<MapPin className="h-3.5 w-3.5 text-teal" />} label="Location" value={selected.location} />
              <Telem icon={<Activity className="h-3.5 w-3.5 text-teal" />} label="Status" value={selected.status.replace('_',' ')} />
              <Telem icon={<Fuel className="h-3.5 w-3.5 text-teal" />} label="Fuel" value="68%" />
              <Telem icon={<Gauge className="h-3.5 w-3.5 text-teal" />} label="Speed" value="42 km/h" />
              <Telem icon={<Battery className="h-3.5 w-3.5 text-teal" />} label="Battery" value="12.6 V" />
            </ul>
            <button className="w-full mt-3 px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium">
              Open vehicle file
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Telem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-g40">{icon}{label}</span>
      <span className="text-ink dark:text-ivory font-medium capitalize">{value}</span>
    </li>
  )
}
