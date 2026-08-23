/**
 * Génère src/lib/airports.ts — le catalogue des aéroports canadiens.
 *
 * Source : OurAirports (https://ourairports.com/data/), jeu de données
 * ouvert placé dans le domaine public. On ne retient que le Canada, et
 * parmi les aérodromes on écarte héliports, hydrobases et pistes fermées :
 * restent les aéroports disposant d'un code IATA ou desservis par des vols
 * réguliers — soit le périmètre qui a un sens pour l'exploitation.
 *
 * Usage :
 *   node scripts/import-airports.mjs                  # télécharge la source
 *   node scripts/import-airports.mjs chemin/airports.csv
 *
 * Le fichier produit ne doit pas être édité à la main : les particularités
 * du réseau Flow (nom d'usage, transporteurs, phase de déploiement) vivent
 * dans OVERRIDES ci-dessous et sont réappliquées à chaque génération.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const SOURCE_URL =
  'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv'
const OUT = new URL('../src/lib/airports.ts', import.meta.url)

/** Provinces et territoires, dans l'ordre d'affichage du catalogue. */
const PROVINCE_ORDER = [
  'QC', 'NL', 'PE', 'NS', 'NB', 'ON', 'MB', 'SK', 'AB', 'BC', 'YT', 'NT', 'NU',
]

/**
 * Réseau d'exploitation Flow. Ces champs ne viennent pas de la source
 * ouverte : ils décrivent le déploiement et sont maintenus à la main.
 */
const OVERRIDES = {
  // Phase 1 · Basse-Côte-Nord
  YBX: { name: 'Lourdes-de-Blanc-Sablon', status: 'live', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA', 'PAL Airlines', 'Air Borealis'], highTraffic: true },
  YNA: { name: 'Natashquan', status: 'live', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA', 'Air Liaison'] },
  YIF: { name: 'Saint-Augustin', status: 'live', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'] },
  YHR: { name: 'Chevery', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'] },
  ZTB: { name: 'Tête-à-la-Baleine', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'] },
  ZGS: { name: 'La Romaine', status: 'pilot', operatingRegion: 'Basse-Côte-Nord', carriers: ['CMA'] },
  // Phase 2 · Côte-Nord
  YZV: { name: 'Sept-Îles', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['CMA', 'Air Liaison', 'PAL Airlines'], highTraffic: true },
  YBC: { name: 'Baie-Comeau', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['Air Liaison', 'PAL Airlines'] },
  YGV: { name: 'Havre-Saint-Pierre', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['CMA', 'Air Liaison'] },
  YPN: { name: 'Port-Menier (Anticosti)', status: 'prospect', operatingRegion: 'Côte-Nord', carriers: ['Air Liaison'] },
  // Phase 2 · Labrador
  YYR: { name: 'Happy Valley-Goose Bay', status: 'prospect', operatingRegion: 'Labrador', carriers: ['PAL Airlines', 'Air Borealis'], highTraffic: true },
  YWK: { name: 'Wabush', status: 'prospect', operatingRegion: 'Labrador', carriers: ['PAL Airlines'] },
  YDP: { name: 'Nain', status: 'future', operatingRegion: 'Labrador', carriers: ['Air Borealis'] },
  YHO: { name: 'Hopedale', status: 'future', operatingRegion: 'Labrador', carriers: ['Air Borealis'] },
  YRG: { name: 'Rigolet', status: 'future', operatingRegion: 'Labrador', carriers: ['Air Borealis'] },
  // Hub logistique
  YUL: { name: 'Montréal-Trudeau (hub logistique)', status: 'live', operatingRegion: 'Hub', carriers: ['CMA', 'PAL Airlines', 'Air Liaison'] },
}

/** Analyseur CSV minimal, suffisant pour ce jeu de données (guillemets doublés). */
function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const header = rows.shift()
  return rows
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const local = process.argv[2]
let csv
if (local && existsSync(local)) {
  console.log('Lecture de', local)
  csv = readFileSync(local, 'utf8')
} else {
  console.log('Téléchargement de', SOURCE_URL)
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Téléchargement échoué : HTTP ${res.status}`)
  csv = await res.text()
}

const SIZE = { large_airport: 'large', medium_airport: 'medium', small_airport: 'small' }

const all = parseCsv(csv).filter(
  (r) =>
    r.iso_country === 'CA' &&
    SIZE[r.type] &&
    (r.iata_code || r.scheduled_service === 'yes')
)

const seen = new Set()
const airports = []
for (const r of all) {
  const code = r.iata_code || r.ident
  if (seen.has(code)) continue
  seen.add(code)
  const province = r.iso_region.replace('CA-', '')
  if (!PROVINCE_ORDER.includes(province)) continue
  const o = OVERRIDES[code] ?? {}
  airports.push({
    code,
    icao: /^C[A-Z0-9]{3}$/.test(r.ident) ? r.ident : undefined,
    name: o.name ?? (r.municipality || r.name.replace(/ (Airport|Aerodrome)$/, '')),
    province,
    size: SIZE[r.type],
    scheduled: r.scheduled_service === 'yes' || undefined,
    status: o.status ?? 'future',
    operatingRegion: o.operatingRegion,
    carriers: o.carriers,
    gps:
      r.latitude_deg && r.longitude_deg
        ? { lat: +(+r.latitude_deg).toFixed(4), lng: +(+r.longitude_deg).toFixed(4) }
        : undefined,
    highTraffic: o.highTraffic,
  })
}

const missing = Object.keys(OVERRIDES).filter((c) => !seen.has(c))
if (missing.length) throw new Error(`Stations absentes de la source : ${missing.join(', ')}`)

airports.sort(
  (a, b) =>
    PROVINCE_ORDER.indexOf(a.province) - PROVINCE_ORDER.indexOf(b.province) ||
    a.name.localeCompare(b.name, 'fr')
)

const line = (a) => {
  const parts = [`code: ${q(a.code)}`]
  if (a.icao) parts.push(`icao: ${q(a.icao)}`)
  parts.push(`name: ${q(a.name)}`, `province: ${q(a.province)}`, `size: ${q(a.size)}`)
  if (a.scheduled) parts.push('scheduled: true')
  parts.push(`status: ${q(a.status)}`)
  if (a.operatingRegion) parts.push(`operatingRegion: ${q(a.operatingRegion)}`)
  if (a.carriers) parts.push(`carriers: [${a.carriers.map(q).join(', ')}]`)
  if (a.gps) parts.push(`gps: { lat: ${a.gps.lat}, lng: ${a.gps.lng} }`)
  if (a.highTraffic) parts.push('highTraffic: true')
  return `  { ${parts.join(', ')} },`
}

let body = ''
let current = null
for (const a of airports) {
  if (a.province !== current) {
    current = a.province
    const n = airports.filter((x) => x.province === current).length
    body += `\n  /* ── ${current} · ${n} aéroports ─────────────────────────────── */\n`
  }
  body += line(a) + '\n'
}

const out = `/**
 * Catalogue des aéroports canadiens — ${airports.length} entrées.
 *
 * GÉNÉRÉ AUTOMATIQUEMENT — ne pas éditer à la main.
 * Régénérer avec : node scripts/import-airports.mjs
 *
 * Source : OurAirports (domaine public). Périmètre retenu : aérodromes
 * canadiens hors héliports, hydrobases et pistes fermées, disposant d'un
 * code IATA ou desservis par des vols réguliers.
 *
 * Les champs propres au déploiement Flow (nom d'usage, phase, sous-réseau,
 * transporteurs) sont maintenus dans OVERRIDES du script d'import.
 */
import type { Airport } from './canada'

export const AIRPORTS: Airport[] = [${body}]
`

writeFileSync(OUT, out, 'utf8')
console.log(`${airports.length} aéroports écrits dans src/lib/airports.ts`)
for (const p of PROVINCE_ORDER) {
  console.log(`  ${p} : ${airports.filter((a) => a.province === p).length}`)
}
