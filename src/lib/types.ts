import type { ProvinceCode } from './canada'

export type Role =
  | 'superadmin'
  | 'hotel_manager'
  | 'car_agent'
  | 'reward_manager'
  | 'guest'

/**
 * Code de province ou territoire canadien (ISO 3166-2:CA sans le préfixe).
 * Les 13 valeurs valides sont définies dans src/lib/canada.ts.
 */
export type CountryCode = ProvinceCode

/**
 * Devises prises en charge à l'affichage et au règlement.
 *
 * CAD est la devise de référence : tous les montants stockés dans
 * l'application sont en dollars canadiens. USD et EUR sont proposés aux
 * clients internationaux et à la consolidation groupe, via les taux de
 * FX_RATES (src/lib/utils.ts).
 */
export type Currency = 'CAD' | 'USD' | 'EUR'

export type Language = 'EN' | 'FR'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  countryCode?: CountryCode
  propertyId?: string
  partnerId?: string
  avatarInitials: string
}

export type PropertyType = 'hotel' | 'car_rental' | 'both'

export interface Property {
  id: string
  name: string
  type: PropertyType
  city: string
  country: string
  countryCode: CountryCode
  address?: string
  /** GPS as [lat, lng] for the map view */
  gps?: { lat: number; lng: number }
  rooms?: number
  vehicles?: number
  monthlyRevenueCad: number
  ebitdaPct: number
  status: 'live' | 'opening' | 'pilot'
  /** ISO date the property went live (or is scheduled to) */
  goLiveDate?: string
  /** Optional Fleet Partner that owns the car-rental side */
  partnerId?: string
  /** Free-text contact info for the property */
  contactEmail?: string
  contactPhone?: string
}

export type RoomStatus =
  | 'occupied'
  | 'available'
  | 'dirty'
  | 'maintenance'
  | 'out_of_service'

export interface Room {
  number: string
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Executive'
  floor: number
  status: RoomStatus
  guestName?: string
  rateCad: number
}

export type BookingStatus =
  | 'confirmed'
  | 'pending'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export interface Reservation {
  id: string
  guestName: string
  nationality: string
  checkIn: string
  checkOut: string
  nights: number
  roomNumber: string
  roomType: Room['type']
  rateCad: number
  totalCad: number
  channel: 'Booking.com' | 'Expedia' | 'Direct' | 'Flow App' | 'Walk-in'
  status: BookingStatus
  paymentStatus: 'paid' | 'partial' | 'unpaid'
}

export type VehicleTier = 'Flow GO' | 'Flow Drive' | 'Flow Terrain' | 'Flow Prestige' | 'Flow Elite'
export type VehicleOwner = 'flow' | 'partner'
export type VehicleStatus = 'available' | 'on_rent' | 'maintenance' | 'overdue'

export interface Vehicle {
  id: string
  plate: string
  make: string
  model: string
  year: number
  tier: VehicleTier
  owner: VehicleOwner
  partnerName?: string
  location: string
  countryCode: CountryCode
  status: VehicleStatus
  km: number
  lastServiceDate: string
  dailyRateCad: number
  gps: { lat: number; lng: number }
}

export interface RentalBooking {
  id: string
  clientName: string
  vehiclePlate: string
  vehicleLabel: string
  tier: VehicleTier
  pickupLocation: string
  returnLocation: string
  startDate: string
  endDate: string
  days: number
  ratePerDayCad: number
  totalCad: number
  status: BookingStatus
  owner: VehicleOwner
  partnerName?: string
}

export interface FleetPartner {
  id: string
  name: string
  city: string
  country: string
  countryCode: CountryCode
  vehiclesCount: number
  vehiclesActiveOnFlow: number
  weeklyPayoutCad: number
  pendingPayoutCad: number
  commissionPct: number
}

/* ---------------------------------------------------------------- */
/* Inventory & procurement                                          */
/* ---------------------------------------------------------------- */

export type InventoryCategory =
  | 'linens' | 'toiletries' | 'cleaning' | 'fnb' | 'office'
  | 'maintenance' | 'branded' | 'vehicle_consumables'

export interface InventoryItem {
  id: string
  propertyId: string
  category: InventoryCategory
  name: string
  unit: string                 // 'box of 10', 'unit', 'litre', etc.
  currentStock: number
  parLevel: number             // ideal stock-on-hand
  reorderPoint: number         // trigger threshold
  reorderQty: number           // suggested order quantity
  unitCostCad: number
  supplierId: string
  lastReceived?: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  countryCode: CountryCode
  leadDays: number
  notes?: string
}

export type PurchaseOrderStatus =
  | 'draft' | 'submitted' | 'approved' | 'in_transit' | 'received' | 'cancelled'

export interface PurchaseOrderLine {
  itemId: string
  itemName: string
  qty: number
  unit: string
  unitCostCad: number
}

export interface PurchaseOrder {
  id: string
  propertyId: string
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  lines: PurchaseOrderLine[]
  totalCad: number
  createdAt: string
  expectedAt?: string
  notes?: string
}

export interface KpiDelta {
  pct: number
  direction: 'up' | 'down' | 'flat'
}

/* ---------------------------------------------------------------- */
/* Flow Rewards (loyalty programme)                                 */
/* ---------------------------------------------------------------- */

export type RewardsTier = 'Silver' | 'Gold' | 'Platinum' | 'Black'

export interface RewardsMember {
  id: string
  name: string
  initials: string
  email: string
  phone?: string
  country: string
  countryCode?: string
  tier: RewardsTier
  points: number
  lifetimeEarned: number
  lifetimeBurned: number
  joined: string
  lastActivity: string
  /** Manager-applied freeze (e.g. fraud review). When true, earn/burn blocked. */
  frozen?: boolean
  /** Stays + rentals that count towards tier qualification this calendar year */
  qualifyingActivityYtd: { stays: number; rentals: number; spendCad: number }
}

export type RewardsTransactionType = 'earn' | 'burn' | 'adjust' | 'transfer' | 'expiry'

export interface RewardsTransaction {
  id: string
  memberId: string
  date: string
  type: RewardsTransactionType
  delta: number
  reason: string
  /** Internal staff who created / approved this entry */
  staff?: string
  /** Linked booking / property for traceability */
  reference?: string
  /** Set when this entry is the resolution of a Dispute */
  disputeId?: string
}

export type DisputeStatus = 'open' | 'in_review' | 'approved' | 'rejected'
export type DisputeKind = 'missing_stay' | 'missing_rental' | 'missing_points' | 'tier_request' | 'other'

export interface RewardsDispute {
  id: string
  memberId: string
  memberName: string
  kind: DisputeKind
  status: DisputeStatus
  filedAt: string
  resolvedAt?: string
  /** What the member is asking for */
  ask: string
  /** Evidence URLs / notes attached by the member */
  evidence?: string[]
  /** Reason supplied by staff when resolving */
  resolution?: string
  /** Points credited or hospitality-adjusted on approval */
  awardedPoints?: number
  /** Booking / property reference, when applicable */
  reference?: string
}

/**
 * Periodic reconciliation between Flow's points ledger and an external
 * partner's view of the same activity (airline alliance, hotel-OTA back
 * office, credit-card co-brand, etc).
 */
export type PartnershipStatus = 'in_balance' | 'awaiting_partner' | 'discrepancy' | 'settled'

export interface RewardsPartnership {
  id: string
  partnerName: string
  partnerKind: 'airline' | 'ota' | 'card' | 'fleet' | 'corporate'
  flowPoints: number          // points Flow has on its ledger for this partner cycle
  partnerPoints: number       // partner's view
  delta: number               // partnerPoints - flowPoints (signed)
  cycleLabel: string          // e.g. "W18 · 2026"
  status: PartnershipStatus
  lastReconciledAt?: string
}

export interface RewardsAuditEntry {
  id: string
  ts: string
  staff: string
  action: 'adjust_points' | 'set_tier' | 'freeze_member' | 'unfreeze_member' |
          'approve_dispute' | 'reject_dispute' | 'reconcile_partnership' | 'set_tier_thresholds'
  memberId?: string
  memberName?: string
  details: string
  delta?: number
}

/* ---------------------------------------------------------------- */
/* Messaging + document sharing                                     */
/* ---------------------------------------------------------------- */

export type ParticipantKind = 'staff' | 'partner' | 'guest' | 'system'

export interface Participant {
  id: string
  kind: ParticipantKind
  name: string
  initials: string
  /** For staff: their Role. For partner / guest: undefined. */
  role?: Role
  partnerId?: string
  memberId?: string
  propertyId?: string
  countryCode?: CountryCode
  /** Last seen timestamp · drives the green / grey presence dot */
  lastSeenAt?: string
}

export type ConversationContext =
  | { type: 'booking';  ref: string }    // RES-xxxx
  | { type: 'rental';   ref: string }    // RNT-xxxx
  | { type: 'partner';  ref: string }    // fp-xxxx
  | { type: 'property'; ref: string }    // p-xxxx
  | { type: 'rewards';  ref: string }    // dispute / member id
  | { type: 'general' }

export interface Attachment {
  id: string
  filename: string
  mime: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string  // participant id
  /** Demo: data: URL or no-op. Production: presigned S3 / R2 URL. */
  url?: string
}

export interface Message {
  id: string
  conversationId: string
  fromId: string
  body: string
  sentAt: string
  /** Participant ids that have read this message */
  readBy: string[]
  attachments?: Attachment[]
  /** True when sent by the system (auto-post for bookings, etc.) */
  systemNote?: boolean
}

export interface Conversation {
  id: string
  title: string
  participantIds: string[]
  context?: ConversationContext
  /** Last activity, ISO string · drives sort + preview */
  lastMessageAt: string
  lastMessagePreview: string
  /** Per-participant unread count */
  unread: Record<string, number>
  pinned?: boolean
  archived?: boolean
}

export interface RewardsTierConfig {
  tier: RewardsTier
  /** Annual qualifying spend in USD to keep / earn this tier */
  minSpendCad: number
  /** Annual qualifying stays */
  minStays: number
  /** Points-earn multiplier on every dollar spent */
  pointsMultiplier: number
  /** Free amenities included for tier members */
  perks: string[]
}
