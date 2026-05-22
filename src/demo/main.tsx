/**
 * Demo-Entry für `npm run dev` und das Netlify-SPA-Build.
 * - Importiert den Library-Entry → registriert Custom Element + globale API
 * - Bindet die DOM-Buttons der Senker-Demo
 * - Mountet den `BookingCtaButton` in den Demo-Slot und re-rendert bei
 *   Sprach-Wechsel (Listener auf window 'sbo-language-change')
 */
import { createRoot, type Root } from 'react-dom/client'
import { useEffect, useState } from 'react'
import '../index'
import { BookingCtaButton } from '../widget/BookingCtaButton'

declare global {
  interface Window {
    BookingWidget?: {
      open: (opts: { dealerId: string; mode?: 'inline' | 'overlay' }) => void
      close: () => void
    }
    openWidget?: (opts: Record<string, unknown>) => void
    __sboLanguage?: 'de' | 'en' | 'it'
    __sboConsent?: { functional: boolean; analytics: boolean; marketing: boolean }
  }
}

function bindOverlayTriggers() {
  const btn = document.getElementById('open-widget-info')
  if (!btn) return
  btn.addEventListener('click', () => {
    // openWidget-Helper aus index.html reicht Sprache + Consent durch.
    window.openWidget?.({ dealerId: 'senker' })
  })
}

function CtaButtonReactive() {
  const [lang, setLang] = useState<'de' | 'en' | 'it'>(
    window.__sboLanguage ?? 'de',
  )
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ lang: 'de' | 'en' | 'it' }>).detail
      if (detail?.lang) setLang(detail.lang)
    }
    window.addEventListener('sbo-language-change', handler)
    return () => window.removeEventListener('sbo-language-change', handler)
  }, [])

  return (
    <BookingCtaButton
      dealerId="senker"
      locale={lang}
      onClick={() => {
        // CTA via openWidget-Helper, damit Consent ebenfalls mitgeht.
        window.openWidget?.({ dealerId: 'senker' })
      }}
    />
  )
}

let ctaRoot: Root | null = null
function mountCtaButton() {
  const slot = document.getElementById('sbo-cta-slot')
  if (!slot || ctaRoot) return
  ctaRoot = createRoot(slot)
  ctaRoot.render(<CtaButtonReactive />)
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
