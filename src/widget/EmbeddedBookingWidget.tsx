import { useCallback, useState } from 'react'
import { BookingWidget, type BookingWidgetProps } from './BookingWidget'
import { ShadowRootPortal } from './ShadowRootPortal'

/**
 * Wrapper, der das Widget in einen Shadow-Root rendert.
 * Verwendet für NPM-Embedding (Inline oder programmatisches Overlay).
 */
export function EmbeddedBookingWidget(props: BookingWidgetProps) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const setRef = useCallback((el: HTMLDivElement | null) => setHost(el), [])

  return (
    <div ref={setRef} className="booking-widget-host" style={{ display: 'block' }}>
      {host && (
        <ShadowRootPortal host={host}>
          <BookingWidget {...props} />
        </ShadowRootPortal>
      )}
    </div>
  )
}
