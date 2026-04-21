# sandra-schartmueller

Angular 21 website for Sandra Schartmüller — headless WordPress + Netlify SSG.

**Live:** www.sandra-schartmueller.at  
**CMS:** cms.sandra-schartmueller.at (WordPress, Helloly hosting)  
**Architecture doc:** `docs/architektur-entwurf.md`

## Stack

- Angular 21 + SSR/pre-rendering (`@angular/ssr`)
- Angular Material M3 with custom brand theme
- pnpm
- Netlify (build on push + WordPress webhook)

## Local development

```bash
pnpm install
pnpm exec ng serve
```

Open `http://localhost:4200/`

## Build

```bash
pnpm exec ng build
```

Output: `dist/sandra-schartmueller/browser/`

## Tests

```bash
pnpm exec ng test
```

## Brand colors

| Role       | Hex       |
| ---------- | --------- |
| Background | `#fbf3ce` |
| Primary    | `#6f191c` |
| Accent     | `#d6c2e5` |

Theme defined in `src/styles/_theme.scss`.
