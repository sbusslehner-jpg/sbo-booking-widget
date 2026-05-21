import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import widgetCss from '../styles/widget.css?inline'

/**
 * Rendert seine Kinder in einen Shadow Root, der an dem übergebenen host-Element
 * hängt. Tailwind/CSS wird als `<style>` direkt in den Shadow Root injiziert,
 * sodass keine Styles auf die Host-Seite leaken.
 */
type Props = {
  host: HTMLElement
  children: ReactNode
}

export function ShadowRootPortal({ host, children }: Props) {
  const [shadowContainer, setShadowContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // attachShadow ist idempotent abgesichert.
    let shadow: ShadowRoot
    if (host.shadowRoot) {
      shadow = host.shadowRoot
    } else {
      shadow = host.attachShadow({ mode: 'open' })
    }

    // Style einmalig injizieren.
    let styleEl = shadow.querySelector('style[data-booking-widget]') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.setAttribute('data-booking-widget', '')
      styleEl.textContent = widgetCss
      shadow.appendChild(styleEl)
    }

    // Container für React anlegen.
    let mount = shadow.querySelector('div[data-bw-mount]') as HTMLDivElement | null
    if (!mount) {
      mount = document.createElement('div')
      mount.setAttribute('data-bw-mount', '')
      shadow.appendChild(mount)
    }

    setShadowContainer(mount)

    return () => {
      // Container belassen — bei Unmount entfernt React nur seinen Subtree.
    }
  }, [host])

  if (!shadowContainer) return null
  return createPortal(children, shadowContainer)
}
