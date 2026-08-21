import { loadStripe, type Stripe } from '@stripe/stripe-js'

/**
 * Stripe publishable key.
 *
 * Publishable keys (pk_*) are safe to expose in the frontend — they only
 * grant the ability to TOKENIZE card data, not to charge cards or read
 * customer records. The secret key (sk_*) MUST stay on a backend server.
 *
 * Resolution order:
 *   1. `VITE_STRIPE_PUBLISHABLE_KEY` env var (recommended)
 *   2. `STRIPE_TEST_PUBLISHABLE_KEY` from Stripe's public docs (demo only)
 *
 * Override locally by adding a `.env.local` with:
 *   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
 */
export const STRIPE_TEST_PUBLISHABLE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'

const envKey = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  ?.VITE_STRIPE_PUBLISHABLE_KEY

const PUBLISHABLE_KEY = envKey || STRIPE_TEST_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Singleton Stripe.js loader. Lazy — only fetches the Stripe library when
 * the user actually opens a payment screen, so the homepage doesn't pay
 * the 50 kB network cost for nothing.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(PUBLISHABLE_KEY)
  }
  return stripePromise
}

/**
 * True when no environment-provided key is set and the demo Stripe key
 * is being used. The card form surfaces this so operators know real
 * cards must not be entered.
 */
export const STRIPE_IS_DEMO_KEY = !envKey

/**
 * Known Stripe test card numbers — useful for demos. Tokens issued from
 * these test PANs are non-chargeable in live mode.
 */
export const STRIPE_TEST_CARDS = [
  { brand: 'Visa',                pan: '4242 4242 4242 4242', desc: 'Always succeeds' },
  { brand: 'Visa (3DS required)', pan: '4000 0027 6000 3184', desc: 'Triggers Strong Customer Authentication' },
  { brand: 'Mastercard',          pan: '5555 5555 5555 4444', desc: 'Always succeeds' },
  { brand: 'Visa (declined)',     pan: '4000 0000 0000 9995', desc: 'Insufficient funds simulation' },
]
