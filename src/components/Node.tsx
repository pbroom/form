import {Position, NodeProps, useStore} from '@xyflow/react';
import {cn} from '@/lib/utils';
// Using unified NodeHandle from node-primitives
import {getNodeDefinition} from '@/lib/node-registry';
import {useCodeStore} from '@/store/code';
// import {motion} from 'motion/react';
import {
	Node as NodeRoot,
	NodeHeader,
	NodeLabel,
	NodeBody,
	NodeOutputGroup,
	NodeInputGroup,
	NodeInput,
	HandleLabel,
	Text,
	ConnectionTarget,
	NodeHandle,
} from '@/components/node-ui/node-primitives';

export type NodeData = {
	typeKey: string;
	label?: string;
	params?: Record<string, unknown>;
	onParamChange?: (nodeId: string, key: string, value: unknown) => void;
	// For code nodes: dynamic parameter sockets derived from code
	dynamicParams?: {key: string; label: string; type: string}[];
};

function CustomNode({id, data, selected}: NodeProps) {
	const d = data as NodeData;
	const def = getNodeDefinition(d.typeKey);
	const setDynamicFromCode = useCodeStore((s) => s.getDynamicParams);

	// Determine which parameter handles are currently connected to this node
	const connectedParamKeys = useStore((s) =>
		s.edges
			.filter((e) => e.target === String(id) && Boolean(e.targetHandle))
			.map((e) => String(e.targetHandle))
	);

	// Effective parameter list: registry for normal nodes; dynamic for code nodes
	const effectiveParams =
		d.typeKey === 'code'
			? setDynamicFromCode(String(id)).map((p) => ({
					key: p.key,
					label: p.label || p.key,
					acceptsConnections: true as const,
			  }))
			: def?.parameters || [];

	return (
		<NodeRoot
			selected={selected}
			className={cn('relative')}
			data-testid={`node-${String(d.typeKey)}-${String(id)}`}
			data-node-id={String(id)}
			data-selected={selected ? 'true' : 'false'}
		>
			<NodeHeader>
				<NodeHandle
					type='target'
					position={Position.Left}
					id='__node__'
					data-testid='handle-target-node'
				>
					<ConnectionTarget testId='connection-target-node' />
				</NodeHandle>
				<NodeLabel>
					<Text>{d.label ?? def?.label ?? 'Node'}</Text>
				</NodeLabel>
				<NodeHandle
					type='source'
					position={Position.Right}
					data-testid='handle-source'
				>
					<ConnectionTarget testId='connection-target-source' />
				</NodeHandle>
			</NodeHeader>

			{effectiveParams.length ? (
				<NodeBody>
					<NodeOutputGroup>
						{/* reserved for future multiple outputs */}
					</NodeOutputGroup>
					<NodeInputGroup>
						{effectiveParams
							.filter((p) => connectedParamKeys.includes(p.key))
							.map((p) => (
								<NodeInput key={p.key}>
									<NodeHandle
										type='target'
										position={Position.Left}
										id={p.key}
										data-testid={`handle-target-param-${p.key}`}
									>
										<ConnectionTarget
											testId={`connection-target-param-${p.key}`}
										/>
									</NodeHandle>
									<HandleLabel>{p.label}</HandleLabel>
								</NodeInput>
							))}

						{effectiveParams.some(
							(p) => !connectedParamKeys.includes(p.key)
						) ? (
							<NodeInput>
								<NodeHandle
									type='target'
									position={Position.Left}
									id='__new__'
									data-testid='handle-target-generic'
								>
									<ConnectionTarget testId='connection-target-generic' />
								</NodeHandle>
								<HandleLabel>Input</HandleLabel>
							</NodeInput>
						) : null}
					</NodeInputGroup>
				</NodeBody>
			) : null}
		</NodeRoot>
	);
}

export default CustomNode;
