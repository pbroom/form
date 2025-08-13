# Node Graph Editor

Goals

- Represent functions and dataflow with composable primitives
- Separate rendering (ReactFlow nodes/edges) from model/state
- Keep nodes minimal: label + connected inputs; controls live in Properties Panel

Model

- NodeTypeDefinition: key, label, category, parameters
- Node instance: id, typeKey, params, label
- Edge: source node id/handle, target node id/handle

Rendering

- Custom node component renders label, connected input handles, generic add handle (optional)
- Properties Panel owns parameter controls and updates node params
- Minimap for overview; viewport for 3D output

Build guidance

- Keep node registry in `src/lib/node-registry.ts`
- Use per-parameter `targetHandle` ids; no inline controls in nodes
- Lazy input handles: render only connected inputs + optional generic
- Avoid auto-connections; selection drives Properties Panel

IR + Adapters Architecture

- Treat the editor as a visual front-end to an intermediate representation (IR), not to direct JS/React.
- Add adapters that (a) introspect libraries (three.js, r3f, drei) to generate node specs and (b) emit code from the IR.

Layers

- GraphLayer: dataflow (pure functions, signals, literals, events)
- TreeLayer: composition/JSX scene graph; props can be wired from GraphLayer
- MetaLayer: imports, module boundaries, refs/state/hooks, comments

Library Adapters

- TS introspection (ts-morph/TS API) over .d.ts to extract components/functions and their prop types/signatures
- Generate node templates: ports per prop/arg, categories, constraints (tree node vs pure function vs effect)
- Build-time step to produce a registry the editor loads at runtime

Code Generation

- React/R3F emitter: deterministic file layout (imports → constants → `<Canvas>` → JSX tree)
- Map GraphLayer edges to JSX props when simple; hoist complex wiring to consts
- Respect Rules of Hooks by treating hook-like nodes specially and lifting them to the top of components
- Three.js emitter (optional): imperative scene creation from TreeLayer, apply GraphLayer values

Round-tripping

- Restrict emitted code to a canonical template and wrap graph-owned regions with markers:

```tsx
// @graph:start TreeLayer(MainScene)
// generated – do not reorder
<mesh position={pos} ref={meshRef}>
	<boxGeometry />
	<meshStandardMaterial color={color} />
</mesh>
// @graph:end
```

- Parse only marked regions to recover IR; allow free-form user code elsewhere

MVP Steps

1. Hardcode a small r3f/drei palette; build IR; emit TSX; live preview
2. Adapter v1: parse curated drei exports; auto-generate node specs
3. Type-aware edges; auto-insert conversions (e.g., number → Vector3)
4. Add markers and implement code → IR parse for those regions
5. Hook/state nodes; deterministic lifting
6. Plugin API for adding libraries; optional three.js emitter
