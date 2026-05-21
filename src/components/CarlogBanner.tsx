import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CarlogBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 p-4 rounded-md bg-info-bg text-text">
      <div className="flex-1 text-sm">
        <div className="font-semibold mb-0.5">{t('carlog.title')}</div>
        <div className="text-text-muted">{t('carlog.subtitle')}</div>
        <a
          href="#"
          onClick={(e) => {
            // TODO: echte carlog-OAuth-Anbindung — aktuell nur UI.
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
