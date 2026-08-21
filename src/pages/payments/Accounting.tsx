import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Globe, Download, FileText, Plus } from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'
import { FlowKPICard } from '../../components/flow/FlowKPICard'

import { AFRICA, MARKET_STATUS } from '../../lib/africa'

// Show live and pilot markets in the picker; operators can extend by adding entries to MARKET_STATUS.
const COUNTRY_CODES = Object.keys(MARKET_STATUS) as string[]

const TAX_BY_MONTH = (rate: number) => Array.from({ length: 6 }, (_, i) => {
  const base = 80_000 + i * 12_000 + Math.round(Math.sin(i) * 8000)
  return {
    month: ['Jan','Feb','Mar','Apr','May','Jun'][i],
    taxable: base,
    tax: Math.round(base * (rate / 100)),
  }
})

const CHART_OF_ACCOUNTS = [
  { code: '4000', name: 'Room revenue',          type: 'Revenue', mtd: 248_320 },
  { code: '4100', name: 'Car rental revenue',    type: 'Revenue', mtd: 162_180 },
  { code: '4200', name: 'F&B revenue',           type: 'Revenue', mtd:  38_440 },
  { code: '4300', name: 'Add-ons revenue',       type: 'Revenue', mtd:  16_120 },
  { code: '5000', name: 'Cost of goods sold',    type: 'Expense', mtd:  82_140 },
  { code: '6000', name: 'Salaries & wages',      type: 'Expense', mtd:  68_220 },
  { code: '6100', name: 'Utilities',             type: 'Expense', mtd:  18_440 },
  { code: '6200', name: 'Partner commissions',   type: 'Expense', mtd:  19_840 },
  { code: '2200', name: 'Output VAT payable',    type: 'Liability', mtd: 64_420 },
  { code: '1200', name: 'Accounts receivable',   type: 'Asset',   mtd:  27_320 },
]

export default function Accounting() {
  const [country, setCountry] = useState<string>('UG')
  const c = AFRICA.find((x) => x.code === country) ?? AFRICA.find((x) => x.code === 'UG')!
  const monthly = TAX_BY_MONTH(c.taxRate)
  const totalTaxable = monthly.reduce((s, m) => s + m.taxable, 0)
  const totalTax = monthly.reduce((s, m) => s + m.tax, 0)

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Flow Pay · Accounting & Tax</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Accounting & Tax</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">Per-country tax rules · chart of accounts · authority-ready exports</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-input border border-g20/60 bg-white dark:bg-panel-mid text-sm">
          <Globe className="h-4 w-4 text-g40" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-transparent focus:outline-none text-ink dark:text-ivory"
          >
            <optgroup label="Operating markets">
              {COUNTRY_CODES.map((code) => {
                const c = AFRICA.find((x) => x.code === code)
                if (!c) return null
                return <option key={code} value={code}>{c.flag} {c.name}</option>
              })}
            </optgroup>
            <optgroup label="All African countries">
              {AFRICA.filter((x) => !COUNTRY_CODES.includes(x.code)).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </header>

      {/* Country tax card */}
      <section className="rounded-card overflow-hidden bg-coal text-ivory">
        <div className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="label-caps text-copper-light">Tax rule · {c.name}</div>
            <h2 className="font-display text-3xl mt-1">{c.flag} {c.taxName} <span className="text-copper">{c.taxRate}%</span></h2>
            <p className="text-sm text-g80 mt-1">Filed monthly with <span className="font-medium text-ivory">{c.authority}</span> · {c.exportFormat} · {c.primaryCurrency}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-card border border-g20/30 bg-panel-mid/40 backdrop-blur-sm p-3 min-w-[120px]">
              <div className="font-display font-bold text-2xl text-copper">{formatCurrency(totalTaxable)}</div>
              <div className="text-[10px] text-g60 label-caps">Taxable · YTD</div>
            </div>
            <div className="rounded-card border border-g20/30 bg-panel-mid/40 backdrop-blur-sm p-3 min-w-[120px]">
              <div className="font-display font-bold text-2xl text-copper">{formatCurrency(totalTax)}</div>
              <div className="text-[10px] text-g60 label-caps">Tax remittable</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Output tax · MTD" value={formatCurrency(monthly[monthly.length - 1].tax)} delta={{ pct: 8.4, direction: 'up' }} accent="copper" />
        <FlowKPICard label="Input tax credits" value={formatCurrency(11_840)} accent="teal" />
        <FlowKPICard label="Net payable" value={formatCurrency(monthly[monthly.length - 1].tax - 11_840)} hint="due 20th" />
        <FlowKPICard label="Filing status" value="On track" accent="teal" hint="Last filed Apr" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={`${c.taxName} collected · 6 months`} subtitle={`${c.name} · taxable revenue and tax payable`} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid stroke="#E0F2F2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5A7070' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5A7070' }} />
              <Tooltip />
              <Bar dataKey="taxable" name="Taxable revenue" fill="#0B6E6E" radius={[2, 2, 0, 0]} />
              <Bar dataKey="tax" name={`${c.taxName} payable`} fill="#B87333" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Authority exports" subtitle="One click · authority-ready">
          <div className="space-y-2">
            <ExportRow format={c.exportFormat} desc={`Monthly ${c.taxName} return · ${c.authority}`} primary />
            <ExportRow format="XBRL" desc="Financial statements · IFRS" />
            <ExportRow format="ledger.csv" desc="General ledger · all transactions" />
            <ExportRow format="payroll.csv" desc="Staff payments · current period" />
          </div>
        </Card>
      </div>

      <Card title="Chart of accounts" subtitle="Standard hospitality COA · editable">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['Code','Account','Type','MTD balance','Actions'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 3 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHART_OF_ACCOUNTS.map((a, i) => (
              <tr key={a.code} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 font-mono text-xs text-ink dark:text-ivory">{a.code}</td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{a.name}</td>
                <td className="px-3 py-2"><span className={cn('text-xs label-caps px-2 py-0.5 rounded-badge',
                  a.type === 'Revenue' ? 'bg-teal-light text-teal-dark' :
                  a.type === 'Expense' ? 'bg-copper-light text-copper-dark' :
                  a.type === 'Asset' ? 'bg-teal text-white' :
                  'bg-g20/40 text-g80'
                )}>{a.type}</span></td>
                <td className="px-3 py-2 text-right text-copper font-display font-bold">{formatCurrency(a.mtd)}</td>
                <td className="px-3 py-2">
                  <button className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-4 inline-flex items-center gap-1 px-3 py-2 rounded-input border border-g20 text-sm text-ink dark:text-ivory hover:border-teal">
          <Plus className="h-4 w-4" /> Add account
        </button>
      </Card>
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

function ExportRow({ format, desc, primary }: { format: string; desc: string; primary?: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-input border',
      primary ? 'border-teal/40 bg-teal-light/40 dark:bg-teal-dark/20' : 'border-g20/60 bg-ivory dark:bg-panel'
    )}>
      <FileText className={cn('h-4 w-4 shrink-0', primary ? 'text-teal' : 'text-g40')} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink dark:text-ivory">{format}</div>
        <div className="text-[11px] text-g40">{desc}</div>
      </div>
      <button className="p-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:border-teal" title="Download">
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
