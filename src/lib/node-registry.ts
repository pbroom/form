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

export const NODE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
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

export type NodeParameterValues = Record<string, unknown>;

export function getNodeDefinition(
	typeKey: string
): NodeTypeDefinition | undefined {
	return NODE_DEFINITIONS[typeKey];
}
