import type {Project} from '@/lib/ir/types';
import {ProjectSchema} from '@/lib/ir/schema';

function sortGraphLayer(project: Project): Project {
	const sortedModules = [...project.modules]
		.map((m) => ({
			...m,
			graph: {
				nodes: [...m.graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
				edges: [...m.graph.edges].sort((a, b) => a.id.localeCompare(b.id)),
			},
		}))
		.sort((a, b) => {
			const byName = a.tree.moduleName.localeCompare(b.tree.moduleName);
			if (byName !== 0) return byName;
			return a.meta.createdAt.localeCompare(b.meta.createdAt);
		});
	return {
		...project,
		modules: sortedModules,
	};
}

export function saveProjectToString(project: Project): string {
	// Validate before saving
	const parsed = ProjectSchema.safeParse(project);
	if (!parsed.success) {
		throw new Error(`Project validation failed: ${parsed.error.message}`);
	}
	const sorted = sortGraphLayer(parsed.data);
	return JSON.stringify(sorted, null, 2);
}
