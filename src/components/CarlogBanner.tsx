import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWidget } from '../widget/WidgetContext'

export function CarlogBanner() {
  const { t } = useTranslation()
  const { hasPrefilledCustomer } = useWidget()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Daten kommen bereits via Prefill (carlog/E-Mail-Einladung) — anderer Hinweis.
  if (hasPrefilledCustomer) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-md bg-info-bg text-text">
        <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1 text-sm leading-snug">
          <div className="font-semibold mb-0.5">Daten übernommen</div>
          <div className="text-text-muted">
            Ihre Stammdaten wurden aus carlog automatisch übernommen. Sie können sie
            unten bei Bedarf anpassen.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-md bg-info-bg text-text">
      <div className="flex-1 text-sm">
        <div className="font-semibold mb-0.5">{t('carlog.title')}</div>
        <div className="text-text-muted">{t('carlog.subtitle')}</div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
          }}
          className="inline-block mt-2 text-accent-blue font-medium hover:underline bw-focus"
        >
          {t('carlog.cta')}
        </a>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t('common.close')}
        className="p-1 -m-1 text-text-muted hover:text-text bw-focus"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
