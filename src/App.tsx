/**
 * Route table for Flow Rentals OS.
 *
 * Routes are split into separate chunks via React.lazy so the initial bundle
 * stays small (~80–120 KB gzipped). Each role only downloads the pages it
 * actually navigates to.
 *
 * Eager imports are reserved for the shell + auth entry point:
 *   - AppLayout / PublicLayout (always rendered)
 *   - Login (every unauthenticated visitor lands here)
 *   - Root (the redirect-on-load)
 */
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'
import { ROLE_HOMES } from './lib/sampleData'

// Admin
const Portfolio = lazy(() => import('./pages/admin/Portfolio'))
const Properties = lazy(() => import('./pages/admin/Properties'))
const PropertyDetail = lazy(() => import('./pages/admin/PropertyDetail'))
const Users = lazy(() => import('./pages/admin/Users'))
const Channels = lazy(() => import('./pages/admin/Channels'))
const Procurement = lazy(() => import('./pages/admin/Procurement'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const SecurityDashboard = lazy(() => import('./pages/admin/Security'))

// Hotels
const HotelDashboard = lazy(() => import('./pages/hotels/Dashboard'))
const Reservations = lazy(() => import('./pages/hotels/Reservations'))
const ReservationDetail = lazy(() => import('./pages/hotels/ReservationDetail'))
const Rooms = lazy(() => import('./pages/hotels/Rooms'))
const Housekeeping = lazy(() => import('./pages/hotels/Housekeeping'))
const FrontDesk = lazy(() => import('./pages/hotels/FrontDesk'))
const Guests = lazy(() => import('./pages/hotels/Guests'))
const FnB = lazy(() => import('./pages/hotels/FnB'))
const HotelReports = lazy(() => import('./pages/hotels/Reports'))
const Inventory = lazy(() => import('./pages/hotels/Inventory'))

// Pods (isolement)
const Pods = lazy(() => import('./pages/pods/Pods'))

// Vending (distributrices)
const VendingMachines = lazy(() => import('./pages/vending/Machines'))
const VendingRestock = lazy(() => import('./pages/vending/Restock'))

// Fleet
const FleetDashboard = lazy(() => import('./pages/fleet/Dashboard'))
const PartnerPortal = lazy(() => import('./pages/fleet/PartnerPortal'))
const Vehicles = lazy(() => import('./pages/fleet/Vehicles'))
const Rentals = lazy(() => import('./pages/fleet/Rentals'))
const RentalDetail = lazy(() => import('./pages/fleet/RentalDetail'))
const Kiosk = lazy(() => import('./pages/fleet/Kiosk'))
const Drivers = lazy(() => import('./pages/fleet/Drivers'))
const Gps = lazy(() => import('./pages/fleet/Gps'))
const FleetReports = lazy(() => import('./pages/fleet/Reports'))

// Payments
const PaymentsDashboard = lazy(() => import('./pages/payments/Dashboard'))
const Invoices = lazy(() => import('./pages/payments/Invoices'))
const Payouts = lazy(() => import('./pages/payments/Payouts'))
const Accounting = lazy(() => import('./pages/payments/Accounting'))

// Rewards
const RewardsLayout = lazy(() => import('./pages/rewards/RewardsLayout'))
const RewardsMembers = lazy(() => import('./pages/rewards/Members'))
const RewardsMemberDetail = lazy(() => import('./pages/rewards/MemberDetail'))
const RewardsDisputes = lazy(() => import('./pages/rewards/Disputes'))
const RewardsPartnerships = lazy(() => import('./pages/rewards/Partnerships'))
const RewardsAuditLog = lazy(() => import('./pages/rewards/AuditLog'))
const RewardsTiers = lazy(() => import('./pages/rewards/Tiers'))

// Top-level
const Messages = lazy(() => import('./pages/Messages'))
const Reports = lazy(() => import('./pages/Reports'))

// Public booking flow
const Search = lazy(() => import('./pages/booking/Search'))
const Results = lazy(() => import('./pages/booking/Results'))
const Checkout = lazy(() => import('./pages/booking/Checkout'))
const Confirmation = lazy(() => import('./pages/booking/Confirmation'))
const Account = lazy(() => import('./pages/booking/Account'))

// Marketing landing
const Landing = lazy(() => import('./pages/Landing'))

/**
 * Authenticated visitors skip the marketing landing entirely · they go
 * straight to their role home (Hotel Manager → /hotels/dashboard, etc.).
 * Unauthenticated visitors see the landing page.
 */
function Root() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={ROLE_HOMES[user.role]} replace />
  return <Landing />
}

/**
 * Sub-100ms route transitions feel instant · we render a discreet pulse
 * rather than a heavy spinner so users don't perceive a "reload".
 */
function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[40vh] flex items-center justify-center text-g40 dark:text-g60"
    >
      <span className="animate-pulse text-sm label-caps">Loading…</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Marketing landing + guest-facing booking · share the public chrome */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Root />} />
          <Route path="/booking/search" element={<Search />} />
          <Route path="/booking/results" element={<Results />} />
          <Route path="/booking/checkout" element={<Checkout />} />
          <Route path="/booking/confirmation" element={<Confirmation />} />
          <Route path="/booking/account" element={<Account />} />
        </Route>

        {/* Authenticated back-office */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Root />} />

          <Route path="/admin/portfolio" element={<Portfolio />} />
          <Route path="/admin/properties" element={<Properties />} />
          <Route path="/admin/properties/:id" element={<PropertyDetail />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/channels" element={<Channels />} />
          <Route path="/admin/procurement" element={<Procurement />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/security" element={<SecurityDashboard />} />

          <Route path="/messages" element={<Messages />} />

          <Route path="/hotels/dashboard" element={<HotelDashboard />} />
          <Route path="/hotels/reservations" element={<Reservations />} />
          <Route path="/hotels/reservations/:id" element={<ReservationDetail />} />
          <Route path="/hotels/rooms" element={<Rooms />} />
          <Route path="/hotels/housekeeping" element={<Housekeeping />} />
          <Route path="/hotels/front-desk" element={<FrontDesk />} />
          <Route path="/hotels/guests" element={<Guests />} />
          <Route path="/hotels/fnb" element={<FnB />} />
          <Route path="/hotels/reports" element={<HotelReports />} />
          <Route path="/hotels/inventory" element={<Inventory />} />

          <Route path="/pods" element={<Pods />} />

          <Route path="/vending/machines" element={<VendingMachines />} />
          <Route path="/vending/restock" element={<VendingRestock />} />

          <Route path="/fleet/dashboard" element={<FleetDashboard />} />
          <Route path="/fleet/partner-portal" element={<PartnerPortal />} />
          <Route path="/fleet/vehicles" element={<Vehicles />} />
          <Route path="/fleet/bookings" element={<Rentals />} />
          <Route path="/fleet/bookings/:id" element={<RentalDetail />} />
          <Route path="/fleet/kiosk" element={<Kiosk />} />
          <Route path="/fleet/drivers" element={<Drivers />} />
          <Route path="/fleet/gps" element={<Gps />} />
          <Route path="/fleet/reports" element={<FleetReports />} />

          <Route path="/payments/dashboard" element={<PaymentsDashboard />} />
          <Route path="/payments/invoices" element={<Invoices />} />
          <Route path="/payments/payouts" element={<Payouts />} />
          <Route path="/payments/accounting" element={<Accounting />} />

          <Route path="/rewards" element={<RewardsLayout />}>
            <Route index element={<Navigate to="/rewards/members" replace />} />
            <Route path="members" element={<RewardsMembers />} />
            <Route path="members/:id" element={<RewardsMemberDetail />} />
            <Route path="disputes" element={<RewardsDisputes />} />
            <Route path="partnerships" element={<RewardsPartnerships />} />
            <Route path="audit" element={<RewardsAuditLog />} />
            <Route path="tiers" element={<RewardsTiers />} />
          </Route>
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
