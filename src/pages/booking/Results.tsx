import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hotel, Car, Star, Wifi, Coffee, Plane, MapPin, Users, ShieldCheck, Award } from 'lucide-react'
import { SEARCH_RESULTS_HOTELS, SEARCH_RESULTS_CARS } from '../../lib/sampleData'
import { cn } from '../../lib/utils'
import { useCurrencyFormatter } from '../../lib/useCurrencyFormatter'

type Mode = 'stay' | 'drive'

export default function Results() {
  const [mode, setMode] = useState<Mode>('stay')
  const [priceMax, setPriceMax] = useState(300)
  const [tier, setTier] = useState<string>('all')
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Available · 14 – 18 May 2026</h1>
          <p className="text-sm text-g40">Kampala, Uganda · 2 guests</p>
        </div>
        <div className="inline-flex bg-white dark:bg-panel-mid border border-g20/60 rounded-input p-1">
          <ModeBtn active={mode === 'stay'} onClick={() => setMode('stay')} icon={<Hotel className="h-4 w-4" />} label="Stays" />
          <ModeBtn active={mode === 'drive'} onClick={() => setMode('drive')} icon={<Car className="h-4 w-4" />} label="Cars" />
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-4">
          <Filter title="Price · per night">
            <input
              type="range" min={50} max={400} value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-teal"
            />
            <div className="flex justify-between text-xs text-g40 mt-1">
              <span>$50</span>
              <span className="text-copper font-bold">up to {formatCurrency(priceMax)}</span>
            </div>
          </Filter>
          {mode === 'stay' ? (
            <>
              <Filter title="Room type">
                {['Standard', 'Deluxe', 'Suite', 'Executive'].map((t) => (
                  <Check key={t} label={t} />
                ))}
              </Filter>
              <Filter title="Amenities">
                {['Pool', 'Restaurant', 'Gym', 'Airport transfer', 'Co-working', 'Spa'].map((a) => (
                  <Check key={a} label={a} />
                ))}
              </Filter>
            </>
          ) : (
            <>
              <Filter title="Tier">
                <select
                  value={tier} onChange={(e) => setTier(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm rounded-input border border-g20/60 bg-ivory dark:bg-panel text-ink dark:text-ivory"
                >
                  <option value="all">All tiers</option>
                  <option>Flow GO</option>
                  <option>Flow Drive</option>
                  <option>Flow Terrain</option>
                  <option>Flow Prestige</option>
                  <option>Flow Elite</option>
                </select>
              </Filter>
              <Filter title="Features">
                {['GPS included', 'Air conditioning', '4×4', 'Driver included'].map((a) => (
                  <Check key={a} label={a} />
                ))}
              </Filter>
            </>
          )}
        </aside>

        <main className="space-y-4">
          {mode === 'stay'
            ? SEARCH_RESULTS_HOTELS.map((h) => (
                <article key={h.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card overflow-hidden grid md:grid-cols-[280px_1fr]">
                  <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-teal to-teal-dark relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(184,115,51,0.7),transparent_60%)]" />
                    <div className="absolute bottom-2 left-3 text-ivory">
                      <Hotel className="h-5 w-5 opacity-80" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-xl text-ink dark:text-ivory">{h.name}</h3>
                        <span className="inline-flex items-center gap-0.5 text-xs text-copper font-medium">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn('h-3 w-3', i < Math.round(h.rating) ? 'fill-copper text-copper' : 'text-g20')} />
                          ))}
                          <span className="ml-1 text-ink dark:text-ivory">{h.rating}</span>
                        </span>
                      </div>
                      <p className="text-sm text-g40 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {h.city}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-g40">
                      {h.amenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 px-2 py-1 rounded-input bg-ivory dark:bg-panel">
                          {a === 'Pool' ? <Wifi className="h-3 w-3" /> : a === 'Restaurant' ? <Coffee className="h-3 w-3" /> : <Plane className="h-3 w-3" />}
                          {a}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-badge bg-copper-light text-copper-dark">
                        <Award className="h-3 w-3" /> Earn 4× Flow points
                      </span>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-g40">From</div>
                        <div className="font-display font-bold text-2xl text-copper">{formatCurrency(h.rateCad)}<span className="text-sm font-normal text-g40"> / night</span></div>
                      </div>
                      <Link to="/booking/results" className="px-4 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">
                        Book now
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            : SEARCH_RESULTS_CARS.map((c) => (
                <article key={c.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card overflow-hidden grid md:grid-cols-[260px_1fr]">
                  <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-ink to-coal relative flex items-center justify-center">
                    <Car className="h-16 w-16 text-copper opacity-90" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-badge bg-copper text-white text-[10px] label-caps">{c.tier}</span>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="font-display text-xl text-ink dark:text-ivory">{c.label}</h3>
                      <p className={cn('text-xs mt-0.5', c.owner === 'Flow Rentals' ? 'text-teal' : 'text-copper')}>
                        {c.owner}
                      </p>
                    </div>
                    <ul className="flex flex-wrap gap-3 text-xs text-g40">
                      <li className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.seats} seats</li>
                      {c.ac && <li className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> A/C</li>}
                      {c.gps && <li className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS</li>}
                    </ul>
                    <div className="mt-auto flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-g40">From</div>
                        <div className="font-display font-bold text-2xl text-copper">{formatCurrency(c.rateCad)}<span className="text-sm font-normal text-g40"> / day</span></div>
                      </div>
                      <Link to="/booking/results" className="px-4 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">
                        Reserve
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
        </main>
      </div>
    </div>
  )
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-input text-sm font-medium transition',
        active ? 'bg-teal text-white' : 'text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-panel'
      )}
    >
      {icon} {label}
    </button>
  )
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4">
      <h4 className="label-caps text-g40 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Check({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
      <input type="checkbox" className="accent-teal" />
      {label}
    </label>
  )
}
