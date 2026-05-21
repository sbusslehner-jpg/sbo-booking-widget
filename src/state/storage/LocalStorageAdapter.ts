import type { BookingDraft } from '../../types'
import type { StorageAdapter } from './StorageAdapter'

export type LocalStorageAdapterOptions = {
  dealerId: string
  /** Time-to-live in milliseconds. Default: 24h. */
  ttlMs?: number
  /** Override storage (for tests). */
  storage?: Storage
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000

export class LocalStorageAdapter implements StorageAdapter {
  private readonly key: string
  private readonly ttlMs: number
  private readonly storage: Storage | null

  constructor(opts: LocalStorageAdapterOptions) {
    this.key = `booking-draft:${opts.dealerId}`
    this.ttlMs = opts.ttlMs ?? DEFAULT_TTL
    this.storage = opts.storage ?? (typeof window !== 'undefined' ? window.localStorage : null)
  }

  async save(draft: BookingDraft): Promise<void> {
    if (!this.storage) return
    try {
      const payload = JSON.stringify({ ...draft, updatedAt: Date.now() })
      this.storage.setItem(this.key, payload)
    } catch {
      // Quota oder Privacy-Modus → still ignorieren
    }
  }

  async load(): Promise<BookingDraft | null> {
    if (!this.storage) return null
    try {
      const raw = this.storage.getItem(this.key)
      if (!raw) return null
      const parsed = JSON.parse(raw) as BookingDraft
      if (typeof parsed.updatedAt !== 'number') return null
      if (Date.now() - parsed.updatedAt > this.ttlMs) {
        this.storage.removeItem(this.key)
        return null
      }
      return parsed
    } catch {
      return null
    }
  }

  async clear(): Promise<void> {
    if (!this.storage) return
    try {
      this.storage.removeItem(this.key)
    } catch {
      // ignore
    }
  }
}
