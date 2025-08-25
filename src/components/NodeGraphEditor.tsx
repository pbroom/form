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
	ConnectionLineType,
} from '@xyflow/react';
import type {GraphParameterValue} from '@/lib/ir/types';
import '@xyflow/react/dist/style.css';
import CustomNode, {NodeData} from './Node';
import DraggableMinimap from './DraggableMinimap';
import Viewport, {type ViewGraphState} from './Viewport';
import {useEffect, useRef, useState} from 'react';
import CommandPalette from './CommandPalette';
import PropertiesPanel from './PropertiesPanel';
import CodeViewPanel from './CodeViewPanel';
import CodeExportModal from './CodeExportModal';
import ParameterConnectionOverlay from './ParameterConnectionOverlay';
import CustomEdge from './Edge';
// import DynamicEdge from './DynamicEdge'; // Uncomment to use dynamic edge
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
import {validateCodeNodeSource} from '@/lib/validation/code-node';
import GhostWireOverlay from './GhostWireOverlay';
import {useConnectionStore} from '@/store/connection';
import {extractFunctionParams} from '@/lib/code/code-parse';
// Adapter imports removed (using curated list)

// Define nodeTypes outside the component to prevent re-renders
const nodeTypes: NodeTypes = {
	custom: CustomNode,
};

// Define edgeTypes for custom edge rendering
const edgeTypes = {
	default: CustomEdge, // Use our custom edge with centered connections
	// dynamic: DynamicEdge,  // Uncomment to use cursor-following edges
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
		id: 'code-1',
		type: 'custom',
		data: {typeKey: 'code', label: 'Code', params: {}},
		position: {x: 320, y: -60},
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
	const [codeByNodeId, setCodeByNodeId] = useState<Record<string, string>>({});
	const [codeValidationMessage, setCodeValidationMessage] = useState<
		string | null
	>(null);

	// Connection workflow store
	// token accessed via getToken()
	const pendingFrom = useConnectionStore((s) => s.pendingFrom);
	const sourceNodeId = useConnectionStore((s) => s.sourceNodeId);
	const sourceHandle = useConnectionStore((s) => s.sourceHandle);
	const startPoint = useConnectionStore((s) => s.startPoint);
	const cursorPoint = useConnectionStore((s) => s.cursorPoint);
	const targetNodeId = useConnectionStore((s) => s.targetNodeId);
	const targetPosition = useConnectionStore((s) => s.targetPosition);
	// didMove is used internally by the store
	const startSource = useConnectionStore((s) => s.startSource);
	const startTarget = useConnectionStore((s) => s.startTarget);
	const hoverTarget = useConnectionStore((s) => s.hoverTarget);
	const moveCursor = useConnectionStore((s) => s.moveCursor);
	const endDrag = useConnectionStore((s) => s.endDrag);
	const cancel = useConnectionStore((s) => s.cancel);
	const resetPending = useConnectionStore((s) => s.reset);
	const getToken = useConnectionStore((s) => s.getToken);

	// Ref to overlay container for coordinate mapping
	const editorContainerRef = useRef<HTMLDivElement | null>(null);
	// useConnectionStore#getToken provides a monotonic token

	// Validation state
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
		[]
	);

	// Handle smart connection workflow
	const onConnectionStart: OnConnectStart = (event, params) => {
		// If a pending source already exists, ignore further starts until cancel/complete
		if (sourceNodeId) return;
		let sourceCenter: {x: number; y: number} | undefined;
		try {
			const nodeId = String(params.nodeId || '');
			const container = editorContainerRef.current || document;
			const nodeEl = container.querySelector(
				`[data-testid^="node-"][data-testid$="-${nodeId}"]`
			) as HTMLElement | null;
			const handleEl = nodeEl
				? (nodeEl.querySelector(
						'[data-testid="handle-source"]'
				  ) as HTMLElement | null)
				: null;
			const rect = (
				handleEl || (event?.target as HTMLElement)
			)?.getBoundingClientRect?.();
			if (rect) {
				sourceCenter = {
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2,
				};
			}
		} catch {
			/* ignore */
		}

		startSource(
			params.nodeId || '',
			params.handleId || null,
			sourceCenter ?? {x: 0, y: 0}
		);
	};

	const onConnectionEnd = () => {
		// End of drag: if the user actually dragged (moved), clear pending
		endDrag();
	};

	const onNodeMouseEnter = (event: React.MouseEvent, node: Node<NodeData>) => {
		if (sourceNodeId && sourceNodeId !== node.id) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			// Use screen coordinates directly for the overlay positioning
			const screenPosition = {
				x: rect.left,
				y: rect.top,
			};

			hoverTarget(node.id, screenPosition);
		}
	};

	const onNodeMouseLeave = () => {
		if (pendingFrom) resetPending();
	};

	const onParameterSelect = (parameterKey: string) => {
		if (sourceNodeId && targetNodeId) {
			const sourceNode = nodes.find((n) => n.id === sourceNodeId);
			const targetNode = nodes.find((n) => n.id === targetNodeId);

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
					if (sourceNodeId === targetNodeId) {
						console.warn('Self-connections are not allowed');
						return;
					}

					// Create the connection without an edge label (UX: labels belong to handles)
					const params: Connection = {
						source: sourceNodeId,
						target: targetNodeId,
						sourceHandle: sourceHandle || null,
						targetHandle: parameterKey,
					};

					setEdges((eds) => addEdge(params, eds));
				}
			}
		}

		resetPending();
	};

	const onCancelConnection = () => {
		resetPending();
	};

	// Track cursor and allow ESC to cancel while waiting for second click
	useEffect(() => {
		if (!pendingFrom) return;
		const onMove = (e: MouseEvent) => {
			moveCursor({x: e.clientX, y: e.clientY});
		};
		const onUp = () => {
			endDrag();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				cancel();
			}
		};
		window.addEventListener('mousemove', onMove, {capture: true});
		window.addEventListener('mouseup', onUp, {capture: true});
		window.addEventListener('keydown', onKey, {capture: true});
		return () => {
			window.removeEventListener('mousemove', onMove, {
				capture: true,
			} as AddEventListenerOptions);
			window.removeEventListener('mouseup', onUp, {
				capture: true,
			} as AddEventListenerOptions);
			window.removeEventListener('keydown', onKey, {
				capture: true,
			} as AddEventListenerOptions);
		};
	}, [pendingFrom, moveCursor, endDrag, cancel]);

	// Start pending connection on source handle mousedown (supports click→click)
	useEffect(() => {
		const onSourceDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			// Only when not already pending
			if (sourceNodeId) return;
			const handleEl = target.closest(
				'[data-testid="handle-source"]'
			) as HTMLElement | null;
			if (!handleEl) return;
			const nodeEl = handleEl.closest('[data-node-id]') as HTMLElement | null;
			if (!nodeEl) return;
			const nodeId = nodeEl.getAttribute('data-node-id') || '';
			if (!nodeId) return;
			const rect = handleEl.getBoundingClientRect();
			const center = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			};
			startSource(nodeId, null, center);
		};
		window.addEventListener('mousedown', onSourceDown, {capture: true});
		return () =>
			window.removeEventListener('mousedown', onSourceDown, {
				capture: true,
			} as AddEventListenerOptions);
	}, [sourceNodeId, startSource]);

	// Start pending from target handle (click→click starting at input)
	useEffect(() => {
		const onTargetDownStart = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			if (sourceNodeId) return; // already pending
			const handleParamEl = target.closest(
				'[data-testid^="handle-target-param-"]'
			) as HTMLElement | null;
			const handleGenericEl = target.closest(
				'[data-testid="handle-target-generic"]'
			) as HTMLElement | null;
			const handleEl = handleParamEl || handleGenericEl;
			if (!handleEl) return;
			const nodeEl = handleEl.closest('[data-node-id]') as HTMLElement | null;
			if (!nodeEl) return;
			const nodeId = nodeEl.getAttribute('data-node-id') || '';
			if (!nodeId) return;
			const rect = handleEl.getBoundingClientRect();
			const center = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			};
			const paramMatch = handleParamEl
				?.getAttribute('data-testid')
				?.match(/^handle-target-param-(.+)$/);
			const startHandle = paramMatch
				? paramMatch[1]
				: handleGenericEl
				? '__new__'
				: undefined;
			startTarget(nodeId, startHandle ?? null, center, {
				x: rect.left,
				y: rect.top,
			});
		};
		window.addEventListener('mousedown', onTargetDownStart, {capture: true});
		return () =>
			window.removeEventListener('mousedown', onTargetDownStart, {
				capture: true,
			} as AddEventListenerOptions);
	}, [sourceNodeId, startTarget]);

	// Click→click: when pending and the user clicks a target handle, connect or open chooser
	useEffect(() => {
		if (!sourceNodeId) return;
		const onClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			// Ignore if a newer cancel token has been issued
			const myToken = getToken();
			if (myToken === getToken()) {
				const handleParamEl = target.closest(
					'[data-testid^="handle-target-param-"]'
				) as HTMLElement | null;
				const handleGenericEl = target.closest(
					'[data-testid="handle-target-generic"]'
				) as HTMLElement | null;
				const handleEl = handleParamEl || handleGenericEl;
				if (!handleEl) return;
				const nodeEl = handleEl.closest('[data-node-id]') as HTMLElement | null;
				if (!nodeEl) return;
				const nodeId = nodeEl.getAttribute('data-node-id') || '';
				if (!sourceNodeId || nodeId === sourceNodeId) return;
				// If clicking a concrete param handle, connect immediately
				const paramMatch = handleParamEl
					?.getAttribute('data-testid')
					?.match(/^handle-target-param-(.+)$/);
				const paramKey = paramMatch ? paramMatch[1] : undefined;
				if (paramKey) {
					const params: Connection = {
						source: sourceNodeId,
						target: nodeId,
						sourceHandle: sourceHandle ?? null,
						targetHandle: paramKey,
					};
					if (myToken === getToken()) setEdges((eds) => addEdge(params, eds));
					resetPending();
				} else {
					// Generic handle: position chooser overlay
					const rect = nodeEl.getBoundingClientRect();
					hoverTarget(nodeId, {x: rect.left, y: rect.top});
				}
				e.preventDefault();
				e.stopPropagation();
			}
		};
		const onMouseDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			const handleEl = target.closest(
				'[data-testid^="handle-target-"]'
			) as HTMLElement | null;
			if (!handleEl) return;
			const nodeEl = handleEl.closest('[data-node-id]') as HTMLElement | null;
			if (!nodeEl) return;
			const nodeId = nodeEl.getAttribute('data-node-id') || '';
			if (!nodeId || nodeId === sourceNodeId) return;
			const hRect = handleEl.getBoundingClientRect();
			// Anchor overlay near the handle
			hoverTarget(nodeId, {x: hRect.left, y: hRect.top});
			e.preventDefault();
			e.stopPropagation();
		};
		window.addEventListener('click', onClick, {capture: true});
		window.addEventListener('mousedown', onMouseDown, {capture: true});
		return () => {
			window.removeEventListener('click', onClick, {
				capture: true,
			} as AddEventListenerOptions);
			window.removeEventListener('mousedown', onMouseDown, {
				capture: true,
			} as AddEventListenerOptions);
		};
	}, [
		sourceNodeId,
		sourceHandle,
		getToken,
		setEdges,
		resetPending,
		hoverTarget,
	]);

	// Click→click: when pending from target, clicking a source handle should connect
	useEffect(() => {
		if (pendingFrom !== 'target') return;
		const onSourceClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			const myToken = getToken();
			const handleEl = target.closest(
				'[data-testid="handle-source"]'
			) as HTMLElement | null;
			if (!handleEl) return;
			const nodeEl = handleEl.closest('[data-node-id]') as HTMLElement | null;
			if (!nodeEl) return;
			const sourceId = nodeEl.getAttribute('data-node-id') || '';
			if (!sourceId || !targetNodeId) return;
			let targetHandle: string | null = null;
			if (!targetHandle || targetHandle === '__new__') {
				const def = getNodeDefinition(
					String(nodes.find((n) => n.id === targetNodeId)?.data.typeKey || '')
				);
				if (def && def.parameters?.length) {
					const alreadyConnectedKeys = edges
						.filter(
							(e2) => e2.target === targetNodeId && Boolean(e2.targetHandle)
						)
						.map((e2) => String(e2.targetHandle));
					const nextParam = def.parameters.find(
						(p) => !alreadyConnectedKeys.includes(p.key)
					);
					if (nextParam) targetHandle = nextParam.key;
				}
			}
			const params: Connection = {
				source: sourceId,
				target: targetNodeId,
				sourceHandle: null,
				targetHandle: targetHandle ?? null,
			};
			if (myToken === getToken()) setEdges((eds) => addEdge(params, eds));
			resetPending();
			e.preventDefault();
			e.stopPropagation();
		};
		window.addEventListener('click', onSourceClick, {capture: true});
		return () =>
			window.removeEventListener('click', onSourceClick, {
				capture: true,
			} as AddEventListenerOptions);
	}, [
		nodes,
		edges,
		setEdges,
		sourceNodeId,
		targetNodeId,
		getToken,
		resetPending,
	]);

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
			const next = addEdge({...params, targetHandle}, eds);
			// Clear pending state once a connection is created (drag complete)
			resetPending();
			return next;
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

	const addCodeNode = () => {
		const newId = `code-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newId,
			type: 'custom',
			data: {
				typeKey: 'code',
				label: 'Code',
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
		// Initialize default code template
		const template = `export function node(a: number, b: number): number {\n  return a + b;\n}`;
		setCodeByNodeId((prev) => ({...prev, [newId]: prev[newId] ?? template}));
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
			if (type === 'code') {
				// Inputs will be derived from code in a future step; for now, output is undefined
				return undefined;
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
		{id: 'new-code', label: 'Insert Code Node', action: addCodeNode},
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

	// Debounced validation for code view
	useEffect(() => {
		const isCodeNode = selectedNode?.data?.typeKey === 'code';
		if (!isCodeNode) {
			setCodeValidationMessage(null);
			return;
		}
		// Ensure an existing code node has the default template if empty
		const defaultTemplate = `export function node(a: number, b: number): number {\n  return a + b;\n}`;
		if (selectedNode && !codeByNodeId[selectedNode.id]) {
			setCodeByNodeId((prev) => ({
				...prev,
				[selectedNode.id]: defaultTemplate,
			}));
		}
		const current = selectedNode
			? codeByNodeId[selectedNode.id] ?? defaultTemplate
			: defaultTemplate;
		const handle = setTimeout(() => {
			const res = validateCodeNodeSource(current);
			setCodeValidationMessage(res.ok ? null : res.message || 'Invalid code');
			if (res.ok && selectedNode) {
				const parsed = extractFunctionParams(current);
				if (parsed.ok) {
					// attach dynamic params to node data
					setNodes((prev) =>
						prev.map((n) =>
							n.id === selectedNode.id
								? ({
										...n,
										data: {
											...n.data,
											dynamicParams: parsed.params.map((p) => ({
												key: p.key,
												label: p.key,
												type: p.type,
											})),
										},
								  } as Node<NodeData>)
								: n
						)
					);
				}
			}
		}, 250);
		return () => clearTimeout(handle);
	}, [
		codeByNodeId,
		selectedNode,
		selectedNode?.id,
		selectedNode?.data?.typeKey,
		setNodes,
	]);

	return (
		<div className='w-full h-full'>
			<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
				{/* Left side: vertical split with viewport (top) and editor (bottom) */}
				<ResizablePanel defaultSize={60} minSize={40} className='relative'>
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
							<div className='relative h-full w-full' ref={editorContainerRef}>
								<DndContext>
									<ReactFlow
										nodes={nodes}
										edges={edges}
										nodeTypes={nodeTypes}
										edgeTypes={edgeTypes}
										onNodesChange={onNodesChange}
										onEdgesChange={onEdgesChange}
										onConnect={onConnect}
										onConnectStart={onConnectionStart}
										onConnectEnd={onConnectionEnd}
										onNodeMouseEnter={onNodeMouseEnter}
										onNodeMouseLeave={onNodeMouseLeave}
										connectionLineType={ConnectionLineType.Bezier}
										connectionLineStyle={{
											strokeDasharray: '6 6',
											opacity: 0.4,
											strokeWidth: 2,
										}}
										defaultEdgeOptions={{type: 'default'}}
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

									{/* Ghost wire overlay (pending connection) */}
									{startPoint && cursorPoint ? (
										<GhostWireOverlay
											containerRef={
												editorContainerRef as React.RefObject<HTMLDivElement | null>
											}
											start={startPoint}
											end={cursorPoint}
										/>
									) : null}

									{/* Parameter connection overlay */}
									{targetNodeId && targetPosition && (
										<ParameterConnectionOverlay
											nodeData={
												nodes.find((n) => n.id === targetNodeId)?.data || {
													typeKey: 'unknown',
												}
											}
											nodePosition={targetPosition}
											connectedParameters={edges
												.filter(
													(e) => e.target === targetNodeId && e.targetHandle
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
				{/* Right side: full-height Code View (left) + Properties (right) */}
				<ResizablePanel
					defaultSize={40}
					minSize={30}
					className='border-l border-border bg-background overflow-hidden'
				>
					<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
						<ResizablePanel
							defaultSize={60}
							minSize={20}
							className='overflow-auto'
						>
							<CodeViewPanel
								node={selectedNode}
								value={selectedNode ? codeByNodeId[selectedNode.id] ?? '' : ''}
								onChange={(val) => {
									if (selectedNode) {
										setCodeByNodeId((prev) => ({
											...prev,
											[selectedNode.id]: val,
										}));
									}
								}}
								validationMessage={codeValidationMessage}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel
							defaultSize={40}
							minSize={40}
							className='overflow-auto'
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
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}

export default NodeGraphEditor;
