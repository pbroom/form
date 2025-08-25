import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	addEdge,
	type Node,
	type Edge,
	type Connection,
	type NodeTypes,
	SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode, {type NodeData} from '@/components/Node';
import type {ReactFlowProps} from '@xyflow/react';
import {initialNodes} from '@/components/initial-nodes';
import CustomEdge from './Edge';

export type ReactFlowCommonProps = Pick<
	ReactFlowProps,
	| 'id'
	| 'className'
	| 'style'
	| 'aria-label'
	| 'colorMode'
	| 'proOptions'
	| 'nodes'
	| 'edges'
	| 'defaultNodes'
	| 'defaultEdges'
	| 'nodeTypes'
	| 'edgeTypes'
	| 'defaultEdgeOptions'
	| 'connectOnClick'
	| 'connectionMode'
	| 'elevateNodesOnSelect'
	| 'isValidConnection'
>;

export type ReactFlowViewportProps = Pick<
	ReactFlowProps,
	| 'fitView' // boolean
	| 'fitViewOptions' // FitViewOptions
	| 'defaultViewport' // Viewport
	| 'viewport' // Viewport (controlled)
	| 'minZoom' // number
	| 'maxZoom' // number
	| 'translateExtent' // CoordinateExtent
	| 'nodeOrigin' // NodeOrigin
	| 'panOnScroll' // boolean | PanOnScrollMode
	| 'panOnScrollSpeed' // number
	| 'panOnScrollMode' // PanOnScrollMode
	| 'zoomOnScroll' // boolean
	| 'zoomOnPinch' // boolean
	| 'zoomOnDoubleClick' // boolean
	| 'snapToGrid' // boolean
	| 'snapGrid' // SnapGrid
>;

const nodeTypes: NodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	default: CustomEdge,
};

const initialEdges: Edge[] = [];

export default function NodeGraphEditorV2() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<NodeData>>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const onConnect = (params: Connection) =>
		setEdges((eds) => addEdge(params, eds));

	const addBoxNode = () => {
		const newId = `box-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {
				typeKey: 'box',
				label: 'Box',
				params: {width: 1, height: 1, depth: 1, color: '#4f46e5'},
			},
			position: {x: Math.random() * 400, y: Math.random() * 400},
		};
		setNodes((nds) => nds.concat(newNode));
	};

	const addCodeNode = () => {
		const newId = `code-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {typeKey: 'code', label: 'Code', params: {}},
			position: {x: Math.random() * 400, y: Math.random() * 400},
		};
		setNodes((nds) => nds.concat(newNode));
	};

	return (
		<div className='w-full h-full relative'>
			<div className='absolute z-10 m-2 flex gap-2'>
				<button
					className='px-2 py-1 text-xs rounded border border-border bg-popover hover:bg-accent'
					onClick={addBoxNode}
				>
					Add Box
				</button>
				<button
					className='px-2 py-1 text-xs rounded border border-border bg-popover hover:bg-accent'
					onClick={addCodeNode}
				>
					Add Code Node
				</button>
			</div>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				fitViewOptions={{
					padding: 1,
				}}
				maxZoom={3}
				minZoom={0.3}
				zoomOnScroll={false}
				panOnScroll={true}
				panOnScrollSpeed={1}
				panOnDrag={false}
				panActivationKeyCode='Space'
				selectionOnDrag={true}
				selectionMode={SelectionMode.Partial}
				selectNodesOnDrag={true}
				className='bg-background text-foreground'
				style={{width: '100%', height: '100%'}}
			/>
		</div>
	);
}
