import {describe, test, expect} from 'vitest';
import {emitReactModule} from '@/lib/codegen/react';
import type {IRModule} from '@/lib/ir/types';

describe('Connection-Driven Rendering', () => {
	test('renders only connected nodes from render root', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'ConnectedScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						label: 'Render Root',
						params: {},
					},
					{
						id: 'scene1',
						typeKey: 'scene',
						label: 'Connected Scene',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						label: 'Connected Box',
						params: {width: 2, height: 2, depth: 2},
					},
					{
						id: 'light1',
						typeKey: 'directionalLight',
						label: 'Disconnected Light',
						params: {intensity: 1.5},
					},
				],
				edges: [
					{
						id: 'scene1->render1',
						source: 'scene1',
						target: 'render1',
					},
					{
						id: 'box1->scene1',
						source: 'box1',
						target: 'scene1',
					},
					// Note: light1 is not connected to the render graph
				],
			},
		};

		const result = emitReactModule(module);

		// Should contain connected nodes (render, scene, box)
		expect(result).toContain('<group>'); // render node
		expect(result).toContain('<mesh>'); // box node
		expect(result).toContain('<boxGeometry args={[2, 2, 2]} />');

		// Should contain default lights since no lights are connected to render graph
		// The disconnected light1 node should not affect the output
		expect(result).toContain(
			'<directionalLight position={[3, 3, 3]} intensity={0.8}'
		); // Default light
		expect(result).not.toContain('intensity={1.5}'); // Should not contain disconnected light's params
	});

	test('renders nothing when no render node present (strict mode)', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'LegacyScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'box1',
						typeKey: 'box',
						params: {width: 1, height: 1, depth: 1},
					},
					{
						id: 'light1',
						typeKey: 'directionalLight',
						params: {intensity: 0.8},
					},
				],
				edges: [], // No connections
			},
		};

		const result = emitReactModule(module);

		// Strict behavior: should only have default lights and empty scene
		expect(result).toContain('{/* Empty scene */}');
		expect(result).toContain('<ambientLight intensity={0.7} />');
		expect(result).toContain(
			'<directionalLight position={[3, 3, 3]} intensity={0.8} />'
		);

		// Should NOT render any disconnected nodes
		expect(result).not.toContain('<mesh>');
		expect(result).not.toContain('intensity={1.5}');
	});

	test('handles multiple render roots', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'MultiRenderScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						params: {},
					},
					{
						id: 'render2',
						typeKey: 'render',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						params: {width: 1, height: 1, depth: 1},
					},
					{
						id: 'sphere1',
						typeKey: 'sphere',
						params: {radius: 1.5},
					},
				],
				edges: [
					{id: 'box1->render1', source: 'box1', target: 'render1'},
					{id: 'sphere1->render2', source: 'sphere1', target: 'render2'},
				],
			},
		};

		const result = emitReactModule(module);

		// Should include both render graphs
		expect(result).toContain('<mesh>'); // for box
		expect(result).toContain('<boxGeometry');
		expect(result).toContain('<sphereGeometry');
	});

	test('handles camera and scene hierarchy', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'HierarchyScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						params: {},
					},
					{
						id: 'camera1',
						typeKey: 'camera',
						params: {fov: 60},
					},
					{
						id: 'scene1',
						typeKey: 'scene',
						params: {},
					},
				],
				edges: [
					{id: 'camera1->render1', source: 'camera1', target: 'render1'},
					{id: 'scene1->render1', source: 'scene1', target: 'render1'},
				],
			},
		};

		const result = emitReactModule(module);

		// Should include render root with connected camera and scene
		expect(result).toContain('<group>'); // render and scene nodes
		// Camera doesn't emit JSX in current implementation but should be processed
		expect(result).not.toContain('<camera'); // Camera handled via Canvas props
	});

	test('connected lights suppress default Canvas lights', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'CustomLitScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render1',
						typeKey: 'render',
						params: {},
					},
					{
						id: 'scene1',
						typeKey: 'scene',
						params: {},
					},
					{
						id: 'light1',
						typeKey: 'directionalLight',
						params: {intensity: 2.0},
					},
				],
				edges: [
					{id: 'scene1->render1', source: 'scene1', target: 'render1'},
					{id: 'light1->scene1', source: 'light1', target: 'scene1'},
				],
			},
		};

		const result = emitReactModule(module);

		// Should contain connected custom light
		expect(result).toContain('<directionalLight');
		expect(result).toContain('intensity={2}'); // Custom light params

		// Should NOT contain default Canvas lights since custom lights are connected
		expect(result).not.toContain('intensity={0.7}'); // Default ambient
		expect(result).not.toContain('intensity={0.8}'); // Default directional
	});
});
