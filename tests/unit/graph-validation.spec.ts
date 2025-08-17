import {describe, it, expect} from 'vitest';
import {
	validateParameterValue,
	validateConnection,
	validateGraph,
} from '@/lib/validation/graph-validation';
import type {Node, Edge} from '@xyflow/react';
import type {NodeData} from '@/components/Node';

describe('Graph Validation', () => {
	describe('validateParameterValue', () => {
		it('validates number parameters', () => {
			const paramDef = {
				key: 'width',
				label: 'Width',
				type: 'number' as const,
				defaultValue: 1,
				min: 0.1,
				max: 10,
			};

			// Valid value
			expect(validateParameterValue(5, paramDef)).toBeNull();

			// Invalid type
			const typeError = validateParameterValue('not-a-number', paramDef);
			expect(typeError).toMatchObject({
				type: 'type-mismatch',
				parameterKey: 'width',
			});

			// Out of range (too low)
			const lowError = validateParameterValue(0.05, paramDef);
			expect(lowError).toMatchObject({
				type: 'out-of-range',
				parameterKey: 'width',
			});

			// Out of range (too high)
			const highError = validateParameterValue(15, paramDef);
			expect(highError).toMatchObject({
				type: 'out-of-range',
				parameterKey: 'width',
			});
		});

		it('validates boolean parameters', () => {
			const paramDef = {
				key: 'wireframe',
				label: 'Wireframe',
				type: 'boolean' as const,
				defaultValue: false,
			};

			expect(validateParameterValue(true, paramDef)).toBeNull();
			expect(validateParameterValue(false, paramDef)).toBeNull();

			const error = validateParameterValue('not-boolean', paramDef);
			expect(error).toMatchObject({
				type: 'type-mismatch',
				parameterKey: 'wireframe',
			});
		});

		it('validates color parameters', () => {
			const paramDef = {
				key: 'color',
				label: 'Color',
				type: 'color' as const,
				defaultValue: '#ff0000',
			};

			expect(validateParameterValue('#ff0000', paramDef)).toBeNull();
			expect(validateParameterValue('#123ABC', paramDef)).toBeNull();

			const invalidError = validateParameterValue('red', paramDef);
			expect(invalidError).toMatchObject({
				type: 'type-mismatch',
				parameterKey: 'color',
			});

			const shortError = validateParameterValue('#ff0', paramDef);
			expect(shortError).toMatchObject({
				type: 'type-mismatch',
				parameterKey: 'color',
			});
		});
	});

	describe('validateConnection', () => {
		it('allows compatible connections', () => {
			const boxNode: Node<NodeData> = {
				id: 'box1',
				type: 'custom',
				position: {x: 0, y: 0},
				data: {typeKey: 'box'},
			};

			const sceneNode: Node<NodeData> = {
				id: 'scene1',
				type: 'custom',
				position: {x: 100, y: 0},
				data: {typeKey: 'scene'},
			};

			// Box (mesh) to Scene input should be allowed
			const result = validateConnection(boxNode, sceneNode, 'input');
			expect(result).toBeNull();
		});

		it('prevents incompatible type connections', () => {
			const boxNode: Node<NodeData> = {
				id: 'box1',
				type: 'custom',
				position: {x: 0, y: 0},
				data: {typeKey: 'box'},
			};

			const fakeNode: Node<NodeData> = {
				id: 'fake1',
				type: 'custom',
				position: {x: 100, y: 0},
				data: {typeKey: 'unknown-type'},
			};

			const result = validateConnection(boxNode, fakeNode, 'input');
			expect(result).toMatchObject({
				type: 'invalid-connection',
				sourceNodeId: 'box1',
				targetNodeId: 'fake1',
			});
		});

		it('prevents connection to non-existent parameters', () => {
			const boxNode: Node<NodeData> = {
				id: 'box1',
				type: 'custom',
				position: {x: 0, y: 0},
				data: {typeKey: 'box'},
			};

			const sceneNode: Node<NodeData> = {
				id: 'scene1',
				type: 'custom',
				position: {x: 100, y: 0},
				data: {typeKey: 'scene'},
			};

			const result = validateConnection(
				boxNode,
				sceneNode,
				'nonexistent-param'
			);
			expect(result).toMatchObject({
				type: 'invalid-connection',
				targetNodeId: 'scene1',
				parameterKey: 'nonexistent-param',
			});
		});
	});

	describe('validateGraph', () => {
		it('validates complete graph state', () => {
			const nodes: Node<NodeData>[] = [
				{
					id: 'box1',
					type: 'custom',
					position: {x: 0, y: 0},
					data: {
						typeKey: 'box',
						params: {
							width: 123, // Invalid: out of range (max is 10)
						},
					},
				},
				{
					id: 'scene1',
					type: 'custom',
					position: {x: 100, y: 0},
					data: {typeKey: 'scene'},
				},
			];

			const edges: Edge[] = [
				{
					id: 'e1',
					source: 'box1',
					target: 'scene1',
					targetHandle: 'input',
				},
			];

			const errors = validateGraph(nodes, edges);

			// Should find parameter validation errors (for the width parameter out of range)
			expect(
				errors.some(
					(e) => e.type === 'out-of-range' && e.parameterKey === 'width'
				)
			).toBe(true);
		});

		it('returns no errors for valid graph', () => {
			const nodes: Node<NodeData>[] = [
				{
					id: 'box1',
					type: 'custom',
					position: {x: 0, y: 0},
					data: {
						typeKey: 'box',
						params: {
							width: 2,
							height: 1.5,
							depth: 1,
							color: '#4f46e5',
						},
					},
				},
				{
					id: 'scene1',
					type: 'custom',
					position: {x: 100, y: 0},
					data: {typeKey: 'scene'},
				},
			];

			const edges: Edge[] = [
				{
					id: 'e1',
					source: 'box1',
					target: 'scene1',
					targetHandle: 'input',
				},
			];

			const errors = validateGraph(nodes, edges);
			expect(errors).toHaveLength(0);
		});
	});
});
