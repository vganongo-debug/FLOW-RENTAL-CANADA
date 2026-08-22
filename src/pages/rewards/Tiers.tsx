import { useState } from 'react'
import { Star, Edit3, Check, X } from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'
import { useApi } from '../../lib/useApi'
import { rewards } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { RewardsTier, RewardsTierConfig } from '../../lib/types'

const TIER_GRADIENT: Record<RewardsTier, string> = {
  Silver:   'from-g60 to-g40',
  Gold:     'from-copper to-copper-dark',
  Platinum: 'from-teal to-teal-dark',
  Black:    'from-coal to-ink',
}

export default function Tiers() {
  const { user } = useAuth()
  const staff = user?.name ?? 'System'
  const { data, loading, refetch } = useApi(() => rewards.listTiers(), [])
  const [editing, setEditing] = useState<RewardsTier | null>(null)

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <header className="mb-3">
          <h3 className="font-display text-lg text-ink dark:text-ivory">Tier policy</h3>
          <p className="text-xs text-g40 dark:text-g60">
            Annual qualifying activity thresholds and the perks each tier unlocks.
            Changes are audit-logged and take effect immediately for new earn events.
          </p>
        </header>

        {loading ? (
          <div className="text-center text-g40 py-6">Loading tiers…</div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data ?? []).map((t) => (
              <li key={t.tier} className="rounded-card border border-g20/60 overflow-hidden">
                <div className={cn('p-4 bg-gradient-to-br text-white', TIER_GRADIENT[t.tier])}>
                  <div className="flex items-center justify-between">
                    <div className="label-caps opacity-80">Tier</div>
                    <Star className="h-4 w-4 opacity-70" aria-hidden="true" />
                  </div>
                  <div className="font-display text-3xl font-bold mt-1">{t.tier}</div>
                  <div className="text-xs opacity-80 mt-1">×{t.pointsMultiplier} points multiplier</div>
                </div>
                <div className="p-4 space-y-2 text-sm bg-white dark:bg-panel-mid">
                  <Row label="Min spend / yr" value={formatCurrency(t.minSpendCad)} />
                  <Row label="Min stays / yr" value={String(t.minStays)} />
                  <div>
                    <div className="label-caps text-g40 mt-2 mb-1">Perks</div>
                    <ul className="text-xs space-y-0.5 list-disc pl-4 text-ink dark:text-ivory">
                      {t.perks.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                  <button
                    onClick={() => setEditing(t.tier)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal text-xs"
                  >
                    <Edit3 className="h-3 w-3" /> Edit thresholds
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <h3 className="font-display text-lg text-ink dark:text-ivory">Earn rules</h3>
        <p className="text-xs text-g40 dark:text-g60">How points are minted on every stay and rental</p>
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="bg-teal text-white">
              {['Activity','Base earn','Notes'].map((h) => (
                <th key={h} className="label-caps font-semibold px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { activity: 'Hotel stay · Direct or Flow App',           base: '4 pts / USD',  notes: 'Eligible from check-out · multiplied by tier' },
              { activity: 'Hotel stay · Booking.com',                  base: '2 pts / USD',  notes: 'Reduced rate · OTA cost passed through' },
              { activity: 'Hotel stay · Expedia / others',             base: '0 pts',        notes: 'Excluded by programme T&Cs' },
              { activity: 'Car rental · Flow-owned',                   base: '3 pts / USD',  notes: 'Eligible from return · multiplied by tier' },
              { activity: 'Car rental · Partner fleet (e.g. Mercantile)', base: '1.5 pts / USD', notes: 'Reduced · partner commission already paid' },
              { activity: 'Add-on (CDW, transfer, etc.)',              base: '2 pts / USD',  notes: 'Counts toward tier qualification' },
              { activity: 'Co-brand card spend',                       base: '1 pt / USD',   notes: 'Verified via partner monthly reconciliation' },
            ].map((r, i) => (
              <tr key={r.activity} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 text-ink dark:text-ivory">{r.activity}</td>
                <td className="px-3 py-2 text-copper font-display font-bold">{r.base}</td>
                <td className="px-3 py-2 text-xs text-g40">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && data && (
        <EditTierModal
          tier={data.find((t) => t.tier === editing)!}
          staff={staff}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch() }}
        />
      )}
    </div>
  )
}

function EditTierModal({ tier, staff, onClose, onSaved }: { tier: RewardsTierConfig; staff: string; onClose: () => void; onSaved: () => void }) {
  const [minSpend, setMinSpend] = useState(tier.minSpendCad)
  const [minStays, setMinStays] = useState(tier.minStays)
  const [mult, setMult] = useState(tier.pointsMultiplier)
  const [perks, setPerks] = useState(tier.perks.join('\n'))
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      await rewards.updateTier(tier.tier, {
        minSpendCad: minSpend,
        minStays,
        pointsMultiplier: mult,
        perks: perks.split('\n').map((p) => p.trim()).filter(Boolean),
      }, staff)
      onSaved()
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-ink dark:text-ivory">Edit {tier.tier} thresholds</h3>
            <button onClick={onClose} aria-label="Close" className="text-g40 hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-xs text-g40 mt-1">Audit-logged · effective immediately for new earn events.</p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Min spend USD / year</span>
              <input type="number" value={minSpend} onChange={(e) => setMinSpend(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </label>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Min stays / year</span>
              <input type="number" value={minStays} onChange={(e) => setMinStays(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </label>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Points multiplier</span>
              <input type="number" step="0.1" value={mult} onChange={(e) => setMult(parseFloat(e.target.value || '1'))} className="w-full px-3 py-2 bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory" />
            </label>
            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Perks (one per line)</span>
              <textarea value={perks} onChange={(e) => setPerks(e.target.value)} className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[100px] text-ink dark:text-ivory" />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white text-sm font-medium disabled:opacity-40">
              <Check className="h-3.5 w-3.5" /> {submitting ? '…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory font-medium">{value}</span>
    </div>
  )
}
