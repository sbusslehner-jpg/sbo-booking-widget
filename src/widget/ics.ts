/**
 * Erzeugt einen iCalendar-Event (.ics) als Data-URL für Kalender-Download.
 * RFC 5545 minimal-konform — testet sauber in Apple Calendar, Outlook, Google.
 */

export type IcsEventInput = {
  title: string
  description?: string
  location?: string
  /** ISO date YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  /** Dauer in Minuten. Default 60. */
  durationMin?: number
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatICSDate(date: string, time: string): string {
  // Lokale Zeit ohne TZ-Suffix — der Kalender interpretiert sie als Floating Time.
  // Für Multi-TZ-Use-Case später VTIMEZONE-Block ergänzen.
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const dt = new Date(y, m - 1, d, hh, mm + minutes)
  return {
    date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
  }
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function generateIcs(input: IcsEventInput): string {
  const dur = input.durationMin ?? 60
  const start = formatICSDate(input.date, input.time)
  const endParts = addMinutes(input.date, input.time, dur)
  const end = formatICSDate(endParts.date, endParts.time)
  const uid = `${start}-${Math.random().toString(36).slice(2, 10)}@sbo-booking-widget`
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SBO Booking Widget//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    input.description ? `DESCRIPTION:${escapeIcs(input.description)}` : null,
    input.location ? `LOCATION:${escapeIcs(input.location)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[]

  return lines.join('\r\n')
}

export function icsToDataUrl(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
