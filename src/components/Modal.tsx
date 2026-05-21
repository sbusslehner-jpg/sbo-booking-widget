import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from './util'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bw-anim-fade">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-w-md bg-surface rounded-lg shadow-widget overflow-hidden bw-anim-slide',
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="font-semibold text-text">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="p-1 -m-1 text-text-muted hover:text-text bw-focus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
