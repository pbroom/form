import {
	ReactFlow,
	Node,
	Edge,
	addEdge,
	Connection,
	useNodesState,
	useEdgesState,
	NodeTypes,
	type OnConnectStart,
} from '@xyflow/react';
import type {GraphParameterValue} from '@/lib/ir/types';
import '@xyflow/react/dist/style.css';
import CustomNode, {NodeData} from './Node';
import DraggableMinimap from './DraggableMinimap';
import Viewport, {type ViewGraphState} from './Viewport';
import {useEffect, useState} from 'react';
import CommandPalette from './CommandPalette';
import PropertiesPanel from './PropertiesPanel';
import CodeExportModal from './CodeExportModal';
import ParameterConnectionOverlay from './ParameterConnectionOverlay';
import {
	validateConnection,
	validateParameterValue,
} from '@/lib/validation/graph-validation';
import type {ValidationError} from '@/lib/node-registry';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import {DndContext} from '@dnd-kit/core';
import {getNodeDefinition} from '@/lib/node-registry';
// Adapter imports removed (using curated list)

// Define nodeTypes outside the component to prevent re-renders
const nodeTypes: NodeTypes = {
	custom: CustomNode,
};

const curatedAdapterList = [
	{key: 'ambientLight', label: 'AmbientLight'},
	{key: 'directionalLight', label: 'DirectionalLight'},
	{key: 'orbitControls', label: 'OrbitControls'},
	{key: 'mesh', label: 'Mesh'},
	{key: 'sphere', label: 'Sphere'},
	{key: 'numberConst', label: 'Number'},
	{key: 'colorConst', label: 'Color'},
	{key: 'booleanConst', label: 'Boolean'},
	{key: 'stringConst', label: 'String'},
	{key: 'add', label: 'Add'},
	{key: 'multiply', label: 'Multiply'},
];

const initialNodes: Node<NodeData>[] = [
	{
		id: 'render',
		type: 'custom',
		data: {typeKey: 'render', label: 'Render'},
		position: {x: 560, y: 25},
	},
	{
		id: 'scene',
		type: 'custom',
		data: {typeKey: 'scene', label: 'Scene'},
		position: {x: 320, y: 25},
	},
	{
		id: 'box-1',
		type: 'custom',
		data: {
			typeKey: 'box',
			label: 'Box',
			params: {width: 1, height: 1, depth: 1, color: '#4f46e5'},
		},
		position: {x: 80, y: 25},
	},
];

const initialEdges: Edge[] = [
	// Connect scene to render so something shows by default
	{
		id: 'scene-to-render',
		source: 'scene',
		target: 'render',
		targetHandle: 'input',
	},
	// Connect box to scene for a complete working example
	{
		id: 'box-to-scene',
		source: 'box-1',
		target: 'scene',
		targetHandle: 'input',
	},
];

function NodeGraphEditor() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<NodeData>>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [isPaletteOpen, setPaletteOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [isExportOpen, setExportOpen] = useState(false);

	// Smart connection workflow state
	const [connectionMode, setConnectionMode] = useState<{
		sourceNodeId: string;
		sourceHandle?: string;
		targetNodeId?: string;
		targetPosition?: {x: number; y: number};
	} | null>(null);

	// Validation state
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
		[]
	);

	// Handle smart connection workflow
	const onConnectionStart: OnConnectStart = (_event, params) => {
		setConnectionMode({
			sourceNodeId: params.nodeId || '',
			sourceHandle: params.handleId || undefined,
		});
	};

	const onConnectionEnd = () => {
		// Reset connection mode if connection wasn't completed
		setConnectionMode(null);
	};

	const onNodeMouseEnter = (event: React.MouseEvent, node: Node<NodeData>) => {
		if (connectionMode && connectionMode.sourceNodeId !== node.id) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			// Use screen coordinates directly for the overlay positioning
			const screenPosition = {
				x: rect.left,
				y: rect.top,
			};

			setConnectionMode((prev) =>
				prev
					? {
							...prev,
							targetNodeId: node.id,
							targetPosition: screenPosition,
					  }
					: null
			);
		}
	};

	const onNodeMouseLeave = () => {
		if (connectionMode) {
			setConnectionMode((prev) =>
				prev
					? {
							...prev,
							targetNodeId: undefined,
							targetPosition: undefined,
					  }
					: null
			);
		}
	};

	const onParameterSelect = (parameterKey: string) => {
		if (connectionMode && connectionMode.targetNodeId) {
			const sourceNode = nodes.find(
				(n) => n.id === connectionMode.sourceNodeId
			);
			const targetNode = nodes.find(
				(n) => n.id === connectionMode.targetNodeId
			);

			if (sourceNode && targetNode) {
				// Validate the connection before creating it
				const validationError = validateConnection(
					sourceNode,
					targetNode,
					parameterKey
				);

				if (validationError) {
					// Show validation error
					setValidationErrors((prev) => [...prev, validationError]);
					console.warn(
						'Connection validation failed:',
						validationError.message
					);
				} else {
					// Prevent self-connections
					if (connectionMode.sourceNodeId === connectionMode.targetNodeId) {
						console.warn('Self-connections are not allowed');
						return;
					}

					// Create the connection without an edge label (UX: labels belong to handles)
					const params: Connection = {
						source: connectionMode.sourceNodeId,
						target: connectionMode.targetNodeId,
						sourceHandle: connectionMode.sourceHandle || null,
						targetHandle: parameterKey,
					};

					setEdges((eds) => addEdge(params, eds));
				}
			}
		}

		setConnectionMode(null);
	};

	const onCancelConnection = () => {
		setConnectionMode(null);
	};

	const onConnect = (params: Connection) =>
		setEdges((eds) => {
			// Prevent self-connections
			if (params.source === params.target) {
				console.warn('Self-connections are not allowed');
				return eds;
			}

			// If connecting to the generic "new" handle or no handle, pick the first available parameter
			let targetHandle = params.targetHandle;
			if (!targetHandle || targetHandle === '__new__') {
				const targetNode = nodes.find((n) => n.id === params.target);
				if (targetNode) {
					const def = getNodeDefinition(String(targetNode.data.typeKey));
					if (def && def.parameters?.length) {
						const alreadyConnectedKeys = eds
							.filter(
								(e) => e.target === params.target && Boolean(e.targetHandle)
							)
							.map((e) => String(e.targetHandle));
						const nextParam = def.parameters.find(
							(p) => !alreadyConnectedKeys.includes(p.key)
						);
						if (nextParam) {
							targetHandle = nextParam.key;
						} else {
							// No available parameter; skip creating the edge
							return eds;
						}
					} else {
						// No parameters defined; skip
						return eds;
					}
				}
			}
			return addEdge({...params, targetHandle}, eds);
		});

	const connectProgrammatically = (sourceId: string, targetId: string) => {
		onConnect({
			source: sourceId,
			target: targetId,
			sourceHandle: null,
			targetHandle: '__new__',
		});
	};

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
		setNodes((nds) =>
			nds
				.map((n) => ({...n, selected: false} as Node<NodeData>))
				.concat({...newNode, selected: true} as Node<NodeData>)
		);
		// Select the newly created node
		setSelectedNodeId(newId);
		// Do not auto-connect new nodes to the scene
	};

	const addRenderNode = () => {
		const newId = `render-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {
				typeKey: 'render',
				label: 'Render',
				params: {},
			},
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
		setNodes((nds) =>
			nds
				.map((n) => ({...n, selected: false} as Node<NodeData>))
				.concat({...newNode, selected: true} as Node<NodeData>)
		);
		setSelectedNodeId(newId);
	};

	const addCameraNode = () => {
		const newId = `camera-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {
				typeKey: 'camera',
				label: 'Camera',
				params: {fov: 50},
			},
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
		setNodes((nds) =>
			nds
				.map((n) => ({...n, selected: false} as Node<NodeData>))
				.concat({...newNode, selected: true} as Node<NodeData>)
		);
		setSelectedNodeId(newId);
	};

	const handleParamChange = (nodeId: string, key: string, value: unknown) => {
		// Validate parameter value before applying
		const node = nodes.find((n) => n.id === nodeId);
		if (node) {
			const def = getNodeDefinition(node.data.typeKey);
			const paramDef = def?.parameters?.find((p) => p.key === key);

			if (paramDef) {
				const validationError = validateParameterValue(value, paramDef);
				if (validationError) {
					validationError.nodeId = nodeId;
					setValidationErrors((prev) => {
						// Remove any existing error for this parameter
						const filtered = prev.filter(
							(e) => !(e.nodeId === nodeId && e.parameterKey === key)
						);
						return [...filtered, validationError];
					});
					console.warn('Parameter validation failed:', validationError.message);
					return; // Don't apply invalid value
				} else {
					// Clear any existing validation error for this parameter
					setValidationErrors((prev) =>
						prev.filter((e) => !(e.nodeId === nodeId && e.parameterKey === key))
					);
				}
			}
		}

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

	// Keyboard shortcuts: Q for node palette, Cmd+K/Cmd+/ for command palette
	useEffect(() => {
		const isTextInput = (el: EventTarget | null) => {
			if (!(el instanceof HTMLElement)) return false;
			const tag = el.tagName.toLowerCase();
			return tag === 'input' || tag === 'textarea' || el.isContentEditable;
		};
		const onKey = (e: KeyboardEvent) => {
			// Node palette with Q key (focused on node insertion)
			if (
				e.key.toLowerCase() === 'q' &&
				!e.metaKey &&
				!e.ctrlKey &&
				!isTextInput(e.target)
			) {
				e.preventDefault();
				e.stopPropagation();
				setPaletteOpen(true);
			}
			// Command palette with Cmd+K or Cmd+/ (all commands)
			if (
				(e.key.toLowerCase() === 'k' || e.key === '/') &&
				(e.metaKey || e.ctrlKey) &&
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

	// Convert current graph to IR for viewport rendering
	const viewState: ViewGraphState = (() => {
		// Compute effective parameters with edge-driven value flow (e.g., constants → params)
		const nodeMap = new Map(nodes.map((n) => [n.id, n] as const));
		const effectiveParamsByNode = new Map<
			string,
			Record<string, GraphParameterValue>
		>();

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
					(
						source.data.params as
							| Record<string, GraphParameterValue>
							| undefined
					)?.value ?? null;
			} else if (sourceType === 'add' || sourceType === 'multiply') {
				// Use the recursive getNodeOutput function for math nodes
				value = getNodeOutput(source.id);
			}

			if (value !== undefined) {
				targetParams[e.targetHandle] = value;
			}
		}
		// Create IR module from current nodes and edges
		const irNodes = nodes.map((n) => ({
			id: n.id,
			typeKey: String(n.data.typeKey),
			label: String(n.data.label || ''),
			params: (effectiveParamsByNode.get(n.id) ||
				((n.data.params || {}) as Record<
					string,
					GraphParameterValue
				>)) as Record<string, GraphParameterValue>,
		}));

		const irEdges = edges.map((e) => ({
			id: e.id,
			source: e.source,
			target: e.target,
			targetHandle: e.targetHandle || undefined,
		}));

		const irModule = {
			meta: {
				schemaVersion: '1.0.0',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			tree: {
				moduleName: 'LivePreview',
				rootType: 'r3f' as const,
			},
			graph: {
				nodes: irNodes,
				edges: irEdges,
			},
		};

		return {irModule};
	})();

	const adapterCommands = curatedAdapterList.map((d) => ({
		id: `new-${d.key}`,
		label: `Insert ${d.label}`,
		action: () => {
			const newId = `${d.key}-${Date.now()}`;
			const newNode: Node<NodeData> = {
				id: newId,
				type: 'custom',
				data: {typeKey: d.key, label: d.label},
				position: {x: Math.random() * 400, y: Math.random() * 400},
			};
			setNodes((nds) => nds.concat(newNode));
			setSelectedNodeId(newId);
		},
	}));

	const paletteCommands = [
		{id: 'new-box', label: 'Insert Box', action: addBoxNode},
		{id: 'new-render', label: 'Insert Render', action: addRenderNode},
		{id: 'new-camera', label: 'Insert Camera', action: addCameraNode},
		...adapterCommands,
		{
			id: 'export-code',
			label: 'Export Code',
			action: () => setExportOpen(true),
		},
		...(import.meta.env.MODE !== 'production'
			? [
					{
						id: 'connect-last-to-first-box',
						label: 'Connect last box → first box (test)',
						action: () => {
							const boxNodes = nodes.filter((n) => n.data.typeKey === 'box');
							if (boxNodes.length >= 2) {
								const first = boxNodes[0];
								const last = boxNodes[boxNodes.length - 1];
								connectProgrammatically(last.id, first.id);
							}
						},
					},
			  ]
			: []),
	];

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

	return (
		<div className='w-full h-full'>
			<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
				{/* Left side: vertical split with viewport (top) and editor (bottom) */}
				<ResizablePanel defaultSize={80} minSize={40} className='relative'>
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
										onConnectStart={onConnectionStart}
										onConnectEnd={onConnectionEnd}
										onNodeMouseEnter={onNodeMouseEnter}
										onNodeMouseLeave={onNodeMouseLeave}
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

									{/* Parameter connection overlay */}
									{connectionMode?.targetNodeId &&
										connectionMode.targetPosition && (
											<ParameterConnectionOverlay
												nodeData={
													nodes.find(
														(n) => n.id === connectionMode.targetNodeId
													)?.data || {typeKey: 'unknown'}
												}
												nodePosition={connectionMode.targetPosition}
												connectedParameters={edges
													.filter(
														(e) =>
															e.target === connectionMode.targetNodeId &&
															e.targetHandle
													)
													.map((e) => e.targetHandle!)}
												onParameterSelect={onParameterSelect}
												onCancel={onCancelConnection}
											/>
										)}
								</DndContext>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
					<CommandPalette
						isOpen={isPaletteOpen}
						onClose={() => setPaletteOpen(false)}
						commands={paletteCommands}
					/>
					<CodeExportModal
						isOpen={isExportOpen}
						onClose={() => setExportOpen(false)}
					/>
				</ResizablePanel>
				<ResizableHandle />
				{/* Right side: full-height Properties Panel */}
				<ResizablePanel
					defaultSize={20}
					minSize={20}
					className='border-l border-border bg-background overflow-auto'
				>
					<PropertiesPanel
						node={selectedNode}
						onParamChange={handleParamChange}
						onLabelChange={handleLabelChange}
						validationErrors={validationErrors.filter(
							(e) => e.nodeId === selectedNodeId
						)}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}

export default NodeGraphEditor;
