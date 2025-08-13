import type {Project} from '@/lib/ir/types';
import {ProjectSchema} from '@/lib/ir/schema';

export function loadProjectFromString(json: string): Project {
	const raw = JSON.parse(json);
	const parsed = ProjectSchema.safeParse(raw);
	if (!parsed.success) {
		throw new Error(`Project validation failed: ${parsed.error.message}`);
	}
	return parsed.data;
}
