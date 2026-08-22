import { useState, useMemo, Fragment } from 'react'
import { Plus, Search, ShieldCheck, Mail, Building2, X } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { ROLE_LABELS } from '../../lib/sampleData'
import type { Role } from '../../lib/types'

interface UserRow {
  id: string
  name: string
  initials: string
  email: string
  role: Role
  scope: string
  lastLogin: string
  status: 'active' | 'inactive' | 'invited'
}

const STATUS_TONE = { active: 'active', inactive: 'completed', invited: 'pending' } as const

const USERS: UserRow[] = [
  { id:'u-1', name:'Vistel Ganongo',     initials:'VG', email:'vistel@flowrentals.com',   role:'superadmin',      scope:'Global',                lastLogin:'2026-05-10', status:'active' },
  { id:'u-2', name:'Maye Samoiel',       initials:'MS', email:'maye@flowrentals.com',     role:'superadmin',      scope:'Global',                lastLogin:'2026-05-09', status:'active' },
  { id:'u-3', name:'Marie-Claude Boudreau', initials:'MB', email:'marie-claude@flowrentals.com',    role:'country_manager', scope:'Québec',                lastLogin:'2026-05-10', status:'active' },
  { id:'u-4', name:'Jean-Philippe Bouchard', initials:'JB', email:'jp@flowrentals.com',       role:'hotel_manager',   scope:'Flow Station Blanc-Sablon', lastLogin:'2026-05-10', status:'active' },
  { id:'u-5', name:'Simon Lapierre',        initials:'SL', email:'simon@flowrentals.com',   role:'car_agent',       scope:'Sept-Îles · Natashquan',     lastLogin:'2026-05-10', status:'active' },
  { id:'u-6', name:'Hugo Cormier',          initials:'HC', email:'hugo@flowrentals.com',    role:'car_agent',       scope:'Sept-Îles · Natashquan',     lastLogin:'2026-05-09', status:'active' },
  { id:'u-7', name:'Thomas Bérubé',     initials:'TB', email:'thomas@flowrentals.com',  role:'car_agent',       scope:'Saint-Augustin',           lastLogin:'2026-05-09', status:'active' },
  { id:'u-8', name:'Nord-Côtier Partner',   initials:'NC', email:'partenaires@nordcotier.ca',   role:'fleet_partner',   scope:'Nord-Côtier Location', lastLogin:'2026-05-10', status:'active' },
  { id:'u-9', name:'Détroit Auto',          initials:'DA', email:'partenaires@detroitauto.ca',   role:'fleet_partner',   scope:'Détroit Auto Services',  lastLogin:'2026-05-07', status:'active' },
  { id:'u-10', name:'New onboarding',    initials:'??', email:'invited@example.com',     role:'hotel_manager',   scope:'Flow Hotels Havre-Saint-Pierre · pre-launch', lastLogin:'—', status:'invited' },
]

interface Action { id: string; group: string; label: string }

const ACTIONS: Action[] = [
  { group: 'Hotels', id: 'hotels.view',          label: 'View bookings & rooms' },
  { group: 'Hotels', id: 'hotels.edit',          label: 'Edit bookings · check-in / check-out' },
  { group: 'Hotels', id: 'hotels.cancel',        label: 'Cancel bookings' },
  { group: 'Hotels', id: 'hotels.rate.override', label: 'Override rates' },
  { group: 'Fleet',  id: 'fleet.view',           label: 'View fleet inventory' },
  { group: 'Fleet',  id: 'fleet.release',        label: 'Release vehicles' },
  { group: 'Fleet',  id: 'fleet.partner.list',   label: 'List partner vehicles' },
  { group: 'Finance',id: 'pay.collect',          label: 'Collect payments' },
  { group: 'Finance',id: 'pay.refund',           label: 'Issue refunds' },
  { group: 'Finance',id: 'pay.payout.approve',   label: 'Approve partner payouts' },
  { group: 'Admin',  id: 'admin.users',          label: 'Manage users' },
  { group: 'Admin',  id: 'admin.properties',     label: 'Add / edit properties' },
  { group: 'Admin',  id: 'admin.channels',       label: 'Channel manager' },
  { group: 'Rewards',id: 'rewards.adjust',       label: 'Adjust member points' },
  { group: 'Rewards',id: 'rewards.tier',         label: 'Override member tier' },
  { group: 'Rewards',id: 'rewards.disputes',     label: 'Approve / reject disputes' },
  { group: 'Rewards',id: 'rewards.reconcile',    label: 'Reconcile partnerships' },
  { group: 'Rewards',id: 'rewards.tier.config',  label: 'Edit tier thresholds' },
]

const PERMS: Record<Role, Record<string, boolean>> = {
  superadmin: Object.fromEntries(ACTIONS.map((a) => [a.id, true])) as Record<string, boolean>,
  country_manager: {
    'hotels.view': true, 'hotels.edit': true, 'hotels.cancel': true, 'hotels.rate.override': true,
    'fleet.view': true, 'fleet.release': true, 'fleet.partner.list': true,
    'pay.collect': true, 'pay.refund': true, 'pay.payout.approve': true,
    'admin.users': false, 'admin.properties': false, 'admin.channels': true,
  },
  hotel_manager: {
    'hotels.view': true, 'hotels.edit': true, 'hotels.cancel': true, 'hotels.rate.override': true,
    'fleet.view': false, 'fleet.release': false, 'fleet.partner.list': false,
    'pay.collect': true, 'pay.refund': false, 'pay.payout.approve': false,
    'admin.users': false, 'admin.properties': false, 'admin.channels': false,
  },
  car_agent: {
    'hotels.view': false, 'hotels.edit': false, 'hotels.cancel': false, 'hotels.rate.override': false,
    'fleet.view': true, 'fleet.release': true, 'fleet.partner.list': false,
    'pay.collect': true, 'pay.refund': false, 'pay.payout.approve': false,
    'admin.users': false, 'admin.properties': false, 'admin.channels': false,
  },
  fleet_partner: {
    'hotels.view': false, 'hotels.edit': false, 'hotels.cancel': false, 'hotels.rate.override': false,
    'fleet.view': true, 'fleet.release': false, 'fleet.partner.list': true,
    'pay.collect': false, 'pay.refund': false, 'pay.payout.approve': false,
    'admin.users': false, 'admin.properties': false, 'admin.channels': false,
  },
  reward_manager: {
    'hotels.view': true, 'hotels.edit': false, 'hotels.cancel': false, 'hotels.rate.override': false,
    'fleet.view': true, 'fleet.release': false, 'fleet.partner.list': true,
    'pay.collect': false, 'pay.refund': false, 'pay.payout.approve': false,
    'admin.users': false, 'admin.properties': false, 'admin.channels': false,
    'rewards.adjust': true, 'rewards.tier': true, 'rewards.disputes': true,
    'rewards.reconcile': true, 'rewards.tier.config': false,
  },
  guest: {} as Record<string, boolean>,
}

const ROLES_FOR_MATRIX: Role[] = ['superadmin', 'country_manager', 'hotel_manager', 'car_agent', 'fleet_partner', 'reward_manager']

export default function Users() {
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [perms, setPerms] = useState(PERMS)
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = useMemo(() => USERS.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (q.trim() && !u.name.toLowerCase().includes(q.toLowerCase()) && !u.email.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [q, roleFilter])

  const toggle = (role: Role, action: string) => {
    setPerms((cur) => ({
      ...cur,
      [role]: { ...cur[role], [action]: !cur[role][action] },
    }))
  }

  const grouped = ACTIONS.reduce<Record<string, Action[]>>((acc, a) => {
    acc[a.group] = acc[a.group] ?? []
    acc[a.group].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">SuperAdmin · Access</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Users & Roles</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{USERS.length} accounts · permission matrix is the source of truth</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Invite user
        </button>
      </header>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60 flex flex-wrap gap-3 items-end justify-between">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Accounts</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
              className="px-2 py-1.5 text-sm rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory"
            >
              <option value="all">All roles</option>
              {ROLES_FOR_MATRIX.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['User','Email','Role','Scope','Last login','Status','Actions'].map((h) => (
                <th key={h} className="label-caps font-semibold px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-4 py-2 text-ink dark:text-ivory">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-teal text-white text-xs flex items-center justify-center font-semibold">{u.initials}</span>
                    {u.name}
                  </div>
                </td>
                <td className="px-4 py-2 text-g40">{u.email}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory inline-flex items-center gap-1"><Building2 className="h-3 w-3 text-g40" /> {u.scope}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{u.lastLogin === '—' ? '—' : formatDate(u.lastLogin)}</td>
                <td className="px-4 py-2"><FlowStatusBadge tone={STATUS_TONE[u.status]} dot>{u.status}</FlowStatusBadge></td>
                <td className="px-4 py-2 text-xs">
                  <button className="text-teal hover:text-teal-dark font-medium mr-3">Edit</button>
                  <button className="text-g40 hover:text-red-600">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal" />
            <h2 className="font-display text-lg text-ink dark:text-ivory">Permission matrix</h2>
          </div>
          <span className="text-xs text-g40">Click to toggle · changes save instantly</span>
        </header>
        <div className="overflow-x-auto flow-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                <th className="label-caps text-left px-4 py-2 sticky left-0 bg-teal min-w-[260px]">Action</th>
                {ROLES_FOR_MATRIX.map((r) => (
                  <th key={r} className="label-caps text-center px-3 py-2 whitespace-nowrap">{ROLE_LABELS[r].replace(' · Co-Founder','')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([group, actions]) => (
                <Fragment key={group}>
                  <tr className="bg-ivory dark:bg-panel">
                    <td colSpan={ROLES_FOR_MATRIX.length + 1} className="px-4 py-1.5 label-caps text-g40">{group}</td>
                  </tr>
                  {actions.map((a, i) => (
                    <tr key={a.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                      <td className="px-4 py-2 text-ink dark:text-ivory sticky left-0 bg-inherit">{a.label}</td>
                      {ROLES_FOR_MATRIX.map((r) => {
                        const checked = perms[r][a.id] ?? false
                        return (
                          <td key={r} className="px-3 py-2 text-center">
                            <button
                              onClick={() => toggle(r, a.id)}
                              className={cn(
                                'h-5 w-5 rounded-input border flex items-center justify-center transition mx-auto',
                                checked
                                  ? 'bg-teal border-teal text-white'
                                  : 'bg-white dark:bg-panel border-g20/60 hover:border-teal'
                              )}
                            >
                              {checked && <X className="h-3 w-3 -rotate-45 scale-110" strokeWidth={3} />}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {inviteOpen && (
        <>
          <div className="fixed inset-0 bg-ink/50 z-40" onClick={() => setInviteOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel p-5">
              <h3 className="font-display text-lg text-ink dark:text-ivory mb-1">Invite user</h3>
              <p className="text-xs text-g40 mb-4">An email invitation will be sent. They'll set their own password.</p>
              <div className="space-y-3">
                <Field label="Full name" defaultValue="" />
                <Field label="Email" defaultValue="" type="email" />
                <Field label="Role" select options={ROLES_FOR_MATRIX.map((r) => ROLE_LABELS[r])} />
                <Field label="Scope" defaultValue="Flow Station Blanc-Sablon" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setInviteOpen(false)} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
                <button onClick={() => setInviteOpen(false)} className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium">
                  <Mail className="h-3.5 w-3.5" /> Send invite
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Field({ label, defaultValue, type = 'text', select, options }: { label: string; defaultValue?: string; type?: string; select?: boolean; options?: string[] }) {
  return (
    <label className="block">
      <span className="label-caps text-g40 mb-1 block">{label}</span>
      {select ? (
        <select className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} defaultValue={defaultValue} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
      )}
    </label>
  )
}
