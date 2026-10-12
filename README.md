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
- `src/styles/global.css`: Tailwind import, design tokens, shared editorial typography and original graphic treatments.
- `public/images/` and `public/fonts/`: local, optimised assets.

All visitor-facing text, alternative text and interaction states must remain in Spanish. All technical identifiers and technical documentation must remain in English. Section anchors intentionally use English identifiers.

## Styling conventions

Use Tailwind utilities directly in Astro templates for layout, spacing, section colours, borders and responsive grids. `PageContainer.astro` centralises page widths and gutters; do not recreate a global `.container` selector, which would conflict with Tailwind's built-in utility. The `tablet` (960px) and `wide` (1101px) breakpoints preserve the festival layout's existing transitions, alongside Tailwind's standard breakpoints. Define custom breakpoints and arbitrary minimum-width variants in rem, matching Tailwind's defaults, so responsive rules sort consistently.

Keep original poster composition, illustrations, decorative pseudo-elements and shared editorial typography in `src/styles/global.css`. This is intentionally a hybrid approach, not a requirement to express every graphic detail as an arbitrary utility. Colours and fonts are defined in `@theme`; CSS aliases reference the same colour tokens. Avoid duplicating a layout rule in both component utilities and global CSS.

Schedule buttons use Tailwind's `aria-pressed:` variants, with the accessible attribute as the only active-state source. FAQs use `group-open:` on native `details` elements. Preserve the global `[hidden]` rule and reduced-motion overrides when adding new utility-based interactions.

## Provisional content — important

**All artist names, performance times, stage names and specific activity proposals are fictional development content, not official confirmations.** The public page clearly identifies the lineup and programme as indicative. The photographs illustrate music and festival atmosphere: they do not depict confirmed Cortelafolk performers or previous festival editions.

Before final publication, replace these records with organiser-approved content. Keep the public qualification until the programme is approved. The approved festival facts are: fourth edition, 23–25 April 2027, Cortelazor (Huelva), free access for everyone, without tickets or registration.

No sponsor logos, organiser endorsements, contact addresses or social profiles are invented. The community footer can later be extended with verified partner assets; the social section uses native sharing or clipboard copying instead of unverified profiles.

## Interaction and accessibility

The menu, schedule filters and sharing use small, bundled scripts. FAQs use native `details` elements. Without JavaScript, navigation and all three schedule days remain visible. Sharing cancellation is handled quietly and failures have Spanish feedback. Reduced-motion preferences disable smooth scrolling and transitions.

FAQ answers expand and collapse with a 350ms height transition and a soft opacity fade using `::details-content` and `interpolate-size`. The styles are scoped to `PracticalInformation.astro` and only apply without a reduced-motion preference. Browsers without these CSS features retain instant native opening and closing; no additional JavaScript is needed.

`src/scripts/scroll-reveal.ts` uses a single IntersectionObserver to reveal each main section and the footer every time they re-enter the viewport, with a 1100ms fade and 60px upward movement. The reveal waits until at least half the section is visible, capped at half the viewport height for sections taller than the screen. Visibility is sampled at 1% intersection-ratio increments; the animation never starts before the required visible height. Leaving the viewport cancels the current animation and prepares the next entrance, in either scroll direction. Only content animates; section backgrounds remain stationary.

Content is visually transparent while waiting, but only after JavaScript confirms animation support. Pending content cannot receive pointer clicks; keyboard focus reveals it immediately. It is never removed from the HTML, layout or accessibility tree. Without JavaScript, with reduced motion, or when printing, all content remains visible. Keyboard focus bypasses the entrance; internal links restart the target section's animation once enough of it is visible, including repeated clicks on the current anchor. No animation library or scroll event handler is required.

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
