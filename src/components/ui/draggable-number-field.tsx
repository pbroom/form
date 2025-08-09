import {useCallback, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';

export type DraggableNumberFieldProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	inputClassName?: string;
};

function clamp(value: number, min?: number, max?: number) {
	if (typeof min === 'number') value = Math.max(min, value);
	if (typeof max === 'number') value = Math.min(max, value);
	return value;
}

export default function DraggableNumberField({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	className,
	inputClassName,
}: DraggableNumberFieldProps) {
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

	const onPointerDownLabel = useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			e.preventDefault();
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
			draggingRef.current = true;
			setIsDragging(true);
			startXRef.current = e.clientX;
			startValueRef.current = Number(value) || 0;
			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';

			const handlePointerMove = (ev: PointerEvent) => {
				if (!draggingRef.current) return;
				const dx = ev.clientX - startXRef.current;
				const pixelsPerStep = 6; // adjust sensitivity
				const units = dx / pixelsPerStep;
				let effectiveStep = step;
				if (ev.shiftKey) effectiveStep = step * 10;
				else if (ev.altKey || ev.metaKey || ev.ctrlKey)
					effectiveStep = step * 0.1;
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
			<input
				className={cn(
					'w-24 rounded-md bg-secondary px-2 py-1 text-right',
					inputClassName
				)}
				type='number'
				value={Number.isFinite(value) ? value : ''}
				min={min}
				max={max}
				step={step}
				onChange={(e) => {
					const parsed = parseFloat(e.target.value);
					if (!Number.isNaN(parsed)) onChange(parsed);
					else if (e.target.value === '') onChange(NaN as unknown as number);
				}}
			/>
		</label>
	);
}
