/**
 * Réseau canadien — source de vérité géographique de Flow Rentals OS.
 *
 * Deux niveaux :
 *   1. PROVINCES — les 13 provinces et territoires (remplacent l'ancienne
 *      liste continentale). Chacune porte son régime de taxes de
 *      vente, son autorité fiscale et son format d'export comptable.
 *   2. AIRPORTS — les aéroports régionaux, rattachés à une province. Un
 *      sous-ensemble constitue le réseau d'exploitation (« stations ») où
 *      Flow déploie pods, véhicules et distributrices.
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
  { code: 'AB', name: 'Alberta',                   nameEn: 'Alberta',                   capital: 'Edmonton',      region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'BC', name: 'Colombie-Britannique',      nameEn: 'British Columbia',          capital: 'Victoria',      region: 'Ouest',      primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVP', taxRate: 12,     authority: 'ARC + BC Ministry of Finance', exportFormat: 'ARC-TPS-PST' },
  { code: 'MB', name: 'Manitoba',                  nameEn: 'Manitoba',                  capital: 'Winnipeg',      region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVD', taxRate: 12,     authority: 'ARC + Manitoba Finance',       exportFormat: 'ARC-TPS-RST' },
  { code: 'NB', name: 'Nouveau-Brunswick',         nameEn: 'New Brunswick',             capital: 'Fredericton',   region: 'Atlantique', primaryLanguage: 'BIL', primaryCurrency: 'CAD', taxName: 'TVH',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NL', name: 'Terre-Neuve-et-Labrador',   nameEn: 'Newfoundland and Labrador', capital: 'St. John’s',    region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NS', name: 'Nouvelle-Écosse',           nameEn: 'Nova Scotia',               capital: 'Halifax',       region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH',       taxRate: 14,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'NT', name: 'Territoires du Nord-Ouest', nameEn: 'Northwest Territories',     capital: 'Yellowknife',   region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'NU', name: 'Nunavut',                   nameEn: 'Nunavut',                   capital: 'Iqaluit',       region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
  { code: 'ON', name: 'Ontario',                   nameEn: 'Ontario',                   capital: 'Toronto',       region: 'Centre',     primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH',       taxRate: 13,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'PE', name: 'Île-du-Prince-Édouard',     nameEn: 'Prince Edward Island',      capital: 'Charlottetown', region: 'Atlantique', primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TVH',       taxRate: 15,     authority: 'ARC',                          exportFormat: 'ARC-TVH' },
  { code: 'QC', name: 'Québec',                    nameEn: 'Quebec',                    capital: 'Québec',        region: 'Centre',     primaryLanguage: 'FR',  primaryCurrency: 'CAD', taxName: 'TPS + TVQ', taxRate: 14.975, authority: 'ARC + Revenu Québec',          exportFormat: 'RQ-TPS-TVQ' },
  { code: 'SK', name: 'Saskatchewan',              nameEn: 'Saskatchewan',              capital: 'Regina',        region: 'Prairies',   primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS + TVP', taxRate: 11,     authority: 'ARC + SK Ministry of Finance', exportFormat: 'ARC-TPS-PST' },
  { code: 'YT', name: 'Yukon',                     nameEn: 'Yukon',                     capital: 'Whitehorse',    region: 'Nord',       primaryLanguage: 'EN',  primaryCurrency: 'CAD', taxName: 'TPS',       taxRate: 5,      authority: 'ARC',                          exportFormat: 'ARC-TPS' },
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

export interface Airport {
  /** Code IATA */
  code: string
  /** Code OACI — renseigné pour le réseau d'exploitation */
  icao?: string
  /** Communauté desservie */
  name: string
  province: ProvinceCode
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

/**
 * Catalogue des aéroports régionaux, par province.
 *
 * Les entrées portant `operatingRegion` (Québec / Labrador) constituent le
 * réseau d'exploitation : coordonnées GPS et transporteurs y sont renseignés.
 * Les autres forment le catalogue de la phase 3 — code IATA et communauté
 * desservie seulement, à enrichir à l'ouverture du marché.
 */
export const AIRPORTS: Airport[] = [
  /* ── Québec · Basse-Côte-Nord (phase 1, pilote) ─────────────────── */
  { code: 'YBX', icao: 'CYBX', name: 'Lourdes-de-Blanc-Sablon', province: 'QC', status: 'live',  operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA', 'PAL Airlines', 'Air Borealis'], gps: { lat: 51.4436, lng: -57.1853 }, highTraffic: true },
  { code: 'YNA', icao: 'CYNA', name: 'Natashquan',              province: 'QC', status: 'live',  operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA', 'Air Liaison'], gps: { lat: 50.19, lng: -61.7892 } },
  { code: 'YIF', icao: 'CYIF', name: 'Saint-Augustin',          province: 'QC', status: 'live',  operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'], gps: { lat: 51.2117, lng: -58.6583 } },
  { code: 'YHR', icao: 'CYHR', name: 'Chevery',                 province: 'QC', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'], gps: { lat: 50.4689, lng: -59.6367 } },
  { code: 'ZTB', icao: 'CTB6', name: 'Tête-à-la-Baleine',       province: 'QC', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'], gps: { lat: 50.6744, lng: -59.3836 } },
  { code: 'ZGS', icao: 'CTT5', name: 'La Romaine',              province: 'QC', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'], gps: { lat: 50.2597, lng: -60.6797 } },

  /* ── Québec · Côte-Nord (phase 2) ───────────────────────────────── */
  { code: 'YZV', icao: 'CYZV', name: 'Sept-Îles',               province: 'QC', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['CMA', 'Air Liaison', 'PAL Airlines'], gps: { lat: 50.2233, lng: -66.2656 }, highTraffic: true },
  { code: 'YBC', icao: 'CYBC', name: 'Baie-Comeau',             province: 'QC', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['Air Liaison', 'PAL Airlines'], gps: { lat: 49.1325, lng: -68.2044 } },
  { code: 'YGV', icao: 'CYGV', name: 'Havre-Saint-Pierre',      province: 'QC', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['CMA', 'Air Liaison'], gps: { lat: 50.2819, lng: -63.6114 } },
  { code: 'YPN', icao: 'CYPN', name: 'Port-Menier (Anticosti)', province: 'QC', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['Air Liaison'], gps: { lat: 49.8364, lng: -64.2886 } },

  /* ── Québec · hub logistique ────────────────────────────────────── */
  { code: 'YUL', icao: 'CYUL', name: 'Montréal-Trudeau (hub logistique)', province: 'QC', status: 'live', operatingRegion: 'Hub', carriers: ['CMA', 'PAL Airlines', 'Air Liaison'], gps: { lat: 45.4706, lng: -73.7408 } },

  /* ── Québec · reste du réseau (phase 3) ─────────────────────────── */
  { code: 'YQB', name: 'Québec · Jean-Lesage', province: 'QC', status: 'future' },
  { code: 'YYY', name: 'Mont-Joli',            province: 'QC', status: 'future' },
  { code: 'YGP', name: 'Gaspé',                province: 'QC', status: 'future' },
  { code: 'YGR', name: 'Îles-de-la-Madeleine', province: 'QC', status: 'future' },
  { code: 'YBG', name: 'Bagotville',           province: 'QC', status: 'future' },
  { code: 'YRJ', name: 'Roberval',             province: 'QC', status: 'future' },
  { code: 'YMT', name: 'Chibougamau-Chapais',  province: 'QC', status: 'future' },
  { code: 'YVO', name: 'Val-d’Or',             province: 'QC', status: 'future' },
  { code: 'YUY', name: 'Rouyn-Noranda',        province: 'QC', status: 'future' },
  { code: 'YGL', name: 'La Grande Rivière',    province: 'QC', status: 'future' },
  { code: 'YVP', name: 'Kuujjuaq',             province: 'QC', status: 'future' },
  { code: 'YGW', name: 'Kuujjuarapik',         province: 'QC', status: 'future' },
  { code: 'YPX', name: 'Puvirnituq',           province: 'QC', status: 'future' },

  /* ── Terre-Neuve-et-Labrador · Labrador (phase 2) ───────────────── */
  { code: 'YYR', icao: 'CYYR', name: 'Happy Valley-Goose Bay', province: 'NL', status: 'prospect', operatingRegion: 'Labrador', carriers: ['PAL Airlines', 'Air Borealis'], gps: { lat: 53.3192, lng: -60.4258 }, highTraffic: true },
  { code: 'YWK', icao: 'CYWK', name: 'Wabush',                 province: 'NL', status: 'prospect', operatingRegion: 'Labrador', carriers: ['PAL Airlines'], gps: { lat: 52.9219, lng: -66.8644 } },
  { code: 'YDP', icao: 'CYDP', name: 'Nain',                   province: 'NL', status: 'future',   operatingRegion: 'Labrador', carriers: ['Air Borealis'], gps: { lat: 56.5492, lng: -61.6803 } },
  { code: 'YHO', icao: 'CYHO', name: 'Hopedale',               province: 'NL', status: 'future',   operatingRegion: 'Labrador', carriers: ['Air Borealis'], gps: { lat: 55.4483, lng: -60.2286 } },
  { code: 'YRG', icao: 'CYRG', name: 'Rigolet',                province: 'NL', status: 'future',   operatingRegion: 'Labrador', carriers: ['Air Borealis'], gps: { lat: 54.1797, lng: -58.4575 } },

  /* ── Terre-Neuve-et-Labrador · île de Terre-Neuve (phase 3) ─────── */
  { code: 'YYT', name: 'St. John’s',   province: 'NL', status: 'future' },
  { code: 'YDF', name: 'Deer Lake',    province: 'NL', status: 'future' },
  { code: 'YQX', name: 'Gander',       province: 'NL', status: 'future' },
  { code: 'YJT', name: 'Stephenville', province: 'NL', status: 'future' },
  { code: 'YAY', name: 'St. Anthony',  province: 'NL', status: 'future' },
  { code: 'YMN', name: 'Makkovik',     province: 'NL', status: 'future' },
  { code: 'YCA', name: 'Cartwright',   province: 'NL', status: 'future' },
  { code: 'YFX', name: 'St. Lewis',    province: 'NL', status: 'future' },
  { code: 'YSO', name: 'Postville',    province: 'NL', status: 'future' },

  /* ── Île-du-Prince-Édouard ──────────────────────────────────────── */
  { code: 'YYG', name: 'Charlottetown', province: 'PE', status: 'future' },
  { code: 'YSU', name: 'Summerside',    province: 'PE', status: 'future' },

  /* ── Nouvelle-Écosse ────────────────────────────────────────────── */
  { code: 'YHZ', name: 'Halifax · Stanfield', province: 'NS', status: 'future' },
  { code: 'YQY', name: 'Sydney',              province: 'NS', status: 'future' },
  { code: 'YQI', name: 'Yarmouth',            province: 'NS', status: 'future' },

  /* ── Nouveau-Brunswick ──────────────────────────────────────────── */
  { code: 'YQM', name: 'Moncton',     province: 'NB', status: 'future' },
  { code: 'YFC', name: 'Fredericton', province: 'NB', status: 'future' },
  { code: 'YSJ', name: 'Saint John',  province: 'NB', status: 'future' },
  { code: 'ZBF', name: 'Bathurst',    province: 'NB', status: 'future' },
  { code: 'YCH', name: 'Miramichi',   province: 'NB', status: 'future' },

  /* ── Ontario ────────────────────────────────────────────────────── */
  { code: 'YYZ', name: 'Toronto · Pearson', province: 'ON', status: 'future' },
  { code: 'YOW', name: 'Ottawa',            province: 'ON', status: 'future' },
  { code: 'YSB', name: 'Sudbury',           province: 'ON', status: 'future' },
  { code: 'YTS', name: 'Timmins',           province: 'ON', status: 'future' },
  { code: 'YQT', name: 'Thunder Bay',       province: 'ON', status: 'future' },
  { code: 'YAM', name: 'Sault Ste. Marie',  province: 'ON', status: 'future' },
  { code: 'YXL', name: 'Sioux Lookout',     province: 'ON', status: 'future' },
  { code: 'YPL', name: 'Pickle Lake',       province: 'ON', status: 'future' },
  { code: 'YHD', name: 'Dryden',            province: 'ON', status: 'future' },
  { code: 'YQK', name: 'Kenora',            province: 'ON', status: 'future' },
  { code: 'YMO', name: 'Moosonee',          province: 'ON', status: 'future' },
  { code: 'YAT', name: 'Attawapiskat',      province: 'ON', status: 'future' },
  { code: 'YFA', name: 'Fort Albany',       province: 'ON', status: 'future' },
  { code: 'YER', name: 'Fort Severn',       province: 'ON', status: 'future' },
  { code: 'YXU', name: 'London',            province: 'ON', status: 'future' },
  { code: 'YQG', name: 'Windsor',           province: 'ON', status: 'future' },

  /* ── Manitoba ───────────────────────────────────────────────────── */
  { code: 'YWG', name: 'Winnipeg',     province: 'MB', status: 'future' },
  { code: 'YTH', name: 'Thompson',     province: 'MB', status: 'future' },
  { code: 'YBR', name: 'Brandon',      province: 'MB', status: 'future' },
  { code: 'YYQ', name: 'Churchill',    province: 'MB', status: 'future' },
  { code: 'YGX', name: 'Gillam',       province: 'MB', status: 'future' },
  { code: 'YIV', name: 'Island Lake',  province: 'MB', status: 'future' },
  { code: 'YNE', name: 'Norway House', province: 'MB', status: 'future' },
  { code: 'YFO', name: 'Flin Flon',    province: 'MB', status: 'future' },

  /* ── Saskatchewan ───────────────────────────────────────────────── */
  { code: 'YXE', name: 'Saskatoon',        province: 'SK', status: 'future' },
  { code: 'YQR', name: 'Regina',           province: 'SK', status: 'future' },
  { code: 'YPA', name: 'Prince Albert',    province: 'SK', status: 'future' },
  { code: 'YVC', name: 'La Ronge',         province: 'SK', status: 'future' },
  { code: 'YSF', name: 'Stony Rapids',     province: 'SK', status: 'future' },
  { code: 'YQW', name: 'North Battleford', province: 'SK', status: 'future' },
  { code: 'YQV', name: 'Yorkton',          province: 'SK', status: 'future' },
  { code: 'YEN', name: 'Estevan',          province: 'SK', status: 'future' },

  /* ── Alberta ────────────────────────────────────────────────────── */
  { code: 'YYC', name: 'Calgary',        province: 'AB', status: 'future' },
  { code: 'YEG', name: 'Edmonton',       province: 'AB', status: 'future' },
  { code: 'YMM', name: 'Fort McMurray',  province: 'AB', status: 'future' },
  { code: 'YQU', name: 'Grande Prairie', province: 'AB', status: 'future' },
  { code: 'YQL', name: 'Lethbridge',     province: 'AB', status: 'future' },
  { code: 'YXH', name: 'Medicine Hat',   province: 'AB', status: 'future' },
  { code: 'YQF', name: 'Red Deer',       province: 'AB', status: 'future' },
  { code: 'YPE', name: 'Peace River',    province: 'AB', status: 'future' },
  { code: 'YOJ', name: 'High Level',     province: 'AB', status: 'future' },

  /* ── Colombie-Britannique ───────────────────────────────────────── */
  { code: 'YVR', name: 'Vancouver',      province: 'BC', status: 'future' },
  { code: 'YYJ', name: 'Victoria',       province: 'BC', status: 'future' },
  { code: 'YLW', name: 'Kelowna',        province: 'BC', status: 'future' },
  { code: 'YXS', name: 'Prince George',  province: 'BC', status: 'future' },
  { code: 'YXJ', name: 'Fort St. John',  province: 'BC', status: 'future' },
  { code: 'YDQ', name: 'Dawson Creek',   province: 'BC', status: 'future' },
  { code: 'YKA', name: 'Kamloops',       province: 'BC', status: 'future' },
  { code: 'YQQ', name: 'Comox',          province: 'BC', status: 'future' },
  { code: 'YCD', name: 'Nanaimo',        province: 'BC', status: 'future' },
  { code: 'YPR', name: 'Prince Rupert',  province: 'BC', status: 'future' },
  { code: 'YXT', name: 'Terrace',        province: 'BC', status: 'future' },
  { code: 'YZP', name: 'Sandspit',       province: 'BC', status: 'future' },
  { code: 'YZT', name: 'Port Hardy',     province: 'BC', status: 'future' },
  { code: 'YWL', name: 'Williams Lake',  province: 'BC', status: 'future' },
  { code: 'YXC', name: 'Cranbrook',      province: 'BC', status: 'future' },
  { code: 'YCG', name: 'Castlegar',      province: 'BC', status: 'future' },

  /* ── Yukon ──────────────────────────────────────────────────────── */
  { code: 'YXY', name: 'Whitehorse',  province: 'YT', status: 'future' },
  { code: 'YDA', name: 'Dawson City', province: 'YT', status: 'future' },
  { code: 'YOC', name: 'Old Crow',    province: 'YT', status: 'future' },
  { code: 'YMA', name: 'Mayo',        province: 'YT', status: 'future' },
  { code: 'YQH', name: 'Watson Lake', province: 'YT', status: 'future' },

  /* ── Territoires du Nord-Ouest ──────────────────────────────────── */
  { code: 'YZF', name: 'Yellowknife',    province: 'NT', status: 'future' },
  { code: 'YEV', name: 'Inuvik',         province: 'NT', status: 'future' },
  { code: 'YVQ', name: 'Norman Wells',   province: 'NT', status: 'future' },
  { code: 'YHY', name: 'Hay River',      province: 'NT', status: 'future' },
  { code: 'YFS', name: 'Fort Simpson',   province: 'NT', status: 'future' },
  { code: 'YSM', name: 'Fort Smith',     province: 'NT', status: 'future' },
  { code: 'YUB', name: 'Tuktoyaktuk',    province: 'NT', status: 'future' },
  { code: 'YGH', name: 'Fort Good Hope', province: 'NT', status: 'future' },
  { code: 'YPC', name: 'Paulatuk',       province: 'NT', status: 'future' },
  { code: 'YSY', name: 'Sachs Harbour',  province: 'NT', status: 'future' },

  /* ── Nunavut ────────────────────────────────────────────────────── */
  { code: 'YFB', name: 'Iqaluit',                province: 'NU', status: 'future' },
  { code: 'YRT', name: 'Rankin Inlet',           province: 'NU', status: 'future' },
  { code: 'YCB', name: 'Cambridge Bay',          province: 'NU', status: 'future' },
  { code: 'YBK', name: 'Baker Lake',             province: 'NU', status: 'future' },
  { code: 'YZS', name: 'Coral Harbour',          province: 'NU', status: 'future' },
  { code: 'YXP', name: 'Pangnirtung',            province: 'NU', status: 'future' },
  { code: 'YTE', name: 'Kinngait (Cape Dorset)', province: 'NU', status: 'future' },
  { code: 'YCY', name: 'Clyde River',            province: 'NU', status: 'future' },
  { code: 'YAB', name: 'Arctic Bay',             province: 'NU', status: 'future' },
  { code: 'YRB', name: 'Resolute',               province: 'NU', status: 'future' },
  { code: 'YGZ', name: 'Grise Fiord',            province: 'NU', status: 'future' },
  { code: 'YCO', name: 'Kugluktuk',              province: 'NU', status: 'future' },
  { code: 'YHK', name: 'Gjoa Haven',             province: 'NU', status: 'future' },
  { code: 'YSK', name: 'Sanikiluaq',             province: 'NU', status: 'future' },
  { code: 'YUX', name: 'Hall Beach',             province: 'NU', status: 'future' },
  { code: 'YVM', name: 'Qikiqtarjuaq',           province: 'NU', status: 'future' },
]

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

/** Aéroports d'une province, dans l'ordre du catalogue. */
export function airportsByProvince(code: ProvinceCode): Airport[] {
  return AIRPORTS.filter((a) => a.province === code)
}

/** Nombre d'aéroports régionaux répertoriés, par province. */
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
