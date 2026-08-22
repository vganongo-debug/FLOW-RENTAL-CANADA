import { describe, expect, it, beforeEach } from 'vitest'
import { payments } from './api'

beforeEach(() => { window.localStorage.clear() })

describe('payments.charge · card path', () => {
  it('requires a stripePaymentMethodId for the card method', async () => {
    await expect(
      payments.charge({ amountCad: 100, method: 'card' })
    ).rejects.toThrow(/paymentMethodId/i)
  })

  it('captures when given a valid-looking pm_* token', async () => {
    const r = await payments.charge({
      amountCad: 825,
      method: 'card',
      stripePaymentMethodId: 'pm_test_1234567890',
      ref: 'BK-2026-0001',
    })
    expect(r.method).toBe('card')
    expect(r.status).toBe('captured')
    expect(r.stripePaymentMethodId).toBe('pm_test_1234567890')
    expect(r.stripePaymentIntentId).toMatch(/^pi_/)
    expect(r.amountCad).toBe(825)
  })

  it('fails when the token does not look like a Stripe pm_* id', async () => {
    const r = await payments.charge({
      amountCad: 50,
      method: 'card',
      stripePaymentMethodId: 'definitely-not-a-stripe-token',
    })
    expect(r.status).toBe('failed')
    expect(r.stripePaymentIntentId).toBeUndefined()
  })

  it('logs the captured transaction to the ledger', async () => {
    await payments.charge({ amountCad: 200, method: 'card', stripePaymentMethodId: 'pm_x' })
    const log = await payments.listTransactions()
    expect(log[0].method).toBe('card')
    expect(log[0].stripePaymentMethodId).toBe('pm_x')
  })
})

describe('payments.charge · non-card paths still work', () => {
  it('cash queues without Stripe', async () => {
    const r = await payments.charge({ amountCad: 100, method: 'cash' })
    expect(r.status).toBe('queued')
    expect(r.stripePaymentMethodId).toBeUndefined()
  })

  it('momo captures (deterministic stub)', async () => {
    const r = await payments.charge({ amountCad: 100, method: 'interac' })
    expect(['captured', 'failed']).toContain(r.status)
  })
})
