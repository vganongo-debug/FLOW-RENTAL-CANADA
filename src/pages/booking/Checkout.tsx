import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, ChevronLeft, ChevronRight, Hotel, Calendar, Users, CreditCard, Smartphone, Banknote, ShieldCheck, Coffee, Plane, Clock, Award } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useCurrencyFormatter } from '../../lib/useCurrencyFormatter'
import { quoteStay, STAY_ADDONS, newBookingRef } from '../../lib/booking'
import { payments } from '../../lib/api'
import { FlowSignaturePad } from '../../components/flow/FlowSignaturePad'
import { FlowStripeCard } from '../../components/flow/FlowStripeCard'

type Method = 'card' | 'interac' | 'applepay' | 'googlepay' | 'transfer' | 'cash'

const METHODS: { id: Method; label: string; icon: React.ComponentType<{ className?: string }>; sub: string }[] = [
  { id: 'card',   label: 'Visa / Mastercard',   icon: CreditCard, sub: 'Stripe' },
  { id: 'interac', label: 'Interac',   icon: Smartphone, sub: 'Toutes les banques canadiennes' },
  { id: 'applepay', label: 'Apple Pay',  icon: Smartphone, sub: 'iPhone · Apple Watch' },
  { id: 'googlepay', label: 'Google Pay', icon: Smartphone, sub: 'Android · navigateur' },
  { id: 'transfer', label: 'Virement bancaire',  icon: CreditCard, sub: 'Desjardins · RBC · BMO' },
  { id: 'cash',   label: 'Pay at property',     icon: Banknote,   sub: 'On arrival' },
]

export default function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const format = useCurrencyFormatter()

  const [step, setStep] = useState(0)
  const [addons, setAddons] = useState<Record<string, boolean>>({ breakfast: true, transfer: true, late: false })
  const [method, setMethod] = useState<Method>('card')
  const [agreed, setAgreed] = useState(false)

  // Selection venue des resultats. Sans elle — acces direct a l'URL — on
  // retombe sur un sejour type plutot que d'afficher une page vide.
  const { state } = useLocation()
  const chosen = state as {
    offer?: { label: string; rateCad: number }
    criteria?: { destination: string; nights: number; adults: string; checkIn: string; checkOut: string }
  } | null

  // Un seul calcul pour tout l'ecran : le montant affiche, le montant remis
  // a Stripe et le montant du recu sont la meme valeur.
  const nights = chosen?.criteria?.nights ?? 4
  const baseRate = chosen?.offer?.rateCad ?? 155
  const propertyName = chosen?.offer?.label ?? 'Flow Station Natashquan'
  const stayDates = chosen?.criteria
    ? `${chosen.criteria.checkIn} → ${chosen.criteria.checkOut}`
    : '14 – 18 May 2026'
  const guests = chosen?.criteria?.adults ?? '2'
  const quote = quoteStay({
    nights,
    nightlyRateCad: baseRate,
    addonIds: Object.keys(addons).filter((id) => addons[id]),
    province: 'QC',
  })
  const total = quote.totalCad

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [cardToken, setCardToken] = useState<string | null>(null)

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  /**
   * Confirme et debite. Auparavant ce bouton ne faisait que naviguer : la
   * page de confirmation annoncait un encaissement qui n'avait jamais eu
   * lieu, quel que soit le moyen de paiement.
   */
  const finalise = async () => {
    if (paying) return
    setPaying(true)
    setPayError(null)
    const ref = newBookingRef(Date.now())
    try {
      const result = await payments.charge({
        amountCad: total,
        method,
        ref,
        stripePaymentMethodId: method === 'card' ? cardToken ?? undefined : undefined,
      })
      if (result.status === 'failed') {
        setPayError('Payment was declined. No charge was made — please try another method.')
        return
      }
      if (result.status === 'requires_action') {
        setPayError('Your bank asked for additional authentication. The booking is not confirmed yet.')
        return
      }
      navigate('/booking/confirmation', {
        replace: true,
        state: { ref, quote, result, method },
      })
    } catch {
      setPayError('Payment could not be completed. No charge was made.')
    } finally {
      setPaying(false)
    }
  }

  const STEPS = [
    { key: 'options',  label: t('booking.checkout.steps.options',  { defaultValue: 'Stay details' }) },
    { key: 'guest',    label: t('booking.checkout.steps.guest',    { defaultValue: 'Guest info' }) },
    { key: 'addons',   label: t('booking.checkout.steps.addons',   { defaultValue: 'Add-ons' }) },
    { key: 'payment',  label: t('booking.checkout.steps.payment',  { defaultValue: 'Payment' }) },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/booking/results" className="label-caps text-g40 hover:text-teal inline-flex items-center gap-1">
        <ChevronLeft className="h-3.5 w-3.5" /> {t('common.back')}
      </Link>
      <h1 className="font-display text-3xl text-ink dark:text-ivory mt-2">
        {t('booking.checkout.title', { defaultValue: 'Complete your booking' })}
      </h1>
      <p className="text-sm text-g40 mt-1">{propertyName} · {nights} nights</p>

      {/* Progress */}
      <ol className="mt-6 flex items-center gap-1 overflow-x-auto flow-scroll">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition',
                i === step && 'border-teal bg-teal text-white',
                i < step && 'border-teal/30 bg-teal-light text-teal-dark cursor-pointer',
                i > step && 'border-g20/60 bg-white dark:bg-panel-mid text-g40'
              )}
            >
              <span className={cn(
                'flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold',
                i === step ? 'bg-white text-teal' : i < step ? 'bg-teal text-white' : 'bg-g20/50 text-g40'
              )}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={cn('h-px w-4', i < step ? 'bg-teal' : 'bg-g20/60')} />}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
        <main className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card min-h-[440px]">
          {step === 0 && <StepOptions nights={nights} />}
          {step === 1 && <StepGuest agreed={agreed} setAgreed={setAgreed} />}
          {step === 2 && <StepAddons addons={addons} setAddons={setAddons} nights={nights} format={format} />}
          {step === 3 && (
            <StepPayment
              method={method}
              setMethod={setMethod}
              amountCad={total}
              onCardToken={setCardToken}
            />
          )}

          <footer className="mt-6 flex items-center justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> {t('common.back')}
            </button>
            {step < 3 ? (
              <button
                onClick={next}
                disabled={step === 1 && !agreed}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium disabled:opacity-40"
              >
                {t('common.continue')} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={finalise}
                disabled={paying || (method === 'card' && !cardToken)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                {paying
                  ? t('booking.checkout.paying', { defaultValue: 'Charging…' })
                  : `${t('booking.checkout.confirm', { defaultValue: 'Confirm & pay' })} ${format(total, undefined, { cents: true })}`}
              </button>
            )}
            {payError && (
              <p role="alert" className="w-full mt-3 text-sm text-copper-dark dark:text-copper-light">
                {payError}
              </p>
            )}
          </footer>
        </main>

        {/* Summary */}
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card h-fit lg:sticky lg:top-6">
          <div className="aspect-[16/9] bg-gradient-to-br from-teal to-teal-dark relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(184,115,51,0.6),transparent_60%)]" />
            <div className="absolute bottom-3 left-4 text-ivory">
              <div className="font-display text-xl">{propertyName}</div>
              <div className="text-xs opacity-80">Deluxe · King · City view</div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <Summary icon={<Calendar className="h-3.5 w-3.5 text-teal" />} label={stayDates} />
            <Summary icon={<Hotel className="h-3.5 w-3.5 text-teal" />} label={`${nights} nights · Deluxe`} />
            <Summary icon={<Users className="h-3.5 w-3.5 text-teal" />} label={`${guests} guest${guests === '1' ? '' : 's'}`} />
            <hr className="border-g20/60" />
            <Line label={`${format(quote.nightlyRateCad, undefined, { cents: true })} × ${nights} nights`} amount={format(quote.subtotalCad, undefined, { cents: true })} />
            {quote.addonsCad > 0 && <Line label="Add-ons" amount={format(quote.addonsCad, undefined, { cents: true })} />}
            <Line label={`${quote.taxName} (${quote.taxRatePct} %)`} amount={format(quote.taxCad, undefined, { cents: true })} muted />
            <div className="flex items-center justify-between pt-2 border-t border-g20/60">
              <span className="label-caps text-g40">{t('common.total')}</span>
              <span className="font-display font-bold text-2xl text-copper">{format(total, undefined, { cents: true })}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-g40 mt-2">
              <Award className="h-3.5 w-3.5 text-copper mt-0.5 shrink-0" />
              <span>You'll earn {quote.pointsEarned.toLocaleString()} Flow Rewards points on this stay.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-g40">
              <ShieldCheck className="h-3.5 w-3.5 text-teal mt-0.5 shrink-0" />
              <span>Free cancellation until 13 May 14:00 EST.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepOptions({ nights }: { nights: number }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="font-display text-xl text-ink dark:text-ivory mb-1">Step 1 · {t('booking.checkout.steps.options', { defaultValue: 'Stay details' })}</h2>
      <p className="text-sm text-g40 mb-4">Confirm dates, room type and number of guests.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Check-in" defaultValue="14 May 2026" />
        <Field label="Check-out" defaultValue="18 May 2026" />
        <Field label="Nights" defaultValue={String(nights)} />
        <Field label="Adults" defaultValue="2" />
        <Field label="Children" defaultValue="0" />
        <Field label="Room type" select options={['Standard','Deluxe','Suite','Executive']} defaultValue="Deluxe" />
      </div>
      <Field label="Special requests" textarea defaultValue="Quiet room, high floor if possible. Honeymoon stay." />
    </div>
  )
}

function StepGuest({ agreed, setAgreed }: { agreed: boolean; setAgreed: (v: boolean) => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="font-display text-xl text-ink dark:text-ivory mb-1">Step 2 · {t('booking.checkout.steps.guest', { defaultValue: 'Guest info' })}</h2>
      <p className="text-sm text-g40 mb-4">Lead guest will receive the confirmation and earn rewards points.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="First name" defaultValue="Sarah" />
        <Field label="Last name" defaultValue="Bennett" />
        <Field label="Email" defaultValue="sarah.bennett@example.com" type="email" />
        <Field label="Phone" defaultValue="+44 7700 900142" type="tel" />
        <Field label="Nationality" defaultValue="Canada" select options={['Canada','United States','France','United Kingdom','Germany','Belgium','Switzerland','Netherlands','Italy','Spain','Australia','Japan','China','India','Brazil','Other']} />
        <Field label="Passport / ID number" defaultValue="GB-PA 5483-92021" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Field label="Arrival flight (optional)" defaultValue="KQ 412 · 14 May 14:30" />
        <Field label="Date of birth (lead guest)" defaultValue="1988-04-12" type="date" />
      </div>
      <div className="mt-5 rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3">
        <div className="text-xs text-g40 mb-2 label-caps">Stay agreement summary</div>
        <p className="text-xs text-ink dark:text-ivory">
          Check-in 14:00 · Check-out 11:00 · Free cancellation until 13 May 14:00 EST ·
          Damages and incidentals will be charged to the payment method on file ·
          Smoking inside the room incurs a USD 200 deep-cleaning fee.
        </p>
        <label className="flex items-center gap-2 text-sm mt-2 text-ink dark:text-ivory">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-teal" />
          I agree to the terms and confirm the lead guest is over 18.
        </label>
      </div>
    </div>
  )
}

function StepAddons({ addons, setAddons, nights, format }: { addons: Record<string, boolean>; setAddons: (a: Record<string, boolean>) => void; nights: number; format: (n: number) => string }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="font-display text-xl text-ink dark:text-ivory mb-1">Step 3 · {t('booking.checkout.steps.addons', { defaultValue: 'Add-ons' })}</h2>
      <p className="text-sm text-g40 mb-4">Tailor your stay — all add-ons are billed with the room.</p>
      <ul className="space-y-2">
        {STAY_ADDONS.map((a) => {
          const each = a.perNight ? a.priceCad * nights : a.priceCad
          return (
            <li key={a.id}>
              <label className={cn(
                'flex items-center gap-3 rounded-card border p-4 transition cursor-pointer',
                addons[a.id] ? 'border-teal bg-teal-light dark:bg-teal-dark/30' : 'border-g20/60 hover:border-teal/50'
              )}>
                <input
                  type="checkbox"
                  checked={!!addons[a.id]}
                  onChange={(e) => setAddons({ ...addons, [a.id]: e.target.checked })}
                  className="accent-teal h-5 w-5"
                />
                <div className="flex-1">
                  <div className="font-medium text-ink dark:text-ivory">{a.label}</div>
                  <div className="text-xs text-g40">
                    {a.id === 'breakfast'
                      ? <>{format(a.priceCad)} per night · {nights} nights · <Coffee className="inline h-3 w-3" /></>
                      : a.id === 'transfer'
                        ? <>One-time fee · <Plane className="inline h-3 w-3" /></>
                        : <>Subject to availability · <Clock className="inline h-3 w-3" /></>}
                  </div>
                </div>
                <span className="font-display font-bold text-copper text-lg">{format(each)}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StepPayment({ method, setMethod, amountCad, onCardToken }: {
  method: Method
  setMethod: (m: Method) => void
  /** Montant reellement debite · le meme que celui du recapitulatif */
  amountCad: number
  onCardToken: (pmId: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="font-display text-xl text-ink dark:text-ivory mb-1">Step 4 · {t('booking.checkout.steps.payment', { defaultValue: 'Payment' })}</h2>
      <p className="text-sm text-g40 mb-4">All payments processed securely via Flow Pay.</p>

      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-3 rounded-input border text-left text-sm transition',
              method === m.id
                ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory'
                : 'border-g20/60 text-ink dark:text-ivory hover:border-teal/50'
            )}
          >
            <m.icon className="h-5 w-5 text-teal shrink-0" />
            <div>
              <div className="font-medium leading-tight">{m.label}</div>
              <div className="text-[10px] text-g40 leading-tight">{m.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {method === 'card' && (
        <FlowStripeCard
          amountCad={amountCad}
          onPaymentMethod={onCardToken}
        />
      )}
      {method === 'transfer' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <PciNote />
          <Field label="Account number" placeholder="0000000000" maxLength={20} inputMode="numeric" autoComplete="off" />
          <Field label="Account holder" placeholder="As shown on bank statement" maxLength={100} autoComplete="off" />
          <Field label="Institution" select options={['Desjardins · Basse-Côte-Nord','RBC · Sept-Îles','BMO · Baie-Comeau']} />
          <Field label="Authorisation code" placeholder="Sent via SMS" maxLength={8} inputMode="numeric" autoComplete="off" />
        </div>
      )}
      {(method === 'interac' || method === 'applepay' || method === 'googlepay') && (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mobile number" defaultValue="+1 418 962 3300" type="tel" />
          <Field label="Account name" defaultValue="Sarah Bennett" />
          <div className="sm:col-span-2 rounded-input border border-teal/30 bg-teal-light/40 dark:bg-teal-dark/20 p-3 text-xs text-ink dark:text-ivory">
            You'll receive a payment prompt on your device — approve to complete the booking.
          </div>
        </div>
      )}
      {method === 'cash' && (
        <div className="rounded-input border border-copper/30 bg-copper-light/40 dark:bg-copper-dark/20 p-3 text-sm text-ink dark:text-ivory">
          <strong>Pay on arrival.</strong> The room will be held for 4 hours past expected arrival.
          Cancel without charge up to 24 hours before check-in.
        </div>
      )}

      <div className="mt-5">
        <div className="label-caps text-g40 mb-2">E-sign (optional)</div>
        <FlowSignaturePad label="Sign to authorise card holds" />
      </div>
    </div>
  )
}

function Summary({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
      {icon}{label}
    </div>
  )
}

function Line({ label, amount, muted }: { label: string; amount: string; muted?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between text-sm', muted && 'text-g40')}>
      <span>{label}</span>
      <span className="font-medium">{amount}</span>
    </div>
  )
}

function Field({ label, defaultValue, type = 'text', select, options, textarea, placeholder, maxLength, inputMode, autoComplete }: {
  label: string; defaultValue?: string; type?: string; select?: boolean; options?: string[]; textarea?: boolean
  placeholder?: string; maxLength?: number; inputMode?: 'numeric' | 'tel' | 'email'; autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1 block">{label}</span>
      {textarea ? (
        <textarea defaultValue={defaultValue} placeholder={placeholder} maxLength={maxLength ?? 2000}
          className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory" />
      ) : select ? (
        <select defaultValue={defaultValue} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} defaultValue={defaultValue} placeholder={placeholder}
          maxLength={maxLength} inputMode={inputMode} autoComplete={autoComplete}
          className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
      )}
    </label>
  )
}

/**
 * Visible warning that this demo collects card data in a plain input — which
 * is NOT PCI-DSS compliant. In production the entire card section is replaced
 * by Stripe Elements (an iframe served by stripe.com that tokenizes the PAN
 * and posts back only a `pm_xxx` reference).
 */
function PciNote() {
  return (
    <div className="sm:col-span-2 flex items-start gap-2 rounded-input border border-copper/40 bg-copper-light/40 dark:bg-copper-dark/20 p-3 text-xs text-ink dark:text-ivory">
      <span className="shrink-0" aria-hidden="true">🛡</span>
      <p>
        <strong>Demo only · not PCI-compliant.</strong> Production replaces this section with a Stripe Elements iframe so card data never touches Flow servers.
        Do not enter real card numbers.
      </p>
    </div>
  )
}
