import { createRoot, type Root } from 'react-dom/client'
import { BookingWidget, type BookingWidgetProps } from './BookingWidget'
import { ShadowRootPortal } from './ShadowRootPortal'
import { useEffect, useState } from 'react'
import type { PrefillData } from '../state/prefill'
import type { ThemeName, ThemeInput } from './themes'
import { availableThemes } from './themes'
import type { ConsentState } from '../state/consent'

const CE_TAG = 'booking-widget'

type CEAttrs = {
  'dealer-id'?: string
  mode?: 'inline' | 'overlay'
  language?: string
  open?: string
  theme?: string
  prefill?: string
  consent?: string
  'prefill-token'?: string
}

/**
 * Custom Element `<booking-widget dealer-id="senker" mode="inline" />`.
 * Funktioniert sowohl im Script-Tag- als auch im NPM-Workflow.
 */
class BookingWidgetElement extends HTMLElement {
  private root: Root | null = null

  static get observedAttributes(): string[] {
    return [
      'dealer-id',
      'mode',
      'language',
      'open',
      'theme',
      'prefill',
      'consent',
      'prefill-token',
    ]
  }

  connectedCallback() {
    if (!this.root) {
      const container = document.createElement('div')
      this.appendChild(container)
      this.root = createRoot(container)
    }
    this.render()
  }

  attributeChangedCallback() {
    if (this.root) this.render()
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }

  private render() {
    const attrs: CEAttrs = {
      'dealer-id': this.getAttribute('dealer-id') ?? undefined,
      mode: (this.getAttribute('mode') as 'inline' | 'overlay') ?? 'inline',
      language: this.getAttribute('language') ?? 'de',
      open: this.getAttribute('open') ?? 'true',
      theme: this.getAttribute('theme') ?? undefined,
      prefill: this.getAttribute('prefill') ?? undefined,
      consent: this.getAttribute('consent') ?? undefined,
      'prefill-token': this.getAttribute('prefill-token') ?? undefined,
    }
    const props: BookingWidgetProps = {
      dealerId: attrs['dealer-id'] || 'default',
      mode: attrs.mode,
      language: attrs.language,
      open: attrs.open !== 'false',
      onClose: () => this.removeAttribute('open'),
      theme: parseThemeAttr(attrs.theme),
      prefill: parsePrefillAttr(attrs.prefill),
      consent: parseConsentAttr(attrs.consent),
      prefillToken: attrs['prefill-token'],
    }
    this.root?.render(<CEHost host={this} props={props} />)
  }
}

function parseConsentAttr(raw: string | undefined): ConsentState | undefined {
  if (!raw) return undefined
  // Akzeptiert "all", "none" oder JSON-Objekt.
  const trimmed = raw.trim().toLowerCase()
  if (trimmed === 'all') return { functional: true, analytics: true, marketing: true }
  if (trimmed === 'none') return { functional: false, analytics: false, marketing: false }
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    }
  } catch {
    return undefined
  }
}

function parseThemeAttr(raw: string | undefined): ThemeInput | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed) as ThemeInput
    } catch {
      return undefined
    }
  }
  if ((availableThemes as ReadonlyArray<string>).includes(trimmed)) {
    return trimmed as ThemeName
  }
  return undefined
}

function parsePrefillAttr(raw: string | undefined): PrefillData | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as PrefillData
  } catch {
    // Schlecht formatiertes JSON — leise ignorieren, sonst bricht der Mount.
    return undefined
  }
}

function CEHost({ host, props }: { host: HTMLElement; props: BookingWidgetProps }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) return null
  const { theme, ...rest } = props
  return (
    <ShadowRootPortal host={host} theme={theme}>
      <BookingWidget {...rest} />
    </ShadowRootPortal>
  )
}

export function registerCustomElement(): void {
  if (typeof window === 'undefined') return
  if (!customElements.get(CE_TAG)) {
    customElements.define(CE_TAG, BookingWidgetElement)
  }
}

// --- Overlay-API ---

let overlayHost: HTMLElement | null = null
let overlayRoot: Root | null = null

export function openOverlay(opts: Partial<BookingWidgetProps> & { dealerId: string }): void {
  if (typeof window === 'undefined') return
  if (!overlayHost) {
    overlayHost = document.createElement('div')
    overlayHost.setAttribute('data-booking-widget-overlay', '')
    overlayHost.style.position = 'fixed'
    overlayHost.style.zIndex = '2147483600'
    document.body.appendChild(overlayHost)
    overlayRoot = createRoot(overlayHost)
  }
  const props: BookingWidgetProps = {
    mode: 'overlay',
    open: true,
    onClose: closeOverlay,
    ...opts,
  }
  overlayRoot?.render(<CEHost host={overlayHost as HTMLElement} props={props} />)
}

export function closeOverlay(): void {
  if (!overlayHost || !overlayRoot) return
  overlayRoot.unmount()
  overlayHost.remove()
  overlayHost = null
  overlayRoot = null
}
