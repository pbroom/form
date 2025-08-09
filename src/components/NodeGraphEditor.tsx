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
import DraggableMinimap from './DraggableMinimap';
import Viewport, {type ViewGraphState} from './Viewport';
import {useEffect, useState} from 'react';
import CommandPalette from './CommandPalette';
import PropertiesPanel from './PropertiesPanel';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import {DndContext} from '@dnd-kit/core';

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
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
		setNodes((nds) => nds.concat(newNode));
		setEdges((eds) =>
			eds.concat({id: `e-scene-${newId}`, source: 'scene', target: newId})
		);
	};

	const handleParamChange = (nodeId: string, key: string, value: unknown) => {
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
	};

	const handleLabelChange = (nodeId: string, label: string) => {
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
	};

	// Attach handler to all existing nodes so parameter controls are live
	useEffect(() => {
		const attachParamHandler = (
			nodeId: string,
			key: string,
			value: unknown
		) => {
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
		};

		setNodes((prev) =>
			prev.map((n) => ({
				...n,
				data: {...n.data, onParamChange: attachParamHandler},
			}))
		);
	}, [setNodes]);

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
	const viewState: ViewGraphState = (() => {
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
	})();

	const paletteCommands = [
		{id: 'new-box', label: 'Insert Box', action: addBoxNode},
	];

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

	return (
		<div className='w-full h-full'>
			<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
				{/* Left side: vertical split with viewport (top) and editor (bottom) */}
				<ResizablePanel defaultSize={70} minSize={40} className='relative'>
					<div className='absolute top-4 left-4 z-10 flex gap-2'>
						<Button onClick={addBoxNode} variant='outline'>
							New Box (N)
						</Button>
					</div>
					<ResizablePanelGroup direction='vertical' className='h-full w-full'>
						{/* Top: Viewport */}
						<ResizablePanel
							defaultSize={50}
							minSize={30}
							className='border-b border-border'
						>
							<Viewport state={viewState} />
						</ResizablePanel>
						<ResizableHandle />
						{/* Bottom: Node editor */}
						<ResizablePanel defaultSize={50} minSize={30}>
							<div className='relative h-full w-full'>
								<DndContext>
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
										<DraggableMinimap />
									</ReactFlow>
								</DndContext>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
					<CommandPalette
						isOpen={isPaletteOpen}
						onClose={() => setPaletteOpen(false)}
						commands={paletteCommands}
					/>
				</ResizablePanel>
				<ResizableHandle />
				{/* Right side: full-height Properties Panel */}
				<ResizablePanel
					defaultSize={30}
					minSize={20}
					className='border-l border-border bg-background overflow-auto'
				>
					<PropertiesPanel
						node={selectedNode}
						onParamChange={handleParamChange}
						onLabelChange={handleLabelChange}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}

export default NodeGraphEditor;
