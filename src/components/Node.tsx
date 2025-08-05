import {Position, NodeProps} from '@xyflow/react';
import {cn} from '@/lib/utils';
import CustomHandle from './Handle';

export type NodeData = {
	label: string;
};

function CustomNode({data, selected}: NodeProps) {
	return (
		<div
			className={cn(
				'px-4 py-2 rounded-md bg-card outline outline-secondary',
				'min-w-[150px] text-center',
				selected ? 'outline-primary shadow-lg' : 'hover:outline-primary/15',
				'transition-all duration-50'
			)}
		>
			<CustomHandle type='target' position={Position.Top} />

			<div className='text-foreground text-xs'>{(data as NodeData).label}</div>

			<CustomHandle type='source' position={Position.Bottom} />
		</div>
	);
}

export default CustomNode;
