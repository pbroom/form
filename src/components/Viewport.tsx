import {Canvas} from '@react-three/fiber';
import {Suspense, useMemo} from 'react';
import type {IRModule, GraphNode, GraphEdge} from '@/lib/ir/types';
import {COMPONENT_MAPPINGS} from '@/lib/codegen/react';

type BoxParams = {
	width: number;
	height: number;
	depth: number;
	color: string;
};

export type ViewGraphState = {
	// Legacy box support for backwards compatibility
	box?: BoxParams;
	// New IR-based scene rendering
	irModule?: IRModule;
};

function BoxMesh({width, height, depth, color}: BoxParams) {
	// stable geometry args
	const args = useMemo(
		() => [width, height, depth] as [number, number, number],
		[width, height, depth]
	);
	return (
		<mesh>
			<boxGeometry args={args} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}

// Component for rendering nodes from IR
function IRNode({
	node,
	children,
}: {
	node: GraphNode;
	children?: React.ReactNode;
}) {
	const mapping = COMPONENT_MAPPINGS[node.typeKey];
	const params = node.params || {};

	if (!mapping) return null;

	// Handle different node types
	if (node.typeKey === 'box') {
		const width = (params.width as number) || 1;
		const height = (params.height as number) || 1;
		const depth = (params.depth as number) || 1;
		const color = (params.color as string) || '#4f46e5';

		const args = useMemo(
			() => [width, height, depth] as [number, number, number],
			[width, height, depth]
		);

		return (
			<mesh>
				<boxGeometry args={args} />
				<meshStandardMaterial color={color} />
			</mesh>
		);
	}

	if (node.typeKey === 'sphere') {
		const radius = (params.radius as number) || 1;
		const color = (params.color as string) || '#4f46e5';

		return (
			<mesh>
				<sphereGeometry args={[radius]} />
				<meshStandardMaterial color={color} />
			</mesh>
		);
	}

	if (node.typeKey === 'directionalLight') {
		const intensity = (params.intensity as number) || 1;
		return <directionalLight position={[3, 3, 3]} intensity={intensity} />;
	}

	if (node.typeKey === 'ambientLight') {
		const intensity = (params.intensity as number) || 0.7;
		return <ambientLight intensity={intensity} />;
	}

	// Structural nodes that can contain children
	if (node.typeKey === 'scene' || node.typeKey === 'render') {
		return <group>{children}</group>;
	}

	// Camera node - doesn't render but influences viewport
	if (node.typeKey === 'camera') {
		// Camera positioning handled by Canvas props for now
		return null;
	}

	return null;
}

/**
 * Find all nodes that are reachable from a render root through connections
 */
function findConnectedNodes(
	renderNodeId: string,
	nodes: GraphNode[],
	edges: GraphEdge[]
): Set<string> {
	const connected = new Set<string>();
	const toVisit = [renderNodeId];
	connected.add(renderNodeId);

	while (toVisit.length > 0) {
		const currentId = toVisit.pop()!;

		// Find all edges that connect TO this node (incoming edges)
		const incomingEdges = edges.filter((edge) => edge.target === currentId);

		for (const edge of incomingEdges) {
			if (!connected.has(edge.source)) {
				connected.add(edge.source);
				toVisit.push(edge.source);
			}
		}
	}

	return connected;
}

/**
 * Build hierarchical scene structure from connected nodes
 */
function buildSceneHierarchy(
	nodeId: string,
	nodes: GraphNode[],
	edges: GraphEdge[],
	connectedNodes: Set<string>,
	visitedPath: Set<string> = new Set()
): React.ReactNode {
	if (!connectedNodes.has(nodeId)) return null;

	// Prevent infinite recursion from circular dependencies
	if (visitedPath.has(nodeId)) {
		console.warn(`Circular dependency detected at node ${nodeId}`);
		return null;
	}

	const node = nodes.find((n) => n.id === nodeId);
	if (!node) return null;

	// Add current node to visited path
	const newVisitedPath = new Set(visitedPath);
	newVisitedPath.add(nodeId);

	// Find child nodes (nodes that connect TO this node)
	const childEdges = edges.filter(
		(edge) => edge.target === nodeId && edge.source !== nodeId
	);
	const children = childEdges
		.map((edge) =>
			buildSceneHierarchy(
				edge.source,
				nodes,
				edges,
				connectedNodes,
				newVisitedPath
			)
		)
		.filter(Boolean);

	return (
		<IRNode key={node.id} node={node}>
			{children}
		</IRNode>
	);
}

// Render IR scene with connection-driven rendering
function IRScene({module}: {module: IRModule}) {
	const {nodes, edges} = module.graph;

	// Find render nodes (root of scene graph)
	const renderNodes = nodes.filter((node) => node.typeKey === 'render');

	// If no render node exists, render nothing (strict connection-driven behavior)
	if (renderNodes.length === 0) {
		return null;
	}

	// For each render node, trace back connections and build hierarchy
	const sceneContent = renderNodes.map((renderNode) => {
		const connectedNodes = findConnectedNodes(renderNode.id, nodes, edges);
		return buildSceneHierarchy(
			renderNode.id,
			nodes,
			edges,
			connectedNodes,
			new Set()
		);
	});

	return <>{sceneContent}</>;
}

export default function Viewport({state}: {state: ViewGraphState}) {
	return (
		<div className='w-full h-full bg-secondary' data-testid='viewport'>
			<Canvas camera={{position: [2.5, 2, 4], fov: 50}}>
				{/* Default lights when not using IR, or as fallback */}
				{!state.irModule && (
					<>
						<ambientLight intensity={0.7} />
						<directionalLight position={[3, 3, 3]} intensity={0.8} />
					</>
				)}

				<Suspense fallback={null}>
					{state.irModule ? (
						<IRScene module={state.irModule} />
					) : state.box ? (
						<BoxMesh
							width={state.box.width}
							height={state.box.height}
							depth={state.box.depth}
							color={state.box.color}
						/>
					) : null}
				</Suspense>
			</Canvas>
		</div>
	);
}
