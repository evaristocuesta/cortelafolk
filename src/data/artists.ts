import type { Artist } from '../types/festival';

// Fictional development lineup. Replace with approved artists before publishing the final programme.
export const artists: Artist[] = [
	{ id: 'southern-roots', name: 'Raíces del Sur', genre: 'Folk · raíz andaluza', image: '/images/live-guitar.webp', imageAlt: 'Manos tocando una guitarra acústica', day: 'friday', tone: 'orange' },
	{ id: 'wild-thyme', name: 'Tomillo Salvaje', genre: 'Folk · sonidos de la tierra', image: '/images/live-crowd.webp', imageAlt: 'Mesa de mezclas iluminada durante una sesión musical', day: 'saturday', tone: 'green' },
	{ id: 'mountain-echo', name: 'Eco de la Sierra', genre: 'Tradición · nuevos sonidos', image: '/images/live-stage.webp', imageAlt: 'Público disfrutando de la música en un concierto', day: 'saturday', tone: 'yellow' },
	{ id: 'wandering-river', name: 'Río Nómada', genre: 'Fusión · músicas del mundo', image: '/images/live-night.webp', imageAlt: 'Una actuación musical entre luces y humo de escenario', day: 'sunday', tone: 'orange' },
];
