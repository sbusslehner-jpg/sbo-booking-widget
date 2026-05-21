# Werkstatt-Booking-Widget

Dreistufiges Buchungs-Widget für Werkstatt-Termine (Beispielkunde *Autohaus Senker*).
Einbindung als **Web Component** (Script-Tag) oder als **React-Komponente** (NPM). Alle Styles laufen im **Shadow DOM**, damit nichts auf die Host-Seite leakt.

---

## Schnellstart

```bash
npm install
npm run dev     # öffnet die Demo-Seite mit Overlay-Triggern + Inline-Embed
npm run build   # erzeugt dist/booking-widget.{es,umd}.js inkl. d.ts
npm run test    # Vitest
```

---

## Einbindung

### Script-Tag (Overlay)

```html
<script src="https://cdn.example.com/booking-widget.umd.js"></script>

<button onclick="BookingWidget.open({ dealerId: 'senker' })">
  Termin buchen
</button>
```

Auf Mobile wird automatisch ein Bottom-Sheet statt eines Modals verwendet.

### Custom Element (Inline via HTML)

```html
<script type="module" src="https://cdn.example.com/booking-widget.es.js"></script>

<booking-widget dealer-id="senker" mode="inline" language="de"></booking-widget>
```

### NPM (React)

```tsx
import { BookingWidget } from '@dealer/booking-widget'

// Inline
<BookingWidget mode="inline" dealerId="senker" />

// Programmatisches Overlay
<BookingWidget
  mode="overlay"
  dealerId="senker"
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onBooked={(id) => console.log('Buchung:', id)}
/>
```

---

## Konfiguration

| Prop / Attribute | Typ | Default | Beschreibung |
|---|---|---|---|
| `dealerId` | string | — | Identifier des Händlers — wird für Storage-Key und Theming genutzt |
| `mode` | `'inline' \| 'overlay'` | `'overlay'` | Embedding-Modus |
| `open` | boolean | `true` | Overlay-Sichtbarkeit (steuerbar) |
| `onClose` | `() => void` | — | Callback bei Close |
| `language` | string | `'de'` | i18n-Locale (nur `de` aktiv in v1) |
| `service` | `BookingService` | `MockBookingService` | API-Adapter (für späteren Backend-Tausch) |
| `storage` | `StorageAdapter` | `LocalStorageAdapter` | Persistenz-Adapter |
| `draftTtlMs` | number | `86_400_000` (24h) | TTL für gespeicherte Drafts |
| `onBooked` | `(id: string) => void` | — | Callback nach erfolgreicher Buchung |

### Theming

Alle Farben/Radien sind als CSS Custom Properties an `:host` definiert. Override z.B. über inline-Style auf dem Element:

```html
<booking-widget
  dealer-id="senker"
  style="--color-primary:#c0102c; --color-accent-blue:#0a66c2;"
></booking-widget>
```

Verfügbare Tokens siehe `src/styles/tokens.css`.

---

## Persistenz

- Bei jeder State-Änderung wird der Draft automatisch (debounced 300 ms) gespeichert.
- Beim Mount wird der letzte Draft geladen, sofern er jünger als die TTL ist (Default 24h).
- Default-Adapter: `LocalStorageAdapter` (Key: `booking-draft:{dealerId}`).
- Eigene Persistenz (z.B. Backend) durch Implementierung des `StorageAdapter`-Interface:

```ts
interface StorageAdapter {
  save(draft: BookingDraft): Promise<void>
  load(): Promise<BookingDraft | null>
  clear(): Promise<void>
}
```

Stub-Datei für Backend-Anbindung: `src/state/storage/BackendStorageAdapter.ts.stub`.

---

## Architektur

```
src/
├── widget/           Hauptkomponente, Shells, Wrapper, Web-Component-Glue
├── steps/            Step 1–3
├── components/       Wiederverwendbare Primitives (Toggle, FormField, …)
├── state/            Zustand-Store, Persistenz, Storage-Adapter, Zod-Schemas
├── data/             Mock-Service + Mock-Daten
├── i18n/             react-i18next Setup + DE-Locale
├── styles/           Tokens + Tailwind/Reset-CSS (in Shadow Root injiziert)
└── demo/             Dev-Entry (nicht in der Library)
```

### Mock-Service ↔ Echte API

`MockBookingService` implementiert `BookingService` — der gleiche Vertrag, den die spätere echte API erfüllen soll. Der Tausch ist dann eine reine Dependency-Injection via `service`-Prop.

```ts
interface BookingService {
  getBrands(): Promise<Brand[]>
  getModels(brandId: string): Promise<Model[]>
  getServices(modelId?: string): Promise<Service[]>
  getServiceRecommendation(vin: string, mileage: number): Promise<Recommendation>
  getAvailableSlots(serviceCenterId: string, date: string): Promise<Slot[]>
  getNextSlots(serviceCenterId: string, count: number): Promise<Slot[]>
  getServiceCenter(id: string): Promise<ServiceCenter>
  submitBooking(draft: BookingDraft): Promise<{ bookingId: string }>
}
```

---

## Was in v1 noch nicht enthalten ist

- Echte API-Anbindung (alles Mock)
- carlog-OAuth-Flow (nur UI)
- VIN-Kamera-Scan (nur Stub-Modal)
- Backend-Persistenz (Interface vorbereitet)
- Englische / weitere Sprachen
- Zahlungsabwicklung, E-Mail-Bestätigung, Analytics

---

## Lizenz

Privat / intern.
