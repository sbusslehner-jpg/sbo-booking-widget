import { describe, it, expect } from 'vitest'
import { InMemoryStorageAdapter } from './InMemoryStorageAdapter'
import { createInitialDraft } from '../store'

describe('InMemoryStorageAdapter', () => {
  it('round-trips a draft in memory', async () => {
    const a = new InMemoryStorageAdapter()
    const d = createInitialDraft()
    d.vehicle.brand = 'vw'
    await a.save(d)
    expect((await a.load())?.vehicle.brand).toBe('vw')
  })

  it('returns null when empty', async () => {
    const a = new InMemoryStorageAdapter()
    expect(await a.load()).toBeNull()
  })

  it('clear removes the in-memory draft', async () => {
    const a = new InMemoryStorageAdapter()
    await a.save(createInitialDraft())
    await a.clear()
    expect(await a.load()).toBeNull()
  })

  it('two instances do NOT share state', async () => {
    const a = new InMemoryStorageAdapter()
    const b = new InMemoryStorageAdapter()
    await a.save(createInitialDraft())
    expect(await b.load()).toBeNull()
  })
})
