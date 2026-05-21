import { useEffect, useRef } from 'react'
import type { StorageAdapter } from './storage/StorageAdapter'
import { useBookingStore } from './store'
import { applyPrefill, type PrefillData } from './prefill'

const SAVE_DEBOUNCE_MS = 300

/**
 * Verbindet den Zustand-Store mit einem StorageAdapter.
 * Reihenfolge bei Mount:
 *   1. Initial-Draft (vom Store-Default)
 *   2. Persistierter Draft (falls vorhanden & nicht abgelaufen)
 *   3. Übergebener Prefill (überschreibt explizit gesetzte Felder)
 *
 * Anschließend wird bei jeder State-Änderung debounced gespeichert.
 */
export function useDraftPersistence(
  adapter: StorageAdapter,
  prefill?: PrefillData,
): void {
  const hydrated = useBookingStore((s) => s.hydrated)
  const setDraft = useBookingStore((s) => s.setDraft)
  const markHydrated = useBookingStore((s) => s.markHydrated)
  const draft = useBookingStore((s) => s.draft)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter
  const prefillRef = useRef(prefill)
  prefillRef.current = prefill

  useEffect(() => {
    let cancelled = false
    void adapterRef.current
      .load()
      .then((stored) => {
        if (cancelled) return
        const base = stored ?? useBookingStore.getState().draft
        const merged = prefillRef.current
          ? applyPrefill(base, prefillRef.current)
          : base
        setDraft(merged)
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
