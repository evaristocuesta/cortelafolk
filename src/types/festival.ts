export type FestivalDay = 'friday' | 'saturday' | 'sunday';

export interface Artist {
	id: string;
	name: string;
	genre: string;
	image: string;
	imageAlt: string;
	day: FestivalDay;
	tone: 'orange' | 'green' | 'yellow';
}

export interface Stage {
	id: string;
	name: string;
	description: string;
}

export interface Performance {
	id: string;
	day: FestivalDay;
	startTime: string;
	title: string;
	category: string;
	stage: Stage['id'];
	artistId?: Artist['id'];
}

export interface Activity {
	id: string;
	number: string;
	title: string;
	description: string;
	label: string;
	icon: 'sun' | 'flower' | 'leaf';
}
