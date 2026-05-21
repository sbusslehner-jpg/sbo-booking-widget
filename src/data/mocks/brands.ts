import type { Brand } from '../../types'
import audi from '../../assets/brands/audi.png'
import cupra from '../../assets/brands/cupra.png'
import skoda from '../../assets/brands/skoda.png'
import seat from '../../assets/brands/seat.png'
import bentley from '../../assets/brands/bentley.png'
import vwNutz from '../../assets/brands/vwlnf.png'

// Für Marken ohne hinterlegtes PNG fällt das BrandTile auf eine
// SVG-Wortmarke zurück (eingebettet als data-URI, currentColor-getönt).
const wordmark = (text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <text x="60" y="26" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-weight="700" font-size="20" letter-spacing="1" fill="currentColor">${text}</text>
</svg>`)}`

export const brands: Brand[] = [
  { id: 'audi', name: 'Audi', logo: audi },
  { id: 'cupra', name: 'Cupra', logo: cupra },
  { id: 'skoda', name: 'Škoda', logo: skoda },
  { id: 'seat', name: 'Seat', logo: seat },
  { id: 'vw', name: 'Volkswagen', logo: wordmark('VW') },
  { id: 'vw-nutz', name: 'VW Nutzfahrzeuge', logo: vwNutz },
  { id: 'porsche', name: 'Porsche', logo: wordmark('PORSCHE') },
  { id: 'bentley', name: 'Bentley', logo: bentley },
]
