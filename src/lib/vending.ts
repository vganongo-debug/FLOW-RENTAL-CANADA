/**
 * Module distributrices — boissons, sandwichs et collations.
 *
 * Chaque station opérationnelle reçoit une ou plusieurs distributrices,
 * réapprovisionnées depuis le hub logistique de Montréal. Les agents au sol
 * remplissent les emplacements lorsque le stock baisse ; le réassort est
 * piloté à distance via cette liste, expédiée par les vols du réseau.
 */

export type VendingCategory = 'boisson' | 'sandwich' | 'collation'

export interface VendingProduct {
  sku: string
  name: string
  category: VendingCategory
  /** Prix de vente en distributrice (CAD, taxes incluses) */
  priceCad: number
  /** Coût de revient rendu station (CAD) */
  costCad: number
}

export interface VendingSlot {
  /** Emplacement (A1, A2, B1…) */
  code: string
  productSku: string
  /** Capacité maximale de l'emplacement */
  capacity: number
  /** Quantité en stock actuellement */
  qty: number
}

export type MachineStatus = 'active' | 'low_stock' | 'offline' | 'maintenance'

export interface VendingMachine {
  id: string
  stationCode: string
  /** Modèle / référence de l'appareil */
  model: string
  status: MachineStatus
  slots: VendingSlot[]
  /** Ventes du jour (CAD) */
  salesTodayCad: number
  /** Unités vendues aujourd'hui */
  unitsToday: number
  /** Dernier réapprovisionnement (ISO) */
  lastRestock: string
}

/** Catalogue produits (boissons, sandwichs, collations). */
export const VENDING_PRODUCTS: VendingProduct[] = [
  // Boissons
  { sku: 'BEV-WATER',  name: 'Eau embouteillée 500 ml',      category: 'boisson',   priceCad: 3.0, costCad: 0.7 },
  { sku: 'BEV-COLA',   name: 'Boisson gazeuse 355 ml',       category: 'boisson',   priceCad: 3.5, costCad: 0.9 },
  { sku: 'BEV-JUICE',  name: 'Jus de fruits 300 ml',         category: 'boisson',   priceCad: 3.5, costCad: 1.0 },
  { sku: 'BEV-COFFEE', name: 'Café froid 250 ml',            category: 'boisson',   priceCad: 4.0, costCad: 1.2 },
  { sku: 'BEV-ENERGY', name: 'Boisson énergisante 250 ml',   category: 'boisson',   priceCad: 4.5, costCad: 1.5 },
  // Sandwichs
  { sku: 'SND-HAM',    name: 'Sandwich jambon-fromage',      category: 'sandwich',  priceCad: 7.5, costCad: 3.0 },
  { sku: 'SND-CHICK',  name: 'Sandwich poulet',              category: 'sandwich',  priceCad: 8.0, costCad: 3.3 },
  { sku: 'SND-VEGGIE', name: 'Sandwich végétarien',          category: 'sandwich',  priceCad: 7.5, costCad: 3.0 },
  { sku: 'SND-WRAP',   name: 'Wrap au thon',                 category: 'sandwich',  priceCad: 8.0, costCad: 3.2 },
  // Collations
  { sku: 'SNK-CHIPS',  name: 'Croustilles',                  category: 'collation', priceCad: 3.0, costCad: 0.8 },
  { sku: 'SNK-BAR',    name: 'Barre tendre',                 category: 'collation', priceCad: 2.5, costCad: 0.6 },
  { sku: 'SNK-COOKIE', name: 'Biscuits',                     category: 'collation', priceCad: 3.0, costCad: 0.8 },
]

export function productBySku(sku: string): VendingProduct | undefined {
  return VENDING_PRODUCTS.find((p) => p.sku === sku)
}

export const CATEGORY_LABEL: Record<VendingCategory, string> = {
  boisson: 'Boissons',
  sandwich: 'Sandwichs',
  collation: 'Collations',
}

function slot(code: string, sku: string, capacity: number, qty: number): VendingSlot {
  return { code, productSku: sku, capacity, qty }
}

/** Gabarit d'emplacements standard d'une distributrice mixte. */
function standardSlots(fill: (cap: number) => number): VendingSlot[] {
  return [
    slot('A1', 'BEV-WATER', 12, fill(12)),
    slot('A2', 'BEV-COLA', 10, fill(10)),
    slot('A3', 'BEV-JUICE', 10, fill(10)),
    slot('A4', 'BEV-COFFEE', 8, fill(8)),
    slot('A5', 'BEV-ENERGY', 8, fill(8)),
    slot('B1', 'SND-HAM', 8, fill(8)),
    slot('B2', 'SND-CHICK', 8, fill(8)),
    slot('B3', 'SND-VEGGIE', 6, fill(6)),
    slot('B4', 'SND-WRAP', 6, fill(6)),
    slot('C1', 'SNK-CHIPS', 12, fill(12)),
    slot('C2', 'SNK-BAR', 12, fill(12)),
    slot('C3', 'SNK-COOKIE', 10, fill(10)),
  ]
}

export const VENDING_MACHINES: VendingMachine[] = [
  {
    id: 'VM-YBX-1', stationCode: 'YBX', model: 'FlowVend Duo · réfrigérée',
    status: 'active', salesTodayCad: 148.5, unitsToday: 34, lastRestock: '2026-07-28',
    slots: standardSlots((c) => Math.round(c * 0.7)),
  },
  {
    id: 'VM-YBX-2', stationCode: 'YBX', model: 'FlowVend Snack',
    status: 'low_stock', salesTodayCad: 96.0, unitsToday: 27, lastRestock: '2026-07-25',
    slots: standardSlots((c) => Math.round(c * 0.25)),
  },
  {
    id: 'VM-YNA-1', stationCode: 'YNA', model: 'FlowVend Duo · réfrigérée',
    status: 'active', salesTodayCad: 72.0, unitsToday: 18, lastRestock: '2026-07-27',
    slots: standardSlots((c) => Math.round(c * 0.55)),
  },
  {
    id: 'VM-YIF-1', stationCode: 'YIF', model: 'FlowVend Snack',
    status: 'low_stock', salesTodayCad: 40.5, unitsToday: 12, lastRestock: '2026-07-22',
    slots: standardSlots((c) => Math.round(c * 0.2)),
  },
  {
    id: 'VM-YHR-1', stationCode: 'YHR', model: 'FlowVend Duo · réfrigérée',
    status: 'maintenance', salesTodayCad: 0, unitsToday: 0, lastRestock: '2026-07-20',
    slots: standardSlots((c) => Math.round(c * 0.4)),
  },
]

/** Taux de remplissage d'une machine (0–1). */
export function fillRate(m: VendingMachine): number {
  const cap = m.slots.reduce((s, x) => s + x.capacity, 0)
  const qty = m.slots.reduce((s, x) => s + x.qty, 0)
  return cap === 0 ? 0 : qty / cap
}

/** Seuil de réassort : un emplacement sous 35 % de sa capacité. */
export function isSlotLow(s: VendingSlot): boolean {
  return s.qty <= Math.ceil(s.capacity * 0.35)
}

export interface RestockLine {
  machineId: string
  stationCode: string
  slot: string
  product: VendingProduct
  qty: number
  capacity: number
  refill: number
}

/** Liste de réassort agrégée pour le hub de Montréal. */
export function restockList(machines: VendingMachine[] = VENDING_MACHINES): RestockLine[] {
  const lines: RestockLine[] = []
  for (const m of machines) {
    for (const s of m.slots) {
      if (!isSlotLow(s)) continue
      const product = productBySku(s.productSku)
      if (!product) continue
      lines.push({
        machineId: m.id,
        stationCode: m.stationCode,
        slot: s.code,
        product,
        qty: s.qty,
        capacity: s.capacity,
        refill: s.capacity - s.qty,
      })
    }
  }
  return lines
}

export const MACHINE_STATUS_LABEL: Record<MachineStatus, string> = {
  active: 'Active',
  low_stock: 'Stock bas',
  offline: 'Hors ligne',
  maintenance: 'Entretien',
}

export const MACHINE_STATUS_TONE: Record<MachineStatus, 'active' | 'warning' | 'cancelled' | 'neutral'> = {
  active: 'active',
  low_stock: 'warning',
  offline: 'cancelled',
  maintenance: 'neutral',
}
