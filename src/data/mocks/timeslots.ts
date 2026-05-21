import type { Slot } from '../../types'

const TIMES = ['08:00', '09:30', '10:00', '11:30', '13:00', '14:30', '16:00']

export function generateSlotsForDate(date: string): Slot[] {
  return TIMES.map((time) => ({ date, time }))
}

/** Erzeugt die nächsten N verfügbaren Termine ab einem Startdatum. */
export function generateNextSlots(count: number, start: Date = new Date()): Slot[] {
  const out: Slot[] = []
  const cursor = new Date(start)
  let dayOffset = 1
  while (out.length < count) {
    cursor.setTime(start.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    // Wochenenden überspringen
    const dow = cursor.getDay()
    if (dow === 0 || dow === 6) {
      dayOffset += 1
      continue
    }
    const iso = cursor.toISOString().slice(0, 10)
    const slotsForDay = ['10:00', '13:00', '15:30']
    for (const t of slotsForDay) {
      out.push({ date: iso, time: t })
      if (out.length === count) break
    }
    dayOffset += 1
  }
  return out
}
