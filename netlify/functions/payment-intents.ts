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
 * Currency
 * ---------
 * Flow settles in Canadian dollars. The request carries `amountCad` and the
 * intent is created with `currency: 'cad'`. There is no conversion step:
 * the number the guest sees is the number Stripe charges.
 *
 * Required env vars
 * ------------------
 *   STRIPE_SECRET_KEY     · sk_test_… for staging, sk_live_… for production.
 *                           Set in Netlify → Site settings → Environment vars.
 *   PAYMENTS_ENABLED      · must be exactly "true" or every request is
 *                           refused with 503. See "Closed by default" below.
 *
 * Optional env vars
 * ------------------
 *   STRIPE_API_VERSION    · defaults to 2024-06-20 · pin to a specific
 *                           version to opt out of automatic upgrades.
 *   ALLOWED_ORIGIN        · overrides the CORS origin. Defaults to the
 *                           Netlify deploy URL. Never falls back to "*".
 *
 * Idempotency
 * ------------
 * The frontend sends a key derived from the charge itself (reference,
 * amount, payment-method) in the `Idempotency-Key` header, so a retry of
 * the same charge reuses the same intent instead of billing twice.
 * See: https://stripe.com/docs/api/idempotent_requests
 *
 * Closed by default — READ THIS BEFORE ENABLING
 * ----------------------------------------------
 * This function has NO caller authentication. It cannot have any until
 * sessions are verified server-side: the SPA mints its own session token in
 * localStorage, and any secret shipped in the bundle is readable by anyone
 * who opens devtools. Without a check, whoever can tokenise a card can ask
 * this endpoint to charge any amount.
 *
 * So it refuses everything unless PAYMENTS_ENABLED === "true". Do not set
 * that variable until the AUTH-TODO below is done: verify the caller's
 * session against a server-side store and attach the authenticated user id
 * to the intent metadata.
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
  amountCad: number
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

const MAX_AMOUNT_CAD = 100_000 // 100 k$ CA upper bound · raises flag for review
const MIN_AMOUNT_CAD = 0.5     // Stripe minimum charge

/**
 * Origine autorisée. Le repli précédent était "*", ce qui ouvrait l'endpoint
 * à n'importe quel site. En l'absence d'origine connue on renvoie une valeur
 * qui ne correspond à rien plutôt que de tout autoriser.
 */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? process.env.URL ?? 'null'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
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

  const amountCad = obj.amountCad
  const stripePaymentMethodId = obj.stripePaymentMethodId
  const ref = obj.ref

  if (typeof amountCad !== 'number' || !Number.isFinite(amountCad)) {
    return { error: 'amountCad must be a finite number' }
  }
  if (amountCad < MIN_AMOUNT_CAD || amountCad > MAX_AMOUNT_CAD) {
    return { error: `amountCad must be between ${MIN_AMOUNT_CAD} and ${MAX_AMOUNT_CAD} CAD` }
  }
  if (typeof stripePaymentMethodId !== 'string' || !/^pm_[a-zA-Z0-9]+$/.test(stripePaymentMethodId)) {
    return { error: 'stripePaymentMethodId must be a pm_xxx token from Stripe.js' }
  }
  if (ref !== undefined && (typeof ref !== 'string' || ref.length > 64)) {
    return { error: 'ref must be a string ≤ 64 chars' }
  }

  return { amountCad, stripePaymentMethodId, ref: typeof ref === 'string' ? ref : undefined }
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

  // Fermé par défaut : sans vérification de session côté serveur, cet
  // endpoint permettrait à quiconque sait tokeniser une carte de déclencher
  // un débit. Voir « Closed by default » en tête de fichier.
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    console.error('PAYMENTS_ENABLED is not "true" · refusing charge request')
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Payments are disabled' } satisfies ChargeFailure),
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
        amount: Math.round(validation.amountCad * 100),
        currency: 'cad',
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
    // Le détail part dans les journaux, pas au client : les messages Stripe
    // peuvent révéler la configuration du compte.
    console.error('Stripe charge failed', err)
    const body: ChargeFailure = { ok: false, error: 'Payment could not be processed' }
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify(body) }
  }
}
