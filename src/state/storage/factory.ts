import type { ConsentState } from '../consent'
import { InMemoryStorageAdapter } from './InMemoryStorageAdapter'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import type { StorageAdapter } from './StorageAdapter'

export type StorageFactoryOptions = {
  dealerId: string
  consent: ConsentState
  ttlMs?: number
}

/**
 * Wählt den passenden Storage-Adapter abhängig vom Consent-State.
 * - `functional: true`  → LocalStorageAdapter (ohne Kundendaten)
 * - `functional: false` → InMemoryStorageAdapter (kein Persist, nur Session)
 */
export function createStorageAdapter(opts: StorageFactoryOptions): StorageAdapter {
  if (!opts.consent.functional) {
    return new InMemoryStorageAdapter()
  }
  return new LocalStorageAdapter({
    dealerId: opts.dealerId,
    ttlMs: opts.ttlMs,
    excludeCustomerFields: true,
  })
}
