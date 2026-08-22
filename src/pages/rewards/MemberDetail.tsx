/**
 * Detail page for a single Rewards member.
 *
 * Route: /rewards/members/:id
 *
 * Compact, drillable version of the inline detail panel in /rewards/members.
 * The full-page route is what gets linked to from FlowRef pills everywhere
 * else in the app (audit log, disputes, message metadata).
 */
import { Navigate, useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, FileText, Lock, Mail, MapPin, Sparkles, Star } from 'lucide-react'
import { FlowDetailHeader } from '../../components/flow/FlowDetailHeader'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowRef, FlowLinkify } from '../../components/flow/FlowRef'
import { REWARDS_MEMBERS } from '../../lib/sampleData'
import type { RewardsMember, RewardsTier } from '../../lib/types'
import { backlinksFor } from '../../lib/refs'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

const TIER_TONE: Record<RewardsTier, 'neutral' | 'pending' | 'active' | 'info'> = {
  Silver: 'neutral', Gold: 'pending', Platinum: 'active', Black: 'info',
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const [m, setM] = useState<RewardsMember | null>(null)

  useEffect(() => {
    if (!id) return
    try {
      const raw = window.localStorage.getItem('flow-os.rewards.members')
      const list: RewardsMember[] = raw ? JSON.parse(raw) : REWARDS_MEMBERS
      setM(list.find((x) => x.id === id) ?? null)
    } catch {
      setM(REWARDS_MEMBERS.find((x) => x.id === id) ?? null)
    }
  }, [id])

  const { data: tx } = useApi(() => id ? rewards.listTransactions(id) : Promise.resolve([]), [id])
  const links = useMemo(() => (id ? backlinksFor(id) : null), [id])

  if (!id) return <Navigate to="/rewards/members" replace />
  if (!m) {
    return (
      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-8 text-center">
        <FileText className="h-10 w-10 mx-auto text-g40 mb-3" />
        <h2 className="font-display text-xl text-ink dark:text-ivory">Member not found</h2>
        <p className="text-sm text-g40 mt-1">No member matches <span className="font-mono">{id}</span>.</p>
        <Link to="/rewards/members" className="inline-block mt-3 text-xs text-teal hover:underline">Back to members</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FlowDetailHeader
        backTo="/rewards/members"
        backLabel="All members"
        eyebrow={<span>Rewards member · <span className="font-mono">{m.id}</span></span>}
        title={
          <span className="flex items-center gap-3 flex-wrap">
            <span className="h-10 w-10 rounded-full bg-teal text-white flex items-center justify-center text-sm font-semibold">{m.initials}</span>
            {m.name}
            {m.frozen && <Lock className="h-4 w-4 text-copper" aria-label="Frozen" />}
          </span>
        }
        subtitle={`${m.email} · ${m.country}`}
        status={
          <>
            <FlowStatusBadge tone={TIER_TONE[m.tier]}>{m.tier}</FlowStatusBadge>
            {m.frozen && <FlowStatusBadge tone="cancelled" dot>Frozen</FlowStatusBadge>}
          </>
        }
        actions={
          <Link
            to="/rewards/members"
            className="text-xs px-3 py-1.5 rounded-input bg-teal text-white hover:bg-teal-dark inline-flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" /> Adjust points
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Points balance" value={m.points.toLocaleString()} accent="copper" icon={<Star className="h-4 w-4" />} />
        <FlowKPICard label="Lifetime earned" value={m.lifetimeEarned.toLocaleString()} hint="All-time accumulation" accent="teal" />
        <FlowKPICard label="Lifetime burned" value={m.lifetimeBurned.toLocaleString()} hint="All-time redemptions" />
        <FlowKPICard label="Tier" value={m.tier} hint={`YTD spend ${formatCurrency(m.qualifyingActivityYtd.spendCad)}`} accent="ink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5">
          <h3 className="label-caps text-g40 mb-4">Profile</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={m.email} />
            <Detail icon={<MapPin className="h-4 w-4" />} label="Country" value={m.country} />
            <Detail label="Joined" value={formatDate(m.joined)} />
            <Detail label="Last activity" value={formatDate(m.lastActivity)} />
            <Detail label="YTD stays" value={String(m.qualifyingActivityYtd.stays)} />
            <Detail label="YTD rentals" value={String(m.qualifyingActivityYtd.rentals)} />
            <Detail label="YTD spend" value={formatCurrency(m.qualifyingActivityYtd.spendCad)} />
            <Detail label="Status"
              value={m.frozen
                ? <FlowStatusBadge tone="cancelled" dot>Frozen</FlowStatusBadge>
                : <FlowStatusBadge tone="active" dot>Active</FlowStatusBadge>}
            />
          </dl>

          <h3 className="label-caps text-g40 mt-6 mb-3">Transaction log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal text-white">
                  {['Date','Type','Reason','Reference','Points'].map((h, i) => (
                    <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 4 ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tx ?? []).map((t, i) => (
                  <tr key={t.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                    <td className="px-3 py-2 text-ink dark:text-ivory whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs label-caps">
                        {t.type === 'earn'
                          ? <ArrowUpFromLine className="h-3 w-3 text-teal" />
                          : t.type === 'burn'
                          ? <ArrowDownToLine className="h-3 w-3 text-copper" />
                          : <Sparkles className="h-3 w-3 text-g40" />}
                        <span className={t.type === 'earn' ? 'text-teal' : t.type === 'burn' ? 'text-copper' : 'text-g40'}>{t.type}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink dark:text-ivory"><FlowLinkify text={t.reason} /></td>
                    <td className="px-3 py-2 text-g40 text-xs">
                      {t.reference ? <FlowRef id={t.reference} variant="inline" /> : t.disputeId ? <FlowRef id={t.disputeId} variant="inline" /> : '—'}
                    </td>
                    <td className={cn('px-3 py-2 text-right font-display font-bold', t.delta > 0 ? 'text-teal' : 'text-copper')}>
                      {t.delta > 0 ? '+' : ''}{t.delta.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!tx || tx.length === 0) && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-g40">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 space-y-4">
          <h3 className="label-caps text-g40">Related</h3>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Open disputes</div>
            {links && links.disputes.length > 0 ? (
              <ul className="space-y-1.5">
                {links.disputes.map((d) => <li key={d.id}><FlowRef id={d.id} /></li>)}
              </ul>
            ) : <p className="text-xs text-g40 italic">None</p>}
          </div>

          <div>
            <div className="text-xs text-g40 dark:text-g60 mb-2">Conversations</div>
            {links && links.conversations.length > 0 ? (
              <ul className="space-y-1.5">
                {links.conversations.map((c) => <li key={c.id}><FlowRef id={c.id} /></li>)}
              </ul>
            ) : <p className="text-xs text-g40 italic">None</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="label-caps text-g40 flex items-center gap-1 mb-0.5">{icon}{label}</dt>
      <dd className="text-ink dark:text-ivory">{value}</dd>
    </div>
  )
}
