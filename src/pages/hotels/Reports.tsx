import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileSpreadsheet, FileText, ChevronRight, Calendar } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'

const REPORTS = [
  { id: 'occupancy', title: 'Occupancy Report',     desc: 'Daily rooms sold, occupancy %, ADR, RevPAR' },
  { id: 'revenue',   title: 'Revenue Report',       desc: 'Room + add-ons + F&B revenue with VAT split' },
  { id: 'channel',   title: 'Channel Report',       desc: 'Bookings and revenue by distribution channel' },
  { id: 'origin',    title: 'Guest Nationality',    desc: 'Origin mix · top-10 markets · arrival count' },
  { id: 'hkprod',    title: 'Housekeeping Productivity', desc: 'Avg cleaning minutes per room · per staff' },
  { id: 'ar',        title: 'AR Aging',             desc: 'Outstanding receivables · 0–30 / 31–60 / 60+' },
] as const

type ReportId = typeof REPORTS[number]['id']

const OCCUPANCY_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 70 + Math.round(Math.sin(i / 4) * 12) + (i > 22 ? 6 : 0)
  return {
    day: i + 1,
    occupancy: Math.min(98, base + (i % 6)),
    adr: 110 + (i % 5) * 6 + (i > 20 ? 12 : 0),
    revpar: 0, // computed below
  }
}).map((d) => ({ ...d, revpar: Math.round((d.occupancy / 100) * d.adr) }))

const CHANNEL_DATA = [
  { name: 'Direct / Flow App', bookings: 142, revenue: 38_400, fill: '#0B6E6E' },
  { name: 'Booking.com',       bookings: 118, revenue: 31_220, fill: '#0D8888' },
  { name: 'Expedia',           bookings:  52, revenue: 14_180, fill: '#B87333' },
  { name: 'Walk-in',           bookings:  34, revenue:  9_080, fill: '#7A4B20' },
  { name: 'Corporate / UN',    bookings:  28, revenue: 12_950, fill: '#5A7070' },
]

const NATIONALITIES = [
  { country: 'Québec',                 arrivals: 142, fill: '#0B6E6E' },
  { country: 'Terre-Neuve-et-Labrador', arrivals:  88, fill: '#0D8888' },
  { country: 'Ontario',                arrivals:  62, fill: '#B87333' },
  { country: 'France',                 arrivals:  41, fill: '#0B6E6E' },
  { country: 'United States',          arrivals:  38, fill: '#0D8888' },
  { country: 'Nouveau-Brunswick',      arrivals:  31, fill: '#B87333' },
  { country: 'Nouvelle-Écosse',        arrivals:  28, fill: '#0B6E6E' },
  { country: 'United Kingdom',         arrivals:  19, fill: '#7A4B20' },
  { country: 'Alberta',                arrivals:  17, fill: '#5A7070' },
  { country: 'Colombie-Britannique',   arrivals:  14, fill: '#0D8888' },
]

const AR_AGING = [
  { bucket: '0–30 days',  amount: 18_400 },
  { bucket: '31–60 days', amount:  6_140 },
  { bucket: '60+ days',   amount:  2_780 },
]

export default function HotelReports() {
  const [report, setReport] = useState<ReportId>('occupancy')
  const [range, setRange] = useState('30')

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Hotels · Reports</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Hotel Reports</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Six standard reports · export to CSV or PDF</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-input border border-g20/60 bg-white dark:bg-panel-mid text-sm text-ink dark:text-ivory">
            <Calendar className="h-4 w-4 text-g40" />
            <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-transparent focus:outline-none">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Q2 2026</option>
              <option value="ytd">YTD</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <FileText className="h-4 w-4" /> PDF
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
          <header className="px-4 py-3 border-b border-g20/60">
            <h3 className="label-caps text-g40">Report type</h3>
          </header>
          <ul className="divide-y divide-g20/40">
            {REPORTS.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setReport(r.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-2 transition',
                    report === r.id ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-ivory text-sm">{r.title}</div>
                    <div className="text-[11px] text-g40 dark:text-g60 mt-0.5">{r.desc}</div>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 shrink-0 mt-0.5', report === r.id ? 'text-teal' : 'text-g40')} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-4">
          {report === 'occupancy' && <OccupancyReport />}
          {report === 'revenue' && <RevenueReport />}
          {report === 'channel' && <ChannelReport />}
          {report === 'origin' && <OriginReport />}
          {report === 'hkprod' && <HKReport />}
          {report === 'ar' && <ARReport />}
        </section>
      </div>
    </div>
  )
}

function ReportShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
      <header className="mb-4">
        <h2 className="font-display text-xl text-ink dark:text-ivory">{title}</h2>
        <p className="text-sm text-g40 dark:text-g60">{subtitle}</p>
      </header>
      {children}
    </div>
  )
}

function OccupancyReport() {
  const avgOcc = Math.round(OCCUPANCY_30D.reduce((s, d) => s + d.occupancy, 0) / OCCUPANCY_30D.length)
  const avgADR = Math.round(OCCUPANCY_30D.reduce((s, d) => s + d.adr, 0) / OCCUPANCY_30D.length)
  const avgRevPAR = Math.round(OCCUPANCY_30D.reduce((s, d) => s + d.revpar, 0) / OCCUPANCY_30D.length)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Avg occupancy" value={`${avgOcc}%`} delta={{ pct: 5.2, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Avg ADR" value={formatCurrency(avgADR)} delta={{ pct: 3.1, direction: 'up' }} />
        <FlowKPICard label="Avg RevPAR" value={formatCurrency(avgRevPAR)} delta={{ pct: 8.4, direction: 'up' }} />
      </div>
      <ReportShell title="Occupancy & ADR · last 30 days" subtitle="Daily occupancy % overlaid with ADR">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={OCCUPANCY_30D}>
            <CartesianGrid stroke="#E0F2F2" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5A7070' }} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#0B6E6E" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="adr" name="ADR (USD)" stroke="#B87333" strokeWidth={2} strokeDasharray="4 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ReportShell>
      <ReportShell title="Daily detail" subtitle="Click any row to drill into a specific date">
        <div className="overflow-x-auto flow-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Day','Occupancy','ADR','RevPAR'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-4 py-2', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OCCUPANCY_30D.slice(0, 8).map((d, i) => (
                <tr key={d.day} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-4 py-2 text-ink dark:text-ivory">{formatDate(new Date(2026, 4, d.day))}</td>
                  <td className="px-4 py-2 text-right text-ink dark:text-ivory">{d.occupancy}%</td>
                  <td className="px-4 py-2 text-right text-ink dark:text-ivory">{formatCurrency(d.adr)}</td>
                  <td className="px-4 py-2 text-right text-copper font-display font-bold">{formatCurrency(d.revpar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-g40 mt-2 text-center">Showing 8 of 30 days · <button className="text-teal hover:text-teal-dark">Expand</button></div>
      </ReportShell>
    </>
  )
}

function RevenueReport() {
  const data = OCCUPANCY_30D.map((d, i) => ({
    day: d.day,
    rooms: d.revpar * 30,
    fnb: 1200 + (i % 5) * 240,
    addons: 300 + (i % 4) * 90,
  }))
  const totals = {
    rooms: data.reduce((s, d) => s + d.rooms, 0),
    fnb: data.reduce((s, d) => s + d.fnb, 0),
    addons: data.reduce((s, d) => s + d.addons, 0),
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Rooms" value={formatCurrency(totals.rooms)} delta={{ pct: 12.4, direction: 'up' }} hint="ex. tax" />
        <FlowKPICard label="F&B" value={formatCurrency(totals.fnb)} delta={{ pct: 8.2, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Add-ons" value={formatCurrency(totals.addons)} delta={{ pct: -2.1, direction: 'down' }} accent="teal" />
      </div>
      <ReportShell title="Revenue mix · last 30 days" subtitle="Stacked daily revenue by source">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid stroke="#E0F2F2" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <YAxis tick={{ fontSize: 11, fill: '#5A7070' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rooms" stackId="r" name="Rooms" fill="#0B6E6E" radius={[0, 0, 0, 0]} />
            <Bar dataKey="fnb" stackId="r" name="F&B" fill="#0D8888" radius={[0, 0, 0, 0]} />
            <Bar dataKey="addons" stackId="r" name="Add-ons" fill="#B87333" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ReportShell>
    </>
  )
}

function ChannelReport() {
  const totalBookings = CHANNEL_DATA.reduce((s, c) => s + c.bookings, 0)
  const totalRevenue = CHANNEL_DATA.reduce((s, c) => s + c.revenue, 0)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Total bookings" value={`${totalBookings}`} delta={{ pct: 9.1, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Direct share" value={`${Math.round(CHANNEL_DATA[0].bookings / totalBookings * 100)}%`} delta={{ pct: 4.4, direction: 'up' }} hint="Target 45%" />
        <FlowKPICard label="Channel revenue" value={formatCurrency(totalRevenue)} delta={{ pct: 11.6, direction: 'up' }} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ReportShell title="Bookings by channel" subtitle="Share of confirmed bookings">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={CHANNEL_DATA} dataKey="bookings" nameKey="name" innerRadius={60} outerRadius={100}>
                {CHANNEL_DATA.map((c) => <Cell key={c.name} fill={c.fill} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ReportShell>
        <ReportShell title="Revenue & ADR by channel" subtitle="Source of revenue with implied ADR">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Channel','Bookings','Revenue','Implied ADR'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHANNEL_DATA.map((c, i) => (
                <tr key={c.name} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-3 py-2 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.fill }} /><span className="text-ink dark:text-ivory">{c.name}</span></td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{c.bookings}</td>
                  <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(c.revenue)}</td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{formatCurrency(Math.round(c.revenue / c.bookings))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportShell>
      </div>
    </>
  )
}

function OriginReport() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Distinct markets" value="32" delta={{ pct: 6.7, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Top market share" value="29%" hint="Québec" />
        <FlowKPICard label="International share" value="64%" delta={{ pct: 3.2, direction: 'up' }} accent="teal" />
      </div>
      <ReportShell title="Top 10 guest nationalities" subtitle="Arrivals · last 30 days">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={NATIONALITIES} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="#E0F2F2" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <YAxis dataKey="country" type="category" tick={{ fontSize: 11, fill: '#5A7070' }} width={120} />
            <Tooltip />
            <Bar dataKey="arrivals" radius={[0, 3, 3, 0]}>
              {NATIONALITIES.map((n) => <Cell key={n.country} fill={n.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ReportShell>
    </>
  )
}

function HKReport() {
  const staff = [
    { name: 'Marie-Claude Boudreau',     roomsToday: 18, avgMin: 22, qScore: 4.7 },
    { name: 'Simon Lapierre',    roomsToday: 14, avgMin: 26, qScore: 4.6 },
    { name: 'Émilie Tremblay',  roomsToday: 12, avgMin: 19, qScore: 4.9 },
    { name: 'Hugo Cormier',     roomsToday: 10, avgMin: 24, qScore: 4.5 },
  ]
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Rooms cleaned today" value={`${staff.reduce((s, r) => s + r.roomsToday, 0)}`} delta={{ pct: 8.1, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Avg clean time" value={`${Math.round(staff.reduce((s, r) => s + r.avgMin, 0) / staff.length)}m`} delta={{ pct: -2.4, direction: 'down' }} hint="Lower is better" />
        <FlowKPICard label="Quality score" value="4.7 / 5" delta={{ pct: 1.6, direction: 'up' }} accent="teal" />
      </div>
      <ReportShell title="Staff productivity" subtitle="Today · Flow Station Natashquan">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Staff','Rooms cleaned','Avg minutes','Quality (inspector)'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-4 py-2', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={s.name} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-4 py-2 text-ink dark:text-ivory font-medium">{s.name}</td>
                <td className="px-4 py-2 text-right text-ink dark:text-ivory">{s.roomsToday}</td>
                <td className="px-4 py-2 text-right text-ink dark:text-ivory">{s.avgMin}m</td>
                <td className="px-4 py-2 text-right text-copper font-display font-bold">{s.qScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportShell>
    </>
  )
}

function ARReport() {
  const total = AR_AGING.reduce((s, b) => s + b.amount, 0)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {AR_AGING.map((b) => (
          <FlowKPICard
            key={b.bucket}
            label={b.bucket}
            value={formatCurrency(b.amount)}
            accent={b.bucket === '60+ days' ? 'copper' : b.bucket === '31–60 days' ? 'copper' : 'teal'}
            hint={`${Math.round(b.amount / total * 100)}% of AR`}
          />
        ))}
      </div>
      <ReportShell title="AR Aging detail" subtitle="Outstanding invoices by age bucket">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Invoice','Client','Issued','Age','Amount'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-4 py-2', i < 3 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { inv: 'FRG-2026-0418', client: 'Consortium Baie-Nord', issued: '2026-04-22', age: '18 days', amount: 8_240 },
              { inv: 'FRG-2026-0402', client: 'Banque Nordia', issued: '2026-04-08', age: '32 days', amount: 4_120 },
              { inv: 'FRG-2026-0367', client: 'Fonds Nordique de Développement', issued: '2026-02-18', age: '81 days', amount: 2_780 },
              { inv: 'FRG-2026-0395', client: 'Caisse du Littoral', issued: '2026-04-15', age: '25 days', amount: 6_040 },
              { inv: 'FRG-2026-0388', client: 'Groupe Minier Fermont', issued: '2026-04-04', age: '36 days', amount: 2_020 },
            ].map((r, i) => (
              <tr key={r.inv} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-4 py-2 font-mono text-xs text-ink dark:text-ivory">{r.inv}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{r.client}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{formatDate(r.issued)}</td>
                <td className="px-4 py-2 text-right text-ink dark:text-ivory">{r.age}</td>
                <td className="px-4 py-2 text-right text-copper font-display font-bold">{formatCurrency(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportShell>
    </>
  )
}
