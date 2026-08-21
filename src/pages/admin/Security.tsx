import { useMemo, useState } from 'react'
import { ShieldCheck, AlertTriangle, Lock, Globe2, FileText, ExternalLink, KeyRound, CreditCard, ScanLine, Bug, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { SECURITY_CONTROLS, postureSummary, type ControlRow, type ControlStatus } from '../../lib/security'

const STATUS_TONE: Record<ControlStatus, 'active' | 'pending' | 'cancelled' | 'neutral'> = {
  green: 'active', amber: 'pending', red: 'cancelled', na: 'neutral',
}

const STATUS_LABEL: Record<ControlStatus, string> = {
  green: 'OK', amber: 'Partial', red: 'Gap', na: 'N/A',
}

const STATUS_DOT: Record<ControlStatus, string> = {
  green: 'bg-teal', amber: 'bg-copper', red: 'bg-red-500', na: 'bg-g40',
}

const CATEGORY_ICON: Record<ControlRow['category'], React.ComponentType<{ className?: string }>> = {
  'PCI-DSS': CreditCard,
  OWASP: Bug,
  Auth: KeyRound,
  Privacy: Globe2,
  Infra: ScanLine,
  Cryptography: Lock,
}

export default function SecurityDashboard() {
  const summary = useMemo(() => postureSummary(), [])
  const [category, setCategory] = useState<'all' | ControlRow['category']>('all')
  const [status, setStatus] = useState<'all' | ControlStatus>('all')

  const rows = useMemo(() => SECURITY_CONTROLS.filter((c) => {
    if (category !== 'all' && c.category !== category) return false
    if (status !== 'all' && c.status !== status) return false
    return true
  }), [category, status])

  const grouped = useMemo(() => {
    const out: Record<string, ControlRow[]> = {}
    rows.forEach((r) => { (out[r.category] = out[r.category] ?? []).push(r) })
    return out
  }, [rows])

  const total = SECURITY_CONTROLS.length
  const remediationPct = Math.round(((summary.green + summary.na) / total) * 100)
  const blockerCount = summary.red

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">SuperAdmin · Security & Compliance</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Security posture</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">
            PCI-DSS · OWASP · GDPR / POPIA · African data protection — live status of every control.
          </p>
        </div>
        <a
          href="/SECURITY.md"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal"
        >
          <ExternalLink className="h-4 w-4" /> Full SECURITY.md
        </a>
      </header>

      {blockerCount > 0 && (
        <section className="rounded-card border border-red-300 bg-red-50/70 dark:bg-red-900/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-display text-lg text-red-700 dark:text-red-300">
              {blockerCount} blocker{blockerCount === 1 ? '' : 's'} before live traffic
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
              These controls are not in place yet. Each one must be remediated before Flow can take real card payments or process real personal data.
              The biggest categories: real authentication, server-side RBAC, Stripe Elements integration, HTTPS+HSTS.
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <FlowKPICard label="Controls tracked" value={String(total)} accent="teal" icon={<ShieldCheck className="h-4 w-4" />} />
        <FlowKPICard label="Green" value={String(summary.green)} accent="teal" hint="In place" />
        <FlowKPICard label="Amber" value={String(summary.amber)} accent="copper" hint="Partial" />
        <FlowKPICard label="Red" value={String(summary.red)} accent="copper" hint="Blocker" />
        <FlowKPICard label="Remediation %" value={`${remediationPct}%`} accent="teal" hint="Green + N/A" />
      </div>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">What this app is — and isn't — yet</h3>
        <ul className="grid sm:grid-cols-3 gap-3 text-sm">
          <li className="rounded-input border border-teal/30 bg-teal-light/40 dark:bg-teal-dark/20 p-3">
            <strong className="text-ink dark:text-ivory">Frontend</strong>
            <p className="text-g40 dark:text-g60 mt-1">React + TypeScript prototype. JSX escaping prevents most XSS. Tests guard regressions. Solid for what it is.</p>
          </li>
          <li className="rounded-input border border-copper/30 bg-copper-light/40 dark:bg-copper-dark/20 p-3">
            <strong className="text-ink dark:text-ivory">Mock backend</strong>
            <p className="text-g40 dark:text-g60 mt-1">All "data" is in <code className="text-[11px]">localStorage</code>. Demo only. Production needs a real API with server-side enforcement.</p>
          </li>
          <li className="rounded-input border border-red-300 bg-red-50/70 dark:bg-red-900/20 p-3">
            <strong className="text-red-700 dark:text-red-300">Payment handling</strong>
            <p className="text-red-700 dark:text-red-300 mt-1"><strong>BLOCKER · Not PCI-compliant.</strong> Card data hits React directly. Must move to Stripe Elements (iframe tokenization) before live traffic.</p>
          </li>
        </ul>
      </section>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-g40" aria-hidden="true" />
          <span className="label-caps text-g40">Filter</span>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | ControlRow['category'])}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All categories</option>
            <option>PCI-DSS</option>
            <option>OWASP</option>
            <option>Auth</option>
            <option>Privacy</option>
            <option>Infra</option>
            <option>Cryptography</option>
          </select>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | ControlStatus)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All statuses</option>
            <option value="red">🔴 Gap</option>
            <option value="amber">🟡 Partial</option>
            <option value="green">🟢 OK</option>
            <option value="na">⚪ N/A</option>
          </select>
        </div>
        <div className="ml-auto label-caps text-g40">{rows.length} of {total} controls</div>
      </section>

      {Object.entries(grouped).map(([cat, list]) => {
        const Icon = CATEGORY_ICON[cat as ControlRow['category']]
        return (
          <section key={cat} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
            <header className="px-5 py-3 border-b border-g20/60 flex items-center gap-2">
              <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
              <h3 className="font-display text-lg text-ink dark:text-ivory">{cat}</h3>
              <span className="text-xs text-g40 ml-1">· {list.length} controls</span>
            </header>
            <ul className="divide-y divide-g20/40">
              {list.map((c) => (
                <li key={c.id} className="px-5 py-3 flex items-start gap-3">
                  <span className={cn('mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', STATUS_DOT[c.status])} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink dark:text-ivory">{c.title}</span>
                      <span className="text-[11px] text-g40 font-mono">{c.id}</span>
                    </div>
                    <p className="text-xs text-g40 dark:text-g60 mt-0.5">{c.notes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <FlowStatusBadge tone={STATUS_TONE[c.status]} dot>{STATUS_LABEL[c.status]}</FlowStatusBadge>
                    <div className="text-[11px] text-g40 mt-1">Owner: {c.owner}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory mb-3">Reporting a vulnerability</h3>
        <p className="text-sm text-g40 dark:text-g60">
          There is no live deployment yet. When one exists, the recommended disclosure path is:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink dark:text-ivory">
          <li className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-teal mt-0.5 shrink-0" aria-hidden="true" />
            <span>Public: a <code className="text-[11px]">security.txt</code> (RFC 9116) on the production domain with the disclosure address and PGP key.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-teal mt-0.5 shrink-0" aria-hidden="true" />
            <span>Private: <strong>security@flowrentals.com</strong> · 7-day initial response SLA · 90-day coordinated disclosure window.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-teal mt-0.5 shrink-0" aria-hidden="true" />
            <span>Bug bounty: consider HackerOne / Intigriti once the surface area is large enough to justify the spend.</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
