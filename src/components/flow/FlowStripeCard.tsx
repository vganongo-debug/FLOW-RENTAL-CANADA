import { useEffect, useState } from 'react'
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeCardElementOptions, StripeError } from '@stripe/stripe-js'
import { Lock, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getStripe, STRIPE_IS_DEMO_KEY, STRIPE_TEST_CARDS } from '../../lib/stripe'
import { useTheme } from '../../context/ThemeContext'

/**
 * Real Stripe card-collection component.
 *
 * Renders the CardElement iframe served from stripe.com. Card data NEVER
 * enters the React app: it lives entirely in Stripe's cross-origin iframe.
 * On submit we call `stripe.createPaymentMethod()` and surface the
 * resulting `pm_xxx` token to the caller. The caller then forwards the
 * token to the backend, which calls `stripe.paymentIntents.create({
 * payment_method, confirm: true })` server-side with the secret key.
 *
 * Without that backend step the charge cannot actually settle, but the
 * SECURITY POSTURE is the same as production: card data is isolated.
 */

interface Props {
  /** USD amount, displayed in the confirm CTA */
  amountUsd: number
  /** Disabled while parent is busy */
  disabled?: boolean
  /** Called with the Stripe payment_method id (pm_xxx) on success */
  onPaymentMethod: (paymentMethodId: string) => void
  /** Called with the user-friendly error string on failure */
  onError?: (message: string) => void
}

export function FlowStripeCard(props: Props) {
  return (
    <StripeElementsBoundary>
      <CardForm {...props} />
    </StripeElementsBoundary>
  )
}

/**
 * Wrapper that resolves the Stripe promise then mounts <Elements>.
 * Returning null while loading prevents a flash of un-styled iframe.
 */
function StripeElementsBoundary({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme()
  const [stripe, setStripe] = useState<Awaited<ReturnType<typeof getStripe>>>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    getStripe()
      .then((s) => { if (alive) setStripe(s) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [])

  if (failed) {
    return (
      <div className="rounded-input border border-red-300 bg-red-50/70 dark:bg-red-900/20 p-3 text-sm flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-red-700 dark:text-red-300">
          Couldn't load Stripe. Check the network connection and refresh the page.
        </div>
      </div>
    )
  }

  if (!stripe) {
    return (
      <div className="rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3 text-sm flex items-center gap-2 text-g40">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading secure card form…
      </div>
    )
  }

  return (
    <Elements stripe={stripe} options={{
      appearance: {
        theme: mode === 'dark' ? 'night' : 'stripe',
        variables: {
          colorPrimary: '#0B6E6E',
          colorBackground: mode === 'dark' ? '#1E2A2A' : '#F4EFE6',
          colorText: mode === 'dark' ? '#F4EFE6' : '#0C1A1A',
          colorDanger: '#B87333',
          fontFamily: 'Calibri, "Segoe UI", system-ui, sans-serif',
          borderRadius: '4px',
        },
      },
    }}>
      {children}
    </Elements>
  )
}

function CardForm({ amountUsd, disabled, onPaymentMethod, onError }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { mode } = useTheme()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cardholderName, setCardholderName] = useState('')

  const cardOptions: StripeCardElementOptions = {
    hidePostalCode: false,
    style: {
      base: {
        fontFamily: 'Calibri, "Segoe UI", system-ui, sans-serif',
        fontSize: '14px',
        color: mode === 'dark' ? '#F4EFE6' : '#0C1A1A',
        '::placeholder': { color: mode === 'dark' ? '#8FA0A0' : '#5A7070' },
      },
      invalid: { color: '#B87333' },
    },
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    const card = elements.getElement(CardElement)
    if (!card) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
      billing_details: { name: cardholderName || undefined },
    })

    if (stripeError) {
      const msg = friendlyError(stripeError)
      setError(msg)
      onError?.(msg)
      setSubmitting(false)
      return
    }

    if (paymentMethod) {
      setSuccess(paymentMethod.id)
      onPaymentMethod(paymentMethod.id)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {STRIPE_IS_DEMO_KEY && (
        <div className="rounded-input border border-copper/40 bg-copper-light/40 dark:bg-copper-dark/20 p-3 text-xs text-ink dark:text-ivory">
          <strong>Stripe sandbox mode.</strong> Using the public demo key — do not enter real card data.
          Use a test card such as <span className="font-mono">{STRIPE_TEST_CARDS[0].pan}</span>, any future expiry, any CVC, any postcode.
        </div>
      )}

      <label className="block">
        <span className="label-caps text-g40 mb-1 block">Cardholder name</span>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="As shown on the card"
          maxLength={100}
          autoComplete="cc-name"
          className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
        />
      </label>

      <label className="block">
        <span className="label-caps text-g40 mb-1 block flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-teal" aria-hidden="true" /> Card details
        </span>
        <div className="px-3 py-2.5 bg-ivory dark:bg-panel border border-g20/60 rounded-input">
          <CardElement options={cardOptions} />
        </div>
        <p className="text-[11px] text-g40 mt-1.5 flex items-center gap-1">
          <Lock className="h-3 w-3 text-teal" aria-hidden="true" />
          Card details are entered inside a Stripe iframe — Flow never sees them.
        </p>
      </label>

      {error && (
        <div role="alert" className="rounded-input border border-red-300 bg-red-50/70 dark:bg-red-900/20 p-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-input border border-teal/40 bg-teal-light/40 dark:bg-teal-dark/20 p-2.5 text-xs text-ink dark:text-ivory">
          <strong>Tokenized.</strong> Stripe returned payment-method ID <span className="font-mono">{success}</span>.
          A real backend would now call <code>stripe.paymentIntents.confirm()</code> with this token to settle ${amountUsd}.
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || submitting || !stripe || !elements || !!success}
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-medium',
          'bg-teal text-white hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Tokenizing…</>
        ) : success ? (
          'Token issued · ready to confirm on backend'
        ) : (
          <><Lock className="h-3.5 w-3.5" /> Pay ${amountUsd.toLocaleString()} via Stripe</>
        )}
      </button>

      <p className="text-[10px] text-g40 text-center">
        Powered by Stripe · card data lives in stripe.com iframe (PCI-DSS SAQ-A scope)
      </p>
    </form>
  )
}

function friendlyError(err: StripeError): string {
  if (err.type === 'card_error' || err.type === 'validation_error') {
    return err.message ?? 'Card was declined.'
  }
  return err.message ?? 'Something went wrong with the payment. Please try again.'
}
