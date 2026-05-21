import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '../utils/zodResolver'
import { useTranslation, Trans } from 'react-i18next'
import { MapPin, Mail } from 'lucide-react'
import { Button } from '../components/Button'
import { CarlogBanner } from '../components/CarlogBanner'
import { FormField } from '../components/FormField'
import { PhoneInput } from '../components/PhoneInput'
import { Select } from '../components/Select'
import { Toggle } from '../components/Toggle'
import { cn, formatDate, formatEUR } from '../components/util'
import { useBookingStore } from '../state/store'
import { customerSchema, type CustomerInput } from '../state/schemas'
import { useWidget } from '../widget/WidgetContext'
import { WidgetShell } from '../widget/WidgetShell'
import type { Service, ServiceCenter, Slot } from '../types'

type Props = {
  onBack: () => void
  onSubmit: () => Promise<void> | void
  submitting: boolean
}

const TIRE_STORAGE_PRICE = 45

export function Step3Checkout({ onBack, onSubmit, submitting }: Props) {
  const { t } = useTranslation()
  const { service } = useWidget()
  const draft = useBookingStore((s) => s.draft)
  const patch = useBookingStore((s) => s.patch)

  const [services, setServices] = useState<Service[]>([])
  const [center, setCenter] = useState<ServiceCenter | null>(null)
  const [nextSlots, setNextSlots] = useState<Slot[]>([])

  useEffect(() => {
    let mounted = true
    void service.getServices(draft.vehicle.model ?? undefined).then((s) => {
      if (mounted) setServices(s)
    })
    return () => {
      mounted = false
    }
  }, [service, draft.vehicle.model])

  useEffect(() => {
    let mounted = true
    void service.getServiceCenter(draft.serviceCenter.id).then((c) => {
      if (mounted) setCenter(c)
    })
    void service.getNextSlots(draft.serviceCenter.id, 3).then((s) => {
      if (mounted) setNextSlots(s)
    })
    return () => {
      mounted = false
    }
  }, [service, draft.serviceCenter.id])

  const selectedServices = useMemo(
    () => services.filter((s) => draft.services.selected.includes(s.id)),
    [services, draft.services.selected],
  )

  const total = useMemo(() => {
    const sum = selectedServices.reduce((acc, s) => acc + (s.price ?? 0), 0)
    return sum + (draft.services.tireStorage ? TIRE_STORAGE_PRICE : 0)
  }, [selectedServices, draft.services.tireStorage])

  // react-hook-form mit Default-Werten aus Draft. Synced bidirektional.
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: { ...draft.customer } as CustomerInput,
  })

  // Form-Werte → Store synchronisieren (debounced via Store-Update)
  const watched = watch()
  useEffect(() => {
    patch('customer', watched)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watched)])

  const advisorOptions = useMemo(() => {
    return (center?.advisors ?? []).map((a) => ({ value: a.id, label: a.name }))
  }, [center])

  const handleFormSubmit = handleSubmit(() => {
    void onSubmit()
  })

  const fieldError = (key: keyof CustomerInput): string | undefined => {
    const e = errors[key]
    if (!e) return undefined
    const msg = (e.message as string) || 'required'
    if (msg === 'email') return t('validation.email')
    if (msg === 'phone') return t('validation.phone')
    if (msg === 'zip') return t('validation.zip')
    if (msg === 'terms') return t('validation.terms')
    return t('validation.required')
  }

  return (
    <WidgetShell
      step={3}
      onBack={onBack}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-text-muted">{t('step3.totalLabel')}</div>
            <div className="text-lg font-semibold">{formatEUR(total)}</div>
          </div>
          <Button onClick={handleFormSubmit} disabled={!isValid || submitting}>
            {submitting ? t('common.loading') : t('common.submit')}
          </Button>
        </div>
      }
    >
      <h2 className="text-xl font-semibold mb-1">{t('step3.title')}</h2>
      <p className="text-sm text-text-muted mb-5">{t('step3.subtitle')}</p>

      {/* Servicebetrieb */}
      <Section title={t('step3.centerSection')}>
        <div className="p-4 rounded-md border border-border bg-surface flex items-start gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-surface-muted shrink-0">
            <MapPin className="w-4 h-4 text-text" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <div className="font-semibold">{center?.name ?? '—'}</div>
            <div className="text-sm text-text-muted">
              {center ? `${center.address}, ${center.zip} ${center.city}` : ''}
            </div>
          </div>
        </div>
        <ToggleRow
          label={t('step3.contactlessToggle')}
          checked={draft.serviceCenter.contactlessDropoff}
          onChange={(v) => patch('serviceCenter', { contactlessDropoff: v })}
        />
        {center && (
          <div className="mt-3 p-3 rounded-md bg-info-bg text-sm flex gap-2">
            <Mail className="w-4 h-4 text-text mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-text-muted">
                {t('step3.centerNote', { name: center.name })}{' '}
              </span>
              <em className="not-italic font-medium">{center.contactNote}</em>
            </div>
          </div>
        )}
      </Section>

      {/* Serviceberater */}
      <Section title={t('step3.advisorSection')} change>
        <ToggleRow
          label={t('step3.advisorRandom')}
          checked={draft.serviceCenter.advisorMode === 'random'}
          onChange={(v) =>
            patch('serviceCenter', { advisorMode: v ? 'random' : 'specific' })
          }
        />
        {draft.serviceCenter.advisorMode === 'specific' && (
          <div className="mt-3">
            <Select
              label={t('step3.advisorSection')}
              value={draft.serviceCenter.advisorId ?? ''}
              onChange={(e) =>
                patch('serviceCenter', { advisorId: e.target.value })
              }
              options={advisorOptions}
              placeholder="Bitte wählen"
            />
          </div>
        )}
        <div className="mt-3 relative">
          <textarea
            rows={3}
            maxLength={250}
            value={draft.serviceCenter.messageToAdvisor}
            onChange={(e) =>
              patch('serviceCenter', { messageToAdvisor: e.target.value })
            }
            placeholder={t('step3.advisorMessageLabel')}
            className="w-full p-3 rounded-md border border-border bg-surface text-text resize-none outline-none focus:border-primary transition-colors"
          />
          <div className="absolute bottom-2 right-3 text-xs text-text-muted">
            {draft.serviceCenter.messageToAdvisor.length} / 250
          </div>
        </div>
      </Section>

      {/* Terminauswahl */}
      <Section title={t('step3.appointmentSection')}>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label={t('step3.appointmentDate')}
            type="date"
            value={draft.appointment.date ?? ''}
            onChange={(e) => patch('appointment', { date: e.target.value })}
          />
          <FormField
            label={t('step3.appointmentTime')}
            type="time"
            value={draft.appointment.time ?? ''}
            onChange={(e) => patch('appointment', { time: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <div className="text-xs text-text-muted mb-2">{t('step3.nextSlots')}</div>
          <div className="flex flex-wrap gap-2">
            {nextSlots.map((s) => {
              const active =
                draft.appointment.date === s.date && draft.appointment.time === s.time
              return (
                <button
                  key={`${s.date}-${s.time}`}
                  type="button"
                  onClick={() =>
                    patch('appointment', { date: s.date, time: s.time })
                  }
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-md border transition-colors bw-focus',
                    active
                      ? 'border-primary bg-primary text-primary-fg'
                      : 'border-border bg-surface hover:border-primary/40',
                  )}
                >
                  {formatDate(s.date)} | {s.time}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-4">
          <ToggleRow
            label={t('step3.replacementCar')}
            checked={draft.appointment.needsReplacementCar}
            onChange={(v) => patch('appointment', { needsReplacementCar: v })}
          />
        </div>
      </Section>

      {/* Ihre Daten */}
      <Section title={t('step3.dataSection')}>
        <div className="mb-3">
          <CarlogBanner />
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-3" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              control={control}
              name="salutation"
              render={({ field }) => (
                <Select
                  label={t('step3.salutation')}
                  {...field}
                  options={[
                    { value: 'mr', label: t('salutationOptions.mr') },
                    { value: 'ms', label: t('salutationOptions.ms') },
                    { value: 'neutral', label: t('salutationOptions.neutral') },
                  ]}
                  placeholder="Bitte wählen"
                  error={fieldError('salutation')}
                />
              )}
            />
            <FormField
              label={t('step3.email')}
              type="email"
              autoComplete="email"
              {...register('email')}
              error={fieldError('email')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label={t('step3.firstName')}
              autoComplete="given-name"
              {...register('firstName')}
              error={fieldError('firstName')}
            />
            <FormField
              label={t('step3.lastName')}
              autoComplete="family-name"
              {...register('lastName')}
              error={fieldError('lastName')}
            />
          </div>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Controller
                control={control}
                name="phoneCountry"
                render={({ field: cf }) => (
                  <PhoneInput
                    country={cf.value}
                    onCountryChange={cf.onChange}
                    number={field.value}
                    onNumberChange={field.onChange}
                    label={t('step3.phone')}
                    error={fieldError('phone')}
                  />
                )}
              />
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
            <FormField
              label={t('step3.address')}
              autoComplete="street-address"
              {...register('address')}
              error={fieldError('address')}
            />
            <FormField
              label={t('step3.zip')}
              autoComplete="postal-code"
              {...register('zip')}
              error={fieldError('zip')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label={t('step3.city')}
              autoComplete="address-level2"
              {...register('city')}
              error={fieldError('city')}
            />
            <FormField
              label={t('step3.country')}
              autoComplete="country-name"
              {...register('country')}
              error={fieldError('country')}
            />
          </div>
          <div className="flex items-start gap-3 mt-2">
            <Controller
              control={control}
              name="acceptedTerms"
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="bw-terms"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-[color:var(--color-primary)] bw-focus"
                />
              )}
            />
            <label htmlFor="bw-terms" className="text-sm">
              <Trans
                i18nKey="step3.terms"
                components={{
                  agb: (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-accent-blue hover:underline"
                    />
                  ),
                  privacy: (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-accent-blue hover:underline"
                    />
                  ),
                }}
              />
              {fieldError('acceptedTerms') && (
                <div className="text-xs text-red-600 mt-1">
                  {fieldError('acceptedTerms')}
                </div>
              )}
            </label>
          </div>
        </form>
      </Section>

      {/* Buchungsübersicht */}
      <Section title={t('step3.summarySection')} change>
        <ToggleRow
          label={t('step3.topcardToggle')}
          checked={draft.customer.hasTopcard}
          onChange={(v) => patch('customer', { hasTopcard: v })}
        />
      </Section>

      {/* Service */}
      <Section title={t('step3.serviceSection')}>
        <ul className="space-y-2">
          {selectedServices.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between p-3 rounded-md border border-border"
            >
              <span className="text-sm">1× {s.name}</span>
              <span className="text-sm font-medium">
                {s.price ? formatEUR(s.price) : '—'}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-start gap-3 p-3 rounded-md border-2 border-accent-blue bg-info-bg">
          <div className="flex-1">
            <div className="font-medium text-text">{t('step3.tireStorageTitle')}</div>
            <div className="text-xs text-text-muted">
              {t('step3.tireStorageSubtitle')}
            </div>
          </div>
          <Toggle
            checked={draft.services.tireStorage}
            onChange={(v) => patch('services', { tireStorage: v })}
          />
        </div>
      </Section>

      {/* Details */}
      <Section title={t('step3.detailsSection')}>
        <DetailRow label={t('step3.details.plate')} value="—" />
        <DetailRow
          label={t('step3.details.mileage')}
          value={
            draft.vehicle.mileage
              ? `${draft.vehicle.mileage.toLocaleString('de-AT')} km`
              : '—'
          }
        />
        <DetailRow
          label={t('step3.details.replacementCar')}
          value={draft.appointment.needsReplacementCar ? t('common.yes') : t('common.no')}
        />
        <DetailRow
          label={t('step3.details.date')}
          value={formatDate(draft.appointment.date)}
        />
        <DetailRow
          label={t('step3.details.time')}
          value={draft.appointment.time ?? '—'}
        />
        <DetailRow label={t('step3.details.dropoff')} value={center?.name ?? '—'} />
        <DetailRow label={t('step3.details.pickup')} value={center?.name ?? '—'} />
      </Section>
    </WidgetShell>
  )
}

function Section({
  title,
  change,
  children,
}: {
  title: string
  change?: boolean
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {change && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-xs text-accent-blue hover:underline"
          >
            {t('common.change')}
          </a>
        )}
      </div>
      {children}
    </section>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 border-border">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
