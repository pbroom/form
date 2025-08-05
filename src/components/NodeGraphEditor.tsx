import {
	ReactFlow,
	Node,
	Edge,
	addEdge,
	Connection,
	useNodesState,
	useEdgesState,
	NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {Button} from '@/components/ui/button';
import CustomNode, {NodeData} from './Node';
import CustomMinimap from './Minimap';

// Define nodeTypes outside the component to prevent re-renders
const nodeTypes: NodeTypes = {
	custom: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
	{
		id: '1',
		type: 'custom',
		data: {label: 'Start Node'},
		position: {x: 250, y: 25},
	},
	{
		id: '2',
		type: 'custom',
		data: {label: 'Process Node'},
		position: {x: 100, y: 125},
	},
	{
		id: '3',
		type: 'custom',
		data: {label: 'End Node'},
		position: {x: 250, y: 250},
	},
];

const initialEdges: Edge[] = [
	{id: 'e1-2', source: '1', target: '2'},
	{id: 'e2-3', source: '2', target: '3'},
];

function NodeGraphEditor() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Debug: log the nodes to see their types
	console.log(
		'Nodes:',
		nodes.map((n) => ({id: n.id, type: n.type, data: n.data}))
	);

	const onConnect = (params: Connection) =>
		setEdges((eds) => addEdge(params, eds));

	const addNode = () => {
		const newNode: Node<NodeData> = {
			id: `${nodes.length + 1}`,
			type: 'custom',
			data: {label: `Node ${nodes.length + 1}`},
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
		setNodes((nds) => nds.concat(newNode));
	};

	return (
		<div className='w-full h-full'>
			<div className='absolute top-4 left-4 z-10'>
				<Button onClick={addNode} variant='outline'>
					Add Node
				</Button>
			</div>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				className='bg-background text-foreground'
				style={{width: '100%', height: '100%'}}
				defaultViewport={{x: 0, y: 0, zoom: 1}}
			>
				<CustomMinimap />
			</ReactFlow>
		</div>
	);
}

export default NodeGraphEditor;
