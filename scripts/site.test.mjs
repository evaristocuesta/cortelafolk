import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const outputDirectory = resolve('dist');
const landingPath = join(outputDirectory, 'index.html');
const festivalPath = join(outputDirectory, '2027', 'index.html');
assert.ok(existsSync(landingPath) && existsSync(festivalPath), 'Run pnpm build before pnpm test.');
// `html` is the full 2027 festival page; `landingHtml` is the simple root teaser.
const html = readFileSync(festivalPath, 'utf8');
const landingHtml = readFileSync(landingPath, 'utf8');
const getAttribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
// global.css mirrors Tailwind's min-width breakpoints with a strict "<" so a
// fractional viewport (639.09px) can never fall outside both ranges. Lightning
// CSS emits that as its negated form, so both spellings are accepted.
const upperBound = (px) => `@media\\s*(?:\\(\\s*width\\s*<\\s*${px}px\\s*\\)|not all and \\(width>=${px}px\\))`;
const upperBoundBlock = (css, px) => css.match(new RegExp(`${upperBound(px)}[^{]*\\{(?:[^{}]|\\{[^{}]*\\})*\\}`))?.[0];

test('Root landing page shows the logo and 2027 dates', () => {
	assert.match(landingHtml, /<html lang="es">/);
	assert.match(landingHtml, /<title>Cortelafolk 2027/);
	const logo = landingHtml.match(/<img\b[^>]*src="\/images\/logo\.webp"[^>]*>/)?.[0];
	assert.ok(logo, 'The landing page must show the Cortelafolk logo.');
	assert.equal(getAttribute(logo, 'alt'), 'Cortelafolk');
	assert.ok(getAttribute(logo, 'width') && getAttribute(logo, 'height'), 'The logo needs explicit dimensions.');
	assert.match(landingHtml, /23 · 24 · 25/);
	assert.match(landingHtml, /ABRIL 2027/);
	assert.match(landingHtml, /Cortelazor, Huelva/);
	assert.match(landingHtml, /ENTRADA LIBRE/);
	assert.doesNotMatch(landingHtml, /<(?:form|input|select|textarea)\b/);
	for (const match of landingHtml.matchAll(/\b(?:src|href)="(\/[^"#]*)"/g)) {
		assert.ok(existsSync(join(outputDirectory, match[1])), `Missing asset: ${match[1]}`);
	}
	const landingCanonical = landingHtml.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0];
	if (landingCanonical) {
		const canonicalUrl = new URL(getAttribute(landingCanonical, 'href'));
		assert.notEqual(canonicalUrl.hostname, 'localhost');
		assert.notEqual(canonicalUrl.hostname, '127.0.0.1');
	} else {
		assert.doesNotMatch(landingHtml, /property="og:url"/);
	}
});

test('Spanish page language and festival SEO metadata', () => {
	assert.match(html, /<html lang="es">/);
	assert.match(html, /<title>Cortelafolk 2027/);
	assert.match(html, /name="description" content="[^"]*Entrada libre/);
	assert.match(html, /property="og:locale" content="es_ES"/);
	assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test('Canonical and structured data use only the configured production origin', () => {
	const canonicalTag = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0];
	if (!canonicalTag) {
		assert.doesNotMatch(html, /property="og:url"/);
		assert.doesNotMatch(html, /application\/ld\+json/);
		return;
	}
	const canonicalUrl = new URL(getAttribute(canonicalTag, 'href'));
	assert.notEqual(canonicalUrl.hostname, 'localhost');
	assert.notEqual(canonicalUrl.hostname, '127.0.0.1');
	const script = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)?.[1];
	assert.ok(script, 'A configured production site needs event structured data.');
	const event = JSON.parse(script);
	assert.equal(event['@type'], 'MusicEvent');
	assert.equal(event.isAccessibleForFree, true);
	assert.equal(event.startDate, '2027-04-23');
	assert.equal(event.endDate, '2027-04-25');
	assert.equal(event.location.address.addressLocality, 'Cortelazor');
	assert.equal(event.url, canonicalUrl.href);
	assert.equal(new URL(event.image).origin, canonicalUrl.origin);
	assert.doesNotMatch(script, /performer|offers/);
});

test('Every internal anchor resolves to a unique section', () => {
	const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
	assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML identifiers found.');
	for (const id of ['home', 'festival', 'artistas', 'free-access', 'programacion', 'actividades', 'como-llegar', 'informacion']) {
		assert.ok(ids.includes(id), `Missing festival section: ${id}`);
	}
	// Anchors are Spanish; the old English ids must not resurface in links.
	assert.doesNotMatch(html, /href="#(?:activities|information)"/);
	assert.doesNotMatch(html, /\bid="(?:activities|information)"/);
});

test('Every link in the build resolves to an asset, a page or a section', () => {
	const pages = [
		{ url: '/', source: landingHtml },
		{ url: '/2027/', source: html },
	];
	const idCache = new Map();
	const idsOf = (file) => {
		if (!idCache.has(file)) {
			idCache.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])));
		}
		return idCache.get(file);
	};
	for (const { url, source } of pages) {
		for (const match of source.matchAll(/\bhref="([^"]*)"/g)) {
			const href = match[1].replaceAll('&amp;', '&');
			assert.ok(href, `Empty href on ${url}.`);
			if (/^mailto:|^tel:/i.test(href)) continue;
			if (/^https:\/\//.test(href)) {
				assert.doesNotMatch(href, /localhost|127\.0\.0\.1/, `External link must not use a local origin: ${href}`);
				continue;
			}
			if (!/^[a-z][a-z0-9+.-]*:/i.test(href)) {
				const resolved = new URL(href, `http://local${url}`);
				const filePath = resolved.pathname.endsWith('/')
					? join(outputDirectory, resolved.pathname, 'index.html')
					: null;
				const candidates = filePath
					? [filePath]
					: [join(outputDirectory, resolved.pathname), join(outputDirectory, `${resolved.pathname}.html`), join(outputDirectory, resolved.pathname, 'index.html')];
				const file = candidates.find((candidate) => existsSync(candidate));
				assert.ok(file, `Broken link on ${url}: ${href}`);
				const fragment = resolved.hash.slice(1);
				if (fragment && file.endsWith('.html')) {
					assert.ok(idsOf(file).has(fragment), `Broken anchor on ${url}: ${href}`);
				}
				continue;
			}
			assert.fail(`Unsupported href protocol on ${url}: ${href}`);
		}
	}
});

test('All local images, fonts, styles and scripts exist in the build', () => {
	for (const match of html.matchAll(/\b(?:src|href)="(\/[^"#]*)"/g)) {
		assert.ok(existsSync(join(outputDirectory, match[1])), `Missing asset: ${match[1]}`);
	}
	for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
		assert.notEqual(getAttribute(tag, 'alt'), undefined, 'Every image needs an alt attribute.');
		assert.ok(getAttribute(tag, 'width') && getAttribute(tag, 'height'), 'Images need explicit dimensions.');
	}
	assert.ok(existsSync(join(outputDirectory, 'fonts/barlow-condensed-latin-800.woff2')));
	assert.ok(existsSync(join(outputDirectory, 'fonts/dm-sans-latin.woff2')));
	const socialPreview = readFileSync(join(outputDirectory, 'images/social-preview.png'));
	assert.equal(socialPreview.readUInt32BE(16), 1200);
	assert.equal(socialPreview.readUInt32BE(20), 630);
});

test('Free access is explicit and there is no ticketing or registration', () => {
	assert.match(html, /ENTRADA LIBRE/);
	assert.match(html, /La entrada es libre para todo el mundo/);
	assert.match(html, /href="#como-llegar"[^>]*>CÓMO LLEGAR/);
	assert.doesNotMatch(html, /<(?:form|input|select|textarea)\b/);
	assert.doesNotMatch(html, /(?:Consigue tu entrada|Entradas próximamente|Comprar entradas|eventbrite|ticketmaster|entradium|checkout)/i);
});

const socialProfiles = [
	{ name: 'Instagram', pattern: /<a\b[^>]*href="https:\/\/www\.instagram\.com\/cortelafolk\/?"[^>]*>/ },
	{ name: 'Facebook', pattern: /<a\b[^>]*href="https:\/\/www\.facebook\.com\/cortelafolk\/?"[^>]*>/ },
];

const assertSocialProfiles = (source, regionPattern, context) => {
	const region = source.match(regionPattern)?.[0];
	assert.ok(region, `Missing region: ${context}.`);
	for (const { name, pattern } of socialProfiles) {
		const tag = region.match(pattern)?.[0];
		assert.ok(tag, `Missing ${name} link in ${context}.`);
		assert.equal(getAttribute(tag, 'aria-label'), `Cortelafolk en ${name}`);
		assert.equal(getAttribute(tag, 'target'), '_blank');
		assert.match(getAttribute(tag, 'rel') ?? '', /noopener/);
	}
};

test('Official social profiles are linked from the footer and the landing page', () => {
	assertSocialProfiles(html, /<footer\b[\s\S]*?<\/footer>/, 'the festival footer');
	assertSocialProfiles(landingHtml, /<body\b[\s\S]*?<\/body>/, 'the landing page');
});

test('Provisional content is not presented as confirmed', () => {
	assert.match(html, /Cartel en preparación/);
	assert.match(html, /Esta selección es orientativa/);
	assert.match(html, /Programación orientativa/);
	assert.doesNotMatch(html, /artistas confirmados/i);
	assert.equal((html.match(/data-schedule-day=/g) ?? []).length, 3);
});

test('Artists are grouped into one column per day with an accessible modal profile', () => {
	assert.equal((html.match(/data-artist-day=/g) ?? []).length, 3, 'Expected one artist column per festival day.');
	for (const id of ['artist-day-friday', 'artist-day-saturday', 'artist-day-sunday']) {
		assert.match(html, new RegExp(`id="${id}"`), `Missing artist column heading: ${id}.`);
	}
	const triggers = html.match(/<button\b[^>]*data-artist-open[^>]*>/g) ?? [];
	assert.equal(triggers.length, 4, 'Every artist card needs a profile trigger.');
	for (const tag of triggers) {
		assert.equal(getAttribute(tag, 'aria-haspopup'), 'dialog');
		assert.ok(getAttribute(tag, 'aria-label'), 'Artist triggers need an accessible name.');
		assert.ok(getAttribute(tag, 'data-description'), 'Artist triggers carry the modal description.');
		assert.ok(getAttribute(tag, 'data-image-alt'), 'Artist triggers carry the modal image description.');
	}
	const dialog = html.match(/<dialog\b[^>]*data-artist-dialog[^>]*>/)?.[0];
	assert.ok(dialog, 'The artist modal must exist.');
	assert.equal(getAttribute(dialog, 'aria-labelledby'), 'artist-dialog-title');
	assert.match(html, /id="artist-dialog-title"/);
	// Without an explicit width, aspect-ratio + max-height transfer the height cap
	// to the photo's inline size and the card's hover shadow detaches on the right.
	assert.match(html, /class="artist-image[^"]*\bw-full\b/, 'The photo box must fill the card width.');
	const css = readdirSync(join(outputDirectory, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8'))
		.join('');
	assert.match(css, /\.artist-wave/, 'Each artist card needs its wave edge.');
	assert.match(css, /artist-wave-undulate/, 'Hovering an artist card needs its wave motion.');
});

test('Activities mirror the artists layout: one column per day with a modal profile', () => {
	assert.equal((html.match(/data-activity-day=/g) ?? []).length, 3, 'Expected one activity column per festival day.');
	for (const id of ['activity-day-friday', 'activity-day-saturday', 'activity-day-sunday']) {
		assert.match(html, new RegExp(`id="${id}"`), `Missing activity column heading: ${id}.`);
	}
	const triggers = html.match(/<button\b[^>]*data-activity-open[^>]*>/g) ?? [];
	assert.equal(triggers.length, 6, 'Every activity card needs a modal trigger.');
	for (const tag of triggers) {
		assert.equal(getAttribute(tag, 'aria-haspopup'), 'dialog');
		assert.ok(getAttribute(tag, 'aria-label'), 'Activity triggers need an accessible name.');
		assert.ok(getAttribute(tag, 'data-description'), 'Activity triggers carry the modal description.');
		assert.ok(getAttribute(tag, 'data-image-alt'), 'Activity triggers carry the modal image description.');
	}
	const dialog = html.match(/<dialog\b[^>]*data-activity-dialog[^>]*>/)?.[0];
	assert.ok(dialog, 'The activity modal must exist.');
	assert.equal(getAttribute(dialog, 'aria-labelledby'), 'activity-dialog-title');
	assert.match(html, /id="activity-dialog-title"/);
	// The section sits right after the artists so the menu order matches the
	// scroll order, and it keeps the provisional-content qualification.
	const sectionOrder = ['id="artistas"', 'id="actividades"', 'id="free-access"'].map((needle) => html.indexOf(needle));
	assert.ok(sectionOrder.every((position, index) => position >= 0 && (index === 0 || position > sectionOrder[index - 1])), 'The activities section must sit between the artists and the free-access sections.');
	assert.match(html, /Actividades en preparación/);
});

test('Activities read differently from the artists: colour photos, solid day bars and a stamp', () => {
	const css = readdirSync(join(outputDirectory, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8'))
		.join('');
	// The artists keep the poster duotone; activity photos stay in colour.
	assert.match(css, /\.activities-section \.artist-image img[^{}]*\{[^}]*filter:none/, 'Activity card photos must not be desaturated.');
	assert.match(css, /\.activities-section \.artist-dialog-media img[^{}]*\{[^}]*filter:none/, 'The activity modal photo must not be desaturated.');
	// Day headings are solid forest bars with a legible tangerine date (4.96:1).
	const activitiesSection = html.slice(html.indexOf('id="actividades"'), html.indexOf('id="free-access"'));
	assert.match(activitiesSection, /class="artist-day-heading[^"]*bg-forest[^"]*text-paper/, 'Activity day headings must be solid forest bars.');
	assert.doesNotMatch(activitiesSection, /class="artist-day-heading[^"]*border-y/, 'Activity day headings must not fall back to the thin-line style.');
	assert.match(css, /\.activities-section \.artist-day-heading\s*>\s*span\{[^}]*color:var\(--color-tangerine\)/, 'The date on the dark bar needs the tangerine override.');
	// The category renders as a stamped label on every activity card.
	assert.equal((html.match(/class="activity-stamp"/g) ?? []).length, 6, 'Every activity card carries a stamped category.');
	assert.match(css, /\.artist-info\s*>\s*\.activity-stamp\{[^}]*border:1px solid var\(--ink\)/, 'The stamp needs its ink border.');
	// A tangerine wave tape marks the boundary with the artists section above.
	const artistsPosition = html.indexOf('<section id="artistas"');
	let boundaryWave = '';
	for (const match of html.matchAll(/<svg\b[^>]*class="[^"]*\bsection-wave\b[^"]*"[\s\S]*?<\/svg>/g)) {
		if (match.index > artistsPosition) { boundaryWave = match[0]; break; }
	}
	assert.ok(boundaryWave, 'The wave divider after the artists section must exist.');
	assert.match(boundaryWave, /var\(--color-moss\)/, 'The artists/activities boundary wave must be moss.');
	assert.match(boundaryWave, /class="section-wave section-wave--thick"/, 'The artists/activities wave must use the thicker style.');
	assert.match(boundaryWave, /viewBox="0 0 960 174"/, 'The thicker wave needs the expanded viewBox.');
	const wavePaths = [...boundaryWave.matchAll(/<path\b[^>]*d="([^"]+)"/g)].map((match) => match[1]);
	assert.ok(wavePaths.some((path) => path.startsWith('M960 37')), 'The divider needs a curved lower edge, not a straight baseline.');
});

test('Location includes an accessible lazy-loaded Google Maps embed', () => {
	const map = html.match(/<iframe\b[^>]*>/)?.[0];
	assert.ok(map, 'The location map must be embedded.');
	const url = new URL(getAttribute(map, 'src'));
	assert.equal(url.origin, 'https://www.google.com');
	assert.equal(url.pathname, '/maps');
	assert.equal(url.searchParams.get('q'), 'Cortelazor, Huelva, España');
	assert.equal(url.searchParams.get('output'), 'embed');
	assert.equal(getAttribute(map, 'title'), 'Mapa de Cortelazor, Huelva');
	assert.equal(getAttribute(map, 'loading'), 'lazy');
	assert.ok(getAttribute(map, 'width') && getAttribute(map, 'height'));
	assert.doesNotMatch(html, /src="\/images\/location-map\.svg"/);
});

test('Accessible, progressive interactions are included', () => {
	assert.match(html, /class="skip-link"/);
	const backToTop = html.match(/<a\b[^>]*href="#home"[^>]*aria-label="Volver arriba"[^>]*>[\s\S]*?<\/a>/)?.[0];
	assert.ok(backToTop, 'The footer needs an accessible back-to-top link.');
	assert.match(backToTop, /<svg\b/, 'The back-to-top link must be an icon.');
	assert.match(backToTop, /h-9 w-9/, 'The back-to-top icon must match the social icon size.');
	assert.match(html, /aria-controls="main-navigation"/);
	assert.match(html, /aria-label="Filtrar programación por día"/);
	assert.equal((html.match(/<details\b/g) ?? []).length, 5);
	for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
		assert.match(getAttribute(tag, 'rel') ?? '', /noopener/);
	}
	const cssFiles = readdirSync(join(outputDirectory, '_astro')).filter((file) => file.endsWith('.css'));
	const css = cssFiles.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8')).join('');
	assert.match(css, /prefers-reduced-motion/);
	assert.match(css, /\.sr-only/);
	assert.match(css, /font-face/);
});

test('Hamburger menu only takes over below 640px and stacks its links', () => {
	const css = readdirSync(join(outputDirectory, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8'))
		.join('');
	// The upper bound must be the exact complement of Tailwind's sm (min-width:
	// 640px). A "max-width: 639px" leaves fractional viewports such as 639.09px
	// outside both ranges: the toggle disappears while the nav keeps its full
	// width and splits the header into two rows.
	const hamburgerBlock = upperBoundBlock(css, 640);
	assert.ok(hamburgerBlock, 'The below-640px media block must exist.');
	assert.match(hamburgerBlock, new RegExp(upperBound(640)), 'The hamburger block must mirror sm:min-width:640px exactly.');
	assert.match(hamburgerBlock, /\.menu-toggle:not\(\[hidden\]\)\{[^}]*display:flex/, 'The hamburger toggle belongs below 640px.');
	assert.match(hamburgerBlock, /nav\.is-open\{display:flex/);
	assert.match(hamburgerBlock, /nav\.is-open\{[^}]*flex-direction:column/, 'The open menu must stack vertically below 640px.');
	// The open menu is a full-screen panel pinned under the header row: the
	// logo and the close button stay visible while the links fill the rest of
	// the viewport, in large letters and without separator lines.
	assert.match(hamburgerBlock, /nav\.is-open\{[^}]*position:absolute/, 'The panel is anchored inside the sticky header.');
	assert.match(hamburgerBlock, /nav\.is-open\{[^}]*top:100%/);
	assert.match(hamburgerBlock, /nav\.is-open\{[^}]*min-height:calc\(100dvh - 68px\)/, 'The panel fills the viewport minus the 68px header.');
	assert.match(hamburgerBlock, /nav\.is-open\s*>\s*a\{[^}]*font-size:32px/, 'Menu links use large letters.');
	// Colour contract: the panel is rust and the links are paper — 4.00:1,
	// past the 3:1 bar for large text, where the body's inherited ink would
	// only reach 2.64:1 on this backdrop.
	assert.match(hamburgerBlock, /nav\.is-open\{[^}]*background:var\(--color-rust\)/, 'The panel uses the rust backdrop.');
	assert.match(hamburgerBlock, /nav\.is-open\s*>\s*a\{[^}]*color:var\(--paper\)/, 'Menu links are paper-coloured against the rust backdrop.');
	assert.doesNotMatch(hamburgerBlock, /nav\s*>\s*a\{[^}]*border-top/, 'The stacked links carry no separator lines.');
	const tabletBlock = upperBoundBlock(css, 960);
	assert.ok(tabletBlock, 'The below-960px media block must exist (complement of tablet:960px).');
	assert.doesNotMatch(tabletBlock, /menu-toggle/, 'The hamburger must not appear above 640px.');
	assert.match(css, new RegExp(upperBound(1101)), 'The 1101px block must mirror wide:1101px the same way.');
	// The nav's width must not switch at 640px either: w-full forced it onto a
	// second header row in the gap between the two ranges. The menu itself
	// mirrors the page order and no longer carries the "Entrada libre" button.
	const nav = html.match(/<nav\b[^>]*id="main-navigation"[^>]*>[\s\S]*?<\/nav>/)?.[0];
	assert.ok(nav, 'The main navigation must exist.');
	assert.doesNotMatch(nav, /\bw-full\b/, 'The inline nav must not stretch to full width.');
	assert.doesNotMatch(nav, /header-access/, 'The access button no longer lives in the menu.');
	const menuHrefs = [...nav.matchAll(/href="(#[^"]+)"/g)].map((match) => match[1]);
	assert.deepEqual(menuHrefs, ['#festival', '#artistas', '#actividades', '#programacion', '#como-llegar'], 'The menu must follow the page order.');
	assert.match(html, /matchMedia\(`\(min-width: 640px\)`\)/, 'The menu must close itself once the inline nav returns.');
});

test('Main sections and the ribbon have accessible decorative wave dividers', () => {
	const waves = html.match(/<svg\b[^>]*class="[^"]*\bsection-wave\b[^"]*"[^>]*>/g) ?? [];
	assert.equal(waves.length, 10, 'Expected a divider for each of the nine main sections and the ribbon.');
	for (const wave of waves) {
		assert.equal(getAttribute(wave, 'aria-hidden'), 'true');
		assert.equal(getAttribute(wave, 'focusable'), 'false');
		assert.equal(getAttribute(wave, 'preserveAspectRatio'), 'none');
	}
});

test('Header wave pattern has vertical clearance beyond the visible SVG', () => {
	const pattern = html.match(/<pattern\b[^>]*id="site-header-wave"[^>]*>/)?.[0];
	assert.ok(pattern, 'The header wave pattern must exist.');
	assert.ok(Number(getAttribute(pattern, 'height')) > 34, 'The next vertical tile must stay outside the 34px viewport.');
});

test('Anchor offsets match the solid header height at each breakpoint', () => {
	const css = readdirSync(join(outputDirectory, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8'))
		.join('');
	assert.match(css, /html\{[^}]*scroll-padding-top:82px/);
	assert.match(css, new RegExp(`${upperBound(960)}\\s*\\{\\s*html\\s*\\{[^}]*scroll-padding-top:\\s*72px`));
	assert.match(css, new RegExp(`${upperBound(640)}\\s*\\{\\s*html\\s*\\{[^}]*scroll-padding-top:\\s*68px`));
	// The sticky header must be exactly as tall as that offset, otherwise anchor
	// targets slide under it. The logo image is 56px, so the wordmark margins
	// are (68 - 56) / 2 and (72 - 56) / 2 at the two lower ranges; from 960px
	// the container's 82px minimum drives the height on its own.
	assert.match(html, /class="[^"]*\bmin-h-\[68px\]/, 'The header container defines the 68px mobile height.');
	const mobileHeader = upperBoundBlock(css, 640);
	assert.ok(mobileHeader, 'The below-640px block must exist.');
	assert.match(mobileHeader, /\.site-header \.wordmark\{[^}]*margin-block:6px/, 'Mobile header: 56px logo + 2x6px margins = the 68px scroll offset.');
	const tabletHeader = upperBoundBlock(css, 960);
	assert.ok(tabletHeader, 'The below-960px block must exist.');
	assert.match(tabletHeader, /\.site-header \.wordmark\{[^}]*margin-block:8px/, 'Tablet header: 56px logo + 2x8px margins = the 72px scroll offset.');
	assert.match(html, /class="[^"]*\btablet:min-h-\[82px\]/, 'Desktop header is driven by the 82px container minimum.');
});

test('Runtime assets stay lightweight', () => {
	const assets = readdirSync(join(outputDirectory, '_astro'));
	const scriptBytes = assets.filter((file) => file.endsWith('.js')).reduce((total, file) => total + statSync(join(outputDirectory, '_astro', file)).size, 0);
	const inlineScriptBytes = [...html.matchAll(/<script\b([^>]*)>(.*?)<\/script>/gs)]
		.filter((match) => !match[1].includes('application/ld+json'))
		.reduce((total, match) => total + Buffer.byteLength(match[2]), 0);
	assert.ok(scriptBytes + inlineScriptBytes < 12_000, `Client-side JavaScript is too large: ${scriptBytes + inlineScriptBytes} bytes.`);
	for (const file of readdirSync(join(outputDirectory, 'images')).filter((name) => name.endsWith('.webp'))) {
		assert.ok(statSync(join(outputDirectory, 'images', file)).size < 200_000, `Unoptimised photograph: ${file}`);
	}
});

test('Tailwind generates responsive grids and accessible state variants', () => {
	const css = readdirSync(join(outputDirectory, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(join(outputDirectory, '_astro', file), 'utf8'))
		.join('');
	for (const utility of ['.grid-cols-2', '.lg\\:grid-cols-\\[repeat\\(auto-fit\\,minmax\\(min\\(100\\%\\,280px\\)\\,1fr\\)\\)\\]', '.wide\\:px-16', '.aria-pressed\\:bg-forest', '.group-open\\:rotate-45']) {
		assert.ok(css.includes(utility), `Missing generated Tailwind utility: ${utility}`);
	}
	assert.doesNotMatch(css, /@apply|@theme/);
	assert.match(html, /aria-pressed:bg-forest/);
	assert.doesNotMatch(html, /class="is-active"/);
});
