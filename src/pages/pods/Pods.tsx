import { useMemo, useState } from 'react'
import { DoorClosed, Wifi, DollarSign, Activity, Clock } from 'lucide-react'
import { FlowKPICard } from '../../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../../components/flow/FlowStatusBadge'
import { FlowDataTable, type Column } from '../../components/flow/FlowDataTable'
import {
  PODS, POD_SESSIONS, POD_TARIFF, POD_STATUS_LABEL, POD_STATUS_TONE,
  CHANNEL_LABEL, type Pod, type PodSession,
} from '../../lib/pods'
import { SERVICE_STATIONS, stationByCode, formatCad } from '../../lib/canada'

export default function Pods() {
  const [station, setStation] = useState<'all' | string>('all')

  const pods = useMemo(
    () => (station === 'all' ? PODS : PODS.filter((p) => p.stationCode === station)),
    [station]
  )
  const sessions = useMemo(
    () => (station === 'all' ? POD_SESSIONS : POD_SESSIONS.filter((s) => s.stationCode === station)),
    [station]
  )

  const stats = useMemo(() => {
    const online = pods.filter((p) => p.status !== 'offline')
    const occupied = pods.filter((p) => p.status === 'occupied').length
    const revenue = sessions.reduce((s, x) => s + x.amountCad, 0)
    const occ = online.length ? occupied / online.length : 0
    return { pods: online.length, sessions: sessions.length, revenue, occ }
  }, [pods, sessions])

  const podCols: Column<Pod>[] = [
    { key: 'label', header: 'Pod', sortable: true,
      render: (p) => <span className="font-medium text-ink dark:text-ivory">{p.label}</span> },
    { key: 'stationCode', header: 'Station', sortable: true,
      render: (p) => `${p.stationCode} · ${stationByCode(p.stationCode)?.name ?? ''}` },
    { key: 'starlink', header: 'Starlink', align: 'center',
      render: (p) => p.starlink
        ? <Wifi className="h-4 w-4 text-teal inline" />
        : <span className="text-g40">—</span> },
    { key: 'status', header: 'État', sortable: true,
      render: (p) => <FlowStatusBadge tone={POD_STATUS_TONE[p.status]} dot>{POD_STATUS_LABEL[p.status]}</FlowStatusBadge> },
  ]

  const sessionCols: Column<PodSession>[] = [
    { key: 'startedAt', header: 'Début', sortable: true,
      render: (s) => new Date(s.startedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) },
    { key: 'stationCode', header: 'Station', render: (s) => s.stationCode },
    { key: 'podId', header: 'Pod', render: (s) => s.podId.split('-').pop() ? `Pod ${s.podId.split('-').pop()}` : s.podId },
    { key: 'durationMin', header: 'Durée', align: 'right', sortable: true, render: (s) => `${s.durationMin} min` },
    { key: 'channel', header: 'Canal', render: (s) => CHANNEL_LABEL[s.channel] },
    { key: 'amountCad', header: 'Montant', align: 'right', sortable: true, render: (s) => formatCad(s.amountCad) },
    { key: 'status', header: 'Statut', render: (s) => (
      <FlowStatusBadge tone={s.status === 'active' ? 'info' : 'completed'}>
        {s.status === 'active' ? 'En cours' : 'Terminée'}
      </FlowStatusBadge>
    ) },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ivory">Pods d'isolement</h1>
          <p className="text-sm text-g40 dark:text-g60">
            Cabines acoustiques connectées (Starlink) · réservation à la demi-heure
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
        <FlowKPICard label="Pods en service" value={stats.pods} accent="teal" icon={<DoorClosed className="h-5 w-5" />} />
        <FlowKPICard label="Sessions aujourd'hui" value={stats.sessions} accent="copper" icon={<Activity className="h-5 w-5" />} />
        <FlowKPICard label="Revenu du jour" value={formatCad(stats.revenue)} accent="ink" icon={<DollarSign className="h-5 w-5" />} />
        <FlowKPICard label="Taux d'occupation" value={`${Math.round(stats.occ * 100)} %`} accent="teal" icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Grille tarifaire */}
      <div className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5">
        <div className="label-caps text-g40 dark:text-g60 mb-3">Grille tarifaire</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: '30 minutes', v: formatCad(POD_TARIFF.thirtyMin) },
            { l: '1 heure', v: formatCad(POD_TARIFF.oneHour) },
            { l: 'Tranche +30 min', v: `+ ${formatCad(POD_TARIFF.extraHalfHour)}` },
            { l: 'Dépôt (remboursable)', v: formatCad(POD_TARIFF.deposit) },
          ].map((x) => (
            <div key={x.l}>
              <div className="font-display text-2xl font-bold text-copper">{x.v}</div>
              <div className="text-xs text-g40 dark:text-g60">{x.l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-ivory">État des pods</h2>
        <FlowDataTable
          data={pods as unknown as Record<string, unknown>[]}
          columns={podCols as unknown as Column<Record<string, unknown>>[]}
          rowKey={(p) => (p as unknown as Pod).id}
          pageSize={12}
          exportFilename="pods.csv"
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-ivory">Sessions du jour</h2>
        <FlowDataTable
          data={sessions as unknown as Record<string, unknown>[]}
          columns={sessionCols as unknown as Column<Record<string, unknown>>[]}
          rowKey={(s) => (s as unknown as PodSession).id}
          pageSize={10}
          exportFilename="pod-sessions.csv"
        />
      </section>
    </div>
  )
}
