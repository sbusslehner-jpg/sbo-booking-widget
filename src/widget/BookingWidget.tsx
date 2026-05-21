import { useMemo, useState } from 'react'
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
import { LocalStorageAdapter } from '../state/storage/LocalStorageAdapter'
import type { StorageAdapter } from '../state/storage/StorageAdapter'
import { useMediaQuery } from './useMediaQuery'
import { defaultBookingService } from '../data/service'
import type { BookingService } from '../types'

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
}: BookingWidgetProps) {
  const i18n = useMemo(() => initI18n(language), [language])
  const resolvedService = service ?? defaultBookingService
  const adapter = useMemo<StorageAdapter>(
    () => storage ?? new LocalStorageAdapter({ dealerId, ttlMs: draftTtlMs }),
    [storage, dealerId, draftTtlMs],
  )
  const isMobile = useMediaQuery('(max-width: 767px)')
  const handleClose = onClose ?? (() => {})

  return (
    <I18nextProvider i18n={i18n}>
      <WidgetProvider
        value={{
          service: resolvedService,
          dealerId,
          isOverlay: mode === 'overlay',
          isMobile,
          onClose: handleClose,
        }}
      >
        {mode === 'overlay' ? (
          <OverlayWrapper open={open} onClose={handleClose}>
            <BookingFlow adapter={adapter} onBooked={onBooked} />
          </OverlayWrapper>
        ) : (
          <InlineWrapper>
            <BookingFlow adapter={adapter} onBooked={onBooked} />
          </InlineWrapper>
        )}
      </WidgetProvider>
    </I18nextProvider>
  )
}

function BookingFlow({
  adapter,
  onBooked,
}: {
  adapter: StorageAdapter
  onBooked?: (bookingId: string) => void
}) {
  useDraftPersistence(adapter)
  const draft = useBookingStore((s) => s.draft)
  const setStep = useBookingStore((s) => s.setStep)
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const { service } = useWidget()

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await service.submitBooking(draft)
      await clearDraft(adapter)
      setBookingId(result.bookingId)
      onBooked?.(result.bookingId)
    } finally {
      setSubmitting(false)
    }
  }

  if (bookingId) {
    return <SuccessView bookingId={bookingId} />
  }

  switch (draft.step) {
    case 1:
      return <Step1Vehicle onNext={() => setStep(2)} />
    case 2:
      return <Step2Service onNext={() => setStep(3)} onBack={() => setStep(1)} />
    case 3:
      return (
        <Step3Checkout
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )
    default:
      return null
  }
}
