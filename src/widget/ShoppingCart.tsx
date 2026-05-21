import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, ChevronUp, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWidget } from './WidgetContext'
import { useBookingStore } from '../state/store'
import { cn, formatEUR } from '../components/util'
import type { Service } from '../types'

const TIRE_STORAGE_PRICE = 45

/**
 * Sticky-Cart-Bar zwischen Body und Footer in jedem Schritt.
 * - Versteckt sich, wenn keine Services gewählt sind (Step 1, Step 2 vor Auswahl)
 * - Compact-Modus: zeigt Count + Total in einer Zeile
 * - Expanded: Liste der Services mit X-Button zum Entfernen
 */
export function ShoppingCartBar() {
  const { t } = useTranslation()
  const { service } = useWidget()
  const draft = useBookingStore((s) => s.draft)
  const patch = useBookingStore((s) => s.patch)
  const [services, setServices] = useState<Service[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let mounted = true
    void service.getServices(draft.vehicle.model ?? undefined).then((s) => {
      if (mounted) setServices(s)
    })
    return () => {
      mounted = false
    }
  }, [service, draft.vehicle.model])

  const selectedServices = useMemo(
    () => services.filter((s) => draft.services.selected.includes(s.id)),
    [services, draft.services.selected],
  )

  const itemCount =
    selectedServices.length + (draft.services.tireStorage ? 1 : 0)

  const total = useMemo(() => {
    const sum = selectedServices.reduce((acc, s) => acc + (s.price ?? 0), 0)
    return sum + (draft.services.tireStorage ? TIRE_STORAGE_PRICE : 0)
  }, [selectedServices, draft.services.tireStorage])

  // Wenn die Cart leer ist, gar nicht anzeigen — Step 1 hat noch keine Auswahl.
  if (itemCount === 0) return null

  const removeService = (id: string) => {
    patch('services', {
      selected: draft.services.selected.filter((x) => x !== id),
    })
  }

  return (
    <div className="border-t border-border bg-surface-muted">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-6 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-muted/80 transition-colors bw-focus"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-sm">
          <span className="relative">
            <ShoppingCart className="w-4 h-4 text-text" aria-hidden="true" />
            <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-fg text-[10px] font-bold">
              {itemCount}
            </span>
          </span>
          <span className="font-medium text-text">
            {t('cart.label', { count: itemCount })}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">
            {formatEUR(total)}
          </span>
          <ChevronUp
            className={cn(
              'w-4 h-4 text-text-muted transition-transform',
              expanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </span>
      </button>
      {expanded && (
        <div className="px-6 pb-3 pt-1 max-h-44 overflow-y-auto bw-scroll space-y-1.5 border-t border-border/50">
          {selectedServices.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 text-sm py-1"
            >
              <span className="flex-1 min-w-0 truncate">{s.name}</span>
              <span className="font-medium shrink-0">
                {s.price ? formatEUR(s.price) : '—'}
              </span>
              <button
                type="button"
                onClick={() => removeService(s.id)}
                aria-label={t('cart.remove')}
                className="p-0.5 text-text-muted hover:text-red-600 rounded shrink-0 bw-focus"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {draft.services.tireStorage && (
            <div className="flex items-center justify-between gap-2 text-sm py-1">
              <span className="flex-1 min-w-0 truncate">
                {t('cart.tireStorage')}
              </span>
              <span className="font-medium shrink-0">
                {formatEUR(TIRE_STORAGE_PRICE)}
              </span>
              <button
                type="button"
                onClick={() => patch('services', { tireStorage: false })}
                aria-label={t('cart.remove')}
                className="p-0.5 text-text-muted hover:text-red-600 rounded shrink-0 bw-focus"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
