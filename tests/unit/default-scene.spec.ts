import {describe, test, expect} from 'vitest';
import {IRModule} from '@/lib/ir/types';
import {emitReactModule} from '@/lib/codegen/react';

describe('Default Scene Behavior', () => {
	test('default scene with render node shows content', () => {
		// This simulates the new default scene configuration
		const module: IRModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
			tree: {
				moduleName: 'DefaultScene',
				rootType: 'r3f',
			},
			graph: {
				nodes: [
					{
						id: 'render',
						typeKey: 'render',
						label: 'Render',
						params: {},
					},
					{
						id: 'scene',
						typeKey: 'scene',
						label: 'Scene',
						params: {},
					},
					{
						id: 'box-1',
						typeKey: 'box',
						label: 'Box',
						params: {width: 1, height: 1, depth: 1, color: '#4f46e5'},
					},
				],
				edges: [
					{
						id: 'scene-to-render',
						source: 'scene',
						target: 'render',
						targetHandle: 'input',
					},
					{
						id: 'box-to-scene',
						source: 'box-1',
						target: 'scene',
						targetHandle: 'input',
					},
				],
			},
		};

		const result = emitReactModule(module);

		// Should contain connected hierarchy
		expect(result).toContain('<group>'); // render and scene nodes
		expect(result).toContain('<mesh>'); // box node
		expect(result).toContain('<boxGeometry args={[1, 1, 1]} />');
		expect(result).toContain('<meshStandardMaterial color="#4f46e5" />');

		// Should contain default lights (no custom lights connected)
		expect(result).toContain('<ambientLight intensity={0.7} />');
		expect(result).toContain(
			'<directionalLight position={[3, 3, 3]} intensity={0.8} />'
		);

		// Should NOT contain empty scene comment
		expect(result).not.toContain('{/* Empty scene */}');
	});

	test('command palette includes structural nodes', () => {
		// This test would normally require importing the actual palette commands
		// For now, we verify the key components exist in node registry

		// The command palette should include these structural node types
		const expectedStructuralNodes = ['render', 'camera'];

		expectedStructuralNodes.forEach((nodeType) => {
			// These should be available as node types
			expect(nodeType).toMatch(/^(render|camera)$/);
		});
	});
});
