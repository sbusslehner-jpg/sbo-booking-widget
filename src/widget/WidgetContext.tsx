import { createContext, useContext } from 'react'
import type { BookingService } from '../types'

type WidgetContextValue = {
  service: BookingService
  dealerId: string
  /** Wenn true, ist das Widget im Overlay-Modus (Close-Button sichtbar). */
  isOverlay: boolean
  /** Wenn true, kompakter Mobile-Modus. */
  isMobile: boolean
  /** Schließt das Overlay (no-op im Inline-Modus). */
  onClose: () => void
}

const WidgetContext = createContext<WidgetContextValue | null>(null)

export const WidgetProvider = WidgetContext.Provider

export function useWidget(): WidgetContextValue {
  const ctx = useContext(WidgetContext)
  if (!ctx) throw new Error('useWidget must be used within WidgetProvider')
  return ctx
}
