import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Hotel, Car, CreditCard, Calendar, MapPin, Bell, Globe, Plane, ChevronRight, Edit3, ArrowDownToLine, ArrowUpFromLine, Trash2 } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { useCurrencyFormatter } from '../../lib/useCurrencyFormatter'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowRewardsCard } from '../../components/flow/FlowRewardsCard'

type Tab = 'upcoming' | 'past' | 'rewards' | 'settings' | 'payments'

interface BookingRow {
  id: string
  kind: 'hotel' | 'car'
  title: string
  sub: string
  from: string
  to: string
  amount: number
  status: 'confirmed' | 'on_rental' | 'completed' | 'cancelled'
}

const UPCOMING: BookingRow[] = [
  { id:'FRG-2026-0420', kind:'hotel', title:'Flow Station Natashquan',     sub:'Deluxe King · 4 nights', from:'2026-05-14', to:'2026-05-18', amount: 825, status:'confirmed' },
  { id:'RNT-900105',   kind:'car',   title:'Toyota Highlander AWD',             sub:'Aéroport YZV · 3 days · CDW included', from:'2026-05-14', to:'2026-05-17', amount: 495, status:'confirmed' },
]
const PAST: BookingRow[] = [
  { id:'FRG-2026-0418', kind:'hotel', title:'Flow Station Natashquan',     sub:'Suite 207 · 4 nights', from:'2026-04-22', to:'2026-04-25', amount: 780, status:'completed' },
  { id:'RNT-900090',   kind:'car',   title:'Nissan Rogue AWD',           sub:'Nord-Côtier · Natashquan · 4 days', from:'2026-04-22', to:'2026-04-25', amount: 340, status:'completed' },
  { id:'FRG-2026-0388', kind:'hotel', title:'Flow Station Blanc-Sablon', sub:'Executive · 3 nights', from:'2026-02-18', to:'2026-02-21', amount: 780, status:'completed' },
  { id:'FRG-2026-0367', kind:'hotel', title:'Flow Station Saint-Augustin', sub:'Deluxe · 1 night',     from:'2026-01-05', to:'2026-01-06', amount: 130, status:'completed' },
]

const STATUS_TONE = {
  confirmed: 'info',
  on_rental: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
} as const

const REWARD_LEDGER = [
  { date:'2026-04-25', type:'earn'   as const, delta:+480,  reason:'Stay · Flow Station Natashquan · Suite 207' },
  { date:'2026-04-22', type:'earn'   as const, delta:+340,  reason:'Car rental · Nissan Rogue AWD · 4 days' },
  { date:'2026-03-08', type:'burn'   as const, delta:-2000, reason:'Free night redemption · Blanc-Sablon' },
  { date:'2026-02-21', type:'earn'   as const, delta:+780,  reason:'Stay · Flow Station Blanc-Sablon · Executive' },
]

export default function Account() {
  const { t } = useTranslation()
  const format = useCurrencyFormatter()
  const [tab, setTab] = useState<Tab>('upcoming')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 rounded-full bg-teal text-white flex items-center justify-center text-xl font-semibold">SB</span>
          <div>
            <div className="label-caps text-g40">
              {t('booking.account.welcome', { defaultValue: 'Welcome back' })}
            </div>
            <h1 className="font-display text-3xl text-ink dark:text-ivory">Sarah Bennett</h1>
            <p className="text-sm text-g40 mt-0.5">
              Member since November 2023 · 11 stays · {t('booking.account.gold', { defaultValue: 'Gold member' })}
            </p>
          </div>
        </div>
        <Link to="/booking/search" className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          {t('booking.account.new_booking', { defaultValue: 'Book again' })} <ChevronRight className="h-4 w-4" />
        </Link>
      </header>

      <nav className="mt-6 flex border-b border-g20/60 overflow-x-auto flow-scroll -mb-px">
        {([
          { id: 'upcoming', label: t('booking.account.tabs.upcoming', { defaultValue: 'Upcoming' }) },
          { id: 'past',     label: t('booking.account.tabs.past',     { defaultValue: 'Past bookings' }) },
          { id: 'rewards',  label: t('booking.account.tabs.rewards',  { defaultValue: 'Flow Rewards' }) },
          { id: 'payments', label: t('booking.account.tabs.payments', { defaultValue: 'Payment methods' }) },
          { id: 'settings', label: t('booking.account.tabs.settings', { defaultValue: 'Settings' }) },
        ] as { id: Tab; label: string }[]).map((b) => (
          <button
            key={b.id}
            onClick={() => setTab(b.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap',
              tab === b.id ? 'border-teal text-teal' : 'border-transparent text-g40 hover:text-ink dark:hover:text-ivory'
            )}
          >
            {b.label}
          </button>
        ))}
      </nav>

      <section className="mt-6 space-y-4">
        {tab === 'upcoming' && <BookingsList rows={UPCOMING} emptyKey="empty_upcoming" format={format} />}
        {tab === 'past' && <BookingsList rows={PAST} emptyKey="empty_past" format={format} />}
        {tab === 'rewards' && <RewardsTab format={format} />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'settings' && <SettingsTab />}
      </section>
    </div>
  )
}

function BookingsList({ rows, emptyKey, format }: { rows: BookingRow[]; emptyKey: string; format: (n: number) => string }) {
  const { t } = useTranslation()
  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center">
        <Calendar className="h-10 w-10 text-teal mx-auto mb-2 opacity-50" />
        <p className="text-sm text-g40">
          {t(`booking.account.${emptyKey}`, { defaultValue: 'Nothing here yet — your bookings will appear here.' })}
        </p>
      </div>
    )
  }
  return (
    <ul className="space-y-3">
      {rows.map((b) => (
        <li key={b.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card flex items-start gap-4 flex-wrap">
          <span className={cn('h-11 w-11 rounded-card text-white flex items-center justify-center shrink-0',
            b.kind === 'hotel' ? 'bg-teal' : 'bg-copper'
          )}>
            {b.kind === 'hotel' ? <Hotel className="h-5 w-5" /> : <Car className="h-5 w-5" />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg text-ink dark:text-ivory">{b.title}</h3>
              <FlowStatusBadge tone={STATUS_TONE[b.status]} dot>{b.status.replace('_',' ')}</FlowStatusBadge>
            </div>
            <p className="text-xs text-g40 mt-0.5">{b.sub}</p>
            <div className="text-xs text-g40 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(b.from)} → {formatDate(b.to)}</span>
              <span className="flex items-center gap-1 font-mono">{b.id}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-2xl text-copper">{format(b.amount)}</div>
            <button className="text-xs text-teal hover:text-teal-dark font-medium">View details</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function RewardsTab({ format }: { format: (n: number) => string }) {
  const points = 14_200
  const nextTier = 'Platinum' as const
  const pointsToNext = 25_000 - points
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-4">
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Cross-market loyalty</h3>
          <p className="text-sm text-g40">
            Earn points everywhere Flow operates. Redeem them anywhere — including a free night in Blanc-Sablon
            or a Prestige tier upgrade in Natashquan.
          </p>
        </section>

        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Transaction history</h3>
          <ul className="divide-y divide-g20/40">
            {REWARD_LEDGER.map((r, i) => (
              <li key={i} className="py-2.5 flex items-center gap-3">
                <span className={cn('h-7 w-7 rounded-input flex items-center justify-center', r.type === 'earn' ? 'bg-teal-light text-teal-dark' : 'bg-copper-light text-copper-dark')}>
                  {r.type === 'earn' ? <ArrowUpFromLine className="h-3.5 w-3.5" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink dark:text-ivory truncate">{r.reason}</div>
                  <div className="text-xs text-g40">{formatDate(r.date)}</div>
                </div>
                <span className={cn('font-display font-bold', r.delta > 0 ? 'text-teal' : 'text-copper')}>
                  {r.delta > 0 ? '+' : ''}{r.delta.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Redeem points</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Free night · Standard',  cost: 12_000, perk: 'Any market' },
              { label: 'Free night · Suite',     cost: 22_000, perk: 'Any market' },
              { label: 'Car upgrade · Prestige', cost:  8_000, perk: '3-day rentals' },
              { label: 'Late checkout (4pm)',    cost:  1_500, perk: 'Subject to availability' },
            ].map((r) => (
              <button key={r.label} className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-3 text-left hover:border-teal transition">
                <div className="text-sm font-medium text-ink dark:text-ivory">{r.label}</div>
                <div className="text-[11px] text-g40 mb-2">{r.perk}</div>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-copper text-lg">{r.cost.toLocaleString()}</span>
                  <span className="text-[10px] text-g40 label-caps">points</span>
                </div>
                {points >= r.cost ? (
                  <FlowStatusBadge tone="active" className="mt-2">Available</FlowStatusBadge>
                ) : (
                  <span className="text-[11px] text-g40 block mt-2">{(r.cost - points).toLocaleString()} more</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-g40 mt-3">
            * Points earned in Natashquan are redeemable in Blanc-Sablon, Saint-Augustin, and any future Flow market.
            We don't restrict by country — that's the whole point.
          </p>
        </section>
      </div>

      <FlowRewardsCard
        memberName="Sarah Bennett"
        points={points}
        tier="Gold"
        nextTier={nextTier}
        pointsToNext={pointsToNext}
      />
    </div>
  )
}

function PaymentsTab() {
  const { t } = useTranslation()
  const methods = [
    { id: 'pm-1', kind: 'Visa',       label: 'Visa ··· 4242',         expires: '12/28', primary: true  },
    { id: 'pm-2', kind: 'Mastercard', label: 'Mastercard ··· 8801',   expires: '09/27', primary: false },
    { id: 'pm-3', kind: 'Interac',        label: 'Interac · +256 778 ··· 042', expires: '—', primary: false },
  ]
  return (
    <div className="space-y-4">
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <header className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-ink dark:text-ivory">{t('booking.account.payment_methods', { defaultValue: 'Saved payment methods' })}</h3>
          <button className="text-xs text-teal hover:text-teal-dark font-medium">+ Add new</button>
        </header>
        <ul className="space-y-2">
          {methods.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3">
              <CreditCard className="h-5 w-5 text-teal" />
              <div className="flex-1">
                <div className="text-sm font-medium text-ink dark:text-ivory">{m.label}</div>
                {m.expires !== '—' && <div className="text-xs text-g40">Expires {m.expires}</div>}
              </div>
              {m.primary && <FlowStatusBadge tone="active">Default</FlowStatusBadge>}
              <button className="text-xs text-g40 hover:text-red-600 inline-flex items-center gap-1">
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Receipts</h3>
        <ul className="divide-y divide-g20/40">
          {[...UPCOMING, ...PAST].slice(0, 4).map((b) => (
            <li key={b.id} className="py-2.5 flex items-center justify-between text-sm">
              <span className="text-ink dark:text-ivory font-mono text-xs">{b.id}</span>
              <span className="text-g40">{formatDate(b.from)}</span>
              <span className="text-copper font-display font-bold">${b.amount}</span>
              <button className="text-xs text-teal hover:text-teal-dark font-medium">Download PDF</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SettingsTab() {
  const { t } = useTranslation()
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">{t('booking.account.profile', { defaultValue: 'Profile' })}</h3>
        <div className="space-y-3">
          <Field label="Full name" defaultValue="Sarah Bennett" />
          <Field label="Email" defaultValue="sarah.bennett@example.com" type="email" />
          <Field label="Phone" defaultValue="+44 7700 900142" type="tel" />
          <Field label="Date of birth" defaultValue="1988-04-12" type="date" />
        </div>
        <button className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium">
          <Edit3 className="h-3.5 w-3.5" /> Save changes
        </button>
      </section>
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">{t('booking.account.preferences', { defaultValue: 'Preferences' })}</h3>
        <div className="space-y-3">
          <Field label="Preferred language" select options={['English', 'Français']} defaultValue="English" icon={<Globe className="h-3.5 w-3.5 text-teal" />} />
          <Field label="Preferred currency" select options={['USD', 'XAF', 'XOF', 'UGX', 'ETB', 'KES', 'NGN', 'ZAR']} defaultValue="USD" icon={<CreditCard className="h-3.5 w-3.5 text-teal" />} />
          <Field label="Home airport" defaultValue="London Heathrow (LHR)" icon={<Plane className="h-3.5 w-3.5 text-teal" />} />
          <Field label="Marketing emails" select options={['Yes', 'No']} defaultValue="Yes" icon={<Bell className="h-3.5 w-3.5 text-teal" />} />
        </div>
      </section>
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card md:col-span-2">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Stored documents</h3>
        <p className="text-xs text-g40">Make check-in faster — pre-upload your ID once.</p>
        <ul className="mt-3 space-y-2">
          {[
            { name: 'UK Passport · GB-PA 5483-92021', uploaded: '2026-04-22' },
            { name: 'Driving licence · UK · 2028-09-12', uploaded: '2024-08-12' },
          ].map((d) => (
            <li key={d.name} className="flex items-center gap-3 rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3 text-sm">
              <MapPin className="h-3.5 w-3.5 text-teal" />
              <span className="flex-1 text-ink dark:text-ivory">{d.name}</span>
              <span className="text-xs text-g40">Uploaded {formatDate(d.uploaded)}</span>
              <button className="text-xs text-teal hover:text-teal-dark font-medium">Replace</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Field({ label, defaultValue, type='text', select, options, icon }: {
  label: string; defaultValue?: string; type?: string; select?: boolean; options?: string[]; icon?: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1 flex items-center gap-1">{icon}{label}</span>
      {select ? (
        <select defaultValue={defaultValue} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} defaultValue={defaultValue} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
      )}
    </label>
  )
}
