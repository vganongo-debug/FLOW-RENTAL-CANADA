import { useMemo, useState } from 'react'
import { Plus, ChevronRight, Clock, Utensils, CheckCircle2, Edit3, Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'

type TableStatus = 'free' | 'seated' | 'ordering' | 'served' | 'check_dropped'

interface Table {
  id: string
  number: number
  seats: number
  status: TableStatus
  party?: number
  server?: string
  openTotal?: number
  minutes?: number
}

interface OrderItem {
  id: string
  table: number
  items: { qty: number; label: string; priceCad: number }[]
  course: 'starter' | 'main' | 'dessert' | 'drinks'
  ageMin: number
  state: 'fired' | 'plating' | 'ready'
}

const STATUS_TONE: Record<TableStatus, string> = {
  free:          'bg-teal-light text-teal-dark border-teal/30',
  seated:        'bg-copper-light text-copper-dark border-copper/40',
  ordering:      'bg-copper text-white border-copper-dark',
  served:        'bg-teal text-white border-teal-dark',
  check_dropped: 'bg-g20/40 text-g80 border-g40/40',
}

const STATUS_LABEL: Record<TableStatus, string> = {
  free: 'Free',
  seated: 'Seated',
  ordering: 'Ordering',
  served: 'Served',
  check_dropped: 'Check dropped',
}

const TABLES: Table[] = [
  { id:'t-01', number: 1,  seats: 2, status: 'served',        party: 2, server:'Aïcha',   openTotal: 48,  minutes: 28 },
  { id:'t-02', number: 2,  seats: 2, status: 'free' },
  { id:'t-03', number: 3,  seats: 4, status: 'ordering',      party: 3, server:'Daniel',  openTotal: 22,  minutes: 8 },
  { id:'t-04', number: 4,  seats: 4, status: 'seated',        party: 4, server:'Aïcha',   openTotal: 0,   minutes: 3 },
  { id:'t-05', number: 5,  seats: 4, status: 'served',        party: 2, server:'Henry',   openTotal: 78,  minutes: 41 },
  { id:'t-06', number: 6,  seats: 6, status: 'check_dropped', party: 5, server:'Daniel',  openTotal: 142, minutes: 70 },
  { id:'t-07', number: 7,  seats: 2, status: 'free' },
  { id:'t-08', number: 8,  seats: 4, status: 'served',        party: 2, server:'Émilie',  openTotal: 64,  minutes: 22 },
  { id:'t-09', number: 9,  seats: 6, status: 'free' },
  { id:'t-10', number: 10, seats: 6, status: 'seated',        party: 6, server:'Henry',   openTotal: 0,   minutes: 1 },
  { id:'t-11', number: 11, seats: 2, status: 'free' },
  { id:'t-12', number: 12, seats: 8, status: 'ordering',      party: 7, server:'Émilie',  openTotal: 38,  minutes: 12 },
]

const ORDERS: OrderItem[] = [
  { id:'o-1', table: 3,  course: 'starter',  ageMin: 4,  state: 'plating', items: [{ qty:2, label:'Goat-cheese tart', priceCad: 7 }, { qty:1, label:'Beef tartare', priceCad: 9 }] },
  { id:'o-2', table: 1,  course: 'main',     ageMin: 12, state: 'ready',   items: [{ qty:1, label:'Pan-seared Nile perch', priceCad: 18 }, { qty:1, label:'Matoke & groundnut stew', priceCad: 14 }] },
  { id:'o-3', table: 5,  course: 'dessert',  ageMin: 2,  state: 'fired',   items: [{ qty:2, label:'Vanilla parfait', priceCad: 6 }] },
  { id:'o-4', table: 12, course: 'drinks',   ageMin: 1,  state: 'fired',   items: [{ qty:3, label:'Tusker lager (500ml)', priceCad: 4 }, { qty:1, label:'Sparkling water', priceCad: 3 }] },
  { id:'o-5', table: 8,  course: 'main',     ageMin: 18, state: 'ready',   items: [{ qty:2, label:'Tilapia thali', priceCad: 15 }] },
]

const MENU = [
  { section: 'Starters', items: [
    { name: 'Goat-cheese tart',     price:  7, available: true },
    { name: 'Beef tartare',         price:  9, available: true },
    { name: 'Pumpkin velouté',      price:  6, available: false },
  ]},
  { section: 'Mains', items: [
    { name: 'Pan-seared Nile perch', price: 18, available: true },
    { name: 'Matoke & groundnut',    price: 14, available: true },
    { name: 'Tilapia thali',         price: 15, available: true },
    { name: 'Ribeye 250g',           price: 24, available: true },
  ]},
  { section: 'Desserts', items: [
    { name: 'Vanilla parfait',       price:  6, available: true },
    { name: 'Mango pavlova',         price:  7, available: true },
  ]},
  { section: 'Drinks', items: [
    { name: 'Tusker lager (500ml)',  price:  4, available: true },
    { name: 'House red (glass)',     price:  7, available: true },
    { name: 'Sparkling water',       price:  3, available: true },
    { name: 'Pineapple-ginger fresh',price:  4, available: true },
  ]},
]

export default function FnB() {
  const [selected, setSelected] = useState<Table | null>(TABLES[2])

  const stats = useMemo(() => {
    const seated = TABLES.filter((t) => t.status !== 'free').length
    const covers = TABLES.reduce((s, t) => s + (t.party ?? 0), 0)
    const revenue = TABLES.reduce((s, t) => s + (t.openTotal ?? 0), 0)
    const avgCheck = covers ? revenue / covers : 0
    return { seated, covers, revenue, avgCheck }
  }, [])

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · F&B</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Restaurant Floor</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Live service · Flow Bistro · Kampala</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <Utensils className="h-4 w-4" /> Edit menu
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" /> Walk-in cover
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Tables seated" value={`${stats.seated} / ${TABLES.length}`} delta={{ pct: 12.5, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Covers tonight" value={`${stats.covers}`} hint="vs. 24 same day LW" accent="teal" />
        <FlowKPICard label="Live revenue" value={formatCurrency(stats.revenue)} delta={{ pct: 6.2, direction: 'up' }} />
        <FlowKPICard label="Avg check" value={formatCurrency(Math.round(stats.avgCheck))} hint="per cover" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Floor plan */}
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg text-ink dark:text-ivory">Floor plan</h2>
              <p className="text-xs text-g40 dark:text-g60">Click any table to open the cover sheet</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {(Object.keys(STATUS_LABEL) as TableStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-g40">
                  <span className={cn('h-2.5 w-2.5 rounded-sm border', STATUS_TONE[s])} />
                  {STATUS_LABEL[s]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {TABLES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={cn(
                  'aspect-square rounded-card border-2 p-2 flex flex-col items-center justify-center text-center transition relative hover:scale-105',
                  STATUS_TONE[t.status],
                  selected?.id === t.id && 'ring-2 ring-teal ring-offset-2 ring-offset-white dark:ring-offset-panel-mid'
                )}
              >
                <span className="font-display text-2xl leading-none">{t.number}</span>
                <span className="text-[10px] label-caps opacity-80 mt-1">{t.seats} seats</span>
                {t.party && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 text-[9px] font-bold rounded-sm bg-white/80 text-ink">
                    {t.party} pax
                  </span>
                )}
                {t.minutes !== undefined && t.minutes > 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] opacity-80 inline-flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> {t.minutes}m
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Active orders */}
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-ink dark:text-ivory">Active orders</h2>
              <p className="text-xs text-g40 dark:text-g60">{ORDERS.length} tickets in the pass</p>
            </div>
            <FlowStatusBadge tone="active" dot>LIVE</FlowStatusBadge>
          </header>
          <ul className="divide-y divide-g20/40 max-h-[420px] overflow-y-auto flow-scroll">
            {ORDERS.map((o) => (
              <li key={o.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold">T{o.table}</span>
                    <div>
                      <div className="text-sm font-medium text-ink dark:text-ivory capitalize">{o.course}</div>
                      <div className="text-[11px] text-g40 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {o.ageMin}m ago
                      </div>
                    </div>
                  </div>
                  <FlowStatusBadge tone={o.state === 'ready' ? 'active' : o.state === 'plating' ? 'pending' : 'info'} dot>
                    {o.state}
                  </FlowStatusBadge>
                </div>
                <ul className="text-xs space-y-0.5 pl-9">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between text-ink dark:text-ivory">
                      <span><span className="text-g40">{i.qty}×</span> {i.label}</span>
                      <span className="text-g40">{formatCurrency(i.qty * i.priceCad)}</span>
                    </li>
                  ))}
                </ul>
                {o.state === 'ready' && (
                  <button className="mt-2 ml-9 inline-flex items-center gap-1 px-2 py-1 rounded-input bg-teal text-white text-[11px] font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Mark served
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Menu CRUD */}
      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-ivory">Menu</h2>
            <p className="text-xs text-g40 dark:text-g60">Mark items 86'd to remove from POS instantly</p>
          </div>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input bg-teal text-white text-sm font-medium">
            <Plus className="h-4 w-4" /> Add item
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MENU.map((section) => (
            <div key={section.section}>
              <h3 className="label-caps text-g40 mb-2">{section.section}</h3>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.name} className={cn('flex items-center justify-between p-2 rounded-input border', item.available ? 'border-g20/60 bg-ivory dark:bg-panel' : 'border-red-200 bg-red-50/40 dark:bg-red-900/10')}>
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="checkbox" defaultChecked={item.available} className="accent-teal" />
                      <div className="min-w-0">
                        <div className={cn('text-sm truncate', item.available ? 'text-ink dark:text-ivory' : 'text-g40 line-through')}>{item.name}</div>
                        <div className="text-[11px] text-copper font-display font-bold">{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-g40 hover:text-teal"><Edit3 className="h-3 w-3" /></button>
                      <button className="p-1 text-g40 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Detail drawer */}
      {selected && (
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="label-caps text-g40">Cover sheet</div>
              <h3 className="font-display text-2xl text-ink dark:text-ivory">Table {selected.number}</h3>
              <div className="text-xs text-g40 mt-0.5">{selected.seats} seats · Server: {selected.server ?? '—'}</div>
            </div>
            <div className="flex items-center gap-3">
              <FlowStatusBadge tone={selected.status === 'free' ? 'completed' : selected.status === 'served' ? 'active' : 'pending'} dot>
                {STATUS_LABEL[selected.status]}
              </FlowStatusBadge>
              {selected.openTotal !== undefined && selected.openTotal > 0 && (
                <span className="font-display font-bold text-2xl text-copper">{formatCurrency(selected.openTotal)}</span>
              )}
              <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-input bg-teal text-white text-sm font-medium">
                Open ticket <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
