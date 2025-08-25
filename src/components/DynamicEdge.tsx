import {BaseEdge, getBezierPath, Position} from '@xyflow/react';
import {useState, useEffect} from 'react';

type EdgeProps = {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition?: Position;
	targetPosition?: Position;
};

export default function DynamicEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) {
	const [cursorOffset, setCursorOffset] = useState({x: 0, y: 0});
	const [isHoveringHandle, setIsHoveringHandle] = useState(false);

	// Base offset to center the edge on the visual indicator
	const baseOffset = 8; // Half of handle size (24px) minus half of dot size (8px)

	// Track mouse movement over handles
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const element = e.target as HTMLElement;
			const handle = element.closest('.react-flow__handle');

			if (handle) {
				const rect = handle.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;

				// Calculate offset from center (max ±4px for subtle movement)
				const maxOffset = 4;
				const xOffset = Math.max(
					-maxOffset,
					Math.min(maxOffset, (e.clientX - centerX) * 0.5)
				);
				const yOffset = Math.max(
					-maxOffset,
					Math.min(maxOffset, (e.clientY - centerY) * 0.5)
				);

				setCursorOffset({x: xOffset, y: yOffset});
				setIsHoveringHandle(true);
			}
		};

		const handleMouseLeave = () => {
			setIsHoveringHandle(false);
			setCursorOffset({x: 0, y: 0});
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	// Calculate adjusted positions
	let adjustedSourceX = sourceX;
	let adjustedTargetX = targetX;
	let adjustedSourceY = sourceY;
	let adjustedTargetY = targetY;

	// Apply base offset based on handle position
	if (sourcePosition === Position.Right) {
		adjustedSourceX -= baseOffset;
	} else if (sourcePosition === Position.Left) {
		adjustedSourceX += baseOffset;
	}

	if (targetPosition === Position.Left) {
		adjustedTargetX += baseOffset;
	} else if (targetPosition === Position.Right) {
		adjustedTargetX -= baseOffset;
	}

	// Apply cursor offset when hovering (smooth transition)
	if (isHoveringHandle) {
		adjustedSourceX += cursorOffset.x * 0.3;
		adjustedSourceY += cursorOffset.y * 0.3;
		adjustedTargetX += cursorOffset.x * 0.3;
		adjustedTargetY += cursorOffset.y * 0.3;
	}

	const [path] = getBezierPath({
		sourceX: adjustedSourceX,
		sourceY: adjustedSourceY,
		targetX: adjustedTargetX,
		targetY: adjustedTargetY,
		sourcePosition: sourcePosition ?? Position.Bottom,
		targetPosition: targetPosition ?? Position.Top,
	});

	return (
		<g className='react-flow__edge'>
			<BaseEdge
				id={id}
				path={path}
				style={{
					transition: isHoveringHandle ? 'none' : 'stroke-dashoffset 0.5s ease',
				}}
			/>
		</g>
	);
}
