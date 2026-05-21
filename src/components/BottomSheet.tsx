import { ReactNode, useEffect } from 'react'
import { cn } from './util'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** Disable backdrop click + ESC (e.g., inline mode). */
  modal?: boolean
}

export function BottomSheet({ open, onClose, children, className, modal = true }: Props) {
  useEffect(() => {
    if (!open || !modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, modal])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2147483646] flex items-end justify-center bw-anim-fade">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={modal ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal={modal}
        className={cn(
          'relative w-full max-h-[95vh] bg-surface rounded-t-lg shadow-widget overflow-hidden flex flex-col bw-anim-sheet',
          className,
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="bw-drag-handle" />
        </div>
        {children}
      </div>
    </div>
  )
}
