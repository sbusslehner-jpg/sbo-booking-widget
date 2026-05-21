import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, CalendarPlus, Printer, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/Button'
import { ConsentGatedMap } from '../components/ConsentGatedMap'
import { formatDate, formatEUR } from '../components/util'
import { useWidget } from './WidgetContext'
import { fireConfetti } from './confetti'
import { generateIcs, icsToDataUrl } from './ics'
import type { BookingDraft, Service, ServiceCenter } from '../types'

type Props = {
  bookingId: string
  draft: BookingDraft
}

const TIRE_STORAGE_PRICE = 45

export function SuccessView({ bookingId, draft }: Props) {
  const { t } = useTranslation()
  const { isOverlay, onClose, service } = useWidget()
  const containerRef = useRef<HTMLDivElement>(null)

  const [services, setServices] = useState<Service[]>([])
  const [center, setCenter] = useState<ServiceCenter | null>(null)

  // Konfetti einmalig beim Mount.
  useEffect(() => {
    if (!containerRef.current) return
    return fireConfetti(containerRef.current, { particleCount: 160, duration: 3200 })
  }, [])

  // Service- und Center-Details auflösen für die Übersicht.
  useEffect(() => {
    let mounted = true
    void service.getServices(draft.vehicle.model ?? undefined).then((s) => {
      if (mounted) setServices(s)
    })
    void service.getServiceCenter(draft.serviceCenter.id).then((c) => {
      if (mounted) setCenter(c)
    })
    return () => {
      mounted = false
    }
  }, [service, draft.vehicle.model, draft.serviceCenter.id])

  const selectedServices = useMemo(
    () => services.filter((s) => draft.services.selected.includes(s.id)),
    [services, draft.services.selected],
  )

  const total = useMemo(() => {
    const sum = selectedServices.reduce((acc, s) => acc + (s.price ?? 0), 0)
    return sum + (draft.services.tireStorage ? TIRE_STORAGE_PRICE : 0)
  }, [selectedServices, draft.services.tireStorage])

  const icsUrl = useMemo(() => {
    if (!draft.appointment.date || !draft.appointment.time || !center) return null
    const ics = generateIcs({
      title: t('success.icsTitle', { center: center.name }),
      description: [
        t('success.icsDescription', { id: bookingId }),
        selectedServices.length > 0
          ? `${t('step3.serviceSection')}: ${selectedServices.map((s) => s.name).join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      location: `${center.name}, ${center.address}, ${center.zip} ${center.city}`,
      date: draft.appointment.date,
      time: draft.appointment.time,
      durationMin: 90,
    })
    return icsToDataUrl(ics)
  }, [bookingId, center, draft.appointment.date, draft.appointment.time, selectedServices])

  const firstName = draft.customer.firstName?.trim()

  return (
    <div ref={containerRef} className="relative flex flex-col h-full max-h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto bw-scroll">
        {/* Hero */}
        <div className="px-6 pt-10 pb-8 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" strokeWidth={2.2} />
          </span>
          <h2 className="text-2xl font-semibold leading-tight mb-2">
            {firstName
              ? t('success.titlePersonal', { name: firstName })
              : t('success.titleGeneric')}
          </h2>
          <p className="text-sm text-text-muted mb-1 max-w-sm mx-auto leading-snug">
            {t('success.subtitle')}
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-surface-muted text-xs font-medium text-text">
            {t('success.bookingId', { id: bookingId })}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Termin & Service-Center kombiniert */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              {t('success.appointmentSection')}
            </h3>
            <div className="rounded-md border border-border bg-surface overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="p-4">
                  <div className="text-xs text-text-muted mb-0.5">
                    {t('step3.details.date')}
                  </div>
                  <div className="text-base font-semibold">
                    {formatDate(draft.appointment.date)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-text-muted mb-0.5">
                    {t('step3.details.time')}
                  </div>
                  <div className="text-base font-semibold">
                    {draft.appointment.time ?? '—'}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 pt-3 border-t border-border bg-surface-muted/30">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-surface shrink-0 mt-0.5 border border-border">
                    <MapPin className="w-4 h-4 text-text" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{center?.name ?? '—'}</div>
                    <div className="text-xs text-text-muted">
                      {center
                        ? `${center.address}, ${center.zip} ${center.city}`
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Karte — consent-gated */}
          {center && (
            <ConsentGatedMap
              name={center.name}
              address={center.address}
              zip={center.zip}
              city={center.city}
            />
          )}

          {/* Service-Übersicht */}
          {selectedServices.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {t('success.summarySection')}
              </h3>
              <ul className="rounded-md border border-border bg-surface overflow-hidden divide-y divide-border">
                {selectedServices.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm">{s.name}</span>
                    <span className="text-sm font-medium">
                      {s.price ? formatEUR(s.price) : '—'}
                    </span>
                  </li>
                ))}
                {draft.services.tireStorage && (
                  <li className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm">{t('step3.tireStorageTitle')}</span>
                    <span className="text-sm font-medium">
                      {formatEUR(TIRE_STORAGE_PRICE)}
                    </span>
                  </li>
                )}
                <li className="flex items-center justify-between px-4 py-3 bg-surface-muted/50">
                  <span className="text-sm font-semibold">
                    {t('step3.totalLabel')}
                  </span>
                  <span className="text-base font-semibold">{formatEUR(total)}</span>
                </li>
              </ul>
            </section>
          )}

          {/* Nächste Schritte */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              {t('success.nextStepsTitle')}
            </h3>
            <ol className="space-y-2">
              {(t('success.nextSteps', { returnObjects: true }) as string[]).map(
                (step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-text leading-snug"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-fg text-[11px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ),
              )}
            </ol>
          </section>
        </div>
      </div>

      {/* Sticky Action-Bar */}
      <div className="border-t border-border bg-surface px-6 py-4 flex flex-wrap items-center gap-2 print:hidden">
        {icsUrl && (
          <a
            href={icsUrl}
            download={`werkstatt-termin-${bookingId}.ics`}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold bg-surface border border-border text-text hover:border-primary/40 hover:bg-surface-muted transition-all bw-focus"
          >
            <CalendarPlus className="w-4 h-4" aria-hidden="true" />
            {t('success.addToCalendar')}
          </a>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold bg-surface border border-border text-text hover:border-primary/40 hover:bg-surface-muted transition-all bw-focus"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          {t('success.print')}
        </button>
        <div className="flex-1" />
        {isOverlay && (
          <Button onClick={onClose}>{t('success.close')}</Button>
        )}
      </div>
    </div>
  )
}
