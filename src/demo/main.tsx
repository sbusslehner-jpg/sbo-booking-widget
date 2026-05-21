/**
 * Demo-Entry für `npm run dev` und das Netlify-SPA-Build.
 * Importiert den Library-Entry (registriert Custom Element + globale API)
 * und mountet zusätzlich den CTA-Button in einen Demo-Slot.
 */
import { createRoot } from 'react-dom/client'
import '../index'
import { BookingCtaButton } from '../widget/BookingCtaButton'

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

function mountCtaButton() {
  const slot = document.getElementById('sbo-cta-slot')
  if (!slot) return
  createRoot(slot).render(<BookingCtaButton dealerId="senker" />)
}

function init() {
  bindOverlayTriggers()
  mountCtaButton()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
