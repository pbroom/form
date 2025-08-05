import {MiniMap, Node} from '@xyflow/react';
import {cn} from '@/lib/utils';

interface CustomMinimapProps {
	className?: string;
}

function CustomMinimap({className}: CustomMinimapProps) {
	const nodeStrokeColor = (node: Node) => {
		if (node.type === 'input') return '#10b981';
		if (node.type === 'output') return '#ef4444';
		return '#6b7280';
	};

	const nodeColor = (node: Node) => {
		if (node.type === 'input') return '#10b981';
		if (node.type === 'output') return '#ef4444';
		return '#ffffff';
	};

	return (
		<MiniMap
			nodeStrokeColor={nodeStrokeColor}
			nodeColor={nodeColor}
			className={cn(
				'bg-muted/80! overflow-hidden backdrop-blur-sm border-[0.5px] border-border rounded-lg shadow-lg',
				className
			)}
		/>
	);
}

export default CustomMinimap;
