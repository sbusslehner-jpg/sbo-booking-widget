import { useEffect, useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Step1Vehicle } from '../steps/Step1Vehicle'
import { Step2Service } from '../steps/Step2Service'
import { Step3Checkout } from '../steps/Step3Checkout'
import { SuccessView } from './SuccessView'
import { InlineWrapper } from './modes/InlineWrapper'
import { OverlayWrapper } from './modes/OverlayWrapper'
import { WidgetProvider, useWidget } from './WidgetContext'
import { initI18n } from '../i18n'
import { useBookingStore } from '../state/store'
import { useDraftPersistence, clearDraft } from '../state/persistence'
import { createStorageAdapter } from '../state/storage/factory'
import type { StorageAdapter } from '../state/storage/StorageAdapter'
import { useMediaQuery } from './useMediaQuery'
import { defaultBookingService } from '../data/service'
import type { BookingService } from '../types'
import {
  mergePrefills,
  parseUrlPrefill,
  type PrefillData,
} from '../state/prefill'
import {
  decodePrefillToken,
  tokenToPrefill,
} from '../state/prefillToken'
import {
  FULL_CONSENT,
  NO_CONSENT,
  readOneTrustConsent,
  subscribeOneTrustConsent,
  type ConsentState,
} from '../state/consent'
import { useAnalytics } from '../analytics/useAnalytics'
import { AnalyticsProvider, useTrack } from '../analytics/AnalyticsContext'
import type { AnalyticsSink } from '../analytics/dataLayer'
import type { ThemeInput } from './themes'

export type BookingWidgetProps = {
  dealerId: string
  mode?: 'inline' | 'overlay'
  open?: boolean
  onClose?: () => void
  service?: BookingService
  storage?: StorageAdapter
  /** TTL für persistenten Draft in ms. Default 24h. */
  draftTtlMs?: number
  language?: string
  onBooked?: (bookingId: string) => void
  prefill?: PrefillData
  /**
   * Signierter JWT vom Backend mit Kundendaten. Wenn gesetzt, gilt der
   * dekodierte Payload als trusted-Quelle. Plain-`prefill.customer` wird
   * dann verworfen.
   */
  prefillToken?: string
  readUrlParams?: boolean
  urlParamPrefix?: string
  theme?: ThemeInput
  /**
   * Consent-State der Trägerseite. Steuert:
   * - functional: Persistenz im localStorage (vs. in-memory)
   * - analytics:  Event-Tracking an window.dataLayer (vs. aus)
   *
   * Default-Verhalten: wenn `consent` nicht übergeben wird, versucht das
   * Widget OneTrust-Konsent via `window.OnetrustActiveGroups` zu lesen.
   * Findet es nichts, fällt es auf NO_CONSENT zurück (sicheres Default).
   *
   * Mit `consent={FULL_CONSENT}` lässt sich das in Dev-Umgebungen / hinter
   * eigener CMP-Lösung explizit überschreiben.
   */
  consent?: ConsentState
  /** Eigener Analytics-Sink statt window.dataLayer. */
  analyticsSink?: AnalyticsSink
}

function resolveInitialConsent(explicit: ConsentState | undefined): ConsentState {
  if (explicit) return explicit
  if (typeof window === 'undefined') return NO_CONSENT
  const fromOneTrust = readOneTrustConsent()
  if (
    fromOneTrust.functional ||
    fromOneTrust.analytics ||
    fromOneTrust.marketing
  ) {
    return fromOneTrust
  }
  return NO_CONSENT
}

export function BookingWidget({
  dealerId,
  mode = 'overlay',
  open = true,
  onClose,
  service,
  storage,
  draftTtlMs,
  language = 'de',
  onBooked,
  prefill,
  prefillToken,
  readUrlParams = true,
  urlParamPrefix = 'bw_',
  consent: consentProp,
  analyticsSink,
}: BookingWidgetProps) {
  const i18n = useMemo(() => initI18n(language), [language])
  const resolvedService = service ?? defaultBookingService
  const isMobile = useMediaQuery('(max-width: 767px)')
  const handleClose = onClose ?? (() => {})

  // Consent — initial aus Prop oder OneTrust, dann reaktiv halten.
  const [consent, setConsent] = useState<ConsentState>(() =>
    resolveInitialConsent(consentProp),
  )
  useEffect(() => {
    if (consentProp) {
      setConsent(consentProp)
      return
    }
    // Wenn kein expliziter Prop, auf OneTrust-Änderungen lauschen.
    return subscribeOneTrustConsent((next) => setConsent(next))
  }, [consentProp])

  // Storage-Adapter: respektiert Consent.
  const adapter = useMemo<StorageAdapter>(() => {
    if (storage) return storage
    return createStorageAdapter({ dealerId, consent, ttlMs: draftTtlMs })
  }, [storage, dealerId, consent, draftTtlMs])

  // Wenn functional consent widerrufen wird, alle persistierten Drafts
  // explizit aus localStorage löschen — sonst lebt der Draft länger als
  // der Consent dazu.
  useEffect(() => {
    if (consent.functional) return
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(`booking-draft:${dealerId}`)
    } catch {
      // Privacy-Modus etc. — egal
    }
  }, [consent.functional, dealerId])

  // Token dekodieren + final Prefill bauen.
  // Reihenfolge: URL-Params < explizites prefill < prefillToken
  // Token gewinnt, weil signiert/trusted.
  const decodedToken = useMemo(() => decodePrefillToken(prefillToken), [prefillToken])
  const resolvedPrefill = useMemo<PrefillData | undefined>(() => {
    const fromUrl =
      readUrlParams && typeof window !== 'undefined'
        ? parseUrlPrefill(window.location.search, urlParamPrefix)
        : undefined
    const fromToken = decodedToken ? tokenToPrefill(decodedToken) : undefined
    // Wenn ein Token da ist, NICHT die plain prefill.customer-Felder akzeptieren —
    // Token ist die canonical source für Kundendaten.
    const sanitizedExplicit = decodedToken && prefill?.customer
      ? { ...prefill, customer: undefined }
      : prefill
    if (!fromUrl && !sanitizedExplicit && !fromToken) return undefined
    return mergePrefills(fromUrl, sanitizedExplicit, fromToken)
  }, [prefill, decodedToken, readUrlParams, urlParamPrefix])

  // Analytics-Hook.
  const { track } = useAnalytics(consent, analyticsSink)

  // Mount-Event genau einmal feuern, sobald i18n bereit ist.
  useEffect(() => {
    track({
      event: 'sbo_widget_mount',
      mode,
      dealer: dealerId,
      theme:
        typeof (resolvedPrefill as unknown) === 'string'
          ? 'custom'
          : 'default',
      has_prefill: !!resolvedPrefill,
      has_token: !!decodedToken,
    })
    // Beim Unmount Close-Event mit aktuellem Stand.
    return () => {
      const last = useBookingStore.getState().draft.step
      track({
        event: 'sbo_widget_close',
        last_step: last,
        completed: false,
        dealer: dealerId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <AnalyticsProvider track={track}>
        <WidgetProvider
          value={{
            service: resolvedService,
            dealerId,
            isOverlay: mode === 'overlay',
            isMobile,
            onClose: handleClose,
            hasPrefilledCustomer:
              !!resolvedPrefill?.customer?.email || !!decodedToken,
            consent,
          }}
        >
          {mode === 'overlay' ? (
            <OverlayWrapper open={open} onClose={handleClose}>
              <BookingFlow
                adapter={adapter}
                onBooked={onBooked}
                prefill={resolvedPrefill}
                prefillToken={decodedToken?.raw}
              />
            </OverlayWrapper>
          ) : (
            <InlineWrapper>
              <BookingFlow
                adapter={adapter}
                onBooked={onBooked}
                prefill={resolvedPrefill}
                prefillToken={decodedToken?.raw}
              />
            </InlineWrapper>
          )}
        </WidgetProvider>
      </AnalyticsProvider>
    </I18nextProvider>
  )
}

function BookingFlow({
  adapter,
  onBooked,
  prefill,
  prefillToken,
}: {
  adapter: StorageAdapter
  onBooked?: (bookingId: string) => void
  prefill?: PrefillData
  prefillToken?: string
}) {
  useDraftPersistence(adapter, prefill)
  const draft = useBookingStore((s) => s.draft)
  const setStep = useBookingStore((s) => s.setStep)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{
    bookingId: string
    draft: typeof draft
  } | null>(null)
  const { service, dealerId } = useWidget()
  const track = useTrack()

  const handleSubmit = async () => {
    setSubmitting(true)
    const snapshot = draft
    track({
      event: 'sbo_booking_submit_attempt',
      dealer: dealerId,
      services_count: snapshot.services.selected.length,
      total_eur: 0,
    })
    try {
      const result = await service.submitBooking(snapshot, { prefillToken })
      setConfirmed({ bookingId: result.bookingId, draft: snapshot })
      await clearDraft(adapter)
      track({
        event: 'sbo_booking_success',
        booking_id: result.bookingId,
        dealer: dealerId,
        total_eur: 0,
      })
      onBooked?.(result.bookingId)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'unknown'
      track({
        event: 'sbo_booking_error',
        step: 3,
        error_code: code,
        dealer: dealerId,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return <SuccessView bookingId={confirmed.bookingId} draft={confirmed.draft} />
  }

  switch (draft.step) {
    case 1:
      return (
        <Step1Vehicle
          onNext={() => {
            track({ event: 'sbo_step_view', step: 2, dealer: dealerId })
            setStep(2)
          }}
        />
      )
    case 2:
      return (
        <Step2Service
          onNext={() => {
            track({ event: 'sbo_step_view', step: 3, dealer: dealerId })
            setStep(3)
          }}
          onBack={() => {
            track({ event: 'sbo_step_view', step: 1, dealer: dealerId })
            setStep(1)
          }}
        />
      )
    case 3:
      return (
        <Step3Checkout
          onBack={() => {
            track({ event: 'sbo_step_view', step: 2, dealer: dealerId })
            setStep(2)
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )
    default:
      return null
  }
}

// Unused-Marker entfernen — FULL_CONSENT wird im Demo-Setup via Export benötigt.
export { FULL_CONSENT, NO_CONSENT }
