import type {GraphEdge, GraphLayer, GraphNode} from './types';

export function createEmptyGraph(): GraphLayer {
	return {nodes: [], edges: []};
}

export function addNode(graph: GraphLayer, node: GraphNode): GraphLayer {
	if (graph.nodes.some((n) => n.id === node.id)) return graph;
	return {
		nodes: [...graph.nodes, node],
		edges: graph.edges,
	};
}

export function connect(
	graph: GraphLayer,
	sourceId: string,
	targetId: string,
	targetHandle?: string
): GraphLayer {
	// Prevent self loops and duplicate edges with the same target handle
	if (sourceId === targetId) return graph;
	const edgeId = `${sourceId}->${targetId}${
		targetHandle ? `:${targetHandle}` : ''
	}`;
	if (graph.edges.some((e) => e.id === edgeId)) return graph;
	const nextEdge: GraphEdge = {
		id: edgeId,
		source: sourceId,
		target: targetId,
		targetHandle,
	};
	return {
		nodes: graph.nodes,
		edges: [...graph.edges, nextEdge],
	};
}

export function setParam(
	graph: GraphLayer,
	nodeId: string,
	key: string,
	value: unknown
): GraphLayer {
	return {
		nodes: graph.nodes.map((n) =>
			n.id === nodeId
				? {
						...n,
						params: {...(n.params ?? {}), [key]: value},
				  }
				: n
		),
		edges: graph.edges,
	};
}

export function serializeGraph(graph: GraphLayer): string {
	// Deterministic ordering of nodes and edges
	const nodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
	const edges = [...graph.edges].sort((a, b) => a.id.localeCompare(b.id));
	return JSON.stringify({nodes, edges});
}
