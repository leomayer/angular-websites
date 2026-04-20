# Architektur-Entwurf
**Angular + WordPress Headless + Netlify**
_Stand: April 2026 | Version 1.0 | Entwurf_

---

## 1. Überblick

Ziel ist eine moderne, SEO-freundliche Website auf Basis von Angular mit statischem Pre-Rendering. WordPress dient ausschließlich als Headless CMS für die Content-Pflege durch nicht-technische Redakteure. Der Angular-Build läuft auf Netlify, WordPress auf dem bestehenden Helloly-Hosting.

> **Kernprinzip:** Content wird nur beim Build aus WordPress geholt und in statische HTML-Dateien eingebacken. Im laufenden Betrieb hat Netlify keinen Live-Kontakt zu WordPress.

---

## 2. Stack-Übersicht

| Komponente | Dienst     | Aufgabe                        | URL / Zugang                |
|------------|------------|--------------------------------|-----------------------------|
| Frontend   | Netlify    | Hosting, Build, CDN            | www.sandra-schartmueller.at |
| Source Code| GitHub     | Versionskontrolle, CI-Trigger  | github.com/angular-websites |
| CMS        | WordPress  | Content-Pflege (Headless)      | cms.sandra-schartmueller.at |
| Mail       | Helloly    | E-Mail-Dienste                 | MX auf Helloly              |

---

## 3. Monorepo-Struktur

Das GitHub-Repository `angular-websites` enthält pro Kunde ein eigenständiges Angular-Projekt als Unterverzeichnis. Jedes Projekt hat seine eigene Netlify-Konfiguration und ist vollständig isoliert.

```
angular-websites/
├── sandra-schartmueller/          ← Angular-Projekt (erstellt)
│   ├── src/
│   │   ├── styles/
│   │   │   ├── _theme.scss        ← Angular Material M3 Theme (erstellt)
│   │   │   └── _variables.scss    ← Custom Properties / CSS-Variablen (erstellt)
│   │   ├── styles.scss            ← Einstiegspunkt (angepasst)
│   │   └── app/
│   ├── angular.json
│   └── netlify.toml               ← noch anlegen
├── portfolio/                     ← eigenes Portfolio (später)
│   ├── src/
│   ├── angular.json
│   └── netlify.toml
└── README.md
```

> **Hinweis:** `_theme.scss` und `_variables.scss` wurden manuell angelegt — `pnpm exec ng add @angular/material` erzeugt keine Unterordner-Struktur.

---

## 4. Angular Material Theming

Jedes Kundenprojekt hat ein eigenes Theme-File unter `src/styles/_theme.scss`. Angular Material 19 verwendet **M3** (`mat.theme()`). Brandfarben werden als CSS-Variable-Overrides gesetzt.

### 4.1 Dateistruktur

```
src/
├── styles/
│   ├── _theme.scss        ← mat.theme() + Brand-Overrides
│   └── _variables.scss    ← Projektspezifische CSS Custom Properties
└── styles.scss            ← Einstiegspunkt
```

### 4.2 Markenfarben

| Rolle       | Hex       | Beschreibung       |
|-------------|-----------|--------------------|
| Hintergrund | `#fbf3ce` | Warmes Creme-Gelb  |
| Akzent      | `#d6c2e5` | Zartes Lavendel    |
| Primär/Text | `#6f191c` | Dunkles Weinrot    |

### 4.3 `_theme.scss`

```scss
@use '@angular/material' as mat;

// mat.theme() seeds the M3 token system; overrides below apply brand colors.
@mixin apply() {
  @include mat.theme((
    color: (
      primary:  mat.$red-palette,
      tertiary: mat.$violet-palette,
    ),
    typography: Roboto,
    density: 0,
  ));

  // Primary — Weinrot #6f191c
  --mat-sys-primary:               #6f191c;
  --mat-sys-on-primary:            #ffffff;
  --mat-sys-primary-container:     #ffdad9;
  --mat-sys-on-primary-container:  #410007;

  // Secondary — Lavendel #d6c2e5
  --mat-sys-secondary:             #7a5a85;
  --mat-sys-on-secondary:          #ffffff;
  --mat-sys-secondary-container:   #d6c2e5;
  --mat-sys-on-secondary-container: #2d1a38;

  // Surface — Creme #fbf3ce
  --mat-sys-surface:               #fbf3ce;
  --mat-sys-surface-variant:       #f0e6ce;
  --mat-sys-on-surface:            #6f191c;
}
```

### 4.4 `_variables.scss`

```scss
// Brand colors als plain CSS Custom Properties für Nicht-Material-Kontexte.
:root {
  --color-background: #fbf3ce;
  --color-primary:    #6f191c;
  --color-accent:     #d6c2e5;
}
```

### 4.5 `styles.scss`

```scss
@use './styles/theme' as theme;
@use './styles/variables';

html {
  height: 100%;
  @include theme.apply();
}

body {
  color-scheme: light;
  background-color: var(--color-background);
  color: var(--mat-sys-on-surface);
  font: var(--mat-sys-body-medium);
  margin: 0;
  height: 100%;
}
```

---

## 5. Komponenten im Detail

### 5.1 GitHub – Monorepo `angular-websites`

- Einzige Source of Truth für alle Kundenprojekte
- Jeder Push auf `main` triggert den jeweiligen Netlify-Build
- Feature-Branches pro Projekt empfohlen: z.B. `sandra/feature-kontaktformular`

### 5.2 Helloly – WordPress Headless CMS

- WordPress läuft auf dem gebuchten Webstart Smart S Paket
- REST API aktiviert (standardmäßig unter `/wp-json/wp/v2/`)
- Redakteur pflegt Content ausschließlich im WP-Backend
- Kein Theme nötig – Frontend ist Angular

**Installierte Plugins:**

| Plugin | Zweck |
|--|--|
| **WP Webhooks** | Sendet HTTP POST an Netlify Deploy Hook bei Content-Änderung |
| **Disable Comments** | Kommentarfunktion vollständig deaktiviert |
| **Custom Login Page Customizer** | WP-Login an Kundendesign anpassen |
| **Wordfence Security** | Firewall, Malware-Scan, Brute-Force-Schutz |

### 5.3 Netlify – Build, Hosting & CDN

- Verbunden mit GitHub-Repository (OAuth)
- Pro Kundenprojekt eine eigene Netlify-Site, jeweils auf das passende Unterverzeichnis konfiguriert
- Build-Command: `ng build` (mit Pre-Rendering)
- Publish-Directory: `dist/<projektname>/browser`
- Deploy Hook URL: wird von WordPress Webhook aufgerufen
- Automatisches SSL-Zertifikat (Let's Encrypt) für die Domain
- Globales CDN – schnellere Auslieferung als Shared Hosting

### 5.4 Lokale Entwicklung

- `ng serve` für lokale Entwicklung (gegen WordPress REST API)
- `ng build` für lokalen Production-Build
- `git push origin main` löst Netlify-Build aus
- Environment-Variablen: lokale `.env` vs. Netlify Environment Variables

---

## 6. Datenfluss

### 6.1 Build-Zeit – Content-Änderung durch Redakteur

```
1. Redakteur speichert Seite in WordPress
2. WP Webhooks Plugin → HTTP POST an Netlify Deploy Hook URL
3. Netlify startet ng build im Unterverzeichnis sandra-schartmueller/
4. Angular ruft WordPress REST API ab (z.B. /wp-json/wp/v2/pages)
5. Pre-Rendering generiert statische HTML-Dateien pro Route
6. Netlify deployed die statischen Files auf CDN
7. ~2 Minuten später: Änderung ist live
```

### 6.2 Build-Zeit – Code-Änderung durch Entwickler

```
1. Entwickler pusht auf GitHub (git push origin main)
2. Netlify erkennt Push automatisch via GitHub-Integration
3. Gleicher Build-Prozess wie oben ab Schritt 3
```

### 6.3 Laufzeit (Besucher)

```
Besucher → Netlify CDN → statische HTML/CSS/JS
(Kein Live-Kontakt zu WordPress)
```

---

## 7. SEO-Strategie

Angular Pre-Rendering (SSG) generiert für jede Route eine fertige HTML-Datei zum Build-Zeitpunkt. Suchmaschinen-Crawler sehen sofort vollständigen Content ohne JavaScript-Ausführung.

### 7.1 Technische SEO-Maßnahmen in Angular

- **Title Service:** `<title>` pro Route dynamisch setzen
- **Meta Service:** `description`, `og:title`, `og:description` etc.
- **Pre-Rendering:** `ng build` mit `@angular/ssr` und `prerender`-Option
- Saubere URLs via Angular Router (kein Hash-Routing)
- `_redirects` Datei für korrektes SPA-Routing auf Netlify
- `sitemap.xml`: einmalig generieren, als statische Datei in `/public` ablegen

### 7.2 Angular Pre-Rendering Setup

```bash
# Installation (bereits enthalten wenn --ssr beim ng new verwendet)
cd sandra-schartmueller && pnpm exec ng add @angular/ssr
```

```json
// angular.json – prerender aktivieren
"prerender": {
  "discoverRoutes": true
}
```

```bash
# Build-Befehl auf Netlify
ng build
```

---

## 8. Domain & DNS-Konfiguration

Die Domain `sandra-schartmueller.at` ist bei Helloly registriert. DNS-Einträge werden so gesetzt, dass das Frontend auf Netlify zeigt, WordPress auf einer Subdomain erreichbar bleibt.

### 8.1 DNS-Einträge (im Helloly DNS-Panel)

```
www   CNAME  sandra-schartmueller.netlify.app
cms   CNAME  → Helloly Webserver (WordPress)
@     A      → Netlify Load Balancer IP (für Apex-Domain)
```

> **SSL:** Netlify stellt automatisch ein kostenloses Let's Encrypt Zertifikat aus – kein manueller Aufwand.

---

## 9. Webhook & Deploy-Konfiguration

### 9.1 Netlify Deploy Hook einrichten

1. Netlify Dashboard → Site → _Build & Deploy_ → _Build hooks_
2. „Add build hook" → Name: `WordPress Content Update`, Branch: `main`
3. Netlify generiert eine eindeutige URL: `https://api.netlify.com/build_hooks/XXXXX`

### 9.2 WordPress Webhook konfigurieren

1. Plugin installieren: **WP Webhooks** (kostenlos, wordpress.org)
2. WP Webhooks → Send Data → „Post updated" Action auswählen
3. Netlify Hook URL eintragen
4. Trigger: `post_updated`, `post_published`

### 9.3 Netlify Build-Konfiguration (`netlify.toml`)

```toml
[build]
  base    = "sandra-schartmueller"
  command = "ng build"
  publish = "dist/sandra-schartmueller/browser"

[build.environment]
  NODE_VERSION = "20"
  WP_API_URL   = "https://cms.sandra-schartmueller.at/wp-json/wp/v2"

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

### 9.4 GitHub Actions – CI vor Deploy (optional)

```yaml
# .github/workflows/ci-sandra.yml
name: CI – sandra-schartmueller
on:
  push:
    branches: [main]
    paths:
      - 'sandra-schartmueller/**'
jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: sandra-schartmueller
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec ng test --watch=false --browsers=ChromeHeadless
      - run: pnpm exec ng build
```

> **Hinweis:** `paths: sandra-schartmueller/**` stellt sicher, dass der CI-Job nur läuft wenn sich in diesem Kundenprojekt etwas geändert hat – nicht bei Änderungen in anderen Unterverzeichnissen.

---

## 10. Lokale Entwicklung

### 10.1 Environment-Variablen

```typescript
// src/environments/environment.ts (lokal)
export const environment = {
  production: false,
  wpApiUrl: 'https://cms.sandra-schartmueller.at/wp-json/wp/v2'
};

// src/environments/environment.prod.ts (Netlify Build)
export const environment = {
  production: true,
  wpApiUrl: process.env['WP_API_URL'] ?? ''
};
```

### 10.2 Typischer Entwicklungsworkflow

```bash
# In das Kundenprojekt wechseln
cd sandra-schartmueller

# Abhängigkeiten installieren
pnpm install

# Lokal entwickeln
pnpm exec ng serve

# Lokalen Build testen
pnpm exec ng build && npx serve dist/sandra-schartmueller/browser

# Deploy auslösen
git add . && git commit -m "feat: ..." && git push origin main
```

---

---

## Offene Punkte

- [x] GitHub Monorepo `angular-websites` erstellt
- [x] Angular-Projekt initialisiert: `npx @angular/cli new sandra-schartmueller --ssr --package-manager=pnpm --routing --style=scss`
- [x] Angular Material installieren: `cd sandra-schartmueller && pnpm exec ng add @angular/material`
- [x] `_theme.scss` mit Kundenfarben befüllt (M3 CSS-Variable-Overrides — siehe Abschnitt 4)
- [x] `_variables.scss` angelegt mit CSS Custom Properties
- [x] WordPress auf Helloly aufsetzen, Plugins installiert (WP Webhooks, Disable Comments, Custom Login Page Customizer, Wordfence)
- [ ] WordPress REST API testen (`/wp-json/wp/v2/`)
- [ ] Netlify-Account erstellen, Site für `sandra-schartmueller` anlegen
- [ ] `base` in `netlify.toml` auf `sandra-schartmueller` setzen
- [ ] Deploy Hook in Netlify erstellen, URL in WP Webhooks eintragen
- [ ] DNS-Einträge bei Helloly für `sandra-schartmueller.at` anpassen
- [ ] Angular Routing-Struktur definieren (welche Routen/Verzweigungen?)
- [ ] Meta-Tags und Title Service pro Route implementieren
- [ ] `sitemap.xml` generieren und einbinden
- [ ] SSL-Zertifikat auf Netlify verifizieren

---

_Entwurf – wird bei Bedarf erweitert._
