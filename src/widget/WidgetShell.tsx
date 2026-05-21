import { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '../components/ProgressBar'
import { useWidget } from './WidgetContext'
import { cn } from '../components/util'

type Props = {
  step: 1 | 2 | 3
  onBack?: () => void
  /** Optionaler Sticky-Footer (z.B. mit Summe + Next-Button). */
  footer?: ReactNode
  /** Bottom-Bereich unter dem Body, oberhalb des Footers (z.B. Sticky-Summe Mobile). */
  belowBody?: ReactNode
  children: ReactNode
}

export function WidgetShell({ step, onBack, footer, belowBody, children }: Props) {
  const { t } = useTranslation()
  const { isOverlay, isMobile, onClose } = useWidget()

  return (
    <div className="flex flex-col h-full max-h-full bg-surface text-text">
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            {isMobile && onBack && step > 1 && (
              <button
                type="button"
                onClick={onBack}
                aria-label={t('common.back')}
                className="p-1 -ml-1 text-text-muted hover:text-text bw-focus"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span>{t('common.step', { current: step, total: 3 })}</span>
          </div>
          {isOverlay && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1 -mr-1 text-text-muted hover:text-text bw-focus"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <ProgressBar current={step} total={3} />
      </div>

      <div className={cn('flex-1 overflow-y-auto bw-scroll px-5 py-5')}>{children}</div>

      {belowBody}

      {footer && (
        <div className="border-t border-border bg-surface px-5 py-4">{footer}</div>
      )}
    </div>
  )
}
