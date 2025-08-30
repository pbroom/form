import type {Node} from '@xyflow/react';
import type {NodeData} from '@/components/Node';

// Mirrors the initial nodes defined in `NodeGraphEditor.tsx`
export const initialNodes: Node<NodeData>[] = [
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
		id: 'code-a',
		type: 'custom',
		data: {typeKey: 'code', label: 'Add 1', params: {}},
		position: {x: 220, y: -60},
	},
	{
		id: 'code-b',
		type: 'custom',
		data: {typeKey: 'code', label: 'Times 2', params: {}},
		position: {x: 420, y: -60},
	},
	{
		id: 'code-c',
		type: 'custom',
		data: {typeKey: 'code', label: 'Minus', params: {}},
		position: {x: 620, y: -60},
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
