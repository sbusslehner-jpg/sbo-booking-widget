import type {
  Brand,
  BookingDraft,
  BookingService,
  Model,
  Recommendation,
  Service,
  ServiceCenter,
  Slot,
  TenantConfig,
} from '../types'
import { brands } from './mocks/brands'
import { models } from './mocks/models'
import { services } from './mocks/services'
import { serviceCenters } from './mocks/serviceCenters'
import { generateNextSlots, generateSlotsForDate } from './mocks/timeslots'

const LATENCY = 300

function delay<T>(value: T, ms: number = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * MockBookingService — gleicher Vertrag wie die spätere echte API.
 * Tausch gegen ein HTTP-Backend ist eine reine Dependency-Injection.
 */
export class MockBookingService implements BookingService {
  async getTenantConfig(dealerId: string): Promise<TenantConfig> {
    // Phase-2-Mock: ein einzelnes Senker-Profil. In Produktion liefert das
    // Backend pro Dealer eine eigene Antwort.
    return delay({
      dealerId,
      displayName: 'Autohaus Senker',
      country: 'AT',
      defaultLanguage: 'de',
      currency: 'EUR',
      theme: 'neutral',
      enabledBrands: ['audi', 'cupra', 'skoda', 'seat', 'vw', 'vw-nutz', 'porsche', 'bentley'],
      serviceCenters,
      legalLinks: {
        de: { terms: 'https://senker.at/agb', privacy: 'https://senker.at/datenschutz' },
        en: { terms: 'https://senker.at/en/terms', privacy: 'https://senker.at/en/privacy' },
      },
      features: {
        carlogLogin: true,
        serviceRecommendation: true,
        vinScan: false,
        topcard: true,
        tireStorage: true,
      },
      zipPattern: '^\\d{4}$',
    })
  }

  getBrands(): Promise<Brand[]> {
    return delay(brands)
  }

  getModels(brandId: string): Promise<Model[]> {
    return delay(models.filter((m) => m.brandId === brandId))
  }

  getServices(_modelId?: string): Promise<Service[]> {
    return delay(services)
  }

  async getServiceRecommendation(_vin: string, _mileage: number): Promise<Recommendation> {
    // Mock-Antwort wie im Screenshot
    const serviceIds = ['raederwechsel', 'oelwechsel', 'pollenfilter']
    const total = serviceIds.reduce((sum, id) => {
      const s = services.find((x) => x.id === id)
      return sum + (s?.price ?? 0)
    }, 0)
    return delay({
      vehicleLabel: 'Volkswagen Polo 2023',
      serviceIds,
      total: total || 140,
    })
  }

  getAvailableSlots(_serviceCenterId: string, date: string): Promise<Slot[]> {
    return delay(generateSlotsForDate(date))
  }

  getNextSlots(_serviceCenterId: string, count: number): Promise<Slot[]> {
    return delay(generateNextSlots(count))
  }

  async getServiceCenter(id: string): Promise<ServiceCenter> {
    const sc = serviceCenters.find((s) => s.id === id) ?? serviceCenters[0]
    return delay(sc)
  }

  async submitBooking(
    _draft: BookingDraft,
    _ctx?: { prefillToken?: string },
  ): Promise<{ bookingId: string }> {
    // In Produktion: Backend verifiziert _ctx.prefillToken hier (Signatur, exp,
    // aud), zieht customer-Daten aus dem Token statt aus _draft.customer und
    // lehnt ab, wenn Token fehlt/abgelaufen ist. Mock akzeptiert alles.
    return delay({ bookingId: `BK-${Date.now().toString(36).toUpperCase()}` }, 600)
  }
}

export const defaultBookingService: BookingService = new MockBookingService()
