// Previous editions shown on `/ediciones/`. Identifiers stay English, the
// visitor-facing copy (labels and alternative text) stays Spanish.
//
// The mechanical data — file names, thumbnails and dimensions — comes from
// `edition-images.json`, which `scripts/build-edition-images.mjs` regenerates
// from the numbered originals. The descriptions live in `edition-alts.json`,
// keyed by `year/file`, so re-running the image build never loses them.
//
// The dates and edition numbers come from the posters themselves; do not add
// facts that the posters do not state.
import imageData from './edition-images.json';
import alts from './edition-alts.json';

export interface EditionImage {
	file: string;
	/** Smaller 3:2 crop used by the grid; the viewer opens `file`. */
	thumb: string;
	alt: string;
	width: number;
	height: number;
	thumbWidth: number;
	thumbHeight: number;
}

export interface Edition {
	year: number;
	/** Rótulo shown under the poster and over the gallery: "1.ª edición". */
	edition: string;
	poster: EditionImage;
	photos: EditionImage[];
}

// `photoPath` URL-encodes on render, so a file name with spaces stays a valid,
// resolvable link.
export const photoPath = (year: number, file: string): string =>
	encodeURI(`/images/${year}/${file}`);

const labels: Record<number, string> = {
	2024: '1.ª edición',
	2025: '2.ª edición',
	2026: '3.ª edición',
};

const posterAlts: Record<number, string> = {
	2024: 'Cartel de la edición de 2024: 20 de abril, Plaza de Olmo, entrada libre.',
	2025: 'Cartel de la II edición: 25 y 26 de abril de 2025, entrada libre y actividades gratuitas.',
	2026: 'Cartel de la III edición: 17, 18 y 19 de abril de 2026, con el programa de cada jornada.',
};

const descriptions = alts as Record<string, string>;

const describe = (year: number, file: string): string =>
	descriptions[`${year}/${file}`] ?? `Fotografía de la edición de ${year}.`;

const toImage = (
	year: number,
	data: { file: string; thumb: string; width: number; height: number; thumbWidth: number; thumbHeight: number },
): EditionImage => ({
	file: data.file,
	thumb: data.thumb,
	width: data.width,
	height: data.height,
	thumbWidth: data.thumbWidth,
	thumbHeight: data.thumbHeight,
	alt: describe(year, data.file),
});

const years = [2024, 2025, 2026] as const;

export const editions: Edition[] = years.map((year) => {
	const data = imageData[String(year) as keyof typeof imageData];
	return {
		year,
		edition: labels[year],
		poster: {
			...toImage(year, data.poster),
			alt: posterAlts[year],
		},
		photos: data.photos.map((photo) => toImage(year, photo)),
	};
});
