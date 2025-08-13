import type {IRModule} from '@/lib/ir/types';

const FENCE_START = '// BEGIN GENERATED:';
const FENCE_END = '// END GENERATED';

export type EmitOptions = {
	componentName?: string;
};

export function emitReactModule(
	module: IRModule,
	opts: EmitOptions = {}
): string {
	const componentName =
		opts.componentName ?? module.tree.moduleName ?? 'MainScene';
	const header = `/**
 * This file is generated. Manual edits outside fenced regions will be preserved.
 */`;

	const imports = [
		"import React from 'react'",
		"import { Canvas } from '@react-three/fiber'",
		"import * as THREE from 'three'",
	].join('\n');

	const importsRegion = [`${FENCE_START} imports`, imports, FENCE_END].join(
		'\n'
	);

	// Minimal JSX tree placeholder; later this will walk TreeLayer
	const jsx = [
		'<Canvas>',
		'  {/* scene content */}',
		'  <group />',
		'</Canvas>',
	].join('\n');

	const componentRegion = [
		`${FENCE_START} component`,
		`export function ${componentName}() {`,
		`  return (`,
		jsx,
		`  );`,
		`}`,
		FENCE_END,
	].join('\n');

	const exportRegion = [
		`${FENCE_START} exports`,
		`export default ${componentName};`,
		FENCE_END,
	].join('\n');

	return [
		header,
		importsRegion,
		'',
		componentRegion,
		'',
		exportRegion,
		'',
	].join('\n');
}
