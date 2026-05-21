import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/Button'
import { useWidget } from './WidgetContext'

type Props = {
  bookingId: string
}

export function SuccessView({ bookingId }: Props) {
  const { t } = useTranslation()
  const { isOverlay, onClose } = useWidget()
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 h-full">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 text-success mb-4">
        <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold mb-1">{t('success.title')}</h2>
      <p className="text-sm text-text-muted mb-2 max-w-sm">{t('success.subtitle')}</p>
      <div className="text-xs text-text-muted mb-6">
        {t('success.bookingId', { id: bookingId })}
      </div>
      {isOverlay && <Button onClick={onClose}>{t('success.close')}</Button>}
    </div>
  )
}
