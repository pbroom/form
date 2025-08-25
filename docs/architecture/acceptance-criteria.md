# Acceptance Criteria & Test Plan

This document defines black-box acceptance criteria (AC) and proposed automated tests for each subsystem. Criteria are phrased for automation and integration reliability.

## 1. Node Graph Editor (UI)

- AC1: Creating a node via command palette adds exactly one node to the graph and selects it.
  - Test: Playwright – press "N", choose "Box"; assert node count +1, selection id present.
- AC2: Connecting two nodes creates exactly one edge with correct source/target (and target handle when applicable).
  - Test: Playwright – drag from Scene output to Box generic input; assert edge model includes `targetHandle`.
- AC3: Parameter changes in Properties Panel update the rendered viewport and underlying state.
  - Test: Playwright – change Box width; assert viewport box scales and IR `params.width` updated.
- AC4: Nodes show no per-parameter inputs unless connected; optional generic input visible only if enabled and unconnected params remain.
  - Test: Playwright – inspect handles on a fresh Box; assert only generic handle (if enabled) or none.

## 2. Intermediate Representation (IR)

- AC1: IR validates against schema on load/save; invalid documents are rejected with a typed error.
  - Test: Schema validation – load malformed JSON; expect error code and message.
- AC2: IR operations (add node, connect, set prop) preserve invariants (no dangling refs, types consistent).
  - Test: Unit – apply operations; re-validate schema; assert no errors.
- AC3: Serialization is deterministic (stable key order, stable IDs aside from creation time).
  - Test: Snapshot – serialize same IR twice; deep-equal results.

## 3. Adapters

- AC1: Generated registry JSON conforms to the Node Template schema.
  - Test: Schema validation – validate generated `*.registry.json`.
- AC2: Minimum coverage (e.g., ≥5 drei components) available as palette entries with expected categories.
  - Test: Unit – load registry; assert presence of keys and categories.
- AC3: Selected template maps to correct node definition (props → parameters; kind and constraints respected).
  - Test: Unit – transform template → internal NodeTypeDefinition; assert fields.

## 4. Code Generation

- AC1: Emitted TSX for a reference IR matches a stored snapshot (deterministic layout and markers present).
  - Test: Snapshot – generate TSX; compare to fixture; assert `@graph:start`/`@graph:end` fences.
- AC2: Emitted code type-checks successfully.
  - Test: Typecheck – run `tsc` on emitted module in isolation.
- AC3: Simple props inline; complex graphs hoisted to constants.
  - Test: Static check – search emitted code for expected consts or inline props.

## 5. Project File & State

- AC1: Save → Load round-trip yields an equivalent IR.
  - Test: Serialize to JSON, reload, validate deep-equality (ignoring transient metadata).
- AC2: Backwards/forwards compatibility honors `schemaVersion` with clear migration error or path.
  - Test: Load file with older/newer version; assert deterministic behavior (migrate or error).
- AC3: Import rejects files with unknown/unsafe fields.
  - Test: Fuzz invalid fields; expect validation error.

## 6. Realtime Collaboration (Yjs or Convex)

- AC1: Concurrent edits converge to the same IR state across two clients.
  - Test: Dual-client e2e – perform interleaved edits; assert final IR equality.
- AC2: Presence shows active users and selections.
  - Test: e2e – second client joins; assert presence indicators.
- AC3: Authorization gates edits per role.
  - Test: e2e – viewer cannot mutate; editor can.

## 7. API Layer

- AC1: Programmatic operations (create/open/save, add node, connect, generate) succeed and return typed results.
  - Test: Integration – call API methods; assert results and side effects.
- AC2: Errors are structured and stable (code, message, details).
  - Test: Unit – provoke known errors; snapshot error objects.
- AC3: Idempotent operations remain safe (e.g., re-save, re-generate without changes).
  - Test: Integration – call twice; assert no diffs.

## 8. Rendering / Viewport

- AC1: Reference scene renders a visible box with expected dimensions and color.
  - Test: Visual – capture screenshot; compare to baseline within tolerance.
- AC2: Performance under interaction stays responsive.
  - Test: Measure interaction latency for a standard graph; assert < 16ms median.

## 9. End-to-End Flows

- AC1: Quickstart → add Box → connect Material → preview → export code.
  - Test: Playwright script; assert each step’s state and final code snapshot.
- AC2: Save project to file; reload; state preserved (nodes, edges, params).
  - Test: Playwright + file download/upload stub.
- AC3: Use adapter-generated nodes in a scene and render successfully.
  - Test: e2e – insert `OrbitControls` and `Box` from registry; render.

---

## Test Implementation Notes

- E2E/UI: Playwright (already present). Prefer data-testid attributes for stable selectors.
- Schema: Zod or JSON Schema + ajv for IR and registry validation.
- Snapshots: Use file-based fixtures under `tests/fixtures/` for IR and emitted code.
- Typecheck: Use isolated `tsc --noEmit` on generated modules.
- Dual-client tests: Launch two browser contexts pointing at the same project (or Convex/Yjs room).

## CI Gates

- Lint + typecheck
- Unit + integration tests (schema, transforms, codegen snapshot)
- Playwright e2e (core flows)
- Optional: visual regression for viewport scenes
