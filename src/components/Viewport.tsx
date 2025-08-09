import {Canvas} from '@react-three/fiber';
import {Suspense, useMemo} from 'react';

type BoxParams = {
	width: number;
	height: number;
	depth: number;
	color: string;
};

export type ViewGraphState = {
	// In the future this will be derived from the actual node graph
	// For now, we only render an optional box for immediate feedback
	box?: BoxParams;
};

function BoxMesh({width, height, depth, color}: BoxParams) {
	// stable geometry args
	const args = useMemo(
		() => [width, height, depth] as [number, number, number],
		[width, height, depth]
	);
	return (
		<mesh>
			<boxGeometry args={args} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}

export default function Viewport({state}: {state: ViewGraphState}) {
	return (
		<div className='w-full h-full bg-secondary'>
			<Canvas camera={{position: [2.5, 2, 4], fov: 50}}>
				{/* Lights */}
				<ambientLight intensity={0.7} />
				<directionalLight position={[3, 3, 3]} intensity={0.8} />
				<Suspense fallback={null}>
					{state.box ? (
						<BoxMesh
							width={state.box.width}
							height={state.box.height}
							depth={state.box.depth}
							color={state.box.color}
						/>
					) : null}
				</Suspense>
			</Canvas>
		</div>
	);
}
