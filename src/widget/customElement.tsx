import { createRoot, type Root } from 'react-dom/client'
import { BookingWidget, type BookingWidgetProps } from './BookingWidget'
import { ShadowRootPortal } from './ShadowRootPortal'
import { useEffect, useState } from 'react'

const CE_TAG = 'booking-widget'

type CEAttrs = {
  'dealer-id'?: string
  mode?: 'inline' | 'overlay'
  language?: string
  open?: string
}

/**
 * Custom Element `<booking-widget dealer-id="senker" mode="inline" />`.
 * Funktioniert sowohl im Script-Tag- als auch im NPM-Workflow.
 */
class BookingWidgetElement extends HTMLElement {
  private root: Root | null = null

  static get observedAttributes(): string[] {
    return ['dealer-id', 'mode', 'language', 'open']
  }

  connectedCallback() {
    if (!this.root) {
      // Wir mounten React in das Host-Element selbst — ShadowRootPortal
      // erzeugt den Shadow Root und mountet darin.
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
    }
    const props: BookingWidgetProps = {
      dealerId: attrs['dealer-id'] || 'default',
      mode: attrs.mode,
      language: attrs.language,
      open: attrs.open !== 'false',
      onClose: () => this.removeAttribute('open'),
    }
    this.root?.render(<CEHost host={this} props={props} />)
  }
}

function CEHost({ host, props }: { host: HTMLElement; props: BookingWidgetProps }) {
  // Re-render wenn host bekannt ist (immer der Fall — host ist das CE selbst).
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) return null
  return (
    <ShadowRootPortal host={host}>
      <BookingWidget {...props} />
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
