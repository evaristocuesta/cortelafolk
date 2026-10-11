# Cortelafolk 2027

Static, Spanish-language festival website built on the existing Astro 7, Tailwind CSS 4 and strict TypeScript configuration. No client framework, ticketing, registration, analytics or third-party embeds are used.

## Development

Requires Node.js >=22.12 and pnpm.

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev --background` | Start the managed development server |
| `pnpm astro dev status` | Check the background server |
| `pnpm astro dev logs` | Read background server logs |
| `pnpm astro dev stop` | Stop the background server |
| `pnpm check` | Run Astro and TypeScript diagnostics |
| `pnpm build` | Generate the static site in `dist/` |
| `pnpm test` | Validate the built page, anchors, accessibility markup and asset budgets |
| `pnpm preview` | Preview the production build |

Run `pnpm build` before `pnpm test`; tests deliberately inspect production output.

## Structure and content editing

- `src/pages/index.astro`: the single-page entry point and SEO metadata.
- `src/components/`: reusable Astro sections and presentation components.
- `src/data/site.ts`: approved festival facts, navigation, dates and practical information.
- `src/data/artists.ts`: artist records, images, day assignments and colour treatments.
- `src/data/schedule.ts`: performances, times, categories and stage references.
- `src/data/stages.ts`: proposed spaces and descriptions.
- `src/data/activities.ts`: editorial activity proposals.
- `src/types/festival.ts`: shared content interfaces and English technical identifiers.
- `src/styles/global.css`: Tailwind import, design tokens, shared styles and responsive layouts.
- `public/images/` and `public/fonts/`: local, optimised assets.

All visitor-facing text, alternative text and interaction states must remain in Spanish. All technical identifiers and technical documentation must remain in English. Section anchors intentionally use English identifiers.

## Provisional content — important

**All artist names, performance times, stage names and specific activity proposals are fictional development content, not official confirmations.** The public page clearly identifies the lineup and programme as indicative. The photographs illustrate music and festival atmosphere: they do not depict confirmed Cortelafolk performers or previous festival editions.

Before final publication, replace these records with organiser-approved content. Keep the public qualification until the programme is approved. The approved festival facts are: fourth edition, 23–25 April 2027, Cortelazor (Huelva), free access for everyone, without tickets or registration.

No sponsor logos, organiser endorsements, contact addresses or social profiles are invented. The community footer can later be extended with verified partner assets; the social section uses native sharing or clipboard copying instead of unverified profiles.

## Interaction and accessibility

The menu, schedule filters and sharing use small, bundled scripts. FAQs use native `details` elements. Without JavaScript, navigation and all three schedule days remain visible. Sharing cancellation is handled quietly and failures have Spanish feedback. Reduced-motion preferences disable smooth scrolling and transitions.

The location illustration is explicitly not a navigation map. Directions open a real Google Maps route only after clicking; no external requests are made during page rendering.

## Deployment

Upload `dist/` to a static host. Set `PUBLIC_SITE_URL` to the verified production origin during the build to emit the canonical URL, absolute social image URLs and event structured data. The site deliberately does not guess the official domain. Never publish a localhost canonical URL.

Recheck organiser-approved accessibility, services, accommodation guidance, privacy/legal requirements and any future sponsor or social links before going live.

## Assets

The landscape, map and favicon are original vector illustrations. Photographs are downloaded WebP copies of Unsplash images, licensed under the [Unsplash license](https://unsplash.com/license):

| Local asset | Source |
| --- | --- |
| `live-guitar.webp` | `https://images.unsplash.com/photo-1510915361894-db8b60106cb1` |
| `live-crowd.webp` | `https://images.unsplash.com/photo-1470225620780-dba8ba36b745` |
| `live-stage.webp` | `https://images.unsplash.com/photo-1501386761578-eac5c94b800a` |
| `live-night.webp` | `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f` |

Barlow Condensed and DM Sans are locally hosted Google Fonts under the SIL Open Font License. License copies are included in `public/fonts/`. The original social preview source is `public/images/social-preview.svg`; `social-preview.png` is the raster version used by social networks.
