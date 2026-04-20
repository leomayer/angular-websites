# angular-websites

Monorepo for Angular client websites. Each subdirectory is a standalone Angular project with its own Netlify config.

## Projects

| Directory | Client | URL | Status |
|--|--|--|--|
| `sandra-schartmueller/` | Sandra Schartmüller | www.sandra-schartmueller.at | In Entwicklung |

## Stack

- **Frontend:** Angular 21 + SSR (pre-rendering) + Angular Material M3
- **Package manager:** pnpm
- **Hosting:** Netlify (per project)
- **CMS:** WordPress Headless (Helloly hosting)
- **CI:** GitHub Actions (per project, path-filtered)

## Structure

```
angular-websites/
├── sandra-schartmueller/   ← Angular project
│   ├── src/
│   ├── angular.json
│   └── netlify.toml
├── sandra/docs/            ← Architecture docs
└── .gitignore
```

## Development

```bash
cd <project-dir>
pnpm install
pnpm exec ng serve
```

See `sandra/docs/architektur-entwurf.md` for full architecture documentation.
