import {convex} from './convexClient';
import {api} from '../../../convex/_generated/api';
import type {Id} from '../../../convex/_generated/dataModel';
import {loadProjectFromString} from './load';
import {saveProjectToString} from './save';
import type {Project} from '@/lib/ir/types';

export async function createProject(name: string, project: Project) {
	if (!convex) throw new Error('Convex not configured');
	const data = saveProjectToString(project);
	const id = await convex.mutation(api.projects.create, {
		name,
		data,
		createdAt: new Date().toISOString(),
	});
	return id;
}

export async function saveProject(id: Id<'projects'>, project: Project) {
	if (!convex) throw new Error('Convex not configured');
	const data = saveProjectToString(project);
	await convex.mutation(api.projects.save, {
		id,
		data,
		updatedAt: new Date().toISOString(),
	});
}

export async function loadProject(id: Id<'projects'>): Promise<Project | null> {
	if (!convex) throw new Error('Convex not configured');
	const doc = await convex.query(api.projects.load, {id});
	if (!doc) return null;
	return loadProjectFromString(doc.data);
}
