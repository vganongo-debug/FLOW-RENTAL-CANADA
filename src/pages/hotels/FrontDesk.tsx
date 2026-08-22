import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Search, IdCard, BedDouble, CreditCard, FileSignature, KeyRound, Printer, Mail } from 'lucide-react'
import { cn } from '../../lib/utils'
import { FlowQRScanner } from '../../components/flow/FlowQRScanner'
import { FlowSignaturePad } from '../../components/flow/FlowSignaturePad'
import { FlowPaymentModal } from '../../components/flow/FlowPaymentModal'
import { SAMPLE_RESERVATIONS, SAMPLE_ROOMS } from '../../lib/sampleData'
import { formatCurrency, formatDate } from '../../lib/utils'

const STEPS = [
  { id: 'search',   label: 'Find booking',  icon: Search },
  { id: 'verify',   label: 'ID verify',     icon: IdCard },
  { id: 'room',     label: 'Assign room',   icon: BedDouble },
  { id: 'payment',  label: 'Payment',       icon: CreditCard },
  { id: 'contract', label: 'Contract',      icon: FileSignature },
  { id: 'key',      label: 'Key card',      icon: KeyRound },
] as const

type StepId = typeof STEPS[number]['id']

const sampleBooking = SAMPLE_RESERVATIONS[1]
const availableRooms = SAMPLE_ROOMS.filter((r) => r.status === 'available')

export default function FrontDesk() {
  const [step, setStep] = useState<number>(0)
  const [chosenRoom, setChosenRoom] = useState<string>(availableRooms[0]?.number ?? sampleBooking.roomNumber)
  const [agreed, setAgreed] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const current = STEPS[step]

  return (
    <div className="space-y-5">
      <header>
        <div className="label-caps text-g40">Hotels · Front Desk</div>
        <h1 className="font-display text-3xl text-ink dark:text-ivory">Guest Check-in</h1>
        <p className="text-sm text-g40 dark:text-g60 mt-1">Six-step workflow · designed for shared screen with guest.</p>
      </header>

      {/* Stepper */}
      <ol className="flex items-center gap-1 overflow-x-auto flow-scroll">
        {STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <li key={s.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition',
                  active && 'border-teal bg-teal text-white',
                  done && !active && 'border-teal/30 bg-teal-light text-teal-dark',
                  !done && !active && 'border-g20/60 bg-white dark:bg-panel-mid text-g40'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold',
                  active ? 'bg-white text-teal' : done ? 'bg-teal text-white' : 'bg-g20/50 text-g40'
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={cn('h-px w-4', i < step ? 'bg-teal' : 'bg-g20/60')} />}
            </li>
          )
        })}
      </ol>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card min-h-[420px]">
        <div className="flex items-center gap-2 mb-4">
          <current.icon className="h-5 w-5 text-teal" />
          <h2 className="font-display text-xl text-ink dark:text-ivory">Step {step + 1} · {current.label}</h2>
        </div>

        {step === 0 && <StepSearch />}
        {step === 1 && <StepVerify />}
        {step === 2 && <StepRoom chosen={chosenRoom} onChoose={setChosenRoom} />}
        {step === 3 && <StepPayment onOpenPay={() => setPayOpen(true)} />}
        {step === 4 && <StepContract agreed={agreed} setAgreed={setAgreed} />}
        {step === 5 && <StepKey />}
      </div>

      <footer className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="inline-flex items-center gap-1 px-4 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Check className="h-4 w-4" /> Complete check-in
          </button>
        )}
      </footer>

      <FlowPaymentModal
        open={payOpen}
        amount={sampleBooking.totalCad}
        onClose={() => setPayOpen(false)}
        onConfirm={() => setPayOpen(false)}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label-caps text-g40 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function StepSearch() {
  return (
    <div className="grid md:grid-cols-[1fr_auto] gap-6">
      <div className="space-y-4">
        <Section title="Find by guest name or booking ID">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-g40" />
            <input
              defaultValue="Sarah Bennett"
              className="w-full pl-9 pr-3 py-2.5 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
            />
          </div>
        </Section>

        <div className="rounded-card border-2 border-teal bg-teal-light/40 dark:bg-teal-dark/20 p-4">
          <div className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-full bg-teal text-white flex items-center justify-center font-semibold">SB</span>
            <div className="flex-1">
              <div className="font-medium text-ink dark:text-ivory">{sampleBooking.guestName}</div>
              <div className="text-xs text-g40">{sampleBooking.nationality} · {sampleBooking.id}</div>
              <div className="text-xs text-g40 mt-1">
                {formatDate(sampleBooking.checkIn)} → {formatDate(sampleBooking.checkOut)} · {sampleBooking.nights} nights · Room {sampleBooking.roomNumber} {sampleBooking.roomType}
              </div>
              <div className="text-sm font-display font-bold text-copper mt-2">{formatCurrency(sampleBooking.totalCad)}</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-xs label-caps bg-teal text-white">
              Match
            </span>
          </div>
        </div>
      </div>

      <Section title="Scan booking QR">
        <FlowQRScanner />
        <p className="text-[11px] text-g40 mt-2 max-w-[160px]">Guests with the Flow App can show their confirmation QR for instant lookup.</p>
      </Section>
    </div>
  )
}

function StepVerify() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Section title="ID type">
          <div className="flex gap-2 flex-wrap">
            {['Passport', 'National ID', 'Driving licence'].map((t, i) => (
              <label key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-input border border-g20/60 text-sm text-ink dark:text-ivory">
                <input type="radio" name="idtype" defaultChecked={i === 0} className="accent-teal" />
                {t}
              </label>
            ))}
          </div>
        </Section>
        <Section title="ID number">
          <input
            defaultValue="GB-PA 5483 92021"
            className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          />
        </Section>
        <Section title="Nationality">
          <select className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
            <option>United Kingdom</option><option>Senegal</option><option>Uganda</option><option>Congo</option><option>Ethiopia</option>
          </select>
        </Section>
        <Section title="Date of birth">
          <input type="date" defaultValue="1988-04-12" className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
        </Section>
      </div>
      <div>
        <Section title="ID document scan">
          <div className="rounded-card border-2 border-dashed border-g20 bg-ivory dark:bg-panel aspect-[3/2] flex items-center justify-center">
            <div className="text-center">
              <IdCard className="h-10 w-10 text-teal mx-auto mb-2" />
              <p className="text-sm font-medium text-ink dark:text-ivory">Scan or upload ID</p>
              <p className="text-xs text-g40 mt-1">JPG / PNG · auto-redacts MRZ</p>
              <button className="mt-3 px-3 py-1.5 rounded-input bg-teal text-white text-xs font-medium">Choose file</button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function StepRoom({ chosen, onChoose }: { chosen: string; onChoose: (n: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-g40">
        Booking is for <span className="text-ink dark:text-ivory font-medium">{sampleBooking.roomType}</span>.
        Select an available room of the same tier or override.
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableRooms.slice(0, 6).map((r) => (
          <li key={r.number}>
            <button
              onClick={() => onChoose(r.number)}
              className={cn(
                'w-full text-left rounded-card border p-4 transition',
                chosen === r.number
                  ? 'border-teal bg-teal-light dark:bg-teal-dark/30'
                  : 'border-g20/60 bg-white dark:bg-panel-mid hover:border-teal'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-xl text-ink dark:text-ivory">{r.number}</div>
                  <div className="text-xs text-g40">{r.type} · Floor {r.floor}</div>
                </div>
                {chosen === r.number && <Check className="h-4 w-4 text-teal" />}
              </div>
              <div className="mt-2 text-sm text-copper font-display font-bold">{formatCurrency(r.rateCad)}/night</div>
            </button>
          </li>
        ))}
      </ul>
      <label className="flex items-center gap-2 text-sm text-g40">
        <input type="checkbox" className="accent-teal" /> Allow upgrade to higher tier if no exact match
      </label>
    </div>
  )
}

function StepPayment({ onOpenPay }: { onOpenPay: () => void }) {
  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-3">
        <Section title="Charges">
          <ul className="divide-y divide-g20/40">
            <Charge label={`${sampleBooking.roomType} · ${sampleBooking.nights} night${sampleBooking.nights>1?'s':''}`} amount={sampleBooking.totalCad} />
            <Charge label="Breakfast (2 pax × 2)" amount={72} />
            <Charge label="Airport transfer" amount={35} />
            <Charge label="VAT (Uganda 18%)" amount={Math.round((sampleBooking.totalCad + 107) * 0.18)} muted />
          </ul>
        </Section>
        <div className="flex items-center justify-between rounded-card border border-g20/60 bg-ivory dark:bg-panel px-4 py-3">
          <span className="label-caps text-g40">Total due</span>
          <span className="font-display font-bold text-3xl text-copper">{formatCurrency(sampleBooking.totalCad + 107 + Math.round((sampleBooking.totalCad + 107) * 0.18))}</span>
        </div>
      </div>
      <div className="space-y-3">
        <Section title="Payment status">
          <div className="rounded-card border border-teal/30 bg-teal-light/50 dark:bg-teal-dark/20 p-4">
            <div className="label-caps text-teal-dark">Pre-authorised</div>
            <div className="font-display font-bold text-2xl text-ink dark:text-ivory mt-1">{formatCurrency(sampleBooking.totalCad)}</div>
            <div className="text-xs text-g40">Visa ··· 4242 · captured at check-in</div>
          </div>
        </Section>
        <button onClick={onOpenPay} className="w-full px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          Collect remaining
        </button>
        <button className="w-full px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">Mark as paid · cash</button>
      </div>
    </div>
  )
}

function Charge({ label, amount, muted }: { label: string; amount: number; muted?: boolean }) {
  return (
    <li className={cn('py-2 flex justify-between text-sm', muted ? 'text-g40' : 'text-ink dark:text-ivory')}>
      <span>{label}</span>
      <span className={cn('font-medium', !muted && 'text-ink dark:text-ivory')}>{formatCurrency(amount)}</span>
    </li>
  )
}

function StepContract({ agreed, setAgreed }: { agreed: boolean; setAgreed: (v: boolean) => void }) {
  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <Section title="Stay agreement">
        <div className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-4 text-sm text-ink dark:text-ivory max-h-[260px] overflow-y-auto flow-scroll space-y-2">
          <p className="font-display text-base">Flow Hotels Kampala · Guest Agreement</p>
          <p>Check-in time is 14:00 local. Check-out time is 11:00. Late check-out subject to availability and a 50% night charge.</p>
          <p>The guest authorises Flow Rentals Global Inc. to charge the registered payment method for the total cost of the stay, incidentals, and any damages identified after departure.</p>
          <p>Smoking inside the room incurs a USD 200 deep-cleaning fee. Pets are not permitted unless arranged 48h in advance.</p>
          <p>Wi-Fi is provided complimentary. Use of in-room safe is at guest's own risk; high-value items can be deposited at the front desk for safe-keeping.</p>
          <p>This agreement is governed by the laws of Uganda. Disputes will be resolved in Kampala.</p>
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-ink dark:text-ivory">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-teal" />
          The guest has read and agrees to the stay agreement.
        </label>
      </Section>
      <Section title="Guest signature">
        <FlowSignaturePad label="Sign with finger or mouse" />
        <p className="text-[11px] text-g40 mt-2">Signature is captured locally and attached to the booking record.</p>
      </Section>
    </div>
  )
}

function StepKey() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="text-center">
        <div className="rounded-card border border-g20/60 bg-gradient-to-br from-coal to-ink p-6 text-ivory shadow-card">
          <div className="label-caps text-copper-light">Flow Hotels Kampala</div>
          <div className="font-display text-4xl mt-1">Welcome, Sarah</div>
          <div className="text-sm text-g80 mt-2">Room 102 · Deluxe · Floor 1</div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-input bg-copper text-white text-xs font-medium">
            <KeyRound className="h-3.5 w-3.5" /> Key card encoded · Card #3287
          </div>
          <div className="mt-6 text-xs text-g60">
            Stay valid through {formatDate(sampleBooking.checkOut)}
          </div>
        </div>
        <p className="text-xs text-g40 mt-2">Encoded with Onity Advance. Spare can be issued by any front-desk agent.</p>
      </div>
      <div className="space-y-3">
        <Section title="Send confirmation">
          <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">
            <Mail className="h-4 w-4" /> Email receipt
          </button>
          <button className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">
            <Printer className="h-4 w-4" /> Print key wallet
          </button>
        </Section>
        <Section title="Next steps">
          <ul className="text-xs text-g40 list-disc pl-4 space-y-1">
            <li>Housekeeping notified — room is checked-in</li>
            <li>Welcome amenity dispatched to room</li>
            <li>Bell desk has guest luggage</li>
            <li>Flow Rewards 480 pts to be credited overnight</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}
