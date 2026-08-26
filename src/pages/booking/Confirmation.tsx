import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Calendar, Hotel, MapPin, Users, Plane, Coffee, Award, Mail, Download, Smartphone } from 'lucide-react'
import { useCurrencyFormatter } from '../../lib/useCurrencyFormatter'
import type { Quote } from '../../lib/booking'
import type { PaymentResult } from '../../lib/api'

/** Etat transmis par le paiement. Cette page ne calcule plus rien. */
interface ConfirmationState {
  ref: string
  quote: Quote
  result: PaymentResult
  method: string
}

export default function Confirmation() {
  const { t } = useTranslation()
  const format = useCurrencyFormatter()
  const { state } = useLocation()
  const booking = state as ConfirmationState | null

  // Sans paiement aboutit, il n'y a rien a confirmer. La page affichait
  // auparavant un encaissement et une reference tires au hasard a chaque
  // rendu — rafraichir donnait un autre numero.
  //
  // « queued » vaut confirmation : c'est le paiement sur place, du au
  // moment de l'arrivee. Seuls un refus et une authentification en attente
  // empechent la reservation.
  const settled = booking?.result?.status === 'captured' || booking?.result?.status === 'queued'
  if (!booking?.ref || !booking.quote || !settled) {
    return <Navigate to="/booking/search" replace />
  }

  const { ref: bookingRef, quote, result } = booking

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Success hero */}
      <div className="text-center">
        <div className="inline-flex h-16 w-16 rounded-full bg-teal text-white items-center justify-center mb-4 shadow-card">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="font-display text-4xl text-ink dark:text-ivory">
          {t('booking.confirmation.title', { defaultValue: 'Your stay is confirmed' })}
        </h1>
        <p className="text-sm text-g40 mt-2">
          {t('booking.confirmation.subtitle', { defaultValue: 'Receipt sent to sarah.bennett@example.com · we look forward to welcoming you.' })}
        </p>
      </div>

      {/* Booking reference card */}
      <section className="mt-8 rounded-card overflow-hidden bg-coal text-ivory shadow-panel">
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="label-caps text-copper-light">
              {t('booking.confirmation.reference', { defaultValue: 'Booking reference' })}
            </div>
            <div className="font-mono text-2xl mt-1">{bookingRef}</div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex items-center gap-2"><Hotel className="h-3.5 w-3.5 text-copper" /> Flow Station Natashquan · Deluxe King</div>
              <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-copper" /> 14 – 18 May 2026 · {quote.nights} nights</div>
              <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-copper" /> 2 adults · Sarah Bennett</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-copper" /> Chemin d’en Haut · Natashquan, QC</div>
            </div>
          </div>

          {/* QR placeholder */}
          <div className="bg-ivory text-ink rounded-card p-3 shrink-0">
            <QrPlaceholder text={bookingRef} />
            <p className="text-[10px] text-g40 mt-2 text-center font-mono">{bookingRef}</p>
            <p className="text-[10px] text-g40 text-center">Show at front desk</p>
          </div>
        </div>
        <div className="bg-panel border-t border-g20/30 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-g80">Free cancellation until 13 May 14:00 EST</span>
          <span className="text-copper-light flex items-center gap-1">
            <Award className="h-3 w-3" /> {quote.pointsEarned.toLocaleString()} Flow Rewards points pending
          </span>
        </div>
      </section>

      {/* Charge summary */}
      <section className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <h2 className="label-caps text-g40 mb-3">{t('booking.confirmation.payment', { defaultValue: 'Payment' })}</h2>
          <ul className="space-y-1.5 text-sm">
            <Line label={`Deluxe room · ${quote.nights} nights`} amount={format(quote.subtotalCad, undefined, { cents: true })} />
            {quote.addonsCad > 0 && <Line label="Add-ons" amount={format(quote.addonsCad, undefined, { cents: true })} />}
            <Line label={`${quote.taxName} (${quote.taxRatePct} %)`} amount={format(quote.taxCad, undefined, { cents: true })} muted />
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-g20/60 pt-3">
            <span className="label-caps text-g40">{t('common.total')}</span>
            <span className="font-display font-bold text-2xl text-copper">{format(quote.totalCad, undefined, { cents: true })}</span>
          </div>
          <div className="text-xs text-g40 mt-2">
            {result.method === 'card' ? 'Card' : result.method} ·{' '}
            {result.status === 'queued' ? 'due on arrival' : 'captured'}{' '}
            {new Date(result.capturedAt).toLocaleString('fr-CA')}
            {result.stripePaymentIntentId ? ` · ${result.stripePaymentIntentId}` : ''}
          </div>
        </div>

        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card space-y-3">
          <h2 className="label-caps text-g40">{t('booking.confirmation.next', { defaultValue: 'What\'s next' })}</h2>
          <Step icon={<Mail className="h-4 w-4 text-teal" />} title="Confirmation emailed" body="A copy of this booking is in your inbox." done />
          <Step icon={<Plane className="h-4 w-4 text-teal" />} title="Day-before reminder" body="We'll send a WhatsApp the morning before arrival." />
          <Step icon={<Smartphone className="h-4 w-4 text-teal" />} title="Skip the queue" body="Open the Flow App and scan the QR at the front desk to check in in seconds." />
          <Step icon={<Coffee className="h-4 w-4 text-teal" />} title="Breakfast served" body="Each morning 06:30 – 10:30 in the Flow Bistro." />
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2 justify-between">
        <Link to="/booking/search" className="text-sm text-teal hover:text-teal-dark font-medium">
          ← {t('booking.confirmation.book_another', { defaultValue: 'Book another stay' })}
        </Link>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">
            <Calendar className="h-4 w-4" /> {t('booking.confirmation.add_calendar', { defaultValue: 'Add to calendar' })}
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">
            <Download className="h-4 w-4" /> {t('booking.confirmation.download_pdf', { defaultValue: 'Download PDF' })}
          </button>
          <Link to="/booking/account" className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium">
            {t('booking.confirmation.view_account', { defaultValue: 'View my account' })}
          </Link>
        </div>
      </div>
    </div>
  )
}

function Step({ icon, title, body, done }: { icon: React.ReactNode; title: string; body: string; done?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium text-ink dark:text-ivory text-sm">{title}</div>
          {done && <span className="text-[10px] label-caps text-teal-dark bg-teal-light dark:bg-teal-dark/30 px-1.5 py-0.5 rounded-badge">Done</span>}
        </div>
        <p className="text-xs text-g40">{body}</p>
      </div>
    </div>
  )
}

function Line({ label, amount, muted }: { label: string; amount: string; muted?: boolean }) {
  return (
    <li className={`flex items-center justify-between ${muted ? 'text-g40' : 'text-ink dark:text-ivory'}`}>
      <span>{label}</span>
      <span className="font-medium">{amount}</span>
    </li>
  )
}

// Decorative QR placeholder — fakes a QR code visually without external deps.
function QrPlaceholder({ text }: { text: string }) {
  // Deterministic pseudo-random based on text length
  const seed = text.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const cells = 21
  const arr = Array.from({ length: cells * cells }, (_, i) => ((seed * 9301 + i * 49297) % 233280) % 2 === 0)
  // Force the three corner finder patterns
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} width="120" height="120" className="block" aria-label="QR code placeholder">
      <rect width={cells} height={cells} fill="#fff" />
      {arr.map((on, i) => {
        const x = i % cells
        const y = Math.floor(i / cells)
        if (isFinder(x, y)) return null
        if (!on) return null
        return <rect key={i} x={x} y={y} width="1" height="1" fill="#12271B" />
      })}
      {/* Finder patterns */}
      {[[0, 0], [cells - 7, 0], [0, cells - 7]].map(([fx, fy]) => (
        <g key={`f-${fx}-${fy}`}>
          <rect x={fx} y={fy} width={7} height={7} fill="#12271B" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="#fff" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#12271B" />
        </g>
      ))}
    </svg>
  )
}
