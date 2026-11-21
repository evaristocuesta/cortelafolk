// Turns the numbered originals of each edition into the WebP files the archive
// ships: one large photograph for the viewer (max 1600 px on the long edge) and
// one 3:2 thumbnail for the grid. The originals live outside `public/`, so they
// are never copied into `dist/`.
//
// Run with `pnpm images` after changing the selection. The script is
// idempotent: it moves any new originals out of `public/images/<year>/` first,
// then regenerates every WebP and `src/data/edition-images.json`.
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import heicConvert from 'heic-convert';
import sharp from 'sharp';

const years = [2024, 2025, 2026];
const publicRoot = join('public', 'images');
const originalsRoot = join('originals', 'ediciones');
const manifestPath = join('src', 'data', 'edition-images.json');

const longEdge = 1600;
// Quality starts at 80 and only steps down when a photograph would exceed the
// byte ceiling. The ceiling is deliberately generous: at 1600 px, detailed
// festival scenes need ~300–400 KB before WebP starts to smear foliage and
// faces. Thumbnails are small enough to stay far below their own ceiling.
const fullBudget = 400_000;
const thumbWidth = 600;
const thumbHeight = 400;
const thumbBudget = 90_000;
const posterThumbWidth = 600;
const posterThumbBudget = 180_000;

const imagePattern = /\.(?:jpe?g|png|heic|heif|webp)$/i;
const posterPattern = /^cartel\.(?:jpe?g|png|webp)$/i;
const extraPosterPattern = /^cartel[-.]/i;
const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

const isHeic = (name) => /\.(?:heic|heif)$/i.test(name);
const baseName = (name) => basename(name, extname(name)).toLowerCase();

const decode = async (path) => {
	if (!isHeic(path)) return sharp(path, { failOn: 'none' });
	const png = await heicConvert({ buffer: await readFile(path), format: 'PNG' });
	return sharp(png);
};

const encode = async (pipeline, budget, startQuality, minimumQuality) => {
	let best = null;
	for (let quality = startQuality; quality >= minimumQuality; quality -= 2) {
		const buffer = await pipeline.clone().webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
		best = { buffer, quality };
		if (buffer.length <= budget) break;
	}
	return best;
};

const moveOriginals = async (year) => {
	const publicDirectory = join(publicRoot, String(year));
	const originalDirectory = join(originalsRoot, String(year));
	await mkdir(originalDirectory, { recursive: true });
	for (const name of await readdir(publicDirectory)) {
		if (!imagePattern.test(name) || name.endsWith('.webp')) continue;
		const from = join(publicDirectory, name);
		const to = join(originalDirectory, name);
		if (!existsSync(to)) await rename(from, to);
	}
	return originalDirectory;
};

const render = async (year, name) => {
	const path = join(originalsRoot, String(year), name);
	const rotated = (await decode(path)).rotate();
	const { data, info } = await rotated
		.resize({ width: longEdge, height: longEdge, fit: 'inside', withoutEnlargement: true })
		.flatten({ background: '#ffffff' })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const source = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });

	const full = await encode(source, fullBudget, 80, 60);
	const thumbRaw = await source
		.clone()
		.resize({ width: thumbWidth, height: thumbHeight, fit: 'cover', position: 'centre' })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const thumb = await encode(
		sharp(thumbRaw.data, { raw: { width: thumbRaw.info.width, height: thumbRaw.info.height, channels: thumbRaw.info.channels } }),
		thumbBudget,
		78,
		68,
	);
	const file = `${baseName(name)}.webp`;
	const thumbFile = `${baseName(name)}-thumb.webp`;
	await writeFile(join(publicRoot, String(year), file), full.buffer);
	await writeFile(join(publicRoot, String(year), thumbFile), thumb.buffer);
	return {
		file,
		thumb: thumbFile,
		width: info.width,
		height: info.height,
		thumbWidth: thumbRaw.info.width,
		thumbHeight: thumbRaw.info.height,
		bytes: full.buffer.length,
		quality: full.quality,
		thumbBytes: thumb.buffer.length,
	};
};

const renderPoster = async (year, name) => {
	const path = join(originalsRoot, String(year), name);
	const rotated = (await decode(path)).rotate();
	const { data, info } = await rotated
		.resize({ width: longEdge, height: longEdge, fit: 'inside', withoutEnlargement: true })
		.flatten({ background: '#ffffff' })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const source = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
	const full = await encode(source, fullBudget, 80, 60);
	const thumbRaw = await source
		.clone()
		.resize({ width: posterThumbWidth, withoutEnlargement: true })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const thumb = await encode(
		sharp(thumbRaw.data, { raw: { width: thumbRaw.info.width, height: thumbRaw.info.height, channels: thumbRaw.info.channels } }),
		posterThumbBudget,
		78,
		68,
	);
	await writeFile(join(publicRoot, String(year), 'cartel.webp'), full.buffer);
	await writeFile(join(publicRoot, String(year), 'cartel-thumb.webp'), thumb.buffer);
	return {
		file: 'cartel.webp',
		thumb: 'cartel-thumb.webp',
		width: info.width,
		height: info.height,
		thumbWidth: thumbRaw.info.width,
		thumbHeight: thumbRaw.info.height,
		bytes: full.buffer.length,
		quality: full.quality,
		thumbBytes: thumb.buffer.length,
	};
};

const manifest = {};
for (const year of years) {
	const sourceDirectory = await moveOriginals(year);
	const files = (await readdir(sourceDirectory)).filter((name) => imagePattern.test(name)).sort(collator.compare);
	const posterName = files.find((name) => posterPattern.test(name));
	if (!posterName) throw new Error(`No cartel.* in ${sourceDirectory}`);
	const photos = files.filter((name) => !posterPattern.test(name) && !extraPosterPattern.test(name));
	console.log(`\n${year}: ${photos.length} photographs + ${posterName}`);
	const poster = await renderPoster(year, posterName);
	const rendered = [];
	for (const name of photos) {
		const result = await render(year, name);
		rendered.push(result);
		console.log(`  ${name} -> ${result.file} ${result.width}x${result.height} ${(result.bytes / 1024).toFixed(0)}KB (q${result.quality}) · thumb ${(result.thumbBytes / 1024).toFixed(0)}KB`);
	}
	manifest[year] = { poster, photos: rendered };
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
console.log(`\nWrote ${manifestPath}`);
