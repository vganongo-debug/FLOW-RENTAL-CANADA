import { useMemo, useState } from 'react'
import { Plane, Building2, CreditCard, Car, Briefcase, RefreshCw, Handshake } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { PartnershipStatus, RewardsPartnership } from '../../lib/types'

const KIND_ICON = {
  airline: Plane,
  ota: Building2,
  card: CreditCard,
  fleet: Car,
  corporate: Briefcase,
} as const

const STATUS_TONE: Record<PartnershipStatus, 'active' | 'info' | 'pending' | 'cancelled'> = {
  in_balance: 'active',
  awaiting_partner: 'info',
  discrepancy: 'pending',
  settled: 'active',
}

const STATUS_LABEL: Record<PartnershipStatus, string> = {
  in_balance: 'In balance',
  awaiting_partner: 'Awaiting partner',
  discrepancy: 'Discrepancy',
  settled: 'Settled',
}

export default function Partnerships() {
  const { user } = useAuth()
  const staff = user?.name ?? 'System'
  const [confirm, setConfirm] = useState<RewardsPartnership | null>(null)
  const { data, loading, refetch } = useApi(() => rewards.listPartnerships(), [])

  const stats = useMemo(() => {
    if (!data) return { total: 0, inBalance: 0, discrepancy: 0, awaiting: 0, totalDelta: 0 }
    return {
      total: data.length,
      inBalance: data.filter((p) => p.status === 'in_balance' || p.status === 'settled').length,
      discrepancy: data.filter((p) => p.status === 'discrepancy').length,
      awaiting: data.filter((p) => p.status === 'awaiting_partner').length,
      totalDelta: data.reduce((s, p) => s + Math.abs(p.delta), 0),
    }
  }, [data])

  const onReconcile = async () => {
    if (!confirm) return
    await rewards.reconcilePartnership(confirm.id, staff)
    setConfirm(null)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FlowKPICard label="Partnerships" value={String(stats.total)} accent="teal" icon={<Handshake className="h-4 w-4" />} />
        <FlowKPICard label="In balance / settled" value={String(stats.inBalance)} accent="teal" />
        <FlowKPICard label="Discrepancies" value={String(stats.discrepancy)} accent="copper" hint="Action required" />
        <FlowKPICard label="Awaiting partner" value={String(stats.awaiting)} accent="copper" hint="Their data is late" />
      </div>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-ivory">Partner reconciliation</h2>
            <p className="text-xs text-g40 dark:text-g60">Cycle W18 · 2026 · all six partners</p>
          </div>
          <div className="text-xs text-g40">
            Total absolute delta: <span className="font-display font-bold text-copper text-base">{stats.totalDelta.toLocaleString()} pts</span>
          </div>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Partner','Type','Flow pts','Partner pts','Delta','Cycle','Status','Last','Action'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', [2,3,4].includes(i) ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="p-8 text-center text-g40">Loading…</td></tr>
            )}
            {(data ?? []).map((p, i) => {
              const Icon = KIND_ICON[p.partnerKind]
              const deltaColor = p.delta === 0 ? 'text-g40' : p.delta > 0 ? 'text-copper' : 'text-teal'
              return (
                <tr key={p.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-input bg-ivory dark:bg-panel border border-g20/60 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="font-medium text-ink dark:text-ivory">{p.partnerName}</div>
                        <div className="text-[11px] text-g40 font-mono">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className="text-xs label-caps text-g40 capitalize">{p.partnerKind}</span></td>
                  <td className="px-3 py-3 text-right text-ink dark:text-ivory font-mono">{p.flowPoints.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-ink dark:text-ivory font-mono">{p.partnerPoints.toLocaleString()}</td>
                  <td className={cn('px-3 py-3 text-right font-display font-bold', deltaColor)}>
                    {p.delta > 0 ? '+' : ''}{p.delta.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-g40">{p.cycleLabel}</td>
                  <td className="px-3 py-3"><FlowStatusBadge tone={STATUS_TONE[p.status]} dot>{STATUS_LABEL[p.status]}</FlowStatusBadge></td>
                  <td className="px-3 py-3 text-xs text-g40">{p.lastReconciledAt ? formatDate(p.lastReconciledAt) : '—'}</td>
                  <td className="px-3 py-3">
                    {p.status !== 'settled' && p.status !== 'in_balance' && (
                      <button
                        onClick={() => setConfirm(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-input bg-teal text-white text-[11px] font-medium"
                      >
                        <RefreshCw className="h-3 w-3" /> Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory">How reconciliation works</h3>
        <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <Step n="1" t="Receive partner data" b="Each partner uploads or API-pushes their view of the cycle's qualifying activity." />
          <Step n="2" t="Compare ledgers" b="Flow's points ledger is matched line-by-line against the partner's. Differences are surfaced in real time." />
          <Step n="3" t="Resolve discrepancies" b="Manager triages each line · raises queries with the partner · or accepts the partner's number and updates Flow's ledger." />
          <Step n="4" t="Audit & settle" b="Reconciliation events log to the audit trail · status flips to Settled · next cycle starts clean." />
        </ul>
      </section>

      <FlowConfirmDialog
        open={!!confirm}
        title={`Reconcile ${confirm?.partnerName ?? ''}?`}
        description={confirm
          ? `This accepts the partner's number (${confirm.partnerPoints.toLocaleString()}) as authoritative and aligns Flow's ledger. Delta of ${confirm.delta > 0 ? '+' : ''}${confirm.delta.toLocaleString()} will close out. An audit entry is created.`
          : ''}
        confirmLabel="Reconcile"
        onConfirm={onReconcile}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function Step({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <li className="rounded-card border border-g20/60 bg-ivory dark:bg-panel p-3">
      <span className="font-display font-bold text-2xl text-copper">{n}</span>
      <div className="font-medium text-ink dark:text-ivory mt-0.5">{t}</div>
      <p className="text-xs text-g40 mt-1">{b}</p>
    </li>
  )
}
