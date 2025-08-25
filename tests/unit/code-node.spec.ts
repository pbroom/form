import {describe, expect, it} from 'vitest';
import {getNodeDefinition} from '@/lib/node-registry';

describe('Code Node – PI-3 scaffolding', () => {
	it('is present in registry with minimal definition', () => {
		const def = getNodeDefinition('code');
		expect(def).toBeDefined();
		expect(def?.key).toBe('code');
		expect(def?.label.toLowerCase()).toContain('code');
		// Minimal scaffold: category and appearance are utility-like, outputType may be any initially
		expect(def?.category).toBeTypeOf('string');
	});
});
