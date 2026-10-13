import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const outputDirectory = resolve('dist');
assert.ok(existsSync(join(outputDirectory, 'index.html')), 'Run pnpm build before pnpm test.');
const html = readFileSync(join(outputDirectory, 'index.html'), 'utf8');
const getAttribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

test('Spanish page language and festival SEO metadata', () => {
	assert.match(html, /<html lang="es">/);
	assert.match(html, /<title>Cortelafolk 2027/);
	assert.match(html, /name="description" content="[^"]*Entrada gratuita/);
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
	for (const match of html.matchAll(/href="#([^"]+)"/g)) {
		assert.ok(ids.includes(match[1]), `Broken anchor: #${match[1]}`);
	}
	for (const id of ['home', 'festival', 'artists', 'free-access', 'schedule', 'activities', 'location', 'information']) {
		assert.ok(ids.includes(id), `Missing festival section: ${id}`);
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
	assert.match(html, /ENTRADA GRATUITA · SIN RESERVAS/);
	assert.match(html, /La entrada es gratuita para todo el mundo/);
	assert.match(html, /href="#location"[^>]*>CÓMO LLEGAR/);
	assert.doesNotMatch(html, /<(?:form|input|select|textarea)\b/);
	assert.doesNotMatch(html, /(?:Consigue tu entrada|Entradas próximamente|Comprar entradas|eventbrite|ticketmaster|entradium|checkout)/i);
});

test('Provisional content is not presented as confirmed', () => {
	assert.match(html, /Cartel en preparación/);
	assert.match(html, /Esta selección es orientativa/);
	assert.match(html, /Programación orientativa/);
	assert.doesNotMatch(html, /artistas confirmados/i);
	assert.equal((html.match(/data-schedule-day=/g) ?? []).length, 3);
});

test('Accessible, progressive interactions are included', () => {
	assert.match(html, /class="skip-link"/);
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

test('Main sections and the ribbon have accessible decorative wave dividers', () => {
	const waves = html.match(/<svg\b[^>]*class="section-wave"[^>]*>/g) ?? [];
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
	for (const utility of ['.grid-cols-2', '.tablet\\:grid-cols-4', '.wide\\:px-16', '.aria-pressed\\:bg-forest', '.group-open\\:rotate-45']) {
		assert.ok(css.includes(utility), `Missing generated Tailwind utility: ${utility}`);
	}
	assert.doesNotMatch(css, /@apply|@theme/);
	assert.match(html, /aria-pressed:bg-forest/);
	assert.doesNotMatch(html, /class="is-active"/);
});
