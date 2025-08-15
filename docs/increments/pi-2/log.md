# Increment Log – pi-2

## Entry 1

Initialized PI-2 charter and planning; established expanded scope beyond basic box demo toward realistic, parameterized scene generation.

- Action: Created PI-2 charter with 5 major efforts focusing on TreeLayer codegen, viewport integration, automated adapters, scene templates, and validation
- Files/Areas: `docs/increments/pi-2/charter.md`, `docs/increments/pi-2/log.md`
- Decisions: Focus on bridging gap between demo and genuine tool usability; maintain PI-1 test compatibility
- Issues/Risks: Large scope requires careful sequencing to maintain working state throughout
- Learnings: Clear effort breakdown helps tackle complex multi-system integration
- Tests/Artifacts: N/A yet

## Entry 2

Implemented TreeLayer-walking codegen that generates real JSX from graph nodes and integrated IR-based viewport rendering.

- Action: Complete rewrite of React emitter to walk dependency graph and emit parameterized JSX; updated viewport to render scenes from IR
- Files/Areas: `src/lib/codegen/react/index.ts`, `src/components/Viewport.tsx`, `src/components/NodeGraphEditor.tsx`, `tests/unit/codegen-treelayer.spec.ts`
- Decisions: Export COMPONENT_MAPPINGS for reuse; use dependency resolution for proper render order; maintain legacy box fallback for compatibility
- Issues/Risks: Playwright tests have config conflict with Vitest; three.js rendering testing requires more setup
- Learnings: IR-to-JSX transformation works cleanly; component mapping pattern scales well for different node types
- Tests/Artifacts: 6 new TreeLayer codegen tests passing; all unit tests green; dev server shows live IR-based rendering

## Entry 3

Implemented connection-driven rendering with proper scene graph hierarchy and Camera/Render node types per user feedback.

- Action: Enhanced PI-2 with Camera→Scene→Render flow; only connected nodes affect viewport; conditional lighting based on graph connections
- Files/Areas: `src/lib/codegen/react/index.ts`, `src/components/Viewport.tsx`, `src/lib/node-registry.ts`, `tests/unit/viewport-connection-driven.spec.ts`
- Decisions: Render nodes as graph roots; trace connections via breadth-first search; suppress default lights when custom lights connected
- Issues/Risks: None; addressed fundamental UX issue where nodes affected scene without proper connections
- Learnings: Connection-driven semantics essential for node graph editors; light detection requires full connectivity analysis
- Tests/Artifacts: 5 new connection-driven tests passing; 18 unit tests total; realistic node graph behavior

## Entry 4

Completed automated adapter generation pipeline with 19 drei components and comprehensive testing.

- Action: Built automated registry generator script; expanded from 5 to 19 drei components; added parameter type inference and categorization
- Files/Areas: `scripts/generate-drei-registry.ts`, `package.json`, `tests/unit/automated-adapter.spec.ts`, `src/generated/drei.registry.json`
- Decisions: Use curated component mapping for stability; infer parameter types from naming patterns; ES module script with tsx runner
- Issues/Risks: Peer dependency conflicts with drei installation; resolved with --legacy-peer-deps flag
- Learnings: Automated generation more reliable than manual curation; parameter inference patterns work well for common drei props
- Tests/Artifacts: 9 new automated adapter tests passing; 27 unit tests total; 19 components across geometry/material/utility categories

## Entry 5

Fixed critical connection-driven rendering issues identified by user feedback on default scene behavior.

- Action: Enforced strict connection-driven rendering; removed legacy fallbacks; added input handles to structural nodes; comprehensive test updates
- Files/Areas: `src/components/Viewport.tsx`, `src/components/NodeGraphEditor.tsx`, `src/lib/codegen/react/index.ts`, `src/lib/node-registry.ts`, `tests/unit/strict-connection-driven.spec.ts`
- Decisions: Zero tolerance for legacy fallbacks; nodes only render when connected to render root; scene/render nodes get input handles for proper hierarchy
- Issues/Risks: Required updating legacy tests to match new strict behavior; Playwright e2e tests have config issues (unrelated)
- Learnings: Consistent connection-driven semantics crucial for user experience; legacy fallbacks undermine the core value proposition
- Tests/Artifacts: 4 new strict connection tests; 31 unit tests passing; viewport shows empty scene until proper connections made

## Entry 6

Enhanced user experience with default render node and improved command palette for structural nodes.

- Action: Added default render node to initial scene; created default connections (Box→Scene→Render); added Render/Camera nodes to command palette
- Files/Areas: `src/components/NodeGraphEditor.tsx`, `tests/unit/default-scene.spec.ts`
- Decisions: Provide working scene out of the box; make structural nodes easily accessible via palette; maintain connection-driven semantics
- Issues/Risks: None; changes purely additive and improve immediate usability
- Learnings: Strict connection-driven approach needs good defaults to prevent user friction; palette should prioritize essential structural nodes
- Tests/Artifacts: 2 new default scene tests; 33 unit tests passing; users get working scene immediately with clear connection hierarchy

## Entry 7

Pivoted Scene Templates to Advanced Parameter System based on user feedback about core interaction patterns.

- Action: Replaced Scene Templates effort with Advanced Parameter System; expanded box node with 7 granular parameters; enhanced codegen with material property support
- Files/Areas: `docs/increments/pi-2/charter.md`, `src/lib/node-registry.ts`, `src/lib/codegen/react/index.ts`, `src/components/PropertiesPanel.tsx`
- Decisions: Focus on fundamental parameter exposure over templates; box node now has width/height/depth/color/metalness/roughness/wireframe controls
- Issues/Risks: Properties panel already had dynamic control generation; more complex connection workflows remain
- Learnings: User feedback identified templates as secondary to core node interaction patterns; parameter-rich nodes essential for real use
- Tests/Artifacts: 33 unit tests passing; box node now generates rich material properties; properties panel shows all parameter types

## Entry 8

Completed Advanced Parameter & Connection System and Graph Validation implementation.

- Action: Implemented smart connection workflow with parameter selection overlay; added comprehensive graph validation system with type checking
- Files/Areas: `src/components/ParameterConnectionOverlay.tsx`, `src/lib/validation/graph-validation.ts`, `src/components/NodeGraphEditor.tsx`, `src/components/PropertiesPanel.tsx`, `tests/unit/graph-validation.spec.ts`
- Decisions: Click handle → hover node → select parameter workflow; real-time validation with user feedback; type-safe connections prevent invalid graph states
- Issues/Risks: Drei adapter registry overrides base node definitions; validation works with actual drei-generated node structure
- Learnings: Smart connection UX requires sophisticated state management; validation must align with actual runtime node definitions; properties panel can show inline validation errors
- Tests/Artifacts: 41 unit tests passing; smart connection overlay functional; type validation prevents invalid parameters; connection validation prevents incompatible node connections

## Entry 9

Introduced primitive constant nodes and value-flow evaluation so connections can drive parameters directly; added hooks for basic math nodes.

- Action: Added `numberConst`, `colorConst`, `booleanConst`, `stringConst`; compute effective parameter values from inbound edges during IR build; exposed constants and math stubs in palette
- Files/Areas: `src/lib/node-registry.ts`, `src/components/NodeGraphEditor.tsx`
- Decisions: Evaluate simple utility node outputs recursively without changing IR schema; keep transforms minimal (add/multiply)
- Issues/Risks: Need focused unit tests for math chaining; ensure no cycles are evaluated (kept to acyclic usage)
- Learnings: Value propagation at IR-construction time keeps viewport and codegen consistent
- Tests/Artifacts: All unit tests remain green (41/41)
