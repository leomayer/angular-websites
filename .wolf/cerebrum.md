# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-20

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->
- **Responsive design:** All components must be mobile-ready. RWD applies across all screen sizes. Maintenance component is exception (low priority), but all future page components must be built mobile-first.

## Key Learnings

- **Project:** angular-websites
- **HttpClient:** Must use `provideHttpClient(withFetch())` — `withFetch()` is required for SSG/SSR compatibility (uses native fetch instead of XMLHttpRequest)
- **httpResource():** Project convention is `httpResource()` NOT `HttpClient` directly. Service exposes factory methods returning `httpResource<T>()`. Must be called in injection context (component field/constructor). URL argument MUST be a function `() => string`, never a plain string — TS2769 compile error otherwise.
- **Environments:** No environments folder exists by default in Angular 17+; must create `src/environments/` manually and add `fileReplacements` to `angular.json` production config
- **WP API:** WordPress REST API available at `https://cms.sandra-schartmueller.at/wp-json/wp/v2/posts/:id` — no auth needed for public posts
- **Service location:** Core services and models go in `src/app/core/services/` and `src/app/core/models/`
- **No OnPush:** Do NOT set `ChangeDetectionStrategy.OnPush` — signals handle granularity
- **Icons:** Material Symbols Outlined variable font, not Material Icons. Use ligature names directly, not `mat-icon [fontIcon]`
- **Inputs/Outputs:** Use `input()` / `output()` signal functions, not `@Input()` / `@Output()` decorators

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
