import {Position, NodeProps, useStore} from '@xyflow/react';
import {cn} from '@/lib/utils';
import CustomHandle from './Handle';
import {getNodeDefinition, NODE_DEFINITIONS} from '@/lib/node-registry';

export type NodeData = {
	typeKey: keyof typeof NODE_DEFINITIONS;
	label?: string;
	params?: Record<string, unknown>;
	onParamChange?: (nodeId: string, key: string, value: unknown) => void;
};

function CustomNode({id, data, selected}: NodeProps) {
	const d = data as NodeData;
	const def = getNodeDefinition(d.typeKey);
	const appearance = def?.appearanceHint ?? 'structure';
	const bgByAppearance: Record<string, string> = {
		structure: 'bg-card',
		material: 'bg-[#1b1b24]',
		light: 'bg-[#222417]',
		utility: 'bg-[#1b1f23]',
	};

	// Determine which parameter handles are currently connected to this node
	const connectedParamKeys = useStore((s) =>
		s.edges
			.filter((e) => e.target === String(id) && Boolean(e.targetHandle))
			.map((e) => String(e.targetHandle))
	);

	return (
		<div
			className={cn(
				'px-3 py-2 rounded-md outline outline-secondary text-left',
				'min-w-[180px]',
				selected ? 'outline-primary shadow-lg' : 'hover:outline-primary/15',
				'transition-all duration-50',
				bgByAppearance[appearance]
			)}
		>
			<div className='text-foreground text-xs font-medium pb-1'>
				{d.label ?? def?.label ?? 'Node'}
			</div>

			{def?.parameters?.length ? (
				<div className='space-y-1 pt-1'>
					{/* Render handles only for parameters that already have inbound connections */}
					{def.parameters
						.filter((p) => connectedParamKeys.includes(p.key))
						.map((p) => (
							<div key={p.key} className='relative flex items-center gap-2'>
								<CustomHandle
									type='target'
									position={Position.Left}
									id={p.key}
									className='-left-3'
								/>
								<div className='text-[11px] text-muted-foreground'>
									{p.label}
								</div>
							</div>
						))}

					{/* Generic add handle, optionally enabled for node types that support it */}
					{def.parameters.some((p) => !connectedParamKeys.includes(p.key)) ? (
						<div className='relative flex items-center gap-2'>
							<CustomHandle
								type='target'
								position={Position.Left}
								id='__new__'
								variant='generic'
								className='-left-3!'
							/>
							<div className='text-[10px] text-muted-foreground'>Input</div>
						</div>
					) : null}
				</div>
			) : null}

			<CustomHandle type='source' position={Position.Right} />
		</div>
	);
}

export default CustomNode;
