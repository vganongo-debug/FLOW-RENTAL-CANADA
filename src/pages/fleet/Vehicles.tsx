import { useMemo, useState } from 'react'
import { LayoutGrid, List, Plus, Car, Camera, Gauge, FileText, MapPin, Wrench, Battery, Fuel, Shield } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { FlowFileUpload } from '../../components/flow/FlowFileUpload'
import { VEHICLES, RENTAL_BOOKINGS } from '../../lib/sampleData'
import type { Vehicle } from '../../lib/types'

type View = 'grid' | 'list'
type Tab = 'overview' | 'rentals' | 'maintenance' | 'documents' | 'gps'

const STATUS_TONE: Record<Vehicle['status'], 'active' | 'info' | 'pending' | 'cancelled'> = {
  available: 'active',
  on_rent: 'info',
  maintenance: 'pending',
  overdue: 'cancelled',
}

const STATUS_LABEL: Record<Vehicle['status'], string> = {
  available: 'Available',
  on_rent: 'On rent',
  maintenance: 'Maintenance',
  overdue: 'Overdue',
}

const MAINTENANCE_LOG = [
  { date: '2026-04-12', km: 27_800, type: 'Routine service', cost: 220, vendor: 'Toyota Uganda', status: 'Resolved' },
  { date: '2026-02-04', km: 22_400, type: 'Tyre rotation', cost: 80, vendor: 'Quick Fit', status: 'Resolved' },
  { date: '2025-11-18', km: 14_900, type: '15k km major service', cost: 480, vendor: 'Toyota Uganda', status: 'Resolved' },
]

export default function Vehicles() {
  const [view, setView] = useState<View>('grid')
  const [selectedId, setSelectedId] = useState<string>(VEHICLES[0].id)
  const [tab, setTab] = useState<Tab>('overview')
  const [statusFilter, setStatusFilter] = useState<'all' | Vehicle['status']>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'flow' | 'partner'>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')

  const filtered = useMemo(() => VEHICLES.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false
    if (tierFilter !== 'all' && v.tier !== tierFilter) return false
    if (ownerFilter !== 'all' && v.owner !== ownerFilter) return false
    if (locationFilter !== 'all' && v.location !== locationFilter) return false
    return true
  }), [statusFilter, tierFilter, ownerFilter, locationFilter])

  const selected = VEHICLES.find((v) => v.id === selectedId) ?? VEHICLES[0]
  const locations = Array.from(new Set(VEHICLES.map((v) => v.location)))
  const tiers = Array.from(new Set(VEHICLES.map((v) => v.tier)))

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Fleet · Inventory</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Vehicle Inventory</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{VEHICLES.length} vehicles · Flow-owned and partner</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex border border-g20/60 rounded-input bg-white dark:bg-panel-mid">
            <button onClick={() => setView('grid')} className={cn('p-2 rounded-l-input', view === 'grid' ? 'bg-teal text-white' : 'text-g40 hover:text-ink dark:hover:text-ivory')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('p-2 rounded-r-input', view === 'list' ? 'bg-teal text-white' : 'text-g40 hover:text-ink dark:hover:text-ivory')}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" /> Add vehicle
          </button>
        </div>
      </header>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <Select label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as 'all' | Vehicle['status'])}>
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABEL) as Vehicle['status'][]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </Select>
        <Select label="Tier" value={tierFilter} onChange={setTierFilter}>
          <option value="all">All tiers</option>
          {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Owner" value={ownerFilter} onChange={(v) => setOwnerFilter(v as 'all' | 'flow' | 'partner')}>
          <option value="all">All owners</option>
          <option value="flow">Flow Rentals</option>
          <option value="partner">Fleet Partner</option>
        </Select>
        <Select label="Location" value={locationFilter} onChange={setLocationFilter}>
          <option value="all">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
        <div className="ml-auto label-caps text-g40">{filtered.length} of {VEHICLES.length} shown</div>
      </div>

      {/* Grid / list */}
      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} selected={selectedId === v.id} onSelect={() => setSelectedId(v.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Plate','Vehicle','Tier','Owner','Location','Mileage','Status','Rate / day'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-4 py-3', i === 5 || i === 7 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    'border-b border-g20/40 last:border-0 cursor-pointer transition-colors',
                    i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel',
                    selectedId === v.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-teal-light dark:hover:bg-teal-dark/20'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-ink dark:text-ivory">{v.plate}</td>
                  <td className="px-4 py-3 text-ink dark:text-ivory">
                    <div className="font-medium">{v.make} {v.model}</div>
                    <div className="text-[11px] text-g40">{v.year}</div>
                  </td>
                  <td className="px-4 py-3 text-ink dark:text-ivory">{v.tier}</td>
                  <td className="px-4 py-3">
                    <FlowStatusBadge tone={v.owner === 'flow' ? 'info' : 'warning'} dot>
                      {v.owner === 'flow' ? 'Flow' : v.partnerName?.split(' ')[0]}
                    </FlowStatusBadge>
                  </td>
                  <td className="px-4 py-3 text-ink dark:text-ivory">{v.location}</td>
                  <td className="px-4 py-3 text-right text-ink dark:text-ivory">{v.km.toLocaleString()} km</td>
                  <td className="px-4 py-3"><FlowStatusBadge tone={STATUS_TONE[v.status]} dot>{STATUS_LABEL[v.status]}</FlowStatusBadge></td>
                  <td className="px-4 py-3 text-right text-copper font-display font-bold">{formatCurrency(v.dailyRateUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail */}
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-4">
            <div className="h-20 w-28 rounded-card bg-gradient-to-br from-ink to-coal flex items-center justify-center shrink-0">
              <Car className="h-10 w-10 text-copper opacity-80" />
            </div>
            <div>
              <div className="label-caps text-g40">{selected.year} · {selected.tier}</div>
              <h2 className="font-display text-2xl text-ink dark:text-ivory leading-tight">{selected.make} {selected.model}</h2>
              <div className="text-sm text-g40 mt-0.5">
                <span className="font-mono">{selected.plate}</span> · {selected.location}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <FlowStatusBadge tone={STATUS_TONE[selected.status]} dot>{STATUS_LABEL[selected.status]}</FlowStatusBadge>
                <FlowStatusBadge tone={selected.owner === 'flow' ? 'info' : 'warning'} dot>
                  {selected.owner === 'flow' ? 'Flow-owned' : `Partner · ${selected.partnerName}`}
                </FlowStatusBadge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="label-caps text-g40">Rate</div>
            <div className="font-display font-bold text-3xl text-copper">{formatCurrency(selected.dailyRateUsd)}</div>
            <div className="text-xs text-g40">per day</div>
          </div>
        </div>
        <nav className="mt-5 flex border-b border-g20/60 -mb-px overflow-x-auto flow-scroll">
          {(['overview','rentals','maintenance','documents','gps'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition whitespace-nowrap',
                tab === t ? 'border-teal text-teal' : 'border-transparent text-g40 hover:text-ink dark:hover:text-ivory'
              )}
            >
              {t === 'rentals' ? 'Rental history' : t === 'gps' ? 'GPS track' : t}
            </button>
          ))}
        </nav>
      </section>

      {tab === 'overview' && <OverviewTab vehicle={selected} />}
      {tab === 'rentals' && <RentalsTab vehiclePlate={selected.plate} />}
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'documents' && <DocumentsTab />}
      {tab === 'gps' && <GpsTab vehicle={selected} />}
    </div>
  )
}

function VehicleCard({ vehicle, selected, onSelect }: { vehicle: Vehicle; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'rounded-card overflow-hidden border bg-white dark:bg-panel-mid text-left transition shadow-card',
        selected ? 'border-teal ring-2 ring-teal/30' : 'border-g20/60 hover:border-teal/50'
      )}
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-ink to-coal relative flex items-center justify-center">
        <Car className="h-16 w-16 text-copper opacity-80" />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-badge bg-copper text-white text-[10px] label-caps">
          {vehicle.tier}
        </span>
        <span className={cn(
          'absolute top-2 right-2 px-2 py-0.5 rounded-badge text-[10px] label-caps',
          vehicle.owner === 'flow' ? 'bg-teal text-white' : 'bg-copper-light text-copper-dark'
        )}>
          {vehicle.owner === 'flow' ? 'Flow' : 'Partner'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg text-ink dark:text-ivory leading-tight">{vehicle.make} {vehicle.model}</h3>
            <div className="text-xs text-g40 font-mono">{vehicle.plate} · {vehicle.year}</div>
          </div>
          <FlowStatusBadge tone={STATUS_TONE[vehicle.status]} dot>{STATUS_LABEL[vehicle.status]}</FlowStatusBadge>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-g40">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vehicle.location}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {vehicle.km.toLocaleString()} km</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-g20/40 pt-3">
          <span className="text-xs text-g40">Last service · {formatDate(vehicle.lastServiceDate)}</span>
          <span className="font-display font-bold text-copper">{formatCurrency(vehicle.dailyRateUsd)}<span className="text-[11px] font-normal text-g40">/day</span></span>
        </div>
      </div>
    </button>
  )
}

function OverviewTab({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="Vehicle details" className="md:col-span-2">
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row term="Make / Model" value={`${vehicle.make} ${vehicle.model}`} />
          <Row term="Year" value={String(vehicle.year)} />
          <Row term="Plate" value={vehicle.plate} />
          <Row term="Tier" value={vehicle.tier} />
          <Row term="Location" value={vehicle.location} />
          <Row term="Mileage" value={`${vehicle.km.toLocaleString()} km`} />
          <Row term="Last service" value={formatDate(vehicle.lastServiceDate)} />
          <Row term="Next service due" value="At 30,000 km · 1,570 km" />
          <Row term="Owner" value={vehicle.owner === 'flow' ? 'Flow Rentals Global Inc.' : (vehicle.partnerName ?? '—')} />
          <Row term="Commission rate" value={vehicle.owner === 'partner' ? '18% Flow / 82% Partner' : '—'} />
        </dl>
      </Card>
      <Card title="Telematics">
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-g40"><Fuel className="h-4 w-4 text-teal" /> Fuel level</span>
            <span className="text-ink dark:text-ivory font-medium">68%</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-g40"><Battery className="h-4 w-4 text-teal" /> 12V battery</span>
            <span className="text-ink dark:text-ivory font-medium">12.6 V</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-g40"><Gauge className="h-4 w-4 text-teal" /> Last trip</span>
            <span className="text-ink dark:text-ivory font-medium">142 km</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-g40"><Shield className="h-4 w-4 text-teal" /> Geofence</span>
            <span className="text-ink dark:text-ivory font-medium">Inside zone</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

function RentalsTab({ vehiclePlate }: { vehiclePlate: string }) {
  const rentals = RENTAL_BOOKINGS.filter((b) => b.vehiclePlate === vehiclePlate)
  const total = rentals.reduce((s, b) => s + b.totalUsd, 0)
  return (
    <Card title="Rental history">
      {rentals.length === 0 ? (
        <p className="text-sm text-g40 italic py-6 text-center">No rentals recorded for this vehicle yet.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Booking','Client','Pickup','Days','Total','Status'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 3 || i === 4 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rentals.map((b, i) => (
                <tr key={b.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{b.id}</td>
                  <td className="px-3 py-2 text-ink dark:text-ivory">{b.clientName}</td>
                  <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(b.startDate)}</td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{b.days}</td>
                  <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(b.totalUsd)}</td>
                  <td className="px-3 py-2"><FlowStatusBadge tone={b.status === 'checked_in' ? 'active' : 'info'} dot>{b.status.replace('_',' ')}</FlowStatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between text-sm border-t border-g20/40 pt-3">
            <span className="text-g40">Total revenue (lifetime · this vehicle)</span>
            <span className="text-copper font-display font-bold text-xl">{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </Card>
  )
}

function MaintenanceTab() {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
      <Card title="Log service">
        <form className="space-y-3">
          <Field label="Service type">
            <select className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
              <option>Routine service</option><option>Tyres</option><option>Brakes</option><option>Body work</option><option>Inspection</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Odometer (km)">
              <input type="number" defaultValue="28430" className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </Field>
            <Field label="Cost (USD)">
              <input type="number" defaultValue="220" className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </Field>
          </div>
          <Field label="Vendor / workshop">
            <input defaultValue="Toyota Uganda · Kampala" className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
          </Field>
          <Field label="Notes">
            <textarea className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[60px] text-ink dark:text-ivory" />
          </Field>
          <button type="button" className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium">
            <Wrench className="h-3.5 w-3.5" /> Save service entry
          </button>
        </form>
      </Card>
      <Card title="Service history">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Date','Km','Type','Vendor','Cost','Status'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 1 || i === 4 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE_LOG.map((m, i) => (
              <tr key={i} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(m.date)}</td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{m.km.toLocaleString()}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{m.type}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{m.vendor}</td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(m.cost)}</td>
                <td className="px-3 py-2"><FlowStatusBadge tone="completed">{m.status}</FlowStatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function DocumentsTab() {
  const docs = [
    { name: 'Insurance · CIC General · 2026-2027.pdf', size: '512 KB', expiry: '2027-03-31', status: 'Active' },
    { name: 'URA Vehicle Registration · UAJ 042X.pdf', size: '128 KB', expiry: '2026-12-31', status: 'Active' },
    { name: 'Roadworthiness inspection · 2026-Q2.pdf', size: '84 KB', expiry: '2026-06-30', status: 'Active' },
    { name: 'Service book · Toyota.pdf', size: '1.2 MB', expiry: '—', status: 'Active' },
  ]
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <Card title="Vehicle documents">
        <ul className="divide-y divide-g20/40">
          {docs.map((d) => (
            <li key={d.name} className="py-3 flex items-center gap-3">
              <FileText className="h-4 w-4 text-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink dark:text-ivory text-sm truncate">{d.name}</div>
                <div className="text-xs text-g40">{d.size} · Expires {d.expiry}</div>
              </div>
              <FlowStatusBadge tone="active">{d.status}</FlowStatusBadge>
              <button className="text-xs text-teal hover:text-teal-dark font-medium ml-2">View</button>
            </li>
          ))}
        </ul>
      </Card>
      <FlowFileUpload label="Upload document" hint="PDF up to 10 MB · auto-tagged to vehicle" />
    </div>
  )
}

function GpsTab({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card title="GPS track" >
      <p className="text-xs text-g40 mb-3">Last known position · {vehicle.gps.lat.toFixed(4)}, {vehicle.gps.lng.toFixed(4)} · updated 2m ago</p>
      <FlowMapView vehicles={[vehicle]} height={320} />
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Stat label="Today's distance" value="142 km" />
        <Stat label="Avg speed" value="42 km/h" />
        <Stat label="Max speed" value="98 km/h" />
        <Stat label="Idle time" value="38m" />
      </div>
    </Card>
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

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-g20/30 last:border-0">
      <dt className="text-g40">{term}</dt>
      <dd className="text-ink dark:text-ivory font-medium text-right">{value}</dd>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1 block">{label}</span>
      {children}
    </label>
  )
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <span className="label-caps text-g40 block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
      >
        {children}
      </select>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input border border-g20/60 bg-ivory dark:bg-panel px-3 py-2">
      <div className="label-caps text-g40">{label}</div>
      <div className="font-display font-bold text-ink dark:text-ivory">{value}</div>
    </div>
  )
}
