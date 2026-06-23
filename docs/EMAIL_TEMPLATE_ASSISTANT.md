# E-Mail-Template-Assistent — Produkt- & UX-Konzept („Clarity")

> Geführte, sichere E-Mail-Template-Wartung für Autohäuser & Werkstattbetriebe.
> Ersetzt den technischen WYSIWYG-/HTML-Editor durch einen **klaren, geführten
> Template-Assistenten** für nicht-technische Nutzer.

Interaktiver Prototyp: **[`/email-templates.html`](../public/email-templates.html)**
(im Demo-Build erreichbar über den Menüpunkt **E-Mail-Templates** neben dem Booking-Widget).

---

## 1 · Produktvision

**Heute** bearbeiten Händler E-Mail-Templates in einem WYSIWYG-Editor: rohes HTML,
technische Platzhalter (`${CUSTOMER_FIRSTNAME}`, `${VEHICLE_VIN}`), Links, Pflichttexte,
PDF-Inhalte, teils 2FA. Das ist mächtig, aber **zu komplex, fehleranfällig und
angstbesetzt** — ein gelöschtes `${BOOKINGNUMBER}` oder ein zerschossener
Pflicht-Footer hat rechtliche und operative Folgen.

**Zielbild:** Ein **Template-Assistent**, der sich anfühlt wie das Ausfüllen eines
Formulars, nicht wie Programmieren.

> „Ich ändere die Begrüßung und meine Signatur, sehe sofort wie die E-Mail im
> VW- bzw. Audi-Design aussieht, schicke mir eine Testmail und veröffentliche —
> ohne irgendetwas kaputt machen zu können."

Vier Leitprinzipien (**Clarity**):

| Prinzip | Bedeutung im Produkt |
|---|---|
| **Einfach** | Bausteine statt HTML. Ein Textfeld pro Gedanke. Keine Tags, keine Tabellen. |
| **Verständlich** | Platzhalter als sprechende Chips („Vorname"), Live-Vorschau, Klartext-Prüfungen. |
| **Sicher** | Geschützte System-/Pflichtblöcke sind gesperrt. Pflicht-Platzhalter können nicht verloren gehen. Testmail + 2FA + Freigabe + Rollback. |
| **Nicht-technisch** | Sprache des Autohauses, nicht der Entwickler. KI hilft beim Formulieren statt beim Coden. |

**Messbare Ziele:** Bearbeitungszeit pro Änderung halbiert · Support-Tickets
„Template kaputt" gegen null · 0 ausgelieferte E-Mails mit fehlendem
Pflicht-Platzhalter · Time-to-first-edit für neue Nutzer < 5 Min.

---

## 2 · Rollenmodell

Drei Modi, ein Editor — der Editor passt seine Möglichkeiten an die Rolle an
(progressive disclosure statt drei getrennte Tools).

### Händler-Modus (Standard, breite Masse)
- Bearbeitet **freie Textbausteine**: Begrüßung, Einleitung, Storno-/Neutermin-Hinweis, Signatur.
- Schaltet **optionale Datenzeilen** ein/aus (z. B. „Ersatzfahrzeug").
- Sieht alles Geschützte, kann es aber **nicht** verändern (read-only, 🔒).
- **Kein direktes Veröffentlichen** → reicht Änderungen **zur Freigabe** ein.
- Kann auf Standard zurücksetzen und Testmails senden.

### Key-User-Modus (pro Betrieb 1–2 Personen)
- Alles wie Händler **+ Veröffentlichen & Freigeben**.
- Bekommt eingereichte Änderungen, prüft Vorschau, gibt frei.
- **2FA** bei kritischen Änderungen (Betreff, Link, Systemblock).

### Admin-Modus (Hersteller / SBO-Betreiber)
- Vollzugriff inkl. **geschützter Systembausteine** (No-Reply-Hinweis,
  Pflicht-Footer, PDF-Anhang) und der **Platzhalter-Bibliothek**.
- Pflegt **Standard-Templates** pro Marke (VW, Audi, …), die an Betriebe ausgerollt werden.
- Definiert, welche Platzhalter **pflichtig** sind und welche Blöcke **geschützt** sind.

### Rollen-/Rechtematrix

| Fähigkeit | Händler | Key-User | Admin |
|---|:--:|:--:|:--:|
| Textbausteine bearbeiten | ✅ | ✅ | ✅ |
| Optionale Datenzeilen schalten | ✅ | ✅ | ✅ |
| Button-Beschriftung (Label) ändern | ✅ | ✅ | ✅ |
| Ziel-URL eines Links ändern | ⛔ | ⛔ | ✅ |
| Betreffzeile ändern | ✅¹ | ✅ | ✅ |
| Systembausteine bearbeiten (No-Reply, Footer, PDF) | ⛔ | ⛔ | ✅ |
| Pflicht-Platzhalter definieren | ⛔ | ⛔ | ✅ |
| Testmail senden | ✅ | ✅ | ✅ |
| Auf Standard zurücksetzen | ✅ | ✅ | ✅ |
| Versionen ansehen / wiederherstellen | ✅ | ✅ | ✅ |
| **Veröffentlichen** | ⛔ → Freigabe | ✅ | ✅ |
| Marken-Standard-Template pflegen | ⛔ | ⛔ | ✅ |

¹ Betreff ist editierbar, gilt aber als **kritische Änderung** (→ 2FA bei Freigabe).

---

## 3 · Geführter Template-Editor (UX-Konzept)

Zwei-Spalten-Workspace. Links **Editor**, rechts **Live-Vorschau** — die App-Oberfläche
ist bewusst ruhig/neutral; nur die **Vorschau** trägt das Marken-Design.

```
┌──────────────────────────────────────────────────────────────────────┐
│ APP-BAR   Service Booking Online   Konfig › E-Mail-Templates   [Rolle]│
├──────────────────────────────────────────────────────────────────────┤
│ KONTEXT   Instanz: Autohaus Senker   Marke: VW│Audi│Neutral   Sprache │
├───────────────────────────────────┬──────────────────────────────────┤
│ EDITOR                            │ LIVE-VORSCHAU      [VW│Audi] [🖥│📱]│
│ 1 Template wählen  ⟨✅ ⟩⟨🚫⟩⟨⏰⟩  │ ┌──────────────────────────────┐ │
│ 2 Betreff          [____________] │ │  Von / An / Betreff          │ │
│ 3 Bausteine                       │ │ ┌──────────────────────────┐ │ │
│   🔕 No-Reply        🔒 geschützt │ │ │  E-Mail im Markendesign  │ │ │
│   👋 Begrüßung       ✏️ + ✨KI    │ │ │  (Platzhalter aufgelöst) │ │ │
│   📝 Einleitung      ✏️ + ✨KI    │ │ └──────────────────────────┘ │ │
│   📅 Buchungsdaten   🔒 Struktur  │ └──────────────────────────────┘ │
│   🔗 Meine-Buchung   🔗 URL fix   │                                  │
│   ✍️ Signatur        ✏️ + ✨KI    │                                  │
│   📎 PDF-Anhang      🔒 geschützt │                                  │
│   ⚖️ Footer (Recht)  🔒 geschützt │                                  │
│ ⟨Platzhalter-Chips: Vorname …⟩    │                                  │
│ 4 Prüfung ✅/⛔                     │                                  │
│ [↺ Standard][🕑 Versionen] … [Test][Speichern][Veröffentlichen]      │
└───────────────────────────────────┴──────────────────────────────────┘
```

### Bausteine des Editors

1. **Template-Auswahl** — Karten: *Terminbestätigung*, *Terminstornierung*
   (*Terminerinnerung* „bald verfügbar"). Jede Karte zeigt Zweck + Status + letztes Änderungsdatum.
2. **Bearbeitbare Textbausteine** — ein Feld pro Gedanke, klar betitelt
   (Begrüßung, Einleitung, Signatur …), grün als „✏️ Bearbeitbar" markiert.
3. **Geschützte Systemblöcke** — No-Reply-Hinweis, rechtlicher Footer, PDF-Anhang:
   grau, 🔒, read-only mit Klartext-Begründung („gesetzlich/technisch vorgegeben").
4. **Platzhalter als Chips** — sprechende Labels („Vorname", „Buchungsnummer"),
   Tooltip zeigt Token + Beispielwert, Pflicht-Chips mit rotem Punkt.
   Klick fügt am Cursor ins aktive Feld ein — Nutzer tippt **nie** `${…}` selbst.
5. **Live-Vorschau** — sofort, Platzhalter mit Beispieldaten aufgelöst und dezent
   markiert. Umschaltbar **VW ↔ Audi** und **Desktop ↔ Mobil**.
6. **Testmail** — an eigene Adresse, als `[TEST]` gekennzeichnet, Markenwahl.
7. **Validierung** — läuft automatisch, in Klartext: Pflicht-Platzhalter vorhanden?
   Unbekannte/zerschossene Platzhalter? Leere Pflichtbausteine? Geschützte Inhalte unverändert?
8. **Versionshistorie** — jede Veröffentlichung mit Zeit, Person, Notiz; Ein-Klick-Wiederherstellung.
9. **Zurücksetzen auf Standard** — Hersteller-Standard wiederherstellen; alte Version bleibt in der Historie.

---

## 4 · Bausteinmodell

Ein Template ist eine **geordnete Liste typisierter Bausteine**. Nicht das *HTML*
ist die Wahrheit, sondern die **Bausteine + Marken-Skin** (HTML wird daraus generiert).

| Baustein | Typ | Wer darf ändern | Geschützt |
|---|---|---|---|
| **No-Reply-Hinweis** | `system` | Admin | 🔒 immer vorhanden |
| **Begrüßung** | `text` | Händler+ | frei (Anrede-Platzhalter empfohlen) |
| **Einleitung** | `text` | Händler+ | frei |
| **Buchungsdaten / Fahrzeugdaten** | `data` | Zeilen schaltbar (Händler+), Struktur fix | 🔒 Reihenfolge & Format, Pflichtzeilen |
| **Meine-Buchung-Link** | `link` | Label (Händler+), URL (Admin) | 🔗 Ziel-URL fix |
| **Stornohinweis** | `text` | Händler+ | frei (muss `${BOOKINGNUMBER}` enthalten) |
| **Händler-Signatur** | `text` | Händler+ | frei |
| **PDF-Anhang-Hinweis** | `system` | Admin | 🔒 |
| **Rechtlicher Footer** | `system` | Admin | 🔒 gesetzlich |

**Typ-Semantik**
- `text` — frei editierbar, KI-unterstützt, Platzhalter erlaubt.
- `data` — geschützte Struktur; Nutzer schaltet nur **sichtbare Zeilen**
  (Pflichtzeilen wie Buchungsnummer sind fix an).
- `link` — Button; **Label** editierbar, **Ziel-URL** aus Sicherheitsgründen fixiert.
- `system` — rechtlich/technisch vorgegeben; nur Admin; trägt Klartext-Begründung.

### Fahrzeugdaten / Buchungsdaten
Strukturierter Block aus Platzhaltern (Datum, Uhrzeit, Leistungen, Annahmeart,
Serviceberater, Ersatzfahrzeug, Abholzeit, FIN, Kennzeichen). Reihenfolge/Format
sind geschützt; der Betrieb entscheidet pro Zeile nur über **sichtbar/ausgeblendet**.

---

## 5 · Regeln & Schutzmechanik

### Pflicht-Platzhalter (kann nicht „kaputtgehen")
- Pro Template als **required** definiert (Admin), z. B.
  - Terminbestätigung: `${BOOKINGNUMBER}`, `${APPOINTMENT_DATE}`, `${APPOINTMENT_TIME}`, `${DEALER_NAME}`, `${DIRECT_LINK}`.
  - Terminstornierung: `${BOOKINGNUMBER}`, `${DEALER_NAME}`.
- Validierung blockt **Speichern & Veröffentlichen**, solange ein Pflicht-Platzhalter fehlt — mit Klartext, welcher.
- Platzhalter werden nur über Chips eingefügt → Tippfehler in `${…}` praktisch ausgeschlossen; unbekannte Tokens werden zusätzlich erkannt.

### 2FA — nur bei kritischen Änderungen
Nicht jede Änderung braucht 2FA (das hat genau die Angst erzeugt). 2FA greift **nur** bei:
- Änderung der **Betreffzeile**,
- Änderung einer **Ziel-URL** / eines Link-Blocks,
- Änderung eines **geschützten Systembausteins** (nur Admin).

Reine Texthübsche an Begrüßung/Einleitung/Signatur → **kein** 2FA, nur normale Veröffentlichung.

### Freigabeprozess
- **Händler** → „Zur Freigabe einreichen" (optionale Notiz) → Key-User wird benachrichtigt.
- **Key-User/Admin** → prüfen Vorschau → veröffentlichen (ggf. mit 2FA).
- Status sichtbar: *Veröffentlicht · aktiv* / *Gespeichert · nicht veröffentlicht* / *Eingereicht · wartet auf Freigabe*.

### Testmail vor Aktivierung
- Vor jeder Veröffentlichung empfohlen, bei **kritischen** Änderungen aktiv angeboten
  („Erst Testmail" vs. „Weiter zur 2FA").
- Testmail ist als `[TEST]` markiert und erreicht **nie** echte Kunden.

### Rollback
- Jede Veröffentlichung erzeugt eine **Version** (Zeit, Person, Rolle, Notiz).
- Ein-Klick-**Wiederherstellen**. „Zurücksetzen auf Standard" sichert vorher den Ist-Zustand als Version.

---

## 6 · KI-Unterstützung (formulieren, nicht programmieren)

Pro bearbeitbarem Textbaustein eine dezente **✨ KI-Assistent**-Leiste. KI schlägt
vor, der Mensch **übernimmt oder verwirft** — das Original bleibt bis zur Bestätigung.

| Aktion | Nutzen | Schutz |
|---|---|---|
| **Text verbessern** | klarere, freundlichere Formulierung | Platzhalter bleiben unangetastet |
| **Kürzen** | knappere Variante fürs Mobil-Postfach | — |
| **Übersetzen** | DE → EN (pro Sprachvariante pflegbar) | Platzhalter werden nicht übersetzt |
| **Markenspezifisch formulieren** | Tonalität je Marke (z. B. Audi: „Vorsprung beginnt beim Service") | — |
| **Platzhalter prüfen** | erkennt fehlende/zerschossene/unbekannte Platzhalter | Teil der Live-Validierung |
| **Pflichtinhalte prüfen** | warnt, wenn No-Reply/Recht/Pflicht-Platzhalter fehlen würden | blockiert kritische Fehler |

**Wichtig:** KI fasst **niemals** geschützte Systembausteine oder Pflicht-Platzhalter
an. Vorschläge sind diff-artig sichtbar und werden geprüft, bevor sie übernommen werden.

---

## 7 · Beispiel-Workflow

**Persona:** Tom, Serviceannahme im *Autohaus Senker* (Händler-Modus), nicht-technisch.

1. Tom öffnet **E-Mail-Templates** (Menüpunkt neben dem Booking-Widget) und wählt **Terminbestätigung**.
2. Er klickt in **Signatur** und korrigiert die Telefonnummer. Rechts aktualisiert sich die **Vorschau** sofort.
3. Bei der **Einleitung** klickt er **✨ Verbessern**, liest den Vorschlag, **übernimmt**.
4. Er blendet im **Buchungsdaten**-Block die Zeile **Ersatzfahrzeug** ein (Toggle). *Buchungsnummer* bleibt fix an (🔒).
5. Die **Prüfung** zeigt grün: alle Pflicht-Platzhalter vorhanden, geschützte Inhalte unverändert.
6. Er schaltet die Vorschau auf **Audi** und **Mobil**, um beide Designs zu sehen.
7. Er sendet sich eine **Testmail** (`[TEST]`), prüft sie im Postfach.
8. Er klickt **Zur Freigabe einreichen**, hinterlässt die Notiz „Telefonnummer korrigiert".
9. **Sabine** (Key-User) bekommt die Anfrage, prüft die Vorschau, **veröffentlicht**.
   Weil Tom auch den **Betreff** angepasst hatte → **2FA** mit 6-stelligem Code.
10. Veröffentlicht. Eintrag landet in der **Versionshistorie**; bei Bedarf 1 Klick zurück.

*Keine HTML-Zeile berührt. Kein Pflicht-Platzhalter verloren. Kein Footer zerschossen.*

---

## 8 · Umsetzungsroadmap (priorisiert)

### Phase 1 — Fundament & Sicherheit *(MVP, höchster Hebel)*
- Bausteinmodell (`system`/`text`/`data`/`link`) + Marken-Skin-Renderer (VW, Audi, Neutral).
- Geführter Editor mit Template-Auswahl, bearbeitbaren Textbausteinen, geschützten Blöcken.
- Platzhalter-Chips + Pflicht-Platzhalter-**Validierung** (blockt Speichern/Veröffentlichen).
- Live-Vorschau (Marke + Desktop/Mobil) mit Beispieldaten.
- Migration: bestehende HTML-Templates → Bausteine parsen (Mapping bekannter Platzhalter).

### Phase 2 — Sicheres Veröffentlichen
- Rollenmodell (Händler/Key-User/Admin) + Rechtematrix.
- Freigabeprozess, **2FA nur bei kritischen Änderungen**, Status-Anzeige.
- Testmail-Versand. Versionshistorie + Rollback. „Auf Standard zurücksetzen".

### Phase 3 — KI-Assistenz
- Verbessern / Kürzen / Übersetzen / Markenton, jeweils mit Übernehmen-Verwerfen.
- KI-gestützte Platzhalter- & Pflichtinhalt-Prüfung als Teil der Validierung.

### Phase 4 — Skalierung & Governance
- Marken-Standard-Templates zentral pflegen & an Betriebe ausrollen (Hersteller-Admin).
- Mehrsprachigkeit pro Baustein, A/B der Betreffzeile, Audit-Log/Export.
- Weitere Templates (Terminerinnerung, Fahrzeug-abholbereit, Feedback-Anfrage).

---

## 9 · Abgrenzung zum heutigen WYSIWYG-Editor

| Heute (WYSIWYG/HTML) | Neu (Template-Assistent) |
|---|---|
| Rohes HTML, Tabellen, Inline-Styles | Typisierte Bausteine, HTML wird generiert |
| Technische Tokens `${VEHICLE_VIN}` | Sprechende Chips „FIN (VIN)" mit Tooltip + Beispiel |
| Pflichttexte/Links frei löschbar | Geschützte Blöcke 🔒, Pflicht-Platzhalter unverlierbar |
| 2FA bei *jeder* Änderung | 2FA **nur** bei kritischen Änderungen |
| Kein sicheres Netz | Validierung, Testmail, Freigabe, Versionen, Rollback |
| Fehleranfällig, angstbesetzt | Geführt, vorschaubasiert, reversibel |
