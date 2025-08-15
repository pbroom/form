import {useEffect, useRef} from 'react';
import {cn} from '@/lib/utils';
import {getNodeDefinition} from '@/lib/node-registry';
import type {NodeData} from './Node';

interface ParameterConnectionOverlayProps {
	nodeData: NodeData;
	nodePosition: {x: number; y: number};
	connectedParameters: string[];
	onParameterSelect: (parameterKey: string) => void;
	onCancel: () => void;
}

export default function ParameterConnectionOverlay({
	nodeData,
	nodePosition,
	connectedParameters,
	onParameterSelect,
	onCancel,
}: ParameterConnectionOverlayProps) {
	const def = getNodeDefinition(nodeData.typeKey);
	const emptyRef = useRef<HTMLDivElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);

	if (!def?.parameters?.length) {
		return null;
	}

	// Show only parameters that accept connections and are not already connected
	const availableParameters = def.parameters.filter(
		(param) =>
			param.acceptsConnections !== false &&
			!connectedParameters.includes(param.key)
	);

	if (availableParameters.length === 0) {
		return (
			<div
				ref={emptyRef}
				className='absolute z-50 bg-popover border border-border rounded-md p-2 shadow-md min-w-32'
			>
				<div className='text-xs text-muted-foreground'>
					All parameters connected
				</div>
			</div>
		);
	}

	// Position overlays via inline style set imperatively to satisfy lint rule
	useEffect(() => {
		if (overlayRef?.current) {
			overlayRef.current.style.left = `${nodePosition.x}px`;
			overlayRef.current.style.top = `${nodePosition.y - 10}px`;
		}
		if (emptyRef?.current) {
			emptyRef.current.style.left = `${nodePosition.x}px`;
			emptyRef.current.style.top = `${nodePosition.y - 40}px`;
		}
	}, [nodePosition.x, nodePosition.y]);

	return (
		<div
			ref={overlayRef}
			className='absolute z-50 bg-popover border border-border rounded-md p-1 shadow-md min-w-40'
		>
			<div className='text-xs font-medium text-foreground p-1 border-b border-border/50'>
				Connect to parameter:
			</div>
			<div className='space-y-0.5 p-1'>
				{availableParameters.map((param) => (
					<button
						key={param.key}
						className={cn(
							'w-full text-left px-2 py-1 text-xs rounded hover:bg-accent hover:text-accent-foreground',
							'flex items-center justify-between gap-2'
						)}
						onClick={() => onParameterSelect(param.key)}
					>
						<span>{param.label}</span>
						<span className='text-muted-foreground text-[10px]'>
							{param.type}
						</span>
					</button>
				))}
			</div>
			<div className='border-t border-border/50 p-1'>
				<button
					className='w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent'
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
