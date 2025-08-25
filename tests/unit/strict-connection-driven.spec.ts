import {describe, test, expect} from 'vitest';
import {IRModule} from '@/lib/ir/types';
import {emitReactModule} from '@/lib/codegen/react';

describe('Strict Connection-Driven Behavior', () => {
	test('renders nothing when no render node exists', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
			tree: {
				moduleName: 'TestModule',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'scene1',
						typeKey: 'scene',
						label: 'Scene',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						label: 'Box',
						params: {width: 1, height: 1, depth: 1, color: '#ff0000'},
					},
					{
						id: 'light1',
						typeKey: 'ambientLight',
						label: 'Ambient Light',
						params: {intensity: 0.5},
					},
				],
				edges: [],
			},
		};

		const result = emitReactModule(module);

		// Should only have Canvas wrapper with default lights, no scene content
		expect(result).toContain('<Canvas');
		expect(result).toContain('ambientLight intensity={0.7}');
		expect(result).toContain('directionalLight position={[3, 3, 3]}');
		expect(result).toContain('{/* Empty scene */}');

		// Should NOT contain any box or scene elements
		expect(result).not.toContain('<mesh');
		expect(result).not.toContain('<boxGeometry');
		expect(result).not.toContain('<group');
	});

	test('lights do not affect scene without render connection', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
			tree: {
				moduleName: 'TestModule',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'scene1',
						typeKey: 'scene',
						label: 'Scene',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						label: 'Box',
						params: {width: 1, height: 1, depth: 1, color: '#ff0000'},
					},
					{
						id: 'light1',
						typeKey: 'ambientLight',
						label: 'Ambient Light',
						params: {intensity: 0.9},
					},
				],
				edges: [
					// Box connected to scene, but scene not connected to render
					{id: 'e1', source: 'box1', target: 'scene1', targetHandle: 'input'},
					// Light exists but not connected to anything
				],
			},
		};

		const result = emitReactModule(module);

		// Should only have default Canvas lights since no render node exists
		expect(result).toContain('ambientLight intensity={0.7}');
		expect(result).toContain('directionalLight position={[3, 3, 3]}');

		// Should NOT suppress default lights (no connected lights to render)
		expect(result).not.toContain('ambientLight intensity={0.9}');

		// Should contain empty scene comment
		expect(result).toContain('{/* Empty scene */}');
	});

	test('only renders connected hierarchy from render root', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
			tree: {
				moduleName: 'TestModule',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						label: 'Render',
						params: {},
					},
					{
						id: 'scene1',
						typeKey: 'scene',
						label: 'Scene',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						label: 'Connected Box',
						params: {width: 1, height: 1, depth: 1, color: '#00ff00'},
					},
					{
						id: 'box2',
						typeKey: 'box',
						label: 'Disconnected Box',
						params: {width: 2, height: 2, depth: 2, color: '#ff0000'},
					},
					{
						id: 'light1',
						typeKey: 'ambientLight',
						label: 'Connected Light',
						params: {intensity: 0.8},
					},
					{
						id: 'light2',
						typeKey: 'directionalLight',
						label: 'Disconnected Light',
						params: {intensity: 1.0},
					},
				],
				edges: [
					// Connected hierarchy: box1 → scene1 → render1
					{id: 'e1', source: 'box1', target: 'scene1', targetHandle: 'input'},
					{
						id: 'e2',
						source: 'scene1',
						target: 'render1',
						targetHandle: 'input',
					},
					{id: 'e3', source: 'light1', target: 'scene1', targetHandle: 'input'},
					// box2 and light2 are disconnected
				],
			},
		};

		const result = emitReactModule(module);

		// Should render connected box and scene
		expect(result).toContain('<mesh');
		expect(result).toContain('<boxGeometry args={[1, 1, 1]}');
		expect(result).toContain('color="#00ff00"');
		expect(result).toContain('<group>'); // scene wrapper

		// Should render connected light and suppress defaults
		expect(result).toContain('<ambientLight intensity={0.8}');
		expect(result).not.toContain('ambientLight intensity={0.7}'); // default suppressed

		// Should NOT render disconnected elements
		expect(result).not.toContain('<boxGeometry args={[2, 2, 2]}');
		expect(result).not.toContain('color="#ff0000"');
		expect(result).not.toContain('<directionalLight intensity={1}');
	});

	test('structural nodes accept input connections', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
			tree: {
				moduleName: 'TestModule',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						label: 'Render',
						params: {},
					},
					{
						id: 'scene1',
						typeKey: 'scene',
						label: 'Scene',
						params: {},
					},
				],
				edges: [
					{
						id: 'e1',
						source: 'scene1',
						target: 'render1',
						targetHandle: 'input',
					},
				],
			},
		};

		const result = emitReactModule(module);

		// Should render scene connected to render
		expect(result).toContain('<group>'); // scene renders as group
		expect(result).not.toContain('{/* Empty scene */}');
	});
});
