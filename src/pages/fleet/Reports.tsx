import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calendar, FileSpreadsheet, FileText, ChevronRight, Star } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FLEET_PARTNERS, VEHICLES } from '../../lib/sampleData'

const REPORTS = [
  { id: 'utilisation', title: 'Fleet Utilisation',       desc: 'Rented-out days vs. available across fleet' },
  { id: 'revvehicle',  title: 'Revenue by Vehicle',      desc: 'Per-vehicle revenue ranking · top performers' },
  { id: 'revtier',     title: 'Revenue by Tier',         desc: 'Tier mix · GO / Drive / Terrain / Prestige / Elite' },
  { id: 'addons',      title: 'Add-ons Revenue',         desc: 'CDW / GPS / driver / child seat / late fee' },
  { id: 'drivers',     title: 'Driver Performance',      desc: 'Missions, rating, on-time pickups' },
  { id: 'payouts',     title: 'Partner Payout Summary',  desc: 'Weekly partner payouts · Nord-Côtier and others' },
] as const

type ReportId = typeof REPORTS[number]['id']

const UTILISATION_BY_VEHICLE = VEHICLES.slice(0, 10).map((v, i) => {
  const rentedDays = Math.min(28, 10 + ((i * 17) % 20))
  return {
    label: `${v.plate}`,
    rentedDays,
    pct: Math.round(rentedDays / 28 * 100),
    fill: v.owner === 'flow' ? '#0B6E6E' : '#B87333',
  }
})

const UTILISATION_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  utilisation: 50 + Math.round(Math.sin(i / 4) * 12) + (i > 22 ? 8 : 0),
}))

const TIER_REV = [
  { tier: 'Flow GO',       revenue:  6_120, fill: '#0D8888' },
  { tier: 'Flow Drive',    revenue: 14_440, fill: '#0B6E6E' },
  { tier: 'Flow Terrain',  revenue: 18_220, fill: '#7A4B20' },
  { tier: 'Flow Prestige', revenue: 23_180, fill: '#B87333' },
  { tier: 'Flow Elite',    revenue: 29_640, fill: '#0C1A1A' },
]

const ADDONS = [
  { addon: 'CDW Insurance',     revenue: 9_840, attach: 78 },
  { addon: 'GPS / Wi-Fi',       revenue: 3_120, attach: 42 },
  { addon: 'Additional driver', revenue: 1_440, attach: 18 },
  { addon: 'Child seat',        revenue:   720, attach: 11 },
  { addon: 'Late return fees',  revenue: 1_180, attach:  9 },
]

const DRIVER_PERF = [
  { driver: 'Simon Lapierre',    missions: 14, rating: 4.9, onTime: 98 },
  { driver: 'Mathieu Tremblay',   missions: 13, rating: 4.7, onTime: 96 },
  { driver: 'Hugo Cormier',     missions: 11, rating: 4.8, onTime: 99 },
  { driver: 'Thomas Bérubé',   missions:  9, rating: 4.8, onTime: 95 },
  { driver: 'Marie-Claude Boudreau',     missions:  8, rating: 4.9, onTime: 100 },
]

export default function FleetReports() {
  const [report, setReport] = useState<ReportId>('utilisation')
  const [range, setRange] = useState('30')

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Fleet · Reports</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Fleet Reports</h1>
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
          {report === 'utilisation' && <UtilisationReport />}
          {report === 'revvehicle' && <VehicleRevenueReport />}
          {report === 'revtier' && <TierRevenueReport />}
          {report === 'addons' && <AddonsReport />}
          {report === 'drivers' && <DriversReport />}
          {report === 'payouts' && <PayoutsReport />}
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

function UtilisationReport() {
  const avg = Math.round(UTILISATION_TREND.reduce((s, d) => s + d.utilisation, 0) / UTILISATION_TREND.length)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Avg utilisation" value={`${avg}%`} delta={{ pct: 4.8, direction: 'up' }} accent="teal" />
        <FlowKPICard label="Peak day" value="78%" hint="Day 27 · Friday" />
        <FlowKPICard label="Idle days" value="42" delta={{ pct: -8.1, direction: 'down' }} hint="Lower is better" accent="copper" />
      </div>
      <ReportShell title="Utilisation by vehicle" subtitle="Days on rent / 28 days · teal = Flow, copper = Partner">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={UTILISATION_BY_VEHICLE} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid stroke="#E0F2F2" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#5A7070' }} unit="%" />
            <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#5A7070' }} width={100} />
            <Tooltip />
            <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
              {UTILISATION_BY_VEHICLE.map((u) => <Cell key={u.label} fill={u.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ReportShell>
      <ReportShell title="Utilisation trend · last 30 days" subtitle="Fleet-wide daily utilisation %">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={UTILISATION_TREND}>
            <CartesianGrid stroke="#E0F2F2" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <YAxis tick={{ fontSize: 11, fill: '#5A7070' }} unit="%" />
            <Tooltip />
            <Line type="monotone" dataKey="utilisation" stroke="#0B6E6E" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ReportShell>
    </>
  )
}

function VehicleRevenueReport() {
  const data = VEHICLES.slice(0, 10).map((v, i) => ({
    plate: v.plate,
    vehicle: `${v.make} ${v.model}`,
    tier: v.tier,
    owner: v.owner,
    rentedDays: 10 + ((i * 17) % 20),
    revenue: (10 + ((i * 17) % 20)) * v.dailyRateCad,
  })).sort((a, b) => b.revenue - a.revenue)

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Total fleet revenue" value={formatCurrency(data.reduce((s, d) => s + d.revenue, 0))} delta={{ pct: 11.2, direction: 'up' }} />
        <FlowKPICard label="Top earner" value={data[0].plate} hint={data[0].vehicle} accent="teal" />
        <FlowKPICard label="Avg per vehicle" value={formatCurrency(Math.round(data.reduce((s, d) => s + d.revenue, 0) / data.length))} accent="copper" />
      </div>
      <ReportShell title="Revenue by vehicle" subtitle="Last 30 days · sorted by revenue">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Plate','Vehicle','Tier','Owner','Days rented','Revenue'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 4 || i === 5 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.plate} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{d.plate}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{d.vehicle}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{d.tier}</td>
                <td className="px-3 py-2"><span className={cn('text-xs label-caps px-2 py-0.5 rounded-badge', d.owner === 'flow' ? 'bg-teal-light text-teal-dark' : 'bg-copper-light text-copper-dark')}>{d.owner === 'flow' ? 'Flow' : 'Partner'}</span></td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{d.rentedDays}</td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportShell>
    </>
  )
}

function TierRevenueReport() {
  const total = TIER_REV.reduce((s, t) => s + t.revenue, 0)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Tier revenue" value={formatCurrency(total)} delta={{ pct: 13.4, direction: 'up' }} />
        <FlowKPICard label="Premium share" value={`${Math.round((TIER_REV[3].revenue + TIER_REV[4].revenue) / total * 100)}%`} hint="Prestige + Elite" accent="copper" />
        <FlowKPICard label="Avg per booking" value={formatCurrency(285)} delta={{ pct: 4.1, direction: 'up' }} accent="teal" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ReportShell title="Revenue by tier" subtitle="Donut share of total">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={TIER_REV} dataKey="revenue" nameKey="tier" innerRadius={60} outerRadius={100}>
                {TIER_REV.map((t) => <Cell key={t.tier} fill={t.fill} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ReportShell>
        <ReportShell title="Tier breakdown" subtitle="Revenue and share">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal text-white">
                {['Tier','Revenue','Share'].map((h, i) => (
                  <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIER_REV.map((t, i) => (
                <tr key={t.tier} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-3 py-2 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.fill }} /><span className="text-ink dark:text-ivory">{t.tier}</span></td>
                  <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(t.revenue)}</td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{Math.round(t.revenue / total * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportShell>
      </div>
    </>
  )
}

function AddonsReport() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Add-on revenue" value={formatCurrency(ADDONS.reduce((s, a) => s + a.revenue, 0))} delta={{ pct: 16.3, direction: 'up' }} accent="copper" />
        <FlowKPICard label="Attach rate" value="71%" hint="≥1 add-on per booking" accent="teal" />
        <FlowKPICard label="Avg add-on / booking" value={formatCurrency(58)} delta={{ pct: 4.2, direction: 'up' }} />
      </div>
      <ReportShell title="Add-ons revenue" subtitle="Last 30 days · including attach rate">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ADDONS}>
            <CartesianGrid stroke="#E0F2F2" vertical={false} />
            <XAxis dataKey="addon" tick={{ fontSize: 11, fill: '#5A7070' }} />
            <YAxis tick={{ fontSize: 11, fill: '#5A7070' }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#B87333" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ReportShell>
    </>
  )
}

function DriversReport() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Active drivers" value={`${DRIVER_PERF.length}`} accent="teal" />
        <FlowKPICard label="Avg rating" value={(DRIVER_PERF.reduce((s,d)=>s+d.rating,0) / DRIVER_PERF.length).toFixed(2)} delta={{ pct: 1.6, direction: 'up' }} icon={<Star className="h-4 w-4" />} />
        <FlowKPICard label="On-time pickups" value={`${Math.round(DRIVER_PERF.reduce((s,d)=>s+d.onTime,0) / DRIVER_PERF.length)}%`} delta={{ pct: 2.4, direction: 'up' }} accent="teal" />
      </div>
      <ReportShell title="Driver performance · MTD" subtitle="Missions completed, client rating, on-time pickup %">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Driver','Missions','Rating','On-time'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DRIVER_PERF.map((d, i) => (
              <tr key={d.driver} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 text-ink dark:text-ivory font-medium">{d.driver}</td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{d.missions}</td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{d.rating.toFixed(1)}</td>
                <td className="px-3 py-2 text-right text-ink dark:text-ivory">{d.onTime}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportShell>
    </>
  )
}

function PayoutsReport() {
  const total = FLEET_PARTNERS.reduce((s, p) => s + p.weeklyPayoutCad, 0)
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FlowKPICard label="Total weekly payouts" value={formatCurrency(total)} delta={{ pct: 9.6, direction: 'up' }} accent="copper" />
        <FlowKPICard label="Partners on platform" value={`${FLEET_PARTNERS.length}`} accent="teal" />
        <FlowKPICard label="Avg commission" value="19%" hint="Flow share" />
      </div>
      <ReportShell title="Partner payout summary" subtitle={`Week ending ${formatDate(new Date(2026, 4, 11))}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Partner','Market','Vehicles · Active','Gross','Commission','Net payout'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i >= 2 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FLEET_PARTNERS.map((p, i) => {
              const gross = Math.round(p.weeklyPayoutCad / (1 - p.commissionPct / 100))
              const commission = gross - p.weeklyPayoutCad
              return (
                <tr key={p.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                  <td className="px-3 py-2 text-ink dark:text-ivory font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-ink dark:text-ivory">{p.city}, {p.country}</td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{p.vehiclesActiveOnFlow} / {p.vehiclesCount}</td>
                  <td className="px-3 py-2 text-right text-ink dark:text-ivory">{formatCurrency(gross)}</td>
                  <td className="px-3 py-2 text-right text-g40">−{formatCurrency(commission)} ({p.commissionPct}%)</td>
                  <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(p.weeklyPayoutCad)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ReportShell>
    </>
  )
}
