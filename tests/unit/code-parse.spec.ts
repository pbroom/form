import {describe, it, expect} from 'vitest';
import {extractFunctionParams} from '@/lib/code/code-parse';

describe('Code parse – extractFunctionParams', () => {
	it('parses simple typed params', () => {
		const src =
			'export function node(a: number, b: string, c: boolean) { return 1 }';
		const res = extractFunctionParams(src);
		expect(res.ok).toBe(true);
		if (res.ok) {
			expect(res.params.map((p) => p.key)).toEqual(['a', 'b', 'c']);
			expect(res.params.map((p) => p.type)).toEqual([
				'number',
				'string',
				'boolean',
			]);
		}
	});

	it('returns empty when no params', () => {
		const src = 'export function node() { return 1 }';
		const res = extractFunctionParams(src);
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.params.length).toBe(0);
	});

	it('fails on unsupported forms', () => {
		const src = 'export function node(a: Vec3) { return 1 }';
		const res = extractFunctionParams(src);
		expect(res.ok).toBe(false);
	});
});
