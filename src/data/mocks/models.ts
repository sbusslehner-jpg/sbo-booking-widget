import type { Model } from '../../types'
import poloImg from '../../assets/models/polo.png'
import golfImg from '../../assets/models/golf.png'
import trocImg from '../../assets/models/trock.png'

// Generischer Platzhalter für Modelle, für die noch kein Foto existiert.
const carPlaceholder = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 48" aria-hidden="true">
  <path d="M8 32 L14 18 Q16 14 20 14 L60 14 Q64 14 66 18 L72 32 Z"
        fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
  <circle cx="22" cy="34" r="5" fill="#0f172a"/>
  <circle cx="58" cy="34" r="5" fill="#0f172a"/>
  <rect x="22" y="18" width="36" height="10" rx="2" fill="#e2e8f0"/>
</svg>`)}`

export const models: Model[] = [
  { id: 'polo', brandId: 'vw', name: 'Polo', image: poloImg },
  { id: 'golf', brandId: 'vw', name: 'Golf', image: golfImg },
  { id: 'golf-variant', brandId: 'vw', name: 'Golf Variant', image: golfImg },
  { id: 't-roc-cabrio', brandId: 'vw', name: 'T-Roc Cabriolet', image: trocImg },
  { id: 'passat', brandId: 'vw', name: 'Passat', image: carPlaceholder },
  { id: 'tiguan', brandId: 'vw', name: 'Tiguan', image: carPlaceholder },
  { id: 'id3', brandId: 'vw', name: 'ID.3', image: carPlaceholder },
  { id: 'id4', brandId: 'vw', name: 'ID.4', image: carPlaceholder },

  { id: 'a3', brandId: 'audi', name: 'A3', image: carPlaceholder },
  { id: 'a4', brandId: 'audi', name: 'A4', image: carPlaceholder },
  { id: 'q3', brandId: 'audi', name: 'Q3', image: carPlaceholder },

  { id: 'fabia', brandId: 'skoda', name: 'Fabia', image: carPlaceholder },
  { id: 'octavia', brandId: 'skoda', name: 'Octavia', image: carPlaceholder },
  { id: 'enyaq', brandId: 'skoda', name: 'Enyaq', image: carPlaceholder },

  { id: 'leon', brandId: 'seat', name: 'Leon', image: carPlaceholder },
  { id: 'arona', brandId: 'seat', name: 'Arona', image: carPlaceholder },

  { id: 'formentor', brandId: 'cupra', name: 'Formentor', image: carPlaceholder },
  { id: 'born', brandId: 'cupra', name: 'Born', image: carPlaceholder },

  { id: 'transporter', brandId: 'vw-nutz', name: 'Transporter', image: carPlaceholder },
  { id: 'caddy', brandId: 'vw-nutz', name: 'Caddy', image: carPlaceholder },

  { id: 'macan', brandId: 'porsche', name: 'Macan', image: carPlaceholder },
  { id: 'cayenne', brandId: 'porsche', name: 'Cayenne', image: carPlaceholder },

  { id: 'continental-gt', brandId: 'bentley', name: 'Continental GT', image: carPlaceholder },
]
