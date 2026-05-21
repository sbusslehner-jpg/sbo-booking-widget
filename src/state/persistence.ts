import { useEffect, useRef } from 'react'
import type { StorageAdapter } from './storage/StorageAdapter'
import { useBookingStore } from './store'

const SAVE_DEBOUNCE_MS = 300

/**
 * Verbindet den Zustand-Store mit einem StorageAdapter.
 * - Hydratisiert beim Mount (sofern Draft existiert und nicht abgelaufen ist).
 * - Speichert bei jeder Änderung debounced.
 */
export function useDraftPersistence(adapter: StorageAdapter): void {
  const hydrated = useBookingStore((s) => s.hydrated)
  const setDraft = useBookingStore((s) => s.setDraft)
  const markHydrated = useBookingStore((s) => s.markHydrated)
  const draft = useBookingStore((s) => s.draft)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter

  // Hydration nur beim ersten Mount.
  useEffect(() => {
    let cancelled = false
    void adapterRef.current
      .load()
      .then((stored) => {
        if (cancelled) return
        if (stored) {
          setDraft(stored)
        }
        markHydrated()
      })
      .catch(() => {
        markHydrated()
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced save.
  useEffect(() => {
    if (!hydrated) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      void adapterRef.current.save(draft)
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [draft, hydrated])
}

export async function clearDraft(adapter: StorageAdapter): Promise<void> {
  await adapter.clear()
  useBookingStore.getState().reset()
}
