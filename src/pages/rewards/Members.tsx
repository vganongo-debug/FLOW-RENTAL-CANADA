import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Minus, Sparkles, Mail, Star, Lock, Unlock, ArrowUpFromLine, ArrowDownToLine, ExternalLink } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowRewardsCard } from '../../components/flow/FlowRewardsCard'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { RewardsMember, RewardsTier } from '../../lib/types'

const TIER_TONE: Record<RewardsTier, 'neutral' | 'pending' | 'active' | 'info'> = {
  Silver: 'neutral', Gold: 'pending', Platinum: 'active', Black: 'info',
}

const TIER_THRESHOLDS: Record<RewardsTier, number> = {
  Silver: 10_000, Gold: 25_000, Platinum: 50_000, Black: 100_000,
}

export default function Members() {
  const { user } = useAuth()
  const staffName = user?.name ?? 'System'

  const [selectedId, setSelectedId] = useState<string>('m-1')
  const [q, setQ] = useState('')
  const [tierFilter, setTierFilter] = useState<'all' | RewardsTier>('all')
  const [frozenOnly, setFrozenOnly] = useState(false)
  const [adjOpen, setAdjOpen] = useState(false)
  const [tierOpen, setTierOpen] = useState(false)
  const [confirmFreeze, setConfirmFreeze] = useState<RewardsMember | null>(null)

  const { data: members, loading, refetch } = useApi(() => rewards.listMembers({ frozenOnly: frozenOnly || undefined }), [frozenOnly])
  const { data: tx, refetch: refetchTx } = useApi(() => rewards.listTransactions(selectedId), [selectedId])

  const filtered = useMemo(() => {
    if (!members) return []
    return members.filter((m) => {
      if (tierFilter !== 'all' && m.tier !== tierFilter) return false
      if (q.trim() && !m.name.toLowerCase().includes(q.toLowerCase()) && !m.email.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [members, tierFilter, q])

  const selected = members?.find((m) => m.id === selectedId) ?? filtered[0]
  const nextTier =
    !selected ? null :
    selected.tier === 'Black' ? null :
    selected.tier === 'Platinum' ? 'Black' :
    selected.tier === 'Gold' ? 'Platinum' :
    'Gold'
  const pointsToNext = selected && nextTier ? Math.max(0, TIER_THRESHOLDS[nextTier] - selected.points) : 0

  const stats = useMemo(() => {
    if (!members) return { total: 0, frozen: 0, silver: 0, gold: 0, platinum: 0, black: 0 }
    return {
      total: members.length,
      frozen: members.filter((m) => m.frozen).length,
      silver: members.filter((m) => m.tier === 'Silver').length,
      gold: members.filter((m) => m.tier === 'Gold').length,
      platinum: members.filter((m) => m.tier === 'Platinum').length,
      black: members.filter((m) => m.tier === 'Black').length,
    }
  }, [members])

  const onFreeze = async () => {
    if (!confirmFreeze) return
    await rewards.setFrozen(confirmFreeze.id, !confirmFreeze.frozen, staffName, confirmFreeze.frozen ? 'Manual unfreeze · ops decision' : 'Manual freeze · fraud-rule trigger')
    setConfirmFreeze(null)
    refetch()
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <FlowKPICard label="Members" value={String(stats.total)} accent="teal" icon={<Star className="h-4 w-4" />} />
        <FlowKPICard label="Silver" value={String(stats.silver)} hint="Welcome tier" />
        <FlowKPICard label="Gold" value={String(stats.gold)} accent="copper" />
        <FlowKPICard label="Platinum" value={String(stats.platinum)} accent="teal" />
        <FlowKPICard label="Black" value={String(stats.black)} hint="Invitation-only" />
        <FlowKPICard label="Frozen" value={String(stats.frozen)} accent={stats.frozen > 0 ? 'copper' : 'teal'} hint={stats.frozen ? 'Under review' : 'All clear'} />
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-g20/60 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search members"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
                aria-label="Search members"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as 'all' | RewardsTier)}
              className="w-full px-2 py-1.5 text-sm rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory"
            >
              <option value="all">All tiers</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Black">Black</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-ink dark:text-ivory">
              <input type="checkbox" checked={frozenOnly} onChange={(e) => setFrozenOnly(e.target.checked)} className="accent-teal" />
              Frozen only
            </label>
            <div className="text-[11px] text-g40">{filtered.length} of {stats.total}</div>
          </div>
          <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40">
            {loading && <li className="px-4 py-6 text-center text-sm text-g40">Loading…</li>}
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition',
                    selectedId === m.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <span className="h-9 w-9 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold shrink-0 relative">
                    {m.initials}
                    {m.frozen && <Lock className="h-3 w-3 absolute -bottom-1 -right-1 text-copper bg-white rounded-full p-0.5" aria-label="Frozen" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory truncate">{m.name}</div>
                    <div className="text-xs text-g40 truncate">{m.country} · {m.points.toLocaleString()} pts</div>
                  </div>
                  <FlowStatusBadge tone={TIER_TONE[m.tier]}>{m.tier}</FlowStatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {selected && (
          <section className="space-y-4">
            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
              <Card title="Member profile">
                <div className="flex items-start gap-4 flex-wrap">
                  <span className="h-16 w-16 rounded-full bg-teal text-white flex items-center justify-center text-xl font-semibold relative">
                    {selected.initials}
                    {selected.frozen && <Lock className="h-4 w-4 absolute -bottom-1 -right-1 text-copper bg-white rounded-full p-0.5" aria-label="Frozen" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-2xl text-ink dark:text-ivory">{selected.name}</h2>
                      {selected.frozen && <FlowStatusBadge tone="cancelled" dot>Frozen</FlowStatusBadge>}
                    </div>
                    <div className="text-sm text-g40 mt-1">{selected.email} · {selected.country}</div>
                    <div className="text-xs text-g40 mt-1">
                      Member since {formatDate(selected.joined)} · last activity {formatDate(selected.lastActivity)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Stat label="Points balance" value={selected.points.toLocaleString()} highlight />
                  <Stat label="Lifetime earned" value={selected.lifetimeEarned.toLocaleString()} />
                  <Stat label="Lifetime burned" value={selected.lifetimeBurned.toLocaleString()} />
                  <Stat label="Current tier" value={selected.tier} />
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <Stat label="YTD stays"   value={String(selected.qualifyingActivityYtd.stays)} />
                  <Stat label="YTD rentals" value={String(selected.qualifyingActivityYtd.rentals)} />
                  <Stat label="YTD spend"   value={formatCurrency(selected.qualifyingActivityYtd.spendUsd)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setAdjOpen(true)} disabled={selected.frozen} className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium disabled:opacity-40">
                    <Sparkles className="h-3.5 w-3.5" /> Adjust points
                  </button>
                  <button onClick={() => setTierOpen(true)} className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">
                    <Star className="h-3.5 w-3.5" /> Override tier
                  </button>
                  <button onClick={() => setConfirmFreeze(selected)} className={cn('inline-flex items-center gap-1 px-3 py-2 rounded-input text-sm border',
                    selected.frozen ? 'border-teal text-teal' : 'border-g20 text-ink dark:text-ivory hover:border-copper hover:text-copper'
                  )}>
                    {selected.frozen ? <><Unlock className="h-3.5 w-3.5" /> Unfreeze</> : <><Lock className="h-3.5 w-3.5" /> Freeze</>}
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory">
                    <Mail className="h-3.5 w-3.5" /> Email member
                  </button>
                  <Link
                    to={`/rewards/members/${selected.id}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open full profile
                  </Link>
                </div>
              </Card>
              <FlowRewardsCard
                memberName={selected.name}
                points={selected.points}
                tier={selected.tier === 'Black' ? 'Platinum' : selected.tier}
                nextTier={nextTier === 'Black' ? null : nextTier}
                pointsToNext={pointsToNext}
              />
            </div>

            <Card title="Transaction log" subtitle="Earn · burn · manual adjustments · dispute settlements">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal text-white">
                    {['Date','Type','Reason','Staff','Reference','Points'].map((h, i) => (
                      <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 5 ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(tx ?? []).map((t, i) => (
                    <tr key={t.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                      <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(t.date)}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 text-xs label-caps">
                          {t.type === 'earn' ? <ArrowUpFromLine className="h-3 w-3 text-teal" /> : t.type === 'burn' ? <ArrowDownToLine className="h-3 w-3 text-copper" /> : <Sparkles className="h-3 w-3 text-g40" />}
                          <span className={t.type === 'earn' ? 'text-teal' : t.type === 'burn' ? 'text-copper' : 'text-g40'}>{t.type}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink dark:text-ivory">{t.reason}</td>
                      <td className="px-3 py-2 text-g40 text-xs">{t.staff ?? '—'}</td>
                      <td className="px-3 py-2 text-g40 font-mono text-xs">{t.reference ?? t.disputeId ?? '—'}</td>
                      <td className={cn('px-3 py-2 text-right font-display font-bold', t.delta > 0 ? 'text-teal' : 'text-copper')}>
                        {t.delta > 0 ? '+' : ''}{t.delta.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!tx || tx.length === 0) && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-g40">No transactions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </section>
        )}
      </div>

      {selected && adjOpen && (
        <AdjustModal
          member={selected}
          staff={staffName}
          onClose={() => setAdjOpen(false)}
          onSaved={() => { setAdjOpen(false); refetch(); refetchTx() }}
        />
      )}

      {selected && tierOpen && (
        <TierOverrideModal
          member={selected}
          staff={staffName}
          onClose={() => setTierOpen(false)}
          onSaved={() => { setTierOpen(false); refetch() }}
        />
      )}

      <FlowConfirmDialog
        open={!!confirmFreeze}
        title={confirmFreeze?.frozen ? `Unfreeze ${confirmFreeze.name}?` : `Freeze ${confirmFreeze?.name ?? ''}?`}
        description={confirmFreeze?.frozen
          ? 'Earn and burn operations will resume immediately.'
          : 'Earn and burn will be blocked until manually unfrozen. Used for fraud review or T&C breach.'}
        confirmLabel={confirmFreeze?.frozen ? 'Unfreeze' : 'Freeze'}
        destructive={!confirmFreeze?.frozen}
        onConfirm={onFreeze}
        onCancel={() => setConfirmFreeze(null)}
      />
    </div>
  )
}

function AdjustModal({ member, staff, onClose, onSaved }: { member: RewardsMember; staff: string; onClose: () => void; onSaved: () => void }) {
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit')
  const [amount, setAmount] = useState(500)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!reason.trim() || amount <= 0) return
    setSubmitting(true)
    try {
      await rewards.adjustPoints({
        memberId: member.id,
        delta: direction === 'credit' ? amount : -amount,
        reason,
        staff,
      })
      onSaved()
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel p-5">
          <h3 className="font-display text-lg text-ink dark:text-ivory">Adjust points · {member.name}</h3>
          <p className="text-xs text-g40 mt-1">Every adjustment is logged to the audit trail.</p>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <button onClick={() => setDirection('credit')}
                className={cn('flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input text-sm font-medium border-2',
                  direction === 'credit' ? 'border-teal text-teal bg-teal-light/40' : 'border-g20 text-g40'
                )}>
                <Plus className="h-3.5 w-3.5" /> Credit
              </button>
              <button onClick={() => setDirection('debit')}
                className={cn('flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input text-sm font-medium border-2',
                  direction === 'debit' ? 'border-copper text-copper bg-copper-light/40' : 'border-g20 text-g40'
                )}>
                <Minus className="h-3.5 w-3.5" /> Debit
              </button>
            </div>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Amount (points)</span>
              <input
                type="number" min={1} value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value || '0'))}
                className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </label>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Reason (required · visible to member)</span>
              <textarea
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Service recovery for room maintenance during stay"
                className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory"
              />
            </label>
            <p className="text-xs text-g40">
              New balance: {Math.max(0, member.points + (direction === 'credit' ? amount : -amount)).toLocaleString()} pts
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            <button onClick={submit} disabled={submitting || !reason.trim() || amount <= 0}
              className="px-3 py-2 rounded-input bg-teal text-white text-sm font-medium disabled:opacity-40">
              {submitting ? '…' : `Apply ${direction === 'credit' ? '+' : '−'}${amount} pts`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function TierOverrideModal({ member, staff, onClose, onSaved }: { member: RewardsMember; staff: string; onClose: () => void; onSaved: () => void }) {
  const [tier, setTier] = useState<RewardsTier>(member.tier)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!reason.trim() || tier === member.tier) return
    setSubmitting(true)
    try {
      await rewards.setTier(member.id, tier, staff, reason)
      onSaved()
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel p-5">
          <h3 className="font-display text-lg text-ink dark:text-ivory">Override tier · {member.name}</h3>
          <p className="text-xs text-g40 mt-1">Current tier: <strong>{member.tier}</strong></p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(['Silver','Gold','Platinum','Black'] as RewardsTier[]).map((t) => (
              <button key={t} onClick={() => setTier(t)}
                className={cn('px-2 py-2 rounded-input border text-sm font-medium',
                  tier === t ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory' : 'border-g20/60 text-g40'
                )}>
                {t}
              </button>
            ))}
          </div>
          <label className="block mt-4">
            <span className="label-caps text-g40 mb-1 block">Reason</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Why is the tier being overridden?"
              className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[80px] text-ink dark:text-ivory" />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            <button onClick={submit} disabled={submitting || !reason.trim() || tier === member.tier}
              className="px-3 py-2 rounded-input bg-teal text-white text-sm font-medium disabled:opacity-40">
              Apply override
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
      <header className="mb-3">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-input border border-g20/60 bg-ivory dark:bg-panel p-3">
      <div className="label-caps text-g40">{label}</div>
      <div className={cn('font-display font-bold mt-0.5', highlight ? 'text-2xl text-copper' : 'text-lg text-ink dark:text-ivory')}>
        {value}
      </div>
    </div>
  )
}
