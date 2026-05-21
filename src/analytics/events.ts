/**
 * Event-Schema fürs SBO Booking-Widget.
 *
 * Alle Events landen in `window.dataLayer` (Google Tag Manager) — die
 * Trägerseite verarbeitet sie weiter (GA4, Matomo, …). Wir feuern NICHTS,
 * solange `consent.analytics === false`.
 *
 * Konvention:
 * - `sbo_*`-Prefix vermeidet Kollisionen mit Host-Events
 * - alle Parameter sind opaque (IDs, Counts, Codes) — NIEMALS PII
 */
export type AnalyticsEvent =
  | { event: 'sbo_widget_mount'; mode: 'overlay' | 'inline'; dealer: string; theme: string; has_prefill: boolean; has_token: boolean }
  | { event: 'sbo_step_view'; step: 1 | 2 | 3; dealer: string }
  | { event: 'sbo_brand_select'; brand_id: string; dealer: string }
  | { event: 'sbo_model_select'; model_id: string; dealer: string }
  | { event: 'sbo_service_toggle'; service_id: string; action: 'add' | 'remove'; dealer: string }
  | { event: 'sbo_recommendation_request'; vin_provided: boolean; mileage: number; dealer: string }
  | { event: 'sbo_recommendation_apply'; service_count: number; dealer: string }
  | { event: 'sbo_booking_submit_attempt'; dealer: string; services_count: number; total_eur: number }
  | { event: 'sbo_booking_success'; booking_id: string; dealer: string; total_eur: number }
  | { event: 'sbo_booking_error'; step: number; error_code: string; dealer: string }
  | { event: 'sbo_widget_close'; last_step: 1 | 2 | 3; completed: boolean; dealer: string }
