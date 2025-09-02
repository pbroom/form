import {type Node} from '@xyflow/react';
import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';
import {
	getNodeDefinition,
	type NodeParameterDefinition,
} from '@/lib/node-registry';
import type {NodeData} from './Node';
import DraggableNumberInput from '@/components/ui/draggable-number-input';
import type {ValidationError} from '@/lib/node-registry';
import {useDebouncedCallback} from '@/lib/hooks/useDebouncedCallback';
import CodeView from '@/components/CodeView';
import {useCodeStore} from '@/store/code';
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from '@/components/ui/collapsible';

type PropertiesPanelProps = {
	node: Node<NodeData> | null;
	onParamChange: (nodeId: string, key: string, value: unknown) => void;
	onLabelChange: (nodeId: string, label: string) => void;
	validationErrors?: ValidationError[];
};

function ParameterControl({
	def,
	value,
	onChange,
}: {
	def: NodeParameterDefinition;
	value: unknown;
	onChange: (v: unknown) => void;
	validationError?: ValidationError;
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
	validationErrors = [],
}: PropertiesPanelProps) {
	const panelRef = useRef<HTMLDivElement | null>(null);
	const resizerRef = useRef<HTMLDivElement | null>(null);
	const MIN_CODE_PX = 120;
	const MIN_BELOW_PX = 160;
	const [codeHeightPx, setCodeHeightPx] = useState<number>(() => {
		const stored = localStorage.getItem('codeViewHeightPx');
		const parsed = stored ? parseInt(stored, 10) : NaN;
		return Number.isFinite(parsed) && parsed >= MIN_CODE_PX ? parsed : 240;
	});

	useEffect(() => {
		localStorage.setItem('codeViewHeightPx', String(codeHeightPx));
	}, [codeHeightPx]);

	const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		const startY = e.clientY;
		const startHeight = codeHeightPx;

		const onMove = (ev: MouseEvent) => {
			const dy = ev.clientY - startY;
			let next = startHeight + dy;
			// Enforce minimum code height
			next = Math.max(MIN_CODE_PX, next);
			// Enforce minimum space for content below the resizer within the panel
			const panelRect = panelRef.current?.getBoundingClientRect();
			const resizerRect = resizerRef.current?.getBoundingClientRect();
			if (panelRect && resizerRect) {
				const panelBottom = panelRect.bottom;
				const resizerTopNext = resizerRect.top + dy;
				const spaceBelow = panelBottom - resizerTopNext;
				if (spaceBelow < MIN_BELOW_PX) {
					const deficit = MIN_BELOW_PX - spaceBelow;
					next = Math.max(MIN_CODE_PX, next - deficit);
				}
			}
			setCodeHeightPx(next);
		};

		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};
	const debouncedParamChange = useDebouncedCallback(
		(nodeId: string, key: string, value: unknown) =>
			onParamChange(nodeId, key, value),
		100
	);
	// Unconditional hooks
	const getCode = useCodeStore((s) => s.getCode);
	const setCode = useCodeStore((s) => s.setCode);

	if (!node) {
		return (
			<div className={cn('h-full w-full p-3 text-sm text-muted-foreground')}>
				No node selected
			</div>
		);
	}

	const def = getNodeDefinition(node.data.typeKey);
	const isCodeNode = node.data.typeKey === 'code';

	return (
		<div
			ref={panelRef}
			className={cn('h-full w-full p-3 space-y-3 bg-card/40')}
		>
			<div className='flex items-center justify-between gap-3'>
				<div className='text-xs text-muted-foreground'>
					{def?.label ?? 'Node'}
					<span className='ml-2 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground'>
						{node.data.typeKey}
					</span>
				</div>
				<div className='text-[10px] text-muted-foreground'>id: {node.id}</div>
			</div>

			{isCodeNode ? (
				<div className='space-y-1 rounded-md border border-border/60 bg-background/40'>
					<Collapsible defaultOpen>
						<CollapsibleTrigger className='w-full text-left cursor-pointer text-xs font-medium px-2 py-1'>
							Code
						</CollapsibleTrigger>
						<CollapsibleContent className='p-2 mt-1 text-xs'>
							<CodeView
								node={node}
								value={getCode(node.id)}
								onChange={(val) => setCode(node.id, val)}
								validationMessage={undefined}
								heightPx={codeHeightPx}
							/>
							<div
								ref={resizerRef}
								role='separator'
								aria-orientation='horizontal'
								aria-label='Resize code editor'
								onMouseDown={startDrag}
								className='h-2 mt-2 cursor-row-resize rounded-sm bg-border/60 hover:bg-border'
							/>
						</CollapsibleContent>
					</Collapsible>
				</div>
			) : null}

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
						{def.parameters.map((p) => {
							const paramError = validationErrors.find(
								(e) => e.parameterKey === p.key
							);
							return (
								<div key={p.key}>
									<ParameterControl
										def={p}
										value={node.data?.params?.[p.key]}
										onChange={(v) => debouncedParamChange(node.id, p.key, v)}
										validationError={paramError}
									/>
									{paramError && (
										<div className='text-[10px] text-red-500 mt-0.5 px-1'>
											{paramError.message}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			) : null}
		</div>
	);
}
