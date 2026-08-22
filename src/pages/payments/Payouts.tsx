import { useState, useMemo } from 'react'
import { Check, CheckCheck, Pause, Clock, Send, ArrowRight, Calendar } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { FLEET_PARTNERS } from '../../lib/sampleData'

interface PayoutRow {
  id: string
  partner: string
  city: string
  vehicles: number
  gross: number
  commissionPct: number
  net: number
  method: 'bank' | 'momo'
  account: string
  status: 'pending' | 'approved' | 'held' | 'paid'
}

const STATUS_TONE = {
  pending: 'pending',
  approved: 'info',
  held: 'cancelled',
  paid: 'active',
} as const

const PAYOUTS: PayoutRow[] = FLEET_PARTNERS.map((p, i) => {
  const gross = Math.round(p.weeklyPayoutCad / (1 - p.commissionPct / 100))
  return {
    id: `PAY-W18-${(101 + i).toString()}`,
    partner: p.name,
    city: p.city,
    vehicles: p.vehiclesActiveOnFlow,
    gross,
    commissionPct: p.commissionPct,
    net: p.weeklyPayoutCad,
    method: i % 2 === 0 ? 'bank' : 'momo',
    account: i % 2 === 0 ? `Stanbic UG ··· ${(8000 + i*10).toString()}` : `+256 778 ··· ${(880 + i).toString()}`,
    status: 'pending',
  }
})

const PAYOUT_HISTORY = [
  { week: 'W17', date: '2026-05-03', total: 19_540, partners: 3, status: 'Paid' },
  { week: 'W16', date: '2026-04-26', total: 18_320, partners: 3, status: 'Paid' },
  { week: 'W15', date: '2026-04-19', total: 17_980, partners: 3, status: 'Paid' },
  { week: 'W14', date: '2026-04-12', total: 16_440, partners: 2, status: 'Paid' },
]

export default function Payouts() {
  const [rows, setRows] = useState<PayoutRow[]>(PAYOUTS)
  const [confirmOpen, setConfirmOpen] = useState<'approveAll' | string | null>(null)

  const totals = useMemo(() => ({
    pending: rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.net, 0),
    approved: rows.filter((r) => r.status === 'approved').reduce((s, r) => s + r.net, 0),
    held: rows.filter((r) => r.status === 'held').reduce((s, r) => s + r.net, 0),
    all: rows.reduce((s, r) => s + r.net, 0),
  }), [rows])

  const setStatus = (id: string, status: PayoutRow['status']) => {
    setRows((cur) => cur.map((r) => r.id === id ? { ...r, status } : r))
  }

  const approveAll = () => {
    setRows((cur) => cur.map((r) => r.status === 'pending' ? { ...r, status: 'approved' } : r))
    setConfirmOpen(null)
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Flow Pay · Partner payouts</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Partner Payouts</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">
            Week W18 · releases Friday {formatDate(new Date(2026, 4, 15))}
          </p>
        </div>
        <button
          onClick={() => setConfirmOpen('approveAll')}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <CheckCheck className="h-4 w-4" /> Approve all pending
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="This week · total" value={formatCurrency(totals.all)} accent="copper" icon={<Calendar className="h-4 w-4" />} />
        <FlowKPICard label="Pending approval" value={formatCurrency(totals.pending)} hint={`${rows.filter((r) => r.status === 'pending').length} partners`} />
        <FlowKPICard label="Approved" value={formatCurrency(totals.approved)} accent="teal" />
        <FlowKPICard label="On hold" value={formatCurrency(totals.held)} accent="copper" />
      </div>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Payout queue · Week W18</h2>
          <p className="text-xs text-g40 dark:text-g60">Approve or hold individually · paid out automatically on Friday</p>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Payout ID','Partner','Vehicles','Gross','Commission','Net payout','Method · account','Status','Action'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 2 || i === 3 || i === 4 || i === 5 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{r.id}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">
                  <div className="font-medium">{r.partner}</div>
                  <div className="text-xs text-g40">{r.city}</div>
                </td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{r.vehicles}</td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{formatCurrency(r.gross)}</td>
                <td className="px-3 py-2 text-right text-g40">−{formatCurrency(r.gross - r.net)} ({r.commissionPct}%)</td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(r.net)}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">
                  <div className="text-xs text-g40 label-caps">{r.method === 'bank' ? 'Bank transfer' : 'MTN MoMo'}</div>
                  <div className="font-mono text-xs">{r.account}</div>
                </td>
                <td className="px-3 py-2">
                  <FlowStatusBadge tone={STATUS_TONE[r.status]} dot>{r.status}</FlowStatusBadge>
                </td>
                <td className="px-3 py-2">
                  {r.status === 'pending' ? (
                    <div className="flex gap-1">
                      <button onClick={() => setStatus(r.id, 'approved')} className="inline-flex items-center gap-1 px-2 py-1 rounded-input bg-teal text-white text-[11px] font-medium">
                        <Check className="h-3 w-3" /> Approve
                      </button>
                      <button onClick={() => setStatus(r.id, 'held')} className="inline-flex items-center gap-1 px-2 py-1 rounded-input border border-g20 text-[11px] text-g40">
                        <Pause className="h-3 w-3" /> Hold
                      </button>
                    </div>
                  ) : r.status === 'approved' ? (
                    <button onClick={() => setStatus(r.id, 'pending')} className="inline-flex items-center gap-1 px-2 py-1 rounded-input text-teal text-[11px] font-medium">
                      <Send className="h-3 w-3" /> Queued · undo
                    </button>
                  ) : r.status === 'held' ? (
                    <button onClick={() => setStatus(r.id, 'pending')} className="inline-flex items-center gap-1 px-2 py-1 rounded-input text-g40 text-[11px]">
                      <Clock className="h-3 w-3" /> Release
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-ivory dark:bg-panel font-medium">
              <td className="px-3 py-2" colSpan={5}>Total</td>
              <td className="px-3 py-2 text-right text-copper font-display font-bold text-base">{formatCurrency(totals.all)}</td>
              <td className="px-3 py-2" colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Payout history</h2>
          <button className="text-xs text-teal hover:text-teal-dark inline-flex items-center gap-1">View ledger <ArrowRight className="h-3 w-3" /></button>
        </header>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Week','Released on','Partners','Total released','Status'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 2 || i === 3 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYOUT_HISTORY.map((h, i) => (
              <tr key={h.week} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{h.week}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(h.date)}</td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{h.partners}</td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(h.total)}</td>
                <td className="px-3 py-2"><FlowStatusBadge tone="active">{h.status}</FlowStatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <FlowConfirmDialog
        open={confirmOpen === 'approveAll'}
        title="Approve all pending payouts?"
        description={`${rows.filter((r) => r.status === 'pending').length} partners · ${formatCurrency(totals.pending)} will be queued for Friday's release.`}
        confirmLabel="Approve all"
        onConfirm={approveAll}
        onCancel={() => setConfirmOpen(null)}
      />
    </div>
  )
}
