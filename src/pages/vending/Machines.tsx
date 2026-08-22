import { useMemo, useState } from 'react'
import { Boxes, AlertTriangle, DollarSign, Gauge } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import {
  VENDING_MACHINES, fillRate, isSlotLow,
  MACHINE_STATUS_LABEL, MACHINE_STATUS_TONE, type VendingMachine,
} from '../../lib/vending'
import { SERVICE_STATIONS, stationByCode, formatCad } from '../../lib/canada'

type Row = VendingMachine & { fill: number; lowSlots: number; station: string }

export default function Machines() {
  const [station, setStation] = useState<'all' | string>('all')

  const rows: Row[] = useMemo(() => {
    return VENDING_MACHINES.filter((m) => station === 'all' || m.stationCode === station).map((m) => ({
      ...m,
      fill: Math.round(fillRate(m) * 100),
      lowSlots: m.slots.filter(isSlotLow).length,
      station: `${m.stationCode} · ${stationByCode(m.stationCode)?.name ?? ''}`,
    }))
  }, [station])

  const stats = useMemo(() => {
    const all = VENDING_MACHINES
    const active = all.filter((m) => m.status === 'active').length
    const alerts = all.filter((m) => m.status === 'low_stock' || m.slots.some(isSlotLow)).length
    const sales = all.reduce((s, m) => s + m.salesTodayCad, 0)
    const avgFill = all.length ? all.reduce((s, m) => s + fillRate(m), 0) / all.length : 0
    return { active, alerts, sales, avgFill }
  }, [])

  const cols: Column<Row>[] = [
    { key: 'id', header: 'Machine', sortable: true,
      render: (m) => <span className="font-medium text-ink dark:text-ivory">{m.id}</span> },
    { key: 'station', header: 'Station', sortable: true },
    { key: 'model', header: 'Modèle' },
    { key: 'fill', header: 'Remplissage', align: 'right', sortable: true,
      render: (m) => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 rounded-full bg-g20/60 overflow-hidden">
            <div className={m.fill <= 35 ? 'h-full bg-copper' : 'h-full bg-teal'} style={{ width: `${m.fill}%` }} />
          </div>
          <span className="tabular-nums text-xs w-9 text-right">{m.fill}%</span>
        </div>
      ) },
    { key: 'lowSlots', header: 'Empl. bas', align: 'right', sortable: true,
      render: (m) => m.lowSlots > 0
        ? <span className="text-copper font-medium">{m.lowSlots}</span>
        : <span className="text-g40">0</span> },
    { key: 'salesTodayCad', header: 'Ventes du jour', align: 'right', sortable: true,
      render: (m) => formatCad(m.salesTodayCad) },
    { key: 'status', header: 'État', sortable: true,
      render: (m) => <FlowStatusBadge tone={MACHINE_STATUS_TONE[m.status]} dot>{MACHINE_STATUS_LABEL[m.status]}</FlowStatusBadge> },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ivory">Distributrices</h1>
          <p className="text-sm text-g40 dark:text-g60">
            Boissons, sandwichs et collations · réapprovisionnées depuis le hub de Montréal
          </p>
        </div>
        <select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          className="rounded-input border border-g20/60 bg-white dark:bg-panel-mid px-3 py-1.5 text-sm"
        >
          <option value="all">Toutes les stations</option>
          {SERVICE_STATIONS.map((s) => (
            <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Machines actives" value={stats.active} accent="teal" icon={<Boxes className="h-5 w-5" />} />
        <FlowKPICard label="Alertes de réassort" value={stats.alerts} accent="copper" icon={<AlertTriangle className="h-5 w-5" />} />
        <FlowKPICard label="Ventes du jour" value={formatCad(stats.sales)} accent="ink" icon={<DollarSign className="h-5 w-5" />} />
        <FlowKPICard label="Remplissage moyen" value={`${Math.round(stats.avgFill * 100)} %`} accent="teal" icon={<Gauge className="h-5 w-5" />} />
      </div>

      <FlowDataTable
        data={rows as unknown as Record<string, unknown>[]}
        columns={cols as unknown as Column<Record<string, unknown>>[]}
        rowKey={(m) => (m as unknown as Row).id}
        pageSize={10}
        exportFilename="distributrices.csv"
      />
    </div>
  )
}
