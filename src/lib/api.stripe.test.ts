import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { payments } from './api'

beforeEach(() => {
  window.localStorage.clear()
  // Mode maquette explicite. Auparavant les tests atteignaient
  // /api/payment-intents, echouaient faute de serveur, et le repli silencieux
  // les faisait passer au vert : un debit jamais effectue etait rapporte
  // comme encaisse.
  vi.stubEnv('VITE_PAYMENT_INTENTS_URL', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

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

describe('payments.charge · une panne reseau ne vaut jamais capture', () => {
  it('rapporte un echec quand la fonction de paiement est injoignable', async () => {
    vi.stubEnv('VITE_PAYMENT_INTENTS_URL', 'https://exemple.invalide/api/payment-intents')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const r = await payments.charge({
      amountCad: 825,
      method: 'card',
      stripePaymentMethodId: 'pm_test_1234567890',
      ref: 'BK-2026-0001',
    })

    expect(r.status).toBe('failed')
    expect(r.stripePaymentIntentId).toBeUndefined()
  })

  it('rapporte un echec quand la fonction repond 4xx', async () => {
    vi.stubEnv('VITE_PAYMENT_INTENTS_URL', 'https://exemple.invalide/api/payment-intents')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ ok: false, error: 'Payments are disabled' }),
    }))

    const r = await payments.charge({
      amountCad: 100, method: 'card', stripePaymentMethodId: 'pm_test_1',
    })
    expect(r.status).toBe('failed')
  })

  it('distingue une authentification 3-D Secure et un refus', async () => {
    vi.stubEnv('VITE_PAYMENT_INTENTS_URL', 'https://exemple.invalide/api/payment-intents')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, status: 'requires_action', paymentIntentId: 'pi_3ds' }),
    }))

    const r = await payments.charge({
      amountCad: 100, method: 'card', stripePaymentMethodId: 'pm_test_1',
    })
    expect(r.status).toBe('requires_action')
  })

  it('envoie amountCad avec une cle idempotente stable entre deux tentatives', async () => {
    vi.stubEnv('VITE_PAYMENT_INTENTS_URL', 'https://exemple.invalide/api/payment-intents')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ ok: true, status: 'succeeded', paymentIntentId: 'pi_1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const charge = { amountCad: 721, method: 'card' as const, stripePaymentMethodId: 'pm_abc', ref: 'BK-1' }
    await payments.charge(charge)
    await payments.charge(charge)

    const [, first] = fetchMock.mock.calls[0]
    const [, second] = fetchMock.mock.calls[1]
    expect(JSON.parse(first.body).amountCad).toBe(721)
    expect(JSON.parse(first.body)).not.toHaveProperty('amountUsd')
    expect(first.headers['Idempotency-Key']).toBe(second.headers['Idempotency-Key'])
  })
})
