import {Position, NodeProps, useStore} from '@xyflow/react';
import {cn} from '@/lib/utils';
import CustomHandle from './Handle';
import {getNodeDefinition} from '@/lib/node-registry';
import {motion} from 'motion/react';

export type NodeData = {
	typeKey: string;
	label?: string;
	params?: Record<string, unknown>;
	onParamChange?: (nodeId: string, key: string, value: unknown) => void;
	// For code nodes: dynamic parameter sockets derived from code
	dynamicParams?: {key: string; label: string; type: string}[];
};

// should probably remove this motion component. It doesn't play nice with the handle component.
const MotionHandle = motion.create(CustomHandle);

function CustomNode({id, data, selected}: NodeProps) {
	const d = data as NodeData;
	const def = getNodeDefinition(d.typeKey);
	const appearance = def?.appearanceHint ?? 'structure';
	const bgByAppearance: Record<string, string> = {
		structure: 'bg-card',
		material: 'bg-slate-50 dark:bg-slate-900',
		light: 'bg-stone-50 dark:bg-stone-900',
		utility: 'bg-zinc-50 dark:bg-zinc-900',
	};

	// Determine which parameter handles are currently connected to this node
	const connectedParamKeys = useStore((s) =>
		s.edges
			.filter((e) => e.target === String(id) && Boolean(e.targetHandle))
			.map((e) => String(e.targetHandle))
	);

	// Effective parameter list: registry for normal nodes; dynamic for code nodes
	const effectiveParams =
		d.typeKey === 'code' && d.dynamicParams?.length
			? d.dynamicParams.map((p) => ({
					key: p.key,
					label: p.label || p.key,
					acceptsConnections: true as const,
			  }))
			: def?.parameters || [];

	return (
		<div
			data-testid={`node-${String(d.typeKey)}-${String(id)}`}
			data-node-id={String(id)}
			data-selected={selected ? 'true' : 'false'}
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

			{effectiveParams.length ? (
				<div className='space-y-1 pt-1'>
					{/* Render handles only for parameters that already have inbound connections */}
					{effectiveParams
						.filter((p) => connectedParamKeys.includes(p.key))
						.map((p) => (
							<div key={p.key} className='relative flex items-center gap-2'>
								<MotionHandle
									type='target'
									position={Position.Left}
									id={p.key}
									data-testid={`handle-target-param-${p.key}`}
									className='absolute -left-5.5!'
								/>
								<div className='text-[11px] text-muted-foreground'>
									{p.label}
								</div>
							</div>
						))}

					{/* Generic add handle, only if there are connectable, unconnected params */}
					{effectiveParams.some((p) => !connectedParamKeys.includes(p.key)) ? (
						<div className='relative flex items-center gap-2'>
							<MotionHandle
								type='target'
								position={Position.Left}
								id='__new__'
								data-testid='handle-target-generic'
								className='absolute -left-5.5!'
							/>
							<div className='text-[11px] text-muted-foreground'>Input</div>
						</div>
					) : null}
				</div>
			) : null}

			<MotionHandle
				type='source'
				position={Position.Right}
				data-testid='handle-source'
				className='-right-2.5! top-4!'
			/>
		</div>
	);
}

export default CustomNode;
