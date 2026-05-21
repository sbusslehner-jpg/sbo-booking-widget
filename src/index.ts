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
export { LocalStorageAdapter } from './state/storage/LocalStorageAdapter'
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
} from './types'

// Globale UMD-API: `BookingWidget.open(...)` ist über das UMD-Namespace-Objekt
// erreichbar (Rollup setzt window.BookingWidget = { ...allExports }).
export const open = openOverlay
export const close = closeOverlay

// Browser-seitig: Custom Element registrieren.
if (typeof window !== 'undefined') {
  registerCustomElement()
}
