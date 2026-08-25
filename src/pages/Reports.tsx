import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, X, FileSpreadsheet, FileText, FileDown, GripVertical, Save, Calendar } from 'lucide-react'
import { cn, formatCurrency } from '../lib/utils'

type Dimension = 'date' | 'country' | 'property' | 'tier' | 'channel' | 'nationality'
type Metric = 'revenue' | 'occupancy' | 'adr' | 'revpar' | 'utilisation' | 'addons'

interface Field<T extends string> { id: T; label: string }

const DIMENSIONS: Field<Dimension>[] = [
  { id: 'date',        label: 'Date' },
  { id: 'country',     label: 'Country' },
  { id: 'property',    label: 'Property' },
  { id: 'tier',        label: 'Vehicle tier' },
  { id: 'channel',     label: 'Booking channel' },
  { id: 'nationality', label: 'Guest nationality' },
]

const METRICS: Field<Metric>[] = [
  { id: 'revenue',     label: 'Revenue' },
  { id: 'occupancy',   label: 'Occupancy %' },
  { id: 'adr',         label: 'ADR' },
  { id: 'revpar',      label: 'RevPAR' },
  { id: 'utilisation', label: 'Fleet utilisation %' },
  { id: 'addons',      label: 'Add-on revenue' },
]

const COUNTRIES = ['Québec', 'Québec', 'Québec']
const COLORS = ['#2E503E', '#AA5830', '#4E7260', '#8B492A', '#4F5C54', '#909C92']

export default function Reports() {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [dimensions, setDimensions] = useState<Dimension[]>(['country'])
  const [metrics, setMetrics] = useState<Metric[]>(['revenue', 'occupancy'])
  const [range, setRange] = useState('30')

  const data = useMemo(() => {
    // Build deterministic synthetic data based on first dimension
    const primary = dimensions[0] ?? 'country'
    const labels =
      primary === 'country'     ? COUNTRIES :
      primary === 'property'    ? ['Blanc-Sablon', 'Natashquan', 'Saint-Augustin'] :
      primary === 'tier'        ? ['Flow GO', 'Flow Drive', 'Flow Terrain', 'Flow Prestige', 'Flow Elite'] :
      primary === 'channel'     ? ['Direct', 'Booking.com', 'Expedia', 'Walk-in', 'Corporate'] :
      primary === 'nationality' ? ['Québécois', 'Québécois', 'French', 'Canadian', 'Canadien', 'British'] :
      ['W14', 'W15', 'W16', 'W17', 'W18']
    return labels.map((label, i) => ({
      label,
      revenue: 60_000 + i * 12_000 + (i % 3) * 4_000,
      occupancy: 60 + (i * 7) % 35,
      adr: 110 + i * 8,
      revpar: 70 + i * 6,
      utilisation: 45 + (i * 9) % 40,
      addons: 8_000 + i * 1_400,
    }))
  }, [dimensions])

  const toggleDimension = (d: Dimension) => {
    setDimensions((cur) => cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d])
  }
  const toggleMetric = (m: Metric) => {
    setMetrics((cur) => cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m])
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Insights · Reports</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Custom Report Builder</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Pick dimensions and metrics · table + chart + export</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <Save className="h-4 w-4" /> Save as preset
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
            <FileText className="h-4 w-4" /> PDF
          </button>
        </div>
      </header>

      <ExecutiveSummary />

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <aside className="space-y-4">
          <FieldBox title="Dimensions" subtitle="Group by">
            <ul className="space-y-1.5">
              {DIMENSIONS.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => toggleDimension(d.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-input border text-sm transition',
                      dimensions.includes(d.id)
                        ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory'
                        : 'border-g20/60 text-ink dark:text-ivory hover:border-teal'
                    )}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-g40" />
                    <span className="flex-1 text-left">{d.label}</span>
                    {dimensions.includes(d.id) && (
                      <span className="ml-auto text-[10px] label-caps text-teal">×{dimensions.indexOf(d.id) + 1}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </FieldBox>

          <FieldBox title="Metrics" subtitle="Measure">
            <ul className="space-y-1.5">
              {METRICS.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => toggleMetric(m.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-input border text-sm transition',
                      metrics.includes(m.id)
                        ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory'
                        : 'border-g20/60 text-ink dark:text-ivory hover:border-teal'
                    )}
                  >
                    <Plus className="h-3.5 w-3.5 text-g40" />
                    <span className="flex-1 text-left">{m.label}</span>
                    {metrics.includes(m.id) && <X className="h-3.5 w-3.5 text-teal" />}
                  </button>
                </li>
              ))}
            </ul>
          </FieldBox>

          <FieldBox title="Filters">
            <label className="block mb-2">
              <span className="label-caps text-g40 block mb-1">Range</span>
              <div className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-input border border-g20/60 bg-ivory dark:bg-panel text-sm">
                <Calendar className="h-3.5 w-3.5 text-g40" />
                <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-transparent w-full focus:outline-none text-ink dark:text-ivory">
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Q2 2026</option>
                  <option value="ytd">YTD</option>
                </select>
              </div>
            </label>
            <label className="block">
              <span className="label-caps text-g40 block mb-1">Country</span>
              <select className="w-full px-3 py-2 rounded-input border border-g20/60 bg-ivory dark:bg-panel text-sm text-ink dark:text-ivory">
                <option>All countries</option>
                <option>Québec</option><option>Québec</option><option>Québec</option>
              </select>
            </label>
          </FieldBox>
        </aside>

        <section className="space-y-4">
          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card">
            <header className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display text-lg text-ink dark:text-ivory">
                  {metrics.map((m) => METRICS.find((x) => x.id === m)?.label).join(' & ')}
                </h3>
                <p className="text-xs text-g40 dark:text-g60">
                  By {dimensions.map((d) => DIMENSIONS.find((x) => x.id === d)?.label).join(' · ')} · last {range === 'ytd' ? 'YTD' : `${range} days`}
                </p>
              </div>
              <div className="inline-flex bg-ivory dark:bg-panel border border-g20/60 rounded-input">
                <button onClick={() => setChartType('bar')} className={cn('px-3 py-1.5 text-xs label-caps', chartType === 'bar' ? 'bg-teal text-white' : 'text-g40')}>Bar</button>
                <button onClick={() => setChartType('line')} className={cn('px-3 py-1.5 text-xs label-caps', chartType === 'line' ? 'bg-teal text-white' : 'text-g40')}>Line</button>
              </div>
            </header>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={data}>
                  <CartesianGrid stroke="#E0F0E7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4F5C54' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4F5C54' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {metrics.map((m, i) => (
                    <Bar key={m} dataKey={m} name={METRICS.find((x) => x.id === m)?.label} radius={[2, 2, 0, 0]}>
                      {data.map((_, di) => <Cell key={di} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  ))}
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid stroke="#E0F0E7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4F5C54' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4F5C54' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {metrics.map((m, i) => (
                    <Line key={m} dataKey={m} name={METRICS.find((x) => x.id === m)?.label} type="monotone" stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
            <header className="px-5 py-3 border-b border-g20/60 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink dark:text-ivory">Data table</h3>
              <button className="inline-flex items-center gap-1 text-xs text-teal hover:text-teal-dark">
                <FileDown className="h-3.5 w-3.5" /> Download
              </button>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal text-white">
                  <th className="label-caps font-semibold px-4 py-2 text-left">{DIMENSIONS.find((d) => d.id === dimensions[0])?.label ?? 'Group'}</th>
                  {metrics.map((m) => (
                    <th key={m} className="label-caps font-semibold px-4 py-2 text-right">{METRICS.find((x) => x.id === m)?.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={d.label} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                    <td className="px-4 py-2 text-ink dark:text-ivory font-medium">{d.label}</td>
                    {metrics.map((m) => (
                      <td key={m} className={cn('px-4 py-2 text-right', m === 'revenue' || m === 'addons' ? 'text-copper font-display font-bold' : 'text-ink dark:text-ivory')}>
                        {m === 'revenue' || m === 'addons' ? formatCurrency(d[m]) :
                          m === 'occupancy' || m === 'utilisation' ? `${d[m]}%` :
                          formatCurrency(d[m])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function ExecutiveSummary() {
  return (
    <section className="rounded-card overflow-hidden bg-coal text-ivory">
      <div className="p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="label-caps text-copper-light">Executive Dashboard · weekly</div>
          <h2 className="font-display text-2xl mt-0.5">Week W18 · ending Friday 15 May</h2>
          <p className="text-sm text-g80 mt-1">One-page summary · auto-emailed to co-founders every Monday 09:00</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Mini label="Portfolio revenue" value={formatCurrency(112_440)} delta="+14.2%" />
          <Mini label="Hotel vs Car" value="62% · 38%" delta="rooms lead" />
          <Mini label="Top market" value="Blanc-Sablon" delta="$184k" />
          <Mini label="Members" value="2,148" delta="+28.7%" />
        </div>
      </div>
      <div className="px-5 py-3 bg-panel border-t border-g20/30 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-g60">Includes occupancy trend, fleet utilisation, outstanding partner payouts, new guests · downloadable as PDF</span>
        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium">
          <FileText className="h-4 w-4" /> Generate Executive PDF
        </button>
      </div>
    </section>
  )
}

function Mini({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-card border border-g20/30 bg-panel-mid/40 backdrop-blur-sm p-3 min-w-[120px]">
      <div className="text-[10px] text-copper-light label-caps">{label}</div>
      <div className="font-display font-bold text-xl">{value}</div>
      <div className="text-[10px] text-g60">{delta}</div>
    </div>
  )
}

function FieldBox({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-4">
      <header className="mb-2">
        <h4 className="label-caps text-g40">{title}</h4>
        {subtitle && <p className="text-[10px] text-g60">{subtitle}</p>}
      </header>
      {children}
    </div>
  )
}
