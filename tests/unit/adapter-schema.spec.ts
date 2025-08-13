import {describe, expect, it} from 'vitest';
import {AdapterRegistrySchema} from '@/lib/adapters/schema';

describe('Adapter schema', () => {
	it('validates a minimal drei-like registry', () => {
		const reg = {
			name: 'drei-subset',
			version: '0.1.0',
			nodes: [
				{
					key: 'box',
					label: 'Box',
					category: 'mesh',
					appearanceHint: 'structure',
					parameters: [
						{key: 'width', label: 'Width', type: 'number', defaultValue: 1},
						{key: 'height', label: 'Height', type: 'number', defaultValue: 1},
						{key: 'depth', label: 'Depth', type: 'number', defaultValue: 1},
						{
							key: 'color',
							label: 'Color',
							type: 'color',
							defaultValue: '#4f46e5',
						},
					],
				},
			],
		};
		const parsed = AdapterRegistrySchema.safeParse(reg);
		expect(parsed.success).toBe(true);
	});
});
