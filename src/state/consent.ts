/**
 * Consent-State, kompatibel zu OneTrust-Kategorien.
 *
 * - functional: localStorage / Persistenz (Draft-Recovery)         → OneTrust C0003
 * - analytics:  GA/GTM-dataLayer-Events                              → OneTrust C0002
 * - marketing:  zukünftige Werbe-Tracker (Conversion-Pixel etc.)     → OneTrust C0004
 *
 * "necessary" / OneTrust C0001 ist immer implizit true und nicht abgebildet.
 */
export type ConsentState = {
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export const FULL_CONSENT: ConsentState = {
  functional: true,
  analytics: true,
  marketing: true,
}

export const NO_CONSENT: ConsentState = {
  functional: false,
  analytics: false,
  marketing: false,
}

/**
 * Liest den aktuellen Consent-State aus OneTrust, falls auf der Trägerseite
 * vorhanden. Greift auf `window.OnetrustActiveGroups` zu — die kommagetrennte
 * Liste freigegebener Kategorien.
 *
 * Fallback: NO_CONSENT (sicheres Default).
 */
export function readOneTrustConsent(): ConsentState {
  if (typeof window === 'undefined') return NO_CONSENT
  const groups = (window as unknown as { OnetrustActiveGroups?: string })
    .OnetrustActiveGroups
  if (!groups || typeof groups !== 'string') return NO_CONSENT
  const parts = groups.split(',').map((s) => s.trim()).filter(Boolean)
  return {
    functional: parts.includes('C0003'),
    analytics: parts.includes('C0002'),
    marketing: parts.includes('C0004'),
  }
}

/**
 * Hängt einen Listener an `window.OneTrust.OnConsentChanged`, falls vorhanden.
 * Liefert eine Cleanup-Funktion.
 */
export function subscribeOneTrustConsent(
  callback: (next: ConsentState) => void,
): () => void {
  if (typeof window === 'undefined') return () => {}
  const ot = (window as unknown as {
    OneTrust?: { OnConsentChanged?: (cb: () => void) => void }
  }).OneTrust
  if (!ot?.OnConsentChanged) return () => {}
  const handler = () => callback(readOneTrustConsent())
  ot.OnConsentChanged(handler)
  // OneTrust gibt keine Unsubscribe-API; wir markieren den Handler und no-op'en
  // den Cleanup. In Praxis bleibt das Widget bis Page-Unload gemountet.
  return () => {
    // intentional no-op
  }
}
