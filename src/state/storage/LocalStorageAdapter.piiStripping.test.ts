import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { createInitialDraft } from '../store'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => { map.delete(k) },
    setItem: (k, v) => { map.set(k, v) },
  }
}

describe('LocalStorageAdapter PII stripping (Phase 1 K3)', () => {
  let storage: Storage
  beforeEach(() => { storage = memoryStorage() })

  it('strips customer fields by default', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'pii', storage })
    const d = createInitialDraft()
    d.vehicle.brand = 'vw'
    d.customer.email = 'leak@example.com'
    d.customer.firstName = 'Max'
    d.customer.phone = '660 1234567'
    await a.save(d)
    const raw = storage.getItem('booking-draft:pii')!
    expect(raw).not.toContain('leak@example.com')
    expect(raw).not.toContain('Max')
    expect(raw).not.toContain('660 1234567')
    // Non-PII fields should still be persisted.
    expect(raw).toContain('vw')
  })

  it('honors excludeCustomerFields: false (legacy opt-out)', async () => {
    const a = new LocalStorageAdapter({
      dealerId: 'opt-out',
      storage,
      excludeCustomerFields: false,
    })
    const d = createInitialDraft()
    d.customer.email = 'visible@example.com'
    await a.save(d)
    expect(storage.getItem('booking-draft:opt-out')).toContain('visible@example.com')
  })

  it('loaded customer fields are empty after stripped save', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'load', storage })
    const d = createInitialDraft()
    d.customer.email = 'leak@example.com'
    await a.save(d)
    const loaded = await a.load()
    expect(loaded?.customer.email).toBe('')
  })
})
