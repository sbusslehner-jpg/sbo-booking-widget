import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import widgetCss from '../styles/widget.css?inline'
import { applyThemeToElement, resolveTheme, type ThemeInput } from './themes'

/**
 * Rendert seine Kinder in einen Shadow Root, der an dem übergebenen host-Element
 * hängt. Tailwind/CSS wird als `<style>` direkt in den Shadow Root injiziert,
 * sodass keine Styles auf die Host-Seite leaken.
 *
 * Optional kann ein `theme` übergeben werden — die aufgelösten CSS-Variablen
 * werden direkt am Shadow-Host-Element gesetzt.
 */
type Props = {
  host: HTMLElement
  theme?: ThemeInput
  children: ReactNode
}

export function ShadowRootPortal({ host, theme, children }: Props) {
  const [shadowContainer, setShadowContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let shadow: ShadowRoot
    if (host.shadowRoot) {
      shadow = host.shadowRoot
    } else {
      shadow = host.attachShadow({ mode: 'open' })
    }

    let styleEl = shadow.querySelector('style[data-booking-widget]') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.setAttribute('data-booking-widget', '')
      styleEl.textContent = widgetCss
      shadow.appendChild(styleEl)
    }

    let mount = shadow.querySelector('div[data-bw-mount]') as HTMLDivElement | null
    if (!mount) {
      mount = document.createElement('div')
      mount.setAttribute('data-bw-mount', '')
      shadow.appendChild(mount)
    }

    setShadowContainer(mount)
  }, [host])

  // Theme-Tokens am Host setzen — bei Theme-Wechsel reaktiv aktualisieren.
  useEffect(() => {
    const tokens = resolveTheme(theme)
    applyThemeToElement(host, tokens)
  }, [host, theme])

  if (!shadowContainer) return null
  return createPortal(children, shadowContainer)
}
