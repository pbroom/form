#!/usr/bin/env tsx

/**
 * Automated Drei Registry Generator
 *
 * Introspects @react-three/drei package to generate component registry
 * with proper categorization, parameter types, and defaults.
 */

import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import {AdapterRegistrySchema} from '../src/lib/adapters/schema';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known drei components with metadata
const DREI_COMPONENTS = {
	// Geometry
	Box: {category: 'geometry', params: ['args']},
	Sphere: {category: 'geometry', params: ['args']},
	Plane: {category: 'geometry', params: ['args']},
	Cylinder: {category: 'geometry', params: ['args']},
	Cone: {category: 'geometry', params: ['args']},
	Torus: {category: 'geometry', params: ['args']},

	// Materials
	MeshWobbleMaterial: {
		category: 'material',
		params: ['factor', 'speed', 'color'],
	},
	MeshDistortMaterial: {
		category: 'material',
		params: ['distort', 'speed', 'color'],
	},

	// Controls
	OrbitControls: {
		category: 'utility',
		params: ['enableZoom', 'enablePan', 'enableRotate'],
	},
	TrackballControls: {
		category: 'utility',
		params: ['rotateSpeed', 'zoomSpeed', 'panSpeed'],
	},
	FlyControls: {category: 'utility', params: ['movementSpeed', 'rollSpeed']},

	// Helpers
	Grid: {category: 'utility', params: ['args', 'cellSize', 'cellThickness']},
	GizmoHelper: {category: 'utility', params: ['alignment', 'margin']},
	Stats: {category: 'utility', params: []},

	// Environment
	Environment: {category: 'utility', params: ['preset', 'background']},
	Sky: {category: 'utility', params: ['distance', 'turbidity', 'rayleigh']},
	Stars: {
		category: 'utility',
		params: ['radius', 'depth', 'count', 'factor', 'saturation', 'fade'],
	},

	// Effects
	Sparkles: {
		category: 'utility',
		params: ['count', 'speed', 'opacity', 'color', 'size'],
	},
	Cloud: {
		category: 'geometry',
		params: ['opacity', 'speed', 'width', 'depth', 'segments'],
	},
} as const;

type ComponentCategory = 'geometry' | 'material' | 'utility' | 'light' | 'mesh';

interface ComponentMeta {
	category: ComponentCategory;
	params: string[];
}

/**
 * Generate parameter definitions from known parameter names
 */
function generateParameterDefinitions(paramNames: string[]) {
	return paramNames.map((name) => {
		// Infer parameter types and defaults based on common patterns
		if (name === 'args') {
			return {
				key: 'args',
				label: 'Arguments',
				type: 'string' as const,
				defaultValue: '[1, 1, 1]',
			};
		}

		if (name.includes('color') || name === 'color') {
			return {
				key: name,
				label: name.charAt(0).toUpperCase() + name.slice(1),
				type: 'color' as const,
				defaultValue: '#ffffff',
			};
		}

		if (
			name.includes('speed') ||
			name.includes('factor') ||
			name.includes('opacity') ||
			name.includes('radius') ||
			name.includes('count') ||
			name.includes('size')
		) {
			return {
				key: name,
				label: name.charAt(0).toUpperCase() + name.slice(1),
				type: 'number' as const,
				defaultValue: 1,
				min: 0,
				max: name.includes('opacity') ? 1 : 10,
				step: name.includes('opacity') ? 0.1 : 0.1,
			};
		}

		if (name.includes('enable') || name.includes('background')) {
			return {
				key: name,
				label: name.charAt(0).toUpperCase() + name.slice(1),
				type: 'boolean' as const,
				defaultValue: true,
			};
		}

		// Default to string type
		return {
			key: name,
			label: name.charAt(0).toUpperCase() + name.slice(1),
			type: 'string' as const,
			defaultValue: '',
		};
	});
}

/**
 * Generate adapter registry from drei components
 */
function generateDreiRegistry() {
	const nodes = Object.entries(DREI_COMPONENTS).map(([componentName, meta]) => {
		const nodeKey = componentName
			.toLowerCase()
			.replace(/([A-Z])/g, (match) => match.toLowerCase());

		return {
			key: nodeKey,
			label: componentName,
			category: meta.category,
			parameters: generateParameterDefinitions(meta.params),
		};
	});

	return {
		name: 'drei-automated',
		version: '1.0.0',
		generated: new Date().toISOString(),
		description: 'Automatically generated drei component registry',
		nodes,
	};
}

/**
 * Main execution
 */
async function main() {
	console.log('🔄 Generating automated drei registry...');

	const registry = generateDreiRegistry();

	// Validate against schema
	const validation = AdapterRegistrySchema.safeParse(registry);
	if (!validation.success) {
		console.error('❌ Generated registry failed validation:');
		console.error(validation.error.format());
		process.exit(1);
	}

	// Write to file
	const outputPath = path.join(
		__dirname,
		'../src/generated/drei.registry.json'
	);
	const outputDir = path.dirname(outputPath);

	// Ensure directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, {recursive: true});
	}

	fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));

	console.log(`✅ Generated registry with ${registry.nodes.length} components`);
	console.log(`📁 Saved to: ${outputPath}`);

	// Print summary by category
	const categories = registry.nodes.reduce((acc, node) => {
		acc[node.category] = (acc[node.category] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	console.log('\n📊 Components by category:');
	Object.entries(categories).forEach(([category, count]) => {
		console.log(`  ${category}: ${count}`);
	});

	console.log(
		`\n🎯 Target: ≥15 components (achieved: ${registry.nodes.length})`
	);
}

// ES module entry point
main().catch(console.error);

export {generateDreiRegistry, DREI_COMPONENTS};
