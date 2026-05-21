import { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '../components/ProgressBar'
import { useWidget } from './WidgetContext'

type Props = {
  step: 1 | 2 | 3
  onBack?: () => void
  /** Optionaler Sticky-Footer. */
  footer?: ReactNode
  /** Bottom-Bereich unter dem Body, oberhalb des Footers. */
  belowBody?: ReactNode
  children: ReactNode
}

export function WidgetShell({ step, onBack, footer, belowBody, children }: Props) {
  const { t } = useTranslation()
  const { isOverlay, onClose } = useWidget()
  const showBack = !!onBack && step > 1

  return (
    <div className="flex flex-col h-full max-h-full bg-surface text-text">
      <div className="px-6 pt-5 pb-4">
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

      <div className="flex-1 overflow-y-auto bw-scroll px-6 pb-6">{children}</div>

      {belowBody}

      {footer && (
        <div className="border-t border-border bg-surface px-6 py-4">{footer}</div>
      )}
    </div>
  )
}
