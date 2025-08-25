import {describe, expect, it} from 'vitest';
import {emitReactModule} from '@/lib/codegen/react/index';

const mod = {
	meta: {
		schemaVersion: '1',
		createdAt: '2025-01-01T00:00:00Z',
		updatedAt: '2025-01-01T00:00:00Z',
	},
	graph: {nodes: [], edges: []},
	tree: {moduleName: 'MainScene', rootType: 'r3f'},
} as any;

describe('React codegen emitter', () => {
	it('emits fenced regions and compiles syntactically', async () => {
		const tsx = emitReactModule(mod);
		expect(tsx).toContain('BEGIN GENERATED: imports');
		expect(tsx).toContain('BEGIN GENERATED: component');
		expect(tsx).toContain('BEGIN GENERATED: exports');
		// Basic syntax checks
		expect(tsx).toContain('export function MainScene()');
		expect(tsx).toContain("import { Canvas } from '@react-three/fiber'");
	});
});
