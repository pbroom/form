import {describe, expect, it} from 'vitest';
import {ProjectSchema} from '@/lib/ir/schema';
import {
	addNode,
	connect,
	createEmptyGraph,
	serializeGraph,
	setParam,
} from '@/lib/ir/ops';
import {z} from 'zod';
import {getNodeDefinition} from '@/lib/node-registry';

describe('IR Schema and Ops', () => {
	it('validates a minimal project', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					meta: {
						schemaVersion: '1',
						createdAt: '2024-01-01T00:00:00Z',
						updatedAt: '2024-01-01T00:00:00Z',
					},
					graph: {nodes: [], edges: []},
					tree: {moduleName: 'MainScene', rootType: 'r3f'},
				},
			],
		};
		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(true);
	});

	it('ops add/connect/setParam are immutable and deterministic', () => {
		let g = createEmptyGraph();
		g = addNode(g, {id: 'scene', typeKey: 'scene'});
		g = addNode(g, {id: 'box-1', typeKey: 'box', params: {width: 1}});
		const g2 = connect(g, 'box-1', 'scene', '__new__');
		expect(g2).not.toBe(g);
		expect(g2.edges.length).toBe(1);
		const g3 = setParam(g2, 'box-1', 'width', 2);
		expect(g3).not.toBe(g2);
		expect((g3.nodes.find((n) => n.id === 'box-1')?.params as any).width).toBe(
			2
		);
		// Deterministic serialize
		const s1 = serializeGraph(g3);
		const s2 = serializeGraph(g3);
		expect(s1).toBe(s2);
	});

	it('Code Node requires code/codeMeta under new schema', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					meta: {
						schemaVersion: '1',
						createdAt: '2024-01-01T00:00:00Z',
						updatedAt: '2024-01-01T00:00:00Z',
					},
					graph: {nodes: [{id: 'code-1', typeKey: 'code'} as any], edges: []},
					tree: {moduleName: 'MainScene', rootType: 'r3f'},
				},
			],
		};
		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(false);
	});

	it('Code Node minimal scaffold exists in registry', () => {
		const def = getNodeDefinition('code');
		expect(def).toBeDefined();
		expect(def?.key).toBe('code');
	});
});
