import { useMemo, useState } from 'react'
import { Plus, Truck, Package, ChevronRight, Box, X, Check, Send, AlertCircle } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowConfirmDialog } from '../../components/flow/FlowConfirmDialog'
import { useApi } from '../../lib/useApi'
import { procurement, inventory, properties } from '../../lib/api'
import type { PurchaseOrder, PurchaseOrderStatus, InventoryItem, Supplier } from '../../lib/types'

const STATUS_TONE: Record<PurchaseOrderStatus, 'completed' | 'info' | 'pending' | 'active' | 'cancelled'> = {
  draft: 'completed',
  submitted: 'pending',
  approved: 'info',
  in_transit: 'info',
  received: 'active',
  cancelled: 'cancelled',
}

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  in_transit: 'In transit',
  received: 'Received',
  cancelled: 'Cancelled',
}

const TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  draft:      ['submitted', 'cancelled'],
  submitted:  ['approved', 'cancelled'],
  approved:   ['in_transit', 'cancelled'],
  in_transit: ['received', 'cancelled'],
  received:   [],
  cancelled:  [],
}

export default function Procurement() {
  const { data, loading, refetch } = useApi(() => procurement.list())
  const { data: props } = useApi(() => properties.list(), [])
  const { data: suppliers } = useApi(() => inventory.listSuppliers(), [])
  const [filter, setFilter] = useState<'all' | PurchaseOrderStatus>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<{ order: PurchaseOrder; to: PurchaseOrderStatus } | null>(null)

  const rows = useMemo(() => {
    if (!data) return []
    return filter === 'all' ? data : data.filter((o) => o.status === filter)
  }, [data, filter])

  const stats = useMemo(() => {
    if (!data) return { total: 0, openValue: 0, inTransit: 0, lateRisk: 0 }
    const open = data.filter((o) => o.status !== 'received' && o.status !== 'cancelled')
    return {
      total: data.length,
      openValue: open.reduce((s, o) => s + o.totalCad, 0),
      inTransit: data.filter((o) => o.status === 'in_transit').length,
      lateRisk: data.filter((o) => {
        if (!o.expectedAt || o.status === 'received' || o.status === 'cancelled') return false
        return new Date(o.expectedAt).getTime() < Date.now()
      }).length,
    }
  }, [data])

  const handleTransition = async () => {
    if (!pendingTransition) return
    await procurement.setStatus(pendingTransition.order.id, pendingTransition.to)
    setPendingTransition(null)
    refetch()
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Operations · Procurement</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Purchase Orders</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">
            Raise, approve, track shipments · auto-receive into inventory on delivery.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New purchase order
        </button>
      </header>

      <div className="rounded-card overflow-hidden bg-coal text-ivory">
        <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="label-caps text-copper-light">Group supply partner</div>
            <h2 className="font-display text-2xl mt-1">VBMS Tunisia SUARL 🇹🇳</h2>
            <p className="text-sm text-g60 mt-1">
              Headquarters supply chain · linens, toiletries, branded items · 14-day lead from Tunis.
            </p>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-3xl text-copper">{suppliers?.length ?? 0}</div>
            <div className="text-[10px] text-g60 label-caps">Suppliers on platform</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="All POs" value={String(stats.total)} accent="teal" icon={<Package className="h-4 w-4" />} />
        <FlowKPICard label="Open value" value={formatCurrency(stats.openValue)} accent="copper" hint="Not yet received" />
        <FlowKPICard label="In transit" value={String(stats.inTransit)} accent="teal" icon={<Truck className="h-4 w-4" />} />
        <FlowKPICard
          label="Late delivery risk"
          value={String(stats.lateRisk)}
          accent={stats.lateRisk > 0 ? 'copper' : 'teal'}
          hint={stats.lateRisk > 0 ? 'Action required' : 'On schedule'}
        />
      </div>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label-caps text-g40 block mb-1">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | PurchaseOrderStatus)}
            className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
          >
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABEL) as PurchaseOrderStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto label-caps text-g40">{rows.length} of {data?.length ?? 0}</div>
      </div>

      {loading ? (
        <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-10 text-center text-g40">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-g20 bg-white dark:bg-panel-mid p-10 text-center">
          <Box className="h-10 w-10 text-teal mx-auto mb-2 opacity-50" aria-hidden="true" />
          <h3 className="font-display text-lg text-ink dark:text-ivory">No purchase orders</h3>
          <p className="text-sm text-g40 mt-1">Raise your first PO or trigger one via the Inventory page's reorder action.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const property = props?.find((p) => p.id === o.propertyId)
            return (
              <li key={o.id} className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
                <header className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-g40">{o.id}</span>
                      <FlowStatusBadge tone={STATUS_TONE[o.status]} dot>{STATUS_LABEL[o.status]}</FlowStatusBadge>
                      {o.expectedAt && o.status !== 'received' && o.status !== 'cancelled' &&
                       new Date(o.expectedAt).getTime() < Date.now() && (
                        <FlowStatusBadge tone="cancelled" dot>Late</FlowStatusBadge>
                      )}
                    </div>
                    <h3 className="font-display text-lg text-ink dark:text-ivory mt-1">{o.supplierName}</h3>
                    <div className="text-xs text-g40 mt-0.5">
                      Property: {property?.name ?? o.propertyId} · Created {formatDate(o.createdAt)}
                      {o.expectedAt && <> · Expected {formatDate(o.expectedAt)}</>}
                    </div>
                    {o.notes && <div className="text-xs text-g40 italic mt-1">"{o.notes}"</div>}
                  </div>
                  <div className="text-right">
                    <div className="label-caps text-g40">Total</div>
                    <div className="font-display font-bold text-2xl text-copper">{formatCurrency(o.totalCad)}</div>
                  </div>
                </header>

                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="bg-ivory dark:bg-panel">
                      {['Item','Qty','Unit','Unit cost','Line total'].map((h, i) => (
                        <th key={h} className={cn('label-caps font-semibold px-3 py-1.5 text-g40', i >= 1 ? 'text-right' : 'text-left')}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {o.lines.map((l, i) => (
                      <tr key={i} className="border-b border-g20/40 last:border-0">
                        <td className="px-3 py-1.5 text-ink dark:text-ivory">{l.itemName}</td>
                        <td className="px-3 py-1.5 text-right text-ink dark:text-ivory">{l.qty}</td>
                        <td className="px-3 py-1.5 text-right text-g40">{l.unit}</td>
                        <td className="px-3 py-1.5 text-right text-ink dark:text-ivory">{formatCurrency(l.unitCostCad)}</td>
                        <td className="px-3 py-1.5 text-right text-copper font-display font-bold">{formatCurrency(l.qty * l.unitCostCad)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {TRANSITIONS[o.status].length > 0 && (
                  <footer className="mt-3 flex flex-wrap gap-2">
                    {TRANSITIONS[o.status].map((to) => {
                      const isCancel = to === 'cancelled'
                      const isProgress = !isCancel
                      const icon = to === 'submitted' ? Send : to === 'received' ? Check : to === 'cancelled' ? X : ChevronRight
                      const Icon = icon
                      return (
                        <button
                          key={to}
                          onClick={() => setPendingTransition({ order: o, to })}
                          className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 rounded-input text-xs font-medium',
                            isProgress ? 'bg-teal text-white hover:bg-teal-dark' : 'border border-g20 text-g40 hover:text-red-600 hover:border-red-300'
                          )}
                        >
                          <Icon className="h-3 w-3" /> {isCancel ? 'Cancel' : `Mark ${STATUS_LABEL[to]}`}
                        </button>
                      )
                    })}
                  </footer>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <FlowConfirmDialog
        open={!!pendingTransition}
        title={`Move PO to ${pendingTransition ? STATUS_LABEL[pendingTransition.to] : ''}?`}
        description={
          pendingTransition?.to === 'received'
            ? 'Stock for each line will be added to the property inventory automatically.'
            : pendingTransition?.to === 'cancelled'
              ? 'This will close the PO without receiving any items.'
              : 'This will progress the PO to the next status.'
        }
        confirmLabel={pendingTransition?.to === 'cancelled' ? 'Cancel PO' : 'Confirm'}
        destructive={pendingTransition?.to === 'cancelled'}
        onConfirm={handleTransition}
        onCancel={() => setPendingTransition(null)}
      />

      {createOpen && (
        <CreatePoModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); refetch() }}
          properties={props ?? []}
          suppliers={suppliers ?? []}
        />
      )}
    </div>
  )
}

function CreatePoModal({ onClose, onCreated, properties: props, suppliers }: {
  onClose: () => void
  onCreated: () => void
  properties: Array<{ id: string; name: string }>
  suppliers: Supplier[]
}) {
  const [propertyId, setPropertyId] = useState(props[0]?.id ?? '')
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '')
  const { data: items } = useApi(() => inventory.list({ propertyId }), [propertyId])
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supplier = suppliers.find((s) => s.id === supplierId)
  const filteredItems = useMemo(() => items?.filter((i) => i.supplierId === supplierId) ?? [], [items, supplierId])
  const lines = useMemo(() => filteredItems
    .filter((i) => picked[i.id] && picked[i.id] > 0)
    .map((i) => ({ itemId: i.id, itemName: i.name, qty: picked[i.id], unit: i.unit, unitCostCad: i.unitCostCad })), [filteredItems, picked])
  const total = lines.reduce((s, l) => s + l.qty * l.unitCostCad, 0)

  const submit = async () => {
    if (lines.length === 0) return
    setSubmitting(true)
    await procurement.create({
      propertyId,
      supplierId,
      supplierName: supplier?.name ?? 'Unknown',
      lines,
      expectedAt: supplier ? new Date(Date.now() + supplier.leadDays * 86400_000).toISOString().split('T')[0] : undefined,
      notes: notes || undefined,
    })
    setSubmitting(false)
    onCreated()
  }

  const togglePick = (item: InventoryItem) => {
    setPicked((cur) => {
      const next = { ...cur }
      if (next[item.id]) delete next[item.id]
      else next[item.id] = item.reorderQty
      return next
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="po-create-title" className="bg-white dark:bg-panel-mid w-full max-w-3xl rounded-card shadow-panel max-h-[90vh] flex flex-col">
          <header className="px-6 py-4 border-b border-g20/60 flex items-center justify-between">
            <h2 id="po-create-title" className="font-display text-xl text-ink dark:text-ivory">New purchase order</h2>
            <button onClick={onClose} aria-label="Close" className="text-g40 hover:text-ink"><X className="h-4 w-4" /></button>
          </header>

          <div className="p-6 space-y-4 overflow-y-auto flow-scroll flex-1">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="label-caps text-g40 mb-1 block">Property (ship-to)</span>
                <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
                  {props.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="label-caps text-g40 mb-1 block">Supplier</span>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory">
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.country}</option>)}
                </select>
              </label>
            </div>
            {supplier && (
              <div className="rounded-input border border-teal/30 bg-teal-light/40 dark:bg-teal-dark/20 px-3 py-2 text-xs text-ink dark:text-ivory">
                Lead time: <strong>{supplier.leadDays} days</strong> · Expected delivery:{' '}
                <strong>{formatDate(new Date(Date.now() + supplier.leadDays * 86400_000))}</strong>
                {supplier.notes && <span className="block text-g40 mt-0.5">{supplier.notes}</span>}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label-caps text-g40">Pick items from this supplier ({filteredItems.length})</span>
                <span className="text-xs text-g40">{lines.length} selected</span>
              </div>
              {filteredItems.length === 0 ? (
                <div className="rounded-input bg-ivory dark:bg-panel p-4 text-center text-sm text-g40 italic">
                  No inventory items mapped to this supplier for this property yet.
                </div>
              ) : (
                <ul className="rounded-card border border-g20/60 divide-y divide-g20/40 max-h-[280px] overflow-y-auto flow-scroll">
                  {filteredItems.map((i) => {
                    const checked = !!picked[i.id]
                    const qty = picked[i.id] ?? 0
                    return (
                      <li key={i.id} className="px-3 py-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePick(i)}
                          className="accent-teal"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-ink dark:text-ivory">{i.name}</div>
                          <div className="text-[11px] text-g40">{i.unit} · stock {i.currentStock} / par {i.parLevel}</div>
                        </div>
                        <span className="text-xs text-g40">@ {formatCurrency(i.unitCostCad)}</span>
                        <input
                          type="number"
                          value={qty}
                          min={0}
                          disabled={!checked}
                          onChange={(e) => setPicked({ ...picked, [i.id]: parseInt(e.target.value || '0') })}
                          className="w-20 px-2 py-1 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory disabled:opacity-40 text-right"
                          aria-label={`Quantity for ${i.name}`}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <label className="block">
              <span className="label-caps text-g40 mb-1 block">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes for procurement..."
                className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[60px] text-ink dark:text-ivory"
              />
            </label>
          </div>

          <footer className="px-6 py-3 border-t border-g20/60 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="label-caps text-g40">Order total</div>
              <div className="font-display font-bold text-2xl text-copper">{formatCurrency(total)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-2 rounded-input border border-g20 text-sm">Cancel</button>
              <button
                onClick={submit}
                disabled={lines.length === 0 || submitting}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-input bg-copper text-white text-sm font-medium disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" /> {submitting ? 'Submitting…' : 'Submit PO'}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
