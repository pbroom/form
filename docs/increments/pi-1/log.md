# Increment Log – pi-1

## Entry 1

Initialized the Increment Method and set up templates plus PI-1 scaffolding to establish a repeatable, TDD-focused process.

- Action: Initialized Increment Method; created IC/IL templates and PI-1 charter/log
- Files/Areas: `docs/process/increment-method.md`, `docs/increments/*`
- Decisions: Use lean TDD loop; cornerstones from AC doc
- Issues/Risks: None
- Learnings: Documentation structure will help LLMs resume context
- Tests/Artifacts: N/A

## Entry 2

Implemented command palette creation and selection flow, adding tests and data-testids for reliable automation.

- Action: Implemented command palette create/select (G1) with tests
- Files/Areas: `tests/command-palette.spec.ts`, `src/components/{CommandPalette.tsx,NodeGraphEditor.tsx,Node.tsx}`
- Decisions: Use `data-testid` on palette and nodes; select new node on creation for fast property edits
- Issues/Risks: Selection state managed locally; revisit when global graph/IR store lands
- Learnings: Minimal palette action list enables quick extensibility
- Tests/Artifacts: All Playwright tests passing (8/8)

## Entry 3

Implemented edge connect with `targetHandle` mapping and Playwright coverage; added handle testids and a dev-only palette connect for e2e stability.

- Action: Implemented edge connect with `targetHandle` mapping (G2); added handles testids and Playwright test
- Files/Areas: `src/components/{NodeGraphEditor.tsx,Node.tsx}`, `tests/edges.spec.ts`
- Decisions: Provide programmatic connect command in non-production for e2e stability; flexible assertion to tolerate manual+programmatic edge
- Issues/Risks: Drag-to-connect can be flaky in headless; revisit once IR store drives edges
- Learnings: Generic handle + first-available parameter mapping works as intended
- Tests/Artifacts: All Playwright tests passing (9/9)

## Entry 4

Updated parameters to drive viewport state with test coverage.

- Action: Implemented params update viewport + state (G3); added viewport testid and Playwright test
- Files/Areas: `src/components/Viewport.tsx`, `tests/params-viewport.spec.ts`
- Decisions: Use label-based selectors for parameter inputs; assert viewport presence and stability
- Issues/Risks: Viewport assertions are coarse-grained; consider snapshotting props once IR layer is in place
- Learnings: Current param plumbing flows through `PropertiesPanel` to `NodeGraphEditor`’s view state as expected
- Tests/Artifacts: All Playwright tests passing (10/10)

## Entry 5

Verified hidden inputs with optional generic input behavior and added visibility tests.

- Action: Implemented hidden inputs + optional generic input (G4) with Playwright coverage
- Files/Areas: `src/components/Node.tsx`, `tests/handles-visibility.spec.ts`
- Decisions: Use `data-testid` on parameter and generic handles; leverage dev palette connect for deterministic setup
- Issues/Risks: Current mapping assumes parameter order; will be refined by IR semantics later
- Learnings: Visibility rules operate correctly under repeated connections
- Tests/Artifacts: All Playwright tests passing (11/11)

## Entry 6

Introduced IR Core scaffolding with schema validation and immutable ops; added unit tests.

- Action: Implemented IR types, Zod schemas, ops, and deterministic serialize (IR1–IR3)
- Files/Areas: `src/lib/ir/{types.ts,schema.ts,ops.ts}`, `tests/unit/ir.spec.ts`, `package.json`
- Decisions: Use Zod for runtime validation; Vitest for lightweight unit tests separate from Playwright
- Issues/Risks: Dependency resolution required `--legacy-peer-deps` for zod install; monitor for CI
- Learnings: Deterministic ordering via id-based sort yields stable snapshots
- Tests/Artifacts: Unit tests passing; e2e suite remains green

## Entry 7

Added Project Save/Load with deterministic serialization and schema validation; unit round-trip test passing.

- Action: Implemented save/load (PF1) with sorting + Zod validation
- Files/Areas: `src/lib/project/{save.ts,load.ts}`, `tests/unit/project-roundtrip.spec.ts`
- Decisions: Serialize with stable ordering (ids, module name, createdAt)
- Issues/Risks: None currently; extend once multi-module workflows expand
- Learnings: Sorting prior to stringify yields stable diffs
- Tests/Artifacts: Unit tests passing; e2e suite still green

## Entry 8

Added minimal React/R3F code emitter with fenced regions and unit test.

- Action: Implemented CG1–CG2 (minimal emitter + basic typecheck via syntax) for React/R3F
- Files/Areas: `src/lib/codegen/react/index.ts`, `tests/unit/codegen-react.spec.ts`
- Decisions: Start with fenced regions and simple Canvas wrapper; expand tree walking next
- Issues/Risks: Type checking is syntactic for now; integrate real `tsc --noEmit` later
- Learnings: Fenced regions pattern composes cleanly with future round-trip
- Tests/Artifacts: Unit test passing; no impact on e2e

## Entry 9

Established adapter template schema and validation for drei subset.

- Action: Implemented adapter schema (AD1) and unit test
- Files/Areas: `src/lib/adapters/schema.ts`, `tests/unit/adapter-schema.spec.ts`
- Decisions: Mirror node definition fields (type, label, params) for ingestion
- Issues/Risks: Mapper (AD2) pending; palette integration to follow
- Learnings: Zod schema provides clear contract for generator ingest
- Tests/Artifacts: Unit test passing

## Entry 10

Added adapter mapper from schema to runtime node definitions and unit test.

- Action: Implemented AD2 mapper and tests
- Files/Areas: `src/lib/adapters/mapper.ts`, `tests/unit/adapter-mapper.spec.ts`
- Decisions: Map fields 1:1; default missing parameter defaults to null
- Issues/Risks: Will integrate with palette loading in a subsequent increment
- Learnings: Mapper matches existing `node-registry` shape, enabling drop-in usage
- Tests/Artifacts: Unit test passing

## Entry 11

Implemented export code flow via palette and modal; verified fenced regions in output.

- Action: Added Export Code (E2E1) – modal rendering emitted TSX
- Files/Areas: `src/components/CodeExportModal.tsx`, `src/components/NodeGraphEditor.tsx`, `tests/export-code.spec.ts`
- Decisions: Use modal with readonly textarea for quick copy + verification
- Issues/Risks: Emitted content is minimal; expand with TreeLayer walking next
- Learnings: Fenced regions visible end-to-end; easy to assert in e2e
- Tests/Artifacts: Export code Playwright test passing

## Entry 12

Completed adapter palette insertion (curated subset) and codegen typecheck test.

- Action: Added curated adapter commands to palette; added tsc-based typecheck for emitter
- Files/Areas: `src/components/NodeGraphEditor.tsx`, `tests/adapter-palette.spec.ts`, `tests/unit/codegen-typecheck.spec.ts`
- Decisions: Use curated subset inline for stability; typecheck via temp tsconfig
- Issues/Risks: Full adapter generation pipeline deferred; revisit in next increment
- Learnings: Temporary tsconfig ensures deterministic tsc behavior in CI
- Tests/Artifacts: All unit + e2e tests passing
