import type { Performance } from '../types/festival';

// All times, performances and stage assignments are provisional design data.
export const scheduleItems: Performance[] = [
	{ id: 'friday-welcome', day: 'friday', startTime: '18:00', title: '¡Nos encontramos en Cortelazor!', category: 'Bienvenida', stage: 'main-square' },
	{ id: 'friday-streets', day: 'friday', startTime: '19:00', title: 'Música que recorre el pueblo', category: 'Pasacalles', stage: 'village-streets' },
	{ id: 'friday-roots', day: 'friday', startTime: '20:30', title: 'Raíces del Sur', category: 'Concierto', stage: 'main-square', artistId: 'southern-roots' },
	{ id: 'friday-session', day: 'friday', startTime: '22:00', title: 'La noche de las raíces', category: 'Encuentro musical', stage: 'main-square' },
	{ id: 'saturday-workshop', day: 'saturday', startTime: '12:00', title: 'Pequeños músicos, grandes ideas', category: 'Taller en familia', stage: 'family-space' },
	{ id: 'saturday-streets', day: 'saturday', startTime: '13:30', title: 'El pueblo suena', category: 'Música en las calles', stage: 'village-streets' },
	{ id: 'saturday-thyme', day: 'saturday', startTime: '19:00', title: 'Tomillo Salvaje', category: 'Concierto', stage: 'main-square', artistId: 'wild-thyme' },
	{ id: 'saturday-echo', day: 'saturday', startTime: '21:00', title: 'Eco de la Sierra', category: 'Concierto', stage: 'main-square', artistId: 'mountain-echo' },
	{ id: 'sunday-walk', day: 'sunday', startTime: '11:00', title: 'Un paseo entre canciones', category: 'Encuentro cultural', stage: 'village-streets' },
	{ id: 'sunday-crafts', day: 'sunday', startTime: '12:00', title: 'Crear con las manos', category: 'Taller en familia', stage: 'family-space' },
	{ id: 'sunday-river', day: 'sunday', startTime: '13:30', title: 'Río Nómada', category: 'Concierto', stage: 'main-square', artistId: 'wandering-river' },
	{ id: 'sunday-farewell', day: 'sunday', startTime: '16:00', title: 'Hasta la próxima, Cortelazor', category: 'Despedida musical', stage: 'main-square' },
];
