import { useCallback, useMemo, useRef } from 'react'
import type { AnalyticsEvent } from './events'
import { defaultSink, noopSink, type AnalyticsSink } from './dataLayer'
import type { ConsentState } from '../state/consent'

/**
 * Liefert eine `track`-Funktion, die Analytics-Events emittiert — aber nur,
 * wenn `consent.analytics === true`. Andernfalls No-op.
 *
 * Doppelter Sicherheitsmechanismus:
 *   1. Sink wird per Consent ausgewählt (noopSink ohne Consent)
 *   2. Falls jemand programmatisch trotzdem `track` aufruft, ignorieren wir
 *      es zusätzlich anhand des current consent state.
 */
export function useAnalytics(
  consent: ConsentState,
  customSink?: AnalyticsSink,
): {
  track: (event: AnalyticsEvent) => void
} {
  const sink = customSink ?? defaultSink

  // Wir halten consent in einem Ref, damit der Callback bei Consent-Wechsel
  // nicht stale wird — der track-Aufruf checkt immer den aktuellen Wert.
  const consentRef = useRef(consent)
  consentRef.current = consent

  const track = useCallback(
    (event: AnalyticsEvent) => {
      if (!consentRef.current.analytics) return
      const enriched = { ...event, sbo_timestamp: Date.now() }
      try {
        sink(enriched)
      } catch {
        // Analytics darf nie das Widget brechen
      }
    },
    [sink],
  )

  return useMemo(
    () => ({
      track: consent.analytics ? track : (() => {}),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consent.analytics, track],
  )
}

export { defaultSink, noopSink }
export type { AnalyticsSink, AnalyticsEvent }
