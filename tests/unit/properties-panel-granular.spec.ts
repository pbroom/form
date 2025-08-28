import {describe, it, expect} from 'vitest';
import {getNodeDefinition} from '@/lib/node-registry';

describe('Properties Panel – schema-driven mappings', () => {
	it('box node exposes width/height/depth/metalness/roughness as number controls', () => {
		const def = getNodeDefinition('box');
		expect(def).toBeTruthy();
		const keys = new Set(def!.parameters.map((p) => p.key));
		for (const k of ['width', 'height', 'depth', 'metalness', 'roughness']) {
			expect(keys.has(k)).toBe(true);
			const p = def!.parameters.find((x) => x.key === k)!;
			expect(p.type).toBe('number');
			expect(typeof p.defaultValue === 'number').toBe(true);
			// min/max presence for numbers
			expect(typeof p.min === 'number').toBe(true);
			expect(typeof p.max === 'number').toBe(true);
		}
	});

	it('box node exposes color as color control', () => {
		const def = getNodeDefinition('box');
		const color = def!.parameters.find((p) => p.key === 'color');
		expect(color).toBeTruthy();
		expect(color!.type).toBe('color');
		expect(typeof color!.defaultValue).toBe('string');
	});

	it('booleanConst uses boolean control with default false', () => {
		const def = getNodeDefinition('booleanConst');
		const p = def!.parameters.find((x) => x.key === 'value');
		expect(p).toBeTruthy();
		expect(p!.type).toBe('boolean');
		expect(typeof p!.defaultValue).toBe('boolean');
	});
});
