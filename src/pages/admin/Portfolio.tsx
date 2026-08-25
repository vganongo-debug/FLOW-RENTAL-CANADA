import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp, Building2, Car, Users, DollarSign, MapPin } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowMapView } from '../../components/flow/FlowMapView'
import { COUNTRY_PERFORMANCE, REVENUE_30D, VEHICLES } from '../../lib/sampleData'
import { formatCurrency } from '../../lib/utils'

const channelMix = [
  { name: 'Direct / Flow App', value: 38, fill: '#2E503E' },
  { name: 'Booking.com', value: 31, fill: '#4E7260' },
  { name: 'Expedia', value: 14, fill: '#AA5830' },
  { name: 'Walk-in', value: 9, fill: '#8B492A' },
  { name: 'Corporate / UN', value: 8, fill: '#4F5C54' },
]

type CountryRow = (typeof COUNTRY_PERFORMANCE)[number]

const columns: Column<CountryRow>[] = [
  { key: 'country', header: 'Market' },
  { key: 'hotels', header: 'Hotels', align: 'right' },
  { key: 'fleet', header: 'Fleet', align: 'right' },
  {
    key: 'gross', header: 'Gross / mo', align: 'right',
    render: (r) => r.gross ? <span className="text-copper font-display font-bold">{formatCurrency(r.gross)}</span> : <span className="text-g40">—</span>,
  },
  {
    key: 'ebitda', header: 'EBITDA %', align: 'right',
    render: (r) => r.ebitda ? `${r.ebitda.toFixed(1)}%` : '—',
  },
  {
    key: 'status', header: 'Status',
    render: (r) => <FlowStatusBadge tone={r.status === 'Live' ? 'active' : r.status === 'HQ' ? 'info' : 'pending'} dot>{r.status}</FlowStatusBadge>,
  },
]

export default function Portfolio() {
  const { t } = useTranslation()
  const totalRevenue = COUNTRY_PERFORMANCE.reduce((s, c) => s + c.gross, 0)
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">{t('roles.superadmin')} · {t('nav.sections.global')}</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">{t('page.portfolio.title')}</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">{t('page.portfolio.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 text-sm bg-white dark:bg-panel-mid border border-g20/60 rounded-input text-ink dark:text-ivory">
            <option>Last 30 days</option>
            <option>This month</option>
            <option>Q2 2026</option>
            <option>YTD</option>
          </select>
          <button className="px-3 py-2 text-sm rounded-input bg-copper text-white hover:bg-copper-dark font-medium">
            {t('cta.executivePdf')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard
          label={t('kpi.portfolioRevenue')}
          value={formatCurrency(totalRevenue)}
          delta={{ pct: 14.2, direction: 'up' }}
          hint="Hotels + Fleet · all markets"
          accent="copper"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.propertiesLive')}
          value="3"
          delta={{ pct: 0, direction: 'flat' }}
          hint="2 in pilot · 1 HQ"
          accent="teal"
          icon={<Building2 className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.fleetOnPlatform')}
          value="45"
          delta={{ pct: 12.5, direction: 'up' }}
          hint="9 owned · 36 partner"
          accent="teal"
          icon={<Car className="h-4 w-4" />}
        />
        <FlowKPICard
          label={t('kpi.activeMembers')}
          value="2,148"
          delta={{ pct: 28.7, direction: 'up' }}
          hint="Flow Rewards"
          accent="copper"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={t('card.markets')} subtitle="Portfolio map · Canada focus" className="lg:col-span-2">
          <FlowMapView vehicles={VEHICLES} height={340} />
        </Card>
        <Card title={t('card.channelMix')} subtitle="Bookings last 30 days">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {channelMix.map((c) => <Cell key={c.name} fill={c.fill} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={t('card.dailyRevenue')} subtitle="Hotels vs. Car Rental" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={REVENUE_30D} barCategoryGap={2}>
              <CartesianGrid stroke="#E0F0E7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4F5C54' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4F5C54' }} />
              <Tooltip cursor={{ fill: 'rgba(11,110,110,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hotels" name="Hotels" fill="#2E503E" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cars" name="Car Rental" fill="#AA5830" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title={t('card.topPerformer')} subtitle="By gross revenue · MTD">
          <div className="space-y-3">
            {[...COUNTRY_PERFORMANCE].sort((a, b) => b.gross - a.gross).filter(c => c.gross > 0).map((c) => (
              <div key={c.country} className="rounded-card border border-g20/60 p-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-teal-light text-teal flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="font-medium text-ink dark:text-ivory text-sm">{c.country}</div>
                  <div className="text-xs text-g40">EBITDA {c.ebitda.toFixed(1)}%</div>
                </div>
                <div className="font-display font-bold text-copper">{formatCurrency(c.gross)}</div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-teal pt-2">
              <TrendingUp className="h-3.5 w-3.5" /> Blanc-Sablon leads ADR at 179 $/night
            </div>
          </div>
        </Card>
      </div>

      <Card title={t('card.countryPerformance')} subtitle="Drill-down available">
        <FlowDataTable
          data={COUNTRY_PERFORMANCE as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          rowKey={(r) => String(r.country)}
          exportFilename="portfolio-countries.csv"
        />
      </Card>
    </div>
  )
}

function Card({
  title,
  subtitle,
  children,
  className,
}: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card ${className ?? ''}`}>
      <header className="mb-4">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}
