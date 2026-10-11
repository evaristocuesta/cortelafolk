import type { Activity } from '../types/festival';

// Editorial activity proposals pending organiser approval.
export const activities: Activity[] = [
	{ id: 'family-workshops', number: '01', title: 'Manos a la música', description: 'Crear, experimentar y descubrir. Talleres para que los más pequeños también encuentren su ritmo.', label: 'En familia', icon: 'flower' },
	{ id: 'local-culture', number: '02', title: 'Un pueblo por descubrir', description: 'Calles con historia, conversaciones sin prisa y cultura que se comparte. Cortelazor también forma parte del cartel.', label: 'Cultura local', icon: 'sun' },
	{ id: 'mountain-nature', number: '03', title: 'Respira la sierra', description: 'Entre concierto y concierto, mira alrededor. La Sierra de Aracena pone el paisaje; tú eliges el paseo.', label: 'Naturaleza', icon: 'leaf' },
];
