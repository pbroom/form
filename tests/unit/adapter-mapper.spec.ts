import {describe, expect, it} from 'vitest';
import {mapAdapterToNodeDefinitions} from '@/lib/adapters/mapper';

describe('Adapter mapper', () => {
	it('maps adapter registry to runtime node definitions', () => {
		const reg = {
			name: 'drei-subset',
			version: '0.1.0',
			nodes: [
				{
					key: 'orbitControls',
					label: 'OrbitControls',
					category: 'utility',
					parameters: [],
				},
				{
					key: 'directionalLight',
					label: 'DirectionalLight',
					category: 'light',
					parameters: [
						{
							key: 'intensity',
							label: 'Intensity',
							type: 'number',
							defaultValue: 1,
						},
					],
				},
			],
		} as any;
		const defs = mapAdapterToNodeDefinitions(reg);
		expect(defs['orbitControls'].label).toBe('OrbitControls');
		expect(defs['directionalLight'].parameters[0].key).toBe('intensity');
	});
});
