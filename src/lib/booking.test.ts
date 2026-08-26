import { describe, expect, it } from 'vitest'
import { quoteStay, newBookingRef, STAY_ADDONS } from './booking'

describe('quoteStay', () => {
  it('facture le petit-déjeuner par nuit et le transfert une seule fois', () => {
    const q = quoteStay({
      nights: 4,
      nightlyRateCad: 130,
      addonIds: ['breakfast', 'transfer'],
      province: 'QC',
    })
    expect(q.subtotalCad).toBe(520)
    // 18 $ × 4 nuits + 35 $ une fois
    expect(q.addonsCad).toBe(107)
  })

  it('applique le taux de la province, pas une constante recopiée', () => {
    const qc = quoteStay({ nights: 1, nightlyRateCad: 100, addonIds: [], province: 'QC' })
    const on = quoteStay({ nights: 1, nightlyRateCad: 100, addonIds: [], province: 'ON' })
    const ab = quoteStay({ nights: 1, nightlyRateCad: 100, addonIds: [], province: 'AB' })

    expect(qc.taxRatePct).toBe(14.975)
    expect(qc.taxCad).toBe(14.98)
    expect(on.taxRatePct).toBe(13)
    expect(ab.taxRatePct).toBe(5)
    expect(qc.taxName).toBe('TPS + TVQ')
  })

  it('le total est exactement la somme de ses lignes', () => {
    const q = quoteStay({
      nights: 4, nightlyRateCad: 130,
      addonIds: ['breakfast', 'transfer'], province: 'QC',
    })
    expect(q.totalCad).toBe(Math.round((q.subtotalCad + q.addonsCad + q.taxCad) * 100) / 100)
    // 520 + 107 = 627 hors taxes · 627 × 0.14975 = 93,89 · total 720,89
    expect(q.totalCad).toBeCloseTo(720.89, 2)
  })

  it('ne cumule pas de points sur la taxe', () => {
    const q = quoteStay({ nights: 1, nightlyRateCad: 100, addonIds: [], province: 'QC' })
    expect(q.pointsEarned).toBe(1000)
  })

  it('ramène une durée absurde à une nuit', () => {
    expect(quoteStay({ nights: 0, nightlyRateCad: 100, addonIds: [], province: 'QC' }).nights).toBe(1)
    expect(quoteStay({ nights: -3, nightlyRateCad: 100, addonIds: [], province: 'QC' }).nights).toBe(1)
  })

  it('ignore une option inconnue', () => {
    const q = quoteStay({ nights: 2, nightlyRateCad: 100, addonIds: ['inexistante'], province: 'QC' })
    expect(q.addonsCad).toBe(0)
  })

  it('expose des options toutes tarifées en CAD', () => {
    expect(STAY_ADDONS.every((a) => a.priceCad > 0)).toBe(true)
  })
})

describe('newBookingRef', () => {
  it('produit une référence stable pour une même graine', () => {
    expect(newBookingRef(4271)).toBe(newBookingRef(4271))
    expect(newBookingRef(4271)).toMatch(/^FRG-2026-\d{4}$/)
  })

  it('distingue deux réservations', () => {
    expect(newBookingRef(1)).not.toBe(newBookingRef(2))
  })
})
