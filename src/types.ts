export type Brand = {
  id: string
  name: string
  /** Optional inline SVG markup or data URI; rendered into a tile. */
  logo?: string
}

export type Model = {
  id: string
  brandId: string
  name: string
  /** Image src (data URI / URL). */
  image?: string
}

export type Service = {
  id: string
  name: string
  description: string
  /** Price in EUR (gross). null = "auf Anfrage". */
  price: number | null
  /** Icon name from lucide-react. */
  icon?: string
  /** When true, appears in the collapsed "weitere Services" group. */
  extra?: boolean
}

export type ServiceCenter = {
  id: string
  name: string
  address: string
  zip: string
  city: string
  /** Note that the dealer wants to surface in the checkout. */
  contactNote: string
  advisors: Advisor[]
}

export type Advisor = {
  id: string
  name: string
}

export type Slot = {
  /** ISO date string, e.g. 2026-11-08 */
  date: string
  /** HH:mm */
  time: string
}

export type Recommendation = {
  vehicleLabel: string
  serviceIds: string[]
  /** Pre-calculated total in EUR. */
  total: number
}

export type BookingDraft = {
  step: 1 | 2 | 3
  vehicle: {
    brand: string | null
    model: string | null
    vin?: string
    mileage?: number
  }
  services: {
    selected: string[]
    tireStorage: boolean
  }
  appointment: {
    date: string | null
    time: string | null
    needsReplacementCar: boolean
  }
  serviceCenter: {
    id: string
    contactlessDropoff: boolean
    advisorMode: 'random' | 'specific'
    advisorId?: string
    messageToAdvisor: string
  }
  customer: {
    salutation: string
    email: string
    firstName: string
    lastName: string
    phoneCountry: string
    phone: string
    address: string
    zip: string
    city: string
    country: string
    hasTopcard: boolean
    acceptedTerms: boolean
  }
  updatedAt: number
}

export type SubmitContext = {
  /**
   * Signed prefill token, falls vorhanden. Das Backend nutzt diesen als
   * canonical source für Kundendaten und ignoriert die im Draft enthaltenen
   * customer-Felder. Bei Mismatch lehnt das Backend ab.
   */
  prefillToken?: string
}

export type BookingService = {
  getBrands(): Promise<Brand[]>
  getModels(brandId: string): Promise<Model[]>
  getServices(modelId?: string): Promise<Service[]>
  getServiceRecommendation(vin: string, mileage: number): Promise<Recommendation>
  getAvailableSlots(serviceCenterId: string, date: string): Promise<Slot[]>
  getNextSlots(serviceCenterId: string, count: number): Promise<Slot[]>
  getServiceCenter(id: string): Promise<ServiceCenter>
  submitBooking(
    draft: BookingDraft,
    ctx?: SubmitContext,
  ): Promise<{ bookingId: string }>
}
