import {type Node} from '@xyflow/react';
import {cn} from '@/lib/utils';
import {
	getNodeDefinition,
	type NodeParameterDefinition,
} from '@/lib/node-registry';
import type {NodeData} from './Node';
import DraggableNumberInput from '@/components/ui/draggable-number-input';

type PropertiesPanelProps = {
	node: Node<NodeData> | null;
	onParamChange: (nodeId: string, key: string, value: unknown) => void;
	onLabelChange: (nodeId: string, label: string) => void;
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
			<DraggableNumberInput
				label={def.label}
				value={Number(value ?? def.defaultValue)}
				min={def.min}
				max={def.max}
				step={def.step}
				onChange={onChange}
				className='py-1'
				inputClassName='w-28'
				width='md'
			/>
		);
	}
	if (def.type === 'color') {
		return (
			<label className='flex items-center justify-between gap-2 text-xs py-1'>
				<span className='text-muted-foreground'>{def.label}</span>
				<input
					className='w-28 rounded-md'
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
	return (
		<label className='flex items-center justify-between gap-2 text-xs py-1'>
			<span className='text-muted-foreground'>{def.label}</span>
			<input
				className='w-28 rounded-md bg-secondary px-2 py-1 text-right'
				type='text'
				value={String(value ?? def.defaultValue ?? '')}
				onChange={(e) => onChange(e.target.value)}
			/>
		</label>
	);
}

export default function PropertiesPanel({
	node,
	onParamChange,
	onLabelChange,
}: PropertiesPanelProps) {
	if (!node) {
		return (
			<div className={cn('h-full w-full p-3 text-sm text-muted-foreground')}>
				No node selected
			</div>
		);
	}

	const def = getNodeDefinition(node.data.typeKey);

	return (
		<div className={cn('h-full w-full p-3 space-y-3 bg-card/40')}>
			<div className='flex items-center justify-between gap-3'>
				<div className='text-xs text-muted-foreground'>
					{def?.label ?? 'Node'}
					<span className='ml-2 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground'>
						{node.data.typeKey}
					</span>
				</div>
				<div className='text-[10px] text-muted-foreground'>id: {node.id}</div>
			</div>

			<div className='space-y-1'>
				<label className='flex items-center justify-between gap-2 text-xs'>
					<span className='text-muted-foreground'>Label</span>
					<input
						className='w-40 rounded-md bg-secondary px-2 py-1 text-right'
						type='text'
						value={String(node.data.label ?? '')}
						onChange={(e) => onLabelChange(node.id, e.target.value)}
					/>
				</label>
			</div>

			{def?.parameters?.length ? (
				<div className='pt-2 border-t border-border/60'>
					<div className='text-xs font-medium text-foreground mb-1'>
						Parameters
					</div>
					<div className='gap-x-4'>
						{def.parameters.map((p) => (
							<ParameterControl
								key={p.key}
								def={p}
								value={node.data?.params?.[p.key]}
								onChange={(v) => onParamChange(node.id, p.key, v)}
							/>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
