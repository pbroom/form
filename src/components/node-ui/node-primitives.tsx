import * as React from 'react';
import {cn} from '@/lib/utils';
import {
	Handle,
	type HandleProps,
	BaseEdge,
	getBezierPath,
	Position,
	type ConnectionLineComponentProps,
} from '@xyflow/react';

type WithChildren<T = unknown> = React.PropsWithChildren<T> & {
	className?: string;
};

const baseBox =
	'bg-neutral-500/5! outline outline-1! outline-neutral-500/10! hover:bg-neutral-500/10! hover:outline-neutral-500/20!';

export function Node(props: WithChildren<{selected?: boolean}>) {
	const {children, className} = props;
	return (
		<div
			className={cn('px-3 py-2 text-left min-w-[180px]', baseBox, className)}
		>
			{children}
		</div>
	);
}

export function NodeHeader({children, className}: WithChildren) {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-2',
				baseBox,
				className
			)}
		>
			{children}
		</div>
	);
}

export function NodeLabel({children, className}: WithChildren) {
	return (
		<div
			className={cn(
				'text-foreground text-xs font-medium pb-1 flex-1 truncate',
				className
			)}
		>
			{children}
		</div>
	);
}

export function NodeBody({children, className}: WithChildren) {
	return (
		<div className={cn('space-y-1 pt-1', baseBox, className)}>{children}</div>
	);
}

export function NodeBackdrop({className}: {className?: string}) {
	return (
		<div
			className={cn('absolute inset-0 pointer-events-none', baseBox, className)}
		/>
	);
}

export function NodeOutputGroup({children, className}: WithChildren) {
	return (
		<div className={cn('flex flex-col gap-1', baseBox, className)}>
			{children}
		</div>
	);
}

export function NodeInputGroup({children, className}: WithChildren) {
	return (
		<div className={cn('flex flex-col gap-1', baseBox, className)}>
			{children}
		</div>
	);
}

export function NodeOutput({children, className}: WithChildren) {
	return (
		<div className={cn('relative flex items-center gap-2', baseBox, className)}>
			{children}
		</div>
	);
}

export function NodeInput({children, className}: WithChildren) {
	return (
		<div className={cn('relative flex items-center gap-2', baseBox, className)}>
			{children}
		</div>
	);
}

export function HandleLabel({children, className}: WithChildren) {
	return (
		<div className={cn('text-[11px] text-muted-foreground', className)}>
			{children}
		</div>
	);
}

export function Text({children, className}: WithChildren) {
	return <span className={cn('truncate', className)}>{children}</span>;
}

export type ConnectionTargetProps = {
	testId?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export const ConnectionTarget = React.forwardRef<
	HTMLSpanElement,
	ConnectionTargetProps
>(({testId, className, ...rest}, ref) => {
	return (
		<span
			ref={ref}
			data-connection-target='true'
			data-testid={testId}
			className={cn(
				'block size-2 pointer-events-none bg-neutral-500/10 outline outline-neutral-500/20 hover:bg-neutral-500/20 hover:outline-neutral-500/30 group-hover:bg-neutral-500/20 group-hover:outline-neutral-500/30',
				className
			)}
			{...rest}
		/>
	);
});
ConnectionTarget.displayName = 'ConnectionTarget';

// Unified handle with neutral debug styles
interface NodeHandleProps extends Omit<HandleProps, 'className'> {
	className?: string;
	children?: React.ReactNode;
}

export function NodeHandle({className, children, ...props}: NodeHandleProps) {
	return (
		<Handle
			{...props}
			className={cn(
				'border-none! size-6! flex items-center justify-center group relative!',
				baseBox,
				className
			)}
		>
			{children ?? (
				<span className='size-2! bg-neutral-500/50! pointer-events-none' />
			)}
		</Handle>
	);
}

// Unified edge component (neutral stroke)
type EdgeProps = {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition?: Position;
	targetPosition?: Position;
};

export function NodeEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) {
	const handleOffset = 8;

	let adjustedSourceX = sourceX;
	let adjustedTargetX = targetX;

	if (sourcePosition === Position.Right) adjustedSourceX -= handleOffset;
	else if (sourcePosition === Position.Left) adjustedSourceX += handleOffset;

	if (targetPosition === Position.Left) adjustedTargetX += handleOffset;
	else if (targetPosition === Position.Right) adjustedTargetX -= handleOffset;

	const [path] = getBezierPath({
		sourceX: adjustedSourceX,
		sourceY,
		targetX: adjustedTargetX,
		targetY,
		sourcePosition: sourcePosition ?? Position.Bottom,
		targetPosition: targetPosition ?? Position.Top,
	});

	return <BaseEdge id={id} path={path} />;
}

// Unified connection line component matching edge styles
export function NodeConnectionLine({
	fromX,
	fromY,
	toX,
	toY,
	fromPosition,
	toPosition,
}: ConnectionLineComponentProps) {
	const handleOffset = 8;

	let adjustedSourceX = fromX;
	let adjustedTargetX = toX;

	if (fromPosition === Position.Right) adjustedSourceX -= handleOffset;
	else if (fromPosition === Position.Left) adjustedSourceX += handleOffset;

	if (toPosition === Position.Left) adjustedTargetX += handleOffset;
	else if (toPosition === Position.Right) adjustedTargetX -= handleOffset;

	const [path] = getBezierPath({
		sourceX: adjustedSourceX,
		sourceY: fromY,
		targetX: adjustedTargetX,
		targetY: toY,
		sourcePosition: fromPosition ?? Position.Bottom,
		targetPosition: toPosition ?? Position.Top,
	});

	return (
		<svg className='absolute overflow-visible pointer-events-none'>
			<path
				d={path}
				fill='none'
				stroke='currentColor'
				strokeOpacity={0.5}
				strokeWidth={1.5}
			/>
		</svg>
	);
}
