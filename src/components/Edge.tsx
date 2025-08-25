import {BaseEdge, getBezierPath, Position} from '@xyflow/react';

type EdgeProps = {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition?: Position;
	targetPosition?: Position;
};

export default function CustomEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) {
	// Offset the connection points to account for handle size
	// Handle is 24px (size-6), we want to move 8px inward to center
	const handleOffset = 8;

	let adjustedSourceX = sourceX;
	let adjustedTargetX = targetX;

	// Adjust based on handle position
	if (sourcePosition === Position.Right) {
		adjustedSourceX -= handleOffset;
	} else if (sourcePosition === Position.Left) {
		adjustedSourceX += handleOffset;
	}

	if (targetPosition === Position.Left) {
		adjustedTargetX += handleOffset;
	} else if (targetPosition === Position.Right) {
		adjustedTargetX -= handleOffset;
	}

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
