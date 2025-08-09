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
import Viewport, {type ViewGraphState} from './Viewport';
import {useCallback, useEffect, useMemo, useState} from 'react';
import CommandPalette from './CommandPalette';
import PropertiesPanel from './PropertiesPanel';

// Define nodeTypes outside the component to prevent re-renders
const nodeTypes: NodeTypes = {
	custom: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
	{
		id: 'scene',
		type: 'custom',
		data: {typeKey: 'scene', label: 'Scene'},
		position: {x: 250, y: 25},
	},
	{
		id: 'box-1',
		type: 'custom',
		data: {
			typeKey: 'box',
			label: 'Box',
			params: {width: 1, height: 1, depth: 1, color: '#4f46e5'},
		},
		position: {x: 100, y: 180},
	},
];

const initialEdges: Edge[] = [
	{id: 'escene-box1', source: 'scene', target: 'box-1'},
];

function NodeGraphEditor() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<NodeData>>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [isPaletteOpen, setPaletteOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	const onConnect = (params: Connection) =>
		setEdges((eds) => addEdge(params, eds));

	const addBoxNode = useCallback(() => {
		const newId = `box-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {
				typeKey: 'box',
				label: 'Box',
				params: {width: 1, height: 1, depth: 1, color: '#4f46e5'},
			},
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
		setNodes((nds) => nds.concat(newNode));
		setEdges((eds) =>
			eds.concat({id: `e-scene-${newId}`, source: 'scene', target: newId})
		);
	}, [setEdges, setNodes]);

	const handleParamChange = useCallback(
		(nodeId: string, key: string, value: unknown) => {
			setNodes((prev) =>
				prev.map((n) => {
					if (n.id !== nodeId) return n;
					const d = n.data;
					return {
						...n,
						data: {
							...d,
							params: {...(d.params ?? {}), [key]: value},
						},
					} satisfies Node<NodeData>;
				})
			);
		},
		[setNodes]
	);

	const handleLabelChange = useCallback(
		(nodeId: string, label: string) => {
			setNodes((prev) =>
				prev.map((n) =>
					n.id === nodeId
						? ({
								...n,
								data: {...n.data, label},
						  } as Node<NodeData>)
						: n
				)
			);
		},
		[setNodes]
	);

	// Attach handler to all existing nodes so parameter controls are live
	useEffect(() => {
		setNodes((prev) =>
			prev.map((n) => ({
				...n,
				data: {...n.data, onParamChange: handleParamChange},
			}))
		);
	}, [handleParamChange, setNodes]);

	// Open palette with 'N'
	useEffect(() => {
		const isTextInput = (el: EventTarget | null) => {
			if (!(el instanceof HTMLElement)) return false;
			const tag = el.tagName.toLowerCase();
			return tag === 'input' || tag === 'textarea' || el.isContentEditable;
		};
		const onKey = (e: KeyboardEvent) => {
			if (
				e.key.toLowerCase() === 'n' &&
				!e.metaKey &&
				!e.ctrlKey &&
				!isTextInput(e.target)
			) {
				e.preventDefault();
				e.stopPropagation();
				setPaletteOpen(true);
			}
		};
		window.addEventListener('keydown', onKey, {capture: true});
		return () =>
			window.removeEventListener('keydown', onKey, {
				capture: true,
			} as AddEventListenerOptions);
	}, []);

	// Derive a very simple viewport graph state for immediate visibility
	const viewState: ViewGraphState = useMemo(() => {
		const hasBox = nodes.find((n) => n.data.typeKey === 'box');
		if (!hasBox) return {};
		type BoxParams = {
			width?: number;
			height?: number;
			depth?: number;
			color?: string;
		};
		const params = (hasBox.data.params ?? {}) as Partial<BoxParams>;
		return {
			box: {
				width: Number(params.width ?? 1),
				height: Number(params.height ?? 1),
				depth: Number(params.depth ?? 1),
				color: String(params.color ?? '#4f46e5'),
			},
		};
	}, [nodes]);

	const paletteCommands = useMemo(
		() => [{id: 'new-box', label: 'Insert Box', action: addBoxNode}],
		[addBoxNode]
	);

	return (
		<div className='w-full h-full grid grid-cols-[1fr_1fr]'>
			<div className='relative flex flex-col'>
				<div className='absolute top-4 left-4 z-10 flex gap-2'>
					<Button onClick={addBoxNode} variant='outline'>
						New Box (N)
					</Button>
				</div>
				<div className='flex-1 min-h-0'>
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
						onSelectionChange={({nodes: selNodes}) => {
							setSelectedNodeId(selNodes[0]?.id ?? null);
						}}
					>
						<CustomMinimap />
					</ReactFlow>
				</div>
				<div className='h-56 border-t border-border bg-background'>
					<PropertiesPanel
						node={useMemo(
							() => nodes.find((n) => n.id === selectedNodeId) ?? null,
							[nodes, selectedNodeId]
						)}
						onParamChange={handleParamChange}
						onLabelChange={handleLabelChange}
					/>
				</div>
				<CommandPalette
					isOpen={isPaletteOpen}
					onClose={() => setPaletteOpen(false)}
					commands={paletteCommands}
				/>
			</div>
			<div className='border-l border-border'>
				<Viewport state={viewState} />
			</div>
		</div>
	);
}

export default NodeGraphEditor;
