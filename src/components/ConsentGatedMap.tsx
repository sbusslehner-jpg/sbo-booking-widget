import { MapPin, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWidget } from '../widget/WidgetContext'

type Props = {
  address: string
  city: string
  zip: string
  name: string
  /**
   * Welche Consent-Kategorie muss erfüllt sein, damit die Maps geladen wird.
   * Default: 'functional'. In Produktion eher 'marketing', weil Google Maps
   * Tracking-Cookies setzt (NID etc.).
   */
  requireConsent?: 'functional' | 'analytics' | 'marketing'
}

export function ConsentGatedMap({
  address,
  city,
  zip,
  name,
  requireConsent = 'functional',
}: Props) {
  const { t } = useTranslation()
  const { consent } = useWidget()
  const allowed = consent[requireConsent]
  const query = encodeURIComponent(`${name}, ${address}, ${zip} ${city}`)

  if (!allowed) {
    return (
      <div className="relative w-full h-44 rounded-md overflow-hidden border border-border bg-surface-muted flex items-center justify-center">
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage:
                 'repeating-linear-gradient(45deg, transparent 0 20px, rgba(15,23,42,0.04) 20px 22px)',
             }}
        />
        <div className="relative text-center px-6 max-w-xs">
          <Lock className="w-5 h-5 text-text-muted mx-auto mb-2" aria-hidden="true" />
          <div className="text-sm font-medium text-text mb-1">
            {t('map.consentRequiredTitle')}
          </div>
          <div className="text-xs text-text-muted leading-snug">
            {t('map.consentRequiredBody')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-44 rounded-md overflow-hidden border border-border">
      <iframe
        title={`Karte: ${name}`}
        src={`https://www.google.com/maps?q=${query}&hl=de&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
        style={{ border: 0 }}
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/95 text-xs font-medium text-text shadow-card hover:bg-white transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        {t('map.openExternal')}
      </a>
    </div>
  )
}
