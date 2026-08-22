import { useMemo, useState } from 'react'
import { Hotel, Car, MapPin, Plus, Trash2, Edit3, Building2, Phone, Mail } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { useApi } from '../../lib/useApi'
import { properties, type PropertyCreateInput } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { PROVINCES } from '../../lib/canada'
import type { CountryCode, Property, PropertyType } from '../../lib/types'

const TYPE_ICON: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  hotel: Hotel,
  car_rental: Car,
  both: Building2,
}

export default function CountryLocations() {
  const { user } = useAuth()
  const code: CountryCode = user?.countryCode ?? 'QC'
  const country = PROVINCES.find((p) => p.code === code)
  const { data, loading, refetch } = useApi(() => properties.list({ countryCode: code }), [code])
  const [confirmRemove, setConfirmRemove] = useState<Property | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const stats = useMemo(() => {
    if (!data) return { hotels: 0, cars: 0, rooms: 0, vehicles: 0, cities: 0, mtd: 0 }
    return {
      hotels: data.filter((p) => p.type === 'hotel' || p.type === 'both').length,
      cars: data.filter((p) => p.type === 'car_rental' || p.type === 'both').length,
      rooms: data.reduce((s, p) => s + (p.rooms ?? 0), 0),
      vehicles: data.reduce((s, p) => s + (p.vehicles ?? 0), 0),
      cities: new Set(data.map((p) => p.city)).size,
      mtd: data.reduce((s, p) => s + p.monthlyRevenueCad, 0),
    }
  }, [data])

  const byCity = useMemo(() => {
    if (!data) return {} as Record<string, Property[]>
    const out: Record<string, Property[]> = {}
    data.forEach((p) => { (out[p.city] = out[p.city] ?? []).push(p) })
    return out
  }, [data])

  const handleRemove = async () => {
    if (!confirmRemove) return
    await properties.remove(confirmRemove.id)
    setConfirmRemove(null)
    refetch()
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Country Manager · {country?.code} · {country?.name}</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Locations</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">All Flow properties under your responsibility · add or close locations directly here.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add location in {country?.name}
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <FlowKPICard label="Hotels" value={String(stats.hotels)} accent="teal" icon={<Hotel className="h-4 w-4" />} />
        <FlowKPICard label="Car rentals" value={String(stats.cars)} accent="copper" icon={<Car className="h-4 w-4" />} />
        <FlowKPICard label="Rooms" value={String(stats.rooms)} accent="teal" />
        <FlowKPICard label="Vehicles" value={String(stats.vehicles)} accent="copper" />
        <FlowKPICard label="Cities" value={String(stats.cities)} />
        <FlowKPICard label="Revenue · MTD" value={formatCurrency(stats.mtd)} delta={{ pct: 8.4, direction: 'up' }} />
      </div>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <header className="mb-3">
          <h3 className="font-display text-lg text-ink dark:text-ivory">Map · {country?.name}</h3>
          <p className="text-xs text-g40">Each pin is a Flow location · drag-zoom in production</p>
        </header>
        <FlowMapView
          vehicles={(data ?? []).filter((p) => p.gps).map((p) => ({
            id: p.id, plate: p.id, make: p.name, model: '', year: 2026,
            tier: 'Flow Drive' as const, owner: 'flow' as const,
            location: p.city, countryCode: p.countryCode,
            status: 'available' as const, km: 0, lastServiceDate: '',
            dailyRateCad: 0, gps: p.gps!,
          }))}
          height={300}
        />
      </section>

      {loading ? (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center text-g40">Loading…</div>
      ) : Object.keys(byCity).length === 0 ? (
        <div className="rounded-card border border-dashed border-g20 bg-white dark:bg-panel-mid p-10 text-center">
          <Building2 className="h-10 w-10 text-teal mx-auto mb-2 opacity-50" aria-hidden="true" />
          <h3 className="font-display text-lg text-ink dark:text-ivory">No locations yet in {country?.name}</h3>
          <p className="text-sm text-g40 mt-1">Add your first hotel or car rental agency to get started.</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white text-sm font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add your first location
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(byCity).map(([city, props]) => (
            <section key={city}>
              <header className="flex items-center justify-between mb-2">
                <h2 className="font-display text-xl text-ink dark:text-ivory">
                  {city} <span className="text-sm text-g40 font-normal">· {props.length} {props.length === 1 ? 'location' : 'locations'}</span>
                </h2>
              </header>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {props.map((p) => {
                  const Icon = TYPE_ICON[p.type]
                  return (
                    <li key={p.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card p-4">
                      <div className="flex items-start gap-3">
                        <span className={cn('h-10 w-10 rounded-card flex items-center justify-center shrink-0',
                          p.type === 'hotel' ? 'bg-teal-light text-teal-dark' :
                          p.type === 'car_rental' ? 'bg-copper-light text-copper-dark' :
                          'bg-teal text-white'
                        )}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-base text-ink dark:text-ivory leading-tight">{p.name}</h3>
                          <div className="text-xs text-g40 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {p.address ?? p.city}
                          </div>
                        </div>
                        <FlowStatusBadge tone={p.status === 'live' ? 'active' : 'pending'} dot>{p.status}</FlowStatusBadge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-g40">
                        {p.rooms !== undefined    && <span>{p.rooms} rooms</span>}
                        {p.vehicles !== undefined && <span>{p.vehicles} vehicles</span>}
                        {p.goLiveDate             && <span>Live since {formatDate(p.goLiveDate)}</span>}
                      </div>
                      {(p.contactEmail || p.contactPhone) && (
                        <div className="mt-2 text-xs text-g40 space-y-0.5">
                          {p.contactEmail && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.contactEmail}</div>}
                          {p.contactPhone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.contactPhone}</div>}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-g20/40 pt-3">
                        <div>
                          <div className="label-caps text-g40">MTD</div>
                          <div className="font-display font-bold text-copper">{formatCurrency(p.monthlyRevenueCad)}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal" aria-label={`Edit ${p.name}`}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmRemove(p)}
                            className="p-1.5 rounded-input border border-g20 text-g40 hover:text-red-600 hover:border-red-300"
                            aria-label={`Remove ${p.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {addOpen && country && (
        <QuickAddLocation
          countryCode={country.code}
          countryName={country.name}
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); refetch() }}
        />
      )}

      <FlowConfirmDialog
        open={!!confirmRemove}
        title={`Remove ${confirmRemove?.name ?? ''}?`}
        description="The location will be deactivated. Historical reports and bookings remain intact for accounting."
        confirmLabel="Remove location"
        destructive
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}

function QuickAddLocation({ countryCode, countryName, onClose, onCreated }: {
  countryCode: CountryCode
  countryName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<PropertyCreateInput>({
    name: '',
    type: 'hotel',
    city: '',
    country: countryName,
    countryCode,
    rooms: 30,
    vehicles: 5,
  })

  const submit = async () => {
    if (!form.city.trim()) return
    setSubmitting(true)
    await properties.create({
      ...form,
      name: form.name || `Flow ${form.type === 'car_rental' ? 'Rentals' : 'Hotels'} ${form.city}`,
    })
    setSubmitting(false)
    onCreated()
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 animate-flow-fade" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="quick-add-title" className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel animate-flow-fade">
          <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between">
            <h2 id="quick-add-title" className="font-display text-lg text-ink dark:text-ivory">Add location · {countryName}</h2>
            <button onClick={onClose} aria-label="Close" className="text-g40 hover:text-ink">×</button>
          </header>

          <div className="p-5 space-y-3">
            <div>
              <span className="label-caps text-g40 block mb-2">Type</span>
              <div className="grid grid-cols-3 gap-2">
                {(['hotel', 'car_rental', 'both'] as PropertyType[]).map((t) => {
                  const Icon = TYPE_ICON[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={cn('rounded-input p-2 border text-center transition',
                        form.type === t ? 'border-teal bg-teal-light dark:bg-teal-dark/30' : 'border-g20/60'
                      )}
                    >
                      <Icon className="h-4 w-4 text-teal mx-auto mb-1" />
                      <div className="text-[10px] font-medium label-caps text-ink dark:text-ivory">
                        {t === 'both' ? 'Combined' : t === 'car_rental' ? 'Car rental' : 'Hotel'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">City</span>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Kampala" className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </label>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Name (optional)</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`Flow ${form.type === 'car_rental' ? 'Rentals' : 'Hotels'} ${form.city || '…'}`} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(form.type === 'hotel' || form.type === 'both') && (
                <label className="block">
                  <span className="label-caps text-g40 mb-1 block">Rooms</span>
                  <input type="number" value={form.rooms ?? 0} onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                </label>
              )}
              {(form.type === 'car_rental' || form.type === 'both') && (
                <label className="block">
                  <span className="label-caps text-g40 mb-1 block">Vehicles</span>
                  <input type="number" value={form.vehicles ?? 0} onChange={(e) => setForm({ ...form, vehicles: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                </label>
              )}
            </div>
            <p className="text-[11px] text-g40">
              Need full configuration? Use the <strong>Properties</strong> wizard for GPS, partner mapping, contact info.
            </p>
          </div>

          <footer className="px-5 py-3 border-t border-g20/60 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            <button
              onClick={submit}
              disabled={submitting || !form.city.trim()}
              className="px-4 py-2 rounded-input bg-copper text-white text-sm font-medium disabled:opacity-40"
            >
              {submitting ? '…' : 'Create location'}
            </button>
          </footer>
        </div>
      </div>
    </>
  )
}
