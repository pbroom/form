import {convex} from './convexClient';
import {loadProjectFromString} from './load';
import {saveProjectToString} from './save';
import type {Project} from '@/lib/ir/types';

export async function createProject(name: string, project: Project) {
	if (!convex) throw new Error('Convex not configured');
	const data = saveProjectToString(project);
	const id = await convex.mutation('projects:create', {
		name,
		data,
		createdAt: new Date().toISOString(),
	});
	return id;
}

export async function saveProject(id: string, project: Project) {
	if (!convex) throw new Error('Convex not configured');
	const data = saveProjectToString(project);
	await convex.mutation('projects:save', {
		id: id as any,
		data,
		updatedAt: new Date().toISOString(),
	});
}

export async function loadProject(id: string): Promise<Project | null> {
	if (!convex) throw new Error('Convex not configured');
	const doc = await convex.query('projects:load', {id: id as any});
	if (!doc) return null;
	return loadProjectFromString(doc.data);
}
