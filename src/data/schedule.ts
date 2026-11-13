import type { ActivityId, ArtistId, Performance } from '../types/festival';
import { stages } from './stages';

// All times and stage assignments are provisional design data. Concert slots
// borrow their title from `artists.ts`, activity slots from `activities.ts`,
// and only the welcome/parade-style slots write their own copy. Concerts sit
// in the Plaza del Olmo or the church; hands-on activities use the museum or
// the Salón Blanca Candón.
export const scheduleItems: Performance[] = [
	{ id: 'friday-handmade', day: 'friday', startTime: '12:00', category: 'Taller familiar', stageId: 'museo', activityId: 'handmade-music' },
	{ id: 'friday-soundcheck', day: 'friday', startTime: '17:00', category: 'Detrás del escenario', stageId: 'plaza-olmo', activityId: 'open-soundcheck' },
	{ id: 'friday-welcome', day: 'friday', startTime: '18:00', title: '¡Nos encontramos en Cortelazor!', category: 'Bienvenida', stageId: 'plaza-olmo' },
	{ id: 'friday-streets', day: 'friday', startTime: '19:00', title: 'Música que recorre el pueblo', category: 'Pasacalles', stageId: 'plaza-olmo' },
	{ id: 'friday-roots', day: 'friday', startTime: '20:30', category: 'Concierto', stageId: 'plaza-olmo', artistId: 'southern-roots' },
	{ id: 'friday-session', day: 'friday', startTime: '22:00', title: 'La noche de las raíces', category: 'Encuentro musical', stageId: 'iglesia' },
	{ id: 'saturday-streets', day: 'saturday', startTime: '13:30', title: 'El pueblo suena', category: 'Música en las calles', stageId: 'plaza-olmo' },
	{ id: 'saturday-dance', day: 'saturday', startTime: '17:30', category: 'Rueda de baile', stageId: 'plaza-olmo', activityId: 'plaza-dancing' },
	{ id: 'saturday-thyme', day: 'saturday', startTime: '19:00', category: 'Concierto', stageId: 'plaza-olmo', artistId: 'wild-thyme' },
	{ id: 'saturday-echo', day: 'saturday', startTime: '21:00', category: 'Concierto', stageId: 'iglesia', artistId: 'mountain-echo' },
	{ id: 'saturday-night', day: 'saturday', startTime: '22:30', category: 'Sesión nocturna', stageId: 'plaza-olmo', activityId: 'night-session' },
	{ id: 'sunday-walk', day: 'sunday', startTime: '11:00', title: 'Un paseo entre canciones', category: 'Encuentro cultural', stageId: 'plaza-olmo' },
	{ id: 'sunday-sound', day: 'sunday', startTime: '12:00', category: 'Charla técnica', stageId: 'salon-blanca-candon', activityId: 'sound-workshop' },
	{ id: 'sunday-river', day: 'sunday', startTime: '13:30', category: 'Concierto', stageId: 'plaza-olmo', artistId: 'wandering-river' },
	{ id: 'sunday-closing', day: 'sunday', startTime: '15:00', category: 'Encuentro final', stageId: 'plaza-olmo', activityId: 'closing-circle' },
	{ id: 'sunday-farewell', day: 'sunday', startTime: '16:00', title: 'Hasta la próxima, Cortelazor', category: 'Despedida musical', stageId: 'plaza-olmo' },
];

// Where a catalogue record plays. The card, the modal and the timetable row all
// read from here, so the three can never disagree about time or stage.
export const artistSlot = (id: ArtistId) => scheduleItems.find((item) => item.artistId === id);
export const activitySlot = (id: ActivityId) => scheduleItems.find((item) => item.activityId === id);
export const slotLabel = (slot: Performance | undefined) => {
	if (!slot) return undefined;
	const stage = stages.find((item) => item.id === slot.stageId);
	return stage ? `${slot.startTime} · ${stage.name}` : undefined;
};
