import {create} from 'zustand';

export type Point = {x: number; y: number};

type PendingFrom = 'source' | 'target' | null;

type ConnectionState = {
	token: number;
	pendingFrom: PendingFrom;
	sourceNodeId: string | null;
	sourceHandle: string | null;
	startPoint: Point | null;
	cursorPoint: Point | null;
	targetNodeId: string | null;
	targetPosition: Point | null;
	didMove: boolean;
	// actions
	startSource: (
		nodeId: string,
		handleId: string | null,
		startPoint: Point
	) => void;
	startTarget: (
		nodeId: string,
		handleId: string | null,
		startPoint: Point,
		overlayTopLeft: Point
	) => void;
	hoverTarget: (nodeId: string, overlayTopLeft: Point) => void;
	moveCursor: (p: Point) => void;
	endDrag: () => void;
	cancel: () => void;
	reset: () => void;
	getToken: () => number;
};

const initial: Omit<
	ConnectionState,
	| 'startSource'
	| 'startTarget'
	| 'hoverTarget'
	| 'moveCursor'
	| 'endDrag'
	| 'cancel'
	| 'reset'
	| 'getToken'
> = {
	token: 0,
	pendingFrom: null,
	sourceNodeId: null,
	sourceHandle: null,
	startPoint: null,
	cursorPoint: null,
	targetNodeId: null,
	targetPosition: null,
	didMove: false,
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
	...initial,
	startSource: (nodeId, handleId, startPoint) =>
		set({
			pendingFrom: 'source',
			sourceNodeId: nodeId,
			sourceHandle: handleId ?? null,
			startPoint,
			cursorPoint: startPoint,
			targetNodeId: null,
			targetPosition: null,
			didMove: false,
		}),
	startTarget: (nodeId, _handleId, startPoint, overlayTopLeft) =>
		set({
			pendingFrom: 'target',
			sourceNodeId: null,
			sourceHandle: null,
			startPoint,
			cursorPoint: startPoint,
			targetNodeId: nodeId,
			targetPosition: overlayTopLeft,
			didMove: false,
		}),
	hoverTarget: (nodeId, overlayTopLeft) => {
		if (get().pendingFrom === 'source') {
			set({targetNodeId: nodeId, targetPosition: overlayTopLeft});
		}
	},
	moveCursor: (p) =>
		set((s) => {
			const didMove = s.startPoint
				? s.didMove ||
				  Math.hypot(p.x - s.startPoint.x, p.y - s.startPoint.y) > 3
				: s.didMove;
			return {cursorPoint: p, didMove};
		}),
	endDrag: () =>
		set((s) => {
			if (s.pendingFrom === 'source' && s.didMove)
				return {...initial, token: s.token};
			return {...s};
		}),
	cancel: () => set((s) => ({...initial, token: s.token + 1})),
	reset: () => set((s) => ({...initial, token: s.token})),
	getToken: () => get().token,
}));
