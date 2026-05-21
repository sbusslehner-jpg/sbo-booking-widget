/**
 * Library-Entry — gleicher Bundle für ESM und UMD.
 * - Exportiert die React-Komponente `BookingWidget` für NPM-Konsumenten.
 * - Registriert das Custom Element `<booking-widget>` für Script-Tag-Konsumenten.
 * - Stellt eine globale `BookingWidget.open(...)`-API bereit, mit der ein Overlay
 *   ohne eigenes Markup geöffnet werden kann.
 */

import { EmbeddedBookingWidget } from './widget/EmbeddedBookingWidget'
import type { BookingWidgetProps } from './widget/BookingWidget'
import { registerCustomElement, openOverlay, closeOverlay } from './widget/customElement'

// NPM-Exporte
export { EmbeddedBookingWidget as BookingWidget }
export type { BookingWidgetProps }
export { BookingCtaButton } from './widget/BookingCtaButton'
export { LocalStorageAdapter } from './state/storage/LocalStorageAdapter'
export { InMemoryStorageAdapter } from './state/storage/InMemoryStorageAdapter'
export { createStorageAdapter } from './state/storage/factory'
export type { ThemeInput, ThemeName, ThemeTokens } from './widget/themes'
export { availableThemes } from './widget/themes'
export type { PrefillData } from './state/prefill'
export type {
  PrefillTokenPayload,
  DecodedPrefillToken,
} from './state/prefillToken'
export { decodePrefillToken, tokenToPrefill } from './state/prefillToken'
export type { ConsentState } from './state/consent'
export {
  FULL_CONSENT,
  NO_CONSENT,
  readOneTrustConsent,
  subscribeOneTrustConsent,
} from './state/consent'
export type {
  AnalyticsEvent,
} from './analytics/events'
export type { AnalyticsSink } from './analytics/dataLayer'
export { defaultSink as defaultAnalyticsSink, noopSink as noopAnalyticsSink } from './analytics/dataLayer'
export type { StorageAdapter } from './state/storage/StorageAdapter'
export { MockBookingService, defaultBookingService } from './data/service'
export type {
  BookingService,
  BookingDraft,
  Brand,
  Model,
  Service,
  ServiceCenter,
  Slot,
  Recommendation,
  Advisor,
  TenantConfig,
  SubmitContext,
} from './types'
export { availableLanguages } from './i18n'

// Globale Surface für Script-Tag-/SPA-Konsumenten: `BookingWidget.open(...)`.
export const open = openOverlay
export const close = closeOverlay

if (typeof window !== 'undefined') {
  registerCustomElement()
  // UMD setzt `window.BookingWidget` via Rollup-Output automatisch.
  // Für ESM/SPA-Konsumenten machen wir das hier explizit, sonst gibt es
  // keinen Global-Hook für inline-onClick="BookingWidget.open(...)".
  const existing = (window as unknown as Record<string, unknown>).BookingWidget as
    | Record<string, unknown>
    | undefined
  ;(window as unknown as Record<string, unknown>).BookingWidget = {
    ...(existing ?? {}),
    open: openOverlay,
    close: closeOverlay,
  }
}
