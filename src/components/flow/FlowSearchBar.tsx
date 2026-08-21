import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { SAMPLE_RESERVATIONS, VEHICLES, PROPERTIES } from '../../lib/sampleData'

export function FlowSearchBar({ className }: { className?: string }) {
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    if (!q.trim()) return null
    const needle = q.toLowerCase()
    return {
      bookings: SAMPLE_RESERVATIONS.filter((r) =>
        r.guestName.toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle)
      ).slice(0, 4),
      vehicles: VEHICLES.filter((v) =>
        v.plate.toLowerCase().includes(needle) || `${v.make} ${v.model}`.toLowerCase().includes(needle)
      ).slice(0, 4),
      properties: PROPERTIES.filter((p) =>
        p.name.toLowerCase().includes(needle) || p.city.toLowerCase().includes(needle)
      ).slice(0, 3),
    }
  }, [q])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-g40" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bookings, guests, vehicles, properties…"
        className="w-full pl-9 pr-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-ink dark:text-ivory"
      />
      {results && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-panel-mid border border-g20/60 rounded-card shadow-panel animate-flow-fade max-h-96 overflow-y-auto flow-scroll">
          <Group title="Bookings">
            {results.bookings.map((b) => (
              <Hit key={b.id} primary={b.guestName} secondary={`${b.id} · ${b.roomType} · $${b.totalUsd}`} />
            ))}
          </Group>
          <Group title="Vehicles">
            {results.vehicles.map((v) => (
              <Hit key={v.id} primary={`${v.make} ${v.model}`} secondary={`${v.plate} · ${v.tier} · ${v.location}`} />
            ))}
          </Group>
          <Group title="Properties">
            {results.properties.map((p) => (
              <Hit key={p.id} primary={p.name} secondary={`${p.city}, ${p.country}`} />
            ))}
          </Group>
        </div>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children
  if (Array.isArray(items) && items.length === 0) return null
  return (
    <div className="border-b border-g20/40 last:border-0">
      <div className="px-4 py-1.5 label-caps text-g40 bg-ivory dark:bg-panel">{title}</div>
      {children}
    </div>
  )
}

function Hit({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <button className="w-full text-left px-4 py-2 hover:bg-ivory dark:hover:bg-panel">
      <div className="text-sm font-medium text-ink dark:text-ivory">{primary}</div>
      <div className="text-xs text-g40 dark:text-g60">{secondary}</div>
    </button>
  )
}
