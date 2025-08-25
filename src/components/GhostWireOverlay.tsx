import React from 'react';

type Point = {x: number; y: number};

interface GhostWireOverlayProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
	start?: Point;
	end?: Point;
	testId?: string;
	className?: string;
}

function GhostWireOverlay({
	containerRef,
	start,
	end,
	testId = 'ghost-wire-overlay',
	className,
}: GhostWireOverlayProps) {
	if (!start || !end) return null;
	const rect = containerRef.current?.getBoundingClientRect();
	if (!rect) return null;
	const startX = start.x - rect.left;
	const startY = start.y - rect.top;
	const endX = end.x - rect.left;
	const endY = end.y - rect.top;
	const dx = Math.abs(endX - startX);
	const c1x = startX + dx * 0.5;
	const c1y = startY;
	const c2x = endX - dx * 0.5;
	const c2y = endY;
	const d = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;

	return (
		<svg
			className={`pointer-events-none absolute inset-0 w-full h-full ${
				className ?? ''
			}`}
			data-testid={testId}
		>
			<path
				d={d}
				stroke='currentColor'
				className='text-foreground/40'
				strokeWidth={2}
				fill='none'
				strokeDasharray='6 6'
				data-testid='ghost-wire-path'
			/>
		</svg>
	);
}

export default GhostWireOverlay;
