import type {IRModule, GraphNode, GraphEdge} from '@/lib/ir/types';

const FENCE_START = '// BEGIN GENERATED:';
const FENCE_END = '// END GENERATED';

export type EmitOptions = {
	componentName?: string;
};

type DependencyNode = {
	node: GraphNode;
	dependencies: string[]; // node IDs this depends on
	depth: number;
};

type ComponentMapping = {
	typeKey: string;
	jsxTag: string;
	importPath?: string;
};

// Component mappings for known node types
export const COMPONENT_MAPPINGS: Record<string, ComponentMapping> = {
	render: {typeKey: 'render', jsxTag: 'group'}, // Root node for scene graph
	camera: {typeKey: 'camera', jsxTag: 'camera'}, // Camera for viewport
	scene: {typeKey: 'scene', jsxTag: 'group'},
	box: {typeKey: 'box', jsxTag: 'mesh'},
	sphere: {typeKey: 'sphere', jsxTag: 'mesh'},
	mesh: {typeKey: 'mesh', jsxTag: 'mesh'},
	orbitControls: {
		typeKey: 'orbitControls',
		jsxTag: 'OrbitControls',
		importPath: '@react-three/drei',
	},
	directionalLight: {typeKey: 'directionalLight', jsxTag: 'directionalLight'},
	ambientLight: {typeKey: 'ambientLight', jsxTag: 'ambientLight'},
};

/**
 * Resolve dependency order for nodes based on graph edges
 */
function resolveDependencyOrder(
	nodes: GraphNode[],
	edges: GraphEdge[]
): DependencyNode[] {
	const dependencyMap = new Map<string, string[]>();

	// Build dependency map from edges
	for (const edge of edges) {
		if (!dependencyMap.has(edge.target)) {
			dependencyMap.set(edge.target, []);
		}
		dependencyMap.get(edge.target)!.push(edge.source);
	}

	// Calculate depth via topological sort
	const visited = new Set<string>();
	const depths = new Map<string, number>();

	function calculateDepth(nodeId: string): number {
		if (depths.has(nodeId)) return depths.get(nodeId)!;
		if (visited.has(nodeId)) return 0; // Cycle detection - treat as depth 0

		visited.add(nodeId);
		const deps = dependencyMap.get(nodeId) || [];
		const maxDepth =
			deps.length > 0 ? Math.max(...deps.map(calculateDepth)) : -1;
		const depth = maxDepth + 1;
		depths.set(nodeId, depth);
		return depth;
	}

	return nodes
		.map((node) => ({
			node,
			dependencies: dependencyMap.get(node.id) || [],
			depth: calculateDepth(node.id),
		}))
		.sort((a, b) => a.depth - b.depth);
}

/**
 * Generate JSX props from node parameters for mesh components
 */
function generateMeshProps(node: GraphNode): string {
	const props: string[] = [];
	const params = node.params || {};

	// Only add non-geometry/material props for mesh
	for (const [key, value] of Object.entries(params)) {
		if (
			value !== null &&
			value !== undefined &&
			![
				'width',
				'height',
				'depth',
				'radius',
				'color',
				'metalness',
				'roughness',
				'wireframe',
			].includes(key)
		) {
			if (typeof value === 'string') {
				props.push(`${key}="${value}"`);
			} else if (typeof value === 'number' || typeof value === 'boolean') {
				props.push(`${key}={${JSON.stringify(value)}}`);
			}
		}
	}

	return props.length > 0 ? ` ${props.join(' ')}` : '';
}

/**
 * Generate JSX props for geometry components
 */
function generateGeometryProps(node: GraphNode): string {
	const params = node.params || {};

	if (node.typeKey === 'box') {
		const width = params.width || 1;
		const height = params.height || 1;
		const depth = params.depth || 1;
		return ` args={[${width}, ${height}, ${depth}]}`;
	} else if (node.typeKey === 'sphere') {
		const radius = params.radius || 1;
		return ` args={[${radius}]}`;
	}

	return '';
}

/**
 * Generate JSX props for material components
 */
function generateMaterialProps(node: GraphNode): string {
	const props: string[] = [];
	const params = node.params || {};

	// Material properties
	if (params.color && typeof params.color === 'string') {
		props.push(`color="${params.color}"`);
	} else {
		// Default color if none specified
		props.push(`color="#4f46e5"`);
	}

	if (typeof params.metalness === 'number') {
		props.push(`metalness={${params.metalness}}`);
	}

	if (typeof params.roughness === 'number') {
		props.push(`roughness={${params.roughness}}`);
	}

	if (typeof params.wireframe === 'boolean') {
		props.push(`wireframe={${params.wireframe}}`);
	}

	return props.length > 0 ? ` ${props.join(' ')}` : '';
}

/**
 * Generate JSX for a node and its dependencies
 */
function generateNodeJSX(
	depNode: DependencyNode,
	edges: GraphEdge[],
	nodeMap: Map<string, DependencyNode>
): string {
	const {node} = depNode;
	const mapping = COMPONENT_MAPPINGS[node.typeKey];

	if (!mapping) {
		return `{/* Unknown node type: ${node.typeKey} */}`;
	}

	const props = generateMeshProps(node);
	const tag = mapping.jsxTag;

	// Find child nodes (nodes that connect TO this node)
	const children = edges
		.filter((e) => e.target === node.id)
		.map((e) => nodeMap.get(e.source))
		.filter(Boolean)
		.map((childDep) => generateNodeJSX(childDep!, edges, nodeMap));

	// Special handling for specific node types
	if (node.typeKey === 'box') {
		// Box needs geometry and material as children
		return [
			`<${tag}${props}>`,
			'  <boxGeometry' + generateGeometryProps(node) + ' />',
			'  <meshStandardMaterial' + generateMaterialProps(node) + ' />',
			...children.map((child) => `  ${child}`),
			`</${tag}>`,
		].join('\n');
	} else if (node.typeKey === 'sphere') {
		return [
			`<${tag}${props}>`,
			'  <sphereGeometry' + generateGeometryProps(node) + ' />',
			'  <meshStandardMaterial' + generateMaterialProps(node) + ' />',
			...children.map((child) => `  ${child}`),
			`</${tag}>`,
		].join('\n');
	} else if (node.typeKey === 'camera') {
		// Camera node doesn't emit JSX but influences Canvas props
		// For now, just process children
		return children.map((child) => child).join('\n');
	}

	if (children.length > 0) {
		return [
			`<${tag}${props}>`,
			...children.map((child) => `  ${child}`),
			`</${tag}>`,
		].join('\n');
	} else {
		return `<${tag}${props} />`;
	}
}

export function emitReactModule(
	module: IRModule,
	opts: EmitOptions = {}
): string {
	const componentName =
		opts.componentName ?? module.tree.moduleName ?? 'MainScene';
	const header = `/**
 * This file is generated. Manual edits outside fenced regions will be preserved.
 */`;

	// Resolve dependency order for nodes
	const orderedNodes = resolveDependencyOrder(
		module.graph.nodes,
		module.graph.edges
	);
	const nodeMap = new Map(orderedNodes.map((dn) => [dn.node.id, dn]));

	// Determine required imports
	const dreiImports = new Set<string>();

	for (const depNode of orderedNodes) {
		const mapping = COMPONENT_MAPPINGS[depNode.node.typeKey];
		if (mapping?.importPath === '@react-three/drei') {
			dreiImports.add(mapping.jsxTag);
		}
	}

	const imports = [
		"import React from 'react'",
		"import { Canvas } from '@react-three/fiber'",
		dreiImports.size > 0
			? `import { ${Array.from(dreiImports).join(
					', '
			  )} } from '@react-three/drei'`
			: null,
		"import * as THREE from 'three'",
	]
		.filter(Boolean)
		.join('\n');

	const importsRegion = [`${FENCE_START} imports`, imports, FENCE_END].join(
		'\n'
	);

	// Generate JSX tree from graph using connection-driven rendering
	let sceneContent = '  {/* Empty scene */}';

	// Find render nodes (root of scene graph)
	const renderNodes = orderedNodes.filter((dn) => dn.node.typeKey === 'render');

	if (renderNodes.length > 0) {
		// For render nodes, trace connections and build hierarchy
		const renderJSX = renderNodes
			.map((renderNode) =>
				generateNodeJSX(renderNode, module.graph.edges, nodeMap)
			)
			.map((jsx) =>
				jsx
					.split('\n')
					.map((line) => `  ${line}`)
					.join('\n')
			)
			.join('\n');
		sceneContent = renderJSX;
	}
	// If no render nodes exist, keep sceneContent as '  {/* Empty scene */}'

	// Check if the graph has any light nodes connected to render
	// We need to trace from render nodes to see if any lights are reachable
	let hasConnectedLights = false;
	if (renderNodes.length > 0) {
		// For each render node, find all connected nodes
		for (const renderNode of renderNodes) {
			const connectedNodeIds = new Set<string>();
			const toVisit = [renderNode.node.id];
			connectedNodeIds.add(renderNode.node.id);

			while (toVisit.length > 0) {
				const currentId = toVisit.pop()!;
				const incomingEdges = module.graph.edges.filter(
					(edge) => edge.target === currentId
				);

				for (const edge of incomingEdges) {
					if (!connectedNodeIds.has(edge.source)) {
						connectedNodeIds.add(edge.source);
						toVisit.push(edge.source);
					}
				}
			}

			// Check if any connected nodes are lights
			const connectedLights = orderedNodes.filter(
				(dn) =>
					connectedNodeIds.has(dn.node.id) &&
					(dn.node.typeKey === 'directionalLight' ||
						dn.node.typeKey === 'ambientLight')
			);

			if (connectedLights.length > 0) {
				hasConnectedLights = true;
				break;
			}
		}
	}

	// Only add default lights if no lights are in the connected graph
	const defaultLights = hasConnectedLights
		? []
		: [
				'  <ambientLight intensity={0.7} />',
				'  <directionalLight position={[3, 3, 3]} intensity={0.8} />',
		  ];

	const jsx = [
		'<Canvas camera={{ position: [2.5, 2, 4], fov: 50 }}>',
		...defaultLights,
		sceneContent,
		'</Canvas>',
	].join('\n');

	const componentRegion = [
		`${FENCE_START} component`,
		`export function ${componentName}() {`,
		`  return (`,
		jsx,
		`  );`,
		`}`,
		FENCE_END,
	].join('\n');

	const exportRegion = [
		`${FENCE_START} exports`,
		`export default ${componentName};`,
		FENCE_END,
	].join('\n');

	return [
		header,
		importsRegion,
		'',
		componentRegion,
		'',
		exportRegion,
		'',
	].join('\n');
}
