import { useMemo } from 'react'
import { Truck, PackageCheck } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import { restockList, CATEGORY_LABEL } from '../../lib/vending'
import { stationByCode, formatCad } from '../../lib/canada'

interface Row {
  id: string
  machineId: string
  station: string
  slot: string
  product: string
  category: string
  qty: number
  capacity: number
  refill: number
  costCad: number
}

export default function Restock() {
  const lines = useMemo(() => restockList(), [])

  const rows: Row[] = useMemo(
    () => lines.map((l, i) => ({
      id: `${l.machineId}-${l.slot}-${i}`,
      machineId: l.machineId,
      station: `${l.stationCode} · ${stationByCode(l.stationCode)?.name ?? ''}`,
      slot: l.slot,
      product: l.product.name,
      category: CATEGORY_LABEL[l.product.category],
      qty: l.qty,
      capacity: l.capacity,
      refill: l.refill,
      costCad: l.refill * l.product.costCad,
    })),
    [lines]
  )

  const stats = useMemo(() => {
    const units = rows.reduce((s, r) => s + r.refill, 0)
    const cost = rows.reduce((s, r) => s + r.costCad, 0)
    const stations = new Set(lines.map((l) => l.stationCode)).size
    return { lines: rows.length, units, cost, stations }
  }, [rows, lines])

  const cols: Column<Row>[] = [
    { key: 'station', header: 'Station', sortable: true },
    { key: 'machineId', header: 'Machine', sortable: true },
    { key: 'slot', header: 'Empl.', align: 'center' },
    { key: 'product', header: 'Produit', sortable: true,
      render: (r) => <span className="font-medium text-ink dark:text-ivory">{r.product}</span> },
    { key: 'category', header: 'Catégorie',
      render: (r) => <FlowStatusBadge tone="neutral">{r.category}</FlowStatusBadge> },
    { key: 'qty', header: 'En stock', align: 'right', sortable: true,
      render: (r) => `${r.qty} / ${r.capacity}` },
    { key: 'refill', header: 'À réapprovisionner', align: 'right', sortable: true,
      render: (r) => <span className="font-semibold text-copper">+{r.refill}</span> },
    { key: 'costCad', header: 'Coût réassort', align: 'right', sortable: true,
      render: (r) => formatCad(r.costCad, { cents: true }) },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink dark:text-ivory">Réassort — hub Montréal</h1>
        <p className="text-sm text-g40 dark:text-g60">
          Emplacements sous le seuil · liste d'expédition hebdomadaire par les vols du réseau
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FlowKPICard label="Lignes de réassort" value={stats.lines} accent="copper" icon={<PackageCheck className="h-5 w-5" />} />
        <FlowKPICard label="Unités à expédier" value={stats.units} accent="teal" icon={<Truck className="h-5 w-5" />} />
        <FlowKPICard label="Stations concernées" value={stats.stations} accent="ink" />
        <FlowKPICard label="Coût du réassort" value={formatCad(stats.cost)} accent="ink" />
      </div>

      <FlowDataTable
        data={rows as unknown as Record<string, unknown>[]}
        columns={cols as unknown as Column<Record<string, unknown>>[]}
        rowKey={(r) => (r as unknown as Row).id}
        pageSize={15}
        exportFilename="reassort.csv"
      />
    </div>
  )
}
