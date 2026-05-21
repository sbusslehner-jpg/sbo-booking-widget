import type { Brand } from '../../types'

// Minimal inline-SVG-Logos als Platzhalter — wir setzen via CSS color den Ton.
// Da echte Markenlogos urheberrechtlich heikel sind, verwenden wir die jeweilige
// Initiale / Wortmarke als simples Mark. Konsumenten ersetzen via Override.
const wordmark = (text: string) => `
<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <text x="60" y="26" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-weight="700" font-size="20" letter-spacing="1" fill="currentColor">${text}</text>
</svg>`

export const brands: Brand[] = [
  { id: 'audi', name: 'Audi', logo: wordmark('AUDI') },
  { id: 'cupra', name: 'Cupra', logo: wordmark('CUPRA') },
  { id: 'skoda', name: 'Škoda', logo: wordmark('ŠKODA') },
  { id: 'seat', name: 'Seat', logo: wordmark('SEAT') },
  { id: 'vw', name: 'Volkswagen', logo: wordmark('VW') },
  { id: 'vw-nutz', name: 'VW Nutzfahrzeuge', logo: wordmark('VW NFZ') },
  { id: 'porsche', name: 'Porsche', logo: wordmark('PORSCHE') },
  { id: 'bentley', name: 'Bentley', logo: wordmark('BENTLEY') },
]
