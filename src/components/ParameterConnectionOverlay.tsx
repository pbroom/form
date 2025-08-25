import {useEffect, useRef, useState} from 'react';
import {getNodeDefinition} from '@/lib/node-registry';
import type {NodeData} from './Node';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';

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
	const [query, setQuery] = useState('');

	if (!def?.parameters?.length) {
		return null;
	}

	// Show only parameters that accept connections and are not already connected
	const availableParameters = def.parameters.filter(
		(param) =>
			param.acceptsConnections !== false &&
			!connectedParameters.includes(param.key)
	);

	const filtered = availableParameters.filter(
		(p) =>
			p.label.toLowerCase().includes(query.toLowerCase()) ||
			p.key.toLowerCase().includes(query.toLowerCase()) ||
			String(p.type).toLowerCase().includes(query.toLowerCase())
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
		<div ref={overlayRef} className='absolute z-50 min-w-52 shadow-md'>
			<Command className='border border-border rounded-md bg-popover'>
				<CommandInput
					autoFocus
					placeholder='Search parameters...'
					value={query}
					onValueChange={setQuery as any}
				/>
				<CommandList>
					<CommandEmpty>No matching parameters.</CommandEmpty>
					<CommandGroup heading='Available'>
						{filtered.map((param) => (
							<CommandItem
								key={param.key}
								value={param.key}
								onSelect={() => onParameterSelect(param.key)}
							>
								<div className='flex w-full items-center justify-between text-xs'>
									<span>{param.label}</span>
									<span className='text-muted-foreground text-[10px]'>
										{param.type}
									</span>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
				<div className='border-t border-border/50 p-1'>
					<button
						className='w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent'
						onClick={onCancel}
					>
						Cancel
					</button>
				</div>
			</Command>
		</div>
	);
}
