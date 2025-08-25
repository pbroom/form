# Increment Charter – PI-3

## Context Capsule

- Aim: Ship a first-class "Code Node" that users can create, author in-editor, and wire into the graph with typed sockets and metadata-driven UI. This establishes the procedural bridge between authored code and nodes + properties panel.
- Constraints/Guardrails: Deterministic emission and type safety; sandboxed execution with timeouts; no third-party imports or side effects; IR remains source of truth; follow existing adapter/schema patterns; use a lightweight embedded editor (CodeMirror) for syntax highlighting and QoL, defer Monaco-level advanced type tooling.

## Focus (What we ship)

- Click→click connection UX with ghost wire and Esc-cancel; foundational Code View panel scaffolding; initial parser utilities. Integration with existing nodes maintained; no full Code Node shipping in this increment.

## Prioritized Acceptance Criteria (Cornerstones)

- [x] Click→click connection UX: clicking a source handle, releasing, then clicking a target node's input handle shows a chooser and connects
- [x] Ghost wire overlay follows cursor during pending state; Esc cancels and removes preview
- [x] Parser utilities exist to extract function params for primitives (scaffolded/tests added)
- [x] Code View panel component exists as a standalone, resizable area with placeholder validation hook

## Efforts

- Effort: Click→Click Connection UX

  - Tasks:
    - [x] Persist pending connection state after mouseup
    - [x] Render ghost wire overlay and cancel on Esc
    - [x] Open searchable parameter chooser on target handle; filter by compatibility
  - ACs:
    - [x] Covered by acceptance criteria above
  - Tests (TDD): Playwright specs authored (run under PW runner); unit tests green
  - Steps: Pending state → overlay → chooser → integration polish
  - Estimate: M
  - Status: Done

- Effort: Code View Panel (Standalone) scaffolding

  - Tasks:
    - [x] Introduce a standalone `CodeViewPanel` component and mount it
    - [x] Position/resizable scaffolding adjacent to properties panel
    - [x] Wire a placeholder validation hook and test id hooks
  - ACs:
    - [x] Scaffolding present; advanced editor QoL deferred
  - Tests (TDD): UI presence test; basic validation hook unit
  - Steps: Component scaffolding → layout → hooks
  - Estimate: S
  - Status: Done
  - Notes:
    - Added shared `initialNodes` module for editor initialization reuse in V2 editor

- Effort: Parser utilities (function params) — scaffold

  - Tasks:
    - [x] Add lightweight parser to extract primitive params with tests
  - ACs:
    - [x] Parser tests pass; integration into sockets deferred
  - Tests (TDD): Parser unit tests
  - Steps: Parser → normalization (deferred)
  - Estimate: S
  - Status: Done

- Effort: Safe Runtime Preview (Sandboxed Execution)

  - Tasks:
    - [ ] Evaluate function in a sandbox with time budget and exception capture
    - [ ] Compute output for current input values; expose as source socket value
    - [ ] Provide clear error states and disable output when execution fails
  - ACs:
    - [ ] Infinite loops/timeouts do not freeze UI; errors are captured and shown
    - [ ] Output updates deterministically on input change
  - Tests (TDD): Timeout tests; error propagation unit; deterministic value update tests
  - Steps: Sandbox wrapper → schedule/debounce → error UI → output propagation
  - Estimate: M
  - Status: Deferred

- Effort: Codegen Integration for Code Node

  - Tasks:
    - [ ] Extend React emitter to include user function and wire outputs/props
    - [ ] Generate imports/types only when referenced; fenced regions remain deterministic
    - [ ] Typecheck emitted module including Code Node
  - ACs:
    - [ ] Emitted TSX compiles under `tsc --noEmit`
    - [ ] Snapshot stable given identical Code Node source
  - Tests (TDD): TSX snapshot tests; `tsc` typecheck step; integration scene containing Code Node
  - Steps: Emitter extension → import management → typecheck integration → snapshots
  - Estimate: M
  - Status: Deferred

- Effort: Connection UX – Click→Click with Searchable Parameter Chooser

  - Tasks:
    - [ ] Support click-and-release on a source handle to set a pending connection
    - [ ] Render a low-opacity dashed ghost wire from source handle to cursor while pending
    - [ ] Clicking a target node's input handle opens a Shadcn Command-based searchable list of compatible parameters
    - [ ] Filter parameters by type compatibility; show labels, groups; keyboard navigation (search, arrows, enter)
    - [ ] Selecting a parameter creates edge with `targetHandle` set; cancel clears pending state (Esc/click-outside)
    - [ ] Preserve existing drag-to-connect behavior; generic target handle supported
    - [ ] Add `data-testid` hooks for E2E
  - ACs:
    - [ ] No drag required: click source, release; click target → chooser appears and connects on selection
    - [ ] A ghost wire follows the cursor between clicks at ~40–50% opacity and dashed style
    - [ ] Pressing Esc at any time during pending state cancels it and removes the ghost wire
    - [ ] Only compatible parameters are shown; search filters list; keyboard and mouse supported
    - [ ] Edge is created deterministically with correct `targetHandle`; cancel restores neutral state
  - Tests (TDD): Playwright flow tests for click→click connect; unit tests for type filter and pending-connection state machine
    - [ ] e2e: drag preview path visible during drag; ghost preview visible after click; Esc cancels and hides preview
  - Steps: Pending state → handle event wiring → Shadcn Command chooser → type filter → edge creation → UX polish
  - Estimate: M
  - Status: Done

- Effort: Interoperability & Validation

  - Tasks:
    - [ ] Enforce type-compatible connections with existing nodes
    - [ ] Add graph-level validation messages for Code Node socket types
  - ACs:
    - [ ] Cannot connect incompatible types; helpful error shown
  - Tests (TDD): Connection validation unit/e2e; properties panel control mapping tests
  - Steps: Validation rules → connection guardrails → e2e wiring scenarios
  - Estimate: M
  - Status: Done

## Scope Fence (Out of Scope)

- Project persistence of Code Node and starter templates (deferred to next increment)
- Multi-file modules, external package imports, async I/O, and side effects
- Arbitrary global state mutation or DOM/Three access from user code
- Advanced generics/conditional types; complex inference beyond primitives/tuples/simple structs
- Full Monaco integration, code formatting, or lint rulesets (keep minimal editor for PI-3)
- Node-to-code reverse import pipeline (future increment)

## Exit Criteria

- ✅ Click→click connection UX with searchable compatible parameter chooser is implemented and tested (e2e added; runs under PW)
- ✅ Ghost wire overlay and Esc-cancel behavior implemented
- ✅ Code View scaffolding exists; parser utilities present with unit tests

Status: Done
