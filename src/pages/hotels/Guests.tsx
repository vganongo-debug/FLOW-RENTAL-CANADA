import { useMemo, useState } from 'react'
import { Search, MapPin, Phone, Mail, Award, Globe, Languages, Star, FileText, Plus } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowRewardsCard } from '../../components/flow/FlowRewardsCard'
import { FlowFileUpload } from '../../components/flow/FlowFileUpload'

type Tab = 'profile' | 'stays' | 'preferences' | 'documents' | 'notes'

interface Guest {
  id: string
  name: string
  initials: string
  nationality: string
  email: string
  phone: string
  language: 'EN' | 'FR'
  tier: 'Silver' | 'Gold' | 'Platinum'
  points: number
  totalStays: number
  lifetimeSpendUsd: number
  city: string
  preferences: { highFloor: boolean; quietRoom: boolean; nonSmoking: boolean; vegetarian: boolean; latePOS: boolean }
}

const GUESTS: Guest[] = [
  { id:'g-1', name:'Sarah Bennett',     initials:'SB', nationality:'British',    email:'sarah.bennett@example.com', phone:'+44 7700 900142', language:'EN', tier:'Gold',     points: 14_200, totalStays: 11, lifetimeSpendUsd: 18_640, city:'London',     preferences:{ highFloor:true, quietRoom:true, nonSmoking:true, vegetarian:false, latePOS:true } },
  { id:'g-2', name:'Jean-Marc Loubaki', initials:'JL', nationality:'Congolese', email:'jm@loubaki.cg', phone:'+242 06 521 4488', language:'FR', tier:'Platinum', points: 28_750, totalStays: 22, lifetimeSpendUsd: 41_200, city:'Brazzaville', preferences:{ highFloor:false, quietRoom:true, nonSmoking:true, vegetarian:false, latePOS:false } },
  { id:'g-3', name:'Priya Patel',       initials:'PP', nationality:'American',  email:'priya@example.com', phone:'+1 415 555 0182', language:'EN', tier:'Silver', points: 4_840, totalStays: 4, lifetimeSpendUsd: 6_120, city:'San Francisco', preferences:{ highFloor:true, quietRoom:false, nonSmoking:true, vegetarian:true, latePOS:false } },
  { id:'g-4', name:'Émilie Tremblay',   initials:'ET', nationality:'Canadian',  email:'emilie.tremblay@example.ca', phone:'+1 514 555 9908', language:'FR', tier:'Gold', points: 11_320, totalStays: 8, lifetimeSpendUsd: 12_980, city:'Montréal', preferences:{ highFloor:false, quietRoom:true, nonSmoking:true, vegetarian:false, latePOS:true } },
  { id:'g-5', name:'Olusegun Adeyemi',  initials:'OA', nationality:'Nigerian',  email:'segun@example.ng', phone:'+234 802 880 1100', language:'EN', tier:'Gold', points: 9_840, totalStays: 6, lifetimeSpendUsd: 9_460, city:'Lagos', preferences:{ highFloor:true, quietRoom:false, nonSmoking:true, vegetarian:false, latePOS:true } },
  { id:'g-6', name:'Ahmed Yusuf',       initials:'AY', nationality:'Ugandan',  email:'ahmed.y@example.ug', phone:'+256 712 333 444', language:'EN', tier:'Silver', points: 2_180, totalStays: 3, lifetimeSpendUsd: 2_980, city:'Kampala', preferences:{ highFloor:false, quietRoom:false, nonSmoking:true, vegetarian:false, latePOS:false } },
]

const STAYS = [
  { property: 'Flow Hotels Kampala',     from:'2026-04-22', to:'2026-04-25', room:'207 · Suite',     amount: 585, status: 'Completed' },
  { property: 'Flow Hotels Brazzaville', from:'2026-02-18', to:'2026-02-21', room:'305 · Executive', amount: 780, status: 'Completed' },
  { property: 'Flow Hotels Addis Ababa', from:'2026-01-05', to:'2026-01-06', room:'112 · Deluxe',    amount: 130, status: 'Completed' },
  { property: 'Flow Hotels Kampala',     from:'2025-11-28', to:'2025-12-02', room:'108 · Executive', amount: 960, status: 'Completed' },
  { property: 'Flow Hotels Brazzaville', from:'2025-10-12', to:'2025-10-13', room:'203 · Suite',     amount: 195, status: 'Completed' },
]

const NOTES = [
  { date:'2026-04-25', author:'Aisha Nakato',     body:'Guest celebrated wedding anniversary — comp champagne well received. Note for next visit.' },
  { date:'2026-02-21', author:'Jean-Paul Mboungou', body:'Requested USB-C charger on arrival. Now provisioned by default in Suite category.' },
  { date:'2025-11-30', author:'Henry Mukasa',     body:'Loyal direct booker — prefers email contact over WhatsApp.' },
]

const TIER_TONE: Record<Guest['tier'], 'neutral' | 'pending' | 'active'> = { Silver:'neutral', Gold:'pending', Platinum:'active' }

export default function Guests() {
  const [selectedId, setSelectedId] = useState(GUESTS[0].id)
  const [tab, setTab] = useState<Tab>('profile')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => GUESTS.filter((g) =>
    !q.trim() || g.name.toLowerCase().includes(q.toLowerCase()) || g.email.toLowerCase().includes(q.toLowerCase())
  ), [q])

  const selected = GUESTS.find((g) => g.id === selectedId) ?? GUESTS[0]
  const nextTier = selected.tier === 'Platinum' ? null : selected.tier === 'Gold' ? 'Platinum' : 'Gold'
  const pointsToNext = selected.tier === 'Platinum' ? 0 : selected.tier === 'Gold' ? Math.max(0, 25000 - selected.points) : Math.max(0, 10000 - selected.points)

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · Guests</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Guest Profiles</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">CRM for repeat business · {GUESTS.length} active profiles</p>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <Plus className="h-4 w-4" /> Add guest
        </button>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-g20/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name or email"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </div>
            <div className="text-[11px] text-g40 mt-2">{filtered.length} of {GUESTS.length}</div>
          </div>
          <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40">
            {filtered.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => setSelectedId(g.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition',
                    selectedId === g.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <span className="h-9 w-9 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold shrink-0">{g.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory truncate">{g.name}</div>
                    <div className="text-xs text-g40 truncate">{g.nationality} · {g.totalStays} stays</div>
                  </div>
                  <FlowStatusBadge tone={TIER_TONE[g.tier]}>{g.tier}</FlowStatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-4">
          {/* Header card */}
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card flex items-start gap-4 flex-wrap">
            <span className="h-16 w-16 rounded-full bg-teal text-white flex items-center justify-center text-xl font-semibold shrink-0">
              {selected.initials}
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl text-ink dark:text-ivory">{selected.name}</h2>
              <div className="text-sm text-g40 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {selected.nationality}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.city}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selected.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selected.phone}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <FlowStatusBadge tone={TIER_TONE[selected.tier]} dot>{selected.tier} member</FlowStatusBadge>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-ivory dark:bg-panel text-g40 label-caps">
                  <Star className="h-3 w-3" /> {selected.totalStays} lifetime stays
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-ivory dark:bg-panel text-copper-dark dark:text-copper-light label-caps">
                  Spend {formatCurrency(selected.lifetimeSpendUsd)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex border-b border-g20/60">
            {(['profile','stays','preferences','documents','notes'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition',
                  tab === t ? 'border-teal text-teal' : 'border-transparent text-g40 hover:text-ink dark:hover:text-ivory'
                )}
              >
                {t === 'stays' ? 'Stay history' : t}
              </button>
            ))}
          </nav>

          {tab === 'profile' && <ProfileTab guest={selected} nextTier={nextTier} pointsToNext={pointsToNext} />}
          {tab === 'stays' && <StaysTab />}
          {tab === 'preferences' && <PreferencesTab guest={selected} />}
          {tab === 'documents' && <DocumentsTab />}
          {tab === 'notes' && <NotesTab />}
        </section>
      </div>
    </div>
  )
}

function ProfileTab({ guest, nextTier, pointsToNext }: { guest: Guest; nextTier: 'Gold' | 'Platinum' | null; pointsToNext: number }) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-4">
        <Card title="Contact">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name" defaultValue={guest.name} />
            <Field label="Email" defaultValue={guest.email} type="email" />
            <Field label="Phone" defaultValue={guest.phone} type="tel" />
            <Field label="Preferred language" select options={['English','Français']} defaultValue={guest.language === 'FR' ? 'Français' : 'English'} />
            <Field label="City of residence" defaultValue={guest.city} />
            <Field label="Nationality" defaultValue={guest.nationality} />
          </div>
        </Card>
        <Card title="Membership">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="label-caps text-g40">Member since</div>
              <div className="text-ink dark:text-ivory font-medium">November 2023</div>
            </div>
            <div>
              <div className="label-caps text-g40">Marketing consent</div>
              <div className="text-ink dark:text-ivory font-medium">Email · SMS · WhatsApp</div>
            </div>
            <div>
              <div className="label-caps text-g40">Best contact</div>
              <div className="text-ink dark:text-ivory font-medium">Email (mornings)</div>
            </div>
          </div>
        </Card>
      </div>
      <FlowRewardsCard
        memberName={guest.name}
        points={guest.points}
        tier={guest.tier}
        nextTier={nextTier}
        pointsToNext={pointsToNext}
      />
    </div>
  )
}

function StaysTab() {
  return (
    <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-teal text-white">
            {['Property','Check-in','Check-out','Room','Amount','Status'].map((h, i) => (
              <th key={h} className={cn('label-caps font-semibold px-4 py-3', i === 4 ? 'text-right' : 'text-left')}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STAYS.map((s, i) => (
            <tr key={i} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
              <td className="px-4 py-3 text-ink dark:text-ivory font-medium">{s.property}</td>
              <td className="px-4 py-3 text-ink dark:text-ivory">{formatDate(s.from)}</td>
              <td className="px-4 py-3 text-ink dark:text-ivory">{formatDate(s.to)}</td>
              <td className="px-4 py-3 text-ink dark:text-ivory">{s.room}</td>
              <td className="px-4 py-3 text-right text-copper font-display font-bold">{formatCurrency(s.amount)}</td>
              <td className="px-4 py-3"><FlowStatusBadge tone="completed">{s.status}</FlowStatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-ivory dark:bg-panel flex items-center justify-between text-sm border-t border-g20/60">
        <span className="text-g40">Total lifetime spend</span>
        <span className="text-copper font-display font-bold text-xl">{formatCurrency(STAYS.reduce((s,x) => s+x.amount,0))}</span>
      </div>
    </div>
  )
}

function PreferencesTab({ guest }: { guest: Guest }) {
  const prefs = [
    { id: 'highFloor', label: 'High floor', value: guest.preferences.highFloor },
    { id: 'quietRoom', label: 'Quiet room (away from elevator)', value: guest.preferences.quietRoom },
    { id: 'nonSmoking', label: 'Non-smoking', value: guest.preferences.nonSmoking },
    { id: 'vegetarian', label: 'Vegetarian dining', value: guest.preferences.vegetarian },
    { id: 'latePOS', label: 'Late check-out routinely', value: guest.preferences.latePOS },
  ]
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Room preferences">
        <ul className="space-y-2">
          {prefs.map((p) => (
            <li key={p.id}>
              <label className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
                <input type="checkbox" defaultChecked={p.value} className="accent-teal" />
                {p.label}
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Dietary & special notes">
        <textarea
          className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[120px] text-ink dark:text-ivory"
          placeholder="Allergies, accessibility needs, etc."
          defaultValue="No nuts. Prefers herbal tea on arrival."
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="Preferred floor" defaultValue="4 or higher" />
          <Field label="Bed type" select options={['King', 'Queen', 'Twin']} defaultValue="King" />
          <Field label="Pillow type" select options={['Soft','Firm','Hypoallergenic']} defaultValue="Hypoallergenic" />
          <Field label="Newspaper" select options={['None','Financial Times','Le Monde']} defaultValue="Financial Times" />
        </div>
      </Card>
    </div>
  )
}

function DocumentsTab() {
  const docs = [
    { name: 'Passport · GB-PA 5483-92021.pdf', size: '482 KB', uploaded: '2026-04-22', tone: 'completed' as const },
    { name: 'Booking confirmation · RES-2026001.pdf', size: '128 KB', uploaded: '2026-04-22', tone: 'completed' as const },
    { name: 'Loyalty enrollment · 2023-11-04.pdf', size: '64 KB', uploaded: '2023-11-04', tone: 'completed' as const },
  ]
  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-4">
      <Card title="Stored documents">
        <ul className="divide-y divide-g20/40">
          {docs.map((d) => (
            <li key={d.name} className="py-3 flex items-center gap-3">
              <FileText className="h-4 w-4 text-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink dark:text-ivory text-sm truncate">{d.name}</div>
                <div className="text-xs text-g40">{d.size} · uploaded {formatDate(d.uploaded)}</div>
              </div>
              <button className="text-xs text-teal hover:text-teal-dark font-medium">View</button>
            </li>
          ))}
        </ul>
      </Card>
      <div>
        <FlowFileUpload label="Add document" hint="PDF up to 5 MB · auto-tagged to guest" />
      </div>
    </div>
  )
}

function NotesTab() {
  return (
    <Card title="Internal notes">
      <ul className="space-y-3">
        {NOTES.map((n, i) => (
          <li key={i} className="rounded-input bg-ivory dark:bg-panel p-3 border border-g20/40">
            <div className="flex items-center justify-between text-xs text-g40">
              <span>{n.author}</span>
              <span>{formatDate(n.date)}</span>
            </div>
            <p className="text-sm text-ink dark:text-ivory mt-1.5">{n.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <textarea
          className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory"
          placeholder="Add a note visible to all staff..."
        />
        <button className="mt-2 px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium">Add note</button>
      </div>
    </Card>
  )
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card', className)}>
      <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, defaultValue, type='text', select, options }: { label: string; defaultValue?: string; type?: string; select?: boolean; options?: string[] }) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1 block">{label}</span>
      {select ? (
        <select defaultValue={defaultValue} className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className="w-full px-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
        />
      )}
    </label>
  )
}
