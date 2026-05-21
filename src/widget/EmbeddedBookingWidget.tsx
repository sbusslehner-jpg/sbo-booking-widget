import { useCallback, useState } from 'react'
import { BookingWidget, type BookingWidgetProps } from './BookingWidget'
import { ShadowRootPortal } from './ShadowRootPortal'

/**
 * Wrapper, der das Widget in einen Shadow-Root rendert.
 * Verwendet für NPM-Embedding (Inline oder programmatisches Overlay).
 * Extrahiert den `theme`-Prop und setzt die CSS-Variablen am Shadow-Host.
 */
export function EmbeddedBookingWidget(props: BookingWidgetProps) {
  const { theme, ...rest } = props
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const setRef = useCallback((el: HTMLDivElement | null) => setHost(el), [])

  return (
    <div ref={setRef} className="booking-widget-host" style={{ display: 'block' }}>
      {host && (
        <ShadowRootPortal host={host} theme={theme}>
          <BookingWidget {...rest} />
        </ShadowRootPortal>
      )}
    </div>
  )
}
