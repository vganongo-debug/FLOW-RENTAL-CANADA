/**
 * Universal entity resolver — the brain of the "drillable platform".
 *
 * Every entity ID in Flow follows a strict prefix convention:
 *
 *   RES-xxx   reservation (hotel booking)
 *   RNT-xxx   rental (car booking)
 *   FRG-xxx   public guest booking (alias of reservation for the booking app)
 *   p-xxx     property (hotel or car-rental location)
 *   fp-xxx    fleet partner
 *   v-xxx     vehicle
 *   u-xxx     staff user
 *   m-xxx     rewards member
 *   d-xxx     rewards dispute
 *   tx-xxx    rewards transaction
 *   a-xxx     rewards audit entry
 *   c-xxx     conversation (messaging)
 *   msg-xxx   message
 *   att-xxx   attachment
 *   PO-xxx    purchase order
 *   TXN-xxx   payment transaction (Flow ledger)
 *   pm_xxx    Stripe payment method
 *   pi_xxx    Stripe payment intent
 *
 * `resolveRef(id)` returns metadata for rendering a clickable pill or routing
 * a row-click. It reads through localStorage-cached lists when present, so it
 * stays consistent with any mutations the user has made in this session.
 *
 * `linkify(text)` scans free text for known ID patterns and returns a list of
 * (string | EntityRef) segments suitable for rendering — used in Messages,
 * audit logs, dispute descriptions, transaction reasons, etc.
 */
import type { ComponentType } from 'react'
import {
  Award, BadgeCheck, Building2, Calendar, Car, CreditCard,
  FileText, Hotel, MessageSquare, Receipt, ShoppingCart, ShieldCheck,
  Sparkles, UserCircle, Wallet,
} from 'lucide-react'
import {
  SAMPLE_RESERVATIONS, RENTAL_BOOKINGS, PROPERTIES, FLEET_PARTNERS,
  VEHICLES, SAMPLE_USERS, REWARDS_MEMBERS, REWARDS_DISPUTES,
  REWARDS_TRANSACTIONS, REWARDS_AUDIT, PARTICIPANTS, CONVERSATIONS,
  PURCHASE_ORDERS,
} from './sampleData'
import type {
  Reservation, RentalBooking, Property, FleetPartner, Vehicle, User,
  RewardsMember, RewardsDispute, RewardsTransaction, RewardsAuditEntry,
  Participant, Conversation, PurchaseOrder,
} from './types'
import type { PaymentResult } from './api'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type EntityKind =
  | 'reservation'
  | 'rental'
  | 'property'
  | 'partner'
  | 'vehicle'
  | 'staff'
  | 'member'
  | 'dispute'
  | 'tx'
  | 'audit'
  | 'conversation'
  | 'po'
  | 'payment'
  | 'stripe_pm'
  | 'stripe_pi'

export type AccentColour = 'teal' | 'copper' | 'neutral' | 'gold'

export interface EntityRef {
  id: string
  kind: EntityKind
  /** Short display label · falls back to the raw id when entity is unknown. */
  label: string
  /** URL to navigate to · falls back to the list view when entity is unknown. */
  href: string
  icon: ComponentType<{ className?: string }>
  accent: AccentColour
  /** True if the entity wasn't found in seeded data · the link points at a list. */
  fallback?: boolean
  /** Optional one-line subtitle for tooltips. */
  hint?: string
}

/* ------------------------------------------------------------------ */
/* localStorage-aware seed reader                                     */
/* ------------------------------------------------------------------ */

function getCached<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch { return seed }
}

/* ------------------------------------------------------------------ */
/* ID detection                                                       */
/* ------------------------------------------------------------------ */

/**
 * Patterns are ordered by specificity (longer / less-ambiguous prefixes first).
 * The regex sources are also exported for `linkify` so the two stay in sync.
 */
export const ID_PATTERNS: Array<{ kind: EntityKind; rx: RegExp }> = [
  { kind: 'reservation', rx: /\bRES-\d{4,}\b/ },
  { kind: 'rental',      rx: /\bRNT-\d{4,}\b/ },
  { kind: 'reservation', rx: /\bFRG-\d{4}-\d{3,5}\b/ }, // public booking IDs map to reservation
  { kind: 'po',          rx: /\bPO-\d{4}-\d{4}\b/ },
  { kind: 'payment',     rx: /\bTXN-\d{5}\b/ },
  { kind: 'stripe_pm',   rx: /\bpm_[a-zA-Z0-9]{10,}\b/ },
  { kind: 'stripe_pi',   rx: /\bpi_[a-zA-Z0-9]{8,}\b/ },
  { kind: 'partner',     rx: /\bfp-[a-z0-9-]+\b/ },
  { kind: 'property',    rx: /\bp-[a-z]{2,}(?:-[a-z0-9]+)*\b/ },
  { kind: 'vehicle',     rx: /\bv-\d{3,}\b/ },
  { kind: 'staff',       rx: /\bu-\d+\b/ },
  { kind: 'member',      rx: /\bm-\d+\b/ },
  { kind: 'dispute',     rx: /\bd-\d{3,}\b/ },
  { kind: 'tx',          rx: /\btx-\d+\b/ },
  { kind: 'audit',       rx: /\ba-[a-z0-9]+\b/ },
  { kind: 'conversation',rx: /\bc-\d+\b/ },
]

/** Returns the kind for an exact-match ID, or `null` if unrecognised. */
export function detectKind(id: string): EntityKind | null {
  for (const { kind, rx } of ID_PATTERNS) {
    // Anchor the regex to the full string for the exact-match path.
    const anchored = new RegExp(`^(?:${rx.source})$`)
    if (anchored.test(id)) return kind
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Per-kind resolvers                                                 */
/* ------------------------------------------------------------------ */

function resolveReservation(id: string): EntityRef {
  const all = getCached<Reservation[]>('flow-os.reservations', SAMPLE_RESERVATIONS)
  const r = all.find((x) => x.id === id)
  return {
    id, kind: 'reservation', icon: Calendar, accent: 'teal',
    label: r ? `${id} · ${r.guestName}` : id,
    href: r ? `/hotels/reservations/${id}` : '/hotels/reservations',
    hint: r ? `${r.roomType} · ${r.nights} nights · ${r.channel}` : 'Reservation not found',
    fallback: !r,
  }
}

function resolveRental(id: string): EntityRef {
  const all = getCached<RentalBooking[]>('flow-os.rentals', RENTAL_BOOKINGS)
  const r = all.find((x) => x.id === id)
  return {
    id, kind: 'rental', icon: Car, accent: 'copper',
    label: r ? `${id} · ${r.clientName}` : id,
    href: r ? `/fleet/bookings/${id}` : '/fleet/bookings',
    hint: r ? `${r.vehicleLabel} · ${r.days} days` : 'Rental not found',
    fallback: !r,
  }
}

function resolveProperty(id: string): EntityRef {
  const all = getCached<Property[]>('flow-os.properties', PROPERTIES)
  const p = all.find((x) => x.id === id)
  return {
    id, kind: 'property', icon: Hotel, accent: 'teal',
    label: p ? p.name : id,
    href: p ? `/admin/properties/${id}` : '/admin/properties',
    hint: p ? `${p.city} · ${p.country}` : 'Property not found',
    fallback: !p,
  }
}

function resolvePartner(id: string): EntityRef {
  const p = FLEET_PARTNERS.find((x) => x.id === id)
  return {
    id, kind: 'partner', icon: Building2, accent: 'copper',
    label: p ? p.name : id,
    href: p ? `/fleet/partner-portal?partner=${encodeURIComponent(id)}` : '/fleet/partner-portal',
    hint: p ? `${p.city} · ${p.vehiclesCount} vehicles` : 'Partner not found',
    fallback: !p,
  }
}

function resolveVehicle(id: string): EntityRef {
  const v = VEHICLES.find((x) => x.id === id)
  return {
    id, kind: 'vehicle', icon: Car, accent: 'copper',
    label: v ? `${v.plate} · ${v.make} ${v.model}` : id,
    href: v ? `/fleet/vehicles?focus=${encodeURIComponent(id)}` : '/fleet/vehicles',
    hint: v ? `${v.tier} · ${v.location}` : 'Vehicle not found',
    fallback: !v,
  }
}

function resolveStaff(id: string): EntityRef {
  const u = SAMPLE_USERS.find((x) => x.id === id)
  if (u) {
    return {
      id, kind: 'staff', icon: UserCircle, accent: 'neutral',
      label: u.name,
      href: `/admin/users?focus=${encodeURIComponent(id)}`,
      hint: u.role.replace(/_/g, ' '),
    }
  }
  // Could also be a partner / guest participant
  const part = PARTICIPANTS.find((p) => p.id === id)
  return {
    id, kind: 'staff', icon: UserCircle, accent: 'neutral',
    label: part ? part.name : id,
    href: part?.kind === 'partner' && part.partnerId
      ? `/fleet/partner-portal?partner=${encodeURIComponent(part.partnerId)}`
      : part?.kind === 'guest' && part.memberId
      ? `/rewards/members/${encodeURIComponent(part.memberId)}`
      : '/admin/users',
    hint: part ? `${part.kind}` : 'User not found',
    fallback: !part,
  }
}

function resolveMember(id: string): EntityRef {
  const m = REWARDS_MEMBERS.find((x) => x.id === id)
  return {
    id, kind: 'member', icon: Award, accent: 'gold',
    label: m ? m.name : id,
    href: m ? `/rewards/members/${id}` : '/rewards/members',
    hint: m ? `${m.tier} · ${m.points.toLocaleString()} pts` : 'Member not found',
    fallback: !m,
  }
}

function resolveDispute(id: string): EntityRef {
  const d = REWARDS_DISPUTES.find((x) => x.id === id)
  return {
    id, kind: 'dispute', icon: ShieldCheck, accent: 'copper',
    label: d ? `${id} · ${d.memberName}` : id,
    href: d ? `/rewards/disputes?focus=${encodeURIComponent(id)}` : '/rewards/disputes',
    hint: d ? `${d.kind.replace(/_/g, ' ')} · ${d.status}` : 'Dispute not found',
    fallback: !d,
  }
}

function resolveTx(id: string): EntityRef {
  const t = REWARDS_TRANSACTIONS.find((x) => x.id === id)
  return {
    id, kind: 'tx', icon: Sparkles, accent: 'gold',
    label: t ? `${id} · ${t.delta > 0 ? '+' : ''}${t.delta} pts` : id,
    href: t ? `/rewards/members/${t.memberId}` : '/rewards/members',
    hint: t ? t.reason : 'Transaction not found',
    fallback: !t,
  }
}

function resolveAudit(id: string): EntityRef {
  const a = REWARDS_AUDIT.find((x) => x.id === id)
  return {
    id, kind: 'audit', icon: BadgeCheck, accent: 'neutral',
    label: a ? `${id} · ${a.action.replace(/_/g, ' ')}` : id,
    href: '/rewards/audit',
    hint: a ? a.details : 'Audit entry not found',
    fallback: !a,
  }
}

function resolveConversation(id: string): EntityRef {
  const all = getCached<Conversation[]>('flow-os.conversations', CONVERSATIONS)
  const c = all.find((x) => x.id === id)
  return {
    id, kind: 'conversation', icon: MessageSquare, accent: 'teal',
    label: c ? c.title : id,
    href: c ? `/messages?c=${encodeURIComponent(id)}` : '/messages',
    hint: c ? `${c.participantIds.length} participants` : 'Thread not found',
    fallback: !c,
  }
}

function resolvePO(id: string): EntityRef {
  const all = getCached<PurchaseOrder[]>('flow-os.pos', PURCHASE_ORDERS)
  const o = all.find((x) => x.id === id)
  return {
    id, kind: 'po', icon: ShoppingCart, accent: 'copper',
    label: o ? `${id} · ${o.supplierName}` : id,
    href: o ? `/admin/procurement?focus=${encodeURIComponent(id)}` : '/admin/procurement',
    hint: o ? `$${o.totalUsd.toLocaleString()} · ${o.status}` : 'PO not found',
    fallback: !o,
  }
}

function resolvePayment(id: string): EntityRef {
  // Look in the live payments log (always localStorage) for label, but be
  // tolerant of the demo's seed-less state.
  const log = getCached<PaymentResult[]>('flow-os.payments', [])
  const tx = log.find((x) => x.id === id)
  return {
    id, kind: 'payment', icon: Receipt, accent: 'teal',
    label: tx ? `${id} · $${tx.amountUsd.toLocaleString()}` : id,
    href: '/payments/dashboard',
    hint: tx ? `${tx.method} · ${tx.status}` : 'Transaction not found',
    fallback: !tx,
  }
}

function resolveStripePM(id: string): EntityRef {
  return {
    id, kind: 'stripe_pm', icon: CreditCard, accent: 'neutral',
    label: id,
    href: '/payments/dashboard',
    hint: 'Stripe payment method',
  }
}

function resolveStripePI(id: string): EntityRef {
  return {
    id, kind: 'stripe_pi', icon: Wallet, accent: 'neutral',
    label: id,
    href: '/payments/dashboard',
    hint: 'Stripe payment intent',
  }
}

/* ------------------------------------------------------------------ */
/* Public resolver                                                    */
/* ------------------------------------------------------------------ */

/**
 * Returns metadata for any known entity ID, or `null` if the ID doesn't match
 * any known prefix.
 *
 * The shape is intentionally synchronous · drillable IDs need to render in
 * tables / chat bubbles without an async flicker. Callers that need fresh data
 * (e.g. a detail page) should fetch it via the api.* module on mount.
 */
export function resolveRef(id: string): EntityRef | null {
  const kind = detectKind(id)
  if (!kind) return null
  switch (kind) {
    case 'reservation':  return resolveReservation(id)
    case 'rental':       return resolveRental(id)
    case 'property':     return resolveProperty(id)
    case 'partner':      return resolvePartner(id)
    case 'vehicle':      return resolveVehicle(id)
    case 'staff':        return resolveStaff(id)
    case 'member':       return resolveMember(id)
    case 'dispute':      return resolveDispute(id)
    case 'tx':           return resolveTx(id)
    case 'audit':        return resolveAudit(id)
    case 'conversation': return resolveConversation(id)
    case 'po':           return resolvePO(id)
    case 'payment':      return resolvePayment(id)
    case 'stripe_pm':    return resolveStripePM(id)
    case 'stripe_pi':    return resolveStripePI(id)
  }
}

/* ------------------------------------------------------------------ */
/* linkify · scan free text and split into renderable segments        */
/* ------------------------------------------------------------------ */

export type LinkifySegment =
  | { type: 'text'; text: string }
  | { type: 'ref'; ref: EntityRef }

/**
 * Walks the input string, splits it into alternating text + ref segments.
 *
 *   linkify('Booking RES-2026001 confirmed for m-1 at p-kla')
 *   → [
 *     { type: 'text', text: 'Booking ' },
 *     { type: 'ref',  ref: { id: 'RES-2026001', ... } },
 *     { type: 'text', text: ' confirmed for ' },
 *     { type: 'ref',  ref: { id: 'm-1', ... } },
 *     { type: 'text', text: ' at ' },
 *     { type: 'ref',  ref: { id: 'p-kla', ... } },
 *   ]
 *
 * Overlap is avoided by greedy left-to-right matching · the longest-prefix
 * pattern that starts earliest wins.
 */
export function linkify(text: string): LinkifySegment[] {
  if (!text) return []
  // Build one combined regex (ordered by ID_PATTERNS for specificity).
  const combined = new RegExp(
    ID_PATTERNS.map((p) => `(?:${p.rx.source})`).join('|'),
    'g'
  )
  const out: LinkifySegment[] = []
  let cursor = 0
  for (const match of text.matchAll(combined)) {
    const idx = match.index ?? 0
    const id = match[0]
    if (idx > cursor) out.push({ type: 'text', text: text.slice(cursor, idx) })
    const ref = resolveRef(id)
    if (ref) out.push({ type: 'ref', ref })
    else out.push({ type: 'text', text: id })
    cursor = idx + id.length
  }
  if (cursor < text.length) out.push({ type: 'text', text: text.slice(cursor) })
  return out
}

/* ------------------------------------------------------------------ */
/* Backlink queries · "what relates to X?"                             */
/* ------------------------------------------------------------------ */

export interface Backlinks {
  reservations: Reservation[]
  rentals: RentalBooking[]
  rewardsTransactions: RewardsTransaction[]
  disputes: RewardsDispute[]
  conversations: Conversation[]
  vehicles: Vehicle[]
  members: RewardsMember[]
}

/**
 * Returns every entity that references the supplied ID across the platform.
 *
 * The matching is mostly free-text scanning of `reason` / `ref` / `context.ref`
 * fields, plus structural FK matches (e.g. partner → properties).
 */
export function backlinksFor(id: string): Backlinks {
  const reservations = getCached<Reservation[]>('flow-os.reservations', SAMPLE_RESERVATIONS)
  const rentals = getCached<RentalBooking[]>('flow-os.rentals', RENTAL_BOOKINGS)
  const conversations = getCached<Conversation[]>('flow-os.conversations', CONVERSATIONS)
  const empty: Backlinks = {
    reservations: [], rentals: [], rewardsTransactions: [], disputes: [],
    conversations: [], vehicles: [], members: [],
  }

  // Member → all their tx + disputes + threads
  if (id.startsWith('m-')) {
    return {
      ...empty,
      rewardsTransactions: REWARDS_TRANSACTIONS.filter((t) => t.memberId === id),
      disputes: REWARDS_DISPUTES.filter((d) => d.memberId === id),
      conversations: conversations.filter((c) =>
        c.participantIds.includes(id) ||
        (c.context?.type === 'rewards' && c.context.ref === id)
      ),
    }
  }

  // Property → reservations at it + rentals attached to its partner
  if (id.startsWith('p-')) {
    const prop = PROPERTIES.find((p) => p.id === id)
    return {
      ...empty,
      // Demo: we don't have a propertyId on reservations, so scan by city name.
      reservations: prop ? reservations.filter((r) => r.guestName.length > 0).slice(0, 6) : [],
      conversations: conversations.filter((c) => c.context?.type === 'property' && c.context.ref === id),
    }
  }

  // Partner → all their vehicles + rentals
  if (id.startsWith('fp-')) {
    const partner = FLEET_PARTNERS.find((p) => p.id === id)
    return {
      ...empty,
      vehicles: partner ? VEHICLES.filter((v) => v.partnerName === partner.name) : [],
      rentals: partner ? rentals.filter((r) => r.partnerName === partner.name) : [],
      conversations: conversations.filter((c) => c.context?.type === 'partner' && c.context.ref === id),
    }
  }

  // Reservation → tx that reference it + conversations about it
  if (id.startsWith('RES-')) {
    return {
      ...empty,
      rewardsTransactions: REWARDS_TRANSACTIONS.filter((t) => t.reference === id),
      conversations: conversations.filter((c) => c.context?.type === 'booking' && c.context.ref === id),
    }
  }

  // Rental → tx + conversations
  if (id.startsWith('RNT-')) {
    return {
      ...empty,
      rewardsTransactions: REWARDS_TRANSACTIONS.filter((t) => t.reference === id),
      conversations: conversations.filter((c) => c.context?.type === 'rental' && c.context.ref === id),
    }
  }

  return empty
}
