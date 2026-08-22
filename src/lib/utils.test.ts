import { describe, expect, it } from 'vitest'
import { convertFromCad, formatCurrency, formatDate, FX_RATES } from './utils'

describe('formatCurrency', () => {
  it('formats CAD without conversion', () => {
    const out = formatCurrency(100)
    expect(out).toMatch(/100/)
    expect(out).toMatch(/\$/)
  })

  it('defaults to CAD when no currency is given', () => {
    expect(formatCurrency(100)).toBe(formatCurrency(100, 'CAD'))
  })

  it('converts to USD using the FX table', () => {
    const out = formatCurrency(100, 'USD')
    // 100 CAD * 0.73 = 73 USD
    expect(out).toMatch(/73/)
  })

  it('converts to EUR', () => {
    expect(convertFromCad(10, 'EUR')).toBeCloseTo(6.8, 5)
  })

  it('holds exactly the three supported currencies, CAD at parity', () => {
    const codes = Object.keys(FX_RATES)
    expect(codes.sort()).toEqual(['CAD', 'EUR', 'USD'])
    expect(FX_RATES.CAD).toBe(1)
  })

  it('no longer carries the African operating currencies', () => {
    const codes = Object.keys(FX_RATES)
    for (const code of ['XAF', 'XOF', 'UGX', 'ETB', 'KES']) {
      expect(codes).not.toContain(code)
    }
  })
})

describe('formatDate', () => {
  it('renders day-month-year in Canadian French', () => {
    // Construct via Date so the local timezone does not shift the day.
    const s = formatDate(new Date(2026, 4, 10))
    expect(s).toMatch(/10/)
    expect(s).toMatch(/mai/)
    expect(s).toMatch(/2026/)
  })
})
