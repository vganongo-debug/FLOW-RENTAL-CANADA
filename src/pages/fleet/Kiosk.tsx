import { useState } from 'react'
import { Plane, ArrowDownToLine, Plus, Camera, Fuel, Gauge, ChevronRight, ScanLine, Check } from 'lucide-react'
import { cn, formatDate, formatCurrency } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowQRScanner } from '../../components/flow/FlowQRScanner'

interface Arrival {
  id: string
  flight: string
  airline: string
  client: string
  bookingId: string
  vehicle: string
  plate: string
  eta: string
  status: 'landed' | 'on_time' | 'delayed'
}

interface Return {
  id: string
  bookingId: string
  client: string
  vehicle: string
  plate: string
  expected: string
}

const ARRIVALS: Arrival[] = [
  { id:'a-1', flight:'KQ 412', airline:'PAL Airlines', client:'Sarah Bennett',     bookingId:'RNT-900100', vehicle:'Ford F-150 XLT 4x4', plate:'H24 JKL', eta:'14:30', status:'landed'  },
  { id:'a-2', flight:'ET 304', airline:'Québécois',     client:'Olivier Deschênes',  bookingId:'RNT-900101', vehicle:'Toyota Highlander AWD',           plate:'H24 JKM', eta:'15:10', status:'on_time' },
  { id:'a-3', flight:'EK 729', airline:'Emirates',      client:'Émilie Tremblay',   bookingId:'RNT-900102', vehicle:'Toyota RAV4',            plate:'H24 JKN', eta:'16:45', status:'delayed' },
  { id:'a-4', flight:'TK 612', airline:'Turkish',       client:'Hugo Cormier',      bookingId:'RNT-900103', vehicle:'Nissan Rogue AWD',         plate:'J18 QRV', eta:'18:00', status:'on_time' },
]

const RETURNS: Return[] = [
  { id:'r-1', bookingId:'RNT-900090', client:'James Kelly',     vehicle:'GMC Sierra 1500',      plate:'J18 QRT', expected:'12:00' },
  { id:'r-2', bookingId:'RNT-900092', client:'Priya Patel',     vehicle:'Toyota Corolla',    plate:'J18 QRW', expected:'14:00' },
  { id:'r-3', bookingId:'RNT-900094', client:'Marcus O\'Brien', vehicle:'Mitsubishi Pajero', plate:'J18 QRX', expected:'17:30' },
]

type Mode = 'overview' | 'release' | 'return'

export default function Kiosk() {
  const [mode, setMode] = useState<Mode>('overview')
  const [selectedArrival, setSelectedArrival] = useState<Arrival>(ARRIVALS[0])
  const [selectedReturn, setSelectedReturn] = useState<Return>(RETURNS[0])

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-card overflow-hidden bg-coal text-ivory">
        <div className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="label-caps text-copper-light">Airport Kiosk · Aéroport YZV</div>
            <h1 className="font-display text-3xl mt-1">{currentTimeString()}</h1>
            <p className="text-sm text-g60 mt-1">Agent on duty · Simon Lapierre · Shift ends 22:00</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <BigStat label="Arrivals" value={String(ARRIVALS.length)} tone="teal" />
            <BigStat label="Returns" value={String(RETURNS.length)} tone="copper" />
            <BigStat label="Walk-ins today" value="2" tone="ivory" />
          </div>
        </div>
      </div>

      {mode === 'overview' && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode('release')}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-5 rounded-card bg-copper text-white hover:bg-copper-dark text-lg font-medium shadow-card"
            >
              <Plus className="h-5 w-5" /> Walk-in rental
            </button>
            <button
              onClick={() => setMode('release')}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-5 rounded-card bg-teal text-white hover:bg-teal-dark text-lg font-medium shadow-card"
            >
              <Plane className="h-5 w-5" /> Release for arrival
            </button>
            <button
              onClick={() => setMode('return')}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-5 rounded-card bg-teal-dark text-white hover:bg-coal text-lg font-medium shadow-card"
            >
              <ArrowDownToLine className="h-5 w-5" /> Process return
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Arrivals */}
            <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
              <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between bg-teal-light/40 dark:bg-teal-dark/30">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-teal" />
                  <h2 className="font-display text-xl text-ink dark:text-ivory">Arrivals today</h2>
                </div>
                <FlowStatusBadge tone="info">{ARRIVALS.length} expected</FlowStatusBadge>
              </header>
              <ul className="divide-y divide-g20/40">
                {ARRIVALS.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => { setSelectedArrival(a); setMode('release') }}
                      className="w-full p-4 text-left hover:bg-ivory dark:hover:bg-panel transition flex items-center gap-4"
                    >
                      <div className="text-center shrink-0">
                        <div className="font-display font-bold text-2xl text-teal">{a.eta}</div>
                        <div className="text-[11px] text-g40">{a.flight}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink dark:text-ivory">{a.client}</div>
                        <div className="text-xs text-g40 truncate">{a.vehicle} · {a.plate} · {a.bookingId}</div>
                      </div>
                      <FlowStatusBadge
                        tone={a.status === 'landed' ? 'active' : a.status === 'delayed' ? 'pending' : 'info'}
                        dot
                      >
                        {a.status === 'landed' ? 'Landed' : a.status === 'delayed' ? 'Delayed' : 'On time'}
                      </FlowStatusBadge>
                      <ChevronRight className="h-5 w-5 text-g40 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Returns */}
            <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
              <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between bg-copper-light/40 dark:bg-copper-dark/30">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5 text-copper" />
                  <h2 className="font-display text-xl text-ink dark:text-ivory">Returns today</h2>
                </div>
                <FlowStatusBadge tone="warning">{RETURNS.length} due back</FlowStatusBadge>
              </header>
              <ul className="divide-y divide-g20/40">
                {RETURNS.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => { setSelectedReturn(r); setMode('return') }}
                      className="w-full p-4 text-left hover:bg-ivory dark:hover:bg-panel transition flex items-center gap-4"
                    >
                      <div className="text-center shrink-0">
                        <div className="font-display font-bold text-2xl text-copper">{r.expected}</div>
                        <div className="text-[11px] text-g40">expected</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink dark:text-ivory">{r.client}</div>
                        <div className="text-xs text-g40 truncate">{r.vehicle} · {r.plate} · {r.bookingId}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-g40 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      {mode === 'release' && <ReleaseFlow arrival={selectedArrival} onBack={() => setMode('overview')} />}
      {mode === 'return' && <ReturnFlow ret={selectedReturn} onBack={() => setMode('overview')} />}
    </div>
  )
}

function currentTimeString() {
  return '12:48 · Sunday 10 May'
}

function BigStat({ label, value, tone }: { label: string; value: string; tone: 'teal' | 'copper' | 'ivory' }) {
  const cls =
    tone === 'teal'   ? 'border-teal/50 text-teal-light' :
    tone === 'copper' ? 'border-copper/50 text-copper-light' :
                        'border-ivory/30 text-ivory'
  return (
    <div className={cn('rounded-card border bg-panel-mid/40 backdrop-blur-sm p-3 min-w-[100px]', cls)}>
      <div className="font-display font-bold text-3xl">{value}</div>
      <div className="text-[10px] label-caps opacity-80">{label}</div>
    </div>
  )
}

function ReleaseFlow({ arrival, onBack }: { arrival: Arrival; onBack: () => void }) {
  const [step, setStep] = useState(0)
  const STEPS = ['Verify booking', 'Hand over keys', 'Done']
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={onBack} className="label-caps text-g40 hover:text-teal">← Back to kiosk</button>
          <h2 className="font-display text-2xl text-ink dark:text-ivory mt-1">Release · {arrival.client}</h2>
          <p className="text-sm text-g40">Flight {arrival.flight} · {arrival.vehicle} · {arrival.plate}</p>
        </div>
        <ol className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span className={cn(
                'flex items-center justify-center h-9 w-9 rounded-full text-sm font-bold',
                i <= step ? 'bg-teal text-white' : 'bg-g20/40 text-g40'
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && <div className={cn('h-px w-6', i < step ? 'bg-teal' : 'bg-g20/60')} />}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <div className="grid md:grid-cols-[1fr_auto] gap-6">
          <div className="space-y-3">
            <Field label="Driving licence number">
              <input defaultValue="UG-DL 982-44A · expires 2028-09-12" className="w-full px-3 py-2.5 text-base bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </Field>
            <Field label="Passport / ID">
              <input defaultValue="GB-PA 5483-92021" className="w-full px-3 py-2.5 text-base bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
              <input type="checkbox" defaultChecked className="accent-teal h-5 w-5" /> Booking signed and CDW confirmed
            </label>
          </div>
          <div className="text-center">
            <FlowQRScanner />
            <p className="text-xs text-g40 mt-2 max-w-[160px]">Scan client's confirmation</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            <Field label="Odometer at hand-over (km)">
              <input type="number" defaultValue="28430" className="w-full px-3 py-2.5 text-base bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </Field>
            <Field label="Fuel level">
              <div className="flex gap-2">
                {['Empty','¼','½','¾','Full'].map((l, i) => (
                  <label key={l} className="flex-1 text-center px-2 py-2.5 rounded-input border border-g20/60 text-sm text-ink dark:text-ivory">
                    <input type="radio" name="fuel" defaultChecked={i === 4} className="accent-teal block mx-auto mb-1 h-4 w-4" /> {l}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Visible damage on hand-over">
              <textarea className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[60px] text-ink dark:text-ivory" placeholder="Leave blank if none" />
            </Field>
          </div>
          <div>
            <Field label="Hand-over photos">
              <div className="grid grid-cols-3 gap-2">
                {['F','R','L','×','Int','Odo'].map((angle) => (
                  <div key={angle} className="aspect-square rounded-input bg-coal text-copper flex items-center justify-center text-xs">
                    {angle === '×' ? '+' : <Camera className="h-5 w-5" />}
                  </div>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-6">
          <div className="inline-flex h-16 w-16 rounded-full bg-teal text-white items-center justify-center mb-3">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl text-ink dark:text-ivory">Released to {arrival.client}</h3>
          <p className="text-sm text-g40 mt-1">Keys handed over · client photographed · invoice emailed.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={onBack} className="px-4 py-2.5 rounded-input border border-g20 text-sm text-ink dark:text-ivory">Return to kiosk</button>
            <button className="px-4 py-2.5 rounded-input bg-teal text-white text-sm font-medium">Print rental agreement</button>
          </div>
        </div>
      )}

      {step < 2 && (
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2.5 rounded-input border border-g20 text-base text-ink dark:text-ivory disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-input bg-copper text-white text-base font-medium"
          >
            {step === 1 ? 'Release vehicle' : 'Continue'} <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  )
}

function ReturnFlow({ ret, onBack }: { ret: Return; onBack: () => void }) {
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card space-y-5">
      <div>
        <button onClick={onBack} className="label-caps text-g40 hover:text-teal">← Back to kiosk</button>
        <h2 className="font-display text-2xl text-ink dark:text-ivory mt-1">Process return · {ret.client}</h2>
        <p className="text-sm text-g40">{ret.vehicle} · {ret.plate} · {ret.bookingId}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Odometer on return (km)">
          <input type="number" defaultValue="28572" className="w-full px-3 py-3 text-2xl font-display font-bold bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory text-center" />
          <p className="text-[11px] text-g40 mt-1">142 km driven · within allowance</p>
        </Field>
        <Field label="Fuel level on return">
          <div className="grid grid-cols-5 gap-2">
            {['Empty','¼','½','¾','Full'].map((l, i) => (
              <label key={l} className="text-center px-2 py-3 rounded-input border border-g20/60 text-sm text-ink dark:text-ivory">
                <input type="radio" name="fuel-ret" defaultChecked={i === 3} className="accent-teal block mx-auto mb-1 h-4 w-4" /> {l}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-g40 mt-1">Refuelling fee applies · $25 will be added</p>
        </Field>
      </div>

      <Field label="Post-rental condition · compare to hand-over photos">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {['Front','Rear','Driver','Passenger','Interior','Odometer'].map((angle) => (
            <div key={angle} className="rounded-input overflow-hidden border border-g20/60">
              <div className="aspect-[4/3] bg-gradient-to-br from-coal to-ink relative flex items-center justify-center">
                <Camera className="h-7 w-7 text-copper opacity-70" />
                <span className="absolute bottom-1 left-1 text-[9px] label-caps text-white">{angle}</span>
              </div>
            </div>
          ))}
        </div>
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-4">
          <h3 className="label-caps text-g40 mb-2">Final invoice</h3>
          <ul className="space-y-1 text-sm">
            <Line label="Base rental · 2 days" amount={590} />
            <Line label="CDW insurance" amount={60} />
            <Line label="Refuelling fee" amount={25} />
            <Line label="Late return (none)" amount={0} muted />
            <Line label="TPS + TVQ (14,975 %)" amount={Math.round((590+60+25) * 0.14975)} muted />
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-g20/60 pt-2">
            <span className="label-caps text-g40">Total</span>
            <span className="font-display font-bold text-2xl text-copper">{formatCurrency(Math.round((590+60+25) * 1.18))}</span>
          </div>
        </div>
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 space-y-2">
          <h3 className="label-caps text-g40">Telematics summary</h3>
          <Telematics label="Distance" value="142 km" icon={<Gauge className="h-4 w-4 text-teal" />} />
          <Telematics label="Avg fuel" value="9.8 l / 100km" icon={<Fuel className="h-4 w-4 text-teal" />} />
          <Telematics label="Speeding events" value="0" />
          <Telematics label="Geofence exits" value="0" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={onBack} className="px-4 py-2.5 rounded-input border border-g20 text-base text-ink dark:text-ivory">
          Cancel return
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-input border border-g20 text-base text-ink dark:text-ivory">
            Email receipt
          </button>
          <button className="inline-flex items-center gap-1 px-5 py-2.5 rounded-input bg-copper text-white text-base font-medium">
            <ScanLine className="h-5 w-5" /> Finalise return
          </button>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

function Line({ label, amount, muted }: { label: string; amount: number; muted?: boolean }) {
  return (
    <li className={cn('flex justify-between', muted ? 'text-g40' : 'text-ink dark:text-ivory')}>
      <span>{label}</span>
      <span className="font-medium">{formatCurrency(amount)}</span>
    </li>
  )
}

function Telematics({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-g40">{icon}{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
