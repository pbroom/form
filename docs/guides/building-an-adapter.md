# Building an Adapter (Playbook)

This guide shows how to ingest external libraries (e.g., three.js, react-three-fiber, drei) to auto-generate node templates for the editor using an intermediate representation (IR).

## What an adapter does

- Introspects a library (types/exports)
- Produces a registry of node templates (JSON) the editor can load at runtime
- Optionally adds emitter hints (how the code generator should render nodes)

## Prerequisites

- Node 20+, TypeScript
- ts-morph (or the TypeScript compiler API) for .d.ts introspection
- Familiarity with the IR layers: GraphLayer, TreeLayer, MetaLayer

## Outputs (target schema)

A minimal Node Template (example):

```json
{
	"key": "OrbitControls",
	"label": "OrbitControls",
	"category": "Helper",
	"kind": "TreeNode",
	"props": [
		{"key": "enableZoom", "type": "boolean", "optional": true, "default": true},
		{"key": "minPolarAngle", "type": "number", "optional": true}
	],
	"ports": [{"key": "children", "direction": "in", "type": "TreeNode[]"}],
	"constraints": {"requiresCanvas": true, "allowsChildren": true},
	"emitter": {"jsxTag": "OrbitControls"}
}
```

## Step-by-step

### 1) Decide scope and categories

- Which exports to include (components, functions, classes)
- Category mapping (Geometry, Material, Light, Helper, Math, Effect)
- Kind mapping:
  - TreeNode → renders to JSX/scene graph
  - Function → pure computation (GraphLayer)
  - Effect → imperative lifecycle (MetaLayer)

### 2) Introspect with ts-morph

```ts
import {Project, SyntaxKind} from 'ts-morph';

const project = new Project({
	tsConfigFilePath: 'node_modules/@types/three/tsconfig.json',
	skipAddingFilesFromTsConfig: true,
});

// Add declaration files you want to scan (example: drei types)
project.addSourceFilesAtPaths('node_modules/@types/*/**/*.d.ts');

const sourceFiles = project.getSourceFiles();

function extractExports() {
	const items: {name: string; kind: 'TreeNode' | 'Function' | 'Effect'}[] = [];
	for (const sf of sourceFiles) {
		for (const exp of sf.getExportedDeclarations().keys()) {
			const decls = sf.getExportedDeclarations().get(exp) ?? [];
			for (const d of decls) {
				const name = exp.toString();
				// Heuristic examples; tailor per library
				const isComponent =
					d.getKindName().includes('Class') ||
					d.getKind() === SyntaxKind.FunctionDeclaration;
				const kind = isComponent ? 'TreeNode' : 'Function';
				items.push({name, kind});
			}
		}
	}
	return items;
}

console.log(extractExports());
```

### 3) Infer props/args and types

```ts
import {NodeTemplate, PropSpec} from './schema';

function toSimpleType(tsType: string): string {
	// Map TS types to editor port types (simplified)
	if (/(number|float|double)/i.test(tsType)) return 'number';
	if (/(boolean)/i.test(tsType)) return 'boolean';
	if (/(string)/i.test(tsType)) return 'string';
	if (/Vector\d/i.test(tsType)) return 'Vector';
	return 'any';
}

function extractProps(decl: any): PropSpec[] {
	// Example: read component props interface and map to PropSpec
	const props: PropSpec[] = [];
	// Use ts-morph reflection over signatures/heritage to collect members
	// ...
	return props;
}

function toTemplate(
	name: string,
	kind: 'TreeNode' | 'Function',
	props: PropSpec[]
): NodeTemplate {
	return {
		key: name,
		label: name,
		category: kind === 'TreeNode' ? 'Helper' : 'Utility',
		kind,
		props,
		ports:
			kind === 'TreeNode'
				? [{key: 'children', direction: 'in', type: 'TreeNode[]'}]
				: [],
		constraints: {
			requiresCanvas: kind === 'TreeNode',
			allowsChildren: kind === 'TreeNode',
		},
		emitter: kind === 'TreeNode' ? {jsxTag: name} : {call: name},
	};
}
```

### 4) Generate a registry JSON

```ts
import fs from 'node:fs/promises';

async function generateRegistry(templates: NodeTemplate[]) {
	const out = {version: 1, library: 'drei', templates};
	await fs.mkdir('generated', {recursive: true});
	await fs.writeFile(
		'generated/drei.registry.json',
		JSON.stringify(out, null, 2)
	);
}
```

### 5) Load the registry at runtime

```ts
// src/lib/node-registry.ts (loader example)
import drei from '../../generated/drei.registry.json';

export function loadExternalTemplates() {
	for (const t of drei.templates ?? []) {
		// Convert NodeTemplate → internal NodeTypeDefinition
		// Map props to parameters; set appearance/category
		// Register into NODE_DEFINITIONS
	}
}
```

### 6) Semantics and constraints

- Mark nodes that must live under `<Canvas>`
- Mark "leaf" nodes or nodes that require children
- For functions with side effects, set `kind: 'Effect'` and add emitter hints (e.g., `useEffect`)

### 7) Emitter hints

- JSX tag name (for TreeNode)
- Call signature (for Function)
- Placement rules (lift to component top as hook/state node)

### 8) Validation and tests

- Validate generated registry against a JSON Schema/Zod spec
- Snapshot test a few known templates (e.g., `OrbitControls`, `Box`) to prevent regressions

## "Hello drei" example

Extract `OrbitControls` and `Box` from `@react-three/drei` and produce templates.

```ts
const items = [
	{name: 'OrbitControls', kind: 'TreeNode' as const},
	{name: 'Box', kind: 'TreeNode' as const},
];

const templates = items.map((i) =>
	toTemplate(i.name, i.kind, [{key: 'args', type: 'any', optional: true}])
);

await generateRegistry(templates);
```

Registry output snippet:

```json
{
	"version": 1,
	"library": "drei",
	"templates": [
		{
			"key": "OrbitControls",
			"kind": "TreeNode",
			"emitter": {"jsxTag": "OrbitControls"}
		},
		{"key": "Box", "kind": "TreeNode", "emitter": {"jsxTag": "Box"}}
	]
}
```

## CLI and scripts

Add a script:

```json
{
	"scripts": {
		"adapters:generate": "ts-node scripts/adapters/generate-drei.ts"
	}
}
```

Skeleton `scripts/adapters/generate-drei.ts`:

```ts
async function main() {
	// 1) locate drei types
	// 2) extract exports and props
	// 3) build NodeTemplate[]
	// 4) write generated/drei.registry.json
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
```

## Acceptance checklist

- [ ] Registry JSON validates against schema
- [ ] At least N nodes covered with accurate prop typing
- [ ] Nodes render via emitter (React/R3F) without manual overrides
- [ ] Round-trip safe: no free-form code required for generated regions

## Tips

- Start curated: whitelist a small set of exports; expand gradually
- Keep mapping tables for tricky types (e.g., `Vector3`, `Color`)
- Use deterministic ordering for stable diffs
