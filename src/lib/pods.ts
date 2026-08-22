/**
 * Module pods d'isolement connectés.
 *
 * Cabines acoustiques une place installées dans les aires d'attente, avec
 * accès Internet Starlink. Louées à la demi-heure. Un minimum de trois pods
 * par station absorbe l'affluence, concentrée autour des vols.
 *
 * Tarification (régions nordiques) :
 *   30 min ............ 10 $
 *   1 heure ........... 17 $
 *   + 30 min .......... 5 $ par tranche additionnelle
 *   Dépôt d'ouverture . 50 $ (retenu, différence remboursée au départ)
 */

export const POD_TARIFF = {
  thirtyMin: 10,
  oneHour: 17,
  extraHalfHour: 5,
  deposit: 50,
} as const

/** Prix (CAD) pour une durée donnée en minutes. */
export function priceForDuration(minutes: number): number {
  if (minutes <= 30) return POD_TARIFF.thirtyMin
  if (minutes <= 60) return POD_TARIFF.oneHour
  const extraHalves = Math.ceil((minutes - 60) / 30)
  return POD_TARIFF.oneHour + extraHalves * POD_TARIFF.extraHalfHour
}

export type PodStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'offline'

export interface Pod {
  id: string
  stationCode: string
  label: string
  status: PodStatus
  starlink: boolean
}

export type SessionChannel = 'app' | 'kiosk' | 'walk_in'
export type SessionStatus = 'active' | 'completed'

export interface PodSession {
  id: string
  podId: string
  stationCode: string
  /** Heure de début (ISO) */
  startedAt: string
  durationMin: number
  amountCad: number
  channel: SessionChannel
  status: SessionStatus
}

/** Trois pods par station pilote de la Basse-Côte-Nord. */
export const PODS: Pod[] = [
  { id: 'POD-YBX-1', stationCode: 'YBX', label: 'Pod 1', status: 'occupied',  starlink: true },
  { id: 'POD-YBX-2', stationCode: 'YBX', label: 'Pod 2', status: 'available', starlink: true },
  { id: 'POD-YBX-3', stationCode: 'YBX', label: 'Pod 3', status: 'reserved',  starlink: true },
  { id: 'POD-YNA-1', stationCode: 'YNA', label: 'Pod 1', status: 'available', starlink: true },
  { id: 'POD-YNA-2', stationCode: 'YNA', label: 'Pod 2', status: 'occupied',  starlink: true },
  { id: 'POD-YNA-3', stationCode: 'YNA', label: 'Pod 3', status: 'cleaning',  starlink: true },
  { id: 'POD-YIF-1', stationCode: 'YIF', label: 'Pod 1', status: 'available', starlink: true },
  { id: 'POD-YIF-2', stationCode: 'YIF', label: 'Pod 2', status: 'available', starlink: true },
  { id: 'POD-YIF-3', stationCode: 'YIF', label: 'Pod 3', status: 'offline',   starlink: false },
  { id: 'POD-YHR-1', stationCode: 'YHR', label: 'Pod 1', status: 'available', starlink: true },
  { id: 'POD-YHR-2', stationCode: 'YHR', label: 'Pod 2', status: 'occupied',  starlink: true },
  { id: 'POD-YHR-3', stationCode: 'YHR', label: 'Pod 3', status: 'available', starlink: true },
]

/** Sessions du jour (échantillon). */
export const POD_SESSIONS: PodSession[] = [
  { id: 'PS-1', podId: 'POD-YBX-1', stationCode: 'YBX', startedAt: '2026-07-31T08:15:00', durationMin: 90,  amountCad: 22, channel: 'app',     status: 'active' },
  { id: 'PS-2', podId: 'POD-YBX-3', stationCode: 'YBX', startedAt: '2026-07-31T09:00:00', durationMin: 30,  amountCad: 10, channel: 'kiosk',   status: 'completed' },
  { id: 'PS-3', podId: 'POD-YBX-2', stationCode: 'YBX', startedAt: '2026-07-31T07:40:00', durationMin: 60,  amountCad: 17, channel: 'app',     status: 'completed' },
  { id: 'PS-4', podId: 'POD-YNA-2', stationCode: 'YNA', startedAt: '2026-07-31T10:05:00', durationMin: 120, amountCad: 27, channel: 'walk_in', status: 'active' },
  { id: 'PS-5', podId: 'POD-YNA-1', stationCode: 'YNA', startedAt: '2026-07-31T06:50:00', durationMin: 30,  amountCad: 10, channel: 'app',     status: 'completed' },
  { id: 'PS-6', podId: 'POD-YHR-2', stationCode: 'YHR', startedAt: '2026-07-31T11:10:00', durationMin: 60,  amountCad: 17, channel: 'kiosk',   status: 'active' },
  { id: 'PS-7', podId: 'POD-YIF-1', stationCode: 'YIF', startedAt: '2026-07-31T08:30:00', durationMin: 30,  amountCad: 10, channel: 'app',     status: 'completed' },
]

export const POD_STATUS_LABEL: Record<PodStatus, string> = {
  available: 'Disponible',
  occupied: 'Occupé',
  reserved: 'Réservé',
  cleaning: 'Nettoyage',
  offline: 'Hors service',
}

export const POD_STATUS_TONE: Record<PodStatus, 'active' | 'pending' | 'info' | 'warning' | 'cancelled'> = {
  available: 'active',
  occupied: 'info',
  reserved: 'pending',
  cleaning: 'warning',
  offline: 'cancelled',
}

export const CHANNEL_LABEL: Record<SessionChannel, string> = {
  app: 'Application',
  kiosk: 'Kiosque',
  walk_in: 'Sur place',
}
