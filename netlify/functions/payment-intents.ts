/**
 * Stripe Payment Intents bridge · Netlify Function.
 *
 * Reachable at:   /.netlify/functions/payment-intents
 * Pretty alias:   /api/payment-intents  (configured in netlify.toml)
 *
 * Why this exists
 * ----------------
 * The browser must never see the Stripe secret key. The frontend tokenises
 * card data via Stripe Elements (CardElement iframe) and posts the resulting
 * `pm_xxx` payment-method id to this function. Only this function — running
 * in Netlify's server-side runtime with access to STRIPE_SECRET_KEY —
 * confirms the payment intent against Stripe's API.
 *
 * This moves the controlled-environment step out of Flow's SAQ-A scope and
 * keeps card PANs entirely outside our origin. See SECURITY.md §5 (PCI-3,
 * PCI-3b) for full context.
 *
 * Required env vars
 * ------------------
 *   STRIPE_SECRET_KEY     · sk_test_… for staging, sk_live_… for production.
 *                           Set in Netlify → Site settings → Environment vars.
 *
 * Optional env vars
 * ------------------
 *   STRIPE_API_VERSION    · defaults to 2024-06-20 · pin to a specific
 *                           version to opt out of automatic upgrades.
 *
 * Idempotency
 * ------------
 * The frontend should send a UUID in the `Idempotency-Key` header. If the
 * client retries (e.g. flaky network) Stripe returns the same intent rather
 * than charging twice. See: https://stripe.com/docs/api/idempotent_requests
 *
 * Auth (TODO)
 * ------------
 * In production this function MUST verify the caller's session before
 * accepting a charge request. The demo deliberately omits this so the
 * Stripe end-to-end flow can be exercised — search for "AUTH-TODO" below.
 */
import Stripe from 'stripe'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface NetlifyEvent {
  httpMethod: string
  headers: Record<string, string | undefined>
  body: string | null
}

interface NetlifyResponse {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

interface ChargeRequest {
  amountUsd: number
  stripePaymentMethodId: string
  ref?: string
}

interface ChargeSuccess {
  ok: true
  status: Stripe.PaymentIntent.Status
  paymentIntentId: string
  amountCents: number
}

interface ChargeFailure {
  ok: false
  error: string
  code?: string
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_AMOUNT_USD = 100_000 // $100k upper bound · raises flag for review
const MIN_AMOUNT_USD = 0.5     // Stripe minimum charge

const CORS_HEADERS: Record<string, string> = {
  // The Netlify Function and the SPA share the same origin in production,
  // but during `netlify dev` the SPA runs on :8888 and functions on :3999.
  // Allow same-origin and the local dev origin only.
  'Access-Control-Allow-Origin': process.env.URL ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validate(input: unknown): ChargeRequest | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'Body must be JSON' }
  const obj = input as Record<string, unknown>

  const amountUsd = obj.amountUsd
  const stripePaymentMethodId = obj.stripePaymentMethodId
  const ref = obj.ref

  if (typeof amountUsd !== 'number' || !Number.isFinite(amountUsd)) {
    return { error: 'amountUsd must be a finite number' }
  }
  if (amountUsd < MIN_AMOUNT_USD || amountUsd > MAX_AMOUNT_USD) {
    return { error: `amountUsd must be between $${MIN_AMOUNT_USD} and $${MAX_AMOUNT_USD}` }
  }
  if (typeof stripePaymentMethodId !== 'string' || !/^pm_[a-zA-Z0-9]+$/.test(stripePaymentMethodId)) {
    return { error: 'stripePaymentMethodId must be a pm_xxx token from Stripe.js' }
  }
  if (ref !== undefined && (typeof ref !== 'string' || ref.length > 64)) {
    return { error: 'ref must be a string ≤ 64 chars' }
  }

  return { amountUsd, stripePaymentMethodId, ref: typeof ref === 'string' ? ref : undefined }
}

/* ------------------------------------------------------------------ */
/* Handler                                                            */
/* ------------------------------------------------------------------ */

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' } satisfies ChargeFailure),
    }
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    // Don't echo this back to the client · just 500 with a generic message.
    console.error('STRIPE_SECRET_KEY is not set · cannot process payments')
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Payment service is not configured' } satisfies ChargeFailure),
    }
  }

  // AUTH-TODO: verify caller's session here before allowing a charge.
  // Example shape: read the Cookie header, validate the session token
  // against a Postgres / Redis session store, attach `userId` to the
  // Stripe metadata so every charge is traceable to an authenticated user.

  let parsed: unknown
  try {
    parsed = event.body ? JSON.parse(event.body) : null
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Invalid JSON' } satisfies ChargeFailure),
    }
  }

  const validation = validate(parsed)
  if ('error' in validation) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: validation.error } satisfies ChargeFailure),
    }
  }

  const stripe = new Stripe(secret, {
    apiVersion: (process.env.STRIPE_API_VERSION ?? '2024-06-20') as Stripe.LatestApiVersion,
    typescript: true,
  })

  const idempotencyKey = event.headers['idempotency-key'] ?? event.headers['Idempotency-Key']

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(validation.amountUsd * 100),
        currency: 'usd',
        payment_method: validation.stripePaymentMethodId,
        confirmation_method: 'automatic',
        confirm: true,
        // Disable redirect-based flows (3DS opens in a modal · we don't redirect away).
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: {
          ref: validation.ref ?? '',
          // AUTH-TODO: include the authenticated user id here.
          actor: 'demo',
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    )

    const body: ChargeSuccess = {
      ok: true,
      status: intent.status,
      paymentIntentId: intent.id,
      amountCents: intent.amount,
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(body) }
  } catch (err) {
    // Distinguish card declines (402) from server errors (500).
    if (err instanceof Stripe.errors.StripeCardError) {
      const body: ChargeFailure = { ok: false, error: err.message, code: err.code }
      return { statusCode: 402, headers: CORS_HEADERS, body: JSON.stringify(body) }
    }
    console.error('Stripe charge failed', err)
    const body: ChargeFailure = {
      ok: false,
      error: err instanceof Error ? err.message : 'Internal error',
    }
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify(body) }
  }
}
