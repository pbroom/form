import {describe, it, expect} from 'vitest';
import {Node, Edge} from '@xyflow/react';
import type {NodeData} from '@/components/Node';
import type {GraphParameterValue} from '@/lib/node-registry';

// Mock the viewState computation logic from NodeGraphEditor
function computeEffectiveParams(
	nodes: Node<NodeData>[],
	edges: Edge[]
): Map<string, Record<string, GraphParameterValue>> {
	const nodeMap = new Map(nodes.map((n) => [n.id, n] as const));
	const effectiveParamsByNode = new Map<
		string,
		Record<string, GraphParameterValue>
	>();

	// Initialize effective params with node's own params
	for (const n of nodes) {
		effectiveParamsByNode.set(n.id, {
			...((n.data.params || {}) as Record<string, GraphParameterValue>),
		});
	}

	// Helper: recursively compute output for utility nodes
	const getNodeOutput = (nodeId: string): GraphParameterValue | undefined => {
		const node = nodeMap.get(nodeId);
		if (!node) return undefined;
		const type = String(node.data.typeKey);
		const base = (node.data.params || {}) as Record<
			string,
			GraphParameterValue
		>;
		if (
			type === 'numberConst' ||
			type === 'colorConst' ||
			type === 'booleanConst' ||
			type === 'stringConst'
		) {
			return (base.value ?? null) as GraphParameterValue;
		}
		if (type === 'add' || type === 'multiply') {
			const incoming = edges.filter(
				(ed) => ed.target === nodeId && ed.targetHandle
			);
			const aEdge = incoming.find((ed) => ed.targetHandle === 'a');
			const bEdge = incoming.find((ed) => ed.targetHandle === 'b');
			const a = aEdge
				? Number(getNodeOutput(aEdge.source))
				: Number(base.a ?? 0);
			const b = bEdge
				? Number(getNodeOutput(bEdge.source))
				: Number(base.b ?? (type === 'multiply' ? 1 : 0));
			if (Number.isNaN(a) || Number.isNaN(b)) return undefined;
			return (type === 'add' ? a + b : a * b) as GraphParameterValue;
		}
		return undefined;
	};

	// Process edges to apply values from source nodes to target parameters
	for (const e of edges) {
		if (!e.targetHandle) continue;
		const targetParams = effectiveParamsByNode.get(e.target);
		const source = nodeMap.get(e.source);
		const target = nodeMap.get(e.target);
		if (!targetParams || !source || !target) continue;

		// Extract value from known constant nodes and math nodes
		let value: GraphParameterValue | undefined;
		const sourceType = String(source.data.typeKey);
		if (
			sourceType === 'numberConst' ||
			sourceType === 'colorConst' ||
			sourceType === 'booleanConst' ||
			sourceType === 'stringConst'
		) {
			value =
				(source.data.params as Record<string, GraphParameterValue> | undefined)
					?.value ?? null;
		} else if (sourceType === 'add' || sourceType === 'multiply') {
			// Use the recursive getNodeOutput function for math nodes
			value = getNodeOutput(source.id);
		}

		if (value !== undefined) {
			targetParams[e.targetHandle] = value;
		}
	}

	return effectiveParamsByNode;
}

describe('Math Nodes Value Flow', () => {
	it('evaluates add node with constant inputs', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'const1',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 1', params: {value: 5}},
				position: {x: 0, y: 0},
			},
			{
				id: 'const2',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 2', params: {value: 3}},
				position: {x: 0, y: 0},
			},
			{
				id: 'add1',
				type: 'custom',
				data: {typeKey: 'add', label: 'Add', params: {a: 0, b: 0}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = [
			{
				id: 'edge1',
				source: 'const1',
				target: 'add1',
				targetHandle: 'a',
			},
			{
				id: 'edge2',
				source: 'const2',
				target: 'add1',
				targetHandle: 'b',
			},
		];

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const addParams = effectiveParams.get('add1');

		expect(addParams).toBeDefined();
		expect(addParams!.a).toBe(5);
		expect(addParams!.b).toBe(3);
	});

	it('evaluates multiply node with constant inputs', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'const1',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 1', params: {value: 4}},
				position: {x: 0, y: 0},
			},
			{
				id: 'const2',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 2', params: {value: 6}},
				position: {x: 0, y: 0},
			},
			{
				id: 'mult1',
				type: 'custom',
				data: {typeKey: 'multiply', label: 'Multiply', params: {a: 1, b: 1}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = [
			{
				id: 'edge1',
				source: 'const1',
				target: 'mult1',
				targetHandle: 'a',
			},
			{
				id: 'edge2',
				source: 'const2',
				target: 'mult1',
				targetHandle: 'b',
			},
		];

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const multParams = effectiveParams.get('mult1');

		expect(multParams).toBeDefined();
		expect(multParams!.a).toBe(4);
		expect(multParams!.b).toBe(6);
	});

	it('chains math operations with recursive evaluation', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'const1',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 1', params: {value: 2}},
				position: {x: 0, y: 0},
			},
			{
				id: 'const2',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 2', params: {value: 3}},
				position: {x: 0, y: 0},
			},
			{
				id: 'add1',
				type: 'custom',
				data: {typeKey: 'add', label: 'Add', params: {a: 0, b: 0}},
				position: {x: 0, y: 0},
			},
			{
				id: 'mult1',
				type: 'custom',
				data: {typeKey: 'multiply', label: 'Multiply', params: {a: 1, b: 1}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = [
			{
				id: 'edge1',
				source: 'const1',
				target: 'add1',
				targetHandle: 'a',
			},
			{
				id: 'edge2',
				source: 'const2',
				target: 'add1',
				targetHandle: 'b',
			},
			{
				id: 'edge3',
				source: 'add1',
				target: 'mult1',
				targetHandle: 'a',
			},
			{
				id: 'edge4',
				source: 'const1',
				target: 'mult1',
				targetHandle: 'b',
			},
		];

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const addParams = effectiveParams.get('add1');
		const multParams = effectiveParams.get('mult1');

		expect(addParams).toBeDefined();
		expect(addParams!.a).toBe(2);
		expect(addParams!.b).toBe(3);

		expect(multParams).toBeDefined();
		expect(multParams!.a).toBe(5); // 2 + 3 = 5
		expect(multParams!.b).toBe(2); // const1 value
	});

	it('uses default values when inputs are not connected', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'add1',
				type: 'custom',
				data: {typeKey: 'add', label: 'Add', params: {a: 10, b: 20}},
				position: {x: 0, y: 0},
			},
			{
				id: 'mult1',
				type: 'custom',
				data: {typeKey: 'multiply', label: 'Multiply', params: {a: 5, b: 2}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = []; // No connections

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const addParams = effectiveParams.get('add1');
		const multParams = effectiveParams.get('mult1');

		expect(addParams).toBeDefined();
		expect(addParams!.a).toBe(10); // Default value
		expect(addParams!.b).toBe(20); // Default value

		expect(multParams).toBeDefined();
		expect(multParams!.a).toBe(5); // Default value
		expect(multParams!.b).toBe(2); // Default value
	});

	it('propagates math node outputs to target parameters', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'const1',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 1', params: {value: 7}},
				position: {x: 0, y: 0},
			},
			{
				id: 'add1',
				type: 'custom',
				data: {typeKey: 'add', label: 'Add', params: {a: 0, b: 0}},
				position: {x: 0, y: 0},
			},
			{
				id: 'box1',
				type: 'custom',
				data: {typeKey: 'box', label: 'Box', params: {width: 1}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = [
			{
				id: 'edge1',
				source: 'const1',
				target: 'add1',
				targetHandle: 'a',
			},
			{
				id: 'edge2',
				source: 'add1',
				target: 'box1',
				targetHandle: 'width',
			},
		];

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const boxParams = effectiveParams.get('box1');

		expect(boxParams).toBeDefined();
		expect(boxParams!.width).toBe(7); // add1 output (7 + 0 = 7)
	});

	it('handles mixed constant and math node inputs', () => {
		const nodes: Node<NodeData>[] = [
			{
				id: 'const1',
				type: 'custom',
				data: {typeKey: 'numberConst', label: 'Const 1', params: {value: 3}},
				position: {x: 0, y: 0},
			},
			{
				id: 'add1',
				type: 'custom',
				data: {typeKey: 'add', label: 'Add', params: {a: 0, b: 0}},
				position: {x: 0, y: 0},
			},
			{
				id: 'mult1',
				type: 'custom',
				data: {typeKey: 'multiply', label: 'Multiply', params: {a: 1, b: 1}},
				position: {x: 0, y: 0},
			},
		];

		const edges: Edge[] = [
			{
				id: 'edge1',
				source: 'const1',
				target: 'add1',
				targetHandle: 'a',
			},
			{
				id: 'edge2',
				source: 'add1',
				target: 'mult1',
				targetHandle: 'a',
			},
			{
				id: 'edge3',
				source: 'const1',
				target: 'mult1',
				targetHandle: 'b',
			},
		];

		const effectiveParams = computeEffectiveParams(nodes, edges);
		const addParams = effectiveParams.get('add1');
		const multParams = effectiveParams.get('mult1');

		expect(addParams).toBeDefined();
		expect(addParams!.a).toBe(3);
		expect(addParams!.b).toBe(0); // Default

		expect(multParams).toBeDefined();
		expect(multParams!.a).toBe(3); // add1 output (3 + 0 = 3)
		expect(multParams!.b).toBe(3); // const1 value
	});
});
