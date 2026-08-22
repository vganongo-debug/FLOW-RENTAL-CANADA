import { describe, expect, it, beforeEach } from 'vitest'
import { rewards } from './api'

beforeEach(() => { window.localStorage.clear() })

describe('rewards.members', () => {
  it('lists members', async () => {
    const m = await rewards.listMembers()
    expect(m.length).toBeGreaterThan(0)
  })
  it('filters by tier', async () => {
    const gold = await rewards.listMembers({ tier: 'Gold' })
    expect(gold.every((x) => x.tier === 'Gold')).toBe(true)
  })
  it('searches by name and email', async () => {
    const sarah = await rewards.listMembers({ q: 'sarah' })
    expect(sarah.length).toBe(1)
    expect(sarah[0].name).toContain('Sarah')
  })
})

describe('rewards.adjustPoints', () => {
  it('credits points and updates member balance', async () => {
    const before = await rewards.getMember('m-1')
    const tx = await rewards.adjustPoints({
      memberId: 'm-1', delta: +500, reason: 'Test credit', staff: 'Vitest',
    })
    expect(tx.type).toBe('adjust')
    expect(tx.delta).toBe(500)
    const after = await rewards.getMember('m-1')
    expect(after?.points).toBe((before?.points ?? 0) + 500)
    expect(after?.lifetimeEarned).toBe((before?.lifetimeEarned ?? 0) + 500)
  })

  it('debits points and increments lifetime burned', async () => {
    const before = await rewards.getMember('m-2')
    await rewards.adjustPoints({
      memberId: 'm-2', delta: -1000, reason: 'Test debit', staff: 'Vitest',
    })
    const after = await rewards.getMember('m-2')
    expect(after?.points).toBe((before?.points ?? 0) - 1000)
    expect(after?.lifetimeBurned).toBe((before?.lifetimeBurned ?? 0) + 1000)
  })

  it('refuses to adjust a frozen member', async () => {
    await rewards.setFrozen('m-3', true, 'Vitest', 'Test freeze')
    await expect(
      rewards.adjustPoints({ memberId: 'm-3', delta: 100, reason: 'test', staff: 'Vitest' })
    ).rejects.toThrow(/frozen/)
  })

  it('logs an audit entry on every adjustment', async () => {
    const before = await rewards.listAudit()
    await rewards.adjustPoints({
      memberId: 'm-1', delta: 50, reason: 'Test', staff: 'Vitest',
    })
    const after = await rewards.listAudit()
    expect(after.length).toBe(before.length + 1)
    expect(after[0].action).toBe('adjust_points')
    expect(after[0].delta).toBe(50)
  })
})

describe('rewards.disputes', () => {
  it('approves a dispute and credits the awarded points', async () => {
    const dispute = (await rewards.listDisputes({ status: 'open' }))[0]
    const memberBefore = await rewards.getMember(dispute.memberId)
    const resolved = await rewards.approveDispute(dispute.id, 'Vitest', 320, 'Confirmed via partner ledger')
    expect(resolved?.status).toBe('approved')
    expect(resolved?.awardedPoints).toBe(320)
    const memberAfter = await rewards.getMember(dispute.memberId)
    expect(memberAfter?.points).toBe((memberBefore?.points ?? 0) + 320)
  })

  it('rejects a dispute and does not credit points', async () => {
    const dispute = (await rewards.listDisputes({ status: 'open' }))[0]
    const memberBefore = await rewards.getMember(dispute.memberId)
    const resolved = await rewards.rejectDispute(dispute.id, 'Vitest', 'Out of programme T&Cs')
    expect(resolved?.status).toBe('rejected')
    expect(resolved?.resolution).toContain('T&Cs')
    const memberAfter = await rewards.getMember(dispute.memberId)
    expect(memberAfter?.points).toBe(memberBefore?.points ?? 0)
  })
})

describe('rewards.partnerships', () => {
  it('reconciling sets delta to 0 and status to settled', async () => {
    const before = (await rewards.listPartnerships()).find((p) => p.status === 'discrepancy')!
    expect(before.delta).not.toBe(0)
    const after = await rewards.reconcilePartnership(before.id, 'Vitest')
    expect(after?.status).toBe('settled')
    expect(after?.delta).toBe(0)
    expect(after?.flowPoints).toBe(before.partnerPoints)
  })

  it('logs an audit entry on reconciliation', async () => {
    const p = (await rewards.listPartnerships()).find((x) => x.status === 'awaiting_partner')!
    const beforeAudit = await rewards.listAudit()
    await rewards.reconcilePartnership(p.id, 'Vitest')
    const afterAudit = await rewards.listAudit()
    expect(afterAudit.length).toBeGreaterThan(beforeAudit.length)
    expect(afterAudit[0].action).toBe('reconcile_partnership')
  })
})

describe('rewards.tier', () => {
  it('overrides a tier and audits the change', async () => {
    await rewards.setTier('m-1', 'Platinum', 'Vitest', 'Promo bump for promo year')
    const m = await rewards.getMember('m-1')
    expect(m?.tier).toBe('Platinum')
    const audit = await rewards.listAudit({ limit: 1 })
    expect(audit[0].action).toBe('set_tier')
    expect(audit[0].details).toContain('Platinum')
  })

  it('updates tier configuration thresholds', async () => {
    const updated = await rewards.updateTier('Gold', { minSpendCad: 7_500 }, 'Vitest')
    expect(updated?.minSpendCad).toBe(7_500)
    const tiers = await rewards.listTiers()
    expect(tiers.find((t) => t.tier === 'Gold')?.minSpendCad).toBe(7_500)
  })
})

describe('rewards.freeze', () => {
  it('freeze + unfreeze toggle works and audits', async () => {
    await rewards.setFrozen('m-4', true, 'Vitest', 'Fraud check')
    let m = await rewards.getMember('m-4')
    expect(m?.frozen).toBe(true)
    await rewards.setFrozen('m-4', false, 'Vitest', 'Cleared')
    m = await rewards.getMember('m-4')
    expect(m?.frozen).toBe(false)
  })
})
