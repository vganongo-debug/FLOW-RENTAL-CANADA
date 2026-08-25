import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CreditCard, Smartphone, Banknote, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowPaymentModal } from '../../components/flow/FlowPaymentModal'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { COUNTRY_PERFORMANCE, REVENUE_30D } from '../../lib/sampleData'
import { cn, formatCurrency } from '../../lib/utils'

const PAYMENT_METHODS = [
  { method: 'Visa / Mastercard', amount: 142_840, share: 38, color: '#2E503E', icon: CreditCard },
  { method: 'Interac',   amount:  88_220, share: 23, color: '#4E7260', icon: Smartphone },
  { method: 'Apple Pay',       amount:  48_180, share: 13, color: '#AA5830', icon: Smartphone },
  { method: 'Google Pay',             amount:  32_980, share:  9, color: '#8B492A', icon: Smartphone },
  { method: 'Banque Nordia',          amount:  28_640, share:  8, color: '#4F5C54', icon: CreditCard },
  { method: 'Cash',               amount:  33_240, share:  9, color: '#909C92', icon: Banknote },
]

const RECENT_TRANSACTIONS = [
  { id: 'TXN-50441', when: '12:48', client: 'Sarah Bennett',     ref: 'RES-2026001 · Room 102',    method: 'Visa ··· 4242',     amount: 780,   status: 'captured' as const },
  { id: 'TXN-50440', when: '12:32', client: 'Olivier Deschênes',  ref: 'RNT-900101 · Toyota Highlander AWD', method: 'Interac · *0142',  amount: 660,   status: 'captured' as const },
  { id: 'TXN-50439', when: '11:58', client: 'Nord-Côtier Payout', ref: 'Week W18',                  method: 'Bank transfer',     amount: 8_420, status: 'queued'   as const },
  { id: 'TXN-50438', when: '11:42', client: 'Jean-Marc Landry', ref: 'RNT-900102 · Sierra 1500',  method: 'Apple Pay · *3380',    amount: 550,   status: 'captured' as const },
  { id: 'TXN-50437', when: '11:10', client: 'Anouk Thériault',       ref: 'RES-2026003 · Executive',   method: 'Google Pay · *2208',    amount: 960,   status: 'failed'   as const },
  { id: 'TXN-50436', when: '10:55', client: 'Pierre Bourque',     ref: 'Walk-in · YBX',       method: 'Cash',              amount: 390,   status: 'captured' as const },
]

const STATUS_TONE = {
  captured: 'active',
  queued: 'pending',
  failed: 'cancelled',
} as const

export default function PaymentsDashboard() {
  const [payOpen, setPayOpen] = useState(false)

  const monthRevenue = COUNTRY_PERFORMANCE.reduce((s, c) => s + c.gross, 0)
  const cashPct = Math.round(PAYMENT_METHODS.find((m) => m.method === 'Cash')!.share)
  const digitalPct = 100 - cashPct

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Flow Pay · Finance</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Payments Dashboard</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">All revenue captured across markets, channels, and methods.</p>
        </div>
        <button
          onClick={() => setPayOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
        >
          <CreditCard className="h-4 w-4" /> Collect payment
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <FlowKPICard label="Revenue · MTD" value={formatCurrency(monthRevenue)} delta={{ pct: 14.2, direction: 'up' }} icon={<TrendingUp className="h-4 w-4" />} />
        <FlowKPICard label="Outstanding AR" value={formatCurrency(27_320)} delta={{ pct: -8.4, direction: 'down' }} hint="Lower is better" accent="copper" />
        <FlowKPICard label="Paid to partners" value={formatCurrency(19_840)} accent="teal" hint="this week" />
        <FlowKPICard label="Net FRG revenue" value={formatCurrency(monthRevenue - 19_840 - 27_320)} delta={{ pct: 16.7, direction: 'up' }} />
        <FlowKPICard label="Cash · digital" value={`${cashPct}% · ${digitalPct}%`} accent="teal" hint="card+momo dominant" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Daily revenue · last 30 days" subtitle="Hotels vs. car rental" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={REVENUE_30D} barCategoryGap={2}>
              <CartesianGrid stroke="#E0F0E7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4F5C54' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4F5C54' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hotels" name="Hotels" fill="#2E503E" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cars" name="Car rental" fill="#AA5830" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Country mix" subtitle="MTD gross revenue">
          <ul className="space-y-3">
            {COUNTRY_PERFORMANCE.filter((c) => c.gross > 0).map((c) => (
              <li key={c.country}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink dark:text-ivory font-medium">{c.country}</span>
                  <span className="text-copper font-display font-bold">{formatCurrency(c.gross)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-ivory dark:bg-panel overflow-hidden">
                  <div className="h-full bg-teal" style={{ width: `${(c.gross / Math.max(...COUNTRY_PERFORMANCE.map((x) => x.gross))) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Payment method mix" subtitle="MTD captured value">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={PAYMENT_METHODS} dataKey="amount" nameKey="method" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {PAYMENT_METHODS.map((m) => <Cell key={m.method} fill={m.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Method breakdown" subtitle="Captured · MTD" className="lg:col-span-2">
          <ul className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.method} className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-input flex items-center justify-center" style={{ background: m.color + '22', color: m.color }}>
                  <m.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink dark:text-ivory font-medium">{m.method}</span>
                    <span className="text-copper font-display font-bold">{formatCurrency(m.amount)}</span>
                  </div>
                  <div className="h-1 mt-1 rounded-full bg-ivory dark:bg-panel overflow-hidden">
                    <div className="h-full" style={{ width: `${m.share}%`, background: m.color }} />
                  </div>
                </div>
                <span className="text-xs text-g40 w-10 text-right">{m.share}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent transactions" subtitle="Live · last 6 movements">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Txn ID','Time','Client','Reference','Method','Amount','Status'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-4 py-2', i === 5 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_TRANSACTIONS.map((t, i) => (
              <tr key={t.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-4 py-2 font-mono text-xs text-ink dark:text-ivory">{t.id}</td>
                <td className="px-4 py-2 text-g40">{t.when}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{t.client}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{t.ref}</td>
                <td className="px-4 py-2 text-ink dark:text-ivory">{t.method}</td>
                <td className="px-4 py-2 text-right text-copper font-display font-bold">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-2">
                  <FlowStatusBadge tone={STATUS_TONE[t.status]} dot>{t.status}</FlowStatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Reconciliation alerts" subtitle="2 items need attention">
        <ul className="space-y-2">
          <li className="flex items-start gap-3 p-3 rounded-input border border-copper/40 bg-copper-light/30 dark:bg-copper-dark/20">
            <AlertCircle className="h-4 w-4 text-copper mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-ink dark:text-ivory text-sm">TXN-50437 · Google Pay payment failed</div>
              <div className="text-xs text-g40 dark:text-g60">Anouk Thériault · $960 · client retry requested</div>
            </div>
            <button className="text-xs text-copper-dark hover:text-copper font-medium inline-flex items-center gap-1">
              Retry <ArrowRight className="h-3 w-3" />
            </button>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-input border border-teal/30 bg-teal-light/40 dark:bg-teal-dark/20">
            <AlertCircle className="h-4 w-4 text-teal mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-ink dark:text-ivory text-sm">FX rate refresh available</div>
              <div className="text-xs text-g40 dark:text-g60">XAF · XOF · UGX · ETB · KES · NGN · ZAR · last sync 4h ago</div>
            </div>
            <button className="text-xs text-teal-dark hover:text-teal font-medium inline-flex items-center gap-1">
              Refresh now <ArrowRight className="h-3 w-3" />
            </button>
          </li>
        </ul>
      </Card>

      <FlowPaymentModal open={payOpen} amount={780} onClose={() => setPayOpen(false)} onConfirm={() => setPayOpen(false)} />
    </div>
  )
}

function Card({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card', className)}>
      <header className="mb-3">
        <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
        {subtitle && <p className="text-xs text-g40 dark:text-g60">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}
