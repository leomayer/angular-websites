# Architektur-Entwurf

**Angular + WordPress Headless + Netlify**
_Stand: April 2026 | Version 1.3 | In Entwicklung_

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

## 3. Monorepo-Struktur

Das GitHub-Repository `angular-websites` enthält pro Kunde ein eigenständiges Angular-Projekt als Unterverzeichnis. Jedes Projekt hat seine eigene Netlify-Konfiguration und ist vollständig isoliert.

```
angular-websites/
├── sandra-schartmueller/
│   ├── public/
│   │   ├── sitemap.xml            ← 1 <url> pro öffentlicher Route
│   │   └── robots.txt             ← referenziert Sitemap
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/        ← WpPost, etc.
│   │   │   │   └── services/      ← WordpressService, SeoService
│   │   │   └── maintenance/       ← initiale Startseite (pre-launch)
│   │   ├── environments/          ← environment.ts / environment.prod.ts
│   │   ├── styles/
│   │   │   ├── _theme.scss        ← Angular Material M3 Theme
│   │   │   └── _variables.scss    ← CSS Custom Properties
│   │   └── styles.scss
│   ├── angular.json
│   └── netlify.toml
├── portfolio/                     ← eigenes Portfolio (später)
└── README.md
```

---

## 4. Lokale Entwicklung

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

- **Pre-Rendering:** aktiviert via `--ssr`
- **SPA-Routing:** Redirect-Regel in `netlify.toml` (`/* → /index.html`)
- **Saubere URLs:** Angular Router, kein Hash-Routing
- **sitemap.xml:** `public/sitemap.xml` — 1 `<url>` pro öffentlicher Angular-Route, manuell gepflegt
- **robots.txt:** `public/robots.txt` — referenziert Sitemap, von Netlify automatisch ausgeliefert
- **`<link rel="sitemap">`** im `<head>` von `index.html` verknüpft

> **Wartung:** Bei neuer Route in `app.routes.ts` → `sitemap.xml` manuell um einen `<url>`-Block erweitern.

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

### 6.2 Maintenance-Seite: noindex

Die Maintenance-Komponente setzt `noindex, nofollow` direkt via `Meta`-Service — strikt lokal, kein `SeoService` involviert. Beim Go-Live entfernen.

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

**Wartungsmodus-Mechanismus:**
- WP Page mit Slug `maintenance-mode` → published = Wartungsmodus aktiv, draft = inaktiv
- Angular prüft beim Build via `WordpressService.maintenanceModeResource()`
- Status wird nur in der Browser-Konsole geloggt, nicht im UI angezeigt

---

## 8. Netlify – Build, Hosting & CDN

- Verbunden mit GitHub-Repository (OAuth)
- Pro Kundenprojekt eine eigene Netlify-Site, konfiguriert auf das Unterverzeichnis
- Build-Command: `pnpm exec ng build` (mit Pre-Rendering)
- Publish-Directory: `dist/sandra-schartmueller/browser`
- Alles aus `public/` wird automatisch in den Build-Output kopiert
- Deploy Hook URL: wird von WordPress Webhook aufgerufen
- Automatisches SSL-Zertifikat (Let's Encrypt)
- Globales CDN

### 8.1 `netlify.toml`

```toml
[build]
  base    = "sandra-schartmueller"
  command = "pnpm exec ng build"
  publish = "dist/sandra-schartmueller/browser"
  ignore  = "git diff --quiet HEAD^ HEAD -- src/ angular.json netlify.toml package.json pnpm-lock.yaml public/"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

> **Hinweis:** `WP_API_URL` wird **nicht** in `netlify.toml` gesetzt (würde im Repository landen). Stattdessen im Netlify Dashboard unter _Site → Environment variables_ eintragen.

### 8.2 Builds während der Entwicklung überspringen

**Für Code-Änderungen — Feature Branches (empfohlen):**
Arbeit auf `sandra/feature-*` Branches. Netlify deployt automatisch nur `main` → kein Production-Build bis zum Merge.

```bash
git checkout -b sandra/feature-neue-seite
# ... entwickeln, committen ...
git checkout main && git merge sandra/feature-neue-seite
git push  # → jetzt triggert Netlify
```

Alternative für einzelne Commits auf `main`:
```
git commit -m "wip: layout anpassen [skip netlify]"
```

**Für WordPress-Content-Updates:**
Der WP Webhook trifft immer den Netlify Deploy Hook für `main` — unabhängig vom aktiven Branch. Zwei Optionen:

- **WP Webhooks → Webhook temporär deaktivieren** (Toggle im Plugin): Am einfachsten, wenn längere Dev-Phase ohne WP-Rebuilds gewünscht.
- **Netlify Dashboard → Deploys → „Stop auto publishing"**: Stoppt alle automatischen Builds (Code + WP). Manuell neu starten wenn bereit.

> Nach Dev-Phase: Webhook/Auto-Publishing wieder aktivieren und einmalig manuell bauen (Netlify Dashboard → „Trigger deploy").

### 8.3 Deploy Hook & WordPress Webhook

Deploy Hook URL in Netlify erstellt (_Build & Deploy → Build hooks_) und in **WP Webhooks → Send Data** eingetragen.

Aktiver Trigger: **`post_updated`** (einzige relevante Action in WP Webhooks für diesen Zweck).

> `post_create` bewusst ausgelassen — neue Posts starten als Entwurf, Entwürfe erscheinen nicht in der REST API. `post_publish` existiert in WP Webhooks nicht als eigenständige Action.

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

## 11. Status & Offene Punkte

### Noch ausstehend

**Angular-Entwicklung:**
- [ ] Angular Routing-Struktur definieren (welche Routen?)
- [ ] Seiten-Komponenten aufbauen — **mobile-first, responsive**
- [x] Deploy Hook in Netlify erstellt, URL in WP Webhooks eingetragen (Trigger: `post_updated`)
- [x] End-to-End Test bestätigt: WP speichern → Netlify Build → Live
- [ ] Sitemap bei Google Search Console einreichen (nach Go-Live)

### Abgeschlossen

**Infrastruktur:**
- [x] GitHub Monorepo `angular-websites` erstellt
- [x] DNS-Einträge bei Helloly angepasst
- [x] SSL-Zertifikat auf Netlify verifiziert
- [x] WordPress auf Helloly aufgesetzt, Plugins installiert
- [x] WordPress REST API getestet (`/wp-json/wp/v2/`)
- [x] Netlify-Account erstellt, Site für `sandra-schartmueller` angelegt
- [x] `netlify.toml` konfiguriert

**Angular:**
- [x] Angular-Projekt initialisiert (`--ssr`, `--package-manager=pnpm`, `--style=scss`)
- [x] Angular Material + Brand-Theme implementiert (M3 CSS-Variable-Overrides)
- [x] Environment-Dateien angelegt (`src/environments/`)
- [x] `HttpClient` mit `withFetch()` registriert (SSR-kompatibel)
- [x] `WordpressService` + `WpPost`-Model implementiert (`src/app/core/`)
- [x] `SeoService` implementiert — Yoast-Integration, Pattern für alle Routen etabliert
- [x] Maintenance-Seite implementiert — Content dynamisch aus WP Page (id=12)
- [x] Wartungsmodus-Flag via WP Page slug `maintenance-mode`
- [x] `sitemap.xml` + `robots.txt` in `public/` angelegt
- [x] `<link rel="sitemap">` in `index.html`

---

_Last update: 2026-04-21 18:27:08_
