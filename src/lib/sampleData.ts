import type {
  Property,
  Reservation,
  Room,
  Vehicle,
  RentalBooking,
  FleetPartner,
  User,
  Role,
} from './types'

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'SuperAdmin · Co-Founder',
  country_manager: 'Country Manager',
  hotel_manager: 'Hotel Manager',
  car_agent: 'Car Rental Agent',
  fleet_partner: 'Fleet Partner',
  reward_manager: 'Rewards Manager',
  guest: 'Guest',
}

export const ROLE_HOMES: Record<Role, string> = {
  superadmin: '/admin/portfolio',
  country_manager: '/hotels/dashboard',
  hotel_manager: '/hotels/dashboard',
  car_agent: '/fleet/dashboard',
  fleet_partner: '/fleet/partner-portal',
  reward_manager: '/rewards/members',
  guest: '/booking/search',
}

export const SAMPLE_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Vistel Ganongo',
    email: 'vistel@flowrentals.com',
    role: 'superadmin',
    avatarInitials: 'VG',
  },
  {
    id: 'u-2',
    name: 'Maye Samoiel',
    email: 'maye@flowrentals.com',
    role: 'superadmin',
    avatarInitials: 'MS',
  },
  {
    id: 'u-3',
    name: 'Aisha Nakato',
    email: 'aisha@flowrentals.com',
    role: 'country_manager',
    countryCode: 'UG',
    avatarInitials: 'AN',
  },
  {
    id: 'u-4',
    name: 'Jean-Paul Mboungou',
    email: 'jp@flowrentals.com',
    role: 'hotel_manager',
    countryCode: 'CG',
    propertyId: 'p-bzv',
    avatarInitials: 'JM',
  },
  {
    id: 'u-5',
    name: 'Daniel Okello',
    email: 'daniel@flowrentals.com',
    role: 'car_agent',
    countryCode: 'UG',
    avatarInitials: 'DO',
  },
  {
    id: 'u-6',
    name: 'Mercantile Car Rentals Ltd',
    email: 'partners@mercantile.ug',
    role: 'fleet_partner',
    countryCode: 'UG',
    partnerId: 'fp-mercantile',
    avatarInitials: 'MC',
  },
  {
    id: 'u-7',
    name: 'Sarah Bennett',
    email: 'sarah@example.com',
    role: 'guest',
    avatarInitials: 'SB',
  },
  {
    id: 'u-8',
    name: 'Naledi Botha',
    email: 'naledi.botha@flowrentals.com',
    role: 'reward_manager',
    avatarInitials: 'NB',
  },
]

export const PROPERTIES: Property[] = [
  {
    id: 'p-bzv',
    name: 'Flow Hotels Brazzaville',
    type: 'both',
    city: 'Brazzaville',
    country: 'Congo-Brazzaville',
    countryCode: 'CG',
    address: 'Avenue Patrice Lumumba · Plateau',
    gps: { lat: -4.2634, lng: 15.2429 },
    rooms: 30,
    vehicles: 3,
    monthlyRevenueUsd: 184_500,
    ebitdaPct: 31.2,
    status: 'live',
    goLiveDate: '2024-04-15',
    contactEmail: 'ops.brazzaville@flowrentals.com',
    contactPhone: '+242 06 521 4488',
  },
  {
    id: 'p-bzv-airport',
    name: 'Flow Rentals · Maya-Maya Airport',
    type: 'car_rental',
    city: 'Brazzaville',
    country: 'Congo-Brazzaville',
    countryCode: 'CG',
    address: 'Maya-Maya International Airport · Arrivals',
    gps: { lat: -4.2516, lng: 15.2531 },
    vehicles: 8,
    monthlyRevenueUsd: 42_180,
    ebitdaPct: 28.4,
    status: 'live',
    goLiveDate: '2024-04-15',
    partnerId: 'fp-bzv',
    contactEmail: 'maya.airport@flowrentals.com',
    contactPhone: '+242 06 902 1144',
  },
  {
    id: 'p-kla',
    name: 'Flow Hotels Kampala',
    type: 'both',
    city: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    address: 'Plot 12 Lumumba Avenue · Nakasero',
    gps: { lat: 0.3186, lng: 32.5829 },
    rooms: 30,
    vehicles: 3,
    monthlyRevenueUsd: 142_800,
    ebitdaPct: 26.4,
    status: 'live',
    goLiveDate: '2024-08-02',
    contactEmail: 'ops.kampala@flowrentals.com',
    contactPhone: '+256 778 991 042',
  },
  {
    id: 'p-ebb',
    name: 'Flow Rentals · Entebbe Airport',
    type: 'car_rental',
    city: 'Entebbe',
    country: 'Uganda',
    countryCode: 'UG',
    address: 'Entebbe International Airport · Concourse B',
    gps: { lat: 0.0461, lng: 32.4441 },
    vehicles: 3,
    monthlyRevenueUsd: 38_220,
    ebitdaPct: 24.1,
    status: 'live',
    goLiveDate: '2024-08-02',
    contactEmail: 'entebbe@flowrentals.com',
    contactPhone: '+256 712 444 982',
  },
  {
    id: 'p-kla-mercantile',
    name: 'Mercantile Car Rentals · Kampala City',
    type: 'car_rental',
    city: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    address: 'Plot 5 Acacia Avenue · Kololo',
    gps: { lat: 0.3476, lng: 32.5825 },
    vehicles: 18,
    monthlyRevenueUsd: 64_440,
    ebitdaPct: 19.8,
    status: 'live',
    goLiveDate: '2024-08-02',
    partnerId: 'fp-mercantile',
    contactEmail: 'partners@mercantile.ug',
  },
  {
    id: 'p-add',
    name: 'Flow Hotels Addis Ababa',
    type: 'both',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    address: 'Bole Road · Off Africa Avenue',
    gps: { lat: 9.0084, lng: 38.7575 },
    rooms: 30,
    vehicles: 3,
    monthlyRevenueUsd: 121_350,
    ebitdaPct: 22.8,
    status: 'live',
    goLiveDate: '2024-05-30',
    contactEmail: 'ops.addis@flowrentals.com',
    contactPhone: '+251 911 442 008',
  },
  {
    id: 'p-add-bole',
    name: 'Flow Rentals · Bole Airport',
    type: 'car_rental',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    address: 'Bole International Airport · Terminal 2',
    gps: { lat: 8.9779, lng: 38.7991 },
    vehicles: 5,
    monthlyRevenueUsd: 28_660,
    ebitdaPct: 21.4,
    status: 'live',
    goLiveDate: '2024-05-30',
    contactEmail: 'bole@flowrentals.com',
    contactPhone: '+251 911 442 008',
  },
]

export const FLEET_PARTNERS: FleetPartner[] = [
  {
    id: 'fp-mercantile',
    name: 'Mercantile Car Rentals',
    city: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    vehiclesCount: 18,
    vehiclesActiveOnFlow: 12,
    weeklyPayoutUsd: 8_420,
    pendingPayoutUsd: 8_420,
    commissionPct: 18,
  },
  {
    id: 'fp-bzv',
    name: 'Brazza Auto Partners',
    city: 'Brazzaville',
    country: 'Congo',
    countryCode: 'CG',
    vehiclesCount: 10,
    vehiclesActiveOnFlow: 8,
    weeklyPayoutUsd: 6_180,
    pendingPayoutUsd: 6_180,
    commissionPct: 20,
  },
  {
    id: 'fp-add',
    name: 'Habesha Wheels',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    vehiclesCount: 14,
    vehiclesActiveOnFlow: 10,
    weeklyPayoutUsd: 5_240,
    pendingPayoutUsd: 5_240,
    commissionPct: 20,
  },
]

const ROOM_TYPES: Room['type'][] = ['Standard', 'Deluxe', 'Suite', 'Executive']
const STATUSES: Room['status'][] = [
  'occupied',
  'available',
  'dirty',
  'maintenance',
  'out_of_service',
]

export const SAMPLE_ROOMS: Room[] = Array.from({ length: 30 }, (_, i) => {
  const number = String(101 + i)
  const floor = 1 + Math.floor(i / 10)
  const type = ROOM_TYPES[i % ROOM_TYPES.length]
  const distribution = i < 18 ? 'occupied' : i < 22 ? 'available' : i < 26 ? 'dirty' : i < 28 ? 'maintenance' : 'out_of_service'
  const status = distribution as Room['status']
  const rateMap = { Standard: 95, Deluxe: 130, Suite: 195, Executive: 240 }
  return {
    number,
    type,
    floor,
    status: STATUSES.includes(status) ? status : 'available',
    rateUsd: rateMap[type],
    guestName: status === 'occupied' ? randomGuestName(i) : undefined,
  }
})

function randomGuestName(seed: number) {
  const names = [
    'Ahmed Yusuf', 'Sarah Bennett', 'Jean-Marc Loubaki', 'Priya Patel',
    'Olusegun Adeyemi', 'Fatima Diop', 'Marcus O\'Brien', 'Zhang Wei',
    'Émilie Tremblay', 'Kwame Asante', 'Nadia Haddad', 'Ben Okafor',
    'Léa Dubois', 'Henry Mukasa', 'Sofia Rodríguez', 'Daniel Tessema',
    'Aïcha Toure', 'James Kelly', 'Mei Tanaka', 'Pierre Bayoko',
  ]
  return names[seed % names.length]
}

const NATIONALITIES = [
  'Ugandan', 'Congolese', 'French', 'Canadian', 'Nigerian',
  'British', 'Ethiopian', 'Kenyan', 'American', 'Senegalese',
]

const CHANNELS: Reservation['channel'][] = [
  'Booking.com', 'Expedia', 'Direct', 'Flow App', 'Walk-in',
]

const STATUS_DIST: Reservation['status'][] = [
  'checked_in', 'confirmed', 'confirmed', 'checked_in',
  'pending', 'checked_out', 'confirmed', 'cancelled',
  'checked_in', 'confirmed',
]

export const SAMPLE_RESERVATIONS: Reservation[] = Array.from({ length: 24 }, (_, i) => {
  const checkInDate = new Date(2026, 4, 8 + (i % 14))
  const nights = 1 + (i % 5)
  const checkOutDate = new Date(checkInDate)
  checkOutDate.setDate(checkOutDate.getDate() + nights)
  const room = SAMPLE_ROOMS[i % SAMPLE_ROOMS.length]
  const rate = room.rateUsd
  return {
    id: `RES-${(2026000 + i).toString()}`,
    guestName: randomGuestName(i),
    nationality: NATIONALITIES[i % NATIONALITIES.length],
    checkIn: checkInDate.toISOString().split('T')[0],
    checkOut: checkOutDate.toISOString().split('T')[0],
    nights,
    roomNumber: room.number,
    roomType: room.type,
    rateUsd: rate,
    totalUsd: rate * nights,
    channel: CHANNELS[i % CHANNELS.length],
    status: STATUS_DIST[i % STATUS_DIST.length],
    paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'paid',
  }
})

export const VEHICLES: Vehicle[] = [
  // Entebbe (Uganda) - Flow owned
  { id: 'v-001', plate: 'UAJ 042X', make: 'Toyota', model: 'Land Cruiser V8', year: 2023, tier: 'Flow Elite', owner: 'flow', location: 'Entebbe Intl Airport', countryCode: 'UG', status: 'on_rent', km: 28430, lastServiceDate: '2026-04-12', dailyRateUsd: 295, gps: { lat: 0.0461, lng: 32.4441 } },
  { id: 'v-002', plate: 'UAJ 109Y', make: 'Toyota', model: 'Prado', year: 2022, tier: 'Flow Prestige', owner: 'flow', location: 'Entebbe Intl Airport', countryCode: 'UG', status: 'available', km: 41210, lastServiceDate: '2026-04-22', dailyRateUsd: 165, gps: { lat: 0.0461, lng: 32.4441 } },
  { id: 'v-003', plate: 'UBE 558K', make: 'Toyota', model: 'RAV4', year: 2023, tier: 'Flow Drive', owner: 'flow', location: 'Entebbe Intl Airport', countryCode: 'UG', status: 'on_rent', km: 19880, lastServiceDate: '2026-05-01', dailyRateUsd: 95, gps: { lat: 0.0461, lng: 32.4441 } },
  // Mercantile partner fleet (Kampala)
  { id: 'v-004', plate: 'UBC 220T', make: 'Toyota', model: 'Hilux', year: 2021, tier: 'Flow Terrain', owner: 'partner', partnerName: 'Mercantile Car Rentals', location: 'Kampala City Desk', countryCode: 'UG', status: 'on_rent', km: 86_400, lastServiceDate: '2026-03-19', dailyRateUsd: 110, gps: { lat: 0.3476, lng: 32.5825 } },
  { id: 'v-005', plate: 'UAH 445B', make: 'Nissan', model: 'X-Trail', year: 2022, tier: 'Flow Drive', owner: 'partner', partnerName: 'Mercantile Car Rentals', location: 'Kampala City Desk', countryCode: 'UG', status: 'available', km: 52_900, lastServiceDate: '2026-04-30', dailyRateUsd: 85, gps: { lat: 0.3476, lng: 32.5825 } },
  { id: 'v-006', plate: 'UAJ 871C', make: 'Toyota', model: 'Corolla', year: 2023, tier: 'Flow GO', owner: 'partner', partnerName: 'Mercantile Car Rentals', location: 'Kampala City Desk', countryCode: 'UG', status: 'on_rent', km: 34_120, lastServiceDate: '2026-05-04', dailyRateUsd: 55, gps: { lat: 0.3476, lng: 32.5825 } },
  { id: 'v-007', plate: 'UBA 312L', make: 'Mitsubishi', model: 'Pajero', year: 2020, tier: 'Flow Terrain', owner: 'partner', partnerName: 'Mercantile Car Rentals', location: 'Kampala City Desk', countryCode: 'UG', status: 'maintenance', km: 102_780, lastServiceDate: '2026-05-08', dailyRateUsd: 95, gps: { lat: 0.3476, lng: 32.5825 } },
  // Brazzaville
  { id: 'v-008', plate: 'CG 210 BZV', make: 'Toyota', model: 'Land Cruiser V8', year: 2024, tier: 'Flow Elite', owner: 'flow', location: 'Maya-Maya Airport', countryCode: 'CG', status: 'on_rent', km: 12_400, lastServiceDate: '2026-05-02', dailyRateUsd: 305, gps: { lat: -4.2516, lng: 15.2531 } },
  { id: 'v-009', plate: 'CG 088 BZV', make: 'Toyota', model: 'Prado', year: 2023, tier: 'Flow Prestige', owner: 'flow', location: 'Maya-Maya Airport', countryCode: 'CG', status: 'available', km: 28_900, lastServiceDate: '2026-04-18', dailyRateUsd: 175, gps: { lat: -4.2516, lng: 15.2531 } },
  { id: 'v-010', plate: 'CG 421 BZV', make: 'Toyota', model: 'Hilux', year: 2022, tier: 'Flow Terrain', owner: 'flow', location: 'Maya-Maya Airport', countryCode: 'CG', status: 'overdue', km: 64_220, lastServiceDate: '2026-03-29', dailyRateUsd: 115, gps: { lat: -4.2516, lng: 15.2531 } },
  // Addis Ababa
  { id: 'v-011', plate: 'ET 3-A 042', make: 'Toyota', model: 'Land Cruiser V8', year: 2023, tier: 'Flow Elite', owner: 'flow', location: 'Bole Intl Airport', countryCode: 'ET', status: 'available', km: 21_440, lastServiceDate: '2026-04-26', dailyRateUsd: 285, gps: { lat: 8.9779, lng: 38.7991 } },
  { id: 'v-012', plate: 'ET 3-A 119', make: 'Toyota', model: 'Prado', year: 2022, tier: 'Flow Prestige', owner: 'flow', location: 'Bole Intl Airport', countryCode: 'ET', status: 'on_rent', km: 38_860, lastServiceDate: '2026-04-08', dailyRateUsd: 160, gps: { lat: 8.9779, lng: 38.7991 } },
]

const RENTAL_STATUS: RentalBooking['status'][] = [
  'checked_in', 'confirmed', 'checked_in', 'confirmed',
  'pending', 'checked_out', 'confirmed', 'checked_in',
]

export const RENTAL_BOOKINGS: RentalBooking[] = Array.from({ length: 14 }, (_, i) => {
  const v = VEHICLES[i % VEHICLES.length]
  const start = new Date(2026, 4, 7 + (i % 10))
  const days = 2 + (i % 7)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  return {
    id: `RNT-${(900100 + i).toString()}`,
    clientName: randomGuestName(i + 5),
    vehiclePlate: v.plate,
    vehicleLabel: `${v.make} ${v.model}`,
    tier: v.tier,
    pickupLocation: v.location,
    returnLocation: v.location,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    days,
    ratePerDayUsd: v.dailyRateUsd,
    totalUsd: v.dailyRateUsd * days,
    status: RENTAL_STATUS[i % RENTAL_STATUS.length],
    owner: v.owner,
    partnerName: v.partnerName,
  }
})

export const OCCUPANCY_TREND_7D = [
  { day: 'Mon', occupancy: 76, adr: 122 },
  { day: 'Tue', occupancy: 81, adr: 125 },
  { day: 'Wed', occupancy: 78, adr: 121 },
  { day: 'Thu', occupancy: 84, adr: 130 },
  { day: 'Fri', occupancy: 92, adr: 142 },
  { day: 'Sat', occupancy: 95, adr: 148 },
  { day: 'Sun', occupancy: 88, adr: 138 },
]

export const REVENUE_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 4500 + Math.round(Math.sin(i / 3) * 1200)
  const hotels = base + (i % 4) * 300
  const cars = base * 0.65 + (i % 5) * 200
  return {
    day: i + 1,
    hotels: Math.round(hotels),
    cars: Math.round(cars),
  }
})

export const COUNTRY_PERFORMANCE = [
  { country: 'Congo-Brazzaville', countryCode: 'CG', hotels: 1, fleet: 11, gross: 184_500, ebitda: 31.2, status: 'Live' },
  { country: 'Uganda',            countryCode: 'UG', hotels: 1, fleet: 21, gross: 142_800, ebitda: 26.4, status: 'Live' },
  { country: 'Ethiopia',          countryCode: 'ET', hotels: 1, fleet: 13, gross: 121_350, ebitda: 22.8, status: 'Live' },
  { country: 'Kenya',             countryCode: 'KE', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Pilot · Q3 2026' },
  { country: 'Rwanda',            countryCode: 'RW', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Pilot · Q4 2026' },
  { country: 'Senegal',           countryCode: 'SN', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Pilot · Q1 2027' },
  { country: 'Nigeria',           countryCode: 'NG', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Prospect' },
  { country: 'Côte d\'Ivoire',    countryCode: 'CI', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Prospect' },
  { country: 'Morocco',           countryCode: 'MA', hotels: 0, fleet: 0,  gross: 0,       ebitda: 0,    status: 'Prospect' },
]

export const ARRIVALS_TODAY = [
  { name: 'Sarah Bennett', roomType: 'Suite', eta: '14:30', status: 'confirmed' },
  { name: 'Olusegun Adeyemi', roomType: 'Deluxe', eta: '15:10', status: 'confirmed' },
  { name: 'Émilie Tremblay', roomType: 'Executive', eta: '16:45', status: 'pending' },
  { name: 'Henry Mukasa', roomType: 'Standard', eta: '18:00', status: 'confirmed' },
  { name: 'Pierre Bayoko', roomType: 'Suite', eta: '20:15', status: 'confirmed' },
]

export const NOTIFICATIONS = [
  { id: 'n-1', title: 'Overdue return: CG 421 BZV', body: 'Brazzaville · 2h past expected return', type: 'warning' as const, time: '2m ago' },
  { id: 'n-2', title: 'New booking: Suite 207', body: 'Booking.com · 4 nights · $780', type: 'info' as const, time: '18m ago' },
  { id: 'n-3', title: 'Partner payout pending approval', body: 'Mercantile · $8,420 due Friday', type: 'info' as const, time: '1h ago' },
  { id: 'n-4', title: 'Rate parity alert', body: 'Booking.com lower than Direct on Deluxe', type: 'warning' as const, time: '3h ago' },
]

export const SEARCH_RESULTS_HOTELS = [
  { id: 'h-bzv', name: 'Flow Hotels Brazzaville', city: 'Brazzaville, Congo', rating: 4.6, rateUsd: 130, amenities: ['Pool', 'Restaurant', 'Airport Transfer'], partner: false },
  { id: 'h-kla', name: 'Flow Hotels Kampala', city: 'Kampala, Uganda', rating: 4.5, rateUsd: 110, amenities: ['Restaurant', 'Gym', 'Co-working'], partner: false },
  { id: 'h-add', name: 'Flow Hotels Addis Ababa', city: 'Addis Ababa, Ethiopia', rating: 4.4, rateUsd: 105, amenities: ['Restaurant', 'Spa', 'Airport Transfer'], partner: false },
]

export const SEARCH_RESULTS_CARS = [
  { id: 'c-1', label: 'Toyota Land Cruiser V8', tier: 'Flow Elite', seats: 7, ac: true, gps: true, rateUsd: 295, owner: 'Flow Rentals' },
  { id: 'c-2', label: 'Toyota Prado', tier: 'Flow Prestige', seats: 7, ac: true, gps: true, rateUsd: 165, owner: 'Flow Rentals' },
  { id: 'c-3', label: 'Toyota RAV4', tier: 'Flow Drive', seats: 5, ac: true, gps: true, rateUsd: 95, owner: 'Flow Rentals' },
  { id: 'c-4', label: 'Nissan X-Trail', tier: 'Flow Drive', seats: 5, ac: true, gps: true, rateUsd: 85, owner: 'Powered by Flow — Mercantile' },
  { id: 'c-5', label: 'Toyota Hilux', tier: 'Flow Terrain', seats: 5, ac: true, gps: true, rateUsd: 110, owner: 'Powered by Flow — Mercantile' },
  { id: 'c-6', label: 'Toyota Corolla', tier: 'Flow GO', seats: 5, ac: true, gps: false, rateUsd: 55, owner: 'Powered by Flow — Mercantile' },
]

/* ------------------------------------------------------------------ */
/* Suppliers & inventory                                              */
/* ------------------------------------------------------------------ */

import type { Supplier, InventoryItem, PurchaseOrder } from './types'

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-vbms-tn',    name: 'VBMS Tunisia SUARL',         country: 'Tunisia',  countryCode: 'TN', leadDays: 14, notes: 'Group supply chain · linens, toiletries, branded items' },
  { id: 'sup-tradelinks', name: 'Tradelinks East Africa',     country: 'Kenya',    countryCode: 'KE', leadDays:  7, notes: 'F&B and cleaning · Nairobi DC' },
  { id: 'sup-sodimat',    name: 'Sodimat SARL',               country: 'Congo',    countryCode: 'CG', leadDays:  3, notes: 'Brazzaville local · maintenance' },
  { id: 'sup-uganda-fp',  name: 'Uganda Fresh Produce Co-op', country: 'Uganda',   countryCode: 'UG', leadDays:  1, notes: 'F&B daily delivery' },
  { id: 'sup-toyota-eth', name: 'Toyota Ethiopia',            country: 'Ethiopia', countryCode: 'ET', leadDays: 21, notes: 'Vehicle parts and tyres' },
]

const inventoryFor = (propertyId: string): InventoryItem[] => [
  // Linens
  { id: `${propertyId}-lin-1`, propertyId, category: 'linens',     name: 'King-size bed sheet set',  unit: 'set',         currentStock: 18, parLevel: 40,  reorderPoint: 24, reorderQty: 30, unitCostUsd: 28,    supplierId: 'sup-vbms-tn',    lastReceived: '2026-04-12' },
  { id: `${propertyId}-lin-2`, propertyId, category: 'linens',     name: 'Bath towel · 600 GSM',     unit: 'unit',        currentStock: 62, parLevel: 120, reorderPoint: 70, reorderQty: 80, unitCostUsd: 8.5,   supplierId: 'sup-vbms-tn',    lastReceived: '2026-04-22' },
  { id: `${propertyId}-lin-3`, propertyId, category: 'linens',     name: 'Pillow case · cotton',     unit: 'unit',        currentStock: 90, parLevel: 120, reorderPoint: 60, reorderQty: 60, unitCostUsd: 3.2,   supplierId: 'sup-vbms-tn' },
  // Toiletries
  { id: `${propertyId}-toi-1`, propertyId, category: 'toiletries', name: 'Shampoo bottle · 50ml',    unit: 'box of 100',  currentStock: 4,  parLevel: 10,  reorderPoint: 5,  reorderQty: 6,  unitCostUsd: 42,    supplierId: 'sup-vbms-tn' },
  { id: `${propertyId}-toi-2`, propertyId, category: 'toiletries', name: 'Branded soap bar',         unit: 'box of 200',  currentStock: 2,  parLevel: 8,   reorderPoint: 4,  reorderQty: 6,  unitCostUsd: 78,    supplierId: 'sup-vbms-tn' },
  { id: `${propertyId}-toi-3`, propertyId, category: 'toiletries', name: 'Body lotion · 50ml',       unit: 'box of 100',  currentStock: 7,  parLevel: 10,  reorderPoint: 5,  reorderQty: 5,  unitCostUsd: 38,    supplierId: 'sup-vbms-tn' },
  // Cleaning
  { id: `${propertyId}-cln-1`, propertyId, category: 'cleaning',   name: 'Multi-surface cleaner',    unit: '5L jerrycan', currentStock: 6,  parLevel: 12,  reorderPoint: 6,  reorderQty: 8,  unitCostUsd: 12,    supplierId: 'sup-tradelinks' },
  { id: `${propertyId}-cln-2`, propertyId, category: 'cleaning',   name: 'Disinfectant',             unit: '5L jerrycan', currentStock: 3,  parLevel:  8,  reorderPoint: 4,  reorderQty: 6,  unitCostUsd: 15,    supplierId: 'sup-tradelinks' },
  { id: `${propertyId}-cln-3`, propertyId, category: 'cleaning',   name: 'Trash liner · 80L',        unit: 'pack of 100', currentStock: 12, parLevel: 20,  reorderPoint: 10, reorderQty: 12, unitCostUsd: 9,     supplierId: 'sup-tradelinks' },
  // F&B
  { id: `${propertyId}-fnb-1`, propertyId, category: 'fnb',        name: 'Bottled water · 500ml',    unit: 'case of 24',  currentStock: 8,  parLevel: 30,  reorderPoint: 15, reorderQty: 20, unitCostUsd: 4.8,   supplierId: 'sup-uganda-fp' },
  { id: `${propertyId}-fnb-2`, propertyId, category: 'fnb',        name: 'House coffee · whole bean',unit: 'kg',          currentStock: 5,  parLevel: 20,  reorderPoint: 10, reorderQty: 12, unitCostUsd: 14,    supplierId: 'sup-tradelinks' },
  { id: `${propertyId}-fnb-3`, propertyId, category: 'fnb',        name: 'Breakfast cereal',         unit: 'kg',          currentStock: 14, parLevel: 20,  reorderPoint: 8,  reorderQty: 10, unitCostUsd: 6,     supplierId: 'sup-tradelinks' },
  // Office / branded
  { id: `${propertyId}-off-1`, propertyId, category: 'branded',    name: 'Welcome letter · letterhead', unit: 'pack of 200', currentStock: 5, parLevel: 8, reorderPoint: 4,  reorderQty: 4,  unitCostUsd: 18,    supplierId: 'sup-vbms-tn' },
  { id: `${propertyId}-off-2`, propertyId, category: 'branded',    name: 'Key card · printed',       unit: 'pack of 100', currentStock: 9,  parLevel: 12,  reorderPoint: 6,  reorderQty: 6,  unitCostUsd: 32,    supplierId: 'sup-vbms-tn' },
  // Maintenance / vehicle
  { id: `${propertyId}-mnt-1`, propertyId, category: 'maintenance',name: 'Light bulb · LED 9W',      unit: 'box of 20',   currentStock: 3,  parLevel:  8,  reorderPoint: 4,  reorderQty: 6,  unitCostUsd: 22,    supplierId: 'sup-sodimat' },
  { id: `${propertyId}-veh-1`, propertyId, category: 'vehicle_consumables', name: 'Engine oil · 5W-30', unit: '5L jerrycan', currentStock: 4, parLevel: 8, reorderPoint: 4, reorderQty: 6, unitCostUsd: 28, supplierId: 'sup-toyota-eth' },
]

export const INVENTORY: InventoryItem[] = [
  ...inventoryFor('p-bzv'),
  ...inventoryFor('p-kla'),
  ...inventoryFor('p-add'),
]

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0044',
    propertyId: 'p-kla',
    supplierId: 'sup-vbms-tn',
    supplierName: 'VBMS Tunisia SUARL',
    status: 'in_transit',
    createdAt: '2026-04-28',
    expectedAt: '2026-05-12',
    notes: 'Standard quarterly replenishment',
    lines: [
      { itemId: 'p-kla-lin-1', itemName: 'King-size bed sheet set',     qty: 30, unit: 'set',        unitCostUsd: 28 },
      { itemId: 'p-kla-lin-2', itemName: 'Bath towel · 600 GSM',        qty: 80, unit: 'unit',       unitCostUsd: 8.5 },
      { itemId: 'p-kla-toi-1', itemName: 'Shampoo bottle · 50ml',       qty:  6, unit: 'box of 100', unitCostUsd: 42 },
    ],
    totalUsd: 30 * 28 + 80 * 8.5 + 6 * 42,
  },
  {
    id: 'PO-2026-0045',
    propertyId: 'p-bzv',
    supplierId: 'sup-sodimat',
    supplierName: 'Sodimat SARL',
    status: 'approved',
    createdAt: '2026-05-04',
    expectedAt: '2026-05-08',
    lines: [
      { itemId: 'p-bzv-mnt-1', itemName: 'Light bulb · LED 9W',        qty:  6, unit: 'box of 20',   unitCostUsd: 22 },
    ],
    totalUsd: 6 * 22,
  },
  {
    id: 'PO-2026-0046',
    propertyId: 'p-add',
    supplierId: 'sup-toyota-eth',
    supplierName: 'Toyota Ethiopia',
    status: 'submitted',
    createdAt: '2026-05-08',
    lines: [
      { itemId: 'p-add-veh-1', itemName: 'Engine oil · 5W-30',         qty:  6, unit: '5L jerrycan', unitCostUsd: 28 },
    ],
    totalUsd: 6 * 28,
  },
  {
    id: 'PO-2026-0043',
    propertyId: 'p-kla',
    supplierId: 'sup-uganda-fp',
    supplierName: 'Uganda Fresh Produce Co-op',
    status: 'received',
    createdAt: '2026-05-06',
    expectedAt: '2026-05-07',
    lines: [
      { itemId: 'p-kla-fnb-1', itemName: 'Bottled water · 500ml',      qty: 20, unit: 'case of 24',  unitCostUsd: 4.8 },
      { itemId: 'p-kla-fnb-3', itemName: 'Breakfast cereal',           qty: 10, unit: 'kg',          unitCostUsd: 6 },
    ],
    totalUsd: 20 * 4.8 + 10 * 6,
  },
]

/* ------------------------------------------------------------------ */
/* Flow Rewards                                                       */
/* ------------------------------------------------------------------ */

import type {
  RewardsMember, RewardsTransaction, RewardsDispute, RewardsPartnership,
  RewardsAuditEntry, RewardsTierConfig,
} from './types'

export const REWARDS_TIERS: RewardsTierConfig[] = [
  { tier: 'Silver',   minSpendUsd: 0,      minStays: 0,  pointsMultiplier: 1,    perks: ['Welcome drink', 'Late check-out (subject to availability)'] },
  { tier: 'Gold',     minSpendUsd: 5_000,  minStays: 6,  pointsMultiplier: 1.5,  perks: ['Free breakfast', 'Room upgrade at check-in', 'Late check-out 4pm', '24h cancellation'] },
  { tier: 'Platinum', minSpendUsd: 15_000, minStays: 15, pointsMultiplier: 2,    perks: ['Suite upgrade (subject to availability)', 'Free airport transfer (each market)', 'Flow GO car included one weekend / yr', 'Dedicated concierge'] },
  { tier: 'Black',    minSpendUsd: 40_000, minStays: 30, pointsMultiplier: 3,    perks: ['Guaranteed suite', 'Black-tier-only F&B menu', 'Private welcome at airport', 'Annual two-night stay any market'] },
]

export const REWARDS_MEMBERS: RewardsMember[] = [
  { id:'m-1', name:'Sarah Bennett',         initials:'SB', email:'sarah.bennett@example.com', country:'United Kingdom',  tier:'Gold',     points:14_200, lifetimeEarned:24_440, lifetimeBurned:10_240, joined:'2023-11-04', lastActivity:'2026-05-09', qualifyingActivityYtd:{ stays: 7, rentals: 3, spendUsd:  9_840 } },
  { id:'m-2', name:'Jean-Marc Loubaki',     initials:'JL', email:'jm@loubaki.cg',              countryCode:'CG', country:'Congo',           tier:'Platinum', points:28_750, lifetimeEarned:54_120, lifetimeBurned:25_370, joined:'2023-08-22', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:18, rentals: 7, spendUsd: 22_180 } },
  { id:'m-3', name:'Priya Patel',           initials:'PP', email:'priya@example.com',          country:'India',           tier:'Silver',   points: 4_840, lifetimeEarned: 6_120, lifetimeBurned: 1_280, joined:'2024-06-18', lastActivity:'2026-04-12', qualifyingActivityYtd:{ stays: 2, rentals: 1, spendUsd:  1_840 } },
  { id:'m-4', name:'Aïcha Toure',           initials:'AT', email:'aicha.t@example.sn',         countryCode:'SN', country:'Senegal',         tier:'Gold',     points:11_320, lifetimeEarned:18_880, lifetimeBurned: 7_560, joined:'2024-02-01', lastActivity:'2026-05-08', qualifyingActivityYtd:{ stays: 8, rentals: 2, spendUsd:  8_140 } },
  { id:'m-5', name:'Olusegun Adeyemi',      initials:'OA', email:'segun@example.ng',           countryCode:'NG', country:'Nigeria',         tier:'Gold',     points: 9_840, lifetimeEarned:15_220, lifetimeBurned: 5_380, joined:'2024-04-10', lastActivity:'2026-05-07', qualifyingActivityYtd:{ stays: 6, rentals: 2, spendUsd:  6_840 } },
  { id:'m-6', name:'Ahmed Yusuf',           initials:'AY', email:'ahmed.y@example.ug',         countryCode:'UG', country:'Uganda',          tier:'Silver',   points: 2_180, lifetimeEarned: 2_980, lifetimeBurned:     800, joined:'2025-03-08', lastActivity:'2026-05-06', qualifyingActivityYtd:{ stays: 3, rentals: 0, spendUsd:  1_220 } },
  { id:'m-7', name:'Daniel Tessema',        initials:'DT', email:'daniel.t@example.et',        countryCode:'ET', country:'Ethiopia',        tier:'Silver',   points: 6_440, lifetimeEarned: 8_120, lifetimeBurned: 1_680, joined:'2024-11-29', lastActivity:'2026-05-04', qualifyingActivityYtd:{ stays: 4, rentals: 1, spendUsd:  3_240 } },
  { id:'m-8', name:'Henry Mukasa',          initials:'HM', email:'henry.m@example.ug',         countryCode:'UG', country:'Uganda',          tier:'Gold',     points:13_180, lifetimeEarned:18_440, lifetimeBurned: 5_260, joined:'2023-12-12', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays: 7, rentals: 4, spendUsd:  9_180 } },
  { id:'m-9', name:'Léa Dubois',            initials:'LD', email:'lea.d@example.ci',           countryCode:'CI', country:'Côte d\'Ivoire',  tier:'Platinum', points:31_400, lifetimeEarned:48_120, lifetimeBurned:16_720, joined:'2023-09-04', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:14, rentals: 5, spendUsd: 17_240 } },
  { id:'m-10', name:'Tendai Moyo',          initials:'TM', email:'tendai@example.zw',          countryCode:'ZW', country:'Zimbabwe',        tier:'Silver',   points:    420, lifetimeEarned:    420, lifetimeBurned:       0, joined:'2026-04-22', lastActivity:'2026-05-09', qualifyingActivityYtd:{ stays: 1, rentals: 0, spendUsd:     180 } },
  { id:'m-11', name:'Kwame Asante',         initials:'KA', email:'kwame@example.gh',           countryCode:'GH', country:'Ghana',           tier:'Black',    points:42_080, lifetimeEarned:118_420, lifetimeBurned:76_340, joined:'2023-03-18', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:32, rentals:12, spendUsd: 47_840 }, frozen: false },
  { id:'m-12', name:'Fatima Benali',        initials:'FB', email:'fatima.b@example.ma',        countryCode:'MA', country:'Morocco',         tier:'Gold',     points: 9_480, lifetimeEarned:12_640, lifetimeBurned: 3_160, joined:'2024-07-08', lastActivity:'2026-05-04', qualifyingActivityYtd:{ stays: 5, rentals: 2, spendUsd:  5_640 } },
]

export const REWARDS_TRANSACTIONS: RewardsTransaction[] = [
  // m-1 Sarah
  { id:'tx-1001', memberId:'m-1', date:'2026-05-09', type:'earn',   delta: +480,  reason:'Stay · Flow Hotels Kampala · 4 nights · Suite 102', staff:'system',           reference:'RES-2026001' },
  { id:'tx-1002', memberId:'m-1', date:'2026-05-02', type:'earn',   delta: +360,  reason:'Car rental · Toyota Prado · 3 days',                staff:'system',           reference:'RNT-900101' },
  { id:'tx-1003', memberId:'m-1', date:'2026-04-25', type:'burn',   delta:-2000, reason:'Free night redemption · Brazzaville · Standard',     staff:'system' },
  { id:'tx-1004', memberId:'m-1', date:'2026-04-22', type:'earn',   delta: +780,  reason:'Stay · Flow Hotels Kampala · 4 nights · Suite 207', staff:'system',           reference:'RES-2026004' },
  { id:'tx-1005', memberId:'m-1', date:'2026-03-18', type:'earn',   delta: +440,  reason:'Stay · Flow Hotels Addis Ababa · Deluxe',           staff:'system',           reference:'RES-2026088' },
  { id:'tx-1006', memberId:'m-1', date:'2026-02-15', type:'adjust', delta: +500,  reason:'Service recovery · room maintenance during stay',   staff:'Naledi Botha' },
  { id:'tx-1007', memberId:'m-1', date:'2026-01-08', type:'burn',   delta:-1500, reason:'Car rental upgrade · Elite tier · 2 days',          staff:'system' },
  // m-2 Jean-Marc
  { id:'tx-1010', memberId:'m-2', date:'2026-05-10', type:'earn',   delta:+1200, reason:'Stay · Flow Hotels Brazzaville · 8 nights',         staff:'system',           reference:'RES-2026200' },
  { id:'tx-1011', memberId:'m-2', date:'2026-05-01', type:'earn',   delta: +860, reason:'Stay · Flow Hotels Addis Ababa · 5 nights',         staff:'system',           reference:'RES-2026188' },
  { id:'tx-1012', memberId:'m-2', date:'2026-04-15', type:'transfer', delta: -3000, reason:'Transferred 3,000 pts to Léa Dubois (m-9)',     staff:'Naledi Botha' },
  // m-4 Aïcha
  { id:'tx-1020', memberId:'m-4', date:'2026-05-08', type:'earn',   delta: +320, reason:'Stay · Flow Hotels Kampala · 3 nights',             staff:'system',           reference:'RES-2026220' },
  // m-11 Kwame (Black tier)
  { id:'tx-1030', memberId:'m-11', date:'2026-05-10', type:'earn',  delta:+2400, reason:'Stay · Flow Hotels Brazzaville · 8 nights · Black multiplier', staff:'system', reference:'RES-2026280' },
  { id:'tx-1031', memberId:'m-11', date:'2026-04-22', type:'burn',  delta:-12_000, reason:'Annual two-night anywhere · Addis Ababa · Suite', staff:'system' },
]

export const REWARDS_DISPUTES: RewardsDispute[] = [
  {
    id:'d-501', memberId:'m-1', memberName:'Sarah Bennett',
    kind:'missing_stay', status:'in_review', filedAt:'2026-05-08',
    ask:'4-night stay at Flow Hotels Kampala (RES-2026004) shows in my account but no points were credited.',
    evidence:['booking_confirmation.pdf', 'card_charge.png'],
    reference:'RES-2026004',
  },
  {
    id:'d-502', memberId:'m-4', memberName:'Aïcha Toure',
    kind:'missing_points', status:'open', filedAt:'2026-05-07',
    ask:'Expected 320 pts for May 5 stay, only received 120. Booked via Flow App.',
    reference:'RES-2026220',
  },
  {
    id:'d-503', memberId:'m-7', memberName:'Daniel Tessema',
    kind:'tier_request', status:'open', filedAt:'2026-05-06',
    ask:'Hit 4 stays + $3,200 spend YTD. Should I qualify for Gold under the new threshold?',
  },
  {
    id:'d-504', memberId:'m-5', memberName:'Olusegun Adeyemi',
    kind:'missing_rental', status:'approved', filedAt:'2026-05-02', resolvedAt:'2026-05-04',
    ask:'Toyota Prado rental from Entebbe (RNT-900099) earned 0 pts. Should be 220.',
    reference:'RNT-900099',
    resolution:'Confirmed against Mercantile partner ledger · 220 pts credited',
    awardedPoints: 220,
  },
  {
    id:'d-505', memberId:'m-3', memberName:'Priya Patel',
    kind:'missing_points', status:'rejected', filedAt:'2026-04-28', resolvedAt:'2026-04-30',
    ask:'Stay was booked through Expedia and should still earn points.',
    resolution:'Per programme T&Cs, only Direct / Flow App / Booking.com earn points · Expedia excluded',
  },
]

export const REWARDS_PARTNERSHIPS: RewardsPartnership[] = [
  { id:'pt-1', partnerName:'Ethiopian Airlines · ShebaMiles', partnerKind:'airline',   flowPoints:  84_220, partnerPoints:  84_220, delta:      0, cycleLabel:'W18 · 2026', status:'in_balance',       lastReconciledAt:'2026-05-09' },
  { id:'pt-2', partnerName:'Kenya Airways · Asante',          partnerKind:'airline',   flowPoints:  52_180, partnerPoints:  53_440, delta: +1_260, cycleLabel:'W18 · 2026', status:'discrepancy',      lastReconciledAt:'2026-05-09' },
  { id:'pt-3', partnerName:'Booking.com Genius',              partnerKind:'ota',       flowPoints:  46_980, partnerPoints:  46_980, delta:      0, cycleLabel:'W18 · 2026', status:'in_balance',       lastReconciledAt:'2026-05-09' },
  { id:'pt-4', partnerName:'Standard Bank Blue · co-brand',   partnerKind:'card',      flowPoints:  28_640, partnerPoints:       0, delta:-28_640, cycleLabel:'W18 · 2026', status:'awaiting_partner' },
  { id:'pt-5', partnerName:'Mercantile Car Rentals',          partnerKind:'fleet',     flowPoints:  19_240, partnerPoints:  19_460, delta:   +220, cycleLabel:'W18 · 2026', status:'discrepancy',      lastReconciledAt:'2026-05-08' },
  { id:'pt-6', partnerName:'African Union HQ corporate',      partnerKind:'corporate', flowPoints:  14_120, partnerPoints:  14_120, delta:      0, cycleLabel:'W18 · 2026', status:'settled',          lastReconciledAt:'2026-05-07' },
]

/* ------------------------------------------------------------------ */
/* Messaging + document sharing                                       */
/* ------------------------------------------------------------------ */

import type { Participant, Conversation, Message } from './types'

/**
 * Universal participant directory. Anything not in this table cannot be
 * messaged. Staff use their User.id (u-*), partners use FleetPartner.id
 * (fp-*), guests use RewardsMember.id (m-*).
 */
export const PARTICIPANTS: Participant[] = [
  { id:'u-1', kind:'staff',  name:'Vistel Ganongo',           initials:'VG', role:'superadmin',       lastSeenAt:'2026-05-10T13:42:00Z' },
  { id:'u-2', kind:'staff',  name:'Maye Samoiel',             initials:'MS', role:'superadmin',       lastSeenAt:'2026-05-10T11:08:00Z' },
  { id:'u-3', kind:'staff',  name:'Aisha Nakato',             initials:'AN', role:'country_manager',  countryCode:'UG', lastSeenAt:'2026-05-10T13:55:00Z' },
  { id:'u-4', kind:'staff',  name:'Jean-Paul Mboungou',       initials:'JM', role:'hotel_manager',    countryCode:'CG', propertyId:'p-bzv', lastSeenAt:'2026-05-10T13:30:00Z' },
  { id:'u-5', kind:'staff',  name:'Daniel Okello',            initials:'DO', role:'car_agent',        countryCode:'UG', lastSeenAt:'2026-05-10T13:48:00Z' },
  { id:'u-8', kind:'staff',  name:'Naledi Botha',             initials:'NB', role:'reward_manager',   lastSeenAt:'2026-05-10T12:11:00Z' },
  { id:'fp-mercantile', kind:'partner', name:'Mercantile Car Rentals', initials:'MC', partnerId:'fp-mercantile', lastSeenAt:'2026-05-10T09:14:00Z' },
  { id:'fp-bzv',        kind:'partner', name:'Brazza Auto Partners',   initials:'BA', partnerId:'fp-bzv',        lastSeenAt:'2026-05-09T17:42:00Z' },
  { id:'m-1', kind:'guest',  name:'Sarah Bennett',            initials:'SB', memberId:'m-1' },
  { id:'m-4', kind:'guest',  name:'Aïcha Toure',              initials:'AT', memberId:'m-4' },
  { id:'m-5', kind:'guest',  name:'Olusegun Adeyemi',         initials:'OA', memberId:'m-5' },
  { id:'m-11', kind:'guest', name:'Kwame Asante',             initials:'KA', memberId:'m-11' },
  { id:'system', kind:'system', name:'Flow OS', initials:'F' },
]

const T = (h: number, m = 0, day = '2026-05-10') => `${day}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00Z`

const att = (id: string, filename: string, mime: string, sizeBytes: number, uploadedBy: string, uploadedAt: string) => ({
  id, filename, mime, sizeBytes, uploadedAt, uploadedBy,
})

export const CONVERSATIONS: Conversation[] = [
  { id:'c-1', title:'Sarah Bennett · Room upgrade request',
    participantIds:['m-1', 'u-4'], context:{ type:'booking', ref:'RES-2026001' },
    lastMessageAt: T(13, 28),
    lastMessagePreview:'Confirmed · upgrade to Suite 207 at no extra cost. Looking forward to it!',
    unread:{ 'm-1': 0, 'u-4': 0 }, pinned: true },
  { id:'c-2', title:'Mercantile · weekly payout W18',
    participantIds:['fp-mercantile', 'u-3', 'u-1'], context:{ type:'partner', ref:'fp-mercantile' },
    lastMessageAt: T(13, 12),
    lastMessagePreview:'Sending the bank transfer Friday morning. Will share confirmation here.',
    unread:{ 'fp-mercantile': 0, 'u-3': 0, 'u-1': 1 } },
  { id:'c-3', title:'Aïcha Toure · missing points dispute',
    participantIds:['m-4', 'u-8'], context:{ type:'rewards', ref:'d-502' },
    lastMessageAt: T(13, 4),
    lastMessagePreview:'Booking confirmation attached. The stay was 3 nights, not 1.',
    unread:{ 'm-4': 0, 'u-8': 2 } },
  { id:'c-4', title:'Olusegun Adeyemi · airport pickup',
    participantIds:['m-5', 'u-5'], context:{ type:'rental', ref:'RNT-900101' },
    lastMessageAt: T(12, 51),
    lastMessagePreview:'Flight KQ 412 lands 15:10. Driver will be at Arrivals B with a Flow sign.',
    unread:{ 'm-5': 0, 'u-5': 0 } },
  { id:'c-5', title:'Kwame Asante · Black-tier benefit query',
    participantIds:['m-11', 'u-8'], context:{ type:'rewards', ref:'m-11' },
    lastMessageAt: T(11, 38),
    lastMessagePreview:'Yes — the annual two-night stay is fully refundable up to 48h before arrival.',
    unread:{ 'm-11': 1, 'u-8': 0 } },
  { id:'c-6', title:'Internal · staffing for next week',
    participantIds:['u-3', 'u-4', 'u-5'], context:{ type:'general' },
    lastMessageAt: T(10, 22),
    lastMessagePreview:'Daniel covers the Friday airport shift. Aisha approves PTO for the others.',
    unread:{ 'u-3': 0, 'u-4': 0, 'u-5': 0 } },
  { id:'c-7', title:'Brazza Auto · vehicle UAJ 871C maintenance',
    participantIds:['fp-bzv', 'u-3'], context:{ type:'partner', ref:'fp-bzv' },
    lastMessageAt: T(9, 14),
    lastMessagePreview:'Service report attached. Vehicle back on the platform by Tuesday.',
    unread:{ 'fp-bzv': 0, 'u-3': 1 } },
  { id:'c-8', title:'Sarah Bennett · invoice request',
    participantIds:['m-1', 'u-3'], context:{ type:'booking', ref:'RES-2026001' },
    lastMessageAt: T(8, 55, '2026-05-09'),
    lastMessagePreview:'Forwarded to finance · they\'ll send the VAT-compliant PDF by 17:00.',
    unread:{ 'm-1': 0, 'u-3': 0 } },
]

export const MESSAGES: Message[] = [
  // c-1 Sarah ↔ Jean-Paul
  { id:'msg-1001', conversationId:'c-1', fromId:'m-1', sentAt: T(9, 12),  body:'Hi! Booking RES-2026001 here. Wondering if a quiet, high-floor suite is possible? Anniversary stay.', readBy:['m-1','u-4'] },
  { id:'msg-1002', conversationId:'c-1', fromId:'u-4', sentAt: T(9, 41),  body:'Sarah — happy anniversary in advance! Let me check. Suite 207 has city view, top floor, away from elevator. Available for your dates. Would you like me to upgrade you at no charge?', readBy:['m-1','u-4'] },
  { id:'msg-1003', conversationId:'c-1', fromId:'m-1', sentAt: T(10, 8),  body:'That would be amazing — thank you so much!', readBy:['m-1','u-4'] },
  { id:'msg-1004', conversationId:'c-1', fromId:'u-4', sentAt: T(13, 28), body:'Confirmed · upgrade to Suite 207 at no extra cost. Looking forward to it!', readBy:['m-1','u-4'] },

  // c-2 Mercantile + Aisha + Vistel
  { id:'msg-1010', conversationId:'c-2', fromId:'u-3', sentAt: T(8, 30),  body:'Hi @Mercantile — confirming this week\'s payout: $8,420 net of commission. Bank: Stanbic UG ··· 8420. OK to release?', readBy:['u-3','u-1','fp-mercantile'] },
  { id:'msg-1011', conversationId:'c-2', fromId:'fp-mercantile', sentAt: T(9, 14),
    body:'Confirmed receipt. One vehicle (UBC 220T) had a discrepancy of 2 rental days vs our records — sending reconciliation report.',
    readBy:['u-3','u-1','fp-mercantile'],
    attachments:[att('att-1', 'mercantile-reconciliation-W18.pdf', 'application/pdf', 142_300, 'fp-mercantile', T(9, 14))] },
  { id:'msg-1012', conversationId:'c-2', fromId:'u-3', sentAt: T(12, 4),  body:'Reviewed — confirmed your records are correct. I\'ll adjust the ledger on our side. Releasing payout Friday as agreed.', readBy:['u-3','u-1','fp-mercantile'] },
  { id:'msg-1013', conversationId:'c-2', fromId:'fp-mercantile', sentAt: T(13, 12), body:'Sending the bank transfer Friday morning. Will share confirmation here.', readBy:['u-3','fp-mercantile'] },

  // c-3 Aïcha ↔ Naledi
  { id:'msg-1020', conversationId:'c-3', fromId:'m-4', sentAt: T(11, 18), body:'I filed dispute d-502 — only got 120 pts for my May 5 stay but it should be 320 (3 nights · Deluxe).', readBy:['m-4','u-8'] },
  { id:'msg-1021', conversationId:'c-3', fromId:'u-8', sentAt: T(11, 47), body:'Hi Aïcha — looking into it now. Can you send your booking confirmation so I can match against the partner ledger?', readBy:['m-4','u-8'] },
  { id:'msg-1022', conversationId:'c-3', fromId:'m-4', sentAt: T(13, 4),
    body:'Booking confirmation attached. The stay was 3 nights, not 1.', readBy:['m-4'],
    attachments:[att('att-2', 'booking-RES-2026220.pdf', 'application/pdf', 86_200, 'm-4', T(13, 4))] },

  // c-4 Olusegun ↔ Daniel
  { id:'msg-1030', conversationId:'c-4', fromId:'m-5', sentAt: T(12, 32), body:'Hi — my flight (KQ 412) lands today at 15:10. Just confirming Toyota Prado pickup details.', readBy:['m-5','u-5'] },
  { id:'msg-1031', conversationId:'c-4', fromId:'u-5', sentAt: T(12, 51), body:'Flight KQ 412 lands 15:10. Driver will be at Arrivals B with a Flow sign.', readBy:['m-5','u-5'] },

  // c-5 Kwame ↔ Naledi
  { id:'msg-1040', conversationId:'c-5', fromId:'m-11', sentAt: T(11, 10), body:'Question on the Black-tier annual stay: is the two-night benefit fully flexible / cancellable?', readBy:['m-11','u-8'] },
  { id:'msg-1041', conversationId:'c-5', fromId:'u-8',  sentAt: T(11, 38), body:'Yes — the annual two-night stay is fully refundable up to 48h before arrival.', readBy:['u-8'] },

  // c-6 Internal
  { id:'msg-1050', conversationId:'c-6', fromId:'u-3', sentAt: T(9, 50),  body:'Team — staffing for next week. Daniel, can you cover the Friday airport shift? Jean-Paul, OK to approve PTO for Aisha N., Henry M., and Émilie T.?', readBy:['u-3','u-4','u-5'] },
  { id:'msg-1051', conversationId:'c-6', fromId:'u-5', sentAt: T(10, 6),  body:'Friday airport — yes, I can cover.', readBy:['u-3','u-4','u-5'] },
  { id:'msg-1052', conversationId:'c-6', fromId:'u-4', sentAt: T(10, 22), body:'PTO approved for all three. Daniel covers the Friday airport shift.', readBy:['u-3','u-4','u-5'] },

  // c-7 Brazza Auto
  { id:'msg-1060', conversationId:'c-7', fromId:'fp-bzv', sentAt: T(9, 14),
    body:'Service report attached. Vehicle back on the platform by Tuesday.', readBy:['fp-bzv'],
    attachments:[att('att-3', 'service-report-UAJ871C.pdf', 'application/pdf', 224_140, 'fp-bzv', T(9, 14))] },

  // c-8 Older invoice request
  { id:'msg-1070', conversationId:'c-8', fromId:'m-1', sentAt: T(8, 30, '2026-05-09'), body:'Hi — could I get a VAT-compliant invoice for the May stay? Need it for expense filing.', readBy:['m-1','u-3'] },
  { id:'msg-1071', conversationId:'c-8', fromId:'u-3', sentAt: T(8, 55, '2026-05-09'), body:'Forwarded to finance · they\'ll send the VAT-compliant PDF by 17:00.', readBy:['m-1','u-3'] },
]

export const REWARDS_AUDIT: RewardsAuditEntry[] = [
  { id:'a-9001', ts:'2026-05-10T14:42:00Z', staff:'Naledi Botha',  action:'approve_dispute',     memberId:'m-5', memberName:'Olusegun Adeyemi', details:'Resolved d-504 · 220 pts credited for RNT-900099', delta:+220 },
  { id:'a-9002', ts:'2026-05-10T13:18:00Z', staff:'Naledi Botha',  action:'adjust_points',       memberId:'m-1', memberName:'Sarah Bennett',    details:'Manual credit · service recovery during April stay',  delta:+500 },
  { id:'a-9003', ts:'2026-05-09T11:02:00Z', staff:'Vistel Ganongo',action:'reconcile_partnership', details:'Reconciled Booking.com Genius cycle W18 · in balance' },
  { id:'a-9004', ts:'2026-05-08T16:30:00Z', staff:'Naledi Botha',  action:'set_tier',            memberId:'m-11', memberName:'Kwame Asante',     details:'Tier overridden to Black after spend hit $47,840 YTD' },
  { id:'a-9005', ts:'2026-05-08T10:11:00Z', staff:'Naledi Botha',  action:'reject_dispute',      memberId:'m-3', memberName:'Priya Patel',      details:'Rejected d-505 · Expedia stays excluded from earn per T&Cs' },
  { id:'a-9006', ts:'2026-05-06T09:48:00Z', staff:'Vistel Ganongo',action:'set_tier_thresholds', details:'Raised Gold minStays from 5 to 6 (programme refresh)' },
  { id:'a-9007', ts:'2026-04-30T17:22:00Z', staff:'Naledi Botha',  action:'freeze_member',       memberId:'m-12', memberName:'Fatima Benali',    details:'Frozen for review · unusual burn pattern flagged by fraud rules' },
  { id:'a-9008', ts:'2026-04-30T17:30:00Z', staff:'Naledi Botha',  action:'unfreeze_member',     memberId:'m-12', memberName:'Fatima Benali',    details:'False positive · activity legitimate, member unfrozen' },
]
