/**
 * Mock API layer for Flow Rentals OS.
 *
 * All screen-level data access should go through this file. Every export
 * returns a Promise<T> so the contract is identical to a real backend.
 *
 * Persistence: optional. Any function that wraps `withPersistence(key, ...)`
 * round-trips through localStorage so mutations stick across reloads.
 *
 * Swapping to a real backend later is a one-file change:
 *   - Replace function bodies with `fetch('/api/...', { ... })`
 *   - Keep the signatures identical
 *   - Drop the localStorage wrapper
 */
import {
  SAMPLE_USERS, PROPERTIES, FLEET_PARTNERS, SAMPLE_ROOMS, SAMPLE_RESERVATIONS,
  VEHICLES, RENTAL_BOOKINGS, ARRIVALS_TODAY, NOTIFICATIONS,
  OCCUPANCY_TREND_7D, REVENUE_30D, COUNTRY_PERFORMANCE,
  SEARCH_RESULTS_HOTELS, SEARCH_RESULTS_CARS,
  SUPPLIERS, INVENTORY, PURCHASE_ORDERS,
  REWARDS_MEMBERS, REWARDS_TRANSACTIONS, REWARDS_DISPUTES,
  REWARDS_PARTNERSHIPS, REWARDS_AUDIT, REWARDS_TIERS,
  PARTICIPANTS, CONVERSATIONS, MESSAGES,
} from './sampleData'
import type {
  User, Role, Property, FleetPartner, Room, Reservation, Vehicle, RentalBooking,
  InventoryItem, Supplier, PurchaseOrder, PurchaseOrderStatus, PurchaseOrderLine,
  RewardsMember, RewardsTier, RewardsTransaction, RewardsDispute, DisputeStatus,
  RewardsPartnership, RewardsAuditEntry, RewardsTierConfig,
  Participant, Conversation, Message, Attachment, ConversationContext,
  CountryCode,
} from './types'

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const LATENCY_MS = 80

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms))
}

/**
 * Version du jeu de données de départ.
 *
 * Les datasets sont mis en cache dans localStorage et relus tels quels.
 * Un navigateur ayant visité une version antérieure détient donc encore
 * l'ancien réseau africain, avec des montants stockés sous *Usd : des
 * champs que le schéma actuel ne connaît plus, ce qui produirait des
 * totaux à NaN. On incrémente cette valeur dès que la forme des données
 * change, pour purger le cache et repartir des données de départ.
 */
const SEED_VERSION = '2026.08-ca'
const SEED_VERSION_KEY = 'flow-os.seed-version'
/** Préférence de langue : conservée au travers des migrations. */
const PRESERVED_KEYS = ['flow-os.lang']

function ensureSeedVersion(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION) return
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('flow-os.') && !PRESERVED_KEYS.includes(k))
      .forEach((k) => window.localStorage.removeItem(k))
    window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  } catch {
    /* stockage indisponible : on repart simplement des données de départ */
  }
}

ensureSeedVersion()

/**
 * Read-through cache via localStorage. Falls back to `seed` on first read.
 * Mutations should call `setCached(key, next)` to persist.
 */
function getCached<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch {
    return seed
  }
}
function setCached<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export interface Session { token: string; user: User; expiresAt: number }

const SESSION_KEY = 'flow-os.session'

export const auth = {
  async loginAs(role: Role): Promise<Session> {
    const user = SAMPLE_USERS.find((u) => u.role === role)
    if (!user) throw new Error(`No demo user for role: ${role}`)
    const session: Session = {
      token: `tok_${role}_${Date.now().toString(36)}`,
      user,
      expiresAt: Date.now() + 8 * 3600 * 1000, // 8 hours
    }
    setCached(SESSION_KEY, session)
    return delay(session)
  },
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY)
    return delay(undefined)
  },
  async currentSession(): Promise<Session | null> {
    const session = getCached<Session | null>(SESSION_KEY, null)
    if (!session) return delay(null)
    if (session.expiresAt < Date.now()) {
      if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY)
      return delay(null)
    }
    return delay(session)
  },
}

/* ------------------------------------------------------------------ */
/* Hotels                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Properties (used by Admin and Country Manager views)               */
/* ------------------------------------------------------------------ */

export interface PropertyCreateInput {
  name: string
  type: Property['type']
  city: string
  country: string
  countryCode: CountryCode
  address?: string
  gps?: { lat: number; lng: number }
  rooms?: number
  vehicles?: number
  goLiveDate?: string
  contactEmail?: string
  contactPhone?: string
  partnerId?: string
}

export const properties = {
  async list(opts?: { countryCode?: string; type?: Property['type'] }): Promise<Property[]> {
    let rows = getCached<Property[]>('flow-os.properties', PROPERTIES)
    if (opts?.countryCode) rows = rows.filter((p) => p.countryCode === opts.countryCode)
    if (opts?.type) rows = rows.filter((p) => p.type === opts.type || p.type === 'both')
    return delay(rows)
  },
  async get(id: string): Promise<Property | null> {
    const all = getCached<Property[]>('flow-os.properties', PROPERTIES)
    return delay(all.find((p) => p.id === id) ?? null)
  },
  async create(input: PropertyCreateInput): Promise<Property> {
    const cur = getCached<Property[]>('flow-os.properties', PROPERTIES)
    const slug = input.city.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 3)
    const id = `p-${slug}-${Date.now().toString(36).slice(-4)}`
    const property: Property = {
      id,
      name: input.name,
      type: input.type,
      city: input.city,
      country: input.country,
      countryCode: input.countryCode,
      address: input.address,
      gps: input.gps,
      rooms: input.type !== 'car_rental' ? input.rooms : undefined,
      vehicles: input.type !== 'hotel' ? input.vehicles : undefined,
      monthlyRevenueCad: 0,
      ebitdaPct: 0,
      status: input.goLiveDate ? 'opening' : 'pilot',
      goLiveDate: input.goLiveDate,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      partnerId: input.partnerId,
    }
    setCached('flow-os.properties', [property, ...cur])
    return delay(property, 200)
  },
  async update(id: string, patch: Partial<Property>): Promise<Property | null> {
    const cur = getCached<Property[]>('flow-os.properties', PROPERTIES)
    const next = cur.map((p) => p.id === id ? { ...p, ...patch, id: p.id } : p)
    setCached('flow-os.properties', next)
    return delay(next.find((p) => p.id === id) ?? null)
  },
  async remove(id: string): Promise<{ ok: true }> {
    const cur = getCached<Property[]>('flow-os.properties', PROPERTIES)
    setCached('flow-os.properties', cur.filter((p) => p.id !== id))
    return delay({ ok: true })
  },
}

export const hotels = {
  /** @deprecated use `properties.list({ type: 'hotel' })` — kept for back-compat. */
  async listProperties(): Promise<Property[]> {
    return properties.list()
  },
  /** @deprecated use `properties.get` */
  async getProperty(id: string): Promise<Property | null> {
    return properties.get(id)
  },
  async listRooms(): Promise<Room[]> {
    return delay(getCached('flow-os.rooms', SAMPLE_ROOMS))
  },
  async updateRoomStatus(number: string, status: Room['status']): Promise<Room | null> {
    const cur = getCached('flow-os.rooms', SAMPLE_ROOMS)
    const next = cur.map((r) => r.number === number ? { ...r, status } : r)
    setCached('flow-os.rooms', next)
    return delay(next.find((r) => r.number === number) ?? null)
  },
  async listReservations(opts?: { status?: Reservation['status']; channel?: string }): Promise<Reservation[]> {
    let rows: Reservation[] = getCached('flow-os.reservations', SAMPLE_RESERVATIONS)
    if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
    if (opts?.channel) rows = rows.filter((r) => r.channel === opts.channel)
    return delay(rows)
  },
  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    const cur = getCached('flow-os.reservations', SAMPLE_RESERVATIONS)
    const next = cur.map((r) => r.id === id ? { ...r, status } : r)
    setCached('flow-os.reservations', next)
    return delay(next.find((r) => r.id === id) ?? null)
  },
  async arrivalsToday() { return delay(ARRIVALS_TODAY) },
  async occupancyTrend7d() { return delay(OCCUPANCY_TREND_7D) },
}

/* ------------------------------------------------------------------ */
/* Fleet                                                              */
/* ------------------------------------------------------------------ */

export const fleet = {
  async listVehicles(opts?: { owner?: 'flow' | 'partner'; status?: Vehicle['status'] }): Promise<Vehicle[]> {
    let rows: Vehicle[] = VEHICLES
    if (opts?.owner) rows = rows.filter((v) => v.owner === opts.owner)
    if (opts?.status) rows = rows.filter((v) => v.status === opts.status)
    return delay(rows)
  },
  async getVehicle(id: string): Promise<Vehicle | null> {
    return delay(VEHICLES.find((v) => v.id === id) ?? null)
  },
  async listRentals(opts?: { status?: RentalBooking['status']; owner?: 'flow' | 'partner' }): Promise<RentalBooking[]> {
    let rows: RentalBooking[] = getCached('flow-os.rentals', RENTAL_BOOKINGS)
    if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
    if (opts?.owner) rows = rows.filter((r) => r.owner === opts.owner)
    return delay(rows)
  },
  async listPartners(): Promise<FleetPartner[]> { return delay(FLEET_PARTNERS) },
}

/* ------------------------------------------------------------------ */
/* Payments                                                           */
/* ------------------------------------------------------------------ */

export type PaymentMethod = 'card' | 'interac' | 'applepay' | 'googlepay' | 'transfer' | 'cash'

export interface PaymentResult {
  id: string
  amountCad: number
  method: PaymentMethod
  status: 'captured' | 'queued' | 'failed'
  ref: string
  capturedAt: string
  /** Stripe payment-method id (pm_xxx). Present when method === 'card'. */
  stripePaymentMethodId?: string
  /** Stripe payment-intent id (pi_xxx) once settled. Today mocked. */
  stripePaymentIntentId?: string
}

export interface ChargeInput {
  amountCad: number
  method: PaymentMethod
  ref?: string
  /** Required when method === 'card'; obtained from <FlowStripeCard>. */
  stripePaymentMethodId?: string
}

/**
 * URL of the server-side Stripe confirmation endpoint.
 *
 * Defaults to the Netlify Function path, which is rewritten by netlify.toml
 * so `/api/payment-intents` reaches `/.netlify/functions/payment-intents`.
 *
 * Override via `VITE_PAYMENT_INTENTS_URL` to point at a different backend
 * (e.g. a separate API service · keep the same request/response shape).
 *
 * Set to an empty string at build time to force the mock confirmer · useful
 * for storybook and integration tests that should never reach real Stripe.
 */
const PAYMENT_INTENTS_URL =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_PAYMENT_INTENTS_URL ??
  '/api/payment-intents'

export const payments = {
  /**
   * Charge a payment.
   *
   * Card path (production design):
   *   1. Frontend renders <FlowStripeCard> · CardElement iframe
   *   2. On submit, Stripe.js calls `createPaymentMethod()` → pm_xxx token
   *   3. Frontend POSTs token + amount to PAYMENT_INTENTS_URL (default:
   *      `/api/payment-intents` → Netlify Function at
   *      `/.netlify/functions/payment-intents`)
   *   4. The function calls `stripe.paymentIntents.create({ payment_method,
   *      amount, currency, confirm: true })` with the SECRET key (never
   *      exposed to the browser)
   *   5. The function returns `{ ok, status, paymentIntentId, amountCents }`
   *
   * In `vitest` / SSR contexts (no `window` or `fetch`) we fall back to the
   * deterministic `simulateBackendConfirm()` so unit tests don't make
   * network calls.
   */
  async charge(input: ChargeInput): Promise<PaymentResult> {
    if (input.method === 'card' && !input.stripePaymentMethodId) {
      throw new Error('Card charges require a Stripe paymentMethodId · render <FlowStripeCard> first')
    }

    let status: PaymentResult['status']
    let stripePaymentIntentId: string | undefined

    if (input.method === 'cash') {
      status = 'queued'
    } else if (input.method === 'card') {
      const result = await confirmCardCharge(input)
      status = result.status
      stripePaymentIntentId = result.paymentIntentId
    } else {
      status = Math.random() < 0.05 ? 'failed' : 'captured'
    }

    const result: PaymentResult = {
      id: `TXN-${Math.floor(Math.random() * 90000 + 10000)}`,
      amountCad: input.amountCad,
      method: input.method,
      status,
      ref: input.ref ?? '',
      capturedAt: new Date().toISOString(),
      stripePaymentMethodId: input.stripePaymentMethodId,
      stripePaymentIntentId,
    }
    const log = getCached<PaymentResult[]>('flow-os.payments', [])
    setCached('flow-os.payments', [result, ...log].slice(0, 200))
    return delay(result, 250)
  },
  async listTransactions(): Promise<PaymentResult[]> {
    return delay(getCached<PaymentResult[]>('flow-os.payments', []))
  },
}

/**
 * Calls the server-side Stripe bridge. Returns the captured/failed status
 * plus the pi_xxx id when successful.
 *
 * Falls back to `simulateBackendConfirm` when:
 *   - `fetch` is unavailable (vitest jsdom without polyfill)
 *   - PAYMENT_INTENTS_URL is empty (explicit mock-mode build flag)
 *   - the fetch throws (network error · degrades to the mock so the demo
 *     still completes end-to-end even without a backend)
 */
async function confirmCardCharge(input: ChargeInput): Promise<{ status: 'captured' | 'failed'; paymentIntentId?: string }> {
  const noFetch = typeof fetch === 'undefined'
  if (noFetch || !PAYMENT_INTENTS_URL) {
    return mockConfirm(input.stripePaymentMethodId!)
  }
  try {
    const response = await fetch(PAYMENT_INTENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Idempotency: retrying the same charge produces the same intent.
        'Idempotency-Key': cryptoUuid(),
      },
      body: JSON.stringify({
        amountCad: input.amountCad,
        stripePaymentMethodId: input.stripePaymentMethodId,
        ref: input.ref,
      }),
    })
    if (!response.ok) {
      // 4xx with a JSON body containing `error`. Surface as a failed charge.
      return { status: 'failed' }
    }
    const data: { ok: boolean; status?: string; paymentIntentId?: string } = await response.json()
    if (!data.ok) return { status: 'failed' }
    // Stripe statuses: 'succeeded' | 'requires_action' | 'processing' | ...
    // We only treat `succeeded` as captured · everything else is failed
    // (the demo doesn't render the 3DS challenge UI yet).
    return {
      status: data.status === 'succeeded' ? 'captured' : 'failed',
      paymentIntentId: data.paymentIntentId,
    }
  } catch {
    // Network outage · fall back to the deterministic mock so the demo
    // still completes end-to-end (and unit tests stay hermetic).
    return mockConfirm(input.stripePaymentMethodId!)
  }
}

/**
 * Deterministic stand-in for the server-side Stripe confirm. Used in tests
 * (no `fetch` polyfill) and as a graceful-degradation path when the function
 * URL is unreachable. Mints a synthetic `pi_xxx` so downstream consumers
 * (receipts, ledger entries) get a populated identifier in either path.
 */
async function mockConfirm(stripePaymentMethodId: string): Promise<{ status: 'captured' | 'failed'; paymentIntentId?: string }> {
  const status = await simulateBackendConfirm(stripePaymentMethodId)
  return {
    status,
    paymentIntentId: status === 'captured' ? `pi_${Math.random().toString(36).slice(2, 12)}` : undefined,
  }
}

function cryptoUuid(): string {
  // Browser crypto when available, else a non-cryptographic fallback.
  // The Idempotency-Key only needs to be unique-per-request to Stripe.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Mock of the server-side step that `confirm`s a payment intent.
 *
 * Real backend (Node / Express example):
 *
 *   import Stripe from 'stripe'
 *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
 *
 *   app.post('/api/payment-intents', requireAuth, async (req, res) => {
 *     const { amountCad, stripePaymentMethodId, ref } = req.body
 *     try {
 *       const intent = await stripe.paymentIntents.create({
 *         amount: Math.round(amountCad * 100),
 *         currency: 'usd',
 *         payment_method: stripePaymentMethodId,
 *         confirmation_method: 'automatic',
 *         confirm: true,
 *         metadata: { ref, actor: req.user.id },
 *       })
 *       res.json({ status: intent.status, id: intent.id })
 *     } catch (err) {
 *       res.status(402).json({ error: err.message })
 *     }
 *   })
 *
 * The webhook endpoint at /api/stripe/webhook then confirms async settlement.
 */
async function simulateBackendConfirm(stripePaymentMethodId: string): Promise<'captured' | 'failed'> {
  // Mimic test-card behaviour:
  // - 9995 PAN family → declined
  // - Otherwise capture
  // The pm_xxx ID format from Stripe doesn't reveal the PAN, so this is just a deterministic stub.
  if (!stripePaymentMethodId.startsWith('pm_')) return 'failed'
  return 'captured'
}

/* ------------------------------------------------------------------ */
/* Reports / dashboards                                               */
/* ------------------------------------------------------------------ */

export const reports = {
  async revenue30d() { return delay(REVENUE_30D) },
  async countryPerformance() { return delay(COUNTRY_PERFORMANCE) },
}

/* ------------------------------------------------------------------ */
/* Booking (public)                                                   */
/* ------------------------------------------------------------------ */

export const booking = {
  async searchHotels(/* opts */) { return delay(SEARCH_RESULTS_HOTELS) },
  async searchCars(/* opts */)   { return delay(SEARCH_RESULTS_CARS) },
  async createBooking(input: { propertyId?: string; vehicleId?: string; checkIn: string; checkOut: string; amountCad: number }) {
    const id = `FRG-2026-${Math.floor(Math.random() * 9000 + 1000)}`
    const record = { id, ...input, createdAt: new Date().toISOString() }
    const log = getCached<typeof record[]>('flow-os.bookings', [])
    setCached('flow-os.bookings', [record, ...log])
    return delay(record, 200)
  },
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const notifications = {
  async list() { return delay(NOTIFICATIONS) },
}

/* ------------------------------------------------------------------ */
/* Rewards                                                            */
/* ------------------------------------------------------------------ */

const REWARDS_KEYS = {
  members: 'flow-os.rewards.members',
  tx: 'flow-os.rewards.tx',
  disputes: 'flow-os.rewards.disputes',
  partnerships: 'flow-os.rewards.partnerships',
  audit: 'flow-os.rewards.audit',
  tiers: 'flow-os.rewards.tiers',
}

function appendAudit(entry: Omit<RewardsAuditEntry, 'id' | 'ts'>): RewardsAuditEntry {
  const log = getCached<RewardsAuditEntry[]>(REWARDS_KEYS.audit, REWARDS_AUDIT)
  const audit: RewardsAuditEntry = {
    id: `a-${Date.now().toString(36)}`,
    ts: new Date().toISOString(),
    ...entry,
  }
  setCached(REWARDS_KEYS.audit, [audit, ...log])
  return audit
}

export interface PointsAdjustInput {
  memberId: string
  delta: number
  reason: string
  staff: string
  reference?: string
  disputeId?: string
}

export const rewards = {
  /* ---- Members ---- */
  async listMembers(opts?: { tier?: RewardsTier; q?: string; frozenOnly?: boolean }): Promise<RewardsMember[]> {
    let rows = getCached<RewardsMember[]>(REWARDS_KEYS.members, REWARDS_MEMBERS)
    if (opts?.tier) rows = rows.filter((m) => m.tier === opts.tier)
    if (opts?.frozenOnly) rows = rows.filter((m) => m.frozen)
    if (opts?.q?.trim()) {
      const n = opts.q.toLowerCase()
      rows = rows.filter((m) => m.name.toLowerCase().includes(n) || m.email.toLowerCase().includes(n))
    }
    return delay(rows)
  },
  async getMember(id: string): Promise<RewardsMember | null> {
    const all = getCached<RewardsMember[]>(REWARDS_KEYS.members, REWARDS_MEMBERS)
    return delay(all.find((m) => m.id === id) ?? null)
  },

  /* ---- Points adjustment ---- */
  async adjustPoints(input: PointsAdjustInput): Promise<RewardsTransaction> {
    const members = getCached<RewardsMember[]>(REWARDS_KEYS.members, REWARDS_MEMBERS)
    const member = members.find((m) => m.id === input.memberId)
    if (!member) throw new Error(`Member not found: ${input.memberId}`)
    if (member.frozen) throw new Error('Cannot adjust points · member is frozen')

    const tx: RewardsTransaction = {
      id: `tx-${Date.now().toString(36)}`,
      memberId: input.memberId,
      date: new Date().toISOString().split('T')[0],
      type: 'adjust',
      delta: input.delta,
      reason: input.reason,
      staff: input.staff,
      reference: input.reference,
      disputeId: input.disputeId,
    }

    const log = getCached<RewardsTransaction[]>(REWARDS_KEYS.tx, REWARDS_TRANSACTIONS)
    setCached(REWARDS_KEYS.tx, [tx, ...log])

    // Update member points
    setCached(REWARDS_KEYS.members, members.map((m) => m.id === input.memberId
      ? {
        ...m,
        points: Math.max(0, m.points + input.delta),
        lifetimeEarned: input.delta > 0 ? m.lifetimeEarned + input.delta : m.lifetimeEarned,
        lifetimeBurned: input.delta < 0 ? m.lifetimeBurned + Math.abs(input.delta) : m.lifetimeBurned,
        lastActivity: tx.date,
      }
      : m
    ))

    appendAudit({
      staff: input.staff,
      action: 'adjust_points',
      memberId: member.id,
      memberName: member.name,
      details: input.reason,
      delta: input.delta,
    })
    return delay(tx, 150)
  },

  /* ---- Transactions ---- */
  async listTransactions(memberId?: string): Promise<RewardsTransaction[]> {
    let rows = getCached<RewardsTransaction[]>(REWARDS_KEYS.tx, REWARDS_TRANSACTIONS)
    if (memberId) rows = rows.filter((t) => t.memberId === memberId)
    return delay(rows)
  },

  /* ---- Tier ---- */
  async setTier(memberId: string, tier: RewardsTier, staff: string, reason: string): Promise<RewardsMember | null> {
    const members = getCached<RewardsMember[]>(REWARDS_KEYS.members, REWARDS_MEMBERS)
    const member = members.find((m) => m.id === memberId)
    if (!member) return delay(null)
    const next = members.map((m) => m.id === memberId ? { ...m, tier } : m)
    setCached(REWARDS_KEYS.members, next)
    appendAudit({
      staff, action: 'set_tier', memberId, memberName: member.name,
      details: `Tier overridden to ${tier} · ${reason}`,
    })
    return delay(next.find((m) => m.id === memberId) ?? null)
  },

  /* ---- Freeze / unfreeze ---- */
  async setFrozen(memberId: string, frozen: boolean, staff: string, reason: string): Promise<RewardsMember | null> {
    const members = getCached<RewardsMember[]>(REWARDS_KEYS.members, REWARDS_MEMBERS)
    const member = members.find((m) => m.id === memberId)
    if (!member) return delay(null)
    const next = members.map((m) => m.id === memberId ? { ...m, frozen } : m)
    setCached(REWARDS_KEYS.members, next)
    appendAudit({
      staff, action: frozen ? 'freeze_member' : 'unfreeze_member',
      memberId, memberName: member.name, details: reason,
    })
    return delay(next.find((m) => m.id === memberId) ?? null)
  },

  /* ---- Disputes ---- */
  async listDisputes(opts?: { status?: DisputeStatus }): Promise<RewardsDispute[]> {
    let rows = getCached<RewardsDispute[]>(REWARDS_KEYS.disputes, REWARDS_DISPUTES)
    if (opts?.status) rows = rows.filter((d) => d.status === opts.status)
    return delay(rows)
  },
  async approveDispute(id: string, staff: string, awardedPoints: number, resolution: string): Promise<RewardsDispute | null> {
    const all = getCached<RewardsDispute[]>(REWARDS_KEYS.disputes, REWARDS_DISPUTES)
    const dispute = all.find((d) => d.id === id)
    if (!dispute) return delay(null)
    const next = all.map((d) => d.id === id ? {
      ...d, status: 'approved' as const,
      resolvedAt: new Date().toISOString().split('T')[0],
      awardedPoints, resolution,
    } : d)
    setCached(REWARDS_KEYS.disputes, next)

    // Auto-credit the awarded points to the member
    if (awardedPoints > 0) {
      await rewards.adjustPoints({
        memberId: dispute.memberId,
        delta: awardedPoints,
        reason: `Dispute ${id} approved · ${resolution}`,
        staff,
        reference: dispute.reference,
        disputeId: id,
      })
    }
    appendAudit({
      staff, action: 'approve_dispute',
      memberId: dispute.memberId, memberName: dispute.memberName,
      details: `Resolved ${id} · ${awardedPoints} pts · ${resolution}`,
      delta: awardedPoints,
    })
    return delay(next.find((d) => d.id === id) ?? null)
  },
  async rejectDispute(id: string, staff: string, resolution: string): Promise<RewardsDispute | null> {
    const all = getCached<RewardsDispute[]>(REWARDS_KEYS.disputes, REWARDS_DISPUTES)
    const dispute = all.find((d) => d.id === id)
    if (!dispute) return delay(null)
    const next = all.map((d) => d.id === id ? {
      ...d, status: 'rejected' as const,
      resolvedAt: new Date().toISOString().split('T')[0],
      resolution,
    } : d)
    setCached(REWARDS_KEYS.disputes, next)
    appendAudit({
      staff, action: 'reject_dispute',
      memberId: dispute.memberId, memberName: dispute.memberName,
      details: `Rejected ${id} · ${resolution}`,
    })
    return delay(next.find((d) => d.id === id) ?? null)
  },
  async setDisputeStatus(id: string, status: DisputeStatus): Promise<RewardsDispute | null> {
    const all = getCached<RewardsDispute[]>(REWARDS_KEYS.disputes, REWARDS_DISPUTES)
    const next = all.map((d) => d.id === id ? { ...d, status } : d)
    setCached(REWARDS_KEYS.disputes, next)
    return delay(next.find((d) => d.id === id) ?? null)
  },

  /* ---- Partnerships ---- */
  async listPartnerships(): Promise<RewardsPartnership[]> {
    return delay(getCached<RewardsPartnership[]>(REWARDS_KEYS.partnerships, REWARDS_PARTNERSHIPS))
  },
  async reconcilePartnership(id: string, staff: string): Promise<RewardsPartnership | null> {
    const all = getCached<RewardsPartnership[]>(REWARDS_KEYS.partnerships, REWARDS_PARTNERSHIPS)
    const partnership = all.find((p) => p.id === id)
    if (!partnership) return delay(null)
    const next = all.map((p) => p.id === id ? {
      ...p,
      flowPoints: p.partnerPoints,
      delta: 0,
      status: 'settled' as const,
      lastReconciledAt: new Date().toISOString().split('T')[0],
    } : p)
    setCached(REWARDS_KEYS.partnerships, next)
    appendAudit({
      staff, action: 'reconcile_partnership',
      details: `Reconciled ${partnership.partnerName} cycle ${partnership.cycleLabel} (delta was ${partnership.delta})`,
    })
    return delay(next.find((p) => p.id === id) ?? null)
  },

  /* ---- Audit ---- */
  async listAudit(opts?: { limit?: number; staff?: string }): Promise<RewardsAuditEntry[]> {
    let rows = getCached<RewardsAuditEntry[]>(REWARDS_KEYS.audit, REWARDS_AUDIT)
    if (opts?.staff) rows = rows.filter((a) => a.staff === opts.staff)
    if (opts?.limit) rows = rows.slice(0, opts.limit)
    return delay(rows)
  },

  /* ---- Tier configuration ---- */
  async listTiers(): Promise<RewardsTierConfig[]> {
    return delay(getCached<RewardsTierConfig[]>(REWARDS_KEYS.tiers, REWARDS_TIERS))
  },
  async updateTier(tier: RewardsTier, patch: Partial<RewardsTierConfig>, staff: string): Promise<RewardsTierConfig | null> {
    const all = getCached<RewardsTierConfig[]>(REWARDS_KEYS.tiers, REWARDS_TIERS)
    const next = all.map((t) => t.tier === tier ? { ...t, ...patch, tier } : t)
    setCached(REWARDS_KEYS.tiers, next)
    appendAudit({
      staff, action: 'set_tier_thresholds',
      details: `Updated ${tier} thresholds · ${Object.entries(patch).map(([k, v]) => `${k}=${v}`).join(' · ')}`,
    })
    return delay(next.find((t) => t.tier === tier) ?? null)
  },
}

/* ------------------------------------------------------------------ */
/* Inventory                                                          */
/* ------------------------------------------------------------------ */

export const inventory = {
  async list(opts?: { propertyId?: string; lowStockOnly?: boolean }): Promise<InventoryItem[]> {
    let rows = getCached<InventoryItem[]>('flow-os.inventory', INVENTORY)
    if (opts?.propertyId) rows = rows.filter((i) => i.propertyId === opts.propertyId)
    if (opts?.lowStockOnly) rows = rows.filter((i) => i.currentStock <= i.reorderPoint)
    return delay(rows)
  },
  async adjustStock(itemId: string, delta: number): Promise<InventoryItem | null> {
    const cur = getCached<InventoryItem[]>('flow-os.inventory', INVENTORY)
    const next = cur.map((i) => i.id === itemId ? { ...i, currentStock: Math.max(0, i.currentStock + delta) } : i)
    setCached('flow-os.inventory', next)
    return delay(next.find((i) => i.id === itemId) ?? null)
  },
  async listSuppliers(): Promise<Supplier[]> {
    return delay(getCached<Supplier[]>('flow-os.suppliers', SUPPLIERS))
  },
}

/* ------------------------------------------------------------------ */
/* Procurement (purchase orders)                                      */
/* ------------------------------------------------------------------ */

export interface POCreateInput {
  propertyId: string
  supplierId: string
  supplierName: string
  lines: Array<{ itemId: string; itemName: string; qty: number; unit: string; unitCostCad: number }>
  expectedAt?: string
  notes?: string
}

export const procurement = {
  async list(opts?: { propertyId?: string; status?: PurchaseOrderStatus }): Promise<PurchaseOrder[]> {
    let rows = getCached<PurchaseOrder[]>('flow-os.pos', PURCHASE_ORDERS)
    if (opts?.propertyId) rows = rows.filter((o) => o.propertyId === opts.propertyId)
    if (opts?.status) rows = rows.filter((o) => o.status === opts.status)
    return delay(rows)
  },
  async create(input: POCreateInput): Promise<PurchaseOrder> {
    const cur = getCached<PurchaseOrder[]>('flow-os.pos', PURCHASE_ORDERS)
    const id = `PO-2026-${(cur.length + 100).toString().padStart(4, '0')}`
    const totalCad = input.lines.reduce((s, l) => s + l.qty * l.unitCostCad, 0)
    const order: PurchaseOrder = {
      id,
      propertyId: input.propertyId,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      status: 'submitted',
      lines: input.lines as PurchaseOrderLine[],
      totalCad,
      createdAt: new Date().toISOString().split('T')[0],
      expectedAt: input.expectedAt,
      notes: input.notes,
    }
    setCached('flow-os.pos', [order, ...cur])
    return delay(order, 200)
  },
  /**
   * One-click reorder: takes an InventoryItem (typically low-stock),
   * builds a single-line PO at the recommended reorder quantity.
   */
  async reorder(item: InventoryItem, qtyOverride?: number): Promise<PurchaseOrder> {
    const suppliers = await inventory.listSuppliers()
    const supplier = suppliers.find((s) => s.id === item.supplierId)
    const qty = qtyOverride ?? item.reorderQty
    return procurement.create({
      propertyId: item.propertyId,
      supplierId: item.supplierId,
      supplierName: supplier?.name ?? 'Unknown supplier',
      lines: [{
        itemId: item.id, itemName: item.name, qty,
        unit: item.unit, unitCostCad: item.unitCostCad,
      }],
      expectedAt: supplier ? new Date(Date.now() + supplier.leadDays * 86400_000).toISOString().split('T')[0] : undefined,
      notes: 'Auto-generated · one-click reorder',
    })
  },
  async setStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder | null> {
    const cur = getCached<PurchaseOrder[]>('flow-os.pos', PURCHASE_ORDERS)
    const next = cur.map((o) => o.id === id ? { ...o, status } : o)
    setCached('flow-os.pos', next)
    // If marking as received, increment stock for each line item
    if (status === 'received') {
      const order = next.find((o) => o.id === id)
      if (order) {
        const inv = getCached<InventoryItem[]>('flow-os.inventory', INVENTORY)
        const updated = inv.map((i) => {
          const line = order.lines.find((l) => l.itemId === i.id)
          return line ? { ...i, currentStock: i.currentStock + line.qty, lastReceived: order.expectedAt ?? new Date().toISOString().split('T')[0] } : i
        })
        setCached('flow-os.inventory', updated)
      }
    }
    return delay(next.find((o) => o.id === id) ?? null)
  },
}

/* ------------------------------------------------------------------ */
/* Messaging + document sharing                                       */
/* ------------------------------------------------------------------ */

const MSG_KEYS = {
  conversations: 'flow-os.conversations',
  messages: 'flow-os.messages',
}

/** Participants don't mutate in the demo · sourced straight from sample data. */
function allParticipants(): Participant[] { return PARTICIPANTS }

export interface SendInput {
  conversationId: string
  fromId: string
  body: string
  attachments?: Attachment[]
}

export interface NewConversationInput {
  title: string
  participantIds: string[]
  context?: ConversationContext
  /** Optional opening message body */
  body?: string
  fromId?: string
  attachments?: Attachment[]
}

export const messages = {
  /** All participants in the directory (staff, partners, guests, system). */
  async listParticipants(): Promise<Participant[]> {
    return delay(allParticipants())
  },

  async getParticipant(id: string): Promise<Participant | null> {
    return delay(allParticipants().find((p) => p.id === id) ?? null)
  },

  /**
   * Conversations a participant can see.
   *
   * Scoping rules:
   * - SuperAdmin (u-1, u-2): everything (compliance / admin role)
   * - Anyone else: only conversations they're a member of
   * - Guest user (`m-*`): same rule — only their own threads
   *
   * Filtering by `q` (free-text) and `context.type` is optional.
   */
  async listConversations(opts: {
    participantId: string
    q?: string
    contextType?: ConversationContext['type']
    includeArchived?: boolean
  }): Promise<Conversation[]> {
    const me = allParticipants().find((p) => p.id === opts.participantId)
    const isAdmin = me?.role === 'superadmin'
    let rows = getCached<Conversation[]>(MSG_KEYS.conversations, CONVERSATIONS)

    if (!isAdmin) {
      rows = rows.filter((c) => c.participantIds.includes(opts.participantId))
    }
    if (!opts.includeArchived) rows = rows.filter((c) => !c.archived)
    if (opts.contextType) rows = rows.filter((c) => c.context?.type === opts.contextType)
    if (opts.q?.trim()) {
      const n = opts.q.toLowerCase()
      rows = rows.filter((c) =>
        c.title.toLowerCase().includes(n) ||
        c.lastMessagePreview.toLowerCase().includes(n)
      )
    }
    // Pinned first, then by lastMessageAt desc
    rows.sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
    return delay(rows)
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const all = getCached<Conversation[]>(MSG_KEYS.conversations, CONVERSATIONS)
    return delay(all.find((c) => c.id === id) ?? null)
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    const all = getCached<Message[]>(MSG_KEYS.messages, MESSAGES)
    const rows = all.filter((m) => m.conversationId === conversationId)
    rows.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    return delay(rows)
  },

  async send(input: SendInput): Promise<Message> {
    const convs = getCached<Conversation[]>(MSG_KEYS.conversations, CONVERSATIONS)
    const conv = convs.find((c) => c.id === input.conversationId)
    if (!conv) throw new Error(`Conversation not found: ${input.conversationId}`)
    if (!conv.participantIds.includes(input.fromId)) {
      throw new Error(`${input.fromId} is not a participant in ${conv.id}`)
    }
    if (!input.body.trim() && !(input.attachments && input.attachments.length)) {
      throw new Error('Message must have a body or at least one attachment')
    }

    const now = new Date().toISOString()
    const msg: Message = {
      id: `msg-${Date.now().toString(36)}`,
      conversationId: input.conversationId,
      fromId: input.fromId,
      body: input.body,
      sentAt: now,
      readBy: [input.fromId],
      attachments: input.attachments,
    }
    const msgs = getCached<Message[]>(MSG_KEYS.messages, MESSAGES)
    setCached(MSG_KEYS.messages, [...msgs, msg])

    // Update conversation: preview, lastMessageAt, unread for everyone else
    const nextConvs = convs.map((c) => c.id === input.conversationId ? {
      ...c,
      lastMessageAt: now,
      lastMessagePreview: input.body || `Sent ${input.attachments?.length ?? 0} attachment(s)`,
      unread: c.participantIds.reduce((acc, pid) => {
        acc[pid] = pid === input.fromId ? 0 : (c.unread[pid] ?? 0) + 1
        return acc
      }, {} as Record<string, number>),
    } : c)
    setCached(MSG_KEYS.conversations, nextConvs)
    return delay(msg, 80)
  },

  async markRead(conversationId: string, participantId: string): Promise<Conversation | null> {
    const convs = getCached<Conversation[]>(MSG_KEYS.conversations, CONVERSATIONS)
    const next = convs.map((c) => c.id === conversationId ? {
      ...c,
      unread: { ...c.unread, [participantId]: 0 },
    } : c)
    setCached(MSG_KEYS.conversations, next)

    // Also stamp readBy on every message in the thread
    const msgs = getCached<Message[]>(MSG_KEYS.messages, MESSAGES)
    const nextMsgs = msgs.map((m) =>
      m.conversationId === conversationId && !m.readBy.includes(participantId)
        ? { ...m, readBy: [...m.readBy, participantId] }
        : m
    )
    setCached(MSG_KEYS.messages, nextMsgs)
    return delay(next.find((c) => c.id === conversationId) ?? null)
  },

  async createConversation(input: NewConversationInput): Promise<Conversation> {
    const convs = getCached<Conversation[]>(MSG_KEYS.conversations, CONVERSATIONS)
    const id = `c-${Date.now().toString(36)}`
    const now = new Date().toISOString()
    const conv: Conversation = {
      id,
      title: input.title,
      participantIds: input.participantIds,
      context: input.context,
      lastMessageAt: now,
      lastMessagePreview: input.body ?? 'New conversation',
      unread: input.participantIds.reduce((acc, pid) => {
        acc[pid] = pid === input.fromId ? 0 : 0
        return acc
      }, {} as Record<string, number>),
    }
    setCached(MSG_KEYS.conversations, [conv, ...convs])

    if (input.body && input.fromId) {
      await messages.send({
        conversationId: id,
        fromId: input.fromId,
        body: input.body,
        attachments: input.attachments,
      })
    }
    return delay(conv)
  },

  /** Total unread across all visible conversations · used for the nav badge */
  async unreadCount(participantId: string): Promise<number> {
    const convs = await messages.listConversations({ participantId })
    return convs.reduce((s, c) => s + (c.unread[participantId] ?? 0), 0)
  },
}

/* ------------------------------------------------------------------ */
/* Documents (lightweight wrapper around message attachments)         */
/* ------------------------------------------------------------------ */

export const documents = {
  /**
   * Mock upload. In production this returns a presigned S3 / R2 URL after
   * scanning the file with ClamAV or similar. The frontend never sees the
   * S3 credentials.
   *
   * Files are NOT persisted in the demo — only metadata is captured. To
   * persist the bytes for round-trip download, swap to a Blob + data URL
   * approach (acceptable for files under 5MB; localStorage cap is ~5MB).
   */
  async upload(file: File, uploadedBy: string): Promise<Attachment> {
    const a: Attachment = {
      id: `att-${Date.now().toString(36)}`,
      filename: file.name,
      mime: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    }
    return delay(a, 150)
  },

  /**
   * List every attachment across every conversation the participant can see.
   * Useful for a "Files I can see" library view.
   */
  async listForParticipant(participantId: string): Promise<Array<Attachment & { conversationId: string; conversationTitle: string }>> {
    const convs = await messages.listConversations({ participantId })
    const msgs = getCached<Message[]>(MSG_KEYS.messages, MESSAGES)
    const out: Array<Attachment & { conversationId: string; conversationTitle: string }> = []
    for (const c of convs) {
      for (const m of msgs.filter((x) => x.conversationId === c.id && x.attachments?.length)) {
        for (const a of m.attachments!) {
          out.push({ ...a, conversationId: c.id, conversationTitle: c.title })
        }
      }
    }
    out.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    return delay(out)
  },
}
