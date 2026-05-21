import { ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '../useMediaQuery'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function OverlayWrapper({ open, onClose, children }: Props) {
  const { t } = useTranslation()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus trap (simple, ohne externe Lib)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const root = containerRef.current
      if (!root) return
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = root.getRootNode() instanceof ShadowRoot
        ? (root.getRootNode() as ShadowRoot).activeElement
        : document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[2147483600] flex items-center justify-center bw-anim-fade"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('common.bookAppointmentAria')}
        className={
          isMobile
            ? 'absolute bottom-0 left-0 right-0 w-full h-[92vh] bg-surface rounded-t-lg shadow-widget overflow-hidden flex flex-col bw-anim-sheet'
            : 'relative w-full max-w-widget h-[min(720px,90vh)] bg-surface rounded-lg shadow-widget overflow-hidden flex flex-col bw-anim-slide'
        }
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="bw-drag-handle" />
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  )
}
