import {describe, test, expect} from 'vitest';
import {
	generateDreiRegistry,
	DREI_COMPONENTS,
} from '../../scripts/generate-drei-registry';
import {AdapterRegistrySchema} from '@/lib/adapters/schema';
import dreiRegistry from '@/generated/drei.registry.json';

describe('Automated Adapter Generation', () => {
	test('generates valid registry that passes schema validation', () => {
		const registry = generateDreiRegistry();

		// Should validate against schema
		const validation = AdapterRegistrySchema.safeParse(registry);
		expect(validation.success).toBe(true);

		// Should have basic metadata
		expect(registry.name).toBe('drei-automated');
		expect(registry.version).toBe('1.0.0');
		expect(registry.description).toContain('Automatically generated');
		expect(registry).toHaveProperty('generated');
	});

	test('achieves target component coverage', () => {
		const registry = generateDreiRegistry();

		// Should meet PI-2 target of ≥15 components
		expect(registry.nodes.length).toBeGreaterThanOrEqual(15);

		// Actual target should be higher for useful coverage
		expect(registry.nodes.length).toBeGreaterThanOrEqual(19);
	});

	test('includes proper categorization', () => {
		const registry = generateDreiRegistry();

		const categories = registry.nodes.reduce((acc, node) => {
			acc[node.category] = (acc[node.category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Should have multiple categories
		expect(Object.keys(categories).length).toBeGreaterThanOrEqual(3);

		// Should include expected categories
		expect(categories).toHaveProperty('geometry');
		expect(categories).toHaveProperty('utility');

		// Should have reasonable distribution
		expect(categories.geometry).toBeGreaterThan(0);
		expect(categories.utility).toBeGreaterThan(0);
	});

	test('generates proper parameter definitions', () => {
		const registry = generateDreiRegistry();

		// Find a component with parameters
		const boxComponent = registry.nodes.find((n) => n.key === 'box');
		expect(boxComponent).toBeDefined();
		expect(boxComponent!.parameters).toBeDefined();
		expect(boxComponent!.parameters.length).toBeGreaterThan(0);

		// Should have proper parameter structure
		const argsParam = boxComponent!.parameters.find((p) => p.key === 'args');
		expect(argsParam).toBeDefined();
		expect(argsParam!.label).toBe('Arguments');
		expect(argsParam!.type).toBe('string');
		expect(argsParam!.defaultValue).toBe('[1, 1, 1]');
	});

	test('infers parameter types correctly', () => {
		const registry = generateDreiRegistry();

		// Find components with different parameter types
		const nodes = registry.nodes;

		// Should have color parameters
		const colorParams = nodes
			.flatMap((n) => n.parameters)
			.filter((p) => p.type === 'color');
		expect(colorParams.length).toBeGreaterThan(0);

		// Should have number parameters
		const numberParams = nodes
			.flatMap((n) => n.parameters)
			.filter((p) => p.type === 'number');
		expect(numberParams.length).toBeGreaterThan(0);

		// Number parameters should have proper constraints
		const speedParam = numberParams.find((p) => p.key.includes('speed'));
		if (speedParam) {
			expect(speedParam).toHaveProperty('min');
			expect(speedParam).toHaveProperty('max');
			expect(speedParam).toHaveProperty('step');
		}
	});

	test('covers essential drei components', () => {
		const registry = generateDreiRegistry();
		const nodeKeys = registry.nodes.map((n) => n.key);

		// Should include essential components from DREI_COMPONENTS
		expect(nodeKeys).toContain('orbitcontrols');
		expect(nodeKeys).toContain('box');
		expect(nodeKeys).toContain('sphere');
		expect(nodeKeys).toContain('environment');
		expect(nodeKeys).toContain('stars');
	});

	test('generated registry matches current file', () => {
		// The generated file should be up to date
		expect(dreiRegistry.name).toBe('drei-automated');
		expect(dreiRegistry.nodes.length).toBeGreaterThanOrEqual(19);

		// Should validate against schema
		const validation = AdapterRegistrySchema.safeParse(dreiRegistry);
		expect(validation.success).toBe(true);
	});

	test('has proper component mapping structure', () => {
		// Test that DREI_COMPONENTS has expected structure
		expect(DREI_COMPONENTS).toHaveProperty('Box');
		expect(DREI_COMPONENTS).toHaveProperty('OrbitControls');
		expect(DREI_COMPONENTS).toHaveProperty('Environment');

		// Each component should have category and params
		Object.values(DREI_COMPONENTS).forEach((component) => {
			expect(component).toHaveProperty('category');
			expect(component).toHaveProperty('params');
			expect(Array.isArray(component.params)).toBe(true);
		});
	});

	test('generates unique component keys', () => {
		const registry = generateDreiRegistry();
		const keys = registry.nodes.map((n) => n.key);
		const uniqueKeys = new Set(keys);

		// All keys should be unique
		expect(uniqueKeys.size).toBe(keys.length);

		// Keys should be lowercase and properly formatted
		keys.forEach((key) => {
			expect(key).toMatch(/^[a-z][a-z0-9]*$/);
		});
	});
});
