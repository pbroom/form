import {Position, NodeProps} from '@xyflow/react';
import {cn} from '@/lib/utils';
import CustomHandle from './Handle';
import {
	getNodeDefinition,
	NODE_DEFINITIONS,
	type NodeParameterDefinition,
} from '@/lib/node-registry';

export type NodeData = {
	typeKey: keyof typeof NODE_DEFINITIONS;
	label?: string;
	params?: Record<string, unknown>;
	onParamChange?: (nodeId: string, key: string, value: unknown) => void;
};

function ParameterControl({
	def,
	value,
	onChange,
}: {
	def: NodeParameterDefinition;
	value: unknown;
	onChange: (v: unknown) => void;
}) {
	if (def.type === 'number') {
		return (
			<label className='flex items-center justify-between gap-2 text-xs py-1'>
				<span className='text-muted-foreground'>{def.label}</span>
				<input
					className='w-24 rounded-md bg-secondary px-2 py-1 text-right'
					type='number'
					value={Number(value ?? def.defaultValue)}
					min={def.min}
					max={def.max}
					step={def.step}
					onChange={(e) => onChange(parseFloat(e.target.value))}
				/>
			</label>
		);
	}
	if (def.type === 'color') {
		return (
			<label className='flex items-center justify-between gap-2 text-xs py-1'>
				<span className='text-muted-foreground'>{def.label}</span>
				<input
					className='w-24 rounded-md'
					type='color'
					value={(value as string) ?? (def.defaultValue as string)}
					onChange={(e) => onChange(e.target.value)}
				/>
			</label>
		);
	}
	if (def.type === 'boolean') {
		return (
			<label className='flex items-center justify-between gap-2 text-xs py-1'>
				<span className='text-muted-foreground'>{def.label}</span>
				<input
					type='checkbox'
					checked={Boolean(value ?? def.defaultValue)}
					onChange={(e) => onChange(e.target.checked)}
				/>
			</label>
		);
	}
	// string
	return (
		<label className='flex items-center justify-between gap-2 text-xs py-1'>
			<span className='text-muted-foreground'>{def.label}</span>
			<input
				className='w-24 rounded-md bg-secondary px-2 py-1 text-right'
				type='text'
				value={String(value ?? def.defaultValue ?? '')}
				onChange={(e) => onChange(e.target.value)}
			/>
		</label>
	);
}

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
			<CustomHandle type='target' position={Position.Top} />

			<div className='text-foreground text-xs font-medium pb-1'>
				{d.label ?? def?.label ?? 'Node'}
			</div>

			{def?.parameters?.length ? (
				<div className='divide-y divide-border/60'>
					{def.parameters.map((p) => (
						<ParameterControl
							key={p.key}
							def={p}
							value={d.params?.[p.key]}
							onChange={(v) => d.onParamChange?.(String(id), p.key, v)}
						/>
					))}
				</div>
			) : null}

			<CustomHandle type='source' position={Position.Bottom} />
		</div>
	);
}

export default CustomNode;
