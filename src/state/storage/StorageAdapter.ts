import type { BookingDraft } from '../../types'

export interface StorageAdapter {
  save(draft: BookingDraft): Promise<void>
  load(): Promise<BookingDraft | null>
  clear(): Promise<void>
}
