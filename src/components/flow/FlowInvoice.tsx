import { Printer } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'

interface LineItem { label: string; qty: number; unit: number }

interface Props {
  invoiceNumber?: string
  date?: string | Date
  client?: { name: string; email: string; address: string }
  items?: LineItem[]
  taxLabel?: string
  taxPct?: number
  className?: string
}

const DEFAULT_ITEMS: LineItem[] = [
  { label: 'Suite 207 · 4 nights', qty: 4, unit: 195 },
  { label: 'Breakfast (2 pax × 4)', qty: 8, unit: 18 },
  { label: 'Airport transfer · arrival', qty: 1, unit: 35 },
  { label: 'Toyota Highlander AWD rental · 3 days', qty: 3, unit: 165 },
]

export function FlowInvoice({
  invoiceNumber = 'FRG-2026-0418',
  date = new Date('2026-05-10'),
  client = {
    name: 'Sarah Bennett',
    email: 'sarah.bennett@example.com',
    address: '12 Royal Crescent · London W1 · United Kingdom',
  },
  items = DEFAULT_ITEMS,
  taxLabel = 'TPS + TVQ (14,975 %)',
  taxPct = 18,
  className,
}: Props) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unit, 0)
  const tax = (subtotal * taxPct) / 100
  const total = subtotal + tax
  return (
    <div className={`bg-white dark:bg-panel-mid rounded-card border border-g20/60 overflow-hidden shadow-card ${className ?? ''}`}>
      <div className="bg-teal text-white px-6 py-5 flex items-start justify-between">
        <div>
          <div className="font-display text-2xl">Flow Rentals Global Inc.</div>
          <div className="text-xs opacity-80 mt-1">Operating across Quebec and Labrador · subsidiary of VBMS Holdings Inc.</div>
        </div>
        <div className="text-right">
          <div className="label-caps opacity-80">Invoice</div>
          <div className="font-mono text-sm">{invoiceNumber}</div>
          <div className="text-xs opacity-80 mt-1">{formatDate(date)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 px-6 py-5 border-b border-g20/60">
        <div>
          <div className="label-caps text-g40 mb-1">Bill to</div>
          <div className="font-medium text-ink dark:text-ivory">{client.name}</div>
          <div className="text-xs text-g40">{client.email}</div>
          <div className="text-xs text-g40 mt-1">{client.address}</div>
        </div>
        <div className="text-right">
          <div className="label-caps text-g40 mb-1">Property</div>
          <div className="font-medium text-ink dark:text-ivory">Flow Station Natashquan</div>
          <div className="text-xs text-g40">Plot 12 Lumumba Ave · Natashquan · UG</div>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ivory dark:bg-panel">
            <th className="text-left px-6 py-2 label-caps text-g40">Description</th>
            <th className="text-right px-6 py-2 label-caps text-g40">Qty</th>
            <th className="text-right px-6 py-2 label-caps text-g40">Unit</th>
            <th className="text-right px-6 py-2 label-caps text-g40">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx} className="border-b border-g20/40">
              <td className="px-6 py-2 text-ink dark:text-ivory">{i.label}</td>
              <td className="px-6 py-2 text-right text-ink dark:text-ivory">{i.qty}</td>
              <td className="px-6 py-2 text-right text-ink dark:text-ivory">{formatCurrency(i.unit)}</td>
              <td className="px-6 py-2 text-right text-ink dark:text-ivory font-medium">{formatCurrency(i.qty * i.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 flex justify-end">
        <div className="w-64 text-sm space-y-1">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          <Row label={taxLabel} value={formatCurrency(tax)} />
          <div className="border-t border-g20/60 pt-2 flex items-center justify-between">
            <span className="label-caps text-g40">Total due</span>
            <span className="font-display font-bold text-2xl text-copper">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-ivory dark:bg-panel flex items-center justify-between text-xs text-g40">
        <span>Thank you. Pay by bank transfer or via the Flow Pay portal.</span>
        <button className="inline-flex items-center gap-1 text-teal hover:text-teal-dark">
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-g40">{label}</span>
      <span className="text-ink dark:text-ivory">{value}</span>
    </div>
  )
}
