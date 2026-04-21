# Frontend Conventions

> Monorepo-wide conventions for all Angular projects under `angular-websites/`.
> Each project may extend these in its own `docs/` folder.

---

## Stack

| Tool             | Version | Notes                         |
|------------------|---------|-------------------------------|
| Angular          | 21.x    |                               |
| Angular Material | 21.x    | M3 theming                    |
| Package manager  | pnpm    | never npm/yarn                |
| Styles           | SCSS    |                               |
| SSR/SSG          | @angular/ssr | outputMode: static für Netlify |
| Node             | 22 LTS  |                               |
| Test runner      | Vitest  |                               |

---

## Project Structure

```
project/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/       ← interfaces & types
│   │   │   └── services/     ← injectable services
│   │   ├── shared/           ← reusable components, pipes, directives
│   │   └── features/         ← feature modules / route components
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
│       ├── _theme.scss       ← Angular Material M3 theme
│       └── _variables.scss   ← CSS custom properties
```

---

## Angular Conventions (verbindlich)

- **Standalone Components** — keine NgModules
- **Control Flow**: `@if`, `@for (x of list; track x.id)`, `@switch`
- **Signals**: `signal()`, `computed()`, `effect()`
- **Input/Output**: `input()` / `output()` — kein `@Input()` / `@Output()`
- **HTTP**: `httpResource()` statt `HttpClient` direkt
- **Change Detection**: **kein `ChangeDetectionStrategy.OnPush`** — Signals übernehmen die Granularität. Nicht importieren, nicht setzen.
- **Strict Mode**: aktiv (`strict: true` in `tsconfig.json`)
- **Dependency Injection**: `inject()` statt constructor injection

### Components

<!-- fill in: naming, file structure -->

### Services

<!-- fill in: providedIn root vs feature -->

### Routing

<!-- fill in: lazy loading strategy, route naming -->

### State Management

Signals als primäres State-Management — kein externer Store.

---

## Icons: Material Symbols

Projekt verwendet **Material Symbols Outlined** Variable-Font (nicht Material Icons). In `index.html` geladen.

- FILL-Achse Standard = 0 (outlined)
- Klasse `.symbol-filled` (`font-variation-settings: 'FILL' 1`) für gefüllte Variante
- Globaler Default in `styles.scss`
- Kein `mat-icon [fontIcon]` mit Material Icons — Material-Symbols-Ligatur-Namen direkt nutzen

---

## Styling Conventions

### SCSS

<!-- fill in: BEM, nesting depth, use of :host -->

### Angular Material

- M3 Theming via `mat.theme()` in `_theme.scss`
- Brand-Farben als CSS Custom Properties in `_variables.scss`

<!-- fill in: which components to prefer -->

### Responsive

<!-- fill in: breakpoints, mobile-first or desktop-first -->

---

## Code Quality

### Prettier

- `singleQuote: true`
- `printWidth: 100`
- `tabWidth: 2`
- HTML parser: `angular`, `htmlWhitespaceSensitivity: strict`
- Formatter on-save aktiv

### Linting

<!-- fill in: ESLint rules, any custom rules -->

---

## Git & Branching

<!-- fill in: branch naming, commit convention, PR flow -->

---

## Deployment

- Hosting: Netlify (eine Site pro Projekt)
- Build: `pnpm exec ng build` (production default)
- Publish dir: `dist/<project>/browser`
- Env vars: Netlify Dashboard — nie in `netlify.toml`

---

_Last update: 2026-04-21_