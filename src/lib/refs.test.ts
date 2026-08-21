import { describe, expect, it, beforeEach } from 'vitest'
import { detectKind, resolveRef, linkify, backlinksFor } from './refs'

beforeEach(() => { window.localStorage.clear() })

describe('detectKind', () => {
  it.each([
    ['RES-2026001', 'reservation'],
    ['RNT-900101', 'rental'],
    ['FRG-2026-1234', 'reservation'],
    ['PO-2026-0044', 'po'],
    ['TXN-12345', 'payment'],
    ['pm_1234567890abcdef', 'stripe_pm'],
    ['pi_abcdef1234567', 'stripe_pi'],
    ['fp-mercantile', 'partner'],
    ['p-bzv', 'property'],
    ['p-kla-mercantile', 'property'],
    ['v-001', 'vehicle'],
    ['u-1', 'staff'],
    ['m-1', 'member'],
    ['d-501', 'dispute'],
    ['tx-1001', 'tx'],
    ['c-1', 'conversation'],
    ['a-abc123', 'audit'],
  ] as const)('detects %s as %s', (id, expected) => {
    expect(detectKind(id)).toBe(expected)
  })

  it('returns null for unknown formats', () => {
    expect(detectKind('hello-world')).toBeNull()
    expect(detectKind('')).toBeNull()
    expect(detectKind('random-text-no-prefix')).toBeNull()
  })
})

describe('resolveRef', () => {
  it('returns null for unknown IDs', () => {
    expect(resolveRef('not-a-real-id-format')).toBeNull()
  })

  it('resolves a reservation with the guest name in the label', () => {
    const ref = resolveRef('RES-2026001')
    expect(ref).not.toBeNull()
    expect(ref?.kind).toBe('reservation')
    expect(ref?.href).toBe('/hotels/reservations/RES-2026001')
    expect(ref?.label).toMatch(/RES-2026001/)
    expect(ref?.fallback).toBeFalsy()
  })

  it('resolves a property to its city + name', () => {
    const ref = resolveRef('p-bzv')
    expect(ref?.kind).toBe('property')
    expect(ref?.href).toBe('/admin/properties/p-bzv')
    expect(ref?.label).toMatch(/Brazzaville/)
  })

  it('resolves a partner with vehicle count in the hint', () => {
    const ref = resolveRef('fp-mercantile')
    expect(ref?.kind).toBe('partner')
    expect(ref?.label).toBe('Mercantile Car Rentals')
    expect(ref?.hint).toMatch(/vehicles/)
  })

  it('resolves a Rewards member with tier + points hint', () => {
    const ref = resolveRef('m-1')
    expect(ref?.kind).toBe('member')
    expect(ref?.href).toBe('/rewards/members/m-1')
    expect(ref?.hint).toMatch(/Gold/)
  })

  it('falls back to a list URL for unknown IDs of a known kind', () => {
    const ref = resolveRef('RES-9999999')
    expect(ref?.fallback).toBe(true)
    expect(ref?.href).toBe('/hotels/reservations')
  })

  it('reads through localStorage so mutations are reflected', () => {
    window.localStorage.setItem('flow-os.properties', JSON.stringify([
      { id: 'p-test', name: 'Test Hotel', type: 'hotel', city: 'Test', country: 'Testland',
        countryCode: 'TZ', monthlyRevenueUsd: 0, ebitdaPct: 0, status: 'live' as const },
    ]))
    const ref = resolveRef('p-test')
    expect(ref?.label).toBe('Test Hotel')
    expect(ref?.fallback).toBeFalsy()
  })
})

describe('linkify', () => {
  it('returns a single text segment when no IDs are found', () => {
    const result = linkify('Just plain text here')
    expect(result).toEqual([{ type: 'text', text: 'Just plain text here' }])
  })

  it('returns an empty array on empty input', () => {
    expect(linkify('')).toEqual([])
  })

  it('splits a string with one ID into text · ref · text', () => {
    const result = linkify('Booking RES-2026001 confirmed.')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', text: 'Booking ' })
    expect(result[1].type).toBe('ref')
    if (result[1].type === 'ref') {
      expect(result[1].ref.id).toBe('RES-2026001')
    }
    expect(result[2]).toEqual({ type: 'text', text: ' confirmed.' })
  })

  it('handles multiple IDs of different kinds in one string', () => {
    const result = linkify('Member m-1 booked RES-2026001 at p-kla')
    const refs = result.filter((s) => s.type === 'ref')
    expect(refs).toHaveLength(3)
    const ids = refs.map((s) => s.type === 'ref' ? s.ref.id : '')
    expect(ids).toEqual(['m-1', 'RES-2026001', 'p-kla'])
  })

  it('preserves adjacent punctuation outside the ID', () => {
    const result = linkify('See RES-2026001, please.')
    const refs = result.filter((s) => s.type === 'ref')
    expect(refs).toHaveLength(1)
    if (refs[0].type === 'ref') expect(refs[0].ref.id).toBe('RES-2026001')
    // Punctuation stays in the surrounding text segment
    const txt = result.filter((s) => s.type === 'text').map((s) => s.type === 'text' ? s.text : '').join('')
    expect(txt).toContain(', please.')
  })

  it('does not match partial IDs inside larger tokens', () => {
    // 'RES-' in the middle of an unrelated word should not match.
    const result = linkify('VENRES-12345 is not a booking')
    const refs = result.filter((s) => s.type === 'ref')
    expect(refs).toHaveLength(0)
  })
})

describe('backlinksFor', () => {
  it('returns rewards transactions and disputes for a member', () => {
    const links = backlinksFor('m-1')
    expect(links.rewardsTransactions.length).toBeGreaterThan(0)
    expect(links.rewardsTransactions.every((t) => t.memberId === 'm-1')).toBe(true)
    expect(links.disputes.every((d) => d.memberId === 'm-1')).toBe(true)
  })

  it('returns conversations for a reservation reference', () => {
    const links = backlinksFor('RES-2026001')
    // c-1 in sample data has context booking → RES-2026001
    expect(links.conversations.some((c) => c.id === 'c-1')).toBe(true)
  })

  it('returns vehicles + rentals for a partner', () => {
    const links = backlinksFor('fp-mercantile')
    expect(links.vehicles.length).toBeGreaterThan(0)
    expect(links.vehicles.every((v) => v.partnerName === 'Mercantile Car Rentals')).toBe(true)
  })

  it('returns an empty result for unknown IDs', () => {
    const links = backlinksFor('totally-random-id')
    expect(links.reservations).toEqual([])
    expect(links.rentals).toEqual([])
    expect(links.rewardsTransactions).toEqual([])
  })
})
