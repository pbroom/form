import {useCallback, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';
import {Input} from '@/components/ui/input';

export type DraggableNumberInputProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	inputClassName?: string;
	width?: 'sm' | 'md';
};

function clamp(value: number, min?: number, max?: number) {
	if (typeof min === 'number') value = Math.max(min, value);
	if (typeof max === 'number') value = Math.min(max, value);
	return value;
}

export default function DraggableNumberInput({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	className,
	inputClassName,
	width = 'sm',
}: DraggableNumberInputProps) {
	const startXRef = useRef(0);
	const startValueRef = useRef(0);
	const draggingRef = useRef(false);
	const [isDragging, setIsDragging] = useState(false);

	const endDrag = useCallback(() => {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		setIsDragging(false);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}, []);

	useEffect(() => {
		return () => endDrag();
	}, [endDrag]);

	const beginDrag = useCallback(
		(
			clientX: number,
			modifierKeys?: {
				shiftKey?: boolean;
				altKey?: boolean;
				metaKey?: boolean;
				ctrlKey?: boolean;
			}
		) => {
			draggingRef.current = true;
			setIsDragging(true);
			startXRef.current = clientX;
			startValueRef.current = Number(value) || 0;
			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';

			const handlePointerMove = (ev: PointerEvent) => {
				if (!draggingRef.current) return;
				const dx = ev.clientX - startXRef.current;
				const pixelsPerStep = 6;
				const units = dx / pixelsPerStep;
				let effectiveStep = step;
				const useShift = ev.shiftKey || modifierKeys?.shiftKey;
				const useAlt =
					ev.altKey ||
					ev.metaKey ||
					ev.ctrlKey ||
					modifierKeys?.altKey ||
					modifierKeys?.metaKey ||
					modifierKeys?.ctrlKey;
				if (useShift) effectiveStep = step * 10;
				else if (useAlt) effectiveStep = step * 0.1;
				const next = clamp(
					startValueRef.current + units * effectiveStep,
					min,
					max
				);
				if (!Number.isNaN(next)) onChange(Number(next.toFixed(6)));
			};

			const handlePointerUp = () => {
				window.removeEventListener('pointermove', handlePointerMove);
				window.removeEventListener('pointerup', handlePointerUp);
				endDrag();
			};

			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('pointerup', handlePointerUp, {once: true});
		},
		[endDrag, max, min, onChange, step, value]
	);

	const onPointerDownLabel = useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			e.preventDefault();
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
			beginDrag(e.clientX, {
				shiftKey: e.shiftKey,
				altKey: e.altKey,
				metaKey: e.metaKey,
				ctrlKey: e.ctrlKey,
			});
		},
		[beginDrag]
	);

	const onPointerDownEdge = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.preventDefault();
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
			beginDrag(e.clientX, {
				shiftKey: e.shiftKey,
				altKey: e.altKey,
				metaKey: e.metaKey,
				ctrlKey: e.ctrlKey,
			});
		},
		[beginDrag]
	);

	const widthClass = width === 'sm' ? 'w-24' : 'w-28';

	return (
		<label
			className={cn(
				'flex items-center justify-between gap-2 text-xs py-1',
				className
			)}
		>
			<span
				className={cn(
					'text-muted-foreground select-none',
					isDragging ? 'cursor-ew-resize' : 'cursor-col-resize'
				)}
				onPointerDown={onPointerDownLabel}
				title='Drag to adjust'
			>
				{label}
			</span>
			<div className={cn('relative', widthClass)}>
				<Input
					type='number'
					value={Number.isFinite(value) ? value : ''}
					min={min}
					max={max}
					step={step}
					onChange={(e) => {
						const parsed = parseFloat((e.target as HTMLInputElement).value);
						if (!Number.isNaN(parsed)) onChange(parsed);
						else if ((e.target as HTMLInputElement).value === '')
							onChange(NaN as unknown as number);
					}}
					className={cn('pr-3 pl-4 text-right', inputClassName)}
				/>
				{/* Left-edge drag handle overlay */}
				<div
					className={cn('absolute inset-y-0 left-0 w-3 cursor-col-resize')}
					onPointerDown={onPointerDownEdge}
					aria-label='Drag to adjust'
					title='Drag to adjust'
				/>
			</div>
		</label>
	);
}
