import { useState } from 'react'
import { Building2, DollarSign, Receipt, Mail, MessageSquare, Key, GitBranch, HardDrive, Plus, RefreshCw, Copy, EyeOff, Eye, Check } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'

type Section = 'company' | 'currencies' | 'tax' | 'email' | 'sms' | 'api' | 'version' | 'backup'

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'company',    label: 'Company info',         icon: Building2 },
  { id: 'currencies', label: 'Currencies & FX',      icon: DollarSign },
  { id: 'tax',        label: 'Tax configuration',    icon: Receipt },
  { id: 'email',      label: 'Email templates',      icon: Mail },
  { id: 'sms',        label: 'SMS / WhatsApp',       icon: MessageSquare },
  { id: 'api',        label: 'API keys',             icon: Key },
  { id: 'version',    label: 'Flow OS version',      icon: GitBranch },
  { id: 'backup',     label: 'Backup & export',      icon: HardDrive },
]

export default function Settings() {
  const [section, setSection] = useState<Section>('company')
  return (
    <div className="space-y-5">
      <header>
        <div className="label-caps text-g40">SuperAdmin · System</div>
        <h1 className="font-display text-3xl text-ink dark:text-ivory">System Settings</h1>
        <p className="text-sm text-g40 dark:text-g60 mt-1">Configure Flow OS for the whole portfolio</p>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setSection(n.id)}
                  className={cn(
                    'w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-l-2 transition',
                    section === n.id
                      ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory'
                      : 'border-transparent text-g40 hover:bg-ivory dark:hover:bg-panel hover:text-ink dark:hover:text-ivory'
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          {section === 'company' && <CompanySection />}
          {section === 'currencies' && <CurrencySection />}
          {section === 'tax' && <TaxSection />}
          {section === 'email' && <EmailSection />}
          {section === 'sms' && <SmsSection />}
          {section === 'api' && <ApiSection />}
          {section === 'version' && <VersionSection />}
          {section === 'backup' && <BackupSection />}
        </section>
      </div>
    </div>
  )
}

function Card({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card', className)}>
      <header className="mb-4">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function Field({ label, defaultValue, type = 'text', hint }: { label: string; defaultValue?: string; type?: string; hint?: string }) {
  return (
    <label className="block mb-3 last:mb-0">
      <span className="label-caps text-g40 mb-1 block">{label}</span>
      <input type={type} defaultValue={defaultValue} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
      {hint && <p className="text-[11px] text-g40 mt-1">{hint}</p>}
    </label>
  )
}

function CompanySection() {
  return (
    <div className="space-y-4">
      <Card title="Company information" subtitle="Used on invoices, contracts and the booking app">
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Legal entity" defaultValue="Flow Rentals Global Inc." />
          <Field label="Parent company" defaultValue="VBMS Holdings Inc." />
          <Field label="Registered address" defaultValue="Avenue Patrice Lumumba · Plateau · Brazzaville · Congo" />
          <Field label="Business number" defaultValue="CG-FRG-2024-0001" />
          <Field label="Operating regions" defaultValue="Congo · Uganda · Ethiopia · (pipeline) Kenya · Rwanda · Senegal · Nigeria" />
          <Field label="Brand tagline" defaultValue="Stay. Drive. Africa." />
        </div>
      </Card>
      <Card title="Subsidiaries & legal entities">
        <ul className="divide-y divide-g20/40">
          {[
            { name: 'Flow Rentals Uganda Ltd',      country: 'Uganda',    id: 'UG-2024-44182', role: 'Operating' },
            { name: 'Flow Rentals Congo SARL',      country: 'Congo',     id: 'CG-2024-0982',  role: 'Operating' },
            { name: 'Flow Rentals Ethiopia plc',    country: 'Ethiopia',  id: 'ET-2024-12091', role: 'Operating' },
            { name: 'Flow Rentals Kenya Ltd',       country: 'Kenya',     id: 'KE-2026-PI-01', role: 'Pilot'     },
            { name: 'Flow Rentals Senegal SARL',    country: 'Senegal',   id: 'SN-2026-PI-02', role: 'Pilot'     },
            { name: 'VBMS Tunisia SUARL',           country: 'Tunisia',   id: 'TN-1287442-A',  role: 'Supply chain' },
            { name: 'VBMS Holdings Inc.',           country: 'Parent · ex-Africa', id: 'CA 5544-6912', role: 'Holding' },
          ].map((e) => (
            <li key={e.id} className="py-3 flex items-center gap-3">
              <Building2 className="h-4 w-4 text-teal shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-ink dark:text-ivory">{e.name}</div>
                <div className="text-xs text-g40 font-mono">{e.id}</div>
              </div>
              <FlowStatusBadge tone="info">{e.country}</FlowStatusBadge>
              <FlowStatusBadge tone={e.role === 'Holding' ? 'pending' : 'active'}>{e.role}</FlowStatusBadge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function CurrencySection() {
  const FX = [
    { code: 'USD', name: 'US Dollar (continental)', base: true,  rate: 1.0,   updated: '2026-05-10 12:00 UTC' },
    { code: 'XAF', name: 'CFA Franc · Central',     base: false, rate: 600,   updated: '2026-05-10 12:00 UTC' },
    { code: 'XOF', name: 'CFA Franc · West',        base: false, rate: 600,   updated: '2026-05-10 12:00 UTC' },
    { code: 'UGX', name: 'Ugandan Shilling',        base: false, rate: 3700,  updated: '2026-05-10 12:00 UTC' },
    { code: 'ETB', name: 'Ethiopian Birr',          base: false, rate: 56,    updated: '2026-05-10 12:00 UTC' },
    { code: 'KES', name: 'Kenyan Shilling',         base: false, rate: 130,   updated: '2026-05-10 12:00 UTC' },
    { code: 'RWF', name: 'Rwandan Franc',           base: false, rate: 1350,  updated: '2026-05-10 12:00 UTC' },
    { code: 'NGN', name: 'Nigerian Naira',          base: false, rate: 1500,  updated: '2026-05-10 12:00 UTC' },
    { code: 'GHS', name: 'Ghanaian Cedi',           base: false, rate: 12,    updated: '2026-05-10 12:00 UTC' },
    { code: 'ZAR', name: 'South African Rand',      base: false, rate: 18,    updated: '2026-05-10 12:00 UTC' },
    { code: 'MAD', name: 'Moroccan Dirham',         base: false, rate: 10,    updated: '2026-05-10 12:00 UTC' },
    { code: 'EGP', name: 'Egyptian Pound',          base: false, rate: 48,    updated: '2026-05-10 12:00 UTC' },
  ]
  return (
    <div className="space-y-4">
      <Card title="Currencies & exchange rates" subtitle="Auto-refreshes daily · falls back to last good rate on failure">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-g40">Base currency: <span className="text-ink dark:text-ivory font-medium">USD</span></div>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh now
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Code','Currency','Rate (per USD)','Last updated','Status'].map((h) => (
                <th key={h} className="label-caps font-semibold px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FX.map((c, i) => (
              <tr key={c.code} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-4 py-2 font-mono text-ink dark:text-ivory">{c.code}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{c.name}</td>
                <td className="px-4 py-2 text-copper font-display font-bold">{c.rate.toLocaleString()}</td>
                <td className="px-4 py-2 text-xs text-g40">{c.updated}</td>
                <td className="px-4 py-2">
                  {c.base ? <FlowStatusBadge tone="active">Base</FlowStatusBadge> : <FlowStatusBadge tone="info" dot>Live</FlowStatusBadge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function TaxSection() {
  const rules = [
    { country: 'Uganda',         tax: 'VAT', rate: 18,   authority: 'URA',     scheme: 'Output VAT collected per booking' },
    { country: 'Congo',          tax: 'TVA', rate: 18.9, authority: 'DGI',     scheme: 'Output TVA collected per booking' },
    { country: 'Ethiopia',       tax: 'VAT', rate: 15,   authority: 'MoR',     scheme: 'Output VAT collected per booking' },
    { country: 'Kenya',          tax: 'VAT', rate: 16,   authority: 'KRA',     scheme: 'Output VAT collected per booking · pilot launch Q3 2026' },
    { country: 'Rwanda',         tax: 'VAT', rate: 18,   authority: 'RRA',     scheme: 'Pilot launch Q4 2026' },
    { country: 'Senegal',        tax: 'TVA', rate: 18,   authority: 'DGID',    scheme: 'Pilot launch Q1 2027' },
    { country: 'Nigeria',        tax: 'VAT', rate: 7.5,  authority: 'FIRS',    scheme: 'Prospect · partnership LOIs in negotiation' },
    { country: 'South Africa',   tax: 'VAT', rate: 15,   authority: 'SARS',    scheme: 'Prospect · long-term target' },
  ]
  return (
    <Card title="Tax configuration · per country">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-teal text-white">
            {['Country','Tax','Rate','Authority','Scheme'].map((h) => (
              <th key={h} className="label-caps font-semibold px-4 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={r.country} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
              <td className="px-4 py-2 text-ink dark:text-ivory font-medium">{r.country}</td>
              <td className="px-4 py-2 text-ink dark:text-ivory">{r.tax}</td>
              <td className="px-4 py-2 text-copper font-display font-bold">{r.rate}%</td>
              <td className="px-4 py-2 text-ink dark:text-ivory">{r.authority}</td>
              <td className="px-4 py-2 text-xs text-g40">{r.scheme}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function EmailSection() {
  const templates = [
    { id:'booking_confirmation', name:'Booking confirmation',  preview:'Hello {{guest_name}}, your booking for {{property}} is confirmed for {{nights}} nights from {{check_in}}…', enabled:true },
    { id:'pre_arrival',          name:'Pre-arrival reminder',  preview:'See you tomorrow at {{property}}. Bring photo ID. Skip the queue — check in on the Flow App.',          enabled:true },
    { id:'rental_release',       name:'Rental release receipt',preview:'Your vehicle {{vehicle}} is yours from {{start}} to {{end}}. Drive safe.',                              enabled:true },
    { id:'rewards_tier_up',      name:'Rewards tier upgrade',  preview:'Congratulations — you are now {{tier}}. Enjoy late checkout and 4× point earning…',                    enabled:true },
    { id:'invoice_reminder',     name:'Invoice payment reminder', preview:'A friendly reminder that invoice {{invoice_id}} for {{amount}} is now {{age}} past due…',          enabled:false },
  ]
  return (
    <Card title="Email templates" subtitle="EN and FR variants · variables in {{double braces}}">
      <ul className="divide-y divide-g20/40">
        {templates.map((t) => (
          <li key={t.id} className="py-3 flex items-start gap-3">
            <Mail className="h-4 w-4 text-teal mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-ink dark:text-ivory">{t.name}</div>
                <FlowStatusBadge tone={t.enabled ? 'active' : 'completed'} dot>{t.enabled ? 'enabled' : 'paused'}</FlowStatusBadge>
              </div>
              <p className="text-xs text-g40 mt-0.5">{t.preview}</p>
            </div>
            <button className="text-xs text-teal hover:text-teal-dark font-medium">Edit</button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function SmsSection() {
  return (
    <Card title="SMS & WhatsApp" subtitle="Twilio · MTN bulk · WhatsApp Business API">
      <div className="space-y-3">
        <Field label="Twilio account SID" defaultValue="ACxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        <Field label="WhatsApp Business number" defaultValue="+256 200 121 248" />
        <Field label="Sender ID (SMS)" defaultValue="FLOWRENT" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Toggle label="Pre-arrival SMS · 24h before" on />
        <Toggle label="WhatsApp on check-in" on />
        <Toggle label="Rental return reminder" on />
        <Toggle label="Promotional broadcasts" />
      </div>
    </Card>
  )
}

function ApiSection() {
  const [shown, setShown] = useState<string | null>(null)
  const keys = [
    { name: 'Production · API', key: 'sk_live_2026_ABCDEFGH1234567890ABCDEFGH', created: '2024-08-12', lastUsed: '2026-05-10 12:42 UTC' },
    { name: 'Production · Webhook signing', key: 'whsec_2026_J1K2L3M4N5O6P7Q8R9S0', created: '2024-08-12', lastUsed: '2026-05-10 12:39 UTC' },
    { name: 'Staging', key: 'sk_test_2026_ZZYYXXWW9988', created: '2024-11-04', lastUsed: '2026-05-08 16:11 UTC' },
  ]
  return (
    <Card title="API keys" subtitle="Keys are scoped to environments · rotate every 90 days">
      <ul className="divide-y divide-g20/40">
        {keys.map((k, i) => (
          <li key={i} className="py-3 flex items-center gap-3">
            <Key className="h-4 w-4 text-teal shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink dark:text-ivory">{k.name}</div>
              <div className="text-xs text-g40">Created {formatDate(k.created)} · last used {k.lastUsed}</div>
              <div className="mt-1 inline-flex items-center gap-2 font-mono text-xs px-2 py-1 rounded-input bg-ivory dark:bg-panel text-ink dark:text-ivory">
                {shown === k.key ? k.key : k.key.replace(/(?<=^.{8}).+/, '•'.repeat(24))}
                <button onClick={() => setShown((s) => s === k.key ? null : k.key)} className="text-g40 hover:text-teal" title="Toggle">
                  {shown === k.key ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button className="text-g40 hover:text-teal" title="Copy"><Copy className="h-3 w-3" /></button>
              </div>
            </div>
            <button className="text-xs text-copper hover:text-copper-dark font-medium">Rotate</button>
          </li>
        ))}
      </ul>
      <button className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
        <Plus className="h-3.5 w-3.5" /> Create new key
      </button>
    </Card>
  )
}

function VersionSection() {
  const changelog = [
    { version: 'v1.4.0', date: '2026-05-09', notes: 'Phase 4 · Flow Pay, Rewards admin, Channel manager, Procurement, Custom report builder' },
    { version: 'v1.3.0', date: '2026-05-08', notes: 'Phase 3 · Fleet internals: vehicles, kiosk, drivers, live GPS, fleet reports' },
    { version: 'v1.2.0', date: '2026-05-08', notes: 'Phase 2 · Hotel internals: rooms, housekeeping Kanban, front-desk wizard, guests, F&B, hotel reports' },
    { version: 'v1.1.0', date: '2026-05-07', notes: 'Phase 1 · Brand design system, component library, 6 anchor screens, full router' },
    { version: 'v1.0.0', date: '2026-04-01', notes: 'Initial scaffold' },
  ]
  return (
    <Card title="Flow OS version" subtitle="Currently running v1.4.0 · auto-updates apply during low-traffic windows">
      <ul className="space-y-3">
        {changelog.map((c, i) => (
          <li key={c.version} className="flex items-start gap-3">
            <span className={cn('mt-1 px-2 py-0.5 rounded-badge text-xs label-caps shrink-0', i === 0 ? 'bg-teal text-white' : 'bg-ivory dark:bg-panel text-g40')}>{c.version}</span>
            <div className="flex-1">
              <div className="text-xs text-g40">{formatDate(c.date)}</div>
              <p className="text-sm text-ink dark:text-ivory mt-0.5">{c.notes}</p>
            </div>
            {i === 0 && <FlowStatusBadge tone="active" dot>Current</FlowStatusBadge>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function BackupSection() {
  return (
    <div className="space-y-4">
      <Card title="Backups" subtitle="Daily snapshots · 90-day retention · stored in Nairobi and Cape Town regions">
        <ul className="space-y-2">
          {[
            { when: '2026-05-10 02:00 UTC', size: '4.2 GB', status: 'ok' },
            { when: '2026-05-09 02:00 UTC', size: '4.1 GB', status: 'ok' },
            { when: '2026-05-08 02:00 UTC', size: '4.1 GB', status: 'ok' },
            { when: '2026-05-07 02:00 UTC', size: '4.0 GB', status: 'ok' },
          ].map((b, i) => (
            <li key={i} className="flex items-center justify-between rounded-input border border-g20/60 bg-ivory dark:bg-panel px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-teal" />
                <span className="text-ink dark:text-ivory">{b.when}</span>
              </span>
              <span className="text-g40">{b.size}</span>
              <button className="text-xs text-teal hover:text-teal-dark font-medium">Restore</button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Manual export" subtitle="Full database snapshot or scoped exports">
        <div className="grid sm:grid-cols-2 gap-3">
          <button className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-4 text-left hover:border-teal">
            <HardDrive className="h-5 w-5 text-teal mb-1" />
            <div className="font-medium text-ink dark:text-ivory text-sm">Full snapshot</div>
            <p className="text-xs text-g40 mt-1">Encrypted .zip · ready in ~3 minutes</p>
          </button>
          <button className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-4 text-left hover:border-teal">
            <Receipt className="h-5 w-5 text-teal mb-1" />
            <div className="font-medium text-ink dark:text-ivory text-sm">Financial year export</div>
            <p className="text-xs text-g40 mt-1">CSV bundle · all entities · ready in ~1 minute</p>
          </button>
        </div>
      </Card>
    </div>
  )
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  const [active, setActive] = useState(!!on)
  return (
    <label className="flex items-center justify-between gap-2 rounded-input border border-g20/60 bg-ivory dark:bg-panel px-3 py-2 cursor-pointer">
      <span className="text-sm text-ink dark:text-ivory">{label}</span>
      <span className={cn('w-9 h-5 rounded-full relative transition', active ? 'bg-teal' : 'bg-g20')} onClick={() => setActive((a) => !a)}>
        <span className={cn('absolute top-0.5 h-4 w-4 bg-white rounded-full transition', active ? 'left-4' : 'left-0.5')} />
      </span>
    </label>
  )
}
