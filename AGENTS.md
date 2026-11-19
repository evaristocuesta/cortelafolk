# AGENTS.md

Static Astro 7 + Tailwind CSS 4 site (Spanish) for the Cortelafolk 2027 festival. No client framework, no backend, no API. pnpm, Node >= 22.12.

The public pages are `src/pages/index.astro` (minimal root teaser), `src/pages/cookies.astro` and `src/pages/privacidad.astro` (legal policies), and `src/pages/2027/index.astro` (full festival site, still served at `/2027/` while it's being built out). `src/pages/404.astro` is the Spanish not-found page served as `dist/404.html`.

## Commands

- `pnpm install`
- `pnpm dev --background` — managed dev server. Then `pnpm astro dev status` / `logs` / `stop`. A foreground `pnpm dev` blocks the session; prefer background mode.
- `pnpm check` — Astro + TypeScript diagnostics. This is the only static check; there is no lint or format script.
- `pnpm build` then `pnpm test` — **build first**: the tests read `dist/index.html` and `dist/2027/index.html`, and fail with "Run pnpm build before pnpm test."
- Single test: `node --test --test-name-pattern="…" scripts/site.test.mjs` (the flag must precede the file path).

Verify a change with `pnpm check && pnpm build && pnpm test`.

## What `pnpm test` actually pins

`scripts/site.test.mjs` is a contract test against the **built** HTML/CSS, not unit tests. Most assertions target the full festival contract at `/2027/`; a smaller set covers the root landing page. It asserts:

- root landing page (`dist/index.html`): the Cortelafolk logo, the 2027 dates and location, an `ENTRADA LIBRE` mention, exactly one `<h1>`, and a title mirrored by `og:title` / `twitter:title` (`Cortelafolk 2027 · Festival de folk en Cortelazor · 23–25 abril`).
- landing structured data (only when `PUBLIC_SITE_URL` is set): a `MusicEvent` JSON-LD with the approved facts (dates, Cortelazor, free access, `inLanguage: es-ES`), no `offers` because the festival has no tickets or registration, no `performer` until the lineup is confirmed, and the two `organizer` names identical to the visible `#organizacion` credits. When the env is unset, the landing must emit no `ld+json` at all.
- crawl surface: `dist/robots.txt` (`Allow: /`, `Disallow: /2027/` — drop both the rule and the assertion together when the festival page goes public — and a `Sitemap:` line), `dist/sitemap.xml` listing exactly the root landing and the public `/cookies/` and `/privacidad/` pages, and `dist/404.html` (Spanish, `noindex`, one `<h1>`, link back to `/`).
- consent: the landing, festival and legal pages install the same GTM container after setting Consent Mode defaults (`analytics_storage` denied; advertising storage denied). The banner stores necessary, statistics and external-content choices, updates the data layer via `cookie_consent_update`, and offers a persistent control to revise the choice. Analytics must remain blocked until statistics consent. The Google Maps iframe is not requested until external content is accepted or the visitor explicitly loads it once.
- festival page (`dist/2027/index.html`): exact Spanish copy, exact section IDs (`home`, `festival`, `artistas`, `free-access`, `programacion`, `actividades`, `como-llegar`, `informacion`, `organizacion`), a single `<h1>`, exactly 10 `.section-wave` dividers, 6 `<details>`, 3 `data-schedule-day` blocks.
- schedule: 16 slots, each naming one of the four stages (concerts in the plaza or the church, hands-on sessions in the museum or the hall, all four stages used, stage strip describes all four); every slot title is either written by the schedule or borrowed from `artists.ts` / `activities.ts`, and the timetable lists each artist and each activity exactly once. The 10 catalogue-linked rows are buttons opening the same profile modal as their card with an identical payload; cards and modals show the `HH:MM · Stage` line from `artistSlot` / `activitySlot` / `slotLabel`; both modals are rendered from the shared `ProfileDialog.astro` (a test asserts the two dialog blocks are structurally identical).
- every `href` on the built content and legal pages resolves: anchors to an existing `id`, local paths to a file in `dist/`, external links to `https://` (no local origins).
- asset budgets: total client JS (bundled + inline) < 12 KB, each `.webp` photo < 200 KB, `social-preview.png` exactly 1200×630, every `src`/`href` root-absolute path present in `dist/`.
- generated Tailwind selectors (`.tablet\:grid-cols-4`, `.wide\:px-16`, `.aria-pressed\:bg-forest`, `.group-open\:rotate-45`) and `scroll-padding-top` 82 / 72 / 68 px at the three breakpoints.
- no `<form>` or ticketing wording (consent checkboxes are allowed), no `class="is-active"`, no localhost canonical/`og:url` when `PUBLIC_SITE_URL` is unset.

Renaming an ID, changing visitor-facing copy, adding a section, or swapping an image means updating this test in the same change.

## Content rules

- Visitor-facing text, alt text and interaction states are **Spanish**; technical identifiers, section anchors and documentation are **English**.
- Artist names, times, stages and activities are **fictional placeholders**; the "orientativa" / "Cartel en preparación" notices were removed on purpose, so don't re-add them, and never phrase invented details as confirmed. Approved facts only: fourth edition, 23–25 April 2027, Cortelazor (Huelva), free access without tickets or registration. Don't invent sponsors, contact details or social profiles.
- The `#organizacion` section ships **real organisers** (La mano verde, Ayuntamiento de Cortelazor) and **placeholder collaborators** (Colaborador 1–20 pointing at `*.com` domains) on purpose; each entry in `organizers` / `collaborators` in `src/data/site.ts` carries its own `logo` path under `public/images/partners/`, meant to be swapped for the real links and logos. The `organizers` array also feeds the landing `MusicEvent` JSON-LD, so keep both in sync by editing only that array. The user has supplied La Mano Verde as the privacy-policy controller name and `arte@lamanoverde.info` as contact; do not infer missing legal identifiers or addresses.

## Styling

- Tailwind utilities directly in Astro components for layout; `src/styles/global.css` holds poster composition, illustrations, decorative pseudo-elements and shared editorial typography. Don't express everything as arbitrary utilities, and don't duplicate a rule in both places.
- Custom breakpoints live in `@theme`: `tablet` = 60rem (960px), `wide` = 68.8125rem (1101px). Define new breakpoints and min-width variants in **rem** so they sort with Tailwind's defaults.
- Use `PageContainer.astro` for page widths; never add a global `.container` (it collides with Tailwind's utility).
- Schedule filters use `aria-pressed:` variants as the sole active-state source; FAQs are native `details` driven by `group-open:`. Preserve the global `[hidden]` rule and reduced-motion overrides.

## Config and deployment

- Canonical URL, absolute social image URLs and `MusicEvent` JSON-LD are emitted only when `PUBLIC_SITE_URL` is set at build time (`src/pages/index.astro` and `src/pages/2027/index.astro`; see `.env.example`). Never build with a localhost origin. `public/robots.txt` and `public/sitemap.xml` hardcode the production origin (they are static files); the sitemap lists the root and public legal policies, and `robots.txt` currently disallows `/2027/` until the festival page is published.
- `dist/` is gitignored build output — that's what gets uploaded to a static host.

## References

- `README.md` — directory map, styling conventions, interaction/accessibility details, asset licences (Unsplash photos, local fonts).
- `CLAUDE.md` — a one-line pointer to this file.
- Astro docs: https://docs.astro.build (routing, components, styling, i18n).
