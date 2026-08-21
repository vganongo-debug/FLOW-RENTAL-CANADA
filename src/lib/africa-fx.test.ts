import { describe, expect, it } from 'vitest'
import { AFRICA } from './africa'
import { FX_RATES } from './utils'

describe('FX coverage', () => {
  it('every African primaryCurrency has a USD-base FX rate', () => {
    const codes = Object.keys(FX_RATES)
    for (const c of AFRICA) {
      expect(codes,
        `Missing FX rate for ${c.code} (${c.name}) → ${c.primaryCurrency}`
      ).toContain(c.primaryCurrency)
    }
  })
})
