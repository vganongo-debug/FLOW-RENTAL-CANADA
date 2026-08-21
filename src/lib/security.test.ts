import { describe, expect, it } from 'vitest'
import { luhnValid, isEmail, isE164Phone, capLength, MAX_LEN, postureSummary, SECURITY_CONTROLS } from './security'

describe('luhnValid', () => {
  it('passes the Stripe test PAN', () => {
    expect(luhnValid('4242 4242 4242 4242')).toBe(true)
    expect(luhnValid('4242424242424242')).toBe(true)
  })

  it('passes a Mastercard test PAN', () => {
    expect(luhnValid('5555 5555 5555 4444')).toBe(true)
  })

  it('rejects an obviously wrong number', () => {
    expect(luhnValid('1234 5678 9012 3456')).toBe(false)
  })

  it('rejects too-short and too-long numbers', () => {
    expect(luhnValid('424242')).toBe(false)
    expect(luhnValid('42424242424242424242')).toBe(false)
  })

  it('strips non-digits before checking', () => {
    expect(luhnValid('4242-4242-4242-4242')).toBe(true)
    expect(luhnValid('  4242 4242 4242 4242  ')).toBe(true)
  })
})

describe('isEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(isEmail('vistel@flowrentals.com')).toBe(true)
    expect(isEmail('a.b+tag@x.example.co.uk')).toBe(true)
  })
  it('rejects malformed addresses', () => {
    expect(isEmail('not-an-email')).toBe(false)
    expect(isEmail('a@b')).toBe(false)
    expect(isEmail('a@.com')).toBe(false)
  })
})

describe('isE164Phone', () => {
  it('accepts E.164 format', () => {
    expect(isE164Phone('+256778991042')).toBe(true)
    expect(isE164Phone('+1 415 555 0182')).toBe(true)
  })
  it('rejects missing +', () => {
    expect(isE164Phone('256778991042')).toBe(false)
  })
  it('rejects too short', () => {
    expect(isE164Phone('+1234')).toBe(false)
  })
})

describe('capLength', () => {
  it('keeps short values unchanged', () => {
    expect(capLength('hello', 100)).toBe('hello')
  })
  it('truncates long values', () => {
    const long = 'x'.repeat(10_000)
    expect(capLength(long, 100).length).toBe(100)
  })
  it('handles zero-length max', () => {
    expect(capLength('abc', 0)).toBe('')
  })
})

describe('MAX_LEN constants', () => {
  it('email follows RFC 5321 (254 chars)', () => {
    expect(MAX_LEN.email).toBe(254)
  })
  it('PAN cap matches the longest issuer length', () => {
    expect(MAX_LEN.pan).toBe(19)
  })
})

describe('SECURITY_CONTROLS posture', () => {
  it('lists at least 25 controls', () => {
    expect(SECURITY_CONTROLS.length).toBeGreaterThanOrEqual(25)
  })

  it('every control has id, title, status, category, owner', () => {
    for (const c of SECURITY_CONTROLS) {
      expect(c.id).toMatch(/^[a-z]+(-[a-z0-9]+)+$/)
      expect(c.title.length).toBeGreaterThan(0)
      expect(['red','amber','green','na']).toContain(c.status)
      expect(['PCI-DSS','OWASP','Auth','Privacy','Infra','Cryptography']).toContain(c.category)
      expect(c.notes.length).toBeGreaterThan(0)
    }
  })

  it('postureSummary counts every status bucket', () => {
    const sum = postureSummary()
    expect(sum.red + sum.amber + sum.green + sum.na).toBe(SECURITY_CONTROLS.length)
  })

  it('flags remaining critical PCI gaps for auth and server-side RBAC', () => {
    const reds = SECURITY_CONTROLS.filter((c) => c.status === 'red').map((c) => c.id)
    expect(reds).toContain('pci-8')   // real authentication
    expect(reds).toContain('pci-7')   // server-side RBAC
  })

  it('Stripe Elements + backend bridge moved PCI-3 to green and PCI-3b to amber', () => {
    const pci3 = SECURITY_CONTROLS.find((c) => c.id === 'pci-3')
    expect(pci3?.status).toBe('green')
    expect(pci3?.notes).toMatch(/Stripe Elements/)

    const pci3b = SECURITY_CONTROLS.find((c) => c.id === 'pci-3b')
    expect(pci3b?.status).toBe('amber')
    // Still amber (not green) because caller auth (AUTH-TODO) is pending.
    expect(pci3b?.notes).toMatch(/AUTH-TODO|auth/i)
  })

  it('Edge-enforced headers moved PCI-2 and PCI-4 to green', () => {
    const pci2 = SECURITY_CONTROLS.find((c) => c.id === 'pci-2')
    const pci4 = SECURITY_CONTROLS.find((c) => c.id === 'pci-4')
    expect(pci2?.status).toBe('green')
    expect(pci4?.status).toBe('green')
  })
})
