import { cn } from '../../lib/utils'

interface Row {
  id: string
  label: string
  sub?: string
}

interface Props {
  rows: Row[]
  /** Map of `${rowId}:${dayIndex}` -> 'available' | 'blocked' | 'booked' */
  cells?: Record<string, 'available' | 'blocked' | 'booked'>
  daysInMonth?: number
  monthLabel?: string
  className?: string
}

export function FlowCalendar({
  rows,
  cells = {},
  daysInMonth = 31,
  monthLabel = 'May 2026',
  className,
}: Props) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const cellState = (rowId: string, day: number) => {
    const k = `${rowId}:${day - 1}`
    if (cells[k]) return cells[k]
    // Pseudo-deterministic fallback
    const hash = (rowId.length + day) % 9
    if (hash === 0) return 'blocked'
    if (hash < 4) return 'booked'
    return 'available'
  }

  const tone: Record<'available' | 'blocked' | 'booked', string> = {
    available: 'bg-teal-light dark:bg-teal-dark/30',
    blocked: 'bg-red-200/70 dark:bg-red-900/50',
    booked: 'bg-copper/70',
  }

  return (
    <div className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-g20/60">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{monthLabel}</h3>
        <div className="flex items-center gap-3 text-xs">
          <Legend tone="available" label="Available" />
          <Legend tone="booked" label="Booked" />
          <Legend tone="blocked" label="Blocked" />
        </div>
      </div>
      <div className="overflow-x-auto flow-scroll">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white dark:bg-panel-mid px-3 py-2 text-left font-medium text-g40 z-10 min-w-[180px]">Resource</th>
              {days.map((d) => (
                <th key={d} className="px-1 py-2 text-center text-g40 font-medium w-7">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-g20/40">
                <td className="sticky left-0 bg-white dark:bg-panel-mid px-3 py-2 z-10">
                  <div className="font-medium text-ink dark:text-ivory">{r.label}</div>
                  {r.sub && <div className="text-[10px] text-g40">{r.sub}</div>}
                </td>
                {days.map((d) => {
                  const s = cellState(r.id, d)
                  return (
                    <td key={d} className="p-0.5">
                      <div className={cn('h-6 rounded-sm', tone[s])} title={`${r.label} · Day ${d} · ${s}`} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Legend({ tone, label }: { tone: 'available' | 'blocked' | 'booked'; label: string }) {
  const cls: Record<typeof tone, string> = {
    available: 'bg-teal-light dark:bg-teal-dark/30 border-teal/30',
    blocked: 'bg-red-200/70 dark:bg-red-900/50 border-red-300',
    booked: 'bg-copper/70 border-copper',
  }
  return (
    <span className="flex items-center gap-1 text-g40">
      <span className={cn('h-3 w-3 rounded-sm border', cls[tone])} />
      {label}
    </span>
  )
}
