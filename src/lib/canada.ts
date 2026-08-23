import { AIRPORTS } from './airports'

/**
 * Réseau canadien — source de vérité géographique de Flow Rentals OS.
 *
 * Deux niveaux :
 *   1. PROVINCES — les 13 provinces et territoires (remplacent l'ancienne
 *      liste continentale). Chacune porte son régime de taxes de
 *      vente, son autorité fiscale et son format d'export comptable.
 *   2. AIRPORTS — le catalogue complet des aéroports canadiens, rattachés
 *      à leur province (voir src/lib/airports.ts, généré depuis une source
 *      ouverte). REGIONAL_AIRPORTS en isole les régionaux ; un
 *      sous-ensemble encore plus restreint constitue le réseau
 *      d'exploitation (« stations ») où Flow déploie pods, véhicules et
 *      distributrices.
 *
 * Le statut de déploiement reflète les phases du plan d'affaires :
 *   live     — station pilote en exploitation (Basse-Côte-Nord)
 *   pilot    — mise en service en cours
 *   prospect — cible de la phase 2 (Côte-Nord + Labrador)
 *   future   — cible de la phase 3 (réseau canadien élargi)
 */

/* ------------------------------------------------------------------ */
/* Provinces et territoires                                            */
/* ------------------------------------------------------------------ */

export type ProvinceCode =
  | 'NL' | 'PE' | 'NS' | 'NB'
  | 'QC' | 'ON'
  | 'MB' | 'SK' | 'AB'
  | 'BC'
  | 'YT' | 'NT' | 'NU'

export type ProvinceRegion = 'Atlantique' | 'Centre' | 'Prairies' | 'Ouest' | 'Nord'

export type DeploymentStatus = 'live' | 'pilot' | 'prospect' | 'future'

export interface Province {
  /** Code à deux lettres (ISO 3166-2:CA sans le préfixe) */
  code: ProvinceCode
  /** Nom français — nom d'affichage par défaut */
  name: string
  nameEn: string
  capital: string
  region: ProvinceRegion
  primaryLanguage: 'FR' | 'EN' | 'BIL'
  /** Toutes les provinces règlent en dollars canadiens */
  primaryCurrency: 'CAD'
  /** Taxe de vente applicable et son taux combiné, en pourcentage */
  taxName: string
  /** Désignation anglaise de la même taxe (GST/HST/PST/RST/QST) */
  taxNameEn: string
  taxRate: number
  authority: string
  exportFormat: string
}

/**
 * Taux de taxe de vente combinés (TPS fédérale 5 % + taxe provinciale).
 * Valeurs de référence servant de valeur par défaut dans les formulaires —
 * les opérateurs peuvent les remplacer par province.
 */
export const PROVINCES: Province[] = [
  { code: 'AB', name: 'Alberta',                   nameEn: 'Alberta',                   capital: 'Edmonton',      region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS', taxNameEn: 'GST',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'BC', name: 'Colombie-Britannique',      nameEn: 'British Columbia',          capital: 'Victoria',      region: 'Ouest',      primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVP', taxNameEn: 'GST + PST', taxRate: 12,     authority: 'ARC + BC Ministry of Finance', exportFormat: 'ARC-TPS-PST' },
  { code: 'MB', name: 'Manitoba',                  nameEn: 'Manitoba',                  capital: 'Winnipeg',      region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVD', taxNameEn: 'GST + RST', taxRate: 12,     authority: 'ARC + Manitoba Finance',       exportFormat: 'ARC-TPS-RST' },
  { code: 'NB', name: 'Nouveau-Brunswick',         nameEn: 'New Brunswick',             capital: 'Fredericton',   region: 'Atlantique', primaryLanguage: 'BIL', primaryCurrency: 'CAD', taxName: 'TVH', taxNameEn: 'HST',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NL', name: 'Terre-Neuve-et-Labrador',   nameEn: 'Newfoundland and Labrador', capital: 'St. John’s',    region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH', taxNameEn: 'HST',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NS', name: 'Nouvelle-Écosse',           nameEn: 'Nova Scotia',               capital: 'Halifax',       region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH', taxNameEn: 'HST',       taxRate: 14,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NT', name: 'Territoires du Nord-Ouest', nameEn: 'Northwest Territories',     capital: 'Yellowknife',   region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS', taxNameEn: 'GST',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'NU', name: 'Nunavut',                   nameEn: 'Nunavut',                   capital: 'Iqaluit',       region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS', taxNameEn: 'GST',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'ON', name: 'Ontario',                   nameEn: 'Ontario',                   capital: 'Toronto',       region: 'Centre',     primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH', taxNameEn: 'HST',       taxRate: 13,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'PE', name: 'Île-du-Prince-Édouard',     nameEn: 'Prince Edward Island',      capital: 'Charlottetown', region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH', taxNameEn: 'HST',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'QC', name: 'Québec',                    nameEn: 'Quebec',                    capital: 'Québec',        region: 'Centre',     primaryLanguage: 'FR',  primaryCurrency: 'CAD', taxName: 'TPS + TVQ', taxNameEn: 'GST + QST', taxRate: 14.975, authority: 'ARC + Revenu Québec',          exportFormat: 'RQ-TPS-TVQ' },
  { code: 'SK', name: 'Saskatchewan',              nameEn: 'Saskatchewan',              capital: 'Regina',        region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVP', taxNameEn: 'GST + PST', taxRate: 11,     authority: 'ARC + SK Ministry of Finance', exportFormat: 'ARC-TPS-PST' },
  { code: 'YT', name: 'Yukon',                     nameEn: 'Yukon',                     capital: 'Whitehorse',    region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS', taxNameEn: 'GST',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
]

export function provinceByCode(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code)
}

export const PROVINCE_OPTIONS = PROVINCES.map((p) => ({
  value: p.code,
  label: `${p.code} · ${p.name}`,
}))

/** Où Flow en est, province par province. */
export const MARKET_STATUS: Record<string, DeploymentStatus> = {
  QC: 'live',
  NL: 'prospect',
  ON: 'future',
  NB: 'future',
  NS: 'future',
  PE: 'future',
  MB: 'future',
  SK: 'future',
  AB: 'future',
  BC: 'future',
  YT: 'future',
  NT: 'future',
  NU: 'future',
}

/* ------------------------------------------------------------------ */
/* Aéroports régionaux                                                 */
/* ------------------------------------------------------------------ */

/** Sous-réseaux d'exploitation Flow (phases 1 et 2). */
export type StationRegion = 'Basse-Côte-Nord' | 'Côte-Nord' | 'Labrador' | 'Hub'

/** Conservé pour compatibilité — même union que DeploymentStatus. */
export type StationStatus = DeploymentStatus

export type Carrier = 'CMA' | 'Air Liaison' | 'PAL Airlines' | 'Air Borealis'

export type AirportSize = 'large' | 'medium' | 'small'

export interface Airport {
  /** Code IATA */
  code: string
  /** Code OACI — renseigné pour le réseau d'exploitation */
  icao?: string
  /** Communauté desservie */
  name: string
  province: ProvinceCode
  /** Gabarit de l'aéroport — 'medium' et 'small' sont les régionaux */
  size: AirportSize
  /** Dessert des vols réguliers */
  scheduled?: boolean
  status: DeploymentStatus
  /**
   * Renseigné uniquement pour les aéroports du réseau d'exploitation Flow.
   * Les autres restent au catalogue provincial (phase 3).
   */
  operatingRegion?: StationRegion
  carriers?: Carrier[]
  gps?: { lat: number; lng: number }
  /** Station à fort trafic (meilleure rentabilité pods) */
  highTraffic?: boolean
}

export { AIRPORTS } from './airports'

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

/** Aéroports d'une province, dans l'ordre du catalogue. */
export function airportsByProvince(code: ProvinceCode): Airport[] {
  return AIRPORTS.filter((a) => a.province === code)
}

/**
 * Aéroports régionaux : tout sauf les grands aéroports internationaux.
 * C'est le coeur de cible du réseau — les communautés desservies par vols
 * régionaux, où le service au sol est rare et où les pods, véhicules et
 * distributrices ont le plus de valeur.
 */
export const REGIONAL_AIRPORTS = AIRPORTS.filter((a) => a.size !== 'large')

export function regionalAirportsByProvince(code: ProvinceCode): Airport[] {
  return REGIONAL_AIRPORTS.filter((a) => a.province === code)
}

/** Nombre d'aéroports régionaux par province. */
export const REGIONAL_COUNT: Record<ProvinceCode, number> = PROVINCES.reduce(
  (acc, p) => {
    acc[p.code] = REGIONAL_AIRPORTS.filter((a) => a.province === p.code).length
    return acc
  },
  {} as Record<ProvinceCode, number>
)

/** Nombre total d'aéroports répertoriés, par province. */
export const AIRPORT_COUNT: Record<ProvinceCode, number> = PROVINCES.reduce(
  (acc, p) => {
    acc[p.code] = AIRPORTS.filter((a) => a.province === p.code).length
    return acc
  },
  {} as Record<ProvinceCode, number>
)

/* ------------------------------------------------------------------ */
/* Réseau d'exploitation (« stations »)                                */
/* ------------------------------------------------------------------ */

/** Aéroport du réseau d'exploitation Flow — GPS et transporteurs garantis. */
export type Station = Airport & {
  operatingRegion: StationRegion
  gps: { lat: number; lng: number }
  carriers: Carrier[]
}

function isStation(a: Airport): a is Station {
  return Boolean(a.operatingRegion && a.gps && a.carriers)
}

export const STATIONS: Station[] = AIRPORTS.filter(isStation)

export function stationByCode(code: string): Station | undefined {
  return STATIONS.find((s) => s.code === code)
}

/** Stations opérationnelles (hors hub) — pods / véhicules / distributrices. */
export const SERVICE_STATIONS = STATIONS.filter((s) => s.operatingRegion !== 'Hub')

export const STATION_OPTIONS = SERVICE_STATIONS.map((s) => ({
  value: s.code,
  label: `${s.code} · ${s.name}`,
}))

export const STATUS_LABEL: Record<DeploymentStatus, string> = {
  live: 'En service',
  pilot: 'Mise en service',
  prospect: 'Phase 2',
  future: 'Phase 3',
}

export const STATUS_TONE: Record<DeploymentStatus, 'active' | 'pending' | 'info' | 'neutral'> = {
  live: 'active',
  pilot: 'pending',
  prospect: 'info',
  future: 'neutral',
}

/* ------------------------------------------------------------------ */
/* Taxes et devise                                                     */
/* ------------------------------------------------------------------ */

/**
 * Taxe de vente applicable dans une province.
 * Le taux est retourné en fraction (0.14975), pas en pourcentage.
 */
export function salesTax(province: ProvinceCode): { name: string; rate: number } {
  const p = provinceByCode(province)
  return p ? { name: p.taxName, rate: p.taxRate / 100 } : { name: 'TPS', rate: 0.05 }
}

/** Devise du déploiement canadien. */
export const CURRENCY = { code: 'CAD', symbol: '$', locale: 'fr-CA' } as const

/** Formatte un montant en dollars canadiens (fr-CA). */
export function formatCad(amount: number, opts: { cents?: boolean } = {}): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(amount)
}
