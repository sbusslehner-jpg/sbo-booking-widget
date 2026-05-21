# Cookie- und Storage-Declaration

**Zielgruppe:** Datenschutz- und CMP-Verantwortliche der Trägerseite. Diese Liste dient als Eingabe in das **OneTrust Cookie-Scan-Override** bzw. die manuelle Pflege der Cookie-Kategorisierung.

**Stand:** v1.x · [GitHub Repo](https://github.com/sbusslehner-jpg/sbo-booking-widget)

---

## 1 · Übersicht aller Storage-Mechanismen

Das SBO Booking Widget verwendet **keine Cookies**. Persistente Daten werden ausschließlich im **localStorage** des Browsers abgelegt. Die unten gelistete Tabelle dient OneTrust dennoch als Cookie-Declaration, da CMPs typischerweise Cookies, localStorage und sessionStorage gemeinsam in derselben Kategorisierung verwalten.

| Schlüssel | Mechanismus | Kategorie (OneTrust) | Lebensdauer | Zweck |
|---|---|---|---|---|
| `booking-draft:{dealerId}` | localStorage | **C0003 Functional** | 24h ab letzter Änderung | Form-Recovery: Wiederherstellung eines unvollständigen Buchungsformulars (Fahrzeugauswahl, Service-Auswahl, Wunschtermin) nach Page-Reload |

**Wichtig:** Personenbezogene Daten (E-Mail, Name, Adresse, Telefon) werden **nicht** im localStorage gespeichert — sie werden bei jedem Mount erneut eingegeben oder vom Backend per signiertem Token zur Verfügung gestellt.

Ohne `C0003 Functional`-Consent verwendet das Widget einen In-Memory-Adapter — der Draft existiert nur für die laufende Session und wird beim Page-Reload verworfen.

---

## 2 · Analytics

Das Widget feuert beim Start, bei Schritt-Wechseln und bei der Buchungsbestätigung Events ins **`window.dataLayer`** (Google Tag Manager-Konvention). Wir setzen **keine eigenen Cookies** dafür — alle Cookies entstehen erst, wenn deine Trägerseite die Events an Google Analytics, Adobe Analytics, Matomo o.ä. weiterleitet.

| Event-Präfix | Kategorie (OneTrust) | Verhalten ohne Consent |
|---|---|---|
| `sbo_*` (siehe [`src/analytics/events.ts`](../src/analytics/events.ts)) | **C0002 Performance** | Events werden **gar nicht** generiert |

Übermittelte Parameter enthalten **niemals** PII: nur Schritt-Nummer, Dealer-ID, Service-IDs, Marken-/Modell-IDs, Buchungs-ID (opake Server-Generierung), Total in EUR. E-Mail-Adresse, Name etc. fließen **nie** in dataLayer-Events.

---

## 3 · Drittparteien

Im Standard-Bundle laden wir **keine Drittparteien-Scripts** dynamisch nach. Das Widget selbst wird von

```
https://sbo-booking-widget.netlify.app/v1/booking-widget.umd.js
```

ausgeliefert. Falls die Trägerseite das in OneTrust als externes Skript kategorisiert, gehört es nach unserer Einschätzung in **C0003 Functional**, weil ohne den Script-Load das Widget keine Funktion hat.

Schriften (Google Fonts) werden **nicht** vom Widget geladen — die Trägerseite kontrolliert das Font-Loading selbst.

---

## 4 · Empfohlene OneTrust-Konfiguration

### 4.1 Cookie/Storage Override
Im OneTrust-Admin (Cookies → Cookie-Liste → Override) folgenden Eintrag anlegen:

| Feld | Wert |
|---|---|
| Cookie-Name | `booking-draft:*` |
| Domain | (Domain der Trägerseite) |
| Beschreibung | Speichert unvollständige Buchungsformulardaten zur Wiederherstellung |
| Speicherort | localStorage |
| Lebensdauer | 24 Stunden |
| Kategorie | Functional (C0003) |

### 4.2 Skript-Auto-Blocking
Damit OneTrust den Widget-Loader steuert, das `<script>`-Tag mit `type="text/plain"` und einer Consent-Kategorie ausliefern:

```html
<!-- Lädt erst, wenn der Nutzer "Functional"-Cookies akzeptiert hat -->
<script
  type="text/plain"
  class="optanon-category-C0003"
  src="https://sbo-booking-widget.netlify.app/v1/booking-widget.umd.js"
></script>
```

OneTrust wandelt das `type="text/plain"` nach Consent automatisch in `text/javascript` um und triggert den Load.

### 4.3 Consent-Forwarding an das Widget
Wenn dein Setup das Widget per JS instanziiert, übergib den Consent explizit:

```ts
import { BookingWidget, readOneTrustConsent, subscribeOneTrustConsent } from '@dealer/booking-widget'

function App() {
  const [consent, setConsent] = useState(readOneTrustConsent())
  useEffect(() => subscribeOneTrustConsent(setConsent), [])

  return <BookingWidget dealerId="senker" consent={consent} />
}
```

Ohne expliziten `consent`-Prop versucht das Widget selbst, `window.OnetrustActiveGroups` zu lesen. Falls OneTrust nicht im globalen Scope verfügbar ist (z.B. shadowed durch CMP), explizit übergeben.

---

## 5 · Datenfluss und DSGVO-Relevanz

| Datenkategorie | Wo wird sie verarbeitet? | Rechtsgrundlage (Diskussionsvorschlag) |
|---|---|---|
| Fahrzeugmarke, Modell, VIN, Kilometerstand | localStorage (functional consent) + Submission an Backend | Vertragsanbahnung Art. 6(1)(b) DSGVO |
| Service-Auswahl, Wunschtermin | localStorage (functional consent) + Submission an Backend | Vertragsanbahnung Art. 6(1)(b) DSGVO |
| E-Mail, Vor-/Nachname, Adresse, Telefon | **Nur** in-memory während aktiver Session, dann Submission an Backend (mit AGB-Consent) | Vertragsanbahnung Art. 6(1)(b) + Einwilligung über AGB-Checkbox |
| Signed Prefill Token (JWT) | URL-Parameter oder Prop, im Speicher während Session | Server-zu-Server-Auth, nicht direkt vom Nutzer eingegeben |
| Analytics-Events | window.dataLayer (analytics consent) | Art. 6(1)(a) Einwilligung über CMP |

---

## 6 · Daten-Lösch-Anfragen (Art. 17 DSGVO)

Das Widget selbst speichert nur den oben dokumentierten Draft im localStorage. Programmatische Löschung möglich via:

```ts
import { LocalStorageAdapter } from '@dealer/booking-widget'
await new LocalStorageAdapter({ dealerId: 'senker' }).clear()
```

Oder direkt:

```js
localStorage.removeItem('booking-draft:senker')
```

Persistente Daten der eigentlichen Buchung (E-Mail, Name etc.) liegen ausschließlich im Backend des Dealers / der SBO und müssen über deren Privacy-Prozess gelöscht werden.

---

## 7 · Kontakt

Für Rückfragen zu dieser Erklärung wenden Sie sich bitte an den Datenschutzbeauftragten der SBO.
