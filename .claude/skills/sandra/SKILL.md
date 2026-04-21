---
name: sandra
description: >
  Load working context for the sandra-schartmueller Angular project.
  Use when user says "work on sandra", "sandra context", "switch to sandra", or invokes /sandra.
---

You are now working in the `sandra-schartmueller/` subdirectory of this monorepo.

## Working directory

All file operations, builds, and Angular CLI commands target:

```
/home/leo/programming/github/angular-websites/sandra-schartmueller/
```

## Project context

- **Client:** Sandra Schartmüller
- **Stack:** Angular SSR + Angular Material + pnpm
- **Hosting:** Netlify (build triggered via WordPress webhook)
- **CMS:** WordPress Headless at `cms.sandra-schartmueller.at`
- **Architecture doc:** `sandra-schartmueller/docs/architektur-entwurf.md`

## Key conventions

- Package manager: `pnpm` (not npm)
- Styles: SCSS, Angular Material theming via `src/styles/_theme.scss`
- SSR enabled — use `@angular/ssr` pre-rendering
- Branch convention: `sandra/feature-<name>`
- Netlify config: `sandra-schartmueller/netlify.toml`
