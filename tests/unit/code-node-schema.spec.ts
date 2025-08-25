import {describe, it, expect} from 'vitest';
import {ProjectSchema} from '@/lib/ir/schema';

const baseModule = () => ({
	meta: {
		schemaVersion: '1',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
	},
	graph: {nodes: [], edges: []},
	tree: {moduleName: 'MainScene', rootType: 'r3f'},
});

describe('IR Schema – Code Node', () => {
	it('accepts a valid Code Node with code and metadata', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					...baseModule(),
					graph: {
						nodes: [
							{
								id: 'code-1',
								typeKey: 'code',
								label: 'Twice',
								code: 'export function node(a: number): number { return a * 2 }',
								codeMeta: {
									version: '1',
									inputs: [{key: 'a', type: 'number', label: 'A'}],
									output: {type: 'number'},
									uiHints: {
										a: {min: 0, max: 100, step: 1},
									},
								},
							},
						],
						edges: [],
					},
				},
			],
		} as const;

		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(true);
	});

	it('rejects a Code Node missing code', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					...baseModule(),
					graph: {
						nodes: [
							{
								id: 'code-1',
								typeKey: 'code',
								label: 'Broken',
								codeMeta: {
									version: '1',
									inputs: [{key: 'a', type: 'number'}],
									output: {type: 'number'},
								},
							},
						],
						edges: [],
					},
				},
			],
		} as const;

		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(false);
	});

	it('rejects unsupported types in codeMeta', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					...baseModule(),
					graph: {
						nodes: [
							{
								id: 'code-1',
								typeKey: 'code',
								label: 'Invalid',
								code: 'export function node(x: any): any { return x }',
								codeMeta: {
									version: '1',
									inputs: [{key: 'obj', type: 'object'}], // not supported in PI-3
									output: {type: 'object'},
								},
							},
						],
						edges: [],
					},
				},
			],
		} as const;

		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(false);
	});

	it('forbids code/codeMeta on non-code nodes', () => {
		const project = {
			schemaVersion: '1',
			modules: [
				{
					...baseModule(),
					graph: {
						nodes: [
							{
								id: 'box-1',
								typeKey: 'box',
								code: 'nope',
								codeMeta: {version: '1', inputs: [], output: {type: 'number'}},
							} as any,
						],
						edges: [],
					},
				},
			],
		} as const;
		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(false);
	});
});
