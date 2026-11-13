import type { Artist } from '../types/festival';

// Fictional development lineup. Replace with approved artists before publishing the final programme.
// Order matters: array first, derived union second, shape check last.
// Collapsing them into one `as const satisfies Artist[]` makes Artist.id and
// ArtistId circularly reference each other (TS2456).
const records = [
	{ id: 'southern-roots', name: 'Raíces del Sur', genre: 'Folk · raíz andaluza', description: 'Baladas de raíz andaluza que crecen desde el susurro hasta el fandango, con guitarra, arpa y voces cruzadas sobre letras de la sierra.', image: '/images/live-guitar.webp', imageAlt: 'Manos tocando una guitarra acústica', day: 'friday', tone: 'orange' },
	{ id: 'wild-thyme', name: 'Tomillo Salvaje', genre: 'Folk · sonidos de la tierra', description: 'Melodías folk nacidas al borde de los caminos: percusión seca, letras de campo y estribillos pensados para cantar en grupo.', image: '/images/live-crowd.webp', imageAlt: 'Mesa de mezclas iluminada durante una sesión musical', day: 'saturday', tone: 'green' },
	{ id: 'mountain-echo', name: 'Eco de la Sierra', genre: 'Tradición · nuevos sonidos', description: 'Tradición en formato pequeño: gaita, caja y acordeón reinterpretan coplas y danzas de la sierra con arreglos nuevos.', image: '/images/live-stage.webp', imageAlt: 'Público disfrutando de la música en un concierto', day: 'saturday', tone: 'yellow' },
	{ id: 'wandering-river', name: 'Río Nómada', genre: 'Fusión · músicas del mundo', description: 'Fusión de músicas del mundo con acento atlántico: vientos, cuerdas y ritmos que terminan siempre en rueda y baile.', image: '/images/live-night.webp', imageAlt: 'Una actuación musical entre luces y humo de escenario', day: 'sunday', tone: 'orange' },
] as const;

// The id union comes from the records themselves: it can never drift from them.
export type ArtistId = (typeof records)[number]['id'];
export const artists: readonly Artist[] = records;
