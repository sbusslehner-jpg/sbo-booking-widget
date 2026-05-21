import type { AnalyticsEvent } from './events'

/**
 * Analytics-Sink. Default-Implementation pusht in `window.dataLayer` (GTM).
 * Konsumenten können eine eigene `sink`-Funktion übergeben, um Events
 * stattdessen z.B. an Matomo, Segment oder einen eigenen Endpoint zu senden.
 */
export type AnalyticsSink = (event: AnalyticsEvent & { sbo_timestamp: number }) => void

export const defaultSink: AnalyticsSink = (payload) => {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: unknown[] }
  if (!Array.isArray(w.dataLayer)) {
    w.dataLayer = []
  }
  ;(w.dataLayer as unknown[]).push(payload)
}

/** Globaler No-op-Sink — wenn `consent.analytics === false`, hier rein. */
export const noopSink: AnalyticsSink = () => {}
