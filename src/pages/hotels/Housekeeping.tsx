import { useMemo, useState } from 'react'
import { Filter, Printer, UserPlus, Clock, AlertTriangle, MoreVertical } from 'lucide-react'
import { cn } from '../../lib/utils'

type Column = 'to_clean' | 'in_progress' | 'inspecting' | 'ready' | 'dnd'

interface Card {
  id: string
  room: string
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Executive'
  floor: number
  priority: 'normal' | 'high'
  assigned: string | null
  sinceCheckoutMin: number
  column: Column
}

const STAFF = ['Aisha Nakato', 'Daniel Okello', 'Émilie Tremblay', 'Henry Mukasa']

const COLS: { id: Column; label: string; tone: string }[] = [
  { id: 'to_clean',    label: 'To Clean',       tone: 'border-copper bg-copper-light/40' },
  { id: 'in_progress', label: 'In Progress',    tone: 'border-teal-mid bg-teal-light/60' },
  { id: 'inspecting',  label: 'Inspecting',     tone: 'border-teal bg-teal-light/80' },
  { id: 'ready',       label: 'Clean & Ready',  tone: 'border-teal-dark bg-teal-light' },
  { id: 'dnd',         label: 'Do Not Disturb', tone: 'border-g40 bg-g20/30' },
]

const INITIAL: Card[] = [
  { id: 'c-1', room: '101', type: 'Standard',  floor: 1, priority: 'high',    assigned: null,            sinceCheckoutMin: 14, column: 'to_clean' },
  { id: 'c-2', room: '108', type: 'Executive', floor: 1, priority: 'high',    assigned: null,            sinceCheckoutMin: 28, column: 'to_clean' },
  { id: 'c-3', room: '203', type: 'Suite',     floor: 2, priority: 'normal',  assigned: null,            sinceCheckoutMin: 42, column: 'to_clean' },
  { id: 'c-4', room: '210', type: 'Standard',  floor: 2, priority: 'normal',  assigned: null,            sinceCheckoutMin: 95, column: 'to_clean' },

  { id: 'c-5', room: '105', type: 'Deluxe',    floor: 1, priority: 'normal',  assigned: 'Aisha Nakato',    sinceCheckoutMin: 65, column: 'in_progress' },
  { id: 'c-6', room: '207', type: 'Suite',     floor: 2, priority: 'high',    assigned: 'Émilie Tremblay', sinceCheckoutMin: 110, column: 'in_progress' },

  { id: 'c-7', room: '102', type: 'Standard',  floor: 1, priority: 'normal',  assigned: 'Daniel Okello',   sinceCheckoutMin: 180, column: 'inspecting' },

  { id: 'c-8', room: '104', type: 'Executive', floor: 1, priority: 'normal',  assigned: 'Aisha Nakato',    sinceCheckoutMin: 220, column: 'ready' },
  { id: 'c-9', room: '109', type: 'Standard',  floor: 1, priority: 'normal',  assigned: 'Henry Mukasa',    sinceCheckoutMin: 300, column: 'ready' },
  { id: 'c-10', room: '205', type: 'Deluxe',   floor: 2, priority: 'normal',  assigned: 'Aisha Nakato',    sinceCheckoutMin: 245, column: 'ready' },

  { id: 'c-11', room: '301', type: 'Standard', floor: 3, priority: 'normal',  assigned: null,              sinceCheckoutMin: 0,   column: 'dnd' },
  { id: 'c-12', room: '305', type: 'Deluxe',   floor: 3, priority: 'normal',  assigned: null,              sinceCheckoutMin: 0,   column: 'dnd' },
]

function timeLabel(min: number) {
  if (min === 0) return 'Active stay'
  if (min < 60) return `${min}m since check-out`
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m since check-out`
}

export default function Housekeeping() {
  const [cards, setCards] = useState<Card[]>(INITIAL)
  const [floor, setFloor] = useState<'all' | number>('all')
  const [staff, setStaff] = useState<string | 'all'>('all')
  const [dragId, setDragId] = useState<string | null>(null)

  const filtered = useMemo(() => cards.filter((c) => {
    if (floor !== 'all' && c.floor !== floor) return false
    if (staff !== 'all' && c.assigned !== staff) return false
    return true
  }), [cards, floor, staff])

  const grouped = useMemo(() => {
    const out: Record<Column, Card[]> = { to_clean:[], in_progress:[], inspecting:[], ready:[], dnd:[] }
    filtered.forEach((c) => out[c.column].push(c))
    return out
  }, [filtered])

  const moveTo = (col: Column) => {
    if (!dragId) return
    setCards((cur) => cur.map((c) => c.id === dragId ? { ...c, column: col } : c))
    setDragId(null)
  }

  const assign = (cardId: string, name: string | null) => {
    setCards((cur) => cur.map((c) => c.id === cardId ? { ...c, assigned: name } : c))
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · Housekeeping</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Housekeeping Board</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Drag rooms across stages · live across all floors</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 hover:border-teal text-sm text-ink dark:text-ivory">
            <UserPlus className="h-4 w-4" /> Assign all
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 hover:border-teal text-sm text-ink dark:text-ivory">
            <Printer className="h-4 w-4" /> Print sheet
          </button>
        </div>
      </header>

      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-g40" />
          <span className="label-caps text-g40">Filter</span>
        </div>
        <select
          value={floor === 'all' ? 'all' : String(floor)}
          onChange={(e) => setFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
        >
          <option value="all">All floors</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
        </select>
        <select
          value={staff}
          onChange={(e) => setStaff(e.target.value)}
          className="px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
        >
          <option value="all">All staff</option>
          {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto text-xs text-g40 flex flex-wrap items-center gap-3">
          {COLS.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm border', c.tone)} />
              {c.label} · {grouped[c.id].length}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {COLS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault() }}
            onDrop={() => moveTo(col.id)}
            className={cn(
              'rounded-card border-t-4 bg-white dark:bg-panel-mid border-x border-b border-g20/60 flex flex-col min-h-[480px]',
              col.tone
            )}
          >
            <header className="px-3 py-2 flex items-center justify-between">
              <div>
                <div className="label-caps text-g40">{col.label}</div>
                <div className="font-display text-xl text-ink dark:text-ivory leading-tight">{grouped[col.id].length}</div>
              </div>
            </header>
            <ul className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto flow-scroll">
              {grouped[col.id].map((card) => (
                <li
                  key={card.id}
                  draggable
                  onDragStart={() => setDragId(card.id)}
                  className="rounded-input bg-ivory dark:bg-panel border border-g20/60 p-3 hover:border-teal cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-lg text-ink dark:text-ivory leading-tight">{card.room}</div>
                      <div className="text-xs text-g40">{card.type} · Floor {card.floor}</div>
                    </div>
                    <button className="text-g40 hover:text-ink"><MoreVertical className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                    {card.priority === 'high' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-badge bg-copper text-white label-caps">
                        <AlertTriangle className="h-3 w-3" /> High
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-g40">
                      <Clock className="h-3 w-3" /> {timeLabel(card.sinceCheckoutMin)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <select
                      value={card.assigned ?? ''}
                      onChange={(e) => assign(card.id, e.target.value || null)}
                      className="w-full px-2 py-1 text-xs rounded-input bg-white dark:bg-panel-mid border border-g20/60 text-ink dark:text-ivory"
                    >
                      <option value="">Unassigned</option>
                      {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </li>
              ))}
              {grouped[col.id].length === 0 && (
                <li className="text-center text-xs text-g40 py-6 italic">Empty</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
