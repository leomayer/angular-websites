# Architektur-Entwurf

**Angular + WordPress Headless + Netlify**
_Stand: April 2026 | Version 1.2 | Entwurf_

---

## 1. Überblick

Ziel ist eine moderne, SEO-freundliche Website auf Basis von Angular mit statischem Pre-Rendering. WordPress dient ausschließlich als Headless CMS für die Content-Pflege durch nicht-technische Redakteure. Der Angular-Build läuft auf Netlify, WordPress auf dem bestehenden Helloly-Hosting.

> **Kernprinzip:** Content wird nur beim Build aus WordPress geholt und in statische HTML-Dateien eingebacken. Im laufenden Betrieb hat Netlify keinen Live-Kontakt zu WordPress.

---

## 2. Stack-Übersicht

| Komponente  | Dienst    | Aufgabe                       | URL / Zugang                |
| ----------- | --------- | ----------------------------- | --------------------------- |
| Frontend    | Netlify   | Hosting, Build, CDN           | www.sandra-schartmueller.at |
| Source Code | GitHub    | Versionskontrolle, CI-Trigger | github.com/angular-websites |
| CMS         | WordPress | Content-Pflege (Headless)     | cms.sandra-schartmueller.at |
| Mail        | Helloly   | E-Mail-Dienste                | MX auf Helloly              |

---

## 3. Lokale Entwicklung

Environment-Variablen: lokal via `.env`, Netlify-Build via Netlify Environment Variables (`WP_API_URL`).

```bash
cd sandra-schartmueller
pnpm install
pnpm exec ng serve

# Lokalen Build testen
pnpm exec ng build && npx serve dist/sandra-schartmueller/browser

# Deploy auslösen
git add . && git commit -m "feat: ..." && git push origin main
```

---

## 4. Monorepo-Struktur

Das GitHub-Repository `angular-websites` enthält pro Kunde ein eigenständiges Angular-Projekt als Unterverzeichnis. Jedes Projekt hat seine eigene Netlify-Konfiguration und ist vollständig isoliert.

```
angular-websites/
├── sandra-schartmueller/
│   ├── src/
│   │   ├── styles/
│   │   │   ├── _theme.scss        ← Angular Material M3 Theme
│   │   │   └── _variables.scss    ← CSS Custom Properties
│   │   ├── styles.scss
│   │   └── app/
│   ├── angular.json
│   └── netlify.toml               ← noch anlegen
├── portfolio/                     ← eigenes Portfolio (später)
└── README.md
```

---

## 5. Angular Material Theming

Angular Material 21 verwendet **M3** (`mat.theme()`). Brandfarben werden als CSS-Variable-Overrides gesetzt.

| Rolle       | Hex       | Beschreibung      |
| ----------- | --------- | ----------------- |
| Hintergrund | `#fbf3ce` | Warmes Creme-Gelb |
| Akzent      | `#d6c2e5` | Zartes Lavendel   |
| Primär/Text | `#6f191c` | Dunkles Weinrot   |

Theme-Implementierung → `src/styles/_theme.scss`  
CSS Custom Properties → `src/styles/_variables.scss`  
Einstiegspunkt → `src/styles.scss`

---

## 6. SEO-Strategie

Angular Pre-Rendering (SSG) generiert für jede Route eine fertige HTML-Datei zum Build-Zeitpunkt. Suchmaschinen-Crawler sehen sofort vollständigen Content ohne JavaScript-Ausführung.

- **Title Service:** `<title>` pro Route setzen
- **Meta Service:** `description`, `og:title`, `og:description` etc.
- **Pre-Rendering:** bereits via `--ssr` aktiviert
- Saubere URLs via Angular Router (kein Hash-Routing)
- `_redirects` Datei für korrektes SPA-Routing auf Netlify
- `sitemap.xml`: statische Datei in `/public`

### 6.1 SEO aus WordPress (Yoast)

WordPress-Plugin **Yoast SEO** erweitert die REST API automatisch: jede Page/Post liefert `yoast_head_json` mit strukturierten SEO-Feldern (`title`, `description`, `og_title`, `og_description`, `og_image`, …).

**Datenfluss:**
```
WP Page (Yoast-Felder) → REST API → Angular SeoService → Title + Meta Services → Pre-rendered HTML
```

**`SeoService`** (`src/app/core/services/seo.service.ts`):
- `set(SeoData)` — setzt Title + Meta-Tags direkt
- `setFromYoast(yoast_head_json)` — mappt Yoast-Felder automatisch

**Pattern pro Page-Komponente:**
```typescript
constructor() {
  effect(() => {
    const yoast = this.page.value()?.yoast_head_json;
    if (yoast) this.seo.setFromYoast(yoast);
  });
}
```

> SEO-Felder werden in Yoast direkt pro Seite gepflegt — kein Code-Eingriff nötig.

---

## 7. WordPress – Headless CMS

- WordPress läuft auf dem gebuchten Webstart Smart S Paket (Helloly)
- REST API aktiviert unter `/wp-json/wp/v2/`
- Redakteur pflegt Content ausschließlich im WP-Backend
- Kein Theme nötig – Frontend ist Angular

**Installierte Plugins:**

| Plugin                           | Zweck                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| **WP Webhooks**                  | Sendet HTTP POST an Netlify Deploy Hook bei Content-Änderung |
| **Disable Comments**             | Kommentarfunktion vollständig deaktiviert                    |
| **Custom Login Page Customizer** | WP-Login an Kundendesign anpassen                            |
| **Wordfence Security**           | Firewall, Malware-Scan, Brute-Force-Schutz, 2FA             |
| **Yoast SEO**                    | SEO-Metadaten pro Page/Post, `yoast_head_json` via REST API  |

---

## 8. Netlify – Build, Hosting & CDN

- Verbunden mit GitHub-Repository (OAuth)
- Pro Kundenprojekt eine eigene Netlify-Site, konfiguriert auf das Unterverzeichnis
- Build-Command: `pnpm exec ng build` (mit Pre-Rendering)
- Publish-Directory: `dist/sandra-schartmueller/browser`
- Deploy Hook URL: wird von WordPress Webhook aufgerufen
- Automatisches SSL-Zertifikat (Let's Encrypt)
- Globales CDN

### 8.1 `netlify.toml`

```toml
[build]
  base    = "sandra-schartmueller"
  command = "pnpm exec ng build"
  publish = "dist/sandra-schartmueller/browser"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

> **Hinweis:** `WP_API_URL` wird **nicht** in `netlify.toml` gesetzt (würde im Repository landen). Stattdessen im Netlify Dashboard unter _Site → Environment variables_ eintragen.

### 8.2 Deploy Hook einrichten

1. Netlify Dashboard → Site → _Build & Deploy_ → _Build hooks_
2. „Add build hook" → Name: `WordPress Content Update`, Branch: `main`
3. URL kopieren → in WP Webhooks eintragen

### 8.3 WordPress Webhook konfigurieren

1. WP Webhooks → Send Data → „Post updated" Action auswählen
2. Netlify Hook URL eintragen
3. Trigger: `post_updated`, `post_published`

---

## 9. Domain & DNS

Die Domain `sandra-schartmueller.at` ist bei Helloly registriert.

```
www   CNAME  sandra-schartmueller.netlify.app
cms   CNAME  → Helloly Webserver (WordPress)
@     A      → Netlify Load Balancer IP (für Apex-Domain)
```

> **SSL:** Netlify stellt automatisch ein kostenloses Let's Encrypt Zertifikat aus.

---

## 10. Datenfluss

```
Content-Änderung:  WP Editor → WP Webhooks → Netlify Hook → ng build → CDN deploy (~2 min)
Code-Änderung:     git push → Netlify auto-build → gleicher Build-Prozess
Besucher:          Browser → Netlify CDN → statische HTML/CSS/JS  (kein Live-Kontakt zu WP)
```

---

## Offene Punkte

### Phase 1 — Angular-Entwicklung

- [ ] Angular Routing-Struktur definieren (welche Routen?)
- [ ] Komponenten aufbauen — **mobile-first, responsive**
- [x] `SeoService` implementiert (`src/app/core/services/seo.service.ts`)
- [x] Meta-Tags via Yoast + `SeoService` pro Route — Pattern etabliert
- [ ] `sitemap.xml` generieren, in `/public` ablegen

### Phase 2 — Infrastruktur

- [x] WordPress REST API testen (`/wp-json/wp/v2/`)
- [x] `netlify.toml` anlegen (siehe Abschnitt 8.1)
- [x] Netlify-Account erstellen, Site für `sandra-schartmueller` anlegen
- [ ] Deploy Hook in Netlify erstellen, URL in WP Webhooks eintragen

### Phase 3 — Go-Live

- [x] DNS-Einträge bei Helloly anpassen (siehe Abschnitt 9)
- [x] SSL-Zertifikat auf Netlify verifizieren (DNS-Propagierung abwarten)
- [ ] End-to-End Test: WP speichern → Netlify Build → Live

### Erledigt

- [x] GitHub Monorepo `angular-websites` erstellt
- [x] Angular-Projekt initialisiert (`--ssr`, `--package-manager=pnpm`, `--style=scss`)
- [x] Angular Material installiert
- [x] Brand-Theme implementiert (M3 CSS-Variable-Overrides)
- [x] WordPress auf Helloly aufgesetzt, Plugins installiert
- [x] `WordpressService` + `WpPost`-Model implementiert (`src/app/core/`)
- [x] `HttpClient` mit `withFetch()` registriert (SSR-kompatibel)
- [x] Environment-Dateien angelegt (`src/environments/`)
- [x] Maintenance-Seite als initiale Startseite implementiert
- [x] Maintenance-Seite lädt Content dynamisch aus WP Page (id=12)
- [x] Maintenance-Modus-Flag via WP Page slug `maintenance-mode` (published = aktiv)

---

_Entwurf – wird bei Bedarf erweitert._

_Last update: 2026-04-21 17:21:48_
