# AGENTS.md

Static Astro 7 + Tailwind CSS 4 site (Spanish) for the Cortelafolk 2027 festival. No client framework, no backend, no API. pnpm, Node >= 22.12.

Two pages: `src/pages/index.astro` is a minimal root teaser (logo, dates) and `src/pages/2027/index.astro` is the full single-page festival site, served at `/2027/` while it's being built out.

## Commands

- `pnpm install`
- `pnpm dev --background` — managed dev server. Then `pnpm astro dev status` / `logs` / `stop`. A foreground `pnpm dev` blocks the session; prefer background mode.
- `pnpm check` — Astro + TypeScript diagnostics. This is the only static check; there is no lint or format script.
- `pnpm build` then `pnpm test` — **build first**: the tests read `dist/index.html` and `dist/2027/index.html`, and fail with "Run pnpm build before pnpm test."
- Single test: `node --test --test-name-pattern="…" scripts/site.test.mjs` (the flag must precede the file path).

Verify a change with `pnpm check && pnpm build && pnpm test`.

## What `pnpm test` actually pins

`scripts/site.test.mjs` is a contract test against the **built** HTML/CSS, not unit tests. Most assertions target the full festival contract at `/2027/`; a smaller set covers the root landing page. It asserts:

- root landing page (`dist/index.html`): the Cortelafolk logo, the 2027 dates and location, an `ENTRADA LIBRE` mention.
- festival page (`dist/2027/index.html`): exact Spanish copy, exact section IDs (`home`, `festival`, `artists`, `free-access`, `schedule`, `activities`, `location`, `information`), a single `<h1>`, exactly 10 `.section-wave` dividers, 5 `<details>`, 3 `data-schedule-day` blocks.
- asset budgets: total client JS (bundled + inline) < 12 KB, each `.webp` photo < 200 KB, `social-preview.png` exactly 1200×630, every `src`/`href` root-absolute path present in `dist/`.
- generated Tailwind selectors (`.tablet\:grid-cols-4`, `.wide\:px-16`, `.aria-pressed\:bg-forest`, `.group-open\:rotate-45`) and `scroll-padding-top` 82 / 72 / 68 px at the three breakpoints.
- no `<form>` or ticketing wording, no `class="is-active"`, no localhost canonical/`og:url` when `PUBLIC_SITE_URL` is unset.

Renaming an ID, changing visitor-facing copy, adding a section, or swapping an image means updating this test in the same change.

## Content rules

- Visitor-facing text, alt text and interaction states are **Spanish**; technical identifiers, section anchors and documentation are **English**.
- Artist names, times, stages and activities are **fictional placeholders** and must keep their "orientativa" / "Cartel en preparación" qualification. Approved facts only: fourth edition, 23–25 April 2027, Cortelazor (Huelva), free access without tickets or registration. Don't invent sponsors, contact details or social profiles.

## Styling

- Tailwind utilities directly in Astro components for layout; `src/styles/global.css` holds poster composition, illustrations, decorative pseudo-elements and shared editorial typography. Don't express everything as arbitrary utilities, and don't duplicate a rule in both places.
- Custom breakpoints live in `@theme`: `tablet` = 60rem (960px), `wide` = 68.8125rem (1101px). Define new breakpoints and min-width variants in **rem** so they sort with Tailwind's defaults.
- Use `PageContainer.astro` for page widths; never add a global `.container` (it collides with Tailwind's utility).
- Schedule filters use `aria-pressed:` variants as the sole active-state source; FAQs are native `details` driven by `group-open:`. Preserve the global `[hidden]` rule and reduced-motion overrides.

## Config and deployment

- Canonical URL, absolute social image URLs and `MusicEvent` JSON-LD are emitted only when `PUBLIC_SITE_URL` is set at build time (`src/pages/index.astro` and `src/pages/2027/index.astro`; see `.env.example`). Never build with a localhost origin.
- `dist/` is gitignored build output — that's what gets uploaded to a static host.

## References

- `README.md` — directory map, styling conventions, interaction/accessibility details, asset licences (Unsplash photos, local fonts).
- `CLAUDE.md` — a one-line pointer to this file.
- Astro docs: https://docs.astro.build (routing, components, styling, i18n).
