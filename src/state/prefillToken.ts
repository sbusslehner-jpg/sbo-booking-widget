import type { BookingDraft } from '../types'
import type { PrefillData } from './prefill'

/**
 * Signed Prefill Token — JWT-kompatibel.
 *
 * **Architektur-Annahme:**
 * - Backend (SBO) signiert Tokens mit privatem Schlüssel
 * - Tokens enthalten Kundendaten und einen Verfallszeitpunkt (`exp`)
 * - Client (Widget) **dekodiert** den Token nur fürs UX-Prefill und
 *   reicht ihn unverändert an `submitBooking` zurück
 * - Backend **verifiziert** Signatur + `exp` + `aud` bei der Buchungsannahme
 *   und nimmt die Kundendaten ausschließlich aus dem Token, NICHT aus dem
 *   ge-POST-ten Draft. Damit ist Manipulation per DevTools wirkungslos.
 */
export type PrefillTokenPayload = {
  /** Issuer — z.B. "sbo-backend" */
  iss?: string
  /** Subject — z.B. carlog-User-ID oder Session-ID */
  sub?: string
  /** Audience — muss zum `dealerId` des Widgets passen */
  aud?: string
  /** Expiration — Unix-Timestamp in Sekunden */
  exp: number
  /** Issued at — Unix-Timestamp in Sekunden */
  iat?: number
  /** Vorbefüllte Kundendaten (vom Backend canonical). */
  customer?: Partial<BookingDraft['customer']>
  /** Optional: vorbefülltes Fahrzeug (z.B. aus carlog-Profil). */
  vehicle?: Partial<BookingDraft['vehicle']>
  /** Optional: vorausgewählte Services / Termin (z.B. aus Email-Einladung). */
  services?: Partial<BookingDraft['services']>
  appointment?: Partial<BookingDraft['appointment']>
  /** Optional: Start-Schritt. */
  step?: 1 | 2 | 3
}

export type DecodedPrefillToken = {
  payload: PrefillTokenPayload
  raw: string
}

/** Base64url-decode mit Padding-Korrektur (browserkompatibel). */
function base64UrlDecode(input: string): string {
  let s = input.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  if (typeof atob === 'function') return atob(s)
  // Node-Fallback (Tests)
  return Buffer.from(s, 'base64').toString('binary')
}

/**
 * Dekodiert einen JWT-Token-String — OHNE Signatur-Verifizierung.
 * Die Verifizierung ist Sache des Backends bei `submitBooking`.
 *
 * Wirft niemals — bei kaputtem Token wird `null` zurückgegeben.
 */
export function decodePrefillToken(token: string | undefined): DecodedPrefillToken | null {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson) as PrefillTokenPayload
    if (typeof payload.exp !== 'number') return null
    const nowSec = Math.floor(Date.now() / 1000)
    if (payload.exp < nowSec) {
      // Abgelaufener Token — wie kein Token behandeln.
      return null
    }
    return { payload, raw: token }
  } catch {
    return null
  }
}

/** Wandelt einen dekodierten Token in ein PrefillData-Objekt um. */
export function tokenToPrefill(decoded: DecodedPrefillToken): PrefillData {
  const { customer, vehicle, services, appointment, step } = decoded.payload
  return {
    customer,
    vehicle,
    services,
    appointment,
    step,
  }
}
