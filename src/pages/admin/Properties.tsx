import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Hotel, Car, MapPin, Trash2, Edit3, Search, Building2, ChevronRight, Check } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { useApi } from '../../lib/useApi'
import { properties, type PropertyCreateInput } from '../../lib/api'
import { PROVINCES, MARKET_STATUS } from '../../lib/canada'
import { VEHICLES } from '../../lib/sampleData'
import type { CountryCode, Property, PropertyType } from '../../lib/types'

const TYPE_LABEL: Record<PropertyType, string> = {
  hotel: 'Hotel',
  car_rental: 'Car rental agency',
  both: 'Hotel + Car rental',
}

const TYPE_ICON: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  hotel: Hotel,
  car_rental: Car,
  both: Building2,
}

export default function Properties() {
  const { data, loading, refetch } = useApi(() => properties.list())
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | PropertyType>('all')
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<Property | null>(null)

  const rows = useMemo(() => {
    if (!data) return []
    return data.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (countryFilter !== 'all' && p.countryCode !== countryFilter) return false
      if (q.trim()) {
        const n = q.toLowerCase()
        if (!p.name.toLowerCase().includes(n) && !p.city.toLowerCase().includes(n) && !p.country.toLowerCase().includes(n)) return false
      }
      return true
    })
  }, [data, typeFilter, countryFilter, q])

  const counts = useMemo(() => {
    if (!data) return { live: 0, hotels: 0, cars: 0, countries: 0 }
    return {
      live: data.filter((p) => p.status === 'live').length,
      hotels: data.filter((p) => p.type === 'hotel' || p.type === 'both').length,
      cars: data.filter((p) => p.type === 'car_rental' || p.type === 'both').length,
      countries: new Set(data.map((p) => p.countryCode)).size,
    }
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
          <div className="label-caps text-g40">SuperAdmin · Network</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Properties</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">All Flow stations and rental desks across the network</p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add property
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Live properties" value={String(counts.live)} accent="teal" icon={<Building2 className="h-4 w-4" />} hint="Hotels + car rentals" />
        <FlowKPICard label="Hotels" value={String(counts.hotels)} accent="teal" icon={<Hotel className="h-4 w-4" />} />
        <FlowKPICard label="Car rental agencies" value={String(counts.cars)} accent="copper" icon={<Car className="h-4 w-4" />} />
        <FlowKPICard label="Countries" value={String(counts.countries)} hint={`${Object.keys(MARKET_STATUS).length} in pipeline`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card lg:col-span-2">
          <header className="mb-3">
            <h3 className="font-display text-lg text-ink dark:text-ivory">Network map</h3>
            <p className="text-xs text-g40">Each pin is a Flow property · drag-zoom Mapbox in production</p>
          </header>
          <FlowMapView vehicles={VEHICLES} height={300} />
        </section>
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <header className="mb-3">
            <h3 className="font-display text-lg text-ink dark:text-ivory">Market status</h3>
            <p className="text-xs text-g40">Pipeline by province</p>
          </header>
          <ul className="space-y-1.5 max-h-[260px] overflow-y-auto flow-scroll text-sm">
            {Object.entries(MARKET_STATUS).map(([code, status]) => {
              const c = PROVINCES.find((x) => x.code === code)
              if (!c) return null
              return (
                <li key={code} className="flex items-center justify-between">
                  <span className="text-ink dark:text-ivory">{c.code} · {c.name}</span>
                  <FlowStatusBadge tone={status === 'live' ? 'active' : status === 'pilot' ? 'info' : status === 'prospect' ? 'pending' : 'neutral'}>
                    {status}
                  </FlowStatusBadge>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="label-caps text-g40 block mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, city, country"
              className="w-full pl-8 pr-2 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
            />
          </div>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | PropertyType)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All types</option>
            <option value="hotel">Hotel</option>
            <option value="car_rental">Car rental</option>
            <option value="both">Hotel + Car rental</option>
          </select>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Province</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All provinces</option>
            {PROVINCES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}
          </select>
        </div>
        <div className="ml-auto label-caps text-g40">{rows.length} of {data?.length ?? 0}</div>
      </div>

      {loading ? (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center text-g40">Loading…</div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => {
            const Icon = TYPE_ICON[p.type]
            const country = PROVINCES.find((c) => c.code === p.countryCode)
            return (
              <li key={p.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card overflow-hidden hover:border-teal/60 transition-colors">
                <Link to={`/admin/properties/${p.id}`} className="block">
                  <div className={cn('aspect-[16/9] relative flex items-center justify-center',
                    p.type === 'hotel' ? 'bg-gradient-to-br from-teal to-teal-dark' :
                    p.type === 'car_rental' ? 'bg-gradient-to-br from-coal to-ink' :
                    'bg-gradient-to-br from-teal to-coal'
                  )}>
                    <Icon className="h-12 w-12 text-copper opacity-80" aria-hidden="true" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-badge bg-white/90 text-ink text-[10px] label-caps">
                      {country?.code} · {country?.name}
                    </span>
                    <span className="absolute top-2 right-2">
                      <FlowStatusBadge tone={p.status === 'live' ? 'active' : p.status === 'opening' ? 'pending' : 'info'} dot>
                        {p.status}
                      </FlowStatusBadge>
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg text-ink dark:text-ivory leading-tight">{p.name}</h3>
                    <div className="text-xs text-g40 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.address ?? p.city}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-g40">
                      {p.rooms !== undefined && <span>{p.rooms} rooms</span>}
                      {p.vehicles !== undefined && <span>{p.vehicles} vehicles</span>}
                      {p.goLiveDate && <span>Since {formatDate(p.goLiveDate)}</span>}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 -mt-1">
                  <div className="flex items-center justify-between border-t border-g20/40 pt-3">
                    <div>
                      <div className="label-caps text-g40">MTD</div>
                      <div className="font-display font-bold text-copper">{formatCurrency(p.monthlyRevenueCad)}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal"
                        aria-label={`Edit ${p.name}`}
                      >
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
                </div>
              </li>
            )
          })}
          {rows.length === 0 && (
            <li className="sm:col-span-2 lg:col-span-3 rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center text-g40 italic">
              No properties match your filters.
            </li>
          )}
        </ul>
      )}

      {wizardOpen && (
        <AddPropertyWizard
          onClose={() => setWizardOpen(false)}
          onCreated={() => { setWizardOpen(false); refetch() }}
        />
      )}

      <FlowConfirmDialog
        open={!!confirmRemove}
        title={`Remove ${confirmRemove?.name ?? ''}?`}
        description="The property will be deactivated and won't appear in the network. Historical reports and bookings remain intact."
        confirmLabel="Remove property"
        destructive
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}

type DraftProperty = Omit<PropertyCreateInput, 'countryCode'> & { countryCode: CountryCode | '' }

function AddPropertyWizard({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Property) => void }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  // La province reste vide tant que l'utilisateur n'a pas choisi — l'étape 1
  // ne peut pas être validée sans elle, donc la création reçoit toujours un code.
  const [form, setForm] = useState<DraftProperty>({
    name: '',
    type: 'hotel',
    city: '',
    country: '',
    countryCode: '',
    rooms: 30,
    vehicles: 5,
  })
  const STEPS = ['Type', 'Location', 'Configuration', 'Contact', 'Review']

  const onCountry = (code: string) => {
    const c = PROVINCES.find((x) => x.code === code)
    if (c) setForm({ ...form, countryCode: c.code, country: c.name, city: form.city || c.capital })
  }

  const canContinue =
    step === 0 ? !!form.type :
    step === 1 ? !!form.countryCode && !!form.city :
    step === 2 ? (form.type === 'hotel' ? !!form.rooms : form.type === 'car_rental' ? !!form.vehicles : (!!form.rooms && !!form.vehicles)) :
    step === 3 ? true :
    true

  const submit = async () => {
    if (!form.countryCode) return
    setSubmitting(true)
    const created = await properties.create({
      ...form,
      countryCode: form.countryCode,
      name: form.name || `Flow ${form.type === 'car_rental' ? 'Rentals' : 'Hotels'} ${form.city}`,
    })
    setSubmitting(false)
    onCreated(created)
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 animate-flow-fade" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="add-property-title" className="bg-white dark:bg-panel-mid w-full max-w-2xl rounded-card shadow-panel animate-flow-fade max-h-[90vh] overflow-y-auto flow-scroll">
          <header className="sticky top-0 bg-white dark:bg-panel-mid border-b border-g20/60 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 id="add-property-title" className="font-display text-xl text-ink dark:text-ivory">Add a new property</h2>
              <button onClick={onClose} aria-label="Close" className="text-g40 hover:text-ink">×</button>
            </div>
            <ol className="flex items-center gap-1 overflow-x-auto flow-scroll">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-1 shrink-0">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-input text-xs font-medium',
                    i === step ? 'bg-teal text-white' : i < step ? 'bg-teal-light text-teal-dark' : 'bg-g20/40 text-g40'
                  )}>
                    <span className="font-bold">{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
                    {s}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-g40" />}
                </li>
              ))}
            </ol>
          </header>

          <div className="p-6 space-y-4">
            {step === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-g40">Pick what kind of property you're adding.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(['hotel', 'car_rental', 'both'] as PropertyType[]).map((t) => {
                    const Icon = TYPE_ICON[t]
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={cn(
                          'rounded-card p-4 border text-left transition',
                          form.type === t
                            ? 'border-teal bg-teal-light dark:bg-teal-dark/30'
                            : 'border-g20/60 hover:border-teal/50'
                        )}
                      >
                        <Icon className="h-6 w-6 text-teal mb-2" />
                        <div className="font-medium text-ink dark:text-ivory">{TYPE_LABEL[t]}</div>
                        <div className="text-[11px] text-g40 mt-0.5">
                          {t === 'hotel' ? 'Rooms, F&B, housekeeping' :
                           t === 'car_rental' ? 'Fleet, drivers, kiosk' :
                           'Combined property'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Field label="Province">
                  <select
                    value={form.countryCode}
                    onChange={(e) => onCountry(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
                  >
                    <option value="">— Choose a province or territory —</option>
                    {PROVINCES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}
                  </select>
                </Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="City">
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" placeholder="ex. Sept-Îles" />
                  </Field>
                  <Field label="Address (optional)">
                    <input value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" placeholder="Street, district" />
                  </Field>
                  <Field label="Latitude (optional)">
                    <input type="number" step="0.0001" onChange={(e) => setForm({ ...form, gps: { lat: parseFloat(e.target.value), lng: form.gps?.lng ?? 0 } })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                  </Field>
                  <Field label="Longitude (optional)">
                    <input type="number" step="0.0001" onChange={(e) => setForm({ ...form, gps: { lat: form.gps?.lat ?? 0, lng: parseFloat(e.target.value) } })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <Field label="Property name (optional · auto-generated if blank)">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`Flow ${form.type === 'car_rental' ? 'Rentals' : 'Hotels'} ${form.city}`} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(form.type === 'hotel' || form.type === 'both') && (
                    <Field label="Rooms">
                      <input type="number" value={form.rooms ?? ''} onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                    </Field>
                  )}
                  {(form.type === 'car_rental' || form.type === 'both') && (
                    <Field label="Vehicles">
                      <input type="number" value={form.vehicles ?? ''} onChange={(e) => setForm({ ...form, vehicles: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                    </Field>
                  )}
                  <Field label="Go-live date">
                    <input type="date" value={form.goLiveDate ?? ''} onChange={(e) => setForm({ ...form, goLiveDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Operations email">
                  <input type="email" value={form.contactEmail ?? ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="ops.kampala@flowrentals.com" className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                </Field>
                <Field label="Operations phone">
                  <input type="tel" value={form.contactPhone ?? ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+256 778 991 042" className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                </Field>
                {form.type !== 'hotel' && (
                  <Field label="Fleet partner (if outsourced)">
                    <input value={form.partnerId ?? ''} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} placeholder="fp-mercantile · leave blank if Flow-owned" className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
                  </Field>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 text-sm">
                <h3 className="font-display text-lg text-ink dark:text-ivory">Review before submit</h3>
                <dl className="rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3 space-y-1.5">
                  <Row label="Type"     value={TYPE_LABEL[form.type]} />
                  <Row label="Name"     value={form.name || `Flow ${form.type === 'car_rental' ? 'Rentals' : 'Hotels'} ${form.city}`} />
                  <Row label="Location" value={`${form.city}, ${form.country}`} />
                  {form.address && <Row label="Address" value={form.address} />}
                  {form.rooms    !== undefined && form.rooms    > 0 && <Row label="Rooms"    value={String(form.rooms)} />}
                  {form.vehicles !== undefined && form.vehicles > 0 && <Row label="Vehicles" value={String(form.vehicles)} />}
                  {form.goLiveDate && <Row label="Go-live" value={formatDate(form.goLiveDate)} />}
                  {form.contactEmail && <Row label="Ops email" value={form.contactEmail} />}
                  {form.contactPhone && <Row label="Ops phone" value={form.contactPhone} />}
                </dl>
                <p className="text-xs text-g40">
                  This will create a Pilot-status property. Once it's live, update status from the property card.
                </p>
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 bg-white dark:bg-panel-mid border-t border-g20/60 px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-input bg-teal text-white text-sm font-medium disabled:opacity-40"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-1 px-5 py-2 rounded-input bg-copper text-white text-sm font-medium disabled:opacity-40"
              >
                {submitting ? '…' : 'Create property'}
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
