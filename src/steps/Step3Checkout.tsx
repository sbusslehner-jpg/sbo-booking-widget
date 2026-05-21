import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '../utils/zodResolver'
import { useTranslation, Trans } from 'react-i18next'
import { MapPin, Mail, Sparkles, Calendar, User, Car } from 'lucide-react'
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

  // Validierung läuft erst nach Blur — freundlicher als sofort-rot beim Tippen.
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    mode: 'onTouched',
    defaultValues: { ...draft.customer } as CustomerInput,
  })

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-text-muted">{t('step3.totalLabel')}</div>
            <div className="text-lg font-semibold leading-tight">{formatEUR(total)}</div>
          </div>
          <Button onClick={handleFormSubmit} disabled={!isValid || submitting}>
            {submitting ? t('common.loading') : t('common.submit')}
          </Button>
        </div>
      }
    >
      {/* Hero */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[11px] font-semibold mb-3">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          {t('common.step', { current: 3, total: 3 })}
        </div>
        <h2 className="text-2xl font-semibold leading-tight mb-1">
          {t('step3.title')}
        </h2>
        <p className="text-sm text-text-muted">{t('step3.subtitle')}</p>
      </div>

      {/* Snapshot-Karte: zeigt dem Kunden was er gleich bucht. */}
      <div className="rounded-md border border-border bg-surface mb-6 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          <SnapshotCell
            icon={<Calendar className="w-4 h-4" aria-hidden="true" />}
            label={t('step3.appointmentDate')}
            value={formatDate(draft.appointment.date)}
            placeholder={!draft.appointment.date}
          />
          <SnapshotCell
            icon={<Calendar className="w-4 h-4" aria-hidden="true" />}
            label={t('step3.appointmentTime')}
            value={draft.appointment.time ?? '—'}
            placeholder={!draft.appointment.time}
          />
          <SnapshotCell
            icon={<Car className="w-4 h-4" aria-hidden="true" />}
            label={t('step3.serviceSection')}
            value={
              selectedServices.length === 0
                ? '—'
                : selectedServices.length === 1
                ? selectedServices[0].name
                : t('cart.label', { count: selectedServices.length })
            }
            placeholder={selectedServices.length === 0}
          />
        </div>
      </div>

      {/* Termin */}
      <Section
        icon={<Calendar className="w-4 h-4" />}
        title={t('step3.appointmentSection')}
      >
        <div className="grid grid-cols-2 gap-3 mb-3">
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
        <div className="mb-4">
          <div className="text-xs font-medium text-text-muted mb-2">
            {t('step3.nextSlots')}
          </div>
          <div className="flex flex-wrap gap-2">
            {nextSlots.map((s) => {
              const active =
                draft.appointment.date === s.date && draft.appointment.time === s.time
              return (
                <button
                  key={`${s.date}-${s.time}`}
                  type="button"
                  onClick={() => patch('appointment', { date: s.date, time: s.time })}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-md border transition-all bw-focus',
                    active
                      ? 'border-primary bg-primary text-primary-fg shadow-sm'
                      : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-muted',
                  )}
                >
                  {formatDate(s.date)} · {s.time}
                </button>
              )
            })}
          </div>
        </div>
        <ToggleRow
          label={t('step3.replacementCar')}
          checked={draft.appointment.needsReplacementCar}
          onChange={(v) => patch('appointment', { needsReplacementCar: v })}
        />
      </Section>

      {/* Servicebetrieb + Berater */}
      <Section
        icon={<MapPin className="w-4 h-4" />}
        title={t('step3.centerSection')}
      >
        <div className="p-4 rounded-md border border-border bg-surface flex items-start gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-surface-muted shrink-0">
            <MapPin className="w-4 h-4 text-text" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight">{center?.name ?? '—'}</div>
            <div className="text-sm text-text-muted mt-0.5">
              {center ? `${center.address}, ${center.zip} ${center.city}` : ''}
            </div>
          </div>
        </div>

        <ToggleRow
          label={t('step3.contactlessToggle')}
          checked={draft.serviceCenter.contactlessDropoff}
          onChange={(v) => patch('serviceCenter', { contactlessDropoff: v })}
        />

        <div className="mt-3 space-y-3">
          <ToggleRow
            label={t('step3.advisorRandom')}
            checked={draft.serviceCenter.advisorMode === 'random'}
            onChange={(v) =>
              patch('serviceCenter', { advisorMode: v ? 'random' : 'specific' })
            }
          />
          {draft.serviceCenter.advisorMode === 'specific' && (
            <Select
              label={t('step3.advisorSection')}
              value={draft.serviceCenter.advisorId ?? ''}
              onChange={(e) => patch('serviceCenter', { advisorId: e.target.value })}
              options={advisorOptions}
              placeholder={t('common.selectPlaceholder')}
            />
          )}
          <div className="relative">
            <textarea
              rows={3}
              maxLength={250}
              value={draft.serviceCenter.messageToAdvisor}
              onChange={(e) =>
                patch('serviceCenter', { messageToAdvisor: e.target.value })
              }
              placeholder={t('step3.advisorMessageLabel')}
              className="w-full p-3 rounded-md border border-border bg-surface text-sm text-text placeholder:text-text-muted resize-none outline-none focus:border-primary transition-colors"
            />
            <div className="absolute bottom-2 right-3 text-xs text-text-muted">
              {draft.serviceCenter.messageToAdvisor.length} / 250
            </div>
          </div>
        </div>

        {center && (
          <div className="mt-3 p-3 rounded-md bg-info-bg text-sm flex gap-2.5">
            <Mail
              className="w-4 h-4 text-text mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div className="leading-snug">
              <span className="text-text-muted">
                {t('step3.centerNote', { name: center.name })}{' '}
              </span>
              <em className="not-italic font-medium">{center.contactNote}</em>
            </div>
          </div>
        )}
      </Section>

      {/* Ihre Daten */}
      <Section icon={<User className="w-4 h-4" />} title={t('step3.dataSection')}>
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
                  placeholder={t('common.selectPlaceholder')}
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

          <ToggleRow
            label={t('step3.topcardToggle')}
            checked={draft.customer.hasTopcard}
            onChange={(v) => patch('customer', { hasTopcard: v })}
          />

          {/* AGB prominenter */}
          <label
            htmlFor="bw-terms"
            className={cn(
              'flex items-start gap-3 p-4 rounded-md border-2 cursor-pointer transition-colors',
              draft.customer.acceptedTerms
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface hover:border-primary/40',
              fieldError('acceptedTerms') && 'border-red-500',
            )}
          >
            <Controller
              control={control}
              name="acceptedTerms"
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="bw-terms"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[color:var(--color-primary)] bw-focus shrink-0"
                />
              )}
            />
            <span className="text-sm leading-snug flex-1">
              <Trans
                i18nKey="step3.terms"
                components={{
                  agb: (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-accent-blue hover:underline font-medium"
                    />
                  ),
                  privacy: (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-accent-blue hover:underline font-medium"
                    />
                  ),
                }}
              />
              {fieldError('acceptedTerms') && (
                <span className="block text-xs text-red-600 mt-1.5">
                  {fieldError('acceptedTerms')}
                </span>
              )}
            </span>
          </label>
        </form>
      </Section>

      {/* Service-Detail-Box ans Ende — als Vergewisserung was bestellt wird */}
      {selectedServices.length > 0 && (
        <div className="rounded-md border border-border bg-surface-muted/50 p-4 -mx-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            {t('step3.summarySection')}
          </div>
          <ul className="space-y-1.5">
            {selectedServices.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="font-medium">
                  {s.price ? formatEUR(s.price) : '—'}
                </span>
              </li>
            ))}
            {draft.services.tireStorage && (
              <li className="flex items-center justify-between text-sm">
                <span>{t('step3.tireStorageTitle')}</span>
                <span className="font-medium">{formatEUR(TIRE_STORAGE_PRICE)}</span>
              </li>
            )}
            <li className="flex items-center justify-between pt-2 mt-2 border-t border-border text-sm font-semibold">
              <span>{t('step3.totalLabel')}</span>
              <span>{formatEUR(total)}</span>
            </li>
          </ul>
        </div>
      )}
    </WidgetShell>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        {icon && <span className="text-text">{icon}</span>}
        {title}
      </h3>
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
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-border">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

function SnapshotCell({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  placeholder: boolean
}) {
  return (
    <div className="p-3.5">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-text-muted mb-1">
        <span className="text-text-muted">{icon}</span>
        {label}
      </div>
      <div
        className={cn(
          'text-sm font-semibold truncate',
          placeholder && 'text-text-muted/60',
        )}
      >
        {value}
      </div>
    </div>
  )
}
