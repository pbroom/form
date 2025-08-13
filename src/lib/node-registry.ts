import dreiRegistry from '@/generated/drei.registry.json';
import {AdapterRegistrySchema} from '@/lib/adapters/schema';
import {mapAdapterToNodeDefinitions} from '@/lib/adapters/mapper';
export type NodeParameterDefinition = {
	key: string;
	label: string;
	type: 'number' | 'color' | 'string' | 'boolean';
	defaultValue: unknown;
	min?: number;
	max?: number;
	step?: number;
};

export type NodeTypeDefinition = {
	key: string;
	label: string;
	category: 'scene' | 'geometry' | 'material' | 'mesh' | 'light' | 'utility';
	parameters: NodeParameterDefinition[];
	// For now, a simple tag that informs appearance rules
	appearanceHint?: 'structure' | 'material' | 'light' | 'utility';
};

let BASE_NODE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
	scene: {
		key: 'scene',
		label: 'Scene',
		category: 'scene',
		parameters: [],
		appearanceHint: 'structure',
	},
	box: {
		key: 'box',
		label: 'Box',
		category: 'mesh',
		appearanceHint: 'structure',
		parameters: [
			{
				key: 'width',
				label: 'Width',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
			},
			{
				key: 'height',
				label: 'Height',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
			},
			{
				key: 'depth',
				label: 'Depth',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
			},
			{key: 'color', label: 'Color', type: 'color', defaultValue: '#4f46e5'},
		],
	},
};

// Merge adapter registry statically at module load for determinism
const parsed = AdapterRegistrySchema.safeParse(
	(dreiRegistry as any)?.default ?? (dreiRegistry as any)
);
let NODE_DEFINITIONS: Record<string, NodeTypeDefinition> =
	BASE_NODE_DEFINITIONS;
if (parsed.success) {
	const mapped = mapAdapterToNodeDefinitions(parsed.data);
	NODE_DEFINITIONS = {...BASE_NODE_DEFINITIONS, ...mapped};
}

export type NodeParameterValues = Record<string, unknown>;

export function getNodeDefinition(
	typeKey: string
): NodeTypeDefinition | undefined {
	return NODE_DEFINITIONS[typeKey];
}

export function getAllNodeDefinitions(): Record<string, NodeTypeDefinition> {
	return NODE_DEFINITIONS;
}
