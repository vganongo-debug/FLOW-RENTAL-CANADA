import { describe, expect, it } from 'vitest'
import { AFRICA, countryByCode, OPERATING_CURRENCIES, MARKET_STATUS } from './africa'

describe('AFRICA reference data', () => {
  it('contains at least 50 African countries (54 minus disputed)', () => {
    expect(AFRICA.length).toBeGreaterThanOrEqual(50)
  })

  it('contains the three live markets', () => {
    const codes = AFRICA.map((c) => c.code)
    expect(codes).toContain('CG') // Congo-Brazzaville
    expect(codes).toContain('UG') // Uganda
    expect(codes).toContain('ET') // Ethiopia
  })

  it('does not contain non-African countries', () => {
    const codes = AFRICA.map((c) => c.code)
    expect(codes).not.toContain('CA') // Canada
    expect(codes).not.toContain('FR') // France
    expect(codes).not.toContain('US') // United States
    expect(codes).not.toContain('GB') // UK
    expect(codes).not.toContain('CN') // China
  })

  it('every country has ISO-2 code, capital, currency, region, tax', () => {
    for (const c of AFRICA) {
      expect(c.code).toMatch(/^[A-Z]{2}$/)
      expect(c.capital.length).toBeGreaterThan(0)
      expect(c.primaryCurrency.length).toBe(3)
      expect(['North','West','Central','East','Southern']).toContain(c.region)
      expect(c.taxRate).toBeGreaterThanOrEqual(0)
      expect(c.authority.length).toBeGreaterThan(0)
    }
  })

  it('countryByCode returns the right entry', () => {
    expect(countryByCode('UG')?.name).toBe('Uganda')
    expect(countryByCode('XX')).toBeUndefined()
  })

  it('OPERATING_CURRENCIES is a subset starting with USD', () => {
    expect(OPERATING_CURRENCIES[0].code).toBe('USD')
    expect(OPERATING_CURRENCIES.length).toBeGreaterThanOrEqual(8)
  })

  it('MARKET_STATUS only references valid African country codes', () => {
    const validCodes = new Set(AFRICA.map((c) => c.code))
    for (const code of Object.keys(MARKET_STATUS)) {
      expect(validCodes.has(code)).toBe(true)
    }
  })
})
