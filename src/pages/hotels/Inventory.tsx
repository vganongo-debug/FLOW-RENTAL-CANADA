import { useMemo, useState } from 'react'
import { Package, AlertTriangle, ShoppingCart, Truck, ArrowDownToLine, ArrowUpFromLine, Search, Filter, CheckCircle2, Plus, Minus } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { useApi } from '../../lib/useApi'
import { inventory, procurement, properties } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { InventoryItem, InventoryCategory } from '../../lib/types'

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  linens: 'Linens',
  toiletries: 'Toiletries',
  cleaning: 'Cleaning',
  fnb: 'F&B',
  office: 'Office',
  maintenance: 'Maintenance',
  branded: 'Branded',
  vehicle_consumables: 'Vehicle',
}

const CATEGORY_TONE: Record<InventoryCategory, string> = {
  linens:    'bg-teal-light text-teal-dark',
  toiletries:'bg-copper-light text-copper-dark',
  cleaning:  'bg-teal text-white',
  fnb:       'bg-copper text-white',
  office:    'bg-g20/60 text-g80',
  maintenance:'bg-red-100 text-red-700',
  branded:   'bg-coal text-ivory',
  vehicle_consumables: 'bg-panel-mid text-ivory',
}

export default function Inventory() {
  const { user } = useAuth()
  const { data: props } = useApi(() => properties.list(), [])
  const defaultPropertyId =
    user?.propertyId ??
    (props ?? []).find((p) => p.countryCode === user?.countryCode)?.id ??
    'p-yna'

  const [propertyId, setPropertyId] = useState<string>(defaultPropertyId)
  const [categoryFilter, setCategoryFilter] = useState<'all' | InventoryCategory>('all')
  const [q, setQ] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null)
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null)
  const [adjustDelta, setAdjustDelta] = useState(0)

  const { data, loading, refetch } = useApi(() => inventory.list({ propertyId }), [propertyId])

  const rows = useMemo(() => {
    if (!data) return []
    return data.filter((i) => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
      if (lowOnly && i.currentStock > i.reorderPoint) return false
      if (q.trim() && !i.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [data, categoryFilter, q, lowOnly])

  const stats = useMemo(() => {
    if (!data) return { items: 0, low: 0, value: 0, categories: 0 }
    return {
      items: data.length,
      low: data.filter((i) => i.currentStock <= i.reorderPoint).length,
      value: data.reduce((s, i) => s + i.currentStock * i.unitCostCad, 0),
      categories: new Set(data.map((i) => i.category)).size,
    }
  }, [data])

  const property = props?.find((p) => p.id === propertyId)

  const handleReorder = async () => {
    if (!reorderItem) return
    await procurement.reorder(reorderItem)
    setReorderItem(null)
    refetch()
  }

  const handleAdjust = async () => {
    if (!adjusting || adjustDelta === 0) return
    await inventory.adjustStock(adjusting.id, adjustDelta)
    setAdjusting(null)
    setAdjustDelta(0)
    refetch()
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · Inventory</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Inventory Management</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">
            Live stock levels per property · one-click reorder when items hit their reorder point.
          </p>
        </div>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-panel-mid border border-g20/60 rounded-input text-ink dark:text-ivory"
          aria-label="Select property"
        >
          {(props ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Active items" value={String(stats.items)} accent="teal" icon={<Package className="h-4 w-4" />} hint={`${stats.categories} categories`} />
        <FlowKPICard label="Low stock" value={String(stats.low)} accent="copper" icon={<AlertTriangle className="h-4 w-4" />} hint={stats.low > 0 ? 'Reorder recommended' : 'All healthy'} />
        <FlowKPICard label="Inventory value" value={formatCurrency(stats.value)} />
        <FlowKPICard label="Property" value={property?.city ?? '—'} hint={property?.country} accent="teal" />
      </div>

      {stats.low > 0 && (
        <section className="rounded-card border border-copper/40 bg-copper-light/40 dark:bg-copper-dark/20 p-4">
          <header className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-copper shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-display text-lg text-ink dark:text-ivory">Low-stock alerts</h3>
              <p className="text-xs text-g40 mt-0.5">
                {stats.low} item{stats.low === 1 ? '' : 's'} at or below the reorder point. Tap <strong>Reorder</strong> to raise a single-line PO.
              </p>
            </div>
            <button
              onClick={() => setLowOnly(!lowOnly)}
              className="text-xs px-2 py-1 rounded-input border border-copper text-copper-dark hover:bg-copper/10"
            >
              {lowOnly ? 'Show all' : 'Show only low stock'}
            </button>
          </header>
        </section>
      )}

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="label-caps text-g40 block mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Item name"
              className="w-full pl-8 pr-2 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
            />
          </div>
        </div>
        <div>
          <label className="label-caps text-g40 block mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | InventoryCategory)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABEL) as InventoryCategory[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="accent-teal" />
          Low stock only
        </label>
        <div className="ml-auto label-caps text-g40">{rows.length} of {data?.length ?? 0}</div>
      </div>

      {loading ? (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center text-g40">Loading…</div>
      ) : (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Item','Category','Stock','Par','Unit cost','Value','Last received','Actions'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 2 || i === 3 || i === 4 || i === 5 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((i, idx) => {
                const low = i.currentStock <= i.reorderPoint
                const pct = Math.min(100, Math.round((i.currentStock / i.parLevel) * 100))
                return (
                  <tr key={i.id} className={cn('border-b border-g20/40 last:border-0', idx % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-ink dark:text-ivory">{i.name}</div>
                      <div className="text-[11px] text-g40">{i.unit}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] label-caps', CATEGORY_TONE[i.category])}>
                        {CATEGORY_LABEL[i.category]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className={cn('font-display font-bold', low ? 'text-copper' : 'text-ink dark:text-ivory')}>{i.currentStock}</div>
                      <div className="h-1 mt-1 rounded-full bg-g20/40 overflow-hidden w-20 ml-auto">
                        <div className={cn('h-full', low ? 'bg-copper' : 'bg-teal')} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-g40">{i.parLevel}<div className="text-[10px]">⤓ {i.reorderPoint}</div></td>
                    <td className="px-3 py-2 text-right text-ink dark:text-ivory">{formatCurrency(i.unitCostCad)}</td>
                    <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(i.currentStock * i.unitCostCad)}</td>
                    <td className="px-3 py-2 text-g40 text-xs">{i.lastReceived ? formatDate(i.lastReceived) : '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setAdjusting(i)}
                          aria-label={`Adjust stock for ${i.name}`}
                          className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal"
                        >
                          <ArrowUpFromLine className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setReorderItem(i)}
                          disabled={!low}
                          aria-label={`Reorder ${i.name}`}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-input text-[11px] font-medium',
                            low
                              ? 'bg-copper text-white hover:bg-copper-dark'
                              : 'border border-g20 text-g40 cursor-not-allowed opacity-50'
                          )}
                        >
                          <ShoppingCart className="h-3 w-3" /> Reorder
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <CheckCircle2 className="h-10 w-10 text-teal mx-auto mb-2 opacity-60" aria-hidden="true" />
                    <div className="font-display text-base text-ink dark:text-ivory">All items healthy</div>
                    <div className="text-xs text-g40">No items match your filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FlowConfirmDialog
        open={!!reorderItem}
        title={`Reorder ${reorderItem?.name ?? ''}?`}
        description={`This will raise a purchase order for ${reorderItem?.reorderQty} ${reorderItem?.unit} from the linked supplier. Expected delivery follows supplier lead time.`}
        confirmLabel="Raise PO"
        onConfirm={handleReorder}
        onCancel={() => setReorderItem(null)}
      />

      {adjusting && (
        <>
          <div className="fixed inset-0 bg-ink/50 z-40" onClick={() => { setAdjusting(null); setAdjustDelta(0) }} aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div role="dialog" aria-modal="true" className="bg-white dark:bg-panel-mid w-full max-w-sm rounded-card shadow-panel p-5">
              <h3 className="font-display text-lg text-ink dark:text-ivory">Adjust stock</h3>
              <p className="text-xs text-g40 mt-1">{adjusting.name}</p>
              <div className="mt-3 flex items-center gap-3 justify-center">
                <button
                  onClick={() => setAdjustDelta((d) => d - 1)}
                  aria-label="Decrease"
                  className="h-10 w-10 rounded-full bg-ivory dark:bg-panel border border-g20 text-ink dark:text-ivory hover:border-copper hover:text-copper"
                >
                  <Minus className="h-4 w-4 mx-auto" />
                </button>
                <div className="text-center">
                  <div className="font-display font-bold text-3xl text-ink dark:text-ivory">
                    {adjustDelta > 0 ? '+' : ''}{adjustDelta}
                  </div>
                  <div className="text-xs text-g40">
                    {adjusting.currentStock} → {Math.max(0, adjusting.currentStock + adjustDelta)}
                  </div>
                </div>
                <button
                  onClick={() => setAdjustDelta((d) => d + 1)}
                  aria-label="Increase"
                  className="h-10 w-10 rounded-full bg-ivory dark:bg-panel border border-g20 text-ink dark:text-ivory hover:border-teal hover:text-teal"
                >
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setAdjusting(null); setAdjustDelta(0) }} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
                <button
                  onClick={handleAdjust}
                  disabled={adjustDelta === 0}
                  className={cn('px-3 py-2 rounded-input text-sm font-medium text-white', adjustDelta > 0 ? 'bg-teal hover:bg-teal-dark' : 'bg-copper hover:bg-copper-dark', adjustDelta === 0 && 'bg-g40 opacity-50')}
                >
                  {adjustDelta > 0 ? <span className="inline-flex items-center gap-1"><ArrowUpFromLine className="h-3.5 w-3.5" /> Receive</span> :
                   adjustDelta < 0 ? <span className="inline-flex items-center gap-1"><ArrowDownToLine className="h-3.5 w-3.5" /> Consume</span> :
                   'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
