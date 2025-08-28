# Product Requirements Document (PRD)

## 1. Summary

A node-based graphics authoring environment that lets developer–artist–designers visually compose interactive 3D scenes and logic using composable primitives, with immediate visual feedback, a code-agnostic core via an Intermediate Representation (IR), adapters that ingest external libraries (three.js, react-three-fiber, drei), and code generators that emit deterministic TS/TSX. The system supports portable project files, real-time collaboration, and a dogfoodable API that can also power agent/MCP integrations.

## 2. Background & Rationale

Modern graphics stacks (three.js, R3F, drei) are powerful but complex. Many workflows benefit from fast iteration, visual composition, and a bridge to clean code. The proposed tool aims to:

- Lower time-to-first-visual output
- Teach underlying APIs via a predictable node UI
- Keep abstractions “open” by exposing generated code
- Enable collaborative, repeatable, and automatable builds

References: see Architecture docs for [Node Graph Editor](./node-graph-editor.md), [Project File & State](./project-file-and-state.md), [Realtime Collaboration](./realtime-collaboration.md), and [API Layer](./api-layer.md).

## 3. Goals

- Visual editor to build scenes and logic from primitives with immediate viewport feedback
- IR-centered design with deterministic code generation and optional round-tripping
- Adapters to ingest external libraries into a runtime node registry
- Portable project files (import/export), suitable for collaboration and versioning
- Real-time, conflict-free collaboration
- Public API (dogfoodable) suitable for agents/MCP integrations

## 4. Non-Goals (initially)

- Arbitrary free-form code parsing back into a graph beyond fenced, generated regions
- Full coverage of every three.js/R3F/drei export on day one
- Advanced shader graph tooling (may come later)
- Full-blown asset pipeline and deployment infra

## 5. Personas & Use Cases

- Designer–Developer (primary): explore ideas visually, iterate quickly, export clean code
- Technical Artist: build reusable scene templates, teach teams via visual compositions
- Engineer: integrate generated components into larger apps; extend nodes via adapters
- Agent/MCP: programmatically operate the editor via API to assemble scenes or modify graphs

Top Use Cases:

- Create a scene via command palette (“Scene quickstart”), preview instantly
- Drag/wire nodes (geometry, materials, lights, controls) with type-aware ports
- Toggle “View Code” to see deterministic TSX for the current module
- Save project to file, share, and collaborate in real time
- Extend the palette by adding an adapter for a library (e.g., drei subset)

## 6. Scope & Features

### 6.1 Node Graph Editor

- Minimal nodes: label, connected inputs, one generic add-input (optional per type), output handle
- Properties Panel owns all parameter controls
- Type-aware connections; show conversion nodes for common type coercions (later)
- Command palette (N) for fast node creation and scene quickstarts
- Minimap and 3D viewport with live preview

### 6.2 IR & Adapters

- IR split: GraphLayer (dataflow), TreeLayer (JSX scene), MetaLayer (imports/hooks/state/comments)
- Adapters ingest libraries via TS introspection to produce a registry of node templates
- Deterministic registry loading at runtime; categorization for palette

### 6.3 Code Generation & Round-Trip

- React/R3F emitter (primary): imports → constants → `<Canvas>` → JSX tree
- Optional three.js imperative emitter
- Fenced, generated regions for safe round-tripping; canonical file shape

### 6.4 Project File & State

- JSON project with `schemaVersion`, modules, IR, settings
- Auto-save locally; explicit import/export; deterministic ordering for diffs

### 6.5 Realtime Collaboration

- CRDT-based shared IR (e.g., Yjs) with y-websocket – or Convex as a managed realtime backend (DB + functions + live queries)
- Presence (cursors, selections), basic roles
- Auth via provider (if Convex, use built-in auth); role mapping to projects

### 6.6 API Layer

- In-process service first; optional HTTP later
- Operations: project open/save/export/import; graph edits; codegen; preview
- Structured types and errors; stable command surface for agents/MCP

## 7. Functional Requirements (MVP)

- FR1: Create/open/save/export/import a project with a single module (MainScene)
- FR2: Add/duplicate/delete nodes; connect/disconnect edges; set parameters in Properties Panel
- FR3: Minimal palette incl. Scene/Canvas, Mesh, BoxGeometry, MeshStandardMaterial, OrbitControls, Light
- FR4: React/R3F code generation for the module with fenced regions
- FR5: Live viewport reflecting changes from IR (basic box scene)
- FR6: Adapter v1 that generates a small curated drei registry (≥ 5 components)
- FR7: Deterministic project JSON; validation on load/save
- FR8: API methods to perform FR2–FR4 programmatically

## 8. Post-MVP Requirements

- P1: Type-aware wiring and auto-insert conversion nodes
- P2: Three.js imperative emitter
- P3: Round-trip parse of fenced regions → IR
- P4: Realtime collaboration (multi-user Yjs prototype or Convex-based)
- P5: Expanded adapters (more drei/three.js/R3F coverage)
- P6: Hook/state nodes (useFrame, useMemo, global state store integration)

## 9. Non-Functional Requirements

- NFR1: Deterministic outputs (registry, IR serialization, emitted code)
- NFR2: Performance: interactive graph editing ≤ 16ms frame budget; preview debounce under load
- NFR3: Reliability: no graph corruption on concurrent edits; validated operations
- NFR4: Extensibility: documented adapter schema + plugin API
- NFR5: Accessibility: keyboard-first, ARIA labels for controls

## 10. UX Principles

- Immediate visibility; progressive disclosure
- API as interface (ports mirror props/args; types guide connections)
- Composable primitives; consistent node ergonomics
- Open abstraction: “superpowers, not magic” with code visibility

## 11. Milestones & Timeline (indicative)

- M1 (Weeks 1–2): Graph editor skeleton, Properties Panel, Box quickstart, viewport
- M2 (Weeks 3–4): IR model + basic generator (React/R3F), deterministic emit
- M3 (Weeks 5–6): Adapter v1 for drei subset; load registry into palette
- M4 (Weeks 7–8): Project import/export; JSON schema validation; docs site
- M5 (Weeks 9–10): API service surface; “operate via API” parity for core edits
- M6 (Weeks 11–12): MVP polish; tests; telemetry; docs & examples

## 12. Success Metrics (MVP)

- Time-to-first-visual: ≤ 60 seconds from fresh start
- Deterministic emit: repeated emits yield identical code for same IR
- Adapter output coverage: ≥ 5 drei components usable end-to-end
- Stability: < 1% edit operations cause errors in manual testing suite
- Docs completeness: quickstart + adapter guide + IR overview

## 13. Risks & Mitigations

- R1: Type complexity from external libraries → start curated; maintain mapping tables; validate
- R2: Hooks placement semantics → treat as special nodes and lift deterministically
- R3: Round-tripping brittleness → restrict to fenced regions; canonical templates only
- R4: Palette sprawl → categories, search, favorites, lazy load metadata
- R5: Realtime complexity/vendor lock-in → pilot with Yjs; evaluate Convex for managed backend; abstract sync layer

## 14. Open Questions

- Which subset of drei/three.js to prioritize for adapter v1?
- Do we version adapters separately from the app?
- How much state/store abstraction (e.g., Zustand) should be exposed in MetaLayer initially?
- Should API begin as in-process only or ship HTTP early for MCP remote control?

## 15. Acceptance Criteria (MVP)

- A user can: create a project, insert a quickstart scene, add a box, connect material, preview live
- Export deterministic TSX for the scene with fenced regions; re-export yields identical result
- Load adapter-generated nodes (from a generated registry) and use at least five in a scene
- Save project to file and reopen with state intact
- Drive the above via API calls (no manual UI) with parity on core operations

## 16. Documentation Deliverables

- Architecture pages (IR, adapters, codegen, collaboration, API) – complete
- Guides: Getting Started, Building an Adapter – complete and validated
- PRD (this document) linked in the docs sidebar
