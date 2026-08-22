/**
 * Public landing page · `/`
 *
 * The first thing every unauthenticated visitor sees. Tells the brand
 * story before pushing anyone toward booking or sign-in.
 *
 * Sections (top-to-bottom):
 *   1. Hero          · pitch + dual CTA (book a stay / partner with us)
 *   2. Trust strip   · live markets, properties, fleet, rewards members
 *   3. Why Flow      · three-up value pillars
 *   4. Network       · 54-country presence with live / pilot / prospect badges
 *   5. Hotels        · the flagship property cards
 *   6. Rewards       · Silver → Black tier ladder
 *   7. Pricing       · stay-from rates + reward earn / burn economics
 *   8. Partners      · "Become a Flow partner" mini-section for hotel & fleet owners
 *   9. Final CTA     · book a stay
 *
 * Authenticated users skip this page via the `<Root>` redirect in App.tsx —
 * they go straight to their role home (SuperAdmin to portfolio, Hotel
 * Manager to the front desk, etc).
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, Award, Building2, Car, CheckCircle2, ChevronRight, Crown,
  Globe2, Hotel, MapPin, ShieldCheck, Sparkles, Star, TrendingUp, Users, Zap,
} from 'lucide-react'
import { FlowWordmark } from '../components/flow/FlowWordmark'
import { PROPERTIES, REWARDS_TIERS, REWARDS_MEMBERS } from '../lib/sampleData'
import { PROVINCES, MARKET_STATUS, AIRPORT_COUNT, AIRPORTS, type DeploymentStatus } from '../lib/canada'
import type { RewardsTier } from '../lib/types'
import { cn, formatCurrency } from '../lib/utils'

/* ------------------------------------------------------------------ */
/* Derived numbers · live data, not hardcoded                          */
/* ------------------------------------------------------------------ */

const LIVE_PROPERTIES = PROPERTIES.filter((p) => p.status === 'live')
const LIVE_HOTELS = LIVE_PROPERTIES.filter((p) => p.type !== 'car_rental')
const LIVE_VEHICLES_COUNT = LIVE_PROPERTIES.reduce((s, p) => s + (p.vehicles ?? 0), 0)
const LIVE_ROOMS_COUNT = LIVE_PROPERTIES.reduce((s, p) => s + (p.rooms ?? 0), 0)
const LIVE_PROVINCES = new Set(LIVE_PROPERTIES.map((p) => p.countryCode)).size
const NETWORK_AIRPORTS = AIRPORTS.length

const STATUS_LABEL: Record<DeploymentStatus, string> = {
  live:     'Live',
  pilot:    'Commissioning',
  prospect: 'Phase 2',
  future:   'Phase 3',
}

const STATUS_TONE: Record<DeploymentStatus, string> = {
  live:     'bg-teal text-white',
  pilot:    'bg-copper text-white',
  prospect: 'bg-copper-light text-copper-dark',
  future:   'bg-g20/60 text-g80',
}

const TIER_ACCENT: Record<RewardsTier, { ring: string; chip: string; icon: string; label: string }> = {
  Silver:   { ring: 'border-g40',       chip: 'bg-g20/40 text-ink',                    icon: 'text-g60',    label: 'Welcome' },
  Gold:     { ring: 'border-copper',    chip: 'bg-copper-light text-copper-dark',      icon: 'text-copper', label: 'Most popular' },
  Platinum: { ring: 'border-teal',      chip: 'bg-teal-light text-teal-dark',          icon: 'text-teal',   label: 'Frequent traveller' },
  Black:    { ring: 'border-ink dark:border-ivory', chip: 'bg-coal text-ivory',        icon: 'text-copper', label: 'Invitation only' },
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  return (
    <div className="-mt-1">
      <Hero />
      <TrustStrip />
      <WhyFlow />
      <Network />
      <Hotels />
      <Rewards />
      <Pricing />
      <Partners />
      <FinalCta />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-coal text-ivory">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(184,115,51,0.55),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(11,110,110,0.65),transparent_55%)]" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <FlowWordmark size="xl" variant="dark" tagline className="mx-auto" />
        <h1 className="mt-8 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-3xl mx-auto">
          One operating system for{' '}
          <span className="text-copper">Stay &amp; Drive</span> across northern Canada.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-g80 max-w-2xl mx-auto">
          Book your room and your airport vehicle in a single confirmation.
          Earn one rewards balance that travels with you from Blanc-Sablon to Natashquan to Sept-Îles — and soon Happy Valley-Goose Bay, Wabush and the whole Labrador coast.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/booking/search"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input bg-copper text-white hover:bg-copper-dark font-medium shadow-panel"
          >
            Book a stay <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#partners"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input border border-ivory/30 text-ivory hover:bg-ivory/10 font-medium"
          >
            Partner with Flow
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input text-ivory/80 hover:text-ivory text-sm"
          >
            Staff sign-in <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Trust strip                                                      */
/* ------------------------------------------------------------------ */

function TrustStrip() {
  return (
    <section className="bg-white dark:bg-panel-mid border-b border-g20/60">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat value={String(LIVE_PROVINCES)} label="Live provinces" hint="Québec · (phase 2) Labrador" />
        <Stat value={String(LIVE_PROPERTIES.length)} label="Active locations" hint={`${LIVE_HOTELS.length} stations + ${LIVE_PROPERTIES.length - LIVE_HOTELS.length} rental desks`} />
        <Stat value={String(LIVE_VEHICLES_COUNT)} label="Vehicles on platform" hint="Flow-owned + partner fleet" />
        <Stat value={REWARDS_MEMBERS.length.toLocaleString()} label="Rewards members" hint="Across the Côte-Nord network" />
      </div>
    </section>
  )
}

function Stat({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div>
      <div className="font-display font-bold text-3xl text-copper">{value}</div>
      <div className="label-caps text-g40 dark:text-g60 mt-1">{label}</div>
      {hint && <div className="text-xs text-g40 dark:text-g60 mt-0.5">{hint}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Why Flow                                                         */
/* ------------------------------------------------------------------ */

function WhyFlow() {
  const { t } = useTranslation()
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="label-caps text-copper">Why Flow</span>
        <h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ivory mt-2">{t('booking.why.title')}</h2>
        <p className="text-g40 dark:text-g60 mt-3">{t('booking.why.subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <ValueCard
          icon={<Sparkles className="h-5 w-5" />}
          title={t('booking.why.a')}
          body={t('booking.why.aBody')}
        />
        <ValueCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title={t('booking.why.b')}
          body={t('booking.why.bBody')}
        />
        <ValueCard
          icon={<Zap className="h-5 w-5" />}
          title={t('booking.why.c')}
          body={t('booking.why.cBody')}
        />
      </div>
    </section>
  )
}

function ValueCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card">
      <div className="h-10 w-10 rounded-input bg-teal-light text-teal-dark flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-display text-xl text-ink dark:text-ivory mt-4">{title}</h3>
      <p className="text-sm text-g40 dark:text-g60 mt-2 leading-relaxed">{body}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Network · provinces & regional airports                          */
/* ------------------------------------------------------------------ */

function Network() {
  // Regroupement par région pour une grille lisible · provinces en service d'abord.
  const byRegion = PROVINCES.reduce<Record<string, typeof PROVINCES>>((acc, p) => {
    (acc[p.region] ??= []).push(p)
    return acc
  }, {})
  const regionOrder = ['Centre', 'Atlantique', 'Nord', 'Prairies', 'Ouest']
  const liveCount     = PROVINCES.filter((p) => MARKET_STATUS[p.code] === 'live').length
  const pilotCount    = PROVINCES.filter((p) => MARKET_STATUS[p.code] === 'pilot').length
  const prospectCount = PROVINCES.filter((p) => MARKET_STATUS[p.code] === 'prospect').length

  return (
    <section id="network" className="bg-ivory dark:bg-panel py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="label-caps text-copper">The network</span>
            <h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ivory mt-2">
              {PROVINCES.length} provinces &amp; territories. {NETWORK_AIRPORTS} regional airports.
            </h2>
            <p className="text-g40 dark:text-g60 mt-2 max-w-2xl">
              One Rewards balance across the whole country. {liveCount} province live today,{' '}
              {prospectCount} in phase 2 — every remaining regional airport is on the phase 3 roadmap.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Legend tone="live" label={`Live · ${liveCount}`} />
            <Legend tone="pilot" label={`Commissioning · ${pilotCount}`} />
            <Legend tone="prospect" label={`Phase 2 · ${prospectCount}`} />
            <Legend tone="future" label="Phase 3" />
          </div>
        </div>

        <div className="space-y-6">
          {regionOrder.map((region) => {
            const provinces = (byRegion[region] ?? []).slice().sort((a, b) => {
              const rank: Record<DeploymentStatus, number> = { live: 0, pilot: 1, prospect: 2, future: 3 }
              const sa = rank[MARKET_STATUS[a.code] ?? 'future']
              const sb = rank[MARKET_STATUS[b.code] ?? 'future']
              return sa - sb || a.name.localeCompare(b.name, 'fr')
            })
            const airports = provinces.reduce((sum, p) => sum + AIRPORT_COUNT[p.code], 0)
            return (
              <div key={region}>
                <h3 className="label-caps text-g40 dark:text-g60 mb-3">
                  {region} · {provinces.length} province{provinces.length > 1 ? 's' : ''} · {airports} regional airports
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {provinces.map((p) => {
                    const status: DeploymentStatus = MARKET_STATUS[p.code] ?? 'future'
                    return (
                      <li
                        key={p.code}
                        className={cn(
                          'flex items-center gap-2 rounded-input border px-3 py-2 bg-white dark:bg-panel-mid border-g20/60 text-sm',
                          status === 'live' && 'ring-2 ring-teal/30'
                        )}
                      >
                        <span className="font-display font-semibold text-copper w-7 shrink-0" aria-hidden="true">{p.code}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate text-ink dark:text-ivory">{p.name}</span>
                          <span className="block text-[10px] text-g40 dark:text-g60">
                            {AIRPORT_COUNT[p.code]} airports · {p.taxName} {p.taxRate}%
                          </span>
                        </span>
                        <span className={cn('text-[9px] label-caps px-1.5 py-0.5 rounded-badge shrink-0', STATUS_TONE[status])}>
                          {STATUS_LABEL[status]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Legend({ tone, label }: { tone: DeploymentStatus; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-badge bg-white dark:bg-panel-mid border border-g20/60">
      <span className={cn('h-2 w-2 rounded-full', STATUS_TONE[tone].split(' ')[0])} aria-hidden="true" />
      <span className="text-g80 dark:text-g80">{label}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Hotels                                                           */
/* ------------------------------------------------------------------ */

function Hotels() {
  return (
    <section id="hotels" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="label-caps text-copper">The properties</span>
        <h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ivory mt-2">
          {LIVE_PROPERTIES.length} locations across the Basse-Côte-Nord.
        </h2>
        <p className="text-g40 dark:text-g60 mt-3">
          Community stations paired with regional-airport rental desks — built for how the North actually travels.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {LIVE_PROPERTIES.map((p) => {
          const Icon = p.type === 'hotel' ? Hotel : p.type === 'car_rental' ? Car : Building2
          const province = PROVINCES.find((c) => c.code === p.countryCode)
          return (
            <article key={p.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid shadow-card overflow-hidden flex flex-col">
              <div className={cn(
                'aspect-[16/10] relative flex items-center justify-center',
                p.type === 'hotel' ? 'bg-gradient-to-br from-teal to-teal-dark' :
                p.type === 'car_rental' ? 'bg-gradient-to-br from-coal to-ink' :
                'bg-gradient-to-br from-teal to-coal'
              )}>
                <Icon className="h-14 w-14 text-copper opacity-80" aria-hidden="true" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-badge bg-white/90 text-ink text-[10px] label-caps">
                  {province?.code} · {province?.name}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-teal text-white text-[10px] label-caps">
                  <span className="h-1.5 w-1.5 rounded-full bg-ivory" aria-hidden="true" /> Live
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-lg text-ink dark:text-ivory leading-tight">{p.name}</h3>
                <div className="text-xs text-g40 dark:text-g60 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" /> {p.address ?? p.city}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-g40 dark:text-g60">
                  {p.rooms !== undefined && <span>{p.rooms} rooms</span>}
                  {p.vehicles !== undefined && <span>{p.vehicles} vehicles</span>}
                </div>
                <div className="mt-auto pt-4 border-t border-g20/40 flex items-center justify-between">
                  <div>
                    <div className="label-caps text-g40 dark:text-g60">From</div>
                    <div className="font-display font-bold text-copper">
                      {formatCurrency(p.type === 'car_rental' ? 75 : 155)}
                      <span className="text-xs font-normal text-g40 dark:text-g60 ml-1">
                        / {p.type === 'car_rental' ? 'day' : 'night'}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/booking/search"
                    className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-input bg-teal text-white hover:bg-teal-dark font-medium"
                  >
                    Book <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 6. Rewards · the tier ladder                                        */
/* ------------------------------------------------------------------ */

function Rewards() {
  return (
    <section id="rewards" className="bg-coal text-ivory py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="label-caps text-copper">Flow Rewards</span>
          <h2 className="font-display text-3xl sm:text-4xl text-ivory mt-2">
            Earn in Sept-Îles. Redeem in Blanc-Sablon.
          </h2>
          <p className="text-g80 mt-3">
            One programme. Every market. Points never expire while your account stays active —
            and your tier multiplier compounds every dollar you spend.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REWARDS_TIERS.map((tier) => {
            const accent = TIER_ACCENT[tier.tier]
            const Icon = tier.tier === 'Black' ? Crown : tier.tier === 'Platinum' ? Award : tier.tier === 'Gold' ? Star : Sparkles
            return (
              <article
                key={tier.tier}
                className={cn(
                  'rounded-card bg-panel-mid border-2 p-6 flex flex-col',
                  accent.ring
                )}
              >
                <header className="flex items-center justify-between">
                  <Icon className={cn('h-6 w-6', accent.icon)} aria-hidden="true" />
                  <span className={cn('text-[10px] label-caps px-2 py-0.5 rounded-badge', accent.chip)}>
                    {accent.label}
                  </span>
                </header>
                <h3 className="font-display text-2xl mt-3">{tier.tier}</h3>
                <div className="mt-1 text-sm text-g80">
                  <span className="text-copper font-bold">{tier.pointsMultiplier}×</span> points multiplier
                </div>
                <div className="mt-4 space-y-1 text-xs text-g60">
                  <div>
                    <span className="label-caps">Qualify</span>
                    <div className="text-g80 text-sm mt-0.5">
                      {tier.minStays > 0
                        ? <>{tier.minStays} stays · {formatCurrency(tier.minSpendCad)} / year</>
                        : 'Free · sign up to start'}
                    </div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <CheckCircle2 className={cn('h-4 w-4 shrink-0 mt-0.5', accent.icon)} aria-hidden="true" />
                      <span className="text-g80">{perk}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        <p className="text-center text-xs text-g60 mt-8 max-w-xl mx-auto">
          Tiers reset on a rolling 12-month basis · qualifying stays and rentals count toward the next level the moment they post.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 7. Pricing                                                          */
/* ------------------------------------------------------------------ */

function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="label-caps text-copper">Transparent pricing</span>
        <h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ivory mt-2">
          Pay what's posted. Earn what you spend.
        </h2>
        <p className="text-g40 dark:text-g60 mt-3">
          No member-only fees. No hidden booking charges. Local currency at checkout, USD at settlement.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Stay rates */}
        <article className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card">
          <Hotel className="h-6 w-6 text-teal" aria-hidden="true" />
          <h3 className="font-display text-xl text-ink dark:text-ivory mt-3">Stay rates</h3>
          <p className="text-xs text-g40 dark:text-g60 mt-1">Per room, per night</p>
          <ul className="mt-4 space-y-3 text-sm">
            <RateRow label="Standard"  range="155 $ – 179 $" />
            <RateRow label="Deluxe"    range="185 $ – 225 $" />
            <RateRow label="Suite"     range="245 $ – 295 $" />
            <RateRow label="Executive" range="295 $ – 355 $" />
          </ul>
          <p className="text-[11px] text-g40 dark:text-g60 mt-4 border-t border-g20/40 pt-3">
            Includes breakfast for Gold+ members · GST/QST or HST per province.
          </p>
        </article>

        {/* Drive rates */}
        <article className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-6 shadow-card">
          <Car className="h-6 w-6 text-copper" aria-hidden="true" />
          <h3 className="font-display text-xl text-ink dark:text-ivory mt-3">Drive rates</h3>
          <p className="text-xs text-g40 dark:text-g60 mt-1">Per vehicle, per day</p>
          <ul className="mt-4 space-y-3 text-sm">
            <RateRow label="Flow GO"       range="75 $" />
            <RateRow label="Flow Drive"    range="105 $ – 115 $" />
            <RateRow label="Flow Terrain"  range="145 $ – 170 $" />
            <RateRow label="Flow Prestige" range="185 $ – 195 $" />
            <RateRow label="Flow Elite"    range="275 $" />
          </ul>
          <p className="text-[11px] text-g40 dark:text-g60 mt-4 border-t border-g20/40 pt-3">
            Unlimited mileage in-city · airport pick-up included on all tiers.
          </p>
        </article>

        {/* Rewards economics */}
        <article className="rounded-card border-2 border-copper bg-white dark:bg-panel-mid p-6 shadow-panel relative">
          <span className="absolute -top-3 left-6 px-2 py-0.5 rounded-badge bg-copper text-white text-[10px] label-caps">
            Best value
          </span>
          <Award className="h-6 w-6 text-copper" aria-hidden="true" />
          <h3 className="font-display text-xl text-ink dark:text-ivory mt-3">Rewards economics</h3>
          <p className="text-xs text-g40 dark:text-g60 mt-1">Earn and burn rates</p>
          <ul className="mt-4 space-y-3 text-sm">
            <RateRow label="Earn"              range="10 pts / $1" />
            <RateRow label="Gold multiplier"   range="× 1.5" />
            <RateRow label="Platinum mult."    range="× 2" />
            <RateRow label="Black multiplier"  range="× 3" />
            <RateRow label="Free night from"   range="20,000 pts" />
            <RateRow label="Free GO day from"  range="6,000 pts" />
          </ul>
          <p className="text-[11px] text-g40 dark:text-g60 mt-4 border-t border-g20/40 pt-3">
            Points stay valid as long as the account sees activity every 18 months.
          </p>
        </article>
      </div>
    </section>
  )
}

function RateRow({ label, range }: { label: string; range: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-g20/30 last:border-0 pb-2 last:pb-0">
      <span className="text-g80 dark:text-g80">{label}</span>
      <span className="font-display font-bold text-ink dark:text-ivory">{range}</span>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* 8. Partners · "Become a Flow partner"                               */
/* ------------------------------------------------------------------ */

function Partners() {
  return (
    <section id="partners" className="bg-ivory dark:bg-panel py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="label-caps text-copper">For property &amp; fleet owners</span>
            <h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ivory mt-2">
              List your hotel or fleet. Powered by Flow.
            </h2>
            <p className="text-g40 dark:text-g60 mt-3">
              The same OS your booking guests see — channel manager, payments,
              housekeeping, partner payouts, audit-grade reporting — comes with the marketplace.
              No setup fees. You only pay when Flow Pay clears revenue for you.
            </p>
            <ul className="mt-6 space-y-3">
              <Bullet>Multi-channel inventory (Booking.com, Expedia, Direct, Flow App) from one calendar</Bullet>
              <Bullet>Weekly settlement in your local currency · USD or EUR available on request</Bullet>
              <Bullet>Live housekeeping, F&amp;B, and inventory modules included</Bullet>
              <Bullet>Stripe + mobile money (Interac, Apple Pay, Google Pay, Nordia) on day one</Bullet>
              <Bullet>Country managers in every live market for white-glove onboarding</Bullet>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:partners@flowrentals.com?subject=Flow%20partnership%20enquiry"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input bg-copper text-white hover:bg-copper-dark font-medium"
              >
                Apply to become a partner <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal font-medium"
              >
                Already a partner? Sign in
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PartnerTier
              name="Starter"
              audience="Single property"
              fee="Revenue share"
              feeDetail="12% of bookings cleared via Flow"
              perks={['Channel manager', 'Flow Pay', 'Rewards opt-in']}
            />
            <PartnerTier
              name="Growth"
              audience="Multi-property"
              fee="Revenue share"
              feeDetail="9% of bookings + GPS-tracked fleet"
              perks={['Everything in Starter', 'Multi-property OS', 'Audit-grade reporting']}
              highlighted
            />
            <PartnerTier
              name="Network"
              audience="Country operator"
              fee="Revenue share"
              feeDetail="7% · co-marketed launch"
              perks={['Everything in Growth', 'White-glove onboarding', 'Country brand assets']}
            />
            <PartnerTier
              name="Enterprise"
              audience="Regional groups"
              fee="Custom"
              feeDetail="Negotiated terms · SLA-backed"
              perks={['Dedicated success manager', 'SSO + custom roles', 'Private data residency']}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function PartnerTier({ name, audience, fee, feeDetail, perks, highlighted }: {
  name: string
  audience: string
  fee: string
  feeDetail: string
  perks: string[]
  highlighted?: boolean
}) {
  return (
    <article
      className={cn(
        'rounded-card p-5 bg-white dark:bg-panel-mid shadow-card border',
        highlighted ? 'border-copper ring-2 ring-copper/30' : 'border-g20/60'
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-display text-lg text-ink dark:text-ivory">{name}</h4>
        {highlighted && <span className="text-[9px] label-caps px-1.5 py-0.5 rounded-badge bg-copper text-white">Popular</span>}
      </div>
      <p className="text-xs text-g40 dark:text-g60 mt-0.5">{audience}</p>
      <div className="mt-3">
        <div className="label-caps text-g40 dark:text-g60">{fee}</div>
        <div className="text-sm text-ink dark:text-ivory font-medium">{feeDetail}</div>
      </div>
      <ul className="mt-4 space-y-1 text-xs">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-teal shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-g80 dark:text-g80">{p}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-ink dark:text-ivory">
      <CheckCircle2 className="h-4 w-4 text-teal shrink-0 mt-0.5" aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* 9. Final CTA                                                        */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-teal text-ivory">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_50%,rgba(184,115,51,0.65),transparent_55%)]" aria-hidden="true" />
      <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <Globe2 className="h-10 w-10 text-copper mx-auto" aria-hidden="true" />
        <h2 className="font-display text-3xl sm:text-4xl mt-4">Your next trip across the North starts here.</h2>
        <p className="text-ivory/90 mt-3 max-w-xl mx-auto">
          One booking. One account. One Rewards balance — for the whole continent.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/booking/search"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input bg-copper text-white hover:bg-copper-dark font-medium shadow-panel"
          >
            Book a stay <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/booking/results"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-input border border-ivory/40 text-ivory hover:bg-ivory/10 font-medium"
          >
            <Car className="h-4 w-4" /> Reserve a vehicle
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ivory/70">
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Trusted by {REWARDS_MEMBERS.length}+ travellers</span>
          <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {LIVE_ROOMS_COUNT}+ rooms · {LIVE_VEHICLES_COUNT} vehicles</span>
        </div>
      </div>
    </section>
  )
}
