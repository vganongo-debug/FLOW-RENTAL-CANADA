import { describe, expect, it, vi, beforeEach } from 'vitest'

// Stub the Stripe.js loader so the suite doesn't actually fetch from
// stripe.com (the test environment has no network).
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn((key: string) => Promise.resolve({ stub: true, key })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  // Drop the singleton between tests so we can re-exercise the cache behaviour
  vi.resetModules()
})

describe('stripe loader', () => {
  it('returns a Stripe instance the first time', async () => {
    const mod = await import('./stripe')
    const { loadStripe } = await import('@stripe/stripe-js')
    const s = await mod.getStripe()
    expect(s).toBeTruthy()
    expect(loadStripe).toHaveBeenCalledTimes(1)
  })

  it('caches the promise across calls within the same module instance', async () => {
    const mod = await import('./stripe')
    const { loadStripe } = await import('@stripe/stripe-js')
    const a = await mod.getStripe()
    const b = await mod.getStripe()
    expect(a).toBe(b)
    // Only called once across both getStripe() invocations because the
    // first one's promise is cached.
    expect(loadStripe).toHaveBeenCalledTimes(1)
  })

  it('uses the documented Stripe demo publishable key', async () => {
    const mod = await import('./stripe')
    expect(mod.STRIPE_TEST_PUBLISHABLE_KEY).toMatch(/^pk_test_/)
  })

  it('flags demo-key mode when no env override is set', async () => {
    const mod = await import('./stripe')
    expect(mod.STRIPE_IS_DEMO_KEY).toBe(true)
  })

  it('exports a useful list of test cards', async () => {
    const mod = await import('./stripe')
    expect(mod.STRIPE_TEST_CARDS.length).toBeGreaterThanOrEqual(3)
    for (const c of mod.STRIPE_TEST_CARDS) {
      expect(c.pan).toMatch(/^\d{4} \d{4} \d{4} \d{4}$/)
      expect(c.brand.length).toBeGreaterThan(0)
      expect(c.desc.length).toBeGreaterThan(0)
    }
  })
})
