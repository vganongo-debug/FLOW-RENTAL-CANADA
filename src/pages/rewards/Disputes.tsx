import { useMemo, useState } from 'react'
import { Check, X, AlertCircle, FileText, ChevronRight, Filter } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { useSearchParams } from 'react-router-dom'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { FlowRef, FlowLinkify } from '../../components/flow/FlowRef'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { DisputeKind, DisputeStatus, RewardsDispute } from '../../lib/types'

const STATUS_TONE: Record<DisputeStatus, 'pending' | 'info' | 'active' | 'cancelled'> = {
  open: 'pending', in_review: 'info', approved: 'active', rejected: 'cancelled',
}

const STATUS_LABEL: Record<DisputeStatus, string> = {
  open: 'Open', in_review: 'In review', approved: 'Approved', rejected: 'Rejected',
}

const KIND_LABEL: Record<DisputeKind, string> = {
  missing_stay: 'Missing stay',
  missing_rental: 'Missing rental',
  missing_points: 'Missing points',
  tier_request: 'Tier request',
  other: 'Other',
}

const KIND_TONE: Record<DisputeKind, string> = {
  missing_stay: 'bg-teal-light text-teal-dark',
  missing_rental: 'bg-copper-light text-copper-dark',
  missing_points: 'bg-copper text-white',
  tier_request: 'bg-teal text-white',
  other: 'bg-g20/40 text-g80',
}

export default function Disputes() {
  const { user } = useAuth()
  const staff = user?.name ?? 'System'
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<'all' | DisputeStatus>('all')
  const [selected, setSelected] = useState<RewardsDispute | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [confirmReview, setConfirmReview] = useState<RewardsDispute | null>(null)

  const { data, loading, refetch } = useApi(() => rewards.listDisputes(), [])

  // Honour ?focus=d-501 to pre-select a dispute when arriving from a FlowRef.
  useMemo(() => {
    const focusId = searchParams.get('focus')
    if (focusId && data) {
      const match = data.find((d) => d.id === focusId)
      if (match && (!selected || selected.id !== match.id)) setSelected(match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchParams])

  const rows = useMemo(() => {
    if (!data) return []
    return filter === 'all' ? data : data.filter((d) => d.status === filter)
  }, [data, filter])

  const stats = useMemo(() => {
    if (!data) return { total: 0, open: 0, inReview: 0, approved: 0, rejected: 0 }
    return {
      total: data.length,
      open: data.filter((d) => d.status === 'open').length,
      inReview: data.filter((d) => d.status === 'in_review').length,
      approved: data.filter((d) => d.status === 'approved').length,
      rejected: data.filter((d) => d.status === 'rejected').length,
    }
  }, [data])

  const moveToReview = async () => {
    if (!confirmReview) return
    await rewards.setDisputeStatus(confirmReview.id, 'in_review')
    setConfirmReview(null)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <FlowKPICard label="All disputes" value={String(stats.total)} accent="teal" icon={<AlertCircle className="h-4 w-4" />} />
        <FlowKPICard label="Open" value={String(stats.open)} accent="copper" hint="Awaiting triage" />
        <FlowKPICard label="In review" value={String(stats.inReview)} accent="copper" />
        <FlowKPICard label="Approved (30d)" value={String(stats.approved)} accent="teal" />
        <FlowKPICard label="Rejected (30d)" value={String(stats.rejected)} />
      </div>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-g40" aria-hidden="true" />
          <span className="label-caps text-g40">Filter</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | DisputeStatus)}
          className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABEL) as DisputeStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <div className="ml-auto label-caps text-g40">{rows.length} of {stats.total}</div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-g40">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-g40 italic">No disputes match this filter.</div>
          ) : (
            <ul className="divide-y divide-g20/40">
              {rows.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => setSelected(d)}
                    className={cn(
                      'w-full text-left p-4 flex items-start gap-3 transition',
                      selected?.id === d.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-g40">{d.id}</span>
                        <span className={cn('text-[10px] label-caps px-2 py-0.5 rounded-badge', KIND_TONE[d.kind])}>{KIND_LABEL[d.kind]}</span>
                        <FlowStatusBadge tone={STATUS_TONE[d.status]} dot>{STATUS_LABEL[d.status]}</FlowStatusBadge>
                      </div>
                      <div className="mt-1.5 font-medium text-ink dark:text-ivory">{d.memberName}</div>
                      <div className="text-xs text-g40 mt-0.5 line-clamp-2"><FlowLinkify text={d.ask} /></div>
                      <div className="text-[11px] text-g40 mt-1">Filed {formatDate(d.filedAt)}{d.resolvedAt && ` · Resolved ${formatDate(d.resolvedAt)}`}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-g40 shrink-0 mt-1" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card h-fit lg:sticky lg:top-4">
          {!selected ? (
            <div className="text-center text-sm text-g40 py-8">
              <FileText className="h-10 w-10 text-teal opacity-50 mx-auto mb-2" aria-hidden="true" />
              Select a dispute on the left to review.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <div className="label-caps text-g40">{KIND_LABEL[selected.kind]}</div>
                  <h3 className="font-display text-lg text-ink dark:text-ivory">
                    <FlowRef id={selected.memberId} variant="plain" label={selected.memberName} />
                  </h3>
                  <div className="text-xs text-g40 font-mono">{selected.id}</div>
                </div>
                <FlowStatusBadge tone={STATUS_TONE[selected.status]} dot>{STATUS_LABEL[selected.status]}</FlowStatusBadge>
              </div>

              <div className="space-y-3 text-sm">
                <Field label="Filed">
                  <span className="text-ink dark:text-ivory">{formatDate(selected.filedAt)}</span>
                </Field>
                {selected.reference && (
                  <Field label="Reference">
                    <FlowRef id={selected.reference} variant="pill" />
                  </Field>
                )}
                <Field label="Member's ask">
                  <p className="text-ink dark:text-ivory"><FlowLinkify text={selected.ask} /></p>
                </Field>
                {selected.evidence && selected.evidence.length > 0 && (
                  <Field label="Evidence">
                    <ul className="space-y-1">
                      {selected.evidence.map((e) => (
                        <li key={e} className="flex items-center gap-1.5 text-xs">
                          <FileText className="h-3 w-3 text-teal" aria-hidden="true" />
                          <a className="text-teal hover:text-teal-dark underline">{e}</a>
                        </li>
                      ))}
                    </ul>
                  </Field>
                )}
                {selected.resolution && (
                  <Field label="Resolution">
                    <p className="text-ink dark:text-ivory"><FlowLinkify text={selected.resolution} /></p>
                    {selected.awardedPoints !== undefined && selected.awardedPoints > 0 && (
                      <p className="text-copper font-display font-bold mt-1">+{selected.awardedPoints.toLocaleString()} pts credited</p>
                    )}
                  </Field>
                )}
              </div>

              {(selected.status === 'open' || selected.status === 'in_review') && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-g20/40 pt-3">
                  {selected.status === 'open' && (
                    <button
                      onClick={() => setConfirmReview(selected)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal"
                    >
                      Take into review
                    </button>
                  )}
                  <button
                    onClick={() => setApproveOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve & credit
                  </button>
                  <button
                    onClick={() => setRejectOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input border border-g20 text-g40 hover:text-red-600 hover:border-red-300 text-sm"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      <FlowConfirmDialog
        open={!!confirmReview}
        title="Move to in-review?"
        description="Marks the dispute as actively under triage. The member sees an 'In review' status."
        confirmLabel="Take into review"
        onConfirm={moveToReview}
        onCancel={() => setConfirmReview(null)}
      />

      {selected && approveOpen && (
        <ResolveModal
          mode="approve"
          dispute={selected}
          staff={staff}
          onClose={() => setApproveOpen(false)}
          onSaved={() => { setApproveOpen(false); setSelected(null); refetch() }}
        />
      )}
      {selected && rejectOpen && (
        <ResolveModal
          mode="reject"
          dispute={selected}
          staff={staff}
          onClose={() => setRejectOpen(false)}
          onSaved={() => { setRejectOpen(false); setSelected(null); refetch() }}
        />
      )}
    </div>
  )
}

function ResolveModal({ mode, dispute, staff, onClose, onSaved }: { mode: 'approve' | 'reject'; dispute: RewardsDispute; staff: string; onClose: () => void; onSaved: () => void }) {
  const [resolution, setResolution] = useState('')
  const [points, setPoints] = useState(220)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!resolution.trim()) return
    setSubmitting(true)
    try {
      if (mode === 'approve') await rewards.approveDispute(dispute.id, staff, points, resolution)
      else                    await rewards.rejectDispute(dispute.id, staff, resolution)
      onSaved()
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel p-5">
          <h3 className="font-display text-lg text-ink dark:text-ivory">
            {mode === 'approve' ? 'Approve dispute' : 'Reject dispute'} · {dispute.id}
          </h3>
          <p className="text-xs text-g40 mt-1">Member: {dispute.memberName}</p>

          {mode === 'approve' && (
            <label className="block mt-4">
              <span className="label-caps text-g40 mb-1 block">Points to award</span>
              <input
                type="number" value={points} min={0}
                onChange={(e) => setPoints(parseInt(e.target.value || '0'))}
                className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              />
            </label>
          )}

          <label className="block mt-3">
            <span className="label-caps text-g40 mb-1 block">Resolution note (visible to member)</span>
            <textarea
              value={resolution} onChange={(e) => setResolution(e.target.value)}
              placeholder={mode === 'approve'
                ? 'Confirmed against booking system · points credited'
                : 'Per programme T&Cs, this stay is excluded from earn'
              }
              className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[100px] text-ink dark:text-ivory"
            />
          </label>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            <button
              onClick={submit}
              disabled={submitting || !resolution.trim()}
              className={cn('px-3 py-2 rounded-input text-sm font-medium text-white disabled:opacity-40',
                mode === 'approve' ? 'bg-teal hover:bg-teal-dark' : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {submitting ? '…' : mode === 'approve' ? `Approve & credit ${points} pts` : 'Reject dispute'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-caps text-g40 mb-0.5">{label}</div>
      {children}
    </div>
  )
}
