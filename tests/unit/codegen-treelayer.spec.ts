import {describe, test, expect} from 'vitest';
import {emitReactModule} from '@/lib/codegen/react';
import type {IRModule} from '@/lib/ir/types';

describe('TreeLayer Codegen', () => {
	test('emits basic box scene with parameters', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'TestScene',
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
						id: 'box1',
						typeKey: 'box',
						label: 'Test Box',
						params: {
							width: 2,
							height: 1.5,
							depth: 1,
							color: '#ff0000',
						},
					},
				],
				edges: [
					{id: 'e1', source: 'box1', target: 'render1', targetHandle: 'input'},
				],
			},
		};

		const result = emitReactModule(module);

		// Should contain the component name
		expect(result).toContain('export function TestScene()');

		// Should contain box with proper geometry and material
		expect(result).toContain('<mesh>');
		expect(result).toContain('<boxGeometry args={[2, 1.5, 1]} />');
		expect(result).toContain('<meshStandardMaterial color="#ff0000" />');
		expect(result).toContain('</mesh>');

		// Should have proper fenced regions
		expect(result).toContain('// BEGIN GENERATED: imports');
		expect(result).toContain('// BEGIN GENERATED: component');
		expect(result).toContain('// BEGIN GENERATED: exports');
		expect(result).toContain('// END GENERATED');
	});

	test('emits sphere scene with default parameters', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'SphereScene',
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
						id: 'sphere1',
						typeKey: 'sphere',
						label: 'Test Sphere',
						params: {
							radius: 1.5,
						},
					},
				],
				edges: [
					{
						id: 'e1',
						source: 'sphere1',
						target: 'render1',
						targetHandle: 'input',
					},
				],
			},
		};

		const result = emitReactModule(module);

		expect(result).toContain('<sphereGeometry args={[1.5]} />');
		expect(result).toContain('<meshStandardMaterial color="#4f46e5" />');
	});

	test('emits empty scene when no nodes', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'EmptyScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [],
				edges: [],
			},
		};

		const result = emitReactModule(module);

		expect(result).toContain('export function EmptyScene()');
		expect(result).toContain('{/* Empty scene */}');
		expect(result).toContain('<Canvas');
		expect(result).toContain('<ambientLight intensity={0.7} />');
		expect(result).toContain(
			'<directionalLight position={[3, 3, 3]} intensity={0.8} />'
		);
	});

	test('handles unknown node types gracefully', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'UnknownScene',
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
						id: 'unknown1',
						typeKey: 'unknownType',
						label: 'Unknown Node',
						params: {},
					},
				],
				edges: [
					{
						id: 'e1',
						source: 'unknown1',
						target: 'render1',
						targetHandle: 'input',
					},
				],
			},
		};

		const result = emitReactModule(module);

		expect(result).toContain('{/* Unknown node type: unknownType */}');
	});

	test('includes drei imports when needed', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'ControlsScene',
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
						id: 'controls1',
						typeKey: 'orbitControls',
						label: 'Orbit Controls',
						params: {},
					},
				],
				edges: [
					{
						id: 'e1',
						source: 'controls1',
						target: 'render1',
						targetHandle: 'input',
					},
				],
			},
		};

		const result = emitReactModule(module);

		expect(result).toContain(
			"import { OrbitControls } from '@react-three/drei'"
		);
		expect(result).toContain('<OrbitControls />');
	});

	test('resolves dependency order with render node', () => {
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-15T10:00:00Z',
				updatedAt: '2025-01-15T10:00:00Z',
			},
			tree: {
				moduleName: 'DependencyScene',
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
						label: 'Scene Container',
						params: {},
					},
					{
						id: 'box1',
						typeKey: 'box',
						label: 'Child Box',
						params: {
							width: 1,
							height: 1,
							depth: 1,
						},
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
				],
			},
		};

		const result = emitReactModule(module);

		// Should render with proper hierarchy: render(scene(box))
		expect(result).toContain('<group>'); // render and scene
		expect(result).toContain('<mesh>'); // box
		expect(result).toContain('</group>');
	});
});
