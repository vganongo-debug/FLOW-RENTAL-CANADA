import { useMemo, useState } from 'react'
import { Plus, Send, Printer, Eye, Download, Filter } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowInvoice } from '../../components/flow/FlowInvoice'
import { FlowKPICard } from '../../components/flow/FlowKPICard'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

interface InvoiceRow {
  id: string
  client: string
  issued: string
  due: string
  amount: number
  property: string
  status: InvoiceStatus
}

const STATUS_TONE: Record<InvoiceStatus, 'completed' | 'info' | 'active' | 'cancelled'> = {
  draft: 'completed',
  sent: 'info',
  paid: 'active',
  overdue: 'cancelled',
}

const INVOICES: InvoiceRow[] = [
  { id:'FRG-2026-0418', client:'Consortium Baie-Nord',          issued:'2026-04-22', due:'2026-05-22', amount: 8_240, property:'Flow Station Natashquan',     status:'overdue' },
  { id:'FRG-2026-0420', client:'Sarah Bennett',          issued:'2026-04-25', due:'2026-05-25', amount: 1_240, property:'Flow Station Natashquan',     status:'paid'    },
  { id:'FRG-2026-0421', client:'Banque Nordia',        issued:'2026-04-28', due:'2026-05-28', amount: 4_120, property:'Flow Station Blanc-Sablon', status:'overdue' },
  { id:'FRG-2026-0422', client:'Olivier Deschênes',       issued:'2026-05-01', due:'2026-05-31', amount:   880, property:'Flow Station Natashquan',     status:'paid'    },
  { id:'FRG-2026-0423', client:'Caisse du Littoral',     issued:'2026-05-02', due:'2026-06-01', amount: 6_040, property:'Flow Station Natashquan',     status:'sent'    },
  { id:'FRG-2026-0424', client:'Fonds Nordique de Développement',        issued:'2026-05-03', due:'2026-06-02', amount: 2_780, property:'Flow Station Blanc-Sablon', status:'overdue' },
  { id:'FRG-2026-0425', client:'Groupe Minier Fermont',      issued:'2026-05-04', due:'2026-06-03', amount: 2_020, property:'Flow Station Natashquan',     status:'sent'    },
  { id:'FRG-2026-0426', client:'Émilie Tremblay',        issued:'2026-05-05', due:'2026-06-04', amount: 1_180, property:'Flow Station Saint-Augustin', status:'paid'    },
  { id:'FRG-2026-0427', client:'Consortium Baie-Nord',          issued:'2026-05-06', due:'2026-06-05', amount: 9_640, property:'Flow Station Saint-Augustin', status:'sent'    },
  { id:'FRG-2026-0428', client:'Nordia Affaires',             issued:'2026-05-07', due:'2026-06-06', amount:   720, property:'Flow Station Natashquan',     status:'draft'   },
]

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all')
  const [propertyFilter, setPropertyFilter] = useState<'all' | string>('all')
  const [selectedId, setSelectedId] = useState<string>(INVOICES[0].id)

  const filtered = useMemo(() => INVOICES.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (propertyFilter !== 'all' && i.property !== propertyFilter) return false
    return true
  }), [statusFilter, propertyFilter])

  const selected = INVOICES.find((i) => i.id === selectedId) ?? INVOICES[0]
  const totalOutstanding = INVOICES.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const totalPaid = INVOICES.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const overdue = INVOICES.filter((i) => i.status === 'overdue')

  const properties = Array.from(new Set(INVOICES.map((i) => i.property)))

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Flow Pay · Invoicing</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Invoices</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Generate, send, track · {INVOICES.length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Total outstanding" value={formatCurrency(totalOutstanding)} accent="copper" hint={`${INVOICES.filter((i) => i.status !== 'paid').length} invoices`} />
        <FlowKPICard label="Paid · MTD" value={formatCurrency(totalPaid)} delta={{ pct: 12.4, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Overdue" value={`${overdue.length}`} hint={formatCurrency(overdue.reduce((s, i) => s + i.amount, 0))} />
        <FlowKPICard label="Avg days to pay" value="14" delta={{ pct: -1.6, direction: 'down' }} accent="teal" hint="Net-30 terms" />
      </div>

      <div className="grid lg:grid-cols-[1fr_540px] gap-5">
        <section className="space-y-3">
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-g40" />
              <span className="label-caps text-g40">Filter</span>
            </div>
            <div>
              <label className="label-caps text-g40 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)}
                className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="label-caps text-g40 block mb-1">Property</label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
              >
                <option value="all">All properties</option>
                {properties.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="ml-auto label-caps text-g40">{filtered.length} of {INVOICES.length}</div>
          </div>

          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal text-white">
                  {['Invoice','Client','Issued','Due','Amount','Status',''].map((h, i) => (
                    <th key={h || i} className={cn('label-caps font-semibold px-3 py-2', i === 4 ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedId(inv.id)}
                    className={cn(
                      'border-b border-g20/40 last:border-0 cursor-pointer transition',
                      i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel',
                      selectedId === inv.id && 'bg-teal-light dark:bg-teal-dark/30',
                      'hover:bg-teal-light/60 dark:hover:bg-teal-dark/20'
                    )}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{inv.id}</td>
                    <td className="px-3 py-2 text-ink dark:text-ivory">
                      <div className="font-medium">{inv.client}</div>
                      <div className="text-xs text-g40">{inv.property}</div>
                    </td>
                    <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(inv.issued)}</td>
                    <td className="px-3 py-2 text-ink dark:text-ivory">{formatDate(inv.due)}</td>
                    <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(inv.amount)}</td>
                    <td className="px-3 py-2"><FlowStatusBadge tone={STATUS_TONE[inv.status]} dot>{inv.status}</FlowStatusBadge></td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedId(inv.id) }} className="text-xs text-teal hover:text-teal-dark font-medium">
                        <Eye className="h-3.5 w-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Preview */}
        <aside className="space-y-3">
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex items-center justify-between">
            <div>
              <div className="label-caps text-g40">Preview</div>
              <div className="text-sm font-medium text-ink dark:text-ivory">{selected.id} · {selected.client}</div>
            </div>
            <div className="flex gap-1.5">
              <button className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal" title="Send">
                <Send className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal" title="Print">
                <Printer className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal" title="Download PDF">
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <FlowInvoice
            invoiceNumber={selected.id}
            date={selected.issued}
            client={{ name: selected.client, email: 'finance@example.com', address: selected.property }}
          />
        </aside>
      </div>
    </div>
  )
}
