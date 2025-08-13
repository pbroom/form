import {useLayoutEffect, useMemo, useRef} from 'react';
import {cn} from '@/lib/utils';
import CustomMinimap from './Minimap';
import {
	motion,
	useMotionValue,
	animate,
	useDragControls,
	MotionValue,
} from 'motion/react';

type DraggableMinimapProps = {
	padding?: number;
};

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

type SpringCfg =
	| {type: 'spring'; stiffness: number; damping: number}
	| {duration: number};

export default function DraggableMinimap({
	padding = 12,
}: DraggableMinimapProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLElement | null>(null);
	const dragControls = useDragControls();

	// Motion values for position
	const x = useMotionValue(0) as MotionValue<number>;
	const y = useMotionValue(0) as MotionValue<number>;

	// Whether to reduce motion
	const prefersReduced = useMemo(
		() =>
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		[]
	);

	type Constraints = {left: number; top: number; right: number; bottom: number};
	const constraintsRef = useRef<Constraints>({
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	});
	const prevConstraintsRef = useRef<Constraints>({
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	});

	// Measure container and minimap; set constraints and default bottom-right
	const measure = () => {
		const w = wrapperRef.current;
		const container = wrapperRef.current?.closest(
			'.react-flow'
		) as HTMLElement | null;
		if (!w || !container) return;
		containerRef.current = container;

		const prev = prevConstraintsRef.current;

		const c = container.getBoundingClientRect();
		const r = w.getBoundingClientRect();

		const nextConstraints: Constraints = {
			left: padding,
			top: padding,
			right: Math.max(padding, c.width - r.width - padding),
			bottom: Math.max(padding, c.height - r.height - padding),
		};

		// First mount → default bottom-right
		if (x.get() === 0 && y.get() === 0) {
			x.set(nextConstraints.right);
			y.set(nextConstraints.bottom);
			constraintsRef.current = nextConstraints;
			prevConstraintsRef.current = nextConstraints;
			return;
		}

		const almostEq = (a: number, b: number, eps = 2) => Math.abs(a - b) <= eps;

		// Anchor to the same side if we were previously touching it; otherwise clamp to new bounds
		let nx = x.get();
		let ny = y.get();

		if (almostEq(nx, prev.right)) nx = nextConstraints.right;
		else if (almostEq(nx, prev.left)) nx = nextConstraints.left;
		else {
			// On resize, anchor to nearest side for stability
			const distLeft = Math.abs(nx - nextConstraints.left);
			const distRight = Math.abs(nextConstraints.right - nx);
			nx = distLeft <= distRight ? nextConstraints.left : nextConstraints.right;
		}

		if (almostEq(ny, prev.bottom)) ny = nextConstraints.bottom;
		else if (almostEq(ny, prev.top)) ny = nextConstraints.top;
		else {
			const distTop = Math.abs(ny - nextConstraints.top);
			const distBottom = Math.abs(nextConstraints.bottom - ny);
			ny = distTop <= distBottom ? nextConstraints.top : nextConstraints.bottom;
		}

		// Stabilize by snapping to integer pixel positions
		x.set(Math.round(nx));
		y.set(Math.round(ny));

		prevConstraintsRef.current = nextConstraints;
		constraintsRef.current = nextConstraints;
	};

	useLayoutEffect(() => {
		measure();
		const ro = new ResizeObserver(measure);
		const c = wrapperRef.current?.closest('.react-flow') as HTMLElement | null;
		if (c) ro.observe(c);
		if (wrapperRef.current) ro.observe(wrapperRef.current);
		return () => ro.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const snapToNearestCorner = () => {
		const c = constraintsRef.current;
		const tx =
			Math.abs(x.get() - c.left) < Math.abs(x.get() - c.right)
				? c.left
				: c.right;
		const ty =
			Math.abs(y.get() - c.top) < Math.abs(y.get() - c.bottom)
				? c.top
				: c.bottom;
		const spring: SpringCfg = {duration: 0.001};
		animate(x, tx, spring);
		animate(y, ty, spring);
	};

	const startDrag = (e: React.PointerEvent) => {
		// Prevent native HTML5 drag/ghost image
		(e.currentTarget as HTMLElement).draggable = false;
		e.preventDefault();
		dragControls.start(e);
	};

	const onDragEnd = () => {
		snapToNearestCorner();
	};

	const handleDoubleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		snapToNearestCorner();
	};

	return (
		<motion.div
			ref={wrapperRef}
			data-testid='minimap-wrapper'
			className={cn('absolute z-50 select-none touch-none')}
			style={{x, y, willChange: 'transform'}}
			drag
			dragControls={dragControls}
			dragListener={false}
			dragMomentum={!prefersReduced}
			dragElastic={0}
			dragConstraints={constraintsRef.current}
			whileDrag={{scale: prefersReduced ? 1 : 0.98}}
			onDragEnd={onDragEnd}
			onDoubleClick={handleDoubleClick}
			// Prevent native HTML5 drag globally on wrapper
			onDragStartCapture={(e) => e.preventDefault()}
		>
			<div
				data-testid='minimap-handle'
				role='button'
				aria-label='Drag minimap'
				title='Drag minimap'
				className='absolute inset-0 cursor-grab active:cursor-grabbing z-10 select-none touch-none'
				onPointerDown={startDrag}
				onDragStart={(e) => e.preventDefault()}
			/>
			<div className='pointer-events-none'>
				<CustomMinimap />
			</div>
		</motion.div>
	);
}
