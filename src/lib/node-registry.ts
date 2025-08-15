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
	// Connection type compatibility
	acceptsConnections?: boolean; // Can this parameter accept connections from other nodes?
	outputType?: 'number' | 'string' | 'boolean' | 'color' | 'any'; // What type does this node output?
};

export type ValidationError = {
	type: 'type-mismatch' | 'out-of-range' | 'invalid-connection';
	message: string;
	nodeId?: string;
	parameterKey?: string;
	sourceNodeId?: string;
	targetNodeId?: string;
};

export type NodeTypeDefinition = {
	key: string;
	label: string;
	category: 'scene' | 'geometry' | 'material' | 'mesh' | 'light' | 'utility';
	parameters: NodeParameterDefinition[];
	// For now, a simple tag that informs appearance rules
	appearanceHint?: 'structure' | 'material' | 'light' | 'utility';
	// What type of value does this node output when used as a source?
	outputType?:
		| 'number'
		| 'string'
		| 'boolean'
		| 'color'
		| 'mesh'
		| 'geometry'
		| 'material'
		| 'light'
		| 'scene'
		| 'any';
};

const BASE_NODE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
	render: {
		key: 'render',
		label: 'Render',
		category: 'scene',
		parameters: [
			{
				key: 'input',
				label: 'Input',
				type: 'string',
				defaultValue: '',
				acceptsConnections: true,
			},
		],
		appearanceHint: 'structure',
		outputType: 'scene',
	},
	camera: {
		key: 'camera',
		label: 'Camera',
		category: 'scene',
		parameters: [
			{
				key: 'fov',
				label: 'Field of View',
				type: 'number',
				defaultValue: 50,
				min: 10,
				max: 120,
				step: 1,
			},
		],
		appearanceHint: 'structure',
	},
	scene: {
		key: 'scene',
		label: 'Scene',
		category: 'scene',
		parameters: [
			{
				key: 'input',
				label: 'Input',
				type: 'string',
				defaultValue: '',
			},
		],
		appearanceHint: 'structure',
	},
	box: {
		key: 'box',
		label: 'Box',
		category: 'mesh',
		appearanceHint: 'structure',
		outputType: 'mesh',
		parameters: [
			{
				key: 'width',
				label: 'Width',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
				acceptsConnections: true,
			},
			{
				key: 'height',
				label: 'Height',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
				acceptsConnections: true,
			},
			{
				key: 'depth',
				label: 'Depth',
				type: 'number',
				defaultValue: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
				acceptsConnections: true,
			},
			{
				key: 'color',
				label: 'Color',
				type: 'color',
				defaultValue: '#4f46e5',
				acceptsConnections: true,
			},
			{
				key: 'metalness',
				label: 'Metalness',
				type: 'number',
				defaultValue: 0,
				min: 0,
				max: 1,
				step: 0.01,
				acceptsConnections: true,
			},
			{
				key: 'roughness',
				label: 'Roughness',
				type: 'number',
				defaultValue: 0.5,
				min: 0,
				max: 1,
				step: 0.01,
				acceptsConnections: true,
			},
			{
				key: 'wireframe',
				label: 'Wireframe',
				type: 'boolean',
				defaultValue: false,
				acceptsConnections: true,
			},
		],
	},
	numberConst: {
		key: 'numberConst',
		label: 'Number',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'number',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'number',
				defaultValue: 1,
				min: -1000000,
				max: 1000000,
				step: 0.01,
				acceptsConnections: false,
			},
		],
	},
	colorConst: {
		key: 'colorConst',
		label: 'Color',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'color',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'color',
				defaultValue: '#4f46e5',
				acceptsConnections: false,
			},
		],
	},
	booleanConst: {
		key: 'booleanConst',
		label: 'Boolean',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'boolean',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'boolean',
				defaultValue: false,
				acceptsConnections: false,
			},
		],
	},
	stringConst: {
		key: 'stringConst',
		label: 'String',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'string',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'string',
				defaultValue: '',
				acceptsConnections: false,
			},
		],
	},
	// Primitive constants
	numberConst: {
		key: 'numberConst',
		label: 'Number',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'number',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'number',
				defaultValue: 1,
				min: -1000000,
				max: 1000000,
				step: 0.01,
				acceptsConnections: false,
			},
		],
	},
	colorConst: {
		key: 'colorConst',
		label: 'Color',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'color',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'color',
				defaultValue: '#4f46e5',
				acceptsConnections: false,
			},
		],
	},
	booleanConst: {
		key: 'booleanConst',
		label: 'Boolean',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'boolean',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'boolean',
				defaultValue: false,
				acceptsConnections: false,
			},
		],
	},
	stringConst: {
		key: 'stringConst',
		label: 'String',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'string',
		parameters: [
			{
				key: 'value',
				label: 'Value',
				type: 'string',
				defaultValue: '',
				acceptsConnections: false,
			},
		],
	},
	// Basic math transforms (number)
	add: {
		key: 'add',
		label: 'Add',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'number',
		parameters: [
			{
				key: 'a',
				label: 'A',
				type: 'number',
				defaultValue: 0,
				acceptsConnections: true,
			},
			{
				key: 'b',
				label: 'B',
				type: 'number',
				defaultValue: 0,
				acceptsConnections: true,
			},
		],
	},
	multiply: {
		key: 'multiply',
		label: 'Multiply',
		category: 'utility',
		appearanceHint: 'utility',
		outputType: 'number',
		parameters: [
			{
				key: 'a',
				label: 'A',
				type: 'number',
				defaultValue: 1,
				acceptsConnections: true,
			},
			{
				key: 'b',
				label: 'B',
				type: 'number',
				defaultValue: 1,
				acceptsConnections: true,
			},
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
