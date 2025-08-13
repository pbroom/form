import {describe, expect, it} from 'vitest';
import {saveProjectToString} from '@/lib/project/save';
import {loadProjectFromString} from '@/lib/project/load';

describe('Project Save/Load round-trip', () => {
	it('serializes deterministically and round-trips via schema', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					meta: {
						schemaVersion: '1',
						createdAt: '2025-01-01T00:00:00Z',
						updatedAt: '2025-01-02T00:00:00Z',
					},
					graph: {
						nodes: [
							{id: 'box-2', typeKey: 'box'},
							{id: 'box-1', typeKey: 'box'},
						],
						edges: [
							{
								id: 'box-1->box-2:width',
								source: 'box-1',
								target: 'box-2',
								targetHandle: 'width',
							},
						],
					},
					tree: {moduleName: 'MainScene', rootType: 'r3f'},
				},
			],
		};
		const a = saveProjectToString(project as any);
		const b = saveProjectToString(project as any);
		expect(a).toBe(b);
		const loaded = loadProjectFromString(a);
		expect(loaded.schemaVersion).toBe('1');
		expect(loaded.modules[0].graph.nodes[0].id).toBe('box-1');
	});
});
