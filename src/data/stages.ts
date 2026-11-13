import type { Stage } from '../types/festival';

// Proposed spaces, not confirmed venues.
// Order matters: array first, derived union second, shape check last.
// Collapsing them into one `as const satisfies Stage[]` makes Stage.id and
// StageId circularly reference each other (TS2456).
const records = [
	{ id: 'plaza-olmo', name: 'Plaza del Olmo', description: 'A la sombra del Olmo Viejo, punto de encuentro del pueblo, Cortelafolk acerca la música a la plaza y la comparte al aire libre.' },
	{ id: 'museo', name: 'Museo José Pérez-Guerra', description: 'El Museo José Pérez-Guerra, un escenario propuesto para acercar las actividades de Cortelafolk.' },
	{ id: 'iglesia', name: 'Iglesia Nuestra Señora de los Remedios', description: 'Sus pinturas murales del siglo XVI enmarcan una propuesta de escucha más recogida para la música de Cortelafolk.' },
	{ id: 'salon-blanca-candon', name: 'Salón Blanca Candón', description: 'Este salón ofrece un espacio cubierto para actividades de Cortelafolk.' },
] as const;

// The id union comes from the records themselves: it can never drift from them.
export type StageId = (typeof records)[number]['id'];
export const stages: readonly Stage[] = records;
