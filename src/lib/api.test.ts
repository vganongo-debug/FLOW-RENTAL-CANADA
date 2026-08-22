import { describe, expect, it, beforeEach } from 'vitest'
import { auth, hotels, payments, booking } from './api'

beforeEach(() => { window.localStorage.clear() })

describe('auth', () => {
  it('returns a session on demo login', async () => {
    const s = await auth.loginAs('superadmin')
    expect(s.token).toMatch(/^tok_superadmin_/)
    expect(s.user.role).toBe('superadmin')
    expect(s.expiresAt).toBeGreaterThan(Date.now())
  })

  it('restores the session from localStorage', async () => {
    await auth.loginAs('hotel_manager')
    const s = await auth.currentSession()
    expect(s).not.toBeNull()
    expect(s?.user.role).toBe('hotel_manager')
  })

  it('clears session on logout', async () => {
    await auth.loginAs('guest')
    await auth.logout()
    expect(await auth.currentSession()).toBeNull()
  })

  it('rejects unknown roles', async () => {
    // @ts-expect-error invalid role at runtime
    await expect(auth.loginAs('hacker')).rejects.toThrow()
  })
})

describe('hotels', () => {
  it('returns properties', async () => {
    const props = await hotels.listProperties()
    expect(props.length).toBeGreaterThan(0)
    expect(props[0]).toHaveProperty('name')
  })

  it('persists room status updates', async () => {
    const rooms = await hotels.listRooms()
    const room = rooms[0]
    await hotels.updateRoomStatus(room.number, 'maintenance')
    const fresh = await hotels.listRooms()
    expect(fresh.find((r) => r.number === room.number)?.status).toBe('maintenance')
  })
})

describe('payments', () => {
  it('captures non-cash payments', async () => {
    const r = await payments.charge({ amountCad: 100, method: 'card', stripePaymentMethodId: 'pm_test_xxx', ref: 'test-1' })
    expect(['captured', 'failed']).toContain(r.status)
    expect(r.amountCad).toBe(100)
  })

  it('queues cash payments', async () => {
    const r = await payments.charge({ amountCad: 50, method: 'cash' })
    expect(r.status).toBe('queued')
  })

  it('logs transactions to localStorage', async () => {
    await payments.charge({ amountCad: 25, method: 'mtn' })
    await payments.charge({ amountCad: 75, method: 'airtel' })
    const log = await payments.listTransactions()
    expect(log.length).toBe(2)
    expect(log[0].amountCad).toBe(75) // newest first
  })
})

describe('booking', () => {
  it('creates a booking record', async () => {
    const b = await booking.createBooking({
      propertyId: 'p-yna',
      checkIn: '2026-05-14',
      checkOut: '2026-05-18',
      amountCad: 780,
    })
    expect(b.id).toMatch(/^FRG-2026-/)
    expect(b.amountCad).toBe(780)
  })
})
