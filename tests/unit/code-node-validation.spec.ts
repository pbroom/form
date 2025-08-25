import {describe, it, expect} from 'vitest';
import {validateCodeNodeSource} from '@/lib/validation/code-node';

describe('Code Node validation', () => {
	it('rejects empty source', () => {
		const res = validateCodeNodeSource('');
		expect(res.ok).toBe(false);
	});

	it('requires export function node', () => {
		const res = validateCodeNodeSource('function notExported() {}');
		expect(res.ok).toBe(false);
	});

	it('rejects unbalanced braces', () => {
		const res = validateCodeNodeSource('export function node(){');
		expect(res.ok).toBe(false);
	});

	it('accepts minimal valid function', () => {
		const res = validateCodeNodeSource('export function node(){ return 1 }');
		expect(res.ok).toBe(true);
	});
});
