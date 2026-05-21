import { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react'
import { openOverlay } from './customElement'
import type { BookingWidgetProps } from './BookingWidget'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** Pflichtangabe — wird an das geöffnete Widget weitergegeben. */
  dealerId: string
  /** Optionale Überschreibung des Titels. Default: "Werkstatt-Termin buchen". */
  title?: string
  /** Optionale Unterzeile. Default: "Online Ihren Wunschtermin sichern". */
  subtitle?: string
  /** Weiteres Booking-Setup, z.B. service/storage/onBooked. */
  bookingOptions?: Omit<BookingWidgetProps, 'dealerId' | 'mode'>
  /** Eigener Klick-Handler — falls gesetzt, wird das Widget NICHT automatisch geöffnet. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * CTA-Button, der das Booking-Widget als Overlay öffnet.
 * Trägt sein gesamtes Styling inline — funktioniert auf jeder Host-Seite
 * unabhängig von Tailwind / Theme-Variablen.
 */
export const BookingCtaButton = forwardRef<HTMLButtonElement, Props>(
  function BookingCtaButton(
    {
      dealerId,
      title = 'Werkstatt-Termin buchen',
      subtitle = 'Online Ihren Wunschtermin sichern',
      bookingOptions,
      onClick,
      style,
      className,
      ...rest
    },
    ref,
  ) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e)
        return
      }
      openOverlay({ dealerId, ...(bookingOptions ?? {}) })
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={className}
        style={{ ...buttonStyle, ...style }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 12px 28px -10px rgba(15, 23, 42, 0.45)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 6px 18px -8px rgba(15, 23, 42, 0.35)'
        }}
        {...rest}
      >
        <span style={iconWrapStyle} aria-hidden="true">
          <IconCalendarWrench />
        </span>
        <span style={textWrapStyle}>
          <span style={titleStyle}>{title}</span>
          <span style={subtitleStyle}>{subtitle}</span>
        </span>
        <span style={chevronWrapStyle} aria-hidden="true">
          <ChevronRight />
        </span>
      </button>
    )
  },
)

// --- Inline styles (Tailwind-frei, damit der Button überall funktioniert) ---

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px 22px 12px 14px',
  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '9999px',
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  cursor: 'pointer',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
  boxShadow: '0 6px 18px -8px rgba(15, 23, 42, 0.35)',
  textDecoration: 'none',
  outline: 'none',
}

const iconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '9999px',
  background: 'rgba(255, 255, 255, 0.92)',
  color: '#111827',
  flexShrink: 0,
}

const textWrapStyle: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  lineHeight: 1.15,
  textAlign: 'left',
}

const titleStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '15px',
  letterSpacing: '-0.005em',
}

const subtitleStyle: CSSProperties = {
  fontWeight: 400,
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.65)',
  marginTop: '2px',
}

const chevronWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  marginLeft: '4px',
  color: 'rgba(255, 255, 255, 0.7)',
  flexShrink: 0,
}

// --- Icons (inline SVG, damit kein Lucide-Import nötig) ---

function IconCalendarWrench() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      {/* kleiner Schraubenschlüssel im unteren Bereich */}
      <path d="M9.5 14.5 13 18" />
      <circle cx="9" cy="15" r="1.2" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
