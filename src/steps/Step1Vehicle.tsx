import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BrandTile } from '../components/BrandTile'
import { CarlogBanner } from '../components/CarlogBanner'
import { ModelCard } from '../components/ModelCard'
import { Button } from '../components/Button'
import { useBookingStore } from '../state/store'
import { useWidget } from '../widget/WidgetContext'
import { WidgetShell } from '../widget/WidgetShell'
import type { Brand, Model } from '../types'

type Props = {
  onNext: () => void
}

export function Step1Vehicle({ onNext }: Props) {
  const { t } = useTranslation()
  const { service } = useWidget()
  const draft = useBookingStore((s) => s.draft)
  const patch = useBookingStore((s) => s.patch)

  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [query, setQuery] = useState('')
  const [loadingModels, setLoadingModels] = useState(false)

  useEffect(() => {
    let mounted = true
    void service.getBrands().then((b) => mounted && setBrands(b))
    return () => {
      mounted = false
    }
  }, [service])

  useEffect(() => {
    if (!draft.vehicle.brand) {
      setModels([])
      return
    }
    let mounted = true
    setLoadingModels(true)
    void service.getModels(draft.vehicle.brand).then((m) => {
      if (!mounted) return
      setModels(m)
      setLoadingModels(false)
    })
    return () => {
      mounted = false
    }
  }, [draft.vehicle.brand, service])

  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return models
    return models.filter((m) => m.name.toLowerCase().includes(q))
  }, [models, query])

  const canContinue = !!draft.vehicle.brand && !!draft.vehicle.model

  return (
    <WidgetShell
      step={1}
      footer={
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canContinue}>
            {t('common.next')}
          </Button>
        </div>
      }
    >
      <h2 className="text-xl font-semibold leading-tight mb-6">{t('step1.title')}</h2>

      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          {t('step1.brandSection')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {brands.map((b) => (
            <BrandTile
              key={b.id}
              brand={b}
              selected={draft.vehicle.brand === b.id}
              onSelect={() => {
                if (draft.vehicle.brand !== b.id) {
                  patch('vehicle', { brand: b.id, model: null })
                }
              }}
            />
          ))}
        </div>
      </section>

      <div className="mb-8">
        <CarlogBanner />
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          {t('step1.detailSection')}
        </h3>

        <div className="relative flex items-center rounded-md border border-border bg-surface focus-within:border-primary transition-colors mb-2">
          <Search className="w-4 h-4 ml-3 text-text-muted" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('step1.modelPlaceholder')}
            aria-label={t('step1.modelLabel')}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-muted"
            disabled={!draft.vehicle.brand}
          />
        </div>

        <div className="text-xs text-text-muted mb-4">{t('step1.modelMissing')}</div>

        <div className="space-y-2">
          {!draft.vehicle.brand && (
            <div className="text-sm text-text-muted py-6 text-center border border-dashed border-border rounded-md">
              Bitte zuerst eine Marke wählen.
            </div>
          )}
          {draft.vehicle.brand && loadingModels && (
            <div className="text-sm text-text-muted py-6 text-center">
              {t('common.loading')}
            </div>
          )}
          {draft.vehicle.brand && !loadingModels && filteredModels.length === 0 && (
            <div className="text-sm text-text-muted py-6 text-center">
              {t('step1.noResults')}
            </div>
          )}
          {filteredModels.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              selected={draft.vehicle.model === m.id}
              onSelect={() => patch('vehicle', { model: m.id })}
            />
          ))}
        </div>
      </section>
    </WidgetShell>
  )
}
