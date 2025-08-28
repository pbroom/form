# Increment Charter – pi-2

## Context Capsule

- Aim: Expand the foundation from PI-1 to emit realistic, parameterized scenes that render meaningfully in the viewport. Bridge the gap between simple box demo and genuine usable tool.
- Constraints/Guardrails: Maintain deterministic output; preserve test suite; extend rather than replace PI-1 foundations; TreeLayer walking must be safe and validated.

## Focus (What we ship)

- TreeLayer-walking codegen that emits real JSX from the graph; viewport that renders actual scene content; automated adapter generation pipeline; expanded drei coverage (15+ components); advanced parameter & connection system; parameter value flow with primitive constants and math transforms.

## Prioritized Acceptance Criteria (Cornerstones)

- **Parameterized Codegen**: TSX emitter walks TreeLayer and outputs components with actual props from graph parameters; no more placeholder JSX
- **Connection-Driven Scene Rendering**: Viewport displays only connected nodes through proper scene graph hierarchy (Camera→Scene→Render flow)
- **Automated Adapter Pipeline**: Script generates drei registry from live package introspection; expanded coverage (≥15 components) across geometries, materials, controls, helpers
- **Advanced Parameter & Connection System**: Smart parameter controls, dynamic ports, and connection workflow driving real-time updates
- **Parameter Value Flow & Primitive Nodes**: Constants and math transforms with recursive evaluation to drive node parameters
- **Graph Validation**: Type-aware parameter validation; reject invalid connections before they reach emitter

## Efforts

- Effort: TreeLayer Codegen Walker

  - Tasks:
    - [x] Walk graph nodes in dependency order (CG3)
    - [x] Emit JSX elements with props from parameters (CG4)
    - [x] Handle materials, geometries, meshes, lights composition (CG5)
    - [x] Generate imports based on used components (CG6)
  - ACs:
    - [x] Box + BasicMaterial scene emits `<mesh><boxGeometry args={[w,h,d]} /><meshStandardMaterial color={...} /></mesh>`
    - [x] Multiple materials connect to same geometry; multiple geometries to same material
    - [x] Generated imports only include actually used components
  - Tests (TDD): Snapshot-based TSX output for reference scenes; isolated walker unit tests
  - Steps: Extend `src/lib/codegen/react/index.ts` with dependency resolution and JSX generation
  - Estimate: L
  - Status: Done

- Effort: Connection-Driven Viewport Integration

  - Tasks:
    - [x] IR-driven Three.js scene construction (VP1)
    - [x] Real-time updates from parameter changes (VP2)
    - [x] Connection-dependent rendering from render root (VP3)
    - [x] Scene graph hierarchy: Camera→Scene→Render flow (VP4)
    - [x] Restore input handles to structural nodes (VP5)
  - ACs:
    - [x] Viewport displays actual scene matching current IR state
    - [x] Parameter changes update viewport within 100ms
    - [x] Only nodes connected to render root affect viewport output
    - [x] Camera, Scene, and Render nodes establish proper hierarchy
    - [x] Disconnected nodes (e.g., lights) don't affect scene until wired
  - Tests: Connection-driven rendering tests; scene graph hierarchy validation; viewport isolation tests
  - Steps: Add Camera/Render node types; implement connection filtering in IRScene; restore structural node handles
  - Estimate: L
  - Status: Done

- Effort: Automated Adapter Generation

  - Tasks:
    - [x] Package introspection script for drei (AD3)
    - [x] Automated component metadata extraction (AD4)
    - [x] Parameter type inference and defaults (AD5)
    - [x] Registry generation with categories and search metadata (AD6)
  - ACs:
    - [x] Script generates registry covering ≥15 drei components automatically
    - [x] Generated components have proper parameter types and defaults
    - [x] Registry includes categories (Geometry, Material, Controls, Helpers, etc.)
    - [x] Output validates against adapter schema
  - Tests: Unit tests for metadata extraction; schema validation of generated registry; coverage metrics
  - Steps: Create `scripts/generate-drei-registry.ts`; refactor manual registry to generated
  - Estimate: M
  - Status: Done

- Effort: Advanced Parameter & Connection System

  - Tasks:
    - [x] Expand box node with granular parameters (width, height, depth, color, material) (AP1)
    - [x] Dynamic parameter exposure in properties panel based on node type (AP2)
    - [x] Smart parameter type controls (sliders, color pickers, dropdowns) (AP3)
    - [x] Handle-based connection workflow: click handle → hover node → select parameter (AP4)
    - [x] Dynamic port creation and labeling for connected parameters (AP5)
  - ACs:
    - [x] Box node exposes individual width/height/depth controls with proper ranges
    - [x] Properties panel automatically generates appropriate controls for each parameter type
    - [x] Users can click a source handle, hover target node, and see available parameters
    - [x] Connections create labeled input ports on target nodes dynamically
    - [x] Parameter connections update viewport in real-time
  - Tests: Parameter control rendering tests; connection workflow e2e tests; viewport update validation
  - Steps: Expand node definitions; enhance properties panel; implement smart connection UI
  - Estimate: L
  - Status: Done

- Effort: Parameter Value Flow & Primitive Nodes

  - Tasks:
    - [x] Add constant nodes (number, color, boolean, string)
    - [x] Compute effective parameter values from inbound edges
    - [x] Expose constants and basic math nodes in palette
    - [x] Add math transform nodes (add, multiply) with recursive evaluation
  - ACs:
    - [x] Connecting a constant node to a parameter updates the viewport and export
    - [x] Chaining add/multiply updates target parameters deterministically
  - Tests: 6 new math node value flow tests; comprehensive coverage of recursive evaluation
  - Steps: Evaluate utility node outputs during IR generation; propagate values into node params
  - Estimate: M
  - Status: Done

- Effort: Graph Validation & Type Safety

  - Tasks:
    - [x] Parameter type validation system (GV1)
    - [x] Connection compatibility checking (GV2)
    - [x] Runtime validation in IR ops (GV3)
    - [x] User feedback for invalid operations (GV4)
  - ACs:
    - [x] Cannot connect incompatible types (e.g., number to boolean parameter)
    - [x] Parameter inputs show validation errors for out-of-range values
    - [x] IR operations reject invalid changes with helpful error messages
    - [x] Graph remains in valid state after any sequence of operations
  - Tests: Unit tests for validation rules; e2e tests for error handling
  - Steps: Extend IR schema with type constraints; add validation to ops; UI error display
  - Estimate: M
  - Status: Done

## Scope Fence (Out of Scope)

- Code-to-node import/conversion system (planned for future increment)
- Animation timeline/keyframes; complex hooks (useFrame, useRef patterns); realtime collaboration; full three.js imperative emitter; advanced material node editor; custom geometry creation
- Scene templates and quickstart workflows (deferred to focus on core parameter system)

## Exit Criteria

- ✅ TSX emitter produces realistic scene code that matches viewport rendering
- ✅ Automated adapter covers ≥15 drei components (achieved: 19)
- ✅ All PI-1 tests still pass plus new coverage (47 tests passing)
- ✅ Type validation prevents invalid graph states
- ✅ Connection-driven rendering with proper scene graph hierarchy
- ✅ Advanced parameter system with smart connections and value flow
- ✅ Math transform nodes with recursive evaluation
- 🔄 Scene templates deferred to focus on core parameter system (per scope fence)
- 🔄 Demo video not required for completion (can be created post-increment)

**PI-2 Status: ✅ COMPLETE** - All core efforts completed; exit criteria satisfied for shipped scope

Status: Done
