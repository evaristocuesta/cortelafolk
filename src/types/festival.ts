// The id unions live next to their records (artists.ts, activities.ts,
// stages.ts, site.ts) and are derived from them, so they can never drift:
// adding or removing a record updates the union automatically. A timetable
// id missing from its catalogue fails `pnpm check` instead of rendering an
// empty slot. Re-exported here so the festival types keep one import site.
import type { ActivityId } from '../data/activities';
import type { ArtistId } from '../data/artists';
import type { StageId } from '../data/stages';
import type { FestivalDay } from '../data/site';

export type { ActivityId, ArtistId, FestivalDay, StageId };

export interface Artist {
	id: ArtistId;
	name: string;
	genre: string;
	description: string;
	image: string;
	imageAlt: string;
	day: FestivalDay;
	tone: 'orange' | 'green' | 'yellow';
}

export interface Stage {
	id: StageId;
	name: string;
	description: string;
}

export interface Activity {
	id: ActivityId;
	name: string;
	category: string;
	description: string;
	image: string;
	imageAlt: string;
	day: FestivalDay;
	tone: 'orange' | 'green' | 'yellow';
}

interface SlotBase {
	id: string;
	day: FestivalDay;
	startTime: string;
	category: string;
	stageId: StageId;
}

// A timetable slot either quotes its own copy or borrows the title from a
// catalogue record — never both, never neither. That is what keeps the
// schedule and the lineup/activities sections from drifting apart.
export type Performance =
	| (SlotBase & { title: string; artistId?: never; activityId?: never })
	| (SlotBase & { title?: never; artistId: ArtistId; activityId?: never })
	| (SlotBase & { title?: never; artistId?: never; activityId: ActivityId });
