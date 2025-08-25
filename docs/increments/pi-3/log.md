# Increment Log – PI-3

_Code Node: author functions in-editor with typed sockets and metadata-driven UI; properties panel integration and safe runtime preview_

## Entry 1

Re-scoped PI-3 to focus on a first-class Code Node and its integration with the properties panel and codegen.

- Action: Updated PI-3 charter: added efforts for domain model, code panel, type extraction, sandboxed execution, codegen integration, persistence, and validation
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Keep IR as source of truth; sandbox execution; primitives-focused type extraction in PI-3; defer Monaco/editor polish
- Issues/Risks: Parser complexity and sandbox safety; need deterministic codegen and typecheck; UX validation messaging
- Learnings: Code Node provides a forcing function to harden typing, validation, and UX cohesion across panels
- Tests/Artifacts: Charter ACs and TDD hooks specified; templates planned; round-trip tests to be added

## Entry 2

Updated PI-2 docs to reflect completed scope and captured closure details in project log.

- Action: Added PI-2 log entry summarizing stabilization and documentation close; updated project log with real date, corrected spelling, and decisions on adapter merge order; reconciled PI-2 charter Focus and Cornerstones with shipped features
- Files/Areas: `docs/increments/pi-2/log.md`, `docs/increments/pi-2/charter.md`, `docs/project-log.md`
- Decisions: Treat PI-2 as complete with Advanced Parameter & Value Flow efforts as core; maintain strict connection-driven semantics and custom-over-generated registry precedence
- Issues/Risks: Future registry regenerations could regress merge-order—consider a test to lock behavior
- Learnings: Increment closure requires aligning charter, log, and project log for accurate historical record
- Tests/Artifacts: 47 unit tests passing per PI-2 closure entry; documentation updated

## Entry 3

Revised PI-3 scope around Code Node creation, typing, properties integration, and safe runtime/codegen.

- Action: Appended Code Node-focused efforts, ACs, TDD hooks, and scope fence to charter
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Sandbox execution; primitives-first type extraction; keep IR as source of truth; minimal editor this increment
- Issues/Risks: Parser coverage and performance; ensuring deterministic codegen and typecheck
- Learnings: Code Node aligns UX of nodes and properties, forcing consistent metadata-driven rendering
- Tests/Artifacts: To add: parser unit tests, sandbox timeout tests, project round-trip for Code Node, TSX snapshot

## Entry 4

Separated Code View from properties panel and positioned it as a standalone, full-height resizable panel with editor QoL.

- Action: Updated PI-3 charter to reflect a standalone `CodeViewPanel` to the left of properties; specify CodeMirror syntax highlighting and QoL features
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Use CodeMirror for PI-3; keep code editing outside properties during development; maintain metadata editing in code view
- Issues/Risks: Additional layout complexity; dependency footprint; need to preserve performance with large code
- Learnings: Decoupling code authoring from parameter UI clarifies responsibilities and accelerates iteration
- Tests/Artifacts: To add e2e for layout and persistence of panel size; unit tests for debounced validation

## Entry 5

Deprioritized persistence/templates; added click→click connection UX with searchable parameter chooser via Shadcn Command.

- Action: Updated charter ACs and added new effort for click→click connect with compatible-parameter search
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Keep drag-to-connect; add pending-connection state for click flow; filter by type compatibility; keyboard-first navigation
- Issues/Risks: State machine complexity; ensuring no interference with existing drag behaviors
- Learnings: Click-first workflows reduce cognitive load and improve accessibility
- Tests/Artifacts: To create Playwright tests for click→click flow; unit tests for type filtering and pending state transitions

## Entry 6

Added Code node insertion via palette and wired CodeMirror with debounced validation in a standalone Code View panel.

- Action: Implemented `Insert Code Node` command; integrated CodeMirror in `CodeViewPanel` with validation message; added debounced validation in editor container
- Files/Areas: `src/components/NodeGraphEditor.tsx`, `src/components/CodeViewPanel.tsx`, `src/lib/validation/code-node.ts`
- Decisions: Keep validation minimal (static checks) for PI-3; surface errors inline below editor
- Issues/Risks: Parser/type extraction still pending; future changes may alter validation rules
- Learnings: Separate code authoring and parameter UI simplifies mental model and testing
- Tests/Artifacts: Unit tests for validation added; e2e for panel presence passing

## Entry 7

Adjusted Code Node plan to keep a persistent source (out) port and derive input ports dynamically from code. Removed provisional static input.

- Action: Reverted static 'a' parameter from Code Node; updated value flow to not assume inputs; clarified charter on dynamic input sockets and persistent out port
- Files/Areas: `src/lib/node-registry.ts`, `src/components/NodeGraphEditor.tsx`, `docs/increments/pi-3/charter.md`
- Decisions: Code Node is the canonical node type; library nodes will be preconfigured Code Node instances
- Issues/Risks: Requires robust type extraction to generate handles dynamically; UI updates must be atomic
- Learnings: Keeping a stable out port simplifies wiring while inputs evolve with code
- Tests/Artifacts: All unit tests remain green

## Entry 8

Started type extraction with a lightweight function signature parser and tests; prepared to wire dynamic ports later.

- Action: Added `extractFunctionParams` with unit tests; marked Type Extraction effort In progress
- Files/Areas: `src/lib/code/code-parse.ts`, `tests/unit/code-parse.spec.ts`, `docs/increments/pi-3/charter.md`
- Decisions: Limit PI-3 parser to primitives (number/string/boolean); more types in later increments
- Issues/Risks: Parser is regex-based; will be replaced/extended with TS compiler API later
- Learnings: Keeping scope tight enables fast iteration without blocking on full TS introspection
- Tests/Artifacts: 3 parser tests passing; overall unit suite 62/62 passing

## Entry 9

Implemented ghost wire for click→click connection UX and Esc-to-cancel pending connections.

- Action: Added pending connection cursor tracking and ghost wire SVG overlay; wired Esc key to cancel pending state; captured source handle screen position on connect start; enabled built-in React Flow connectionLine with dashed/low-opacity styling for drag interactions
- Files/Areas: `src/components/NodeGraphEditor.tsx`, `docs/increments/pi-3/charter.md`
- Decisions: Use absolute-positioned SVG with dashed low-opacity path; compute coordinates in screen space against container rect; keep performance simple for now
- Issues/Risks: Visual alignment may vary with zoom; potential follow-up to map RF canvas coords precisely; ensure overlay layering doesn't block interactions
- Learnings: Simple screen-space overlay suffices and preserves accessibility for click→click
- Tests/Artifacts: Unit tests remain green (62/62); Playwright files fail under unit runner as expected (not executed in this run)

## Entry 10

Enabled true click→click workflow by persisting pending state after mouseup and clearing only on connect or cancel.

- Action: Kept `connectionMode` active on `onConnectionEnd` (mouseup) and clear it in `onConnect` or Esc; aligned bezier curvature for ghost/drag/edges
- Files/Areas: `src/components/NodeGraphEditor.tsx`
- Decisions: Preserve pending state between clicks; rely on onNode hover/click to surface chooser
- Issues/Risks: Edge-cases if user quickly taps multiple sources—follow-up: explicit cancel on outside click; ensure overlay focus
- Learnings: Separating drag end from pending state improves accessibility
- Tests/Artifacts: Unit tests still green (62/62)

## Entry 11

Made the click→click overlay reliably open on target handle interactions.

- Action: Added DOM `data-node-id` to nodes; installed global mousedown/click capture on target handles to set `targetNodeId/targetPosition` when pending; guarded against overwriting pending source in `onConnectionStart`
- Files/Areas: `src/components/Node.tsx`, `src/components/NodeGraphEditor.tsx`
- Decisions: Use capture-phase events to avoid RF swallowing; anchor overlay to handle center for clarity
- Issues/Risks: Capture listeners must be carefully removed; potential interference with future drag behaviors
- Learnings: Mixing RF APIs with minimal DOM capture provides precise click→click control without disrupting drag UX
- Tests/Artifacts: Unit tests unaffected (62/62); e2e to be run in Playwright context separately

## Entry 12

Added Playwright e2e spec to lock click→click ghost preview and Esc-cancel behavior.

- Action: Created `tests/e2e/click-connect.spec.ts` with two tests: drag preview path visible during drag; ghost preview visible after click and removed on Esc
- Files/Areas: `tests/e2e/click-connect.spec.ts`, `docs/increments/pi-3/charter.md`
- Decisions: Use data-testid hooks `[data-testid="ghost-wire-overlay"]` and path `[stroke-dasharray="6 6"]` as assertions
- Issues/Risks: E2E requires Playwright runner, not vitest; CI wiring pending
- Learnings: Tests clarify the intended UX and prevent regressions
- Tests/Artifacts: New e2e spec added; unit suite still green

## Entry 13

Refactored connection UX state to Zustand and extracted a `GhostWireOverlay` component for clarity.

- Action: Introduced `useConnectionStore` with minimal actions (start/cancel/move/hover/end) and replaced ad-hoc refs; added `GhostWireOverlay` presentational component; simplified handlers in `NodeGraphEditor.tsx`
- Files/Areas: `src/store/connection.ts`, `src/components/GhostWireOverlay.tsx`, `src/components/NodeGraphEditor.tsx`
- Decisions: Centralize connection state; rely on monotonic token to invalidate stale events on Esc; keep React Flow drag preview
- Issues/Risks: Additional e2e stabilization needed for ghost visibility and Esc cancellation
- Learnings: Externalized state reduced cognitive load and removed intricate ref/guard logic
- Tests/Artifacts: Updated e2e added; follow-up to assert Esc prevents connection reliably

## Entry 14

Introduced a shared `initialNodes` module and wired it into the V2 editor.

- Action: Created `src/components/initial-nodes.ts` mirroring initial nodes from `NodeGraphEditor.tsx`; imported and used in `NodeGraphEditorV2.tsx`
- Files/Areas: `src/components/initial-nodes.ts`, `src/components/NodeGraphEditorV2.tsx`
- Decisions: Keep initial edges inline in V2 for now; only nodes are shared to reduce coupling
- Issues/Risks: None observed
- Learnings: Sharing initial graph state reduces duplication and keeps demos consistent across editors
- Tests/Artifacts: Unit suite still green (62/62)

## Entry 15

Fixed linter error in custom edge component by replacing `any` with `Position` from `@xyflow/react`.

- Action: Updated `src/components/Edge.tsx` prop types and provided defaults when calling `getBezierPath`
- Files/Areas: `src/components/Edge.tsx`
- Decisions: Use `Position` enum to avoid `any` and ensure consistency with React Flow
- Issues/Risks: None
- Learnings: Typing custom edges with `Position` prevents `any` leakage and silences lint rule
- Tests/Artifacts: Lint clean; unit tests passing (62/62)

## Entry 16

Resolved TS mismatch for React Flow `selectionMode` by using the enum instead of a string literal.

- Action: Imported `SelectionMode` from `@xyflow/react` and set `selectionMode={SelectionMode.Partial}` in V2 editor
- Files/Areas: `src/components/NodeGraphEditorV2.tsx`
- Decisions: Prefer enum values over string literals to align with library typings
- Issues/Risks: None
- Learnings: API docs may show strings while types enforce enums; using enums satisfies TS while preserving runtime behavior
- Tests/Artifacts: Lint clean; unit tests passing (62/62)

## Entry 17

Resolved Motion + React Flow `Handle` typing conflict by wrapping `Handle` inside a `motion.div` instead of using `motion.create(Handle)`.

- Action: Refactored `src/components/Handle.tsx` to avoid overload mismatch; kept spring transition on wrapper
- Files/Areas: `src/components/Handle.tsx`
- Decisions: Prefer wrapper animation to maintain compatibility with `@xyflow/react` types
- Issues/Risks: None
- Learnings: `motion.create` can misalign event typings with third-party components; wrapper is safer
- Tests/Artifacts: Lint clean; unit tests passing (62/62)
