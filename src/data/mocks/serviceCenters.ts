import type { ServiceCenter } from '../../types'

export const serviceCenters: ServiceCenter[] = [
  {
    id: 'senker-salzburg',
    name: 'Autohaus Senker',
    address: 'Louise Piech Straße 9',
    zip: '5020',
    city: 'Salzburg',
    contactNote: 'Bitte nehmen Sie ihren Zulassungsschein mit.',
    advisors: [
      { id: 'a1', name: 'Markus Hofer' },
      { id: 'a2', name: 'Julia Steiner' },
      { id: 'a3', name: 'Thomas Bauer' },
      { id: 'a4', name: 'Anna Wagner' },
    ],
  },
]

export const DEFAULT_SERVICE_CENTER_ID = 'senker-salzburg'
