import type { BookingDraft } from '../../types'
import type { StorageAdapter } from './StorageAdapter'

/**
 * Fallback-Adapter ohne jegliche Persistenz. Wird verwendet, wenn der
 * Consent-State `functional: false` ist — das Widget kann dann zwar innerhalb
 * einer Session den Draft halten, aber nichts überlebt einen Reload.
 *
 * DSGVO-konform: keine Speicherung, keine Übermittlung, keine Identifizierung.
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private draft: BookingDraft | null = null

  async save(draft: BookingDraft): Promise<void> {
    this.draft = draft
  }

  async load(): Promise<BookingDraft | null> {
    return this.draft
  }

  async clear(): Promise<void> {
    this.draft = null
  }
}
