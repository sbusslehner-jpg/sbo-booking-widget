/**
 * Demo-Entry für `npm run dev`.
 * Importiert den Library-Entry — registriert dadurch das Custom Element
 * und legt die globale `window.BookingWidget.open(...)`-API an.
 */
import '../index'

declare global {
  interface Window {
    BookingWidget?: {
      open: (opts: { dealerId: string; mode?: 'inline' | 'overlay' }) => void
      close: () => void
    }
  }
}

function bindOverlayTriggers() {
  const ids = ['open-widget-hero', 'open-widget-info']
  ids.forEach((id) => {
    const btn = document.getElementById(id)
    if (!btn) return
    btn.addEventListener('click', () => {
      window.BookingWidget?.open({ dealerId: 'senker' })
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindOverlayTriggers)
} else {
  bindOverlayTriggers()
}
