import {Node, Edge} from '@xyflow/react';
import {
	getNodeDefinition,
	type ValidationError,
	type NodeTypeDefinition,
} from '@/lib/node-registry';
import type {NodeData} from '@/components/Node';

/**
 * Validates parameter values against their definitions
 */
export function validateParameterValue(
	value: unknown,
	paramDef: import('@/lib/node-registry').NodeParameterDefinition
): ValidationError | null {
	// Type validation
	if (paramDef.type === 'number') {
		const num = Number(value);
		if (isNaN(num)) {
			return {
				type: 'type-mismatch',
				message: `Expected number, got ${typeof value}`,
				parameterKey: paramDef.key,
			};
		}

		// Range validation
		if (paramDef.min !== undefined && num < paramDef.min) {
			return {
				type: 'out-of-range',
				message: `Value ${num} is below minimum ${paramDef.min}`,
				parameterKey: paramDef.key,
			};
		}

		if (paramDef.max !== undefined && num > paramDef.max) {
			return {
				type: 'out-of-range',
				message: `Value ${num} is above maximum ${paramDef.max}`,
				parameterKey: paramDef.key,
			};
		}
	} else if (paramDef.type === 'boolean') {
		if (typeof value !== 'boolean') {
			return {
				type: 'type-mismatch',
				message: `Expected boolean, got ${typeof value}`,
				parameterKey: paramDef.key,
			};
		}
	} else if (paramDef.type === 'string') {
		if (typeof value !== 'string') {
			return {
				type: 'type-mismatch',
				message: `Expected string, got ${typeof value}`,
				parameterKey: paramDef.key,
			};
		}
	} else if (paramDef.type === 'color') {
		if (typeof value !== 'string' || !value.match(/^#[0-9a-fA-F]{6}$/)) {
			return {
				type: 'type-mismatch',
				message: `Expected color (hex format), got ${value}`,
				parameterKey: paramDef.key,
			};
		}
	}

	return null;
}

/**
 * Validates if a connection between two nodes is type-compatible
 */
export function validateConnection(
	sourceNode: Node<NodeData>,
	targetNode: Node<NodeData>,
	targetParameterKey: string
): ValidationError | null {
	const sourceDef = getNodeDefinition(sourceNode.data.typeKey);
	const targetDef = getNodeDefinition(targetNode.data.typeKey);

	if (!sourceDef || !targetDef) {
		return {
			type: 'invalid-connection',
			message: 'Unknown node types in connection',
			sourceNodeId: sourceNode.id,
			targetNodeId: targetNode.id,
		};
	}

	const targetParam = targetDef.parameters?.find(
		(p) => p.key === targetParameterKey
	);
	if (!targetParam) {
		return {
			type: 'invalid-connection',
			message: `Target parameter '${targetParameterKey}' not found`,
			targetNodeId: targetNode.id,
			parameterKey: targetParameterKey,
		};
	}

	// Check if target parameter accepts connections
	if (targetParam.acceptsConnections === false) {
		return {
			type: 'invalid-connection',
			message: `Parameter '${targetParam.label}' does not accept connections`,
			targetNodeId: targetNode.id,
			parameterKey: targetParameterKey,
		};
	}

	// Type compatibility check
	const sourceOutputType = sourceDef.outputType || 'any';
	const targetInputType = targetParam.type;

	// Allow 'any' to connect to anything
	if (sourceOutputType === 'any' || targetInputType === 'any') {
		return null;
	}

	// Allow exact type matches
	if (sourceOutputType === targetInputType) {
		return null;
	}

	// Allow some compatible conversions
	const compatibleTypes: Record<string, string[]> = {
		number: ['string'], // numbers can be converted to strings
		boolean: ['string'], // booleans can be converted to strings
		color: ['string'], // colors are strings
		mesh: ['scene'], // meshes can go into scenes
		geometry: ['mesh'], // geometry can go into meshes
		material: ['mesh'], // materials can go into meshes
		light: ['scene'], // lights can go into scenes
	};

	if (compatibleTypes[sourceOutputType]?.includes(targetInputType)) {
		return null;
	}

	return {
		type: 'type-mismatch',
		message: `Cannot connect ${sourceOutputType} to ${targetInputType}`,
		sourceNodeId: sourceNode.id,
		targetNodeId: targetNode.id,
		parameterKey: targetParameterKey,
	};
}

/**
 * Validates all node parameters in a graph
 */
export function validateGraphParameters(
	nodes: Node<NodeData>[]
): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const node of nodes) {
		const def = getNodeDefinition(node.data.typeKey);
		if (!def?.parameters) {
			continue;
		}

		for (const paramDef of def.parameters) {
			const value = node.data.params?.[paramDef.key];
			if (value !== undefined) {
				const error = validateParameterValue(value, paramDef);
				if (error) {
					error.nodeId = node.id;
					errors.push(error);
				}
			}
		}
	}

	return errors;
}

/**
 * Validates all connections in a graph
 */
export function validateGraphConnections(
	nodes: Node<NodeData>[],
	edges: Edge[]
): ValidationError[] {
	const errors: ValidationError[] = [];
	const nodeMap = new Map(nodes.map((n) => [n.id, n]));

	for (const edge of edges) {
		const sourceNode = nodeMap.get(edge.source);
		const targetNode = nodeMap.get(edge.target);

		if (!sourceNode || !targetNode || !edge.targetHandle) {
			continue; // Skip invalid edges
		}

		const error = validateConnection(sourceNode, targetNode, edge.targetHandle);
		if (error) {
			errors.push(error);
		}
	}

	return errors;
}

/**
 * Validates the entire graph state
 */
export function validateGraph(
	nodes: Node<NodeData>[],
	edges: Edge[]
): ValidationError[] {
	return [
		...validateGraphParameters(nodes),
		...validateGraphConnections(nodes, edges),
	];
}
