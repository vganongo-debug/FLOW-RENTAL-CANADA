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
    name: 'Marie-Claude Boudreau',
    email: 'marie-claude@flowrentals.com',
    role: 'country_manager',
    countryCode: 'QC',
    avatarInitials: 'MB',
  },
  {
    id: 'u-4',
    name: 'Jean-Philippe Bouchard',
    email: 'jp@flowrentals.com',
    role: 'hotel_manager',
    countryCode: 'QC',
    propertyId: 'p-ybx',
    avatarInitials: 'JB',
  },
  {
    id: 'u-5',
    name: 'Simon Lapierre',
    email: 'simon@flowrentals.com',
    role: 'car_agent',
    countryCode: 'QC',
    avatarInitials: 'SL',
  },
  {
    id: 'u-6',
    name: 'Nord-Côtier Location inc.',
    email: 'partenaires@nordcotier.ca',
    role: 'fleet_partner',
    countryCode: 'QC',
    partnerId: 'fp-nordcotier',
    avatarInitials: 'NC',
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
    name: 'Karine Lévesque',
    email: 'karine.levesque@flowrentals.com',
    role: 'reward_manager',
    avatarInitials: 'KL',
  },
]

export const PROPERTIES: Property[] = [
  {
    id: 'p-ybx',
    name: 'Flow Station Blanc-Sablon',
    type: 'both',
    city: 'Lourdes-de-Blanc-Sablon',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Route 138 · Lourdes-de-Blanc-Sablon',
    gps: { lat: 51.4436, lng: -57.1853 },
    rooms: 24,
    vehicles: 6,
    monthlyRevenueCad: 148_000,
    ebitdaPct: 31.2,
    status: 'live',
    goLiveDate: '2026-04-15',
    contactEmail: 'ops.blancsablon@flowrentals.ca',
    contactPhone: '+1 418 461 2200',
  },
  {
    id: 'p-ybx-air',
    name: 'Flow Rentals · Aéroport YBX',
    type: 'car_rental',
    city: 'Lourdes-de-Blanc-Sablon',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Aéroport de Lourdes-de-Blanc-Sablon · Arrivées',
    gps: { lat: 51.4436, lng: -57.1853 },
    vehicles: 8,
    monthlyRevenueCad: 34_500,
    ebitdaPct: 28.4,
    status: 'live',
    goLiveDate: '2026-04-15',
    partnerId: 'fp-ybx',
    contactEmail: 'ybx@flowrentals.ca',
    contactPhone: '+1 418 461 2244',
  },
  {
    id: 'p-yna',
    name: 'Flow Station Natashquan',
    type: 'both',
    city: 'Natashquan',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Chemin d’en Haut · Natashquan',
    gps: { lat: 50.19, lng: -61.7892 },
    rooms: 18,
    vehicles: 4,
    monthlyRevenueCad: 96_400,
    ebitdaPct: 26.4,
    status: 'live',
    goLiveDate: '2026-06-02',
    contactEmail: 'ops.natashquan@flowrentals.ca',
    contactPhone: '+1 418 726 3010',
  },
  {
    id: 'p-yna-air',
    name: 'Flow Rentals · Aéroport YNA',
    type: 'car_rental',
    city: 'Natashquan',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Aéroport de Natashquan · Aérogare',
    gps: { lat: 50.19, lng: -61.7892 },
    vehicles: 3,
    monthlyRevenueCad: 22_800,
    ebitdaPct: 24.1,
    status: 'live',
    goLiveDate: '2026-06-02',
    contactEmail: 'yna@flowrentals.ca',
    contactPhone: '+1 418 726 3044',
  },
  {
    id: 'p-yzv-nc',
    name: 'Nord-Côtier Location · Sept-Îles',
    type: 'car_rental',
    city: 'Sept-Îles',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Boulevard Laure · Sept-Îles',
    gps: { lat: 50.2233, lng: -66.2656 },
    vehicles: 18,
    monthlyRevenueCad: 71_200,
    ebitdaPct: 19.8,
    status: 'pilot',
    goLiveDate: '2026-09-01',
    partnerId: 'fp-nordcotier',
    contactEmail: 'partenaires@nordcotier.ca',
  },
  {
    id: 'p-yif',
    name: 'Flow Station Saint-Augustin',
    type: 'both',
    city: 'Saint-Augustin',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Rue de la Rivière · Saint-Augustin',
    gps: { lat: 51.2117, lng: -58.6583 },
    rooms: 16,
    vehicles: 3,
    monthlyRevenueCad: 78_900,
    ebitdaPct: 22.8,
    status: 'live',
    goLiveDate: '2026-05-30',
    contactEmail: 'ops.staugustin@flowrentals.ca',
    contactPhone: '+1 418 947 5100',
  },
  {
    id: 'p-yif-air',
    name: 'Flow Rentals · Aéroport YIF',
    type: 'car_rental',
    city: 'Saint-Augustin',
    country: 'Québec',
    countryCode: 'QC',
    address: 'Aéroport de Saint-Augustin · Aérogare',
    gps: { lat: 51.2117, lng: -58.6583 },
    vehicles: 3,
    monthlyRevenueCad: 18_450,
    ebitdaPct: 21.4,
    status: 'live',
    goLiveDate: '2026-05-30',
    contactEmail: 'yif@flowrentals.ca',
    contactPhone: '+1 418 947 5144',
  },
]

export const FLEET_PARTNERS: FleetPartner[] = [
  {
    id: 'fp-nordcotier',
    name: 'Nord-Côtier Location',
    city: 'Sept-Îles',
    country: 'Québec',
    countryCode: 'QC',
    vehiclesCount: 18,
    vehiclesActiveOnFlow: 12,
    weeklyPayoutCad: 11_500,
    pendingPayoutCad: 11_500,
    commissionPct: 18,
  },
  {
    id: 'fp-ybx',
    name: 'Détroit Auto Services',
    city: 'Lourdes-de-Blanc-Sablon',
    country: 'Québec',
    countryCode: 'QC',
    vehiclesCount: 10,
    vehiclesActiveOnFlow: 8,
    weeklyPayoutCad: 8_450,
    pendingPayoutCad: 8_450,
    commissionPct: 20,
  },
  {
    id: 'fp-yyr',
    name: 'Labrador Fleet Services',
    city: 'Happy Valley-Goose Bay',
    country: 'Terre-Neuve-et-Labrador',
    countryCode: 'NL',
    vehiclesCount: 14,
    vehiclesActiveOnFlow: 10,
    weeklyPayoutCad: 7_160,
    pendingPayoutCad: 7_160,
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
    rateCad: rateMap[type],
    guestName: status === 'occupied' ? randomGuestName(i) : undefined,
  }
})

function randomGuestName(seed: number) {
  const names = [
    'Alexis Gagnon', 'Sarah Bennett', 'Jean-Marc Landry', 'Priya Patel',
    'Olivier Deschênes', 'Fatima Diop', 'Marcus O\'Brien', 'Zhang Wei',
    'Émilie Tremblay', 'Kwame Asante', 'Nadia Haddad', 'Ben Okafor',
    'Léa Dubois', 'Hugo Cormier', 'Sofia Rodríguez', 'Daniel Tessema',
    'Anouk Thériault', 'James Kelly', 'Mei Tanaka', 'Pierre Bourque',
  ]
  return names[seed % names.length]
}

const NATIONALITIES = [
  'Canadienne', 'Québécoise', 'Française', 'Canadienne', 'Américaine',
  'Britannique', 'Québécoise', 'Terre-Neuvienne', 'Américaine', 'Innue',
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
  const rate = room.rateCad
  return {
    id: `RES-${(2026000 + i).toString()}`,
    guestName: randomGuestName(i),
    nationality: NATIONALITIES[i % NATIONALITIES.length],
    checkIn: checkInDate.toISOString().split('T')[0],
    checkOut: checkOutDate.toISOString().split('T')[0],
    nights,
    roomNumber: room.number,
    roomType: room.type,
    rateCad: rate,
    totalCad: rate * nights,
    channel: CHANNELS[i % CHANNELS.length],
    status: STATUS_DIST[i % STATUS_DIST.length],
    paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'paid',
  }
})

export const VEHICLES: Vehicle[] = [
  // Blanc-Sablon (YBX) · parc Flow
  { id: 'v-001', plate: 'H24 JKL', make: 'Ford', model: 'F-150 XLT 4x4', year: 2024, tier: 'Flow Terrain', owner: 'flow', location: 'Aéroport YBX', countryCode: 'QC', status: 'on_rent', km: 28_430, lastServiceDate: '2026-04-12', dailyRateCad: 165, gps: { lat: 51.4436, lng: -57.1853 } },
  { id: 'v-002', plate: 'H24 JKM', make: 'Toyota', model: 'RAV4 AWD', year: 2023, tier: 'Flow Drive', owner: 'flow', location: 'Aéroport YBX', countryCode: 'QC', status: 'available', km: 41_210, lastServiceDate: '2026-04-22', dailyRateCad: 115, gps: { lat: 51.4436, lng: -57.1853 } },
  { id: 'v-003', plate: 'H24 JKN', make: 'Subaru', model: 'Outback', year: 2024, tier: 'Flow Drive', owner: 'flow', location: 'Aéroport YBX', countryCode: 'QC', status: 'on_rent', km: 19_880, lastServiceDate: '2026-05-01', dailyRateCad: 110, gps: { lat: 51.4436, lng: -57.1853 } },
  { id: 'v-004', plate: 'H24 JKP', make: 'Chevrolet', model: 'Silverado 1500', year: 2023, tier: 'Flow Terrain', owner: 'flow', location: 'Flow Station Blanc-Sablon', countryCode: 'QC', status: 'available', km: 52_900, lastServiceDate: '2026-04-30', dailyRateCad: 155, gps: { lat: 51.4436, lng: -57.1853 } },
  // Sept-Îles (YZV) · parc partenaire Nord-Côtier
  { id: 'v-005', plate: 'J18 QRT', make: 'GMC', model: 'Sierra 1500 AT4', year: 2023, tier: 'Flow Terrain', owner: 'partner', partnerName: 'Nord-Côtier Location', location: 'Comptoir Sept-Îles', countryCode: 'QC', status: 'on_rent', km: 86_400, lastServiceDate: '2026-03-19', dailyRateCad: 150, gps: { lat: 50.2233, lng: -66.2656 } },
  { id: 'v-006', plate: 'J18 QRV', make: 'Nissan', model: 'Rogue AWD', year: 2022, tier: 'Flow Drive', owner: 'partner', partnerName: 'Nord-Côtier Location', location: 'Comptoir Sept-Îles', countryCode: 'QC', status: 'available', km: 61_250, lastServiceDate: '2026-04-28', dailyRateCad: 105, gps: { lat: 50.2233, lng: -66.2656 } },
  { id: 'v-007', plate: 'J18 QRW', make: 'Toyota', model: 'Corolla', year: 2024, tier: 'Flow GO', owner: 'partner', partnerName: 'Nord-Côtier Location', location: 'Comptoir Sept-Îles', countryCode: 'QC', status: 'on_rent', km: 34_120, lastServiceDate: '2026-05-04', dailyRateCad: 75, gps: { lat: 50.2233, lng: -66.2656 } },
  { id: 'v-008', plate: 'J18 QRX', make: 'Jeep', model: 'Grand Cherokee', year: 2021, tier: 'Flow Prestige', owner: 'partner', partnerName: 'Nord-Côtier Location', location: 'Comptoir Sept-Îles', countryCode: 'QC', status: 'maintenance', km: 102_780, lastServiceDate: '2026-05-08', dailyRateCad: 195, gps: { lat: 50.2233, lng: -66.2656 } },
  // Natashquan (YNA) · parc Flow
  { id: 'v-009', plate: 'K05 BDF', make: 'Ford', model: 'Explorer 4WD', year: 2024, tier: 'Flow Prestige', owner: 'flow', location: 'Aéroport YNA', countryCode: 'QC', status: 'on_rent', km: 12_400, lastServiceDate: '2026-05-02', dailyRateCad: 190, gps: { lat: 50.19, lng: -61.7892 } },
  { id: 'v-010', plate: 'K05 BDG', make: 'Toyota', model: 'Tacoma TRD', year: 2023, tier: 'Flow Terrain', owner: 'flow', location: 'Aéroport YNA', countryCode: 'QC', status: 'available', km: 28_900, lastServiceDate: '2026-04-18', dailyRateCad: 145, gps: { lat: 50.19, lng: -61.7892 } },
  { id: 'v-011', plate: 'K05 BDH', make: 'Ford', model: 'Transit (9 places)', year: 2022, tier: 'Flow Drive', owner: 'flow', location: 'Flow Station Natashquan', countryCode: 'QC', status: 'overdue', km: 64_220, lastServiceDate: '2026-03-29', dailyRateCad: 135, gps: { lat: 50.19, lng: -61.7892 } },
  // Saint-Augustin (YIF) · parc Flow
  { id: 'v-012', plate: 'L31 MNS', make: 'Chevrolet', model: 'Suburban', year: 2023, tier: 'Flow Elite', owner: 'flow', location: 'Aéroport YIF', countryCode: 'QC', status: 'available', km: 21_440, lastServiceDate: '2026-04-26', dailyRateCad: 275, gps: { lat: 51.2117, lng: -58.6583 } },
  { id: 'v-013', plate: 'L31 MNT', make: 'Honda', model: 'CR-V AWD', year: 2024, tier: 'Flow Drive', owner: 'flow', location: 'Aéroport YIF', countryCode: 'QC', status: 'on_rent', km: 38_860, lastServiceDate: '2026-04-08', dailyRateCad: 115, gps: { lat: 51.2117, lng: -58.6583 } },
  // Happy Valley-Goose Bay (YYR) · parc partenaire Labrador
  { id: 'v-014', plate: 'LAB 4471', make: 'Ford', model: 'F-250 Super Duty', year: 2023, tier: 'Flow Terrain', owner: 'partner', partnerName: 'Labrador Fleet Services', location: 'Comptoir Happy Valley-Goose Bay', countryCode: 'NL', status: 'available', km: 44_180, lastServiceDate: '2026-04-15', dailyRateCad: 170, gps: { lat: 53.3192, lng: -60.4258 } },
  { id: 'v-015', plate: 'LAB 4472', make: 'Toyota', model: 'Highlander AWD', year: 2022, tier: 'Flow Prestige', owner: 'partner', partnerName: 'Labrador Fleet Services', location: 'Comptoir Happy Valley-Goose Bay', countryCode: 'NL', status: 'on_rent', km: 71_930, lastServiceDate: '2026-03-27', dailyRateCad: 185, gps: { lat: 53.3192, lng: -60.4258 } },
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
    ratePerDayCad: v.dailyRateCad,
    totalCad: v.dailyRateCad * days,
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
  { country: 'Québec · Basse-Côte-Nord',  countryCode: 'QC', hotels: 3, fleet: 21, gross: 400_050, ebitda: 27.8, status: 'Live' },
  { country: 'Québec · Côte-Nord',        countryCode: 'QC', hotels: 0, fleet: 18, gross:  71_200, ebitda: 19.8, status: 'Pilot · Q3 2026' },
  { country: 'Terre-Neuve-et-Labrador',   countryCode: 'NL', hotels: 0, fleet: 14, gross:       0, ebitda:  0,   status: 'Phase 2 · Q1 2027' },
  { country: 'Ontario',                   countryCode: 'ON', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
  { country: 'Nunavut',                   countryCode: 'NU', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
  { country: 'Territoires du Nord-Ouest', countryCode: 'NT', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
  { country: 'Manitoba',                  countryCode: 'MB', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
  { country: 'Colombie-Britannique',      countryCode: 'BC', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
  { country: 'Yukon',                     countryCode: 'YT', hotels: 0, fleet: 0,  gross:       0, ebitda:  0,   status: 'Prospect' },
]

export const ARRIVALS_TODAY = [
  { name: 'Sarah Bennett', roomType: 'Suite', eta: '14:30', status: 'confirmed' },
  { name: 'Olivier Deschênes', roomType: 'Deluxe', eta: '15:10', status: 'confirmed' },
  { name: 'Émilie Tremblay', roomType: 'Executive', eta: '16:45', status: 'pending' },
  { name: 'Hugo Cormier', roomType: 'Standard', eta: '18:00', status: 'confirmed' },
  { name: 'Pierre Bourque', roomType: 'Suite', eta: '20:15', status: 'confirmed' },
]

export const NOTIFICATIONS = [
  { id: 'n-1', title: 'Overdue return: K05 BDH', body: 'Natashquan · 2h past expected return', type: 'warning' as const, time: '2m ago' },
  { id: 'n-2', title: 'New booking: Suite 207', body: 'Booking.com · 4 nights · $780', type: 'info' as const, time: '18m ago' },
  { id: 'n-3', title: 'Partner payout pending approval', body: 'Nord-Côtier · $11,500 due Friday', type: 'info' as const, time: '1h ago' },
  { id: 'n-4', title: 'Rate parity alert', body: 'Booking.com lower than Direct on Deluxe', type: 'warning' as const, time: '3h ago' },
]

export const SEARCH_RESULTS_HOTELS = [
  { id: 'h-ybx', name: 'Flow Station Blanc-Sablon', city: 'Lourdes-de-Blanc-Sablon, QC', rating: 4.6, rateCad: 179, amenities: ['Restaurant', 'Starlink', 'Navette aéroport'], partner: false },
  { id: 'h-yna', name: 'Flow Station Natashquan', city: 'Natashquan, QC', rating: 4.5, rateCad: 165, amenities: ['Restaurant', 'Salle de travail', 'Starlink'], partner: false },
  { id: 'h-yif', name: 'Flow Station Saint-Augustin', city: 'Saint-Augustin, QC', rating: 4.4, rateCad: 155, amenities: ['Restaurant', 'Buanderie', 'Navette aéroport'], partner: false },
]

export const SEARCH_RESULTS_CARS = [
  { id: 'c-1', label: 'Chevrolet Suburban', tier: 'Flow Elite', seats: 7, ac: true, gps: true, rateCad: 275, owner: 'Flow Rentals' },
  { id: 'c-2', label: 'Ford Explorer 4WD', tier: 'Flow Prestige', seats: 7, ac: true, gps: true, rateCad: 190, owner: 'Flow Rentals' },
  { id: 'c-3', label: 'Toyota RAV4 AWD', tier: 'Flow Drive', seats: 5, ac: true, gps: true, rateCad: 115, owner: 'Flow Rentals' },
  { id: 'c-4', label: 'Nissan Rogue AWD', tier: 'Flow Drive', seats: 5, ac: true, gps: true, rateCad: 105, owner: 'Powered by Flow — Nord-Côtier' },
  { id: 'c-5', label: 'GMC Sierra 1500 AT4', tier: 'Flow Terrain', seats: 5, ac: true, gps: true, rateCad: 150, owner: 'Powered by Flow — Nord-Côtier' },
  { id: 'c-6', label: 'Toyota Corolla', tier: 'Flow GO', seats: 5, ac: true, gps: false, rateCad: 75, owner: 'Powered by Flow — Nord-Côtier' },
]

/* ------------------------------------------------------------------ */
/* Suppliers & inventory                                              */
/* ------------------------------------------------------------------ */

import type { Supplier, InventoryItem, PurchaseOrder } from './types'

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-vbms-mtl',   name: 'VBMS Logistique Montréal',        country: 'Québec',                  countryCode: 'QC', leadDays:  7, notes: 'Chaîne d’approvisionnement groupe · literie, articles de marque' },
  { id: 'sup-nordik',     name: 'Groupe Nordik Approvisionnement', country: 'Québec',                  countryCode: 'QC', leadDays:  5, notes: 'Alimentation et entretien · centre de distribution Sept-Îles' },
  { id: 'sup-coop-bcn',   name: 'Coop de la Basse-Côte-Nord',      country: 'Québec',                  countryCode: 'QC', leadDays:  2, notes: 'Local Blanc-Sablon · frais et entretien courant' },
  { id: 'sup-lab-supply', name: 'Labrador Supply Co.',             country: 'Terre-Neuve-et-Labrador', countryCode: 'NL', leadDays: 10, notes: 'Réseau Labrador · desserte par vols PAL' },
  { id: 'sup-pieces-cn',  name: 'Pièces d’auto Côte-Nord',         country: 'Québec',                  countryCode: 'QC', leadDays:  4, notes: 'Pièces véhicules et pneus d’hiver' },
]

const inventoryFor = (propertyId: string): InventoryItem[] => [
  // Linens
  { id: `${propertyId}-lin-1`, propertyId, category: 'linens',     name: 'King-size bed sheet set',  unit: 'set',         currentStock: 18, parLevel: 40,  reorderPoint: 24, reorderQty: 30, unitCostCad: 28,    supplierId: 'sup-vbms-mtl',    lastReceived: '2026-04-12' },
  { id: `${propertyId}-lin-2`, propertyId, category: 'linens',     name: 'Bath towel · 600 GSM',     unit: 'unit',        currentStock: 62, parLevel: 120, reorderPoint: 70, reorderQty: 80, unitCostCad: 8.5,   supplierId: 'sup-vbms-mtl',    lastReceived: '2026-04-22' },
  { id: `${propertyId}-lin-3`, propertyId, category: 'linens',     name: 'Pillow case · cotton',     unit: 'unit',        currentStock: 90, parLevel: 120, reorderPoint: 60, reorderQty: 60, unitCostCad: 3.2,   supplierId: 'sup-vbms-mtl' },
  // Toiletries
  { id: `${propertyId}-toi-1`, propertyId, category: 'toiletries', name: 'Shampoo bottle · 50ml',    unit: 'box of 100',  currentStock: 4,  parLevel: 10,  reorderPoint: 5,  reorderQty: 6,  unitCostCad: 42,    supplierId: 'sup-vbms-mtl' },
  { id: `${propertyId}-toi-2`, propertyId, category: 'toiletries', name: 'Branded soap bar',         unit: 'box of 200',  currentStock: 2,  parLevel: 8,   reorderPoint: 4,  reorderQty: 6,  unitCostCad: 78,    supplierId: 'sup-vbms-mtl' },
  { id: `${propertyId}-toi-3`, propertyId, category: 'toiletries', name: 'Body lotion · 50ml',       unit: 'box of 100',  currentStock: 7,  parLevel: 10,  reorderPoint: 5,  reorderQty: 5,  unitCostCad: 38,    supplierId: 'sup-vbms-mtl' },
  // Cleaning
  { id: `${propertyId}-cln-1`, propertyId, category: 'cleaning',   name: 'Multi-surface cleaner',    unit: '5L jerrycan', currentStock: 6,  parLevel: 12,  reorderPoint: 6,  reorderQty: 8,  unitCostCad: 12,    supplierId: 'sup-nordik' },
  { id: `${propertyId}-cln-2`, propertyId, category: 'cleaning',   name: 'Disinfectant',             unit: '5L jerrycan', currentStock: 3,  parLevel:  8,  reorderPoint: 4,  reorderQty: 6,  unitCostCad: 15,    supplierId: 'sup-nordik' },
  { id: `${propertyId}-cln-3`, propertyId, category: 'cleaning',   name: 'Trash liner · 80L',        unit: 'pack of 100', currentStock: 12, parLevel: 20,  reorderPoint: 10, reorderQty: 12, unitCostCad: 9,     supplierId: 'sup-nordik' },
  // F&B
  { id: `${propertyId}-fnb-1`, propertyId, category: 'fnb',        name: 'Bottled water · 500ml',    unit: 'case of 24',  currentStock: 8,  parLevel: 30,  reorderPoint: 15, reorderQty: 20, unitCostCad: 4.8,   supplierId: 'sup-coop-bcn' },
  { id: `${propertyId}-fnb-2`, propertyId, category: 'fnb',        name: 'House coffee · whole bean',unit: 'kg',          currentStock: 5,  parLevel: 20,  reorderPoint: 10, reorderQty: 12, unitCostCad: 14,    supplierId: 'sup-nordik' },
  { id: `${propertyId}-fnb-3`, propertyId, category: 'fnb',        name: 'Breakfast cereal',         unit: 'kg',          currentStock: 14, parLevel: 20,  reorderPoint: 8,  reorderQty: 10, unitCostCad: 6,     supplierId: 'sup-nordik' },
  // Office / branded
  { id: `${propertyId}-off-1`, propertyId, category: 'branded',    name: 'Welcome letter · letterhead', unit: 'pack of 200', currentStock: 5, parLevel: 8, reorderPoint: 4,  reorderQty: 4,  unitCostCad: 18,    supplierId: 'sup-vbms-mtl' },
  { id: `${propertyId}-off-2`, propertyId, category: 'branded',    name: 'Key card · printed',       unit: 'pack of 100', currentStock: 9,  parLevel: 12,  reorderPoint: 6,  reorderQty: 6,  unitCostCad: 32,    supplierId: 'sup-vbms-mtl' },
  // Maintenance / vehicle
  { id: `${propertyId}-mnt-1`, propertyId, category: 'maintenance',name: 'Light bulb · LED 9W',      unit: 'box of 20',   currentStock: 3,  parLevel:  8,  reorderPoint: 4,  reorderQty: 6,  unitCostCad: 22,    supplierId: 'sup-coop-bcn' },
  { id: `${propertyId}-veh-1`, propertyId, category: 'vehicle_consumables', name: 'Engine oil · 5W-30', unit: '5L jerrycan', currentStock: 4, parLevel: 8, reorderPoint: 4, reorderQty: 6, unitCostCad: 28, supplierId: 'sup-pieces-cn' },
]

export const INVENTORY: InventoryItem[] = [
  ...inventoryFor('p-ybx'),
  ...inventoryFor('p-yna'),
  ...inventoryFor('p-yif'),
]

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0044',
    propertyId: 'p-yna',
    supplierId: 'sup-vbms-mtl',
    supplierName: 'VBMS Tunisia SUARL',
    status: 'in_transit',
    createdAt: '2026-04-28',
    expectedAt: '2026-05-12',
    notes: 'Standard quarterly replenishment',
    lines: [
      { itemId: 'p-yna-lin-1', itemName: 'King-size bed sheet set',     qty: 30, unit: 'set',        unitCostCad: 28 },
      { itemId: 'p-yna-lin-2', itemName: 'Bath towel · 600 GSM',        qty: 80, unit: 'unit',       unitCostCad: 8.5 },
      { itemId: 'p-yna-toi-1', itemName: 'Shampoo bottle · 50ml',       qty:  6, unit: 'box of 100', unitCostCad: 42 },
    ],
    totalCad: 30 * 28 + 80 * 8.5 + 6 * 42,
  },
  {
    id: 'PO-2026-0045',
    propertyId: 'p-ybx',
    supplierId: 'sup-coop-bcn',
    supplierName: 'Sodimat SARL',
    status: 'approved',
    createdAt: '2026-05-04',
    expectedAt: '2026-05-08',
    lines: [
      { itemId: 'p-ybx-mnt-1', itemName: 'Light bulb · LED 9W',        qty:  6, unit: 'box of 20',   unitCostCad: 22 },
    ],
    totalCad: 6 * 22,
  },
  {
    id: 'PO-2026-0046',
    propertyId: 'p-yif',
    supplierId: 'sup-pieces-cn',
    supplierName: 'Toyota Québec',
    status: 'submitted',
    createdAt: '2026-05-08',
    lines: [
      { itemId: 'p-yif-veh-1', itemName: 'Engine oil · 5W-30',         qty:  6, unit: '5L jerrycan', unitCostCad: 28 },
    ],
    totalCad: 6 * 28,
  },
  {
    id: 'PO-2026-0043',
    propertyId: 'p-yna',
    supplierId: 'sup-coop-bcn',
    supplierName: 'Québec Fresh Produce Co-op',
    status: 'received',
    createdAt: '2026-05-06',
    expectedAt: '2026-05-07',
    lines: [
      { itemId: 'p-yna-fnb-1', itemName: 'Bottled water · 500ml',      qty: 20, unit: 'case of 24',  unitCostCad: 4.8 },
      { itemId: 'p-yna-fnb-3', itemName: 'Breakfast cereal',           qty: 10, unit: 'kg',          unitCostCad: 6 },
    ],
    totalCad: 20 * 4.8 + 10 * 6,
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
  { tier: 'Silver',   minSpendCad: 0,      minStays: 0,  pointsMultiplier: 1,    perks: ['Welcome drink', 'Late check-out (subject to availability)'] },
  { tier: 'Gold',     minSpendCad: 5_000,  minStays: 6,  pointsMultiplier: 1.5,  perks: ['Free breakfast', 'Room upgrade at check-in', 'Late check-out 4pm', '24h cancellation'] },
  { tier: 'Platinum', minSpendCad: 15_000, minStays: 15, pointsMultiplier: 2,    perks: ['Suite upgrade (subject to availability)', 'Free airport transfer (each market)', 'Flow GO car included one weekend / yr', 'Dedicated concierge'] },
  { tier: 'Black',    minSpendCad: 40_000, minStays: 30, pointsMultiplier: 3,    perks: ['Guaranteed suite', 'Black-tier-only F&B menu', 'Private welcome at airport', 'Annual two-night stay any market'] },
]

export const REWARDS_MEMBERS: RewardsMember[] = [
  { id:'m-1', name:'Sarah Bennett',         initials:'SB', email:'sarah.bennett@example.com', country:'United Kingdom',  tier:'Gold',     points:14_200, lifetimeEarned:24_440, lifetimeBurned:10_240, joined:'2023-11-04', lastActivity:'2026-05-09', qualifyingActivityYtd:{ stays: 7, rentals: 3, spendCad:  9_840 } },
  { id:'m-2', name:'Jean-Marc Landry',     initials:'JL', email:'jm@landry.ca',              countryCode:'QC', country:'Québec',           tier:'Platinum', points:28_750, lifetimeEarned:54_120, lifetimeBurned:25_370, joined:'2023-08-22', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:18, rentals: 7, spendCad: 22_180 } },
  { id:'m-3', name:'Priya Patel',           initials:'PP', email:'priya@example.com',          country:'India',           tier:'Silver',   points: 4_840, lifetimeEarned: 6_120, lifetimeBurned: 1_280, joined:'2024-06-18', lastActivity:'2026-04-12', qualifyingActivityYtd:{ stays: 2, rentals: 1, spendCad:  1_840 } },
  { id:'m-4', name:'Anouk Thériault',           initials:'AT', email:'anouk.t@example.ca',         countryCode:'QC', country:'Québec',          tier:'Gold',     points:11_320, lifetimeEarned:18_880, lifetimeBurned: 7_560, joined:'2024-02-01', lastActivity:'2026-05-08', qualifyingActivityYtd:{ stays: 8, rentals: 2, spendCad:  8_140 } },
  { id:'m-5', name:'Olivier Deschênes',      initials:'OD', email:'olivier@example.ca',         countryCode:'NL', country:'Labrador',        tier:'Gold',     points: 9_840, lifetimeEarned:15_220, lifetimeBurned: 5_380, joined:'2024-04-10', lastActivity:'2026-05-07', qualifyingActivityYtd:{ stays: 6, rentals: 2, spendCad:  6_840 } },
  { id:'m-6', name:'Alexis Gagnon',           initials:'AG', email:'alexis.g@example.ca',         countryCode:'QC', country:'Québec',          tier:'Silver',   points: 2_180, lifetimeEarned: 2_980, lifetimeBurned:     800, joined:'2025-03-08', lastActivity:'2026-05-06', qualifyingActivityYtd:{ stays: 3, rentals: 0, spendCad:  1_220 } },
  { id:'m-7', name:'Daniel Thériault',      initials:'DT', email:'daniel.t@example.ca',        countryCode:'NL', country:'Labrador',       tier:'Silver',   points: 6_440, lifetimeEarned: 8_120, lifetimeBurned: 1_680, joined:'2024-11-29', lastActivity:'2026-05-04', qualifyingActivityYtd:{ stays: 4, rentals: 1, spendCad:  3_240 } },
  { id:'m-8', name:'Hugo Cormier',          initials:'HC', email:'hugo.c@example.ca',         countryCode:'QC', country:'Québec',          tier:'Gold',     points:13_180, lifetimeEarned:18_440, lifetimeBurned: 5_260, joined:'2023-12-12', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays: 7, rentals: 4, spendCad:  9_180 } },
  { id:'m-9', name:'Léa Dubois',            initials:'LD', email:'lea.d@example.ca',           countryCode:'QC', country:'Québec',         tier:'Platinum', points:31_400, lifetimeEarned:48_120, lifetimeBurned:16_720, joined:'2023-09-04', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:14, rentals: 5, spendCad: 17_240 } },
  { id:'m-10', name:'Thomas Morin',         initials:'TM', email:'t.morin@example.ca',         countryCode:'QC', country:'Québec',         tier:'Silver',   points:    420, lifetimeEarned:    420, lifetimeBurned:       0, joined:'2026-04-22', lastActivity:'2026-05-09', qualifyingActivityYtd:{ stays: 1, rentals: 0, spendCad:     180 } },
  { id:'m-11', name:'Kevin Arsenault',      initials:'KA', email:'k.arsenault@example.ca',     countryCode:'NL', country:'Labrador',       tier:'Black',    points:42_080, lifetimeEarned:118_420, lifetimeBurned:76_340, joined:'2023-03-18', lastActivity:'2026-05-10', qualifyingActivityYtd:{ stays:32, rentals:12, spendCad: 47_840 }, frozen: false },
  { id:'m-12', name:'Frédérique Bélanger',  initials:'FB', email:'f.belanger@example.ca',      countryCode:'QC', country:'Québec',         tier:'Gold',     points: 9_480, lifetimeEarned:12_640, lifetimeBurned: 3_160, joined:'2024-07-08', lastActivity:'2026-05-04', qualifyingActivityYtd:{ stays: 5, rentals: 2, spendCad:  5_640 } },
]

export const REWARDS_TRANSACTIONS: RewardsTransaction[] = [
  // m-1 Sarah
  { id:'tx-1001', memberId:'m-1', date:'2026-05-09', type:'earn',   delta: +480,  reason:'Stay · Flow Station Natashquan · 4 nights · Suite 102', staff:'system',           reference:'RES-2026001' },
  { id:'tx-1002', memberId:'m-1', date:'2026-05-02', type:'earn',   delta: +360,  reason:'Car rental · Toyota Highlander AWD · 3 days',                staff:'system',           reference:'RNT-900101' },
  { id:'tx-1003', memberId:'m-1', date:'2026-04-25', type:'burn',   delta:-2000, reason:'Free night redemption · Blanc-Sablon · Standard',     staff:'system' },
  { id:'tx-1004', memberId:'m-1', date:'2026-04-22', type:'earn',   delta: +780,  reason:'Stay · Flow Station Natashquan · 4 nights · Suite 207', staff:'system',           reference:'RES-2026004' },
  { id:'tx-1005', memberId:'m-1', date:'2026-03-18', type:'earn',   delta: +440,  reason:'Stay · Flow Station Saint-Augustin · Deluxe',           staff:'system',           reference:'RES-2026088' },
  { id:'tx-1006', memberId:'m-1', date:'2026-02-15', type:'adjust', delta: +500,  reason:'Service recovery · room maintenance during stay',   staff:'Karine Lévesque' },
  { id:'tx-1007', memberId:'m-1', date:'2026-01-08', type:'burn',   delta:-1500, reason:'Car rental upgrade · Elite tier · 2 days',          staff:'system' },
  // m-2 Jean-Marc
  { id:'tx-1010', memberId:'m-2', date:'2026-05-10', type:'earn',   delta:+1200, reason:'Stay · Flow Station Blanc-Sablon · 8 nights',         staff:'system',           reference:'RES-2026200' },
  { id:'tx-1011', memberId:'m-2', date:'2026-05-01', type:'earn',   delta: +860, reason:'Stay · Flow Station Saint-Augustin · 5 nights',         staff:'system',           reference:'RES-2026188' },
  { id:'tx-1012', memberId:'m-2', date:'2026-04-15', type:'transfer', delta: -3000, reason:'Transferred 3,000 pts to Léa Dubois (m-9)',     staff:'Karine Lévesque' },
  // m-4 Aïcha
  { id:'tx-1020', memberId:'m-4', date:'2026-05-08', type:'earn',   delta: +320, reason:'Stay · Flow Station Natashquan · 3 nights',             staff:'system',           reference:'RES-2026220' },
  // m-11 Kwame (Black tier)
  { id:'tx-1030', memberId:'m-11', date:'2026-05-10', type:'earn',  delta:+2400, reason:'Stay · Flow Station Blanc-Sablon · 8 nights · Black multiplier', staff:'system', reference:'RES-2026280' },
  { id:'tx-1031', memberId:'m-11', date:'2026-04-22', type:'burn',  delta:-12_000, reason:'Annual two-night anywhere · Saint-Augustin · Suite', staff:'system' },
]

export const REWARDS_DISPUTES: RewardsDispute[] = [
  {
    id:'d-501', memberId:'m-1', memberName:'Sarah Bennett',
    kind:'missing_stay', status:'in_review', filedAt:'2026-05-08',
    ask:'4-night stay at Flow Station Natashquan (RES-2026004) shows in my account but no points were credited.',
    evidence:['booking_confirmation.pdf', 'card_charge.png'],
    reference:'RES-2026004',
  },
  {
    id:'d-502', memberId:'m-4', memberName:'Anouk Thériault',
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
    id:'d-504', memberId:'m-5', memberName:'Olivier Deschênes',
    kind:'missing_rental', status:'approved', filedAt:'2026-05-02', resolvedAt:'2026-05-04',
    ask:'Toyota Highlander AWD rental from Sept-Îles (RNT-900099) earned 0 pts. Should be 220.',
    reference:'RNT-900099',
    resolution:'Confirmed against Nord-Côtier partner ledger · 220 pts credited',
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
  { id:'pt-1', partnerName:'Québécois Airlines · ShebaMiles', partnerKind:'airline',   flowPoints:  84_220, partnerPoints:  84_220, delta:      0, cycleLabel:'W18 · 2026', status:'in_balance',       lastReconciledAt:'2026-05-09' },
  { id:'pt-2', partnerName:'PAL Airlines · Asante',          partnerKind:'airline',   flowPoints:  52_180, partnerPoints:  53_440, delta: +1_260, cycleLabel:'W18 · 2026', status:'discrepancy',      lastReconciledAt:'2026-05-09' },
  { id:'pt-3', partnerName:'Booking.com Genius',              partnerKind:'ota',       flowPoints:  46_980, partnerPoints:  46_980, delta:      0, cycleLabel:'W18 · 2026', status:'in_balance',       lastReconciledAt:'2026-05-09' },
  { id:'pt-4', partnerName:'Standard Bank Blue · co-brand',   partnerKind:'card',      flowPoints:  28_640, partnerPoints:       0, delta:-28_640, cycleLabel:'W18 · 2026', status:'awaiting_partner' },
  { id:'pt-5', partnerName:'Nord-Côtier Location',          partnerKind:'fleet',     flowPoints:  19_240, partnerPoints:  19_460, delta:   +220, cycleLabel:'W18 · 2026', status:'discrepancy',      lastReconciledAt:'2026-05-08' },
  { id:'pt-6', partnerName:'Consortium Baie-Nord corporate',      partnerKind:'corporate', flowPoints:  14_120, partnerPoints:  14_120, delta:      0, cycleLabel:'W18 · 2026', status:'settled',          lastReconciledAt:'2026-05-07' },
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
  { id:'u-3', kind:'staff',  name:'Marie-Claude Boudreau',        initials:'MB', role:'country_manager',  countryCode:'QC', lastSeenAt:'2026-05-10T13:55:00Z' },
  { id:'u-4', kind:'staff',  name:'Jean-Philippe Bouchard',       initials:'JB', role:'hotel_manager',    countryCode:'QC', propertyId:'p-ybx', lastSeenAt:'2026-05-10T13:30:00Z' },
  { id:'u-5', kind:'staff',  name:'Simon Lapierre',               initials:'SL', role:'car_agent',        countryCode:'QC', lastSeenAt:'2026-05-10T13:48:00Z' },
  { id:'u-8', kind:'staff',  name:'Karine Lévesque',              initials:'KL', role:'reward_manager',   lastSeenAt:'2026-05-10T12:11:00Z' },
  { id:'fp-nordcotier', kind:'partner', name:'Nord-Côtier Location', initials:'NC', partnerId:'fp-nordcotier', lastSeenAt:'2026-05-10T09:14:00Z' },
  { id:'fp-ybx',        kind:'partner', name:'Détroit Auto Services', initials:'DA', partnerId:'fp-ybx',        lastSeenAt:'2026-05-09T17:42:00Z' },
  { id:'m-1', kind:'guest',  name:'Sarah Bennett',            initials:'SB', memberId:'m-1' },
  { id:'m-4', kind:'guest',  name:'Anouk Thériault',              initials:'AT', memberId:'m-4' },
  { id:'m-5', kind:'guest',  name:'Olivier Deschênes',            initials:'OD', memberId:'m-5' },
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
  { id:'c-2', title:'Nord-Côtier · weekly payout W18',
    participantIds:['fp-nordcotier', 'u-3', 'u-1'], context:{ type:'partner', ref:'fp-nordcotier' },
    lastMessageAt: T(13, 12),
    lastMessagePreview:'Sending the bank transfer Friday morning. Will share confirmation here.',
    unread:{ 'fp-nordcotier': 0, 'u-3': 0, 'u-1': 1 } },
  { id:'c-3', title:'Anouk Thériault · missing points dispute',
    participantIds:['m-4', 'u-8'], context:{ type:'rewards', ref:'d-502' },
    lastMessageAt: T(13, 4),
    lastMessagePreview:'Booking confirmation attached. The stay was 3 nights, not 1.',
    unread:{ 'm-4': 0, 'u-8': 2 } },
  { id:'c-4', title:'Olivier Deschênes · airport pickup',
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
  { id:'c-7', title:'Détroit Auto · vehicle J18 QRX maintenance',
    participantIds:['fp-ybx', 'u-3'], context:{ type:'partner', ref:'fp-ybx' },
    lastMessageAt: T(9, 14),
    lastMessagePreview:'Service report attached. Vehicle back on the platform by Tuesday.',
    unread:{ 'fp-ybx': 0, 'u-3': 1 } },
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

  // c-2 Nord-Côtier + Aisha + Vistel
  { id:'msg-1010', conversationId:'c-2', fromId:'u-3', sentAt: T(8, 30),  body:'Hi @Nord-Cotier — confirming this week\'s payout: $11,500 net of commission. Bank: Desjardins ··· 1150. OK to release?', readBy:['u-3','u-1','fp-nordcotier'] },
  { id:'msg-1011', conversationId:'c-2', fromId:'fp-nordcotier', sentAt: T(9, 14),
    body:'Confirmed receipt. One vehicle (J18 QRT) had a discrepancy of 2 rental days vs our records — sending reconciliation report.',
    readBy:['u-3','u-1','fp-nordcotier'],
    attachments:[att('att-1', 'nordcotier-reconciliation-S18.pdf', 'application/pdf', 142_300, 'fp-nordcotier', T(9, 14))] },
  { id:'msg-1012', conversationId:'c-2', fromId:'u-3', sentAt: T(12, 4),  body:'Reviewed — confirmed your records are correct. I\'ll adjust the ledger on our side. Releasing payout Friday as agreed.', readBy:['u-3','u-1','fp-nordcotier'] },
  { id:'msg-1013', conversationId:'c-2', fromId:'fp-nordcotier', sentAt: T(13, 12), body:'Sending the bank transfer Friday morning. Will share confirmation here.', readBy:['u-3','fp-nordcotier'] },

  // c-3 Aïcha ↔ Naledi
  { id:'msg-1020', conversationId:'c-3', fromId:'m-4', sentAt: T(11, 18), body:'I filed dispute d-502 — only got 120 pts for my May 5 stay but it should be 320 (3 nights · Deluxe).', readBy:['m-4','u-8'] },
  { id:'msg-1021', conversationId:'c-3', fromId:'u-8', sentAt: T(11, 47), body:'Hi Aïcha — looking into it now. Can you send your booking confirmation so I can match against the partner ledger?', readBy:['m-4','u-8'] },
  { id:'msg-1022', conversationId:'c-3', fromId:'m-4', sentAt: T(13, 4),
    body:'Booking confirmation attached. The stay was 3 nights, not 1.', readBy:['m-4'],
    attachments:[att('att-2', 'booking-RES-2026220.pdf', 'application/pdf', 86_200, 'm-4', T(13, 4))] },

  // c-4 Olusegun ↔ Daniel
  { id:'msg-1030', conversationId:'c-4', fromId:'m-5', sentAt: T(12, 32), body:'Hi — my flight (KQ 412) lands today at 15:10. Just confirming Toyota Highlander AWD pickup details.', readBy:['m-5','u-5'] },
  { id:'msg-1031', conversationId:'c-4', fromId:'u-5', sentAt: T(12, 51), body:'Flight KQ 412 lands 15:10. Driver will be at Arrivals B with a Flow sign.', readBy:['m-5','u-5'] },

  // c-5 Kwame ↔ Naledi
  { id:'msg-1040', conversationId:'c-5', fromId:'m-11', sentAt: T(11, 10), body:'Question on the Black-tier annual stay: is the two-night benefit fully flexible / cancellable?', readBy:['m-11','u-8'] },
  { id:'msg-1041', conversationId:'c-5', fromId:'u-8',  sentAt: T(11, 38), body:'Yes — the annual two-night stay is fully refundable up to 48h before arrival.', readBy:['u-8'] },

  // c-6 Internal
  { id:'msg-1050', conversationId:'c-6', fromId:'u-3', sentAt: T(9, 50),  body:'Team — staffing for next week. Daniel, can you cover the Friday airport shift? Jean-Paul, OK to approve PTO for Aisha N., Henry M., and Émilie T.?', readBy:['u-3','u-4','u-5'] },
  { id:'msg-1051', conversationId:'c-6', fromId:'u-5', sentAt: T(10, 6),  body:'Friday airport — yes, I can cover.', readBy:['u-3','u-4','u-5'] },
  { id:'msg-1052', conversationId:'c-6', fromId:'u-4', sentAt: T(10, 22), body:'PTO approved for all three. Daniel covers the Friday airport shift.', readBy:['u-3','u-4','u-5'] },

  // c-7 Détroit Auto
  { id:'msg-1060', conversationId:'c-7', fromId:'fp-ybx', sentAt: T(9, 14),
    body:'Service report attached. Vehicle back on the platform by Tuesday.', readBy:['fp-ybx'],
    attachments:[att('att-3', 'service-report-UAJ871C.pdf', 'application/pdf', 224_140, 'fp-ybx', T(9, 14))] },

  // c-8 Older invoice request
  { id:'msg-1070', conversationId:'c-8', fromId:'m-1', sentAt: T(8, 30, '2026-05-09'), body:'Hi — could I get a VAT-compliant invoice for the May stay? Need it for expense filing.', readBy:['m-1','u-3'] },
  { id:'msg-1071', conversationId:'c-8', fromId:'u-3', sentAt: T(8, 55, '2026-05-09'), body:'Forwarded to finance · they\'ll send the VAT-compliant PDF by 17:00.', readBy:['m-1','u-3'] },
]

export const REWARDS_AUDIT: RewardsAuditEntry[] = [
  { id:'a-9001', ts:'2026-05-10T14:42:00Z', staff:'Karine Lévesque',  action:'approve_dispute',     memberId:'m-5', memberName:'Olivier Deschênes', details:'Resolved d-504 · 220 pts credited for RNT-900099', delta:+220 },
  { id:'a-9002', ts:'2026-05-10T13:18:00Z', staff:'Karine Lévesque',  action:'adjust_points',       memberId:'m-1', memberName:'Sarah Bennett',    details:'Manual credit · service recovery during April stay',  delta:+500 },
  { id:'a-9003', ts:'2026-05-09T11:02:00Z', staff:'Vistel Ganongo',action:'reconcile_partnership', details:'Reconciled Booking.com Genius cycle W18 · in balance' },
  { id:'a-9004', ts:'2026-05-08T16:30:00Z', staff:'Karine Lévesque',  action:'set_tier',            memberId:'m-11', memberName:'Kwame Asante',     details:'Tier overridden to Black after spend hit $47,840 YTD' },
  { id:'a-9005', ts:'2026-05-08T10:11:00Z', staff:'Karine Lévesque',  action:'reject_dispute',      memberId:'m-3', memberName:'Priya Patel',      details:'Rejected d-505 · Expedia stays excluded from earn per T&Cs' },
  { id:'a-9006', ts:'2026-05-06T09:48:00Z', staff:'Vistel Ganongo',action:'set_tier_thresholds', details:'Raised Gold minStays from 5 to 6 (programme refresh)' },
  { id:'a-9007', ts:'2026-04-30T17:22:00Z', staff:'Karine Lévesque',  action:'freeze_member',       memberId:'m-12', memberName:'Fatima Benali',    details:'Frozen for review · unusual burn pattern flagged by fraud rules' },
  { id:'a-9008', ts:'2026-04-30T17:30:00Z', staff:'Karine Lévesque',  action:'unfreeze_member',     memberId:'m-12', memberName:'Fatima Benali',    details:'False positive · activity legitimate, member unfrozen' },
]
