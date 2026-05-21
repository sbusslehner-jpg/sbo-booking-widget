import { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '../components/ProgressBar'
import { useWidget } from './WidgetContext'
import { ShoppingCartBar } from './ShoppingCart'

type Props = {
  step: 1 | 2 | 3
  onBack?: () => void
  /** Sticky-Footer (z.B. Weiter-Button + ggf. Subtotal). */
  footer?: ReactNode
  /** Wenn false, wird die Sticky-Shopping-Cart in diesem Schritt nicht gezeigt. */
  showCart?: boolean
  children: ReactNode
}

export function WidgetShell({
  step,
  onBack,
  footer,
  showCart = true,
  children,
}: Props) {
  const { t } = useTranslation()
  const { isOverlay, onClose } = useWidget()
  const showBack = !!onBack && step > 1

  return (
    <div className="flex flex-col h-full max-h-full min-h-0 bg-surface text-text">
      {/* Header — shrink-0 sorgt dafür, dass er bei knappem Platz nicht zusammengedrückt wird */}
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text -ml-1 px-1 py-1 rounded-md bw-focus transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>{t('common.back')}</span>
              </button>
            ) : (
              <span className="text-sm text-text-muted">
                {t('common.step', { current: step, total: 3 })}
              </span>
            )}
            {showBack && (
              <span className="text-sm text-text-muted/70 ml-2">
                · {t('common.step', { current: step, total: 3 })}
              </span>
            )}
          </div>
          {isOverlay && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1.5 -mr-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-muted bw-focus transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <ProgressBar current={step} total={3} />
      </div>

      {/* Body — min-h-0 ist kritisch, sonst respektiert flex-1 die Mindesthöhe der Kinder */}
      <div className="flex-1 min-h-0 overflow-y-auto bw-scroll px-6 pb-6">{children}</div>

      {/* Sticky Shopping-Cart — hidet sich self-managed wenn leer */}
      {showCart && <ShoppingCartBar />}

      {/* Footer — shrink-0, sodass Weiter-Button immer sichtbar bleibt */}
      {footer && (
        <div className="border-t border-border bg-surface px-6 py-4 shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}
