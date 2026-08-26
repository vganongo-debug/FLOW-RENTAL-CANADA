import { salesTax, type ProvinceCode } from './canada'

/**
 * Devis de réservation — source unique du montant.
 *
 * Le parcours invité calculait son prix à trois endroits qui ne
 * s'accordaient pas : le récapitulatif du paiement, le montant remis à
 * Stripe (825 $ en dur) et la page de confirmation. Un client pouvait donc
 * lire un total, en payer un autre, et en voir un troisième sur son reçu.
 *
 * Tout passe désormais par `quoteStay`. Le nombre affiché, le nombre débité
 * et le nombre imprimé sur le reçu sont le même nombre.
 *
 * Les montants sont en dollars canadiens, sans conversion : le CAD est
 * l'unité de compte de la plateforme.
 */

export interface Addon {
  id: string
  label: string
  /** Prix unitaire en CAD */
  priceCad: number
  /** Facturé pour chaque nuit plutôt qu'une seule fois */
  perNight?: boolean
}

export const STAY_ADDONS: Addon[] = [
  { id: 'breakfast', label: 'Breakfast (per night, 2 pax)', priceCad: 18, perNight: true },
  { id: 'transfer', label: 'Airport transfer (one way)', priceCad: 35 },
  { id: 'late', label: 'Late check-out (4pm)', priceCad: 25 },
]

export interface Quote {
  nights: number
  nightlyRateCad: number
  /** Hébergement seul */
  subtotalCad: number
  addonsCad: number
  /** Désignation de la taxe applicable dans la province, ex. « TPS + TVQ » */
  taxName: string
  /** Taux en pourcentage, pour l'affichage — ex. 14.975 */
  taxRatePct: number
  taxCad: number
  totalCad: number
  /** Points Flow Rewards gagnés · 10 points par dollar dépensé hors taxes */
  pointsEarned: number
}

/**
 * Calcule un devis de séjour. Le taux de taxe vient de `canada.ts`, pas
 * d'une constante recopiée : c'était une valeur figée à 18 % héritée du
 * réseau africain, appliquée telle quelle à des séjours québécois.
 */
export function quoteStay(input: {
  nights: number
  nightlyRateCad: number
  /** Identifiants des options retenues */
  addonIds: string[]
  province: ProvinceCode
}): Quote {
  const nights = Math.max(1, Math.round(input.nights))
  const nightlyRateCad = Math.max(0, input.nightlyRateCad)
  const subtotalCad = nightlyRateCad * nights

  const addonsCad = STAY_ADDONS
    .filter((a) => input.addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.priceCad * (a.perNight ? nights : 1), 0)

  const { name, rate } = salesTax(input.province)
  const taxable = subtotalCad + addonsCad
  const taxCad = round2(taxable * rate)

  return {
    nights,
    nightlyRateCad,
    subtotalCad,
    addonsCad,
    taxName: name,
    taxRatePct: round3(rate * 100),
    taxCad,
    totalCad: round2(taxable + taxCad),
    // Les points se gagnent sur le montant hors taxes : la taxe part au
    // fisc, pas au programme de fidélité.
    pointsEarned: Math.round(taxable * 10),
  }
}

/**
 * Référence de réservation. Générée une seule fois, au moment du débit, et
 * transportée jusqu'à la confirmation. La page de confirmation en tirait
 * une nouvelle à chaque rendu : le client voyait un numéro différent s'il
 * rafraîchissait, et aucun ne correspondait à quoi que ce soit.
 */
export function newBookingRef(seed: number): string {
  const n = Math.abs(Math.round(seed)) % 10000
  return `FRG-2026-${String(n).padStart(4, '0')}`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
