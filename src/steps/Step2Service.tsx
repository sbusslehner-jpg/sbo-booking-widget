import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Info, Camera, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { ServiceCard } from '../components/ServiceCard'
import { Slider } from '../components/Slider'
import { Toggle } from '../components/Toggle'
import { cn, formatEUR } from '../components/util'
import { useBookingStore } from '../state/store'
import { useWidget } from '../widget/WidgetContext'
import { WidgetShell } from '../widget/WidgetShell'
import { useTrack } from '../analytics/AnalyticsContext'
import type { Recommendation, Service } from '../types'

type Props = {
  onNext: () => void
  onBack: () => void
}

export function Step2Service({ onNext, onBack }: Props) {
  const { t } = useTranslation()
  const { service, isMobile, dealerId } = useWidget()
  const draft = useBookingStore((s) => s.draft)
  const patch = useBookingStore((s) => s.patch)
  const track = useTrack()

  const [services, setServices] = useState<Service[]>([])
  const [showExtra, setShowExtra] = useState(false)
  const [finModalOpen, setFinModalOpen] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [recommending, setRecommending] = useState(false)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [recModalOpen, setRecModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    void service.getServices(draft.vehicle.model ?? undefined).then((s) => {
      if (mounted) setServices(s)
    })
    return () => {
      mounted = false
    }
  }, [service, draft.vehicle.model])

  const mainServices = services.filter((s) => !s.extra)
  const extraServices = services.filter((s) => s.extra)

  const canContinue = draft.services.selected.length > 0

  const toggleService = (id: string) => {
    const wasSelected = draft.services.selected.includes(id)
    const selected = wasSelected
      ? draft.services.selected.filter((x) => x !== id)
      : [...draft.services.selected, id]
    patch('services', { selected })
    track({
      event: 'sbo_service_toggle',
      service_id: id,
      action: wasSelected ? 'remove' : 'add',
      dealer: dealerId,
    })
  }

  const handleRecommend = async () => {
    setRecommending(true)
    track({
      event: 'sbo_recommendation_request',
      vin_provided: !!draft.vehicle.vin && draft.vehicle.vin.length > 5,
      mileage: draft.vehicle.mileage ?? 0,
      dealer: dealerId,
    })
    try {
      const rec = await service.getServiceRecommendation(
        draft.vehicle.vin ?? '',
        draft.vehicle.mileage ?? 0,
      )
      setRecommendation(rec)
      setRecModalOpen(true)
    } finally {
      setRecommending(false)
    }
  }

  const applyRecommendation = () => {
    if (!recommendation) return
    const merged = Array.from(
      new Set([...draft.services.selected, ...recommendation.serviceIds]),
    )
    patch('services', { selected: merged })
    track({
      event: 'sbo_recommendation_apply',
      service_count: recommendation.serviceIds.length,
      dealer: dealerId,
    })
    setRecModalOpen(false)
  }

  const raederSelected = draft.services.selected.includes('raederwechsel')

  return (
    <WidgetShell
      step={2}
      onBack={onBack}
      footer={
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canContinue}>
            {t('common.next')}
          </Button>
        </div>
      }
    >
      <h2 className="text-xl font-semibold leading-tight mb-6">{t('step2.title')}</h2>

      {/* Hero-Card */}
      <div
        className="rounded-md p-6 mb-6 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #131c2c 0%, #1f3050 70%, #2a4773 100%)',
        }}
      >
        <div className="inline-block text-[10px] font-bold tracking-[0.15em] text-white/60 mb-3">
          {t('step2.heroBadge')}
        </div>
        <h3 className="text-lg font-semibold mb-1.5 leading-tight">{t('step2.heroTitle')}</h3>
        <p className="text-sm text-white/70 mb-5 leading-snug">{t('step2.heroSubtitle')}</p>

        <div className="relative flex items-center rounded-md bg-white/8 border border-white/15 focus-within:border-white/35 transition-colors mb-3">
          <input
            type="text"
            value={draft.vehicle.vin ?? ''}
            onChange={(e) =>
              patch('vehicle', { vin: e.target.value.toUpperCase().slice(0, 17) })
            }
            placeholder={t('step2.finPlaceholder')}
            aria-label={t('step2.finLabel')}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none"
          />
          <button
            type="button"
            onClick={() => setFinModalOpen(true)}
            aria-label={t('step2.finHelpTitle')}
            className="p-2 mr-1 text-white/60 hover:text-white transition-colors bw-focus"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={() => setScanModalOpen(true)}
            className="text-xs text-white/70 underline hover:text-white mb-5 inline-flex items-center gap-1.5 bw-focus"
          >
            <Camera className="w-3.5 h-3.5" />
            {t('step2.scanCta')}
          </button>
        )}

        <div className="mb-5">
          <Slider
            dark
            min={0}
            max={200000}
            step={1000}
            value={draft.vehicle.mileage ?? 0}
            onChange={(v) => patch('vehicle', { mileage: v })}
            label={t('step2.mileageLabel')}
            formatValue={(v) => `${v.toLocaleString('de-AT')} km`}
          />
        </div>

        <button
          type="button"
          onClick={handleRecommend}
          disabled={recommending}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-white text-primary px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors bw-focus',
            recommending && 'opacity-70 cursor-wait',
          )}
        >
          {recommending ? t('step2.recommending') : t('step2.recommendCta')}
          {!recommending && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>

      {isMobile && (
        <div className="text-center mb-6">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm text-accent-blue hover:underline bw-focus"
          >
            {t('step2.advisorAltCta')}
          </a>
        </div>
      )}

      {/* Service-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {mainServices.map((s) => (
          <div key={s.id} className="flex flex-col gap-2">
            <ServiceCard
              service={s}
              selected={draft.services.selected.includes(s.id)}
              onToggle={() => toggleService(s.id)}
            />
            {isMobile && s.id === 'raederwechsel' && raederSelected && (
              <div className="flex items-start gap-3 p-3 rounded-md border border-border bg-surface">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {t('step2.tireStorageQuestion')}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {t('step2.tireStoragePrice')}
                  </div>
                </div>
                <Toggle
                  checked={draft.services.tireStorage}
                  onChange={(v) => patch('services', { tireStorage: v })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text my-4 bw-focus"
        aria-expanded={showExtra}
      >
        {showExtra ? t('step2.lessServices') : t('step2.moreServices')}
        {showExtra ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showExtra && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {extraServices.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              selected={draft.services.selected.includes(s.id)}
              onToggle={() => toggleService(s.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={finModalOpen}
        onClose={() => setFinModalOpen(false)}
        title={t('step2.finHelpTitle')}
      >
        <p className="text-sm text-text-muted">{t('step2.finHelpBody')}</p>
      </Modal>

      <Modal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        title={t('step2.scanCta')}
      >
        <p className="text-sm text-text-muted">{t('common.soon')}</p>
      </Modal>

      <Modal
        open={recModalOpen}
        onClose={() => setRecModalOpen(false)}
        title={t('step2.recommendation.title', {
          vehicle: recommendation?.vehicleLabel ?? '',
        })}
      >
        <p className="text-sm text-text-muted mb-4">
          {t('step2.recommendation.subtitle')}
        </p>
        <ul className="space-y-2 mb-5">
          {recommendation?.serviceIds.map((id) => {
            const s = services.find((x) => x.id === id)
            if (!s) return null
            return (
              <li
                key={id}
                className="flex items-center gap-3 p-3 rounded-md border border-border"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success text-white text-xs shrink-0">
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-text-muted">{s.description}</div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between mb-4 p-3 rounded-md bg-surface-muted">
          <span className="text-sm text-text-muted">
            {t('step2.recommendation.total')}
          </span>
          <span className="text-lg font-semibold">
            {recommendation ? formatEUR(recommendation.total) : ''}
          </span>
        </div>
        <p className="text-xs text-text-muted mb-4">{t('step2.recommendation.hint')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRecModalOpen(false)}>
            {t('step2.recommendation.back')}
          </Button>
          <Button onClick={applyRecommendation}>{t('step2.recommendation.apply')}</Button>
        </div>
      </Modal>
    </WidgetShell>
  )
}
