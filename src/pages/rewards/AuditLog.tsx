import { useMemo, useState } from 'react'
import { Search, Sparkles, Star, Lock, Unlock, Check, X, RefreshCw, Settings } from 'lucide-react'
import { cn, exportToCsv, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowRef, FlowLinkify } from '../../components/flow/FlowRef'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import type { RewardsAuditEntry } from '../../lib/types'

const ACTION_LABEL: Record<RewardsAuditEntry['action'], string> = {
  adjust_points: 'Adjust points',
  set_tier: 'Set tier',
  freeze_member: 'Freeze member',
  unfreeze_member: 'Unfreeze member',
  approve_dispute: 'Approve dispute',
  reject_dispute: 'Reject dispute',
  reconcile_partnership: 'Reconcile partnership',
  set_tier_thresholds: 'Set tier thresholds',
}

const ACTION_ICON: Record<RewardsAuditEntry['action'], React.ComponentType<{ className?: string }>> = {
  adjust_points: Sparkles,
  set_tier: Star,
  freeze_member: Lock,
  unfreeze_member: Unlock,
  approve_dispute: Check,
  reject_dispute: X,
  reconcile_partnership: RefreshCw,
  set_tier_thresholds: Settings,
}

const ACTION_TONE: Record<RewardsAuditEntry['action'], string> = {
  adjust_points: 'bg-copper-light text-copper-dark',
  set_tier: 'bg-teal-light text-teal-dark',
  freeze_member: 'bg-red-100 text-red-700',
  unfreeze_member: 'bg-teal text-white',
  approve_dispute: 'bg-teal text-white',
  reject_dispute: 'bg-red-100 text-red-700',
  reconcile_partnership: 'bg-teal-light text-teal-dark',
  set_tier_thresholds: 'bg-g20/60 text-g80',
}

export default function AuditLog() {
  const { data, loading } = useApi(() => rewards.listAudit(), [])
  const [q, setQ] = useState('')
  const [actionFilter, setActionFilter] = useState<'all' | RewardsAuditEntry['action']>('all')
  const [staffFilter, setStaffFilter] = useState<'all' | string>('all')

  const rows = useMemo(() => {
    if (!data) return []
    return data.filter((a) => {
      if (actionFilter !== 'all' && a.action !== actionFilter) return false
      if (staffFilter !== 'all' && a.staff !== staffFilter) return false
      if (q.trim()) {
        const n = q.toLowerCase()
        const hay = `${a.staff} ${a.memberName ?? ''} ${a.details}`.toLowerCase()
        if (!hay.includes(n)) return false
      }
      return true
    })
  }, [data, actionFilter, staffFilter, q])

  const staffSet = useMemo(() => Array.from(new Set((data ?? []).map((a) => a.staff))), [data])

  const stats = useMemo(() => {
    if (!data) return { total: 0, today: 0, week: 0, pointsCredited: 0 }
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7)
    return {
      total: data.length,
      today: data.filter((a) => new Date(a.ts) >= todayStart).length,
      week: data.filter((a) => new Date(a.ts) >= weekStart).length,
      pointsCredited: data.filter((a) => (a.delta ?? 0) > 0).reduce((s, a) => s + (a.delta ?? 0), 0),
    }
  }, [data])

  const onExport = () => {
    exportToCsv('rewards-audit.csv', rows.map((r) => ({
      timestamp: r.ts,
      staff: r.staff,
      action: r.action,
      member: r.memberName ?? '',
      details: r.details,
      points_delta: r.delta ?? '',
    })))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FlowKPICard label="Total events" value={String(stats.total)} accent="teal" />
        <FlowKPICard label="Last 7 days" value={String(stats.week)} accent="teal" />
        <FlowKPICard label="Today" value={String(stats.today)} accent="copper" hint="Manager activity" />
        <FlowKPICard label="Points credited (audit)" value={stats.pointsCredited.toLocaleString()} accent="copper" />
      </div>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="label-caps text-g40 block mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Member, staff, or detail text"
              className="w-full pl-8 pr-2 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              aria-label="Search audit log"
            />
          </div>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as 'all' | RewardsAuditEntry['action'])}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All actions</option>
            {(Object.keys(ACTION_LABEL) as RewardsAuditEntry['action'][]).map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Staff</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All staff</option>
            {staffSet.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={onExport}
          className="px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal"
        >
          Export CSV
        </button>
      </div>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-g40">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-g40 italic">No audit entries match your filters.</div>
        ) : (
          <ul className="divide-y divide-g20/40">
            {rows.map((a) => {
              const Icon = ACTION_ICON[a.action]
              return (
                <li key={a.id} className="p-4 flex items-start gap-3">
                  <span className={cn('h-9 w-9 rounded-input flex items-center justify-center shrink-0', ACTION_TONE[a.action])}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink dark:text-ivory">{ACTION_LABEL[a.action]}</span>
                      {a.memberId && (
                        <>
                          <span className="text-g40">·</span>
                          <FlowRef id={a.memberId} variant="inline" label={a.memberName ?? a.memberId} />
                        </>
                      )}
                      {!a.memberId && a.memberName && (
                        <>
                          <span className="text-g40">·</span>
                          <span className="text-sm text-teal">{a.memberName}</span>
                        </>
                      )}
                      {a.delta !== undefined && (
                        <span className={cn('text-sm font-display font-bold', a.delta > 0 ? 'text-teal' : 'text-copper')}>
                          {a.delta > 0 ? '+' : ''}{a.delta.toLocaleString()} pts
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink dark:text-ivory mt-0.5">
                      <FlowLinkify text={a.details} />
                    </p>
                    <div className="text-[11px] text-g40 mt-1">
                      {new Date(a.ts).toLocaleString()} · by <span className="text-ink dark:text-ivory font-medium">{a.staff}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
