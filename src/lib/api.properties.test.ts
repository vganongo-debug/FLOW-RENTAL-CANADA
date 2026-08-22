import { describe, expect, it, beforeEach } from 'vitest'
import { properties, inventory, procurement } from './api'

beforeEach(() => { window.localStorage.clear() })

describe('properties API', () => {
  it('lists properties from sample data on first read', async () => {
    const all = await properties.list()
    expect(all.length).toBeGreaterThan(0)
  })

  it('filters by countryCode', async () => {
    const qc = await properties.list({ countryCode: 'QC' })
    expect(qc.every((p) => p.countryCode === 'QC')).toBe(true)
  })

  it('creates a new property and persists it', async () => {
    const created = await properties.create({
      name: 'Flow Station Chevery',
      type: 'hotel',
      city: 'Chevery',
      country: 'Québec',
      countryCode: 'QC',
      rooms: 25,
    })
    expect(created.id).toMatch(/^p-che-/)
    expect(created.type).toBe('hotel')
    expect(created.rooms).toBe(25)

    const all = await properties.list()
    expect(all.find((p) => p.id === created.id)).toBeTruthy()
  })

  it('does not attach vehicles to a hotel-only property', async () => {
    const created = await properties.create({
      name: 'Hotel only',
      type: 'hotel',
      city: 'Sept-Îles',
      country: 'Québec',
      countryCode: 'QC',
      rooms: 20,
      vehicles: 99,   // should be ignored for hotel type
    })
    expect(created.vehicles).toBeUndefined()
    expect(created.rooms).toBe(20)
  })

  it('does not attach rooms to a car-rental-only property', async () => {
    const created = await properties.create({
      name: 'Cars only',
      type: 'car_rental',
      city: 'Baie-Comeau',
      country: 'Québec',
      countryCode: 'QC',
      rooms: 99,      // should be ignored
      vehicles: 12,
    })
    expect(created.rooms).toBeUndefined()
    expect(created.vehicles).toBe(12)
  })

  it('removes a property', async () => {
    const created = await properties.create({
      name: 'Throwaway',
      type: 'hotel',
      city: 'Wabush',
      country: 'Terre-Neuve-et-Labrador',
      countryCode: 'NL',
    })
    await properties.remove(created.id)
    const fresh = await properties.list()
    expect(fresh.find((p) => p.id === created.id)).toBeUndefined()
  })

  it('updates a property without changing its id', async () => {
    const created = await properties.create({
      name: 'Initial', type: 'hotel', city: 'Natashquan', country: 'Québec', countryCode: 'QC',
    })
    const updated = await properties.update(created.id, { name: 'Renamed' })
    expect(updated?.id).toBe(created.id)
    expect(updated?.name).toBe('Renamed')
  })
})

describe('inventory API', () => {
  it('lists inventory items', async () => {
    const all = await inventory.list({ propertyId: 'p-yna' })
    expect(all.length).toBeGreaterThan(0)
    expect(all.every((i) => i.propertyId === 'p-yna')).toBe(true)
  })

  it('filters lowStockOnly correctly', async () => {
    const low = await inventory.list({ propertyId: 'p-yna', lowStockOnly: true })
    expect(low.every((i) => i.currentStock <= i.reorderPoint)).toBe(true)
  })

  it('adjusts stock and persists', async () => {
    const items = await inventory.list({ propertyId: 'p-yna' })
    const item = items[0]
    const updated = await inventory.adjustStock(item.id, 10)
    expect(updated?.currentStock).toBe(item.currentStock + 10)
  })

  it('never lets stock drop below 0', async () => {
    const items = await inventory.list({ propertyId: 'p-yna' })
    const item = items[0]
    const updated = await inventory.adjustStock(item.id, -10_000)
    expect(updated?.currentStock).toBe(0)
  })
})

describe('procurement API', () => {
  it('one-click reorder creates a submitted PO with one line', async () => {
    const items = await inventory.list({ propertyId: 'p-yna' })
    const low = items.find((i) => i.currentStock <= i.reorderPoint)!
    const order = await procurement.reorder(low)
    expect(order.status).toBe('submitted')
    expect(order.lines.length).toBe(1)
    expect(order.lines[0].qty).toBe(low.reorderQty)
    expect(order.totalCad).toBe(low.reorderQty * low.unitCostCad)
  })

  it('marking a PO as received increments inventory', async () => {
    const items = await inventory.list({ propertyId: 'p-yna' })
    const item = items[0]
    const before = item.currentStock

    const order = await procurement.create({
      propertyId: 'p-yna',
      supplierId: item.supplierId,
      supplierName: 'Test supplier',
      lines: [{ itemId: item.id, itemName: item.name, qty: 50, unit: item.unit, unitCostCad: item.unitCostCad }],
    })
    await procurement.setStatus(order.id, 'approved')
    await procurement.setStatus(order.id, 'in_transit')
    await procurement.setStatus(order.id, 'received')

    const after = await inventory.list({ propertyId: 'p-yna' })
    const refreshed = after.find((i) => i.id === item.id)!
    expect(refreshed.currentStock).toBe(before + 50)
  })

  it('filtering by status works', async () => {
    await procurement.create({
      propertyId: 'p-ybx', supplierId: 'sup-coop-bcn', supplierName: 'Coop de la Basse-Côte-Nord',
      lines: [{ itemId: 'x', itemName: 'Test', qty: 1, unit: 'unit', unitCostCad: 10 }],
    })
    const submitted = await procurement.list({ status: 'submitted' })
    expect(submitted.length).toBeGreaterThan(0)
    expect(submitted.every((o) => o.status === 'submitted')).toBe(true)
  })
})
