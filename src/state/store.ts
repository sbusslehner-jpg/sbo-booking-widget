import { create } from 'zustand'
import type { BookingDraft } from '../types'
import { DEFAULT_SERVICE_CENTER_ID } from '../data/mocks/serviceCenters'

export const createInitialDraft = (): BookingDraft => ({
  step: 1,
  vehicle: {
    brand: null,
    model: null,
    vin: '',
    mileage: 145000,
  },
  services: {
    selected: [],
    tireStorage: false,
  },
  appointment: {
    date: null,
    time: null,
    needsReplacementCar: true,
  },
  serviceCenter: {
    id: DEFAULT_SERVICE_CENTER_ID,
    contactlessDropoff: true,
    advisorMode: 'random',
    advisorId: undefined,
    messageToAdvisor: '',
  },
  customer: {
    salutation: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneCountry: '+43',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: 'Österreich',
    hasTopcard: false,
    acceptedTerms: false,
  },
  updatedAt: Date.now(),
})

type BookingStore = {
  draft: BookingDraft
  hydrated: boolean
  setDraft: (next: BookingDraft) => void
  patch: <K extends keyof BookingDraft>(key: K, value: Partial<BookingDraft[K]>) => void
  setStep: (step: 1 | 2 | 3) => void
  reset: () => void
  markHydrated: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  draft: createInitialDraft(),
  hydrated: false,
  setDraft: (next) => set({ draft: { ...next, updatedAt: Date.now() } }),
  patch: (key, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        [key]: { ...(state.draft[key] as object), ...(value as object) },
        updatedAt: Date.now(),
      } as BookingDraft,
    })),
  setStep: (step) =>
    set((state) => ({
      draft: { ...state.draft, step, updatedAt: Date.now() },
    })),
  reset: () => set({ draft: createInitialDraft() }),
  markHydrated: () => set({ hydrated: true }),
}))
