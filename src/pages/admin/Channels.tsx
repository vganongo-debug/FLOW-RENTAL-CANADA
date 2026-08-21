import { useState } from 'react'
import { RefreshCw, AlertTriangle, Plus, Link2, Check, ExternalLink } from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowNotification } from '../../components/flow/FlowNotification'

type SyncStatus = 'live' | 'syncing' | 'error' | 'disabled'

interface Channel {
  id: string
  name: string
  logo: string
  commission: number
  bookings: number
  revenue: number
  lastSyncMinutes: number
  status: SyncStatus
  active: boolean
}

const STATUS_TONE: Record<SyncStatus, 'active' | 'info' | 'cancelled' | 'completed'> = {
  live:     'active',
  syncing:  'info',
  error:    'cancelled',
  disabled: 'completed',
}

const CHANNELS: Channel[] = [
  { id:'direct',   name:'Direct · Flow App',  logo:'FL', commission:  0, bookings:142, revenue:38_400, lastSyncMinutes:0,  status:'live',    active: true  },
  { id:'booking',  name:'Booking.com',        logo:'B',  commission: 15, bookings:118, revenue:31_220, lastSyncMinutes:2,  status:'live',    active: true  },
  { id:'expedia',  name:'Expedia',            logo:'EX', commission: 17, bookings: 52, revenue:14_180, lastSyncMinutes:4,  status:'live',    active: true  },
  { id:'airbnb',   name:'Airbnb',             logo:'A',  commission:  3, bookings: 18, revenue: 4_360, lastSyncMinutes:14, status:'syncing', active: true  },
  { id:'hotelbeds',name:'Hotelbeds',          logo:'HB', commission: 16, bookings:  9, revenue: 2_140, lastSyncMinutes:6,  status:'live',    active: true  },
  { id:'agoda',    name:'Agoda',              logo:'AG', commission: 17, bookings:  0, revenue:     0, lastSyncMinutes:0,  status:'disabled', active: false },
]

const PARITY_ALERTS = [
  { channel: 'Booking.com', room: 'Deluxe', their: 118, ours: 130, gap: 12 },
  { channel: 'Expedia',     room: 'Suite',  their: 188, ours: 195, gap:  7 },
]

const REVENUE_SHARE = [
  { name: 'Direct',     value: 38, color: '#0B6E6E' },
  { name: 'Booking.com', value: 31, color: '#0D8888' },
  { name: 'Expedia',    value: 14, color: '#B87333' },
  { name: 'Airbnb',     value:  4, color: '#7A4B20' },
  { name: 'Hotelbeds',  value:  2, color: '#5A7070' },
  { name: 'Walk-in',    value: 11, color: '#8FA0A0' },
]

export default function Channels() {
  const [channels, setChannels] = useState(CHANNELS)
  const toggle = (id: string) => {
    setChannels((c) => c.map((ch) => ch.id === id ? { ...ch, active: !ch.active, status: !ch.active ? 'live' : 'disabled' } : ch))
  }
  const totalBookings = channels.reduce((s, c) => s + c.bookings, 0)
  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0)
  const directShare = Math.round((channels.find((c) => c.id === 'direct')!.bookings / totalBookings) * 100)

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">SuperAdmin · Distribution</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Channel Manager</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">OTA integrations · rate parity · live sync</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <RefreshCw className="h-4 w-4" /> Sync now
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <Plus className="h-4 w-4" /> Add channel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Connected channels" value={String(channels.filter((c) => c.active).length)} hint={`of ${channels.length} total`} accent="teal" />
        <FlowKPICard label="Total bookings · MTD" value={String(totalBookings)} delta={{ pct: 9.4, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Channel revenue · MTD" value={formatCurrency(totalRevenue)} delta={{ pct: 11.6, direction: 'up' }} />
        <FlowKPICard label="Direct share" value={`${directShare}%`} delta={{ pct: 4.4, direction: 'up' }} hint="Target 45%" />
      </div>

      {PARITY_ALERTS.length > 0 && (
        <FlowNotification
          tone="warning"
          title={`${PARITY_ALERTS.length} rate parity alerts`}
          body={`OTA is cheaper than Direct on ${PARITY_ALERTS.map((p) => `${p.channel} · ${p.room}`).join(', ')}`}
        />
      )}

      <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
        <header className="px-5 py-3 border-b border-g20/60">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Connected channels</h2>
          <p className="text-xs text-g40 dark:text-g60">Toggle to enable / disable availability push</p>
        </header>
        <ul className="divide-y divide-g20/40">
          {channels.map((ch) => (
            <li key={ch.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
              <span className="h-11 w-11 rounded-card bg-gradient-to-br from-teal to-teal-dark text-white flex items-center justify-center font-display font-bold text-sm shrink-0">
                {ch.logo}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg text-ink dark:text-ivory">{ch.name}</h3>
                  <FlowStatusBadge tone={STATUS_TONE[ch.status]} dot>
                    {ch.status === 'live' ? `synced ${ch.lastSyncMinutes}m ago` : ch.status}
                  </FlowStatusBadge>
                </div>
                <div className="text-xs text-g40 mt-0.5">
                  Commission {ch.commission}% · {ch.bookings} bookings · {formatCurrency(ch.revenue)} revenue · MTD
                </div>
              </div>
              <button className="text-xs text-teal hover:text-teal-dark inline-flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" /> Mapping
              </button>
              <button className="text-xs text-g40 hover:text-teal inline-flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> Extranet
              </button>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={ch.active} onChange={() => toggle(ch.id)} className="sr-only peer" />
                <span className="w-11 h-6 bg-g20 rounded-full peer-checked:bg-teal transition relative">
                  <span className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full shadow transition',
                    ch.active ? 'translate-x-5' : ''
                  )} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <header className="mb-4">
            <h3 className="font-display text-lg text-ink dark:text-ivory">Revenue share</h3>
            <p className="text-xs text-g40">MTD share of total revenue</p>
          </header>
          <ul className="space-y-2">
            {REVENUE_SHARE.map((r) => (
              <li key={r.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink dark:text-ivory">{r.name}</span>
                  <span className="text-ink dark:text-ivory font-medium">{r.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ivory dark:bg-panel overflow-hidden">
                  <div className="h-full" style={{ width: `${r.value * 2}%`, background: r.color }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-ink dark:text-ivory">Rate parity alerts</h3>
              <p className="text-xs text-g40">OTA cheaper than Direct · loss of direct share</p>
            </div>
            <FlowStatusBadge tone="warning">{PARITY_ALERTS.length} flagged</FlowStatusBadge>
          </header>
          <ul className="space-y-3">
            {PARITY_ALERTS.map((p, i) => (
              <li key={i} className="rounded-input border border-copper/40 bg-copper-light/30 dark:bg-copper-dark/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-copper mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink dark:text-ivory">{p.channel} · {p.room}</div>
                    <div className="text-xs text-g40 mt-0.5">
                      {p.channel}: <span className="font-bold text-copper">{formatCurrency(p.their)}</span>
                      <span className="mx-1">·</span>
                      Direct: <span className="font-bold">{formatCurrency(p.ours)}</span>
                      <span className="mx-1">·</span>
                      gap {formatCurrency(p.gap)}
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-input bg-teal text-white text-[11px] font-medium">
                    <Check className="h-3 w-3" /> Match
                  </button>
                </div>
              </li>
            ))}
            {PARITY_ALERTS.length === 0 && (
              <li className="text-sm text-g40 italic text-center py-6">All channels in parity 🎉</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
