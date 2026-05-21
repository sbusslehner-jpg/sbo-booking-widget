import type { BookingDraft } from '../types'

/**
 * Teilmenge eines BookingDraft, die ein Konsument programmatisch oder via
 * URL-Parameter vorbefüllen kann. Alle Felder sind optional — was übergeben
 * wird, überschreibt den entsprechenden Teil des Drafts.
 *
 * Typischer Use-Case: Eine E-Mail-Einladung enthält einen Link mit
 * vorausgewähltem Service, Termin und Kundendaten, oder die Trägerseite löst
 * ihre carlog-Session auf und übergibt die Kundendaten als Prefill.
 */
export type PrefillData = {
  step?: 1 | 2 | 3
  vehicle?: Partial<BookingDraft['vehicle']>
  services?: Partial<BookingDraft['services']>
  appointment?: Partial<BookingDraft['appointment']>
  serviceCenter?: Partial<BookingDraft['serviceCenter']>
  customer?: Partial<BookingDraft['customer']>
}

/**
 * Merged Prefill in einen bestehenden Draft. Leere oder undefinierte Felder
 * werden ignoriert — wir überschreiben nur, was tatsächlich gesetzt ist.
 */
export function applyPrefill(draft: BookingDraft, prefill: PrefillData): BookingDraft {
  return {
    ...draft,
    step: prefill.step ?? draft.step,
    vehicle: { ...draft.vehicle, ...cleanPartial(prefill.vehicle) },
    services: { ...draft.services, ...cleanPartial(prefill.services) },
    appointment: { ...draft.appointment, ...cleanPartial(prefill.appointment) },
    serviceCenter: { ...draft.serviceCenter, ...cleanPartial(prefill.serviceCenter) },
    customer: { ...draft.customer, ...cleanPartial(prefill.customer) },
    updatedAt: Date.now(),
  }
}

function cleanPartial<T extends Record<string, unknown>>(obj: T | undefined): Partial<T> {
  if (!obj) return {}
  const out: Partial<T> = {}
  for (const k of Object.keys(obj) as (keyof T)[]) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
      out[k] = obj[k]
    }
  }
  return out
}

/**
 * Mapping URL-Parameter → Prefill-Pfad.
 * Beispiel: `?bw_email=foo@bar.de&bw_services=raederwechsel,oelwechsel`
 *
 * Boolean: "1" / "true" / "yes" → true, alles andere → false.
 * Number: parseFloat, NaN wird verworfen.
 * Liste: Komma-getrennt.
 */
export function parseUrlPrefill(
  search: string,
  prefix: string = 'bw_',
): PrefillData {
  if (!search) return {}
  const params = new URLSearchParams(search)
  const get = (key: string) => params.get(`${prefix}${key}`) ?? undefined
  const getNum = (key: string): number | undefined => {
    const raw = get(key)
    if (raw === undefined) return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  const getBool = (key: string): boolean | undefined => {
    const raw = get(key)
    if (raw === undefined) return undefined
    return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes'
  }
  const getList = (key: string): string[] | undefined => {
    const raw = get(key)
    if (!raw) return undefined
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  const getStep = (): 1 | 2 | 3 | undefined => {
    const n = getNum('step')
    if (n === 1 || n === 2 || n === 3) return n
    return undefined
  }

  const prefill: PrefillData = {
    step: getStep(),
    vehicle: {
      brand: get('brand'),
      model: get('model'),
      vin: get('vin'),
      mileage: getNum('mileage'),
    },
    services: {
      selected: getList('services'),
      tireStorage: getBool('tire_storage'),
    },
    appointment: {
      date: get('date'),
      time: get('time'),
      needsReplacementCar: getBool('replacement_car'),
    },
    serviceCenter: {
      id: get('service_center'),
      messageToAdvisor: get('message'),
      advisorId: get('advisor'),
    },
    customer: {
      salutation: get('salutation'),
      email: get('email'),
      firstName: get('first_name'),
      lastName: get('last_name'),
      phone: get('phone'),
      phoneCountry: get('phone_country'),
      address: get('address'),
      zip: get('zip'),
      city: get('city'),
      country: get('country'),
    },
  }

  // Entferne komplett leere Sub-Objekte, damit der Merge sauber bleibt.
  return stripEmpty(prefill)
}

function stripEmpty(prefill: PrefillData): PrefillData {
  const out: PrefillData = {}
  if (prefill.step) out.step = prefill.step
  for (const k of ['vehicle', 'services', 'appointment', 'serviceCenter', 'customer'] as const) {
    const sub = prefill[k]
    if (!sub) continue
    const cleaned = cleanPartial(sub as Record<string, unknown>)
    if (Object.keys(cleaned).length > 0) {
      ;(out as Record<string, unknown>)[k] = cleaned
    }
  }
  return out
}

export function mergePrefills(...sources: (PrefillData | undefined)[]): PrefillData {
  const out: PrefillData = {}
  for (const src of sources) {
    if (!src) continue
    if (src.step) out.step = src.step
    for (const k of ['vehicle', 'services', 'appointment', 'serviceCenter', 'customer'] as const) {
      const sub = src[k]
      if (!sub) continue
      ;(out as Record<string, Record<string, unknown>>)[k] = {
        ...((out as Record<string, Record<string, unknown> | undefined>)[k] ?? {}),
        ...(sub as Record<string, unknown>),
      }
    }
  }
  return out
}
