import { describe, expect, it } from 'vitest'
import { convertFromUsd, formatCurrency, formatDate, FX_RATES } from './utils'

describe('formatCurrency', () => {
  it('formats USD without conversion', () => {
    const out = formatCurrency(100, 'USD')
    expect(out).toMatch(/100/)
    expect(out).toMatch(/\$/)
  })

  it('converts to UGX using the FX table', () => {
    const out = formatCurrency(100, 'UGX')
    // 100 USD * 3700 = 370,000 UGX — output should contain that figure
    expect(out).toMatch(/370,000|UGX 370 000|UGX\s?370,000/)
  })

  it('converts to XAF', () => {
    expect(convertFromUsd(10, 'XAF')).toBe(6000)
  })

  it('has at least the operating African currencies + USD', () => {
    const codes = Object.keys(FX_RATES)
    for (const code of ['USD', 'XAF', 'XOF', 'UGX', 'ETB', 'KES']) {
      expect(codes).toContain(code)
    }
  })

  it('includes the default non-African currencies (USD, CAD, EUR) plus African currencies', () => {
    const codes = Object.keys(FX_RATES)
    // USD/CAD/EUR are always available as guest-side defaults
    expect(codes).toContain('USD')
    expect(codes).toContain('CAD')
    expect(codes).toContain('EUR')
    // GBP / JPY etc. are not added — only the three defaults
    expect(codes).not.toContain('GBP')
    expect(codes).not.toContain('JPY')
  })

  it('includes a wide range of African currencies (≥30)', () => {
    const codes = Object.keys(FX_RATES).filter((c) => !['USD','CAD','EUR'].includes(c))
    expect(codes.length).toBeGreaterThanOrEqual(30)
  })
})

describe('formatDate', () => {
  it('renders day-month-year', () => {
    // Construct via Date so the local timezone doesn't shift the day.
    const s = formatDate(new Date(2026, 4, 10))
    expect(s).toMatch(/10/)
    expect(s).toMatch(/May/)
    expect(s).toMatch(/2026/)
  })
})
