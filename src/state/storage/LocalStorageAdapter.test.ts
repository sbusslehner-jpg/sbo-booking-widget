import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { createInitialDraft } from '../store'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => {
      map.delete(k)
    },
    setItem: (k, v) => {
      map.set(k, v)
    },
  }
}

describe('LocalStorageAdapter', () => {
  let storage: Storage
  beforeEach(() => {
    storage = memoryStorage()
  })

  it('saves and loads a draft round-trip', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'test', storage })
    const draft = createInitialDraft()
    draft.vehicle.brand = 'vw'
    draft.vehicle.model = 'polo'
    await a.save(draft)
    const loaded = await a.load()
    expect(loaded?.vehicle.brand).toBe('vw')
    expect(loaded?.vehicle.model).toBe('polo')
  })

  it('returns null when key is empty', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'fresh', storage })
    expect(await a.load()).toBeNull()
  })

  it('discards expired drafts based on TTL', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'ttl', storage, ttlMs: 10 })
    const draft = createInitialDraft()
    await a.save(draft)
    // Manuell auf alt setzen
    const raw = storage.getItem('booking-draft:ttl')!
    const parsed = JSON.parse(raw)
    parsed.updatedAt = Date.now() - 1000
    storage.setItem('booking-draft:ttl', JSON.stringify(parsed))
    expect(await a.load()).toBeNull()
  })

  it('clears the stored draft', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'c', storage })
    await a.save(createInitialDraft())
    await a.clear()
    expect(await a.load()).toBeNull()
  })

  it('isolates drafts per dealerId', async () => {
    const a = new LocalStorageAdapter({ dealerId: 'a', storage })
    const b = new LocalStorageAdapter({ dealerId: 'b', storage })
    const da = createInitialDraft()
    da.vehicle.brand = 'audi'
    await a.save(da)
    expect(await b.load()).toBeNull()
    const loaded = await a.load()
    expect(loaded?.vehicle.brand).toBe('audi')
  })
})
